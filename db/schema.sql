-- =============================================================
--  giongnoiso.com - Luoc do CSDL MySQL 8
--  Chay bang: npm run migrate
-- =============================================================

SET NAMES utf8mb4;

-- -------------------------------------------------------------
-- Tai khoan: 2 cap quyen user / admin
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(64)  NOT NULL,
  email         VARCHAR(190) NULL,
  full_name     VARCHAR(190) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  status        ENUM('active','disabled') NOT NULL DEFAULT 'active',
  failed_logins INT UNSIGNED NOT NULL DEFAULT 0,
  locked_until  DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Phien dang nhap. Chi luu SHA-256 cua token, khong luu token goc.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  CHAR(64)        NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  expires_at  DATETIME        NOT NULL,
  ip          VARCHAR(45)     NULL,
  user_agent  VARCHAR(255)    NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token_hash),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Kho A: tu dien phuong ngu
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lexicon (
  id                  VARCHAR(64)  NOT NULL,
  word                VARCHAR(190) NOT NULL,
  region              VARCHAR(64)  NULL,
  provinces           JSON         NULL,
  meaning             TEXT         NULL,
  example             TEXT         NULL,
  example_translation TEXT         NULL,
  cultural_insight    TEXT         NULL,
  ipa                 VARCHAR(190) NULL,  -- phien am quoc te, cot loi cho nghien cuu ngu am
  created_by          BIGINT UNSIGNED NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lexicon_word (word),
  KEY idx_lexicon_region (region),
  FULLTEXT KEY ft_lexicon (word, meaning, example)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Kho B: ban ghi am. Thay cho audio_database.json +
-- pending_contributions.json + deleted_audios.json
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audio_records (
  id                  VARCHAR(64)  NOT NULL,
  title               VARCHAR(255) NOT NULL,
  speaker             VARCHAR(190) NULL,
  is_anonymous        TINYINT(1)   NOT NULL DEFAULT 0,
  gender              VARCHAR(32)  NULL,
  province            VARCHAR(64)  NULL,
  dialect_group       VARCHAR(64)  NULL,
  age_group           VARCHAR(32)  NULL,
  topic               VARCHAR(128) NULL,
  consent             TINYINT(1)   NOT NULL DEFAULT 0,
  audio_url           VARCHAR(255) NULL,
  youtube_url         VARCHAR(255) NULL,
  start_time          INT          NOT NULL DEFAULT 0,
  end_time            INT          NOT NULL DEFAULT 0,
  transcript_dialect  TEXT         NULL,
  transcript_standard TEXT         NULL,
  subtitle            TEXT         NULL,
  ipa                 TEXT         NULL,
  -- Hai cot duoi day la di san: gia tri cu duoc gan bang tay chu khong do
  -- duoc. Migration se xoa trang chung. Khong hien thi o bat ky dau.
  purity_percentage   VARCHAR(16)  NULL,
  confidence          INT          NOT NULL DEFAULT 0,
  -- Do tin cay THAT, tinh tu avg_logprob cua Whisper. NULL = chua do.
  stt_confidence      DECIMAL(5,2) NULL,
  verified            TINYINT(1)   NOT NULL DEFAULT 0,
  tags                JSON         NULL,

  -- --- Sieu du lieu hoc thuat: de ban ghi trich dan va tai su dung duoc ---
  duration_seconds    DECIMAL(8,2) NULL,
  sample_rate         INT          NULL,
  channels            TINYINT      NULL,
  recorded_at         DATE         NULL,   -- ngay GHI AM, khac ngay tai len
  locality            VARCHAR(190) NULL,   -- xa/huyen: phuong ngu khac nhau trong cung tinh
  collector           VARCHAR(190) NULL,   -- nguoi thu thap
  device              VARCHAR(190) NULL,   -- thiet bi ghi
  license             VARCHAR(32)  NOT NULL DEFAULT 'CC-BY-NC-4.0',
  citation_slug       VARCHAR(64)  NULL,   -- permalink on dinh de trich dan
  dedupe_key          VARCHAR(190) NULL,   -- phat hien ban ghi trung
  -- pending: cho duyet | approved: hien tren ban do | rejected/deleted: an
  status              ENUM('pending','approved','rejected','deleted') NOT NULL DEFAULT 'pending',
  is_reported         TINYINT(1)   NOT NULL DEFAULT 0,
  report_reason       VARCHAR(255) NULL,
  -- Nguoi dong gop co dong y cho phep nhan ban giong hay khong.
  -- MAC DINH 0: khong co su dong y ro rang thi khong duoc clone.
  allow_voice_clone   TINYINT(1)   NOT NULL DEFAULT 0,
  clone_consent_at    DATETIME     NULL,
  submitted_by        BIGINT UNSIGNED NULL,
  reviewed_by         BIGINT UNSIGNED NULL,
  reviewed_at         DATETIME     NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_audio_citation (citation_slug),
  KEY idx_audio_status (status),
  KEY idx_audio_province (province),
  KEY idx_audio_reported (is_reported),
  KEY idx_audio_submitter (submitted_by),
  KEY idx_audio_dedupe (dedupe_key),
  KEY idx_audio_browse (status, province, topic),
  FULLTEXT KEY ft_audio (title, transcript_dialect, transcript_standard, speaker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Giong da nhan ban tu kho dong gop.
-- Moi ban ghi tro nguoc ve audio_records de luon truy duoc nguon goc
-- va ai la nguoi tao.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS voice_clones (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(190) NOT NULL,
  source_audio  VARCHAR(64)  NOT NULL,
  created_by    BIGINT UNSIGNED NULL,
  status        ENUM('active','revoked') NOT NULL DEFAULT 'active',
  revoked_by    BIGINT UNSIGNED NULL,
  revoked_at    DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_voice_clone_name (name),
  KEY idx_voice_clone_source (source_audio),
  CONSTRAINT fk_voice_clone_source FOREIGN KEY (source_audio)
    REFERENCES audio_records(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Nhat ky moi lan tong hop giong. Bat buoc phai co: day la bang
-- chung truy nguoc khi nguoi dong gop hoi "giong toi bi dung vao dau".
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tts_log (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NULL,
  username     VARCHAR(64)  NULL,
  mode         ENUM('preset','clone') NOT NULL,
  voice        VARCHAR(190) NULL,
  source_audio VARCHAR(64)  NULL,
  text_excerpt VARCHAR(255) NULL,
  text_length  INT UNSIGNED NOT NULL DEFAULT 0,
  output_file  VARCHAR(128) NULL,
  seconds      DECIMAL(6,2) NULL,
  ip           VARCHAR(45)  NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tts_log_source (source_audio),
  KEY idx_tts_log_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Bao cao vi pham. Thay cho reported_audios.json
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audio_reports (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  audio_id     VARCHAR(64)  NOT NULL,
  reason       VARCHAR(255) NULL,
  note         TEXT         NULL,
  reporter_id  BIGINT UNSIGNED NULL,
  reporter_ip  VARCHAR(45)  NULL,
  status       ENUM('pending_review','dismissed','resolved') NOT NULL DEFAULT 'pending_review',
  handled_by   BIGINT UNSIGNED NULL,
  handled_at   DATETIME     NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reports_audio (audio_id),
  KEY idx_reports_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Kho tra loi nhanh cho chatbot (RAG offline)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chatbot_rag (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  keywords   JSON NOT NULL,
  response   MEDIUMTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Nhat ky hanh dong quan tri (ai xoa/duyet cai gi, luc nao)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NULL,
  username   VARCHAR(64)  NULL,
  action     VARCHAR(64)  NOT NULL,
  target_id  VARCHAR(64)  NULL,
  detail     TEXT         NULL,
  ip         VARCHAR(45)  NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_action (action),
  KEY idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Cau hinh sua duoc tu khu quan tri. Gia tri bi mat (khoa API)
-- duoc ma hoa AES-256-GCM bang khoa dan xuat tu SESSION_SECRET,
-- nen ban dump CSDL mot minh khong doc duoc.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
  name       VARCHAR(64)  NOT NULL,
  value      TEXT         NULL,
  is_secret  TINYINT(1)   NOT NULL DEFAULT 0,
  updated_by BIGINT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Bang diem tro choi phuong ngu (Minigames Leaderboard)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS minigame_scores (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NULL,
  player_name   VARCHAR(190)    NOT NULL,
  game_id       TINYINT UNSIGNED NOT NULL,  -- 1: Trac nghiem am thanh, 2: Ghep cap, 3: Do chu
  score         INT UNSIGNED    NOT NULL DEFAULT 0,
  streak        INT UNSIGNED    NOT NULL DEFAULT 0,
  time_seconds  DECIMAL(6,2)    NULL,
  ip            VARCHAR(45)     NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_game_score (game_id, score DESC),
  KEY idx_game_created (game_id, created_at),
  KEY idx_user_scores (user_id),
  CONSTRAINT fk_minigame_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

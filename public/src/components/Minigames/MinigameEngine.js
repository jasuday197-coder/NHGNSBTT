/* ==========================================================================
   MINIGAMES SYSTEM - ENGINE & LOGIC (src/components/Minigames/MinigameEngine.js)
   Core game manager for Ngân hàng Giọng nói Số Bắc Trung Bộ
   ========================================================================== */

class MinigameEngine {
  constructor() {
    // Player & Highscore storage
    this.playerName = '';
    this.userId = null;
    this.highScores = JSON.parse(localStorage.getItem('vb_highscores') || '{"g1":0,"g2":0,"g3":0}');
    this.leaderboard = JSON.parse(localStorage.getItem('vb_leaderboard') || '[]');

    // Leaderboard Tabs State
    this.selectedLeaderboardGame = 1;
    this.selectedLeaderboardTime = 'all';

    // Active Game State
    this.activeGameId = null;
    this.pendingGameId = null;
    this.score = 0;
    this.wrongCount = 0;
    this.correctCount = 0;
    this.streak = 0;
    this.roundStartTime = 0;
    
    // Game 1 State
    this.g1Questions = [];
    this.g1CurrentIdx = 0;
    this.g1TimerInterval = null;
    this.g1TimeLeft = 15;
    this.g1Answered = false;

    // Game 2 State
    this.g2Pairs = [];
    this.g2SelectedLeft = null;
    this.g2SelectedRight = null;
    this.g2MatchedCount = 0;

    // Game 3 State
    this.g3Item = null;
    this.g3TargetLetters = [];
    this.g3UserLetters = [];
    this.g3ActiveSlotIdx = 0;
    this.keyListenerBound = false;

    // Confetti animation reference
    this.confettiAnimId = null;

    // Bind keyboard listener once
    this.handleKeyDown = this.handleKeyDown.bind(this);

    // Listen to global auth changes to update player status automatically
    document.addEventListener('gns:auth-changed', () => {
      this.updateHubPlayerDisplay();
    });
  }

  /* ==========================================================================
     INIT & MOUNTING
     ========================================================================== */
  init() {
    this.renderHub();
    this.setupGlobalEvents();
  }

  setupGlobalEvents() {
    if (!this.keyListenerBound) {
      window.addEventListener('keydown', this.handleKeyDown);
      this.keyListenerBound = true;
    }
  }

  // Safe DOM helper
  static safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }

  /* ==========================================================================
     HUB & NAVIGATION MANAGEMENT
     ========================================================================== */
  renderHub() {
    this.stopAllTimers();
    MinigameEngine.safeSetText('mg-hs-g1', this.highScores.g1 || 0);
    MinigameEngine.safeSetText('mg-hs-g2', this.highScores.g2 || 0);
    MinigameEngine.safeSetText('mg-hs-g3', this.highScores.g3 || 0);

    this.updateHubPlayerDisplay();

    const hubEl = document.getElementById('mg-hub-view');
    const arenaEl = document.getElementById('mg-arena-view');
    if (hubEl) hubEl.style.display = 'block';
    if (arenaEl) arenaEl.classList.remove('active');
  }

  initHub() {
    this.renderHub();
  }

  updateHubPlayerDisplay() {
    const container = document.getElementById('mg-hub-player-info');
    if (!container) return;

    const user = (window.GNS_AUTH && typeof window.GNS_AUTH.isLoggedIn === 'function' && window.GNS_AUTH.isLoggedIn())
      ? window.GNS_AUTH.user
      : null;

    if (user) {
      const displayName = user.fullName || user.username || 'Thành viên';
      this.playerName = displayName;
      this.userId = user.id;
      container.innerHTML = `
        <div class="mg-player-badge">
          <span><i class="fas fa-user-astronaut"></i> Người chơi: <strong>${this.escapeHtml(displayName)}</strong> <small style="color: #64748b; font-weight: 500;">(@${this.escapeHtml(user.username)})</small></span>
        </div>
      `;
    } else {
      this.playerName = '';
      this.userId = null;
      container.innerHTML = `
        <button class="btn-mg-edit-name highlight" onclick="if(window.GNS_AUTH && window.GNS_AUTH.openAuthModal) window.GNS_AUTH.openAuthModal('login')">
          <i class="fas fa-right-to-bracket"></i> Đăng nhập để chơi & tích điểm
        </button>
      `;
    }
  }

  stopGameAudio() {
    this.stopAllTimers();
  }

  stopAllTimers() {
    if (this.g1TimerInterval) {
      clearInterval(this.g1TimerInterval);
      this.g1TimerInterval = null;
    }
  }

  /* ==========================================================================
     START GAME / AUTH GUARD
     ========================================================================== */
  promptStartGame(gameId) {
    const isLoggedIn = Boolean(window.GNS_AUTH && typeof window.GNS_AUTH.isLoggedIn === 'function' && window.GNS_AUTH.isLoggedIn());

    const user = isLoggedIn ? window.GNS_AUTH.user : null;
    this.playerName = user ? (user.fullName || user.username) : 'Khách trải nghiệm';
    this.userId = user ? user.id : null;
    this.isGuest = !isLoggedIn;

    if (gameId) {
      this.launchGame(gameId);
    }
  }

  closeStartModal() {
    const modalBackdrop = document.getElementById('mg-start-modal');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  submitStartModal() {
    this.closeStartModal();
  }

  /* ==========================================================================
     GAME LAUNCH ROUTER
     ========================================================================== */
  launchGame(gameId) {
    this.activeGameId = gameId;
    this.score = 0;
    this.wrongCount = 0;
    this.correctCount = 0;
    this.streak = 0;
    this.roundStartTime = Date.now();

    const hubEl = document.getElementById('mg-hub-view');
    const arenaEl = document.getElementById('mg-arena-view');

    if (hubEl) hubEl.style.display = 'none';
    if (arenaEl) arenaEl.classList.add('active');

    this.updateArenaStats();

    if (gameId === 1) {
      this.initGame1();
    } else if (gameId === 2) {
      this.initGame2();
    } else if (gameId === 3) {
      this.initGame3();
    }
  }

  updateArenaStats() {
    MinigameEngine.safeSetText('mg-score-val', this.score);
    MinigameEngine.safeSetText('mg-wrong-val', this.wrongCount);
  }

  /* ==========================================================================
     GAME 1: GIẢI NGHĨA PHƯƠNG NGỮ (TRẮC NGHIỆM + TIMER + STREAK)
     ========================================================================== */
  initGame1() {
    MinigameEngine.safeSetText('mg-arena-title', 'Game 1: Giải nghĩa phương ngữ');
    
    // Get database from DIALECT_LEXICON
    const lexicon = (typeof DIALECT_LEXICON !== 'undefined') ? DIALECT_LEXICON : [];
    if (!lexicon || lexicon.length < 4) {
      alert('Dữ liệu từ điển chưa sẵn sàng!');
      this.renderHub();
      return;
    }

    // Shuffle and take 10 random questions
    const shuffled = [...lexicon].sort(() => 0.5 - Math.random());
    this.g1Questions = shuffled.slice(0, 10);
    this.g1CurrentIdx = 0;

    this.renderG1Question();
  }

  renderG1Question() {
    this.stopAllTimers();
    this.g1Answered = false;

    if (this.g1CurrentIdx >= this.g1Questions.length) {
      this.finishGame();
      return;
    }

    const currentItem = this.g1Questions[this.g1CurrentIdx];
    const lexicon = (typeof DIALECT_LEXICON !== 'undefined') ? DIALECT_LEXICON : [];

    // Prepare 4 choices (1 correct, 3 wrong)
    const wrongPool = lexicon.filter(item => item.word !== currentItem.word);
    const shuffledWrong = [...wrongPool].sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [currentItem, ...shuffledWrong].sort(() => 0.5 - Math.random());

    const arenaBody = document.getElementById('mg-arena-body');
    if (!arenaBody) return;

    // Render G1 Layout
    arenaBody.innerHTML = `
      <div class="mg-g1-container">
        <!-- Timer Track -->
        <div class="mg-timer-track">
          <div class="mg-timer-fill" id="mg-timer-fill"></div>
        </div>

        <!-- Streak Combo Banner -->
        <div class="mg-streak-banner ${this.streak >= 3 ? 'active' : ''}" id="mg-streak-banner">
          <i class="fas fa-fire"></i> STREAK COMBO x2! (${this.streak} CÂU ĐÚNG LIÊN TIẾP)
        </div>

        <!-- Question Card -->
        <div class="mg-question-card">
          <span class="mg-word-tag"><i class="fas fa-map-marker-alt"></i> Câu ${this.g1CurrentIdx + 1}/10 — ${currentItem.region || 'Bắc Trung Bộ'}</span>
          <div class="mg-target-word">"${this.escapeHtml(currentItem.word)}"</div>
          <div style="font-size: 14px; color: #64748b;">Chọn nghĩa tiếng phổ thông chính xác của từ trên:</div>
        </div>

        <!-- 4 Options Grid -->
        <div class="mg-options-grid" id="mg-options-grid">
          ${options.map((opt, idx) => `
            <button class="btn-mg-choice" data-idx="${idx}" onclick="window.voiceBankGames.handleG1Choice(${opt.word === currentItem.word}, this, '${this.escapeHtml(opt.meaning)}')">
              <span style="font-weight: 800; color: #0284c7; width: 24px;">${String.fromCharCode(65 + idx)}.</span>
              <span>${this.escapeHtml(opt.meaning)}</span>
            </button>
          `).join('')}
        </div>

        <!-- Explanation Box -->
        <div class="mg-explanation-box" id="mg-explanation-box">
          <div class="mg-explanation-header">
            <i class="fas fa-lightbulb"></i> Giải thích ngữ cảnh thực tế
          </div>
          <div class="mg-explanation-body">
            <div><strong>Nghĩa chuẩn:</strong> ${this.escapeHtml(currentItem.meaning)}</div>
            ${currentItem.example ? `<div class="mg-explanation-example">"${this.escapeHtml(currentItem.example)}"</div>` : ''}
            ${currentItem.culturalInsight ? `<div style="font-size: 12px; color: #64748b; margin-top: 6px;">💡 ${this.escapeHtml(currentItem.culturalInsight)}</div>` : ''}
          </div>
          <button class="btn-mg-next" onclick="window.voiceBankGames.nextG1Question()">
            ${this.g1CurrentIdx < 9 ? 'Câu tiếp theo <i class="fas fa-arrow-right"></i>' : 'Xem kết quả <i class="fas fa-trophy"></i>'}
          </button>
        </div>
      </div>
    `;

    // Start 15-second timer
    this.g1TimeLeft = 15;
    const timerFill = document.getElementById('mg-timer-fill');

    this.g1TimerInterval = setInterval(() => {
      this.g1TimeLeft -= 0.1;
      if (timerFill) {
        const pct = Math.max(0, (this.g1TimeLeft / 15) * 100);
        timerFill.style.width = `${pct}%`;
        if (this.g1TimeLeft <= 5) {
          timerFill.classList.add('warning');
        }
      }

      if (this.g1TimeLeft <= 0) {
        this.stopAllTimers();
        this.handleG1Timeout();
      }
    }, 100);
  }

  handleG1Choice(isCorrect, btnEl, chosenMeaning) {
    if (this.g1Answered) return;
    this.g1Answered = true;
    this.stopAllTimers();

    // Disable choice buttons
    const buttons = document.querySelectorAll('.btn-mg-choice');
    buttons.forEach(btn => btn.disabled = true);

    const currentItem = this.g1Questions[this.g1CurrentIdx];

    if (isCorrect) {
      if (btnEl) btnEl.classList.add('correct');
      this.correctCount++;
      this.streak++;
      
      // Calculate score with streak bonus
      const baseScore = 100;
      const timeBonus = Math.floor(this.g1TimeLeft * 4); // Up to 60 bonus pts
      const multiplier = this.streak >= 3 ? 2 : 1;
      const earned = (baseScore + timeBonus) * multiplier;
      this.score += earned;

    } else {
      if (btnEl) btnEl.classList.add('wrong');
      this.wrongCount++;
      this.streak = 0; // Reset streak

      // Highlight the correct answer button
      buttons.forEach(btn => {
        if (btn.innerText.includes(currentItem.meaning)) {
          btn.classList.add('correct');
        }
      });
    }

    this.updateArenaStats();

    // Reveal explanation box
    const expBox = document.getElementById('mg-explanation-box');
    if (expBox) expBox.classList.add('active');
  }

  handleG1Timeout() {
    if (this.g1Answered) return;
    this.g1Answered = true;

    this.wrongCount++;
    this.streak = 0;
    this.updateArenaStats();

    const buttons = document.querySelectorAll('.btn-mg-choice');
    const currentItem = this.g1Questions[this.g1CurrentIdx];
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.innerText.includes(currentItem.meaning)) {
        btn.classList.add('correct');
      }
    });

    const expBox = document.getElementById('mg-explanation-box');
    if (expBox) {
      expBox.innerHTML = `
        <div class="mg-explanation-header" style="color: #e11d48;">
          <i class="fas fa-hourglass-end"></i> Đã hết 15 giây!
        </div>
        <div class="mg-explanation-body">
          <div><strong>Đáp án đúng là:</strong> "${this.escapeHtml(currentItem.meaning)}"</div>
          ${currentItem.example ? `<div class="mg-explanation-example">"${this.escapeHtml(currentItem.example)}"</div>` : ''}
        </div>
        <button class="btn-mg-next" onclick="window.voiceBankGames.nextG1Question()">
          ${this.g1CurrentIdx < 9 ? 'Câu tiếp theo <i class="fas fa-arrow-right"></i>' : 'Xem kết quả <i class="fas fa-trophy"></i>'}
        </button>
      `;
      expBox.classList.add('active');
    }
  }

  nextG1Question() {
    this.g1CurrentIdx++;
    this.renderG1Question();
  }

  /* ==========================================================================
     GAME 2: GHÉP CẶP TỪ VỰNG (2 COLUMNS MATCHING)
     ========================================================================== */
  initGame2() {
    MinigameEngine.safeSetText('mg-arena-title', 'Game 2: Ghép cặp từ vựng');

    const lexicon = (typeof DIALECT_LEXICON !== 'undefined') ? DIALECT_LEXICON : [];
    if (!lexicon || lexicon.length < 5) {
      alert('Dữ liệu từ điển chưa đủ!');
      this.renderHub();
      return;
    }

    // Pick 5 random word pairs
    const sample = [...lexicon].sort(() => 0.5 - Math.random()).slice(0, 5);
    this.g2Pairs = sample;
    this.g2SelectedLeft = null;
    this.g2SelectedRight = null;
    this.g2MatchedCount = 0;

    const leftItems = sample.map(item => ({ id: item.id, word: item.word })).sort(() => 0.5 - Math.random());
    const rightItems = sample.map(item => ({ id: item.id, meaning: item.meaning })).sort(() => 0.5 - Math.random());

    const arenaBody = document.getElementById('mg-arena-body');
    if (!arenaBody) return;

    arenaBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; color: #64748b; font-size: 14px;">
        💡 Click chọn 1 từ phương ngữ bên trái và 1 nghĩa phổ thông tương ứng bên phải để ghép cặp.
      </div>
      <div class="mg-matching-grid">
        <!-- Left Column: Dialect Words -->
        <div class="mg-matching-col">
          <div class="mg-col-header"><i class="fas fa-map-marker-alt"></i> Từ phương ngữ</div>
          ${leftItems.map(item => `
            <div class="mg-match-card" data-side="left" data-id="${item.id}" onclick="window.voiceBankGames.handleG2Click('left', '${item.id}', this)">
              ${this.escapeHtml(item.word)}
            </div>
          `).join('')}
        </div>

        <!-- Right Column: Meanings -->
        <div class="mg-matching-col">
          <div class="mg-col-header"><i class="fas fa-book"></i> Nghĩa tiếng phổ thông</div>
          ${rightItems.map(item => `
            <div class="mg-match-card" data-side="right" data-id="${item.id}" onclick="window.voiceBankGames.handleG2Click('right', '${item.id}', this)">
              ${this.escapeHtml(item.meaning)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  handleG2Click(side, id, cardEl) {
    if (cardEl.classList.contains('matched')) return;

    if (side === 'left') {
      document.querySelectorAll('.mg-match-card[data-side="left"]').forEach(c => c.classList.remove('selected'));
      cardEl.classList.add('selected');
      this.g2SelectedLeft = { id, el: cardEl };
    } else {
      document.querySelectorAll('.mg-match-card[data-side="right"]').forEach(c => c.classList.remove('selected'));
      cardEl.classList.add('selected');
      this.g2SelectedRight = { id, el: cardEl };
    }

    // Check if both left and right selected
    if (this.g2SelectedLeft && this.g2SelectedRight) {
      const leftObj = this.g2SelectedLeft;
      const rightObj = this.g2SelectedRight;

      if (leftObj.id === rightObj.id) {
        // Correct match!
        leftObj.el.classList.remove('selected');
        rightObj.el.classList.remove('selected');
        leftObj.el.classList.add('matched');
        rightObj.el.classList.add('matched');

        this.g2MatchedCount++;
        this.correctCount++;
        this.score += 150;
        this.updateArenaStats();

        this.g2SelectedLeft = null;
        this.g2SelectedRight = null;

        if (this.g2MatchedCount >= this.g2Pairs.length) {
          setTimeout(() => this.finishGame(), 600);
        }
      } else {
        // Wrong match -> shake and red border!
        leftObj.el.classList.add('wrong');
        rightObj.el.classList.add('wrong');
        this.wrongCount++;
        this.score = Math.max(0, this.score - 20);
        this.updateArenaStats();

        setTimeout(() => {
          leftObj.el.classList.remove('selected', 'wrong');
          rightObj.el.classList.remove('selected', 'wrong');
          this.g2SelectedLeft = null;
          this.g2SelectedRight = null;
        }, 600);
      }
    }
  }

  /* ==========================================================================
     GAME 3: Ô CHỮ PHƯƠNG NGỮ (NATIVE INPUT + AUTO-ADVANCE & NORMALIZATION)
     ========================================================================== */
  initGame3() {
    MinigameEngine.safeSetText('mg-arena-title', 'Game 3: Ô chữ phương ngữ');

    const lexicon = (typeof DIALECT_LEXICON !== 'undefined') ? DIALECT_LEXICON : [];
    if (!lexicon || lexicon.length === 0) {
      alert('Dữ liệu chưa sẵn sàng!');
      this.renderHub();
      return;
    }

    // Pick a clean word
    const validPool = lexicon.filter(item => item.word && item.word.length >= 2 && item.word.length <= 12);
    const item = validPool[Math.floor(Math.random() * validPool.length)];
    
    this.g3Item = item;
    const targetWord = item.word.toUpperCase();
    this.g3TargetLetters = targetWord.split('');
    this.g3UserLetters = new Array(this.g3TargetLetters.length).fill('');
    this.g3Answered = false;

    // Fill non-letter slots like spaces
    for (let i = 0; i < this.g3TargetLetters.length; i++) {
      if (this.g3TargetLetters[i] === ' ') {
        this.g3UserLetters[i] = ' ';
      }
    }

    this.renderG3UI();

    // Auto-focus on first non-space slot
    setTimeout(() => {
      let firstSlot = 0;
      while (firstSlot < this.g3TargetLetters.length && this.g3TargetLetters[firstSlot] === ' ') firstSlot++;
      const firstEl = document.getElementById(`mg-g3-input-${firstSlot}`);
      if (firstEl) firstEl.focus();
    }, 150);
  }

  renderG3UI() {
    const arenaBody = document.getElementById('mg-arena-body');
    if (!arenaBody || !this.g3Item) return;

    arenaBody.innerHTML = `
      <div class="mg-g3-container">
        <!-- Hint Clue Box -->
        <div class="mg-clue-box">
          <span class="mg-clue-label"><i class="fas fa-lightbulb"></i> Gợi ý nghĩa tiếng phổ thông</span>
          <div class="mg-clue-text">"${this.escapeHtml(this.g3Item.meaning)}"</div>
          <div style="font-size: 13px; color: #b45309; margin-top: 6px;">Khu vực: ${this.escapeHtml(this.g3Item.region || 'Bắc Trung Bộ')}</div>
        </div>

        <!-- Native Letter Inputs -->
        <div class="mg-word-slots" id="mg-word-slots">
          ${this.g3TargetLetters.map((char, idx) => {
            if (char === ' ') {
              return `<div class="mg-letter-box space"></div>`;
            }
            const val = this.g3UserLetters[idx] || '';
            const isRevealed = this.g3Answered;
            return `
              <input type="text" 
                     class="mg-letter-input ${val ? 'filled' : ''} ${isRevealed ? 'revealed' : ''}" 
                     id="mg-g3-input-${idx}"
                     data-index="${idx}"
                     maxlength="1"
                     value="${this.escapeHtml(val)}"
                     ${isRevealed ? 'disabled' : ''}
                     oninput="window.voiceBankGames.handleG3Input(event, ${idx})"
                     onkeydown="window.voiceBankGames.handleG3KeyDown(event, ${idx})"
                     onclick="this.select()"
                     autocomplete="off"
                     autocorrect="off"
                     autocapitalize="characters"
                     spellcheck="false"
              />
            `;
          }).join('')}
        </div>

        <!-- Game 3 Actions -->
        <div class="mg-g3-actions">
          <button class="btn-mg-action btn-reveal-cw" ${this.g3Answered ? 'disabled' : ''} onclick="window.voiceBankGames.revealG3Answer()">
            <i class="fas fa-eye"></i> Xem đáp án
          </button>
          <button class="btn-mg-action btn-submit-cw" ${this.g3Answered ? 'disabled' : ''} onclick="window.voiceBankGames.submitG3Answer()">
            <i class="fas fa-check"></i> Kiểm tra đáp án
          </button>
        </div>

        <!-- Explanation / Revealed Banner -->
        ${this.g3Answered ? `
          <div class="mg-explanation-box active" style="border-color: #f43f5e; background: #fff1f2; margin-top: 20px;">
            <div class="mg-explanation-header" style="color: #e11d48;">
              <i class="fas fa-eye"></i> Đã hiển thị đáp án (Tính là câu sai)
            </div>
            <div class="mg-explanation-body">
              <div><strong>Từ đúng:</strong> <span style="font-size: 18px; color: #be123c; font-weight: 800;">"${this.escapeHtml(this.g3TargetLetters.join(''))}"</span></div>
              <div><strong>Nghĩa chuẩn:</strong> ${this.escapeHtml(this.g3Item.meaning)}</div>
              ${this.g3Item.example ? `<div class="mg-explanation-example">"${this.escapeHtml(this.g3Item.example)}"</div>` : ''}
            </div>
            <button class="btn-mg-next" style="background: #e11d48;" onclick="window.voiceBankGames.finishGame()">
              Xem kết quả <i class="fas fa-trophy"></i>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  handleG3Input(e, idx) {
    if (this.g3Answered) return;
    const inputEl = e.target;
    const rawVal = inputEl.value || '';

    if (rawVal.length > 0) {
      // Take character typed
      const char = rawVal.slice(-1);
      this.g3UserLetters[idx] = char;
      inputEl.value = char;
      inputEl.classList.add('filled');

      // Auto advance to next non-space slot
      let nextIdx = idx + 1;
      while (nextIdx < this.g3TargetLetters.length && this.g3TargetLetters[nextIdx] === ' ') {
        nextIdx++;
      }
      if (nextIdx < this.g3TargetLetters.length) {
        const nextEl = document.getElementById(`mg-g3-input-${nextIdx}`);
        if (nextEl) {
          nextEl.focus();
          nextEl.select();
        }
      }
    } else {
      this.g3UserLetters[idx] = '';
      inputEl.classList.remove('filled');
    }
  }

  handleG3KeyDown(e, idx) {
    if (this.g3Answered) return;

    if (e.key === 'Backspace') {
      const inputEl = e.target;
      if (!inputEl.value || inputEl.value === '') {
        e.preventDefault();
        // Move focus backward to previous non-space slot and clear it
        let prevIdx = idx - 1;
        while (prevIdx >= 0 && this.g3TargetLetters[prevIdx] === ' ') {
          prevIdx--;
        }
        if (prevIdx >= 0) {
          const prevEl = document.getElementById(`mg-g3-input-${prevIdx}`);
          if (prevEl) {
            prevEl.focus();
            prevEl.value = '';
            this.g3UserLetters[prevIdx] = '';
            prevEl.classList.remove('filled');
          }
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.submitG3Answer();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      let prevIdx = idx - 1;
      while (prevIdx >= 0 && this.g3TargetLetters[prevIdx] === ' ') {
        prevIdx--;
      }
      if (prevIdx >= 0) {
        const prevEl = document.getElementById(`mg-g3-input-${prevIdx}`);
        if (prevEl) prevEl.focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      let nextIdx = idx + 1;
      while (nextIdx < this.g3TargetLetters.length && this.g3TargetLetters[nextIdx] === ' ') {
        nextIdx++;
      }
      if (nextIdx < this.g3TargetLetters.length) {
        const nextEl = document.getElementById(`mg-g3-input-${nextIdx}`);
        if (nextEl) nextEl.focus();
      }
    }
  }

  handleKeyDown(e) {
    if (this.activeGameId !== 3 || this.g3Answered) return;
  }

  static normalizeText(str) {
    return str ? str.trim().toLowerCase().normalize('NFC') : '';
  }

  submitG3Answer() {
    if (this.g3Answered) return;

    // Check if any non-space slot is empty
    let isComplete = true;
    for (let i = 0; i < this.g3TargetLetters.length; i++) {
      if (this.g3TargetLetters[i] !== ' ' && (!this.g3UserLetters[i] || this.g3UserLetters[i].trim() === '')) {
        isComplete = false;
        break;
      }
    }

    if (!isComplete) {
      alert('Vui lòng nhập đủ tất cả các ô chữ cái!');
      // Focus first empty slot
      for (let i = 0; i < this.g3TargetLetters.length; i++) {
        if (this.g3TargetLetters[i] !== ' ' && (!this.g3UserLetters[i] || this.g3UserLetters[i].trim() === '')) {
          const emptyEl = document.getElementById(`mg-g3-input-${i}`);
          if (emptyEl) emptyEl.focus();
          break;
        }
      }
      return;
    }

    // Build normalized user & target strings for Unicode Vietnamese comparison
    const userString = MinigameEngine.normalizeText(this.g3UserLetters.join(''));
    const targetString = MinigameEngine.normalizeText(this.g3TargetLetters.join(''));

    if (userString === targetString) {
      // Solved!
      this.g3Answered = true;
      this.correctCount++;
      this.score += 250;
      this.updateArenaStats();

      const inputs = document.querySelectorAll('.mg-letter-input');
      inputs.forEach(input => {
        input.classList.add('solved');
        input.disabled = true;
      });

      setTimeout(() => this.finishGame(), 800);
    } else {
      // Wrong!
      this.wrongCount++;
      this.score = Math.max(0, this.score - 30);
      this.updateArenaStats();

      const inputs = document.querySelectorAll('.mg-letter-input');
      inputs.forEach(input => input.classList.add('wrong'));

      setTimeout(() => {
        inputs.forEach(input => input.classList.remove('wrong'));
      }, 600);
    }
  }

  revealG3Answer() {
    if (!this.g3Item || this.g3Answered) return;
    this.g3Answered = true;

    // Fill all slots with the correct target letters
    this.g3UserLetters = [...this.g3TargetLetters];

    // Count as incorrect
    this.wrongCount++;
    this.updateArenaStats();

    // Re-render UI with revealed slots and explanation box
    this.renderG3UI();
  }

  /* ==========================================================================
     STEP 4: RESULTS SCREEN & CONFETTI & LEADERBOARD
     ========================================================================== */
  /* ==========================================================================
     STEP 4: RESULTS SCREEN & CONFETTI & LEADERBOARD
     ========================================================================== */
  finishGame() {
    this.stopAllTimers();
    const timeSec = Math.max(1, Math.floor((Date.now() - this.roundStartTime) / 1000));

    // Save High Score for this game
    const gKey = `g${this.activeGameId}`;
    if (this.score > (this.highScores[gKey] || 0)) {
      this.highScores[gKey] = this.score;
      localStorage.setItem('vb_highscores', JSON.stringify(this.highScores));
    }

    const user = (window.GNS_AUTH && typeof window.GNS_AUTH.isLoggedIn === 'function' && window.GNS_AUTH.isLoggedIn())
      ? window.GNS_AUTH.user
      : null;

    const playerName = user ? (user.fullName || user.username) : (this.playerName || 'Thành viên');
    const username = user ? user.username : '';

    // Add to Leaderboard
    const entry = {
      id: Date.now(),
      userId: user ? user.id : null,
      username: username,
      name: playerName,
      score: this.score,
      gameId: Number(this.activeGameId),
      gameTitle: this.activeGameId === 1 ? 'Giải nghĩa phương ngữ' : (this.activeGameId === 2 ? 'Ghép cặp từ vựng' : 'Ô chữ phương ngữ'),
      timeSec: timeSec,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('vi-VN')
    };

    this.leaderboard.push(entry);
    localStorage.setItem('vb_leaderboard', JSON.stringify(this.leaderboard));

    // Send score to backend server
    if (typeof window.apiFetch === 'function') {
      window.apiFetch('/api/games/score', {
        method: 'POST',
        body: JSON.stringify({
          gameId: Number(this.activeGameId),
          score: this.score,
          streak: this.streak,
          timeSeconds: timeSec,
          playerName: playerName
        })
      }).catch(err => console.warn('[Minigame] Không gửi được điểm lên server:', err));
    }

    // Show Results Modal
    this.openResultModal(entry);
    this.triggerConfetti();
  }

  openResultModal(entry) {
    const modalBackdrop = document.getElementById('mg-result-modal');
    if (!modalBackdrop) return;

    MinigameEngine.safeSetText('mg-res-score', entry.score);
    MinigameEngine.safeSetText('mg-res-correct', this.correctCount);
    MinigameEngine.safeSetText('mg-res-time', `${entry.timeSec}s`);

    const guestHint = document.getElementById('mg-res-guest-hint');
    if (guestHint) {
      guestHint.style.display = this.isGuest ? 'block' : 'none';
    }

    modalBackdrop.classList.add('active');
  }

  closeResultModal() {
    const modalBackdrop = document.getElementById('mg-result-modal');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
    this.renderHub();
  }

  triggerConfetti() {
    const canvas = document.getElementById('mg-confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 3 + 2,
        vx: Math.random() * 2 - 1,
        rot: Math.random() * 360,
        vRot: Math.random() * 4 - 2
      });
    }

    let frames = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vRot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 180) {
        this.confettiAnimId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (this.confettiAnimId) cancelAnimationFrame(this.confettiAnimId);
    animate();
  }

  /* ==========================================================================
     LEADERBOARD MODAL (TOP 10 PER GAME + TABS)
     ========================================================================== */
  openLeaderboard(gameId, timeRange) {
    if (gameId) {
      this.selectedLeaderboardGame = Number(gameId);
    } else if (this.activeGameId) {
      this.selectedLeaderboardGame = Number(this.activeGameId);
    } else if (!this.selectedLeaderboardGame) {
      this.selectedLeaderboardGame = 1;
    }

    if (timeRange) {
      this.selectedLeaderboardTime = timeRange;
    }

    const modalBackdrop = document.getElementById('mg-leaderboard-modal');
    if (!modalBackdrop) return;

    modalBackdrop.classList.add('active');
    this.renderLeaderboard();
  }

  closeLeaderboard() {
    const modalBackdrop = document.getElementById('mg-leaderboard-modal');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  switchLeaderboardGame(gameId) {
    this.selectedLeaderboardGame = Number(gameId);
    this.renderLeaderboard();
  }

  switchLeaderboardTime(timeRange) {
    this.selectedLeaderboardTime = timeRange;
    this.renderLeaderboard();
  }

  async renderLeaderboard() {
    const listEl = document.getElementById('mg-lb-list');
    if (!listEl) return;

    // Update Level 1 Game tab active state
    document.querySelectorAll('#mg-game-tabs .btn-mg-game-tab').forEach(btn => {
      const btnGame = Number(btn.getAttribute('data-game'));
      if (btnGame === this.selectedLeaderboardGame) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Level 2 Time tab active state
    document.querySelectorAll('#mg-time-tabs .btn-mg-tab').forEach(btn => {
      const btnTime = btn.getAttribute('data-time');
      if (btnTime === this.selectedLeaderboardTime) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    listEl.innerHTML = `
      <div style="text-align: center; padding: 25px; color: #64748b;">
        <i class="fas fa-spinner fa-spin" style="font-size: 26px; color: #0284c7; margin-bottom: 8px;"></i>
        <p style="font-size: 13px; margin: 0;">Đang kết nối bảng xếp hạng máy chủ...</p>
      </div>
    `;

    let serverItems = null;
    try {
      if (window.apiJson) {
        const res = await window.apiJson(`/api/games/leaderboard?gameId=${this.selectedLeaderboardGame}&timeRange=${this.selectedLeaderboardTime}&limit=10`);
        if (res && res.success && Array.isArray(res.items)) {
          serverItems = res.items;
        }
      }
    } catch (e) {
      console.warn('Leaderboard API fetch warning, fallback to local:', e);
    }

    let top10 = [];
    if (serverItems && serverItems.length > 0) {
      top10 = serverItems.map(item => ({
        name: item.name || 'Người chơi',
        score: item.score,
        timeSec: item.time != null ? item.time : (item.time_seconds || null),
        dateStr: item.date ? new Date(item.date).toLocaleDateString('vi-VN') : ''
      }));
    } else {
      // Local fallback
      let data = (this.leaderboard || []).filter(item => Number(item.gameId) === this.selectedLeaderboardGame);
      if (this.selectedLeaderboardTime === 'week') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        data = data.filter(item => item.timestamp >= sevenDaysAgo);
      }
      data.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.timeSec || 0) - (b.timeSec || 0);
      });
      top10 = data.slice(0, 10);
    }

    if (top10.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #64748b;">
          <i class="fas fa-trophy" style="font-size: 36px; color: #cbd5e1; margin-bottom: 10px;"></i>
          <p>Chưa có dữ liệu bảng xếp hạng cho trò chơi này trong khoảng thời gian đã chọn.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = top10.map((item, idx) => {
      let rankBadge = `${idx + 1}`;
      let topClass = '';

      if (idx === 0) { rankBadge = '🥇'; topClass = 'top-1'; }
      else if (idx === 1) { rankBadge = '🥈'; topClass = 'top-2'; }
      else if (idx === 2) { rankBadge = '🥉'; topClass = 'top-3'; }

      const displayName = item.name || item.username || 'Thành viên';
      const timeDisplay = (item.timeSec != null && item.timeSec !== '--') ? `⏱️ ${item.timeSec}s` : '';
      const dateDisplay = item.dateStr ? ` • ${item.dateStr}` : '';

      return `
        <div class="mg-lb-row ${topClass}">
          <div class="mg-lb-rank">${rankBadge}</div>
          <div class="mg-lb-info">
            <div class="mg-lb-name">${this.escapeHtml(displayName)}</div>
            <div class="mg-lb-sub">${timeDisplay}${dateDisplay}</div>
          </div>
          <div class="mg-lb-score">${item.score} đ</div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Global Export
window.VoiceBankGamesEngine = MinigameEngine;

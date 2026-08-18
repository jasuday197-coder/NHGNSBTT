# Triển khai giongnoiso.com lên VPS

> IP máy chủ, tài khoản SSH và thông tin CSDL nằm ở `deploy/credentials.local.md`
> — file đó đã gitignore, KHÔNG bao giờ đưa lên repo công khai.

## 0. Việc phải làm trước tiên

Hai API key cũ đã bị commit lên GitHub public → **coi như đã lộ**. Revoke và tạo key mới:

- OpenRouter: https://openrouter.ai/keys
- Groq: https://console.groq.com/keys

Điền key mới vào `.env` rồi mới deploy.

## 1. Chuẩn bị VPS

```bash
# Node 18+ (khuyến nghị 20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v   # >= 18.17
```

## 2. Đưa mã nguồn lên

Chỉ đẩy những thứ cần chạy. **Không** đẩy `nodejs/`, `NHGNSBTT/`, `cloned_repo/`, `scratch/`, `.git/`.

```bash
rsync -avz --delete \
  --exclude '.git' --exclude 'node_modules' --exclude 'nodejs' \
  --exclude 'NHGNSBTT' --exclude 'cloned_repo' --exclude 'scratch' \
  --exclude 'logs' --exclude '*.json.bak' \
  ./ root@<IP_MAY_CHU>:/www/wwwroot/giongnoiso.com/
```

`.env` bị rsync bỏ qua theo `.gitignore`? Không — rsync không đọc gitignore, nên `.env` **sẽ** được đẩy lên. Đó là điều ta muốn ở đây, nhưng hãy kiểm tra quyền sau khi lên (bước 4).

## 3. Cài dependency + tạo bảng

```bash
cd /www/wwwroot/giongnoiso.com
npm ci --omit=dev

npm run migrate -- --seed     # tạo bảng + nạp dữ liệu cũ từ data.js/JSON
npm run create-admin -- --username <ten_admin> --password '<mat_khau_manh>'
```

Lần deploy sau chỉ cần `npm run migrate` (không `--seed`) — script dùng
`CREATE TABLE IF NOT EXISTS` nên chạy lại vô hại.

## 4. Phân quyền tệp

```bash
cd /www/wwwroot/giongnoiso.com
chown -R www:www .
chmod 600 .env                 # chỉ chủ sở hữu đọc được
chmod 750 uploads logs
find public -type f -exec chmod 644 {} \;
```

## 5. Chạy dịch vụ

```bash
cp deploy/giongnoiso.service /etc/systemd/system/
cp deploy/proxy_params_gns.conf /etc/nginx/
systemctl daemon-reload
systemctl enable --now giongnoiso
systemctl status giongnoiso
```

## 5b. Giọng nói AI (VieNeu-TTS) — tuỳ chọn

Bỏ qua mục này nếu chưa cần. Đặt `TTS_ENABLED=false` là toàn bộ tính năng tắt,
web vẫn chạy bình thường.

```bash
cd /www/wwwroot/giongnoiso.com/tts
python3 -m venv .venv
.venv/bin/pip install -U pip && .venv/bin/pip install -r requirements.txt

cp ../deploy/giongnoiso-tts.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now giongnoiso-tts
curl -s http://127.0.0.1:7861/health
```

Lần chạy đầu tải model từ HuggingFace (vài trăm MB) nên `systemctl start` có thể
mất vài phút — `TimeoutStartSec` đã đặt 600s.

### ⚠️ Ràng buộc CPU của VPS này

`lscpu` cho ra `QEMU Virtual CPU version 2.5+` — CPU model mặc định của QEMU,
**thiếu SSE3, SSSE3, SSE4.1, SSE4.2, POPCNT, AVX, AVX2**.

Hệ quả: mọi wheel numpy ≥ 2.0 đều dựng với baseline `x86-64-v2` nên import là
chết ngay:

```
RuntimeError: NumPy was built with baseline optimizations:
(X86_V2) but your machine doesn't support: (X86_V2).
```

Vì vậy `tts/requirements.txt` **ghim** numpy 1.26.4 + scipy 1.13.1 +
librosa 0.10.2. Đừng gỡ ghim khi chưa đổi CPU model.

Cách sửa triệt để: nhờ nhà cung cấp VPS đổi CPU model sang `host-passthrough`
(libvirt: `<cpu mode='host-passthrough'/>`, hoặc QEMU `-cpu host`). CPU vật lý
gần như chắc chắn có đủ các tập lệnh này — chỉ là QEMU đang che đi. Sau khi đổi,
có thể bỏ ghim và dùng bản mới nhất, chạy sẽ nhanh hơn đáng kể.

**Lưu ý hiệu năng:** trên CPU mỗi câu mất khoảng vài giây tới vài chục giây.
`TTS_MAX_CONCURRENCY=1` là cố ý — chạy song song trên CPU chỉ làm chậm tất cả.
Kết quả được cache theo hash nội dung nên câu lặp lại trả về tức thì.
Nếu VPS dưới 4 GB RAM, cân nhắc hạ `MemoryMax` trong service file hoặc tắt hẳn TTS.

### Kiểm soát đồng ý nhân bản giọng

Đây là phần **quan trọng nhất** của tính năng này.

- Cột `audio_records.allow_voice_clone` mặc định `0`. Không có giá trị `1`
  thì API `/api/tts/clone` trả 403, bất kể người gọi là ai.
- Người đóng góp mới tự tích ô "Cho phép nhân bản giọng" trong form — ô này
  **tách riêng và không bắt buộc**.
- Admin bật/tắt thủ công trong panel duyệt, hoặc qua
  `POST /api/admin/clone-consent {id, allowed}`.
- Tắt đồng ý sẽ đồng thời chuyển mọi bản ghi trong `voice_clones` sang `revoked`.
- Mọi lượt tổng hợp đều ghi vào `tts_log`; riêng lượt clone ghi thêm vào
  `audit_log`. Xem qua `GET /api/admin/tts-log`.

**13 bản ghi hiện có đang để `allow_voice_clone = 0`** vì những người đó đã đóng
góp theo điều khoản cũ — điều khoản nói rõ dữ liệu sẽ không dùng để clone giọng.
Muốn dùng giọng của họ thì phải liên hệ xin lại đồng ý rồi mới bật cờ. Bật hàng
loạt bằng SQL là đi ngược điều đã hứa với họ.

Muốn tắt hoàn toàn khả năng clone từ kho đóng góp mà vẫn giữ TTS giọng dựng sẵn:
đặt `TTS_ALLOW_CORPUS_CLONING=false`.

## 6. nginx + HTTPS

```bash
cp deploy/nginx.conf /www/server/panel/vhost/nginx/giongnoiso.com.conf
nginx -t && systemctl reload nginx
```

Cấp SSL qua aaPanel (Website → SSL → Let's Encrypt), hoặc certbot.
Sau khi có HTTPS, giữ `COOKIE_SECURE=true` trong `.env`.

## 7. Nghiệm thu

```bash
curl -s https://giongnoiso.com/api/health

# Các đường dẫn dưới đây PHẢI trả 404 — nếu trả 200 là còn lỗ hổng
for p in /.env /.git/config /server.js /lib/db.js /db/schema.sql /package.json; do
  printf "%-22s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://giongnoiso.com$p)"
done

# API admin khi chưa đăng nhập PHẢI trả 401
curl -s -o /dev/null -w '%{http_code}\n' https://giongnoiso.com/api/admin/reports
```

## 8. Sao lưu

```bash
# Thêm vào crontab -e
0 3 * * * mysqldump -u <db_user> -p'<mat_khau>' <db_name> | gzip > /backup/gns-$(date +\%F).sql.gz
15 3 * * * tar czf /backup/gns-uploads-$(date +\%F).tar.gz -C /www/wwwroot/giongnoiso.com uploads
0 4 * * * find /backup -name 'gns-*' -mtime +30 -delete
```

---

## Vận hành

| Việc | Lệnh |
|---|---|
| Xem log | `journalctl -u giongnoiso -f` |
| Khởi động lại | `systemctl restart giongnoiso` |
| Tạo admin | `npm run create-admin -- --username X --password 'Y'` |
| Nâng user lên admin | `npm run create-admin -- --username X --promote` |
| Đặt lại mật khẩu | `npm run create-admin -- --username X --reset-password 'Y'` |
| Khoá đăng ký mới | Đặt `ALLOW_REGISTRATION=false` trong `.env` rồi restart |
| Xem nhật ký quản trị | `GET /api/admin/audit-log` (cần đăng nhập admin) |

## Phân quyền

| Chức năng | Khách | User | Admin |
|---|:---:|:---:|:---:|
| Bản đồ, từ điển, dịch, chatbot, trò chơi | ✓ | ✓ | ✓ |
| Nghe bản ghi đã duyệt | ✓ | ✓ | ✓ |
| Đóng góp bản ghi âm | — | ✓ | ✓ |
| Báo cáo nội dung vi phạm | — | ✓ | ✓ |
| Tổng hợp giọng (giọng dựng sẵn) | — | ✓ | ✓ |
| Nhân bản giọng từ bản ghi đã có đồng ý | — | ✓ | ✓ |
| Duyệt / từ chối đóng góp | — | — | ✓ |
| Xử lý báo cáo, xoá bản ghi | — | — | ✓ |
| Thêm bản ghi YouTube | — | — | ✓ |
| Bật/tắt đồng ý nhân bản giọng | — | — | ✓ |
| Thống kê, nhật ký hệ thống & TTS | — | — | ✓ |

Quyền admin **chỉ** cấp được qua CLI trên máy chủ, không có đường nào từ HTTP.

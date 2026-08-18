# Dịch vụ VieNeu-TTS

Tiến trình Python riêng, chỉ lắng nghe `127.0.0.1:7862`. Node gọi sang qua
HTTP nội bộ kèm `TTS_INTERNAL_TOKEN`. **Không** mở cổng này ra Internet.

## Cài trên VPS

```bash
cd /www/wwwroot/giongnoiso.com/tts
python3 -m venv .venv
.venv/bin/pip install -U pip
.venv/bin/pip install -r requirements.txt
```

Lần chạy đầu sẽ tải model từ HuggingFace (vài trăm MB).

## Chạy thử

```bash
cd /www/wwwroot/giongnoiso.com
TTS_INTERNAL_TOKEN=$(grep '^TTS_INTERNAL_TOKEN=' .env | cut -d= -f2) \
  tts/.venv/bin/uvicorn tts.service:app --host 127.0.0.1 --port 7862
```

Kiểm tra: `curl -s http://127.0.0.1:7862/health`

## Chạy nền

```bash
cp deploy/giongnoiso-tts.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now giongnoiso-tts
journalctl -u giongnoiso-tts -f
```

## Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `TTS_INTERNAL_TOKEN` | *(bắt buộc)* | Token chia sẻ với Node |
| `TTS_BACKEND` | `onnx` | `onnx` cho CPU, `torch` nếu có GPU |
| `TTS_MODEL` | *(trống)* | Ví dụ `pnnbao-ump/VieNeu-TTS-v2` |
| `TTS_UPLOADS_DIR` | `../uploads` | Thư mục chứa audio tham chiếu |
| `TTS_CACHE_DIR` | `../tts_cache` | Nơi ghi file wav đã tổng hợp |
| `TTS_MAX_TEXT_CHARS` | `600` | Trần độ dài văn bản |
| `TTS_MAX_CONCURRENCY` | `1` | Số ca tổng hợp chạy song song |

Trên CPU, để `TTS_MAX_CONCURRENCY=1`. Chạy song song chỉ làm chậm tất cả.

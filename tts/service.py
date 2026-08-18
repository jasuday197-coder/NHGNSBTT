"""
Dich vu tong hop giong noi VieNeu-TTS.

Chay nhu mot tien trinh rieng canh Node, CHI lang nghe tren 127.0.0.1.
Node moi la lop kiem soat quyen; dich vu nay khong biet gi ve nguoi dung,
no chi tong hop am thanh cho request da mang dung token noi bo.

  uvicorn tts.service:app --host 127.0.0.1 --port 7861
"""

import hashlib
import logging
import os
import threading
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO, format="[vieneu] %(levelname)s %(message)s")
log = logging.getLogger("vieneu")

# --- Cau hinh tu bien moi truong -------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
INTERNAL_TOKEN = os.environ.get("TTS_INTERNAL_TOKEN", "")
UPLOADS_DIR = Path(os.environ.get("TTS_UPLOADS_DIR", ROOT / "uploads")).resolve()
CACHE_DIR = Path(os.environ.get("TTS_CACHE_DIR", ROOT / "tts_cache")).resolve()
BACKEND = os.environ.get("TTS_BACKEND", "onnx")
MODEL_NAME = os.environ.get("TTS_MODEL", "").strip()
MAX_TEXT_CHARS = int(os.environ.get("TTS_MAX_TEXT_CHARS", "600"))
# CPU: chay song song nhieu ca cung luc chi lam cham tat ca
MAX_CONCURRENCY = int(os.environ.get("TTS_MAX_CONCURRENCY", "1"))

CACHE_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="VieNeu TTS cho giongnoiso.com", docs_url=None, redoc_url=None)

# --- Nap model mot lan, dung chung cho moi request -------------------------

_engine = None
_engine_lock = threading.Lock()
_infer_semaphore = threading.Semaphore(MAX_CONCURRENCY)


def get_engine():
    """Nap model theo kieu lazy de tien trinh khoi dong nhanh."""
    global _engine
    if _engine is not None:
        return _engine

    with _engine_lock:
        if _engine is not None:
            return _engine

        from vieneu import Vieneu

        kwargs = {"backend": BACKEND}
        if MODEL_NAME:
            kwargs["model_name"] = MODEL_NAME

        log.info("Dang nap model VieNeu (backend=%s)...", BACKEND)
        started = time.time()
        _engine = Vieneu(**kwargs)
        log.info("Nap xong sau %.1fs", time.time() - started)

    return _engine


def require_token(authorization: Optional[str]):
    """Chi Node (biet token noi bo) moi goi duoc dich vu nay."""
    if not INTERNAL_TOKEN:
        raise HTTPException(500, "TTS_INTERNAL_TOKEN chua duoc cau hinh")

    expected = f"Bearer {INTERNAL_TOKEN}"
    if authorization != expected:
        raise HTTPException(401, "Token noi bo khong hop le")


def resolve_reference(ref_path: str) -> Path:
    """
    Chi cho phep tham chieu toi tep nam trong uploads/.
    Chan viec Node (hoac bat ky ai chiem duoc token) doc tep tuy y tren dia.
    """
    candidate = (UPLOADS_DIR / Path(ref_path).name).resolve()

    if candidate.parent != UPLOADS_DIR:
        raise HTTPException(400, "Duong dan tham chieu nam ngoai thu muc uploads")
    if not candidate.is_file():
        raise HTTPException(404, "Khong tim thay tep am thanh tham chieu")

    return candidate


def cache_key(text: str, voice: Optional[str], ref: Optional[str], denoise: bool) -> str:
    raw = "\x00".join([text, voice or "", ref or "", str(denoise), BACKEND, MODEL_NAME])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:32]


# --- Kieu du lieu ----------------------------------------------------------


class SynthesizeRequest(BaseModel):
    text: str = Field(min_length=1)
    voice: Optional[str] = None      # ten giong dung san
    ref_audio: Optional[str] = None  # ten tep trong uploads/ -> clone
    denoise: bool = True


# --- Endpoint --------------------------------------------------------------


@app.get("/health")
def health():
    return {
        "status": "ok",
        "backend": BACKEND,
        "model": MODEL_NAME or "mac dinh",
        "model_loaded": _engine is not None,
        "cache_dir": str(CACHE_DIR),
    }


@app.get("/voices")
def voices(authorization: Optional[str] = Header(None)):
    require_token(authorization)
    try:
        presets = get_engine().list_preset_voices()
    except Exception as err:
        log.exception("Khong liet ke duoc giong dung san")
        raise HTTPException(503, f"Khong nap duoc model: {err}")

    return {"voices": [{"label": label, "id": voice_id} for label, voice_id in presets]}


@app.post("/synthesize")
def synthesize(req: SynthesizeRequest, authorization: Optional[str] = Header(None)):
    require_token(authorization)

    text = req.text.strip()
    if not text:
        raise HTTPException(400, "Thieu noi dung can doc")
    if len(text) > MAX_TEXT_CHARS:
        raise HTTPException(413, f"Noi dung vuot qua {MAX_TEXT_CHARS} ky tu")
    if not req.voice and not req.ref_audio:
        raise HTTPException(400, "Phai chon giong dung san hoac tep tham chieu de clone")

    ref_file = resolve_reference(req.ref_audio) if req.ref_audio else None

    key = cache_key(text, req.voice, ref_file.name if ref_file else None, req.denoise)
    out_path = CACHE_DIR / f"{key}.wav"

    # Tra ngay tu cache: tren CPU moi lan tong hop ton vai giay
    if out_path.is_file():
        return JSONResponse({"file": out_path.name, "cached": True, "seconds": 0.0})

    engine = get_engine()

    acquired = _infer_semaphore.acquire(timeout=120)
    if not acquired:
        raise HTTPException(503, "Dich vu dang qua tai, vui long thu lai")

    try:
        started = time.time()
        if ref_file:
            audio = engine.infer(text, ref_audio=str(ref_file), denoise=req.denoise)
        else:
            audio = engine.infer(text, voice=req.voice)

        # Ghi ra tep tam roi doi ten: tranh phuc vu tep dang ghi do.
        # Ten bat dau bang dau cham nen Node khong bao gio phuc vu no ra ngoai,
        # va van giu duoi .wav vi engine.save() suy dinh dang tu duoi tep.
        tmp_path = out_path.with_name(f".{key}.tmp.wav")
        engine.save(audio, str(tmp_path))
        tmp_path.replace(out_path)

        elapsed = time.time() - started
        log.info("Tong hop %d ky tu trong %.1fs -> %s", len(text), elapsed, out_path.name)

        return JSONResponse({"file": out_path.name, "cached": False, "seconds": round(elapsed, 2)})
    except HTTPException:
        raise
    except Exception as err:
        log.exception("Tong hop that bai")
        raise HTTPException(500, f"Tong hop giong noi that bai: {err}")
    finally:
        _infer_semaphore.release()


@app.post("/warmup")
def warmup(authorization: Optional[str] = Header(None)):
    """Nap model truoc de request dau tien cua nguoi dung khong phai cho."""
    require_token(authorization)
    started = time.time()
    get_engine()
    return {"status": "ok", "seconds": round(time.time() - started, 2)}

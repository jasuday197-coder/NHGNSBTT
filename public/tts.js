/* ==========================================================================
   GIỌNG NÓI AI (tts.js) — tổng hợp & nhân bản giọng qua VieNeu-TTS
   Nạp sau auth.js vì dùng window.apiJson.
   ========================================================================== */

(function () {
  'use strict';

  const state = {
    ready: false,
    enabled: false,
    corpusCloningAllowed: false,
    maxTextChars: 600,
    presets: [],
    cloneable: [],
    busy: false
  };

  window.GNS_TTS = state;

  const $ = (id) => document.getElementById(id);

  function escapeHtml(text) {
    return String(text === null || text === undefined ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function setStatus(message, kind = 'info') {
    const el = $('tts-status');
    if (!el) return;
    el.textContent = message || '';
    el.className = `tts-status tts-status-${kind}`;
  }

  // ------------------------------------------------------------------
  // Nạp trạng thái dịch vụ + danh sách giọng
  // ------------------------------------------------------------------

  async function loadStatus() {
    try {
      const data = await window.apiJson('/api/tts/status');
      state.enabled = Boolean(data.enabled);
      state.corpusCloningAllowed = Boolean(data.corpusCloningAllowed);
      state.maxTextChars = Number(data.maxTextChars) || 600;
      state.serviceStatus = data.service && data.service.status;
    } catch (_) {
      state.enabled = false;
    }
    state.ready = true;
    renderShell();
  }

  async function loadVoices() {
    if (!state.enabled) return;
    try {
      const data = await window.apiJson('/api/tts/voices');
      state.presets = data.presets || [];
      state.cloneable = data.cloneable || [];
    } catch (err) {
      setStatus(`Không tải được danh sách giọng: ${err.message}`, 'error');
      return;
    }
    renderVoicePicker();
  }

  // ------------------------------------------------------------------
  // Dựng giao diện
  // ------------------------------------------------------------------

  function renderShell() {
    const container = $('tts-panel');
    if (!container) return;

    if (!state.enabled) {
      container.innerHTML = `
        <div class="tts-offline">
          <i class="fas fa-microphone-slash"></i>
          <h3>Tính năng giọng nói AI đang tắt</h3>
          <p>Quản trị viên chưa bật hoặc dịch vụ tổng hợp giọng chưa chạy.</p>
        </div>`;
      return;
    }

    if (!window.GNS_AUTH || !window.GNS_AUTH.isLoggedIn()) {
      container.innerHTML = `
        <div class="tts-offline">
          <i class="fas fa-lock"></i>
          <h3>Cần đăng nhập</h3>
          <p>Đăng nhập để dùng tính năng tổng hợp giọng nói.</p>
          <button class="btn-tts-generate" onclick="window.GNS_AUTH.openAuthModal('login')">Đăng nhập</button>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="tts-grid">
        <div class="tts-col">
          <label class="tts-label" for="tts-text">Nội dung cần đọc</label>
          <textarea class="tts-textarea" id="tts-text" rows="5"
                    maxlength="${state.maxTextChars}"
                    placeholder="Ví dụ: Bữa ni trời đẹp rứa, đi mô đó?"></textarea>
          <div class="tts-counter"><span id="tts-count">0</span>/${state.maxTextChars} ký tự</div>

          <label class="tts-label" for="tts-voice">Giọng đọc</label>
          <select class="tts-select" id="tts-voice"><option>Đang tải…</option></select>

          <div class="tts-clone-warning" id="tts-clone-warning" hidden>
            <i class="fas fa-triangle-exclamation"></i>
            <span>Bạn đang dùng giọng của một người đóng góp thật. Mỗi lượt tạo đều được ghi vào nhật ký kèm tên tài khoản của bạn.</span>
          </div>

          <button class="btn-tts-generate" id="tts-generate">
            <i class="fas fa-wand-magic-sparkles"></i> Tạo giọng nói
          </button>
          <div class="tts-status" id="tts-status"></div>
        </div>

        <div class="tts-col">
          <div class="tts-result" id="tts-result">
            <i class="fas fa-waveform-lines"></i>
            <p>Kết quả sẽ hiện ở đây.</p>
          </div>
        </div>
      </div>`;

    const textarea = $('tts-text');
    if (textarea) {
      textarea.addEventListener('input', () => {
        const counter = $('tts-count');
        if (counter) counter.textContent = String(textarea.value.length);
      });
    }

    const select = $('tts-voice');
    if (select) select.addEventListener('change', updateCloneWarning);

    const button = $('tts-generate');
    if (button) button.addEventListener('click', generate);

    loadVoices();
  }

  function renderVoicePicker() {
    const select = $('tts-voice');
    if (!select) return;

    let html = '';

    if (state.presets.length) {
      html += '<optgroup label="Giọng dựng sẵn">';
      for (const preset of state.presets) {
        html += `<option value="preset:${escapeHtml(preset.id)}">${escapeHtml(preset.label)}</option>`;
      }
      html += '</optgroup>';
    }

    if (state.corpusCloningAllowed && state.cloneable.length) {
      html += '<optgroup label="Giọng nhân bản từ kho đóng góp (đã có đồng ý)">';
      for (const item of state.cloneable) {
        const label = `${item.speaker} — ${item.province} (${item.title})`;
        html += `<option value="clone:${escapeHtml(item.id)}">${escapeHtml(label)}</option>`;
      }
      html += '</optgroup>';
    }

    if (!html) {
      html = '<option value="">Chưa có giọng nào khả dụng</option>';
    }

    select.innerHTML = html;
    updateCloneWarning();
  }

  function updateCloneWarning() {
    const select = $('tts-voice');
    const warning = $('tts-clone-warning');
    if (!select || !warning) return;
    warning.hidden = !String(select.value || '').startsWith('clone:');
  }

  // ------------------------------------------------------------------
  // Tạo giọng
  // ------------------------------------------------------------------

  async function generate() {
    if (state.busy) return;

    const text = ($('tts-text') || {}).value || '';
    const selection = ($('tts-voice') || {}).value || '';

    if (!text.trim()) {
      setStatus('Vui lòng nhập nội dung cần đọc.', 'error');
      return;
    }
    if (!selection) {
      setStatus('Vui lòng chọn giọng đọc.', 'error');
      return;
    }

    const isClone = selection.startsWith('clone:');
    const value = selection.slice(selection.indexOf(':') + 1);

    state.busy = true;
    const button = $('tts-generate');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo…';
    }
    setStatus('Đang tổng hợp giọng nói. Trên máy chủ CPU việc này có thể mất vài chục giây…', 'info');

    try {
      const payload = isClone
        ? { text: text.trim(), sourceAudioId: value }
        : { text: text.trim(), voice: value };

      const data = await window.apiJson(isClone ? '/api/tts/clone' : '/api/tts/speak', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      renderResult(data, text.trim(), isClone);
      setStatus(
        data.cached ? 'Lấy từ bộ nhớ đệm.' : `Hoàn tất sau ${data.seconds} giây.`,
        'success'
      );
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      state.busy = false;
      if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Tạo giọng nói';
      }
    }
  }

  function renderResult(data, text, isClone) {
    const container = $('tts-result');
    if (!container) return;

    const sourceLine = isClone && data.source
      ? `<p class="tts-result-source">Giọng mẫu: <strong>${escapeHtml(data.source.speaker)}</strong> — ${escapeHtml(data.source.title)}</p>`
      : '';

    container.innerHTML = `
      <div class="tts-result-filled">
        <p class="tts-result-text">"${escapeHtml(text)}"</p>
        ${sourceLine}
        <audio controls autoplay src="${escapeHtml(data.url)}" class="tts-audio"></audio>
        <a class="tts-download" href="${escapeHtml(data.url)}" download>
          <i class="fas fa-download"></i> Tải tệp WAV
        </a>
      </div>`;
  }

  // ------------------------------------------------------------------
  // Khởi động
  // ------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', loadStatus);
  document.addEventListener('gns:auth-changed', () => {
    if (state.ready) renderShell();
  });

  state.reload = () => { loadStatus(); };
})();

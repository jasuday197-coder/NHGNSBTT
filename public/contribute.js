/* ==========================================================================
   CẦN ĐÓNG GÓP (contribute.js)
   Chỉ rõ tỉnh nào đang trống, thiếu gì, và mở sẵn biểu mẫu đúng tỉnh đó.
   Cũng chịu trách nhiệm dựng các <select> của biểu mẫu đóng góp từ
   /api/filters — trước đây danh mục gõ cứng trong HTML lệch với kiểm tra
   ở máy chủ nên 3/5 nhóm tuổi bị từ chối im lặng.
   ========================================================================== */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = { gaps: null, allowed: null };
  window.GNS_CONTRIBUTE = state;

  function esc(t) {
    return String(t === null || t === undefined ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const LEVEL_LABEL = {
    critical: 'Cấp thiết',
    high: 'Rất cần',
    medium: 'Cần',
    low: 'Nên có'
  };

  // ------------------------------------------------------------------
  // Đồng bộ danh mục cho biểu mẫu đóng góp
  // ------------------------------------------------------------------

  async function syncFormOptions() {
    let data;
    try {
      data = await window.apiJson('/api/filters');
    } catch (_) {
      return; // giữ nguyên option có sẵn trong HTML
    }
    state.allowed = data.allowed;
    if (!data.allowed) return;

    const fill = (id, list, placeholder) => {
      const sel = $(id);
      if (!sel) return;
      const current = sel.value;
      sel.innerHTML =
        (placeholder ? `<option value="">${esc(placeholder)}</option>` : '') +
        list.map(o => {
          const value = typeof o === 'string' ? o : o.value;
          const label = typeof o === 'string' ? o : o.label;
          return `<option value="${esc(value)}">${esc(label)}</option>`;
        }).join('');
      if (current) sel.value = current;
    };

    fill('contrib-province', data.allowed.provinces, 'Chọn tỉnh/thành');
    fill('contrib-age', data.allowed.ageGroups, 'Chọn nhóm tuổi');
    fill('contrib-gender', data.allowed.genders, '');
    fill('contrib-topic', data.allowed.topics, 'Chọn chủ đề');
  }

  state.syncFormOptions = syncFormOptions;

  // ------------------------------------------------------------------
  // Trang "Cần đóng góp"
  // ------------------------------------------------------------------

  async function render() {
    const host = $('contribute-panel');
    if (!host) return;
    host.innerHTML = '<div class="archive-empty"><i class="fas fa-spinner fa-spin"></i><p>Đang phân tích kho…</p></div>';

    try {
      state.gaps = await window.apiJson('/api/gaps');
    } catch (err) {
      host.innerHTML = `<div class="archive-empty"><i class="fas fa-triangle-exclamation"></i><p>${esc(err.message)}</p></div>`;
      return;
    }

    const { targets, provinces } = state.gaps;
    const empty = provinces.filter(p => p.records === 0);

    const banner = empty.length
      ? `<div class="gap-banner critical">
           <i class="fas fa-circle-exclamation"></i>
           <div>
             <strong>${empty.length} tỉnh chưa có bản ghi nào:
             ${empty.map(p => esc(p.province)).join(', ')}</strong>
             <p>Một kho phương ngữ thiếu hẳn một tỉnh thì không dùng để so sánh vùng được. Đây là chỗ cần người đóng góp nhất.</p>
           </div>
         </div>`
      : `<div class="gap-banner ok">
           <i class="fas fa-circle-check"></i>
           <div><strong>Cả 6 tỉnh đều đã có bản ghi.</strong>
           <p>Việc còn lại là tăng số giọng và phủ đủ nhóm tuổi, chủ đề.</p></div>
         </div>`;

    const cards = provinces.map(p => {
      const rank = p.records === 0 ? 'critical' : (p.completion < 30 ? 'high' : (p.completion < 70 ? 'medium' : 'low'));
      const nam = p.genders['Nam'] || 0;
      const nu = p.genders['Nữ'] || 0;

      return `
        <article class="gap-card ${rank}">
          <header class="gap-card-head">
            <div>
              <h3>${esc(p.province)}</h3>
              <span class="gap-group">${esc(p.dialectGroup)}</span>
            </div>
            <div class="gap-pct" title="Mức hoàn thành so với mục tiêu tối thiểu">
              ${p.completion}%
            </div>
          </header>

          <div class="gap-progress"><span style="width:${p.completion}%"></span></div>

          <ul class="gap-figures">
            <li><strong>${p.records}</strong>/${targets.records} bản ghi</li>
            <li><strong>${p.speakers}</strong>/${targets.speakers} người nói</li>
            <li><strong>${p.minutes}</strong>/${targets.minutes} phút</li>
            <li title="Nam / Nữ">${nam} nam · ${nu} nữ</li>
          </ul>

          <ul class="gap-needs">
            ${p.needs.slice(0, 5).map(n => `
              <li class="lv-${n.level}">
                <span class="gap-lv">${LEVEL_LABEL[n.level] || n.level}</span>
                ${esc(n.text)}
              </li>`).join('')}
            ${p.needs.length > 5 ? `<li class="gap-more">… và ${p.needs.length - 5} mục khác</li>` : ''}
          </ul>

          <button class="btn-gap-contribute" onclick="window.GNS_CONTRIBUTE.startFor('${esc(p.province)}')">
            <i class="fas fa-microphone"></i> Đóng góp cho ${esc(p.province)}
          </button>
        </article>`;
    }).join('');

    host.innerHTML = `
      ${banner}
      <p class="gap-note">
        Mục tiêu tối thiểu mỗi tỉnh: <strong>${targets.records} bản ghi</strong>,
        <strong>${targets.speakers} người nói khác nhau</strong>,
        <strong>${targets.minutes} phút</strong> tiếng nói.
        Đây là ngưỡng đủ để bắt đầu phân tích, không phải đích cuối.
      </p>
      <div class="gap-grid">${cards}</div>`;
  }

  state.render = render;

  /** Mở biểu mẫu đóng góp, điền sẵn tỉnh đang thiếu. */
  function startFor(province) {
    if (window.GNS_AUTH && !window.GNS_AUTH.requireLogin('Bạn cần đăng nhập để đóng góp bản ghi âm.')) {
      return;
    }

    if (typeof window.switchTab === 'function') window.switchTab('map-view');

    setTimeout(() => {
      const fab = document.getElementById('open-contribute-fab');
      if (fab) fab.click();

      setTimeout(() => {
        const sel = $('contrib-province');
        if (sel) {
          sel.value = province;
          sel.dispatchEvent(new Event('change'));
        }
        const title = $('contrib-title');
        if (title) title.focus();
      }, 350);
    }, 200);
  }

  state.startFor = startFor;

  // ------------------------------------------------------------------
  // Khối kêu gọi trên trang chủ
  // ------------------------------------------------------------------

  async function renderHomeCallout() {
    const host = $('home-gap-callout');
    if (!host) return;

    let data = state.gaps;
    if (!data) {
      try {
        data = await window.apiJson('/api/gaps');
        state.gaps = data;
      } catch (_) {
        return; // im lặng, đây chỉ là khối phụ trên trang chủ
      }
    }

    const empty = data.provinces.filter(p => p.records === 0);
    const thin = data.provinces.filter(p => p.records > 0 && p.completion < 40);

    // Không thiếu gì thì không làm phiền người xem
    if (!empty.length && !thin.length) return;

    const headline = empty.length
      ? `${empty.map(p => esc(p.province)).join(', ')} chưa có bản ghi nào`
      : `${thin.length} tỉnh còn rất ít dữ liệu`;

    const chips = data.provinces
      .filter(p => p.completion < 100)
      .slice(0, 6)
      .map(p => `
        <button class="home-gap-chip ${p.records === 0 ? 'empty' : ''}"
                onclick="window.GNS_CONTRIBUTE.startFor('${esc(p.province)}')">
          ${esc(p.province)}
          <span>${p.records === 0 ? 'chưa có' : p.completion + '%'}</span>
        </button>`).join('');

    host.innerHTML = `
      <div class="home-gap-inner">
        <div class="home-gap-text">
          <span class="home-gap-tag"><i class="fas fa-hand-holding-heart"></i> Kho đang cần</span>
          <h3>${headline}</h3>
          <p>Mỗi bản ghi bạn gửi giúp giữ lại một cách nói đang mất dần. Chọn tỉnh để đóng góp đúng chỗ cần nhất.</p>
        </div>
        <div class="home-gap-chips">${chips}</div>
        <button class="home-gap-more" onclick="switchTab('contribute-view')">
          Xem chi tiết còn thiếu gì <i class="fas fa-arrow-right"></i>
        </button>
      </div>`;
    host.style.display = '';
  }

  state.renderHomeCallout = renderHomeCallout;

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      syncFormOptions();
      renderHomeCallout();
    }, 400);
  });
})();

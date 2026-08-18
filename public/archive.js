/* ==========================================================================
   KHO NGỮ LIỆU (archive.js)
   Duyệt / tìm kiếm / lọc / phân trang, trang riêng từng bản ghi,
   độ phủ dữ liệu và khu vực tải về cho nghiên cứu.
   Nạp sau app.js vì dùng chung switchTab, formatTime.
   ========================================================================== */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const state = {
    query: { q: '', province: '', topic: '', ageGroup: '', gender: '', sort: 'newest', page: 1, limit: 12 },
    filters: null,
    result: null,
    loading: false
  };

  window.GNS_ARCHIVE = state;

  function esc(text) {
    return String(text === null || text === undefined ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const fmtTime = (s) => (typeof window.formatTime === 'function' && s)
    ? window.formatTime(Math.round(s)) : (s ? Math.round(s) + 's' : '—');

  // ------------------------------------------------------------------
  // Tải dữ liệu
  // ------------------------------------------------------------------

  async function loadFilters() {
    if (state.filters) return state.filters;
    try {
      state.filters = await window.apiJson('/api/filters');
    } catch (_) {
      state.filters = { provinces: [], topics: [], ageGroups: [], genders: [], licenseLabels: {} };
    }
    return state.filters;
  }

  async function search(patch = {}) {
    Object.assign(state.query, patch);
    if (!('page' in patch)) state.query.page = 1;

    state.loading = true;
    renderResults();

    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(state.query)) {
      if (v !== '' && v !== null && v !== undefined) params.set(k, v);
    }

    try {
      state.result = await window.apiJson(`/api/audio?${params}`);
    } catch (err) {
      state.result = { items: [], total: 0, totalPages: 1, page: 1, error: err.message };
    }
    state.loading = false;
    renderResults();
  }

  state.search = search;

  // ------------------------------------------------------------------
  // Giao diện duyệt kho
  // ------------------------------------------------------------------

  async function initArchiveView() {
    const host = $('archive-panel');
    if (!host) return;

    const f = await loadFilters();
    const opts = (list, current) => ['<option value="">Tất cả</option>']
      .concat(list.map(o => `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.value)} (${o.count})</option>`))
      .join('');

    host.innerHTML = `
      <div class="archive-toolbar">
        <div class="archive-search">
          <i class="fas fa-magnifying-glass"></i>
          <input type="search" id="archive-q" placeholder="Tìm theo tiêu đề, lời thoại, người nói, địa phương…"
                 value="${esc(state.query.q)}">
        </div>
        <div class="archive-filters">
          <select id="archive-province" aria-label="Tỉnh">${opts(f.provinces, state.query.province)}</select>
          <select id="archive-topic" aria-label="Chủ đề">${opts(f.topics, state.query.topic)}</select>
          <select id="archive-age" aria-label="Nhóm tuổi">${opts(f.ageGroups, state.query.ageGroup)}</select>
          <select id="archive-gender" aria-label="Giới tính">${opts(f.genders, state.query.gender)}</select>
          <select id="archive-sort" aria-label="Sắp xếp">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title">Theo tên</option>
            <option value="duration">Dài nhất</option>
            <option value="province">Theo tỉnh</option>
          </select>
        </div>
      </div>
      <div id="archive-results"></div>`;

    const onChange = () => search({
      q: $('archive-q').value.trim(),
      province: $('archive-province').value,
      topic: $('archive-topic').value,
      ageGroup: $('archive-age').value,
      gender: $('archive-gender').value,
      sort: $('archive-sort').value
    });

    let debounce;
    $('archive-q').addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(onChange, 350);
    });
    ['archive-province', 'archive-topic', 'archive-age', 'archive-gender', 'archive-sort']
      .forEach(id => $(id).addEventListener('change', onChange));

    search({});
  }

  state.initArchiveView = initArchiveView;

  function renderResults() {
    const box = $('archive-results');
    if (!box) return;

    if (state.loading) {
      box.innerHTML = '<div class="archive-empty"><i class="fas fa-spinner fa-spin"></i><p>Đang tải…</p></div>';
      return;
    }

    const r = state.result;
    if (!r || r.error) {
      box.innerHTML = `<div class="archive-empty"><i class="fas fa-triangle-exclamation"></i><p>${esc(r && r.error || 'Không tải được dữ liệu.')}</p></div>`;
      return;
    }
    if (!r.items.length) {
      box.innerHTML = '<div class="archive-empty"><i class="fas fa-inbox"></i><p>Không tìm thấy bản ghi nào khớp bộ lọc.</p></div>';
      return;
    }

    const cards = r.items.map(item => `
      <article class="archive-card" onclick="window.GNS_ARCHIVE.openRecord('${esc(item.citationSlug)}')">
        <div class="archive-card-top">
          <h4>${esc(item.title)}</h4>
          <span class="archive-dur">${fmtTime(item.durationSeconds)}</span>
        </div>
        <p class="archive-meta">
          <i class="fas fa-location-dot"></i> ${esc(item.province || '—')}${item.locality ? ' · ' + esc(item.locality) : ''}
          &nbsp;·&nbsp; <i class="fas fa-user"></i> ${esc(item.isAnonymous ? 'Ẩn danh' : item.speaker)}
          &nbsp;·&nbsp; ${esc(item.ageGroup || '—')}
        </p>
        ${item.transcriptDialect ? `<p class="archive-quote">"${esc(item.transcriptDialect.slice(0, 130))}${item.transcriptDialect.length > 130 ? '…' : ''}"</p>` : ''}
        <div class="archive-tags">
          <span class="archive-tag">${esc(item.topic || 'Chưa phân loại')}</span>
          <span class="archive-tag lic">${esc(item.license)}</span>
          ${typeof item.sttConfidence === 'number'
            ? `<span class="archive-tag" title="Độ tin cậy nhận dạng đo từ Whisper">Nhận dạng ${item.sttConfidence}%</span>` : ''}
        </div>
      </article>`).join('');

    const from = (r.page - 1) * r.limit + 1;
    const to = Math.min(r.page * r.limit, r.total);

    box.innerHTML = `
      <p class="archive-count">Hiển thị <strong>${from}–${to}</strong> trong <strong>${r.total}</strong> bản ghi</p>
      <div class="archive-grid">${cards}</div>
      ${renderPager(r)}`;
  }

  function renderPager(r) {
    if (r.totalPages <= 1) return '';
    const btn = (page, label, disabled) =>
      `<button class="archive-page ${disabled ? 'disabled' : ''}" ${disabled ? 'disabled' : ''}
        onclick="window.GNS_ARCHIVE.search({page:${page}})">${label}</button>`;
    return `
      <div class="archive-pager">
        ${btn(r.page - 1, '<i class="fas fa-chevron-left"></i>', r.page <= 1)}
        <span>Trang ${r.page} / ${r.totalPages}</span>
        ${btn(r.page + 1, '<i class="fas fa-chevron-right"></i>', r.page >= r.totalPages)}
      </div>`;
  }

  // ------------------------------------------------------------------
  // Trang riêng từng bản ghi (permalink /ban-ghi/<slug>)
  // ------------------------------------------------------------------

  async function openRecord(slug) {
    if (!slug) return;
    if (typeof window.switchTab === 'function') window.switchTab('record-view', { fromRouter: true });
    history.pushState({ slug }, '', `/ban-ghi/${slug}`);
    document.title = 'Đang tải bản ghi…';
    await renderRecord(slug);
  }

  state.openRecord = openRecord;

  async function renderRecord(slug) {
    const host = $('record-panel');
    if (!host) return;
    host.innerHTML = '<div class="archive-empty"><i class="fas fa-spinner fa-spin"></i><p>Đang tải bản ghi…</p></div>';

    let data;
    try {
      data = await window.apiJson(`/api/audio/${encodeURIComponent(slug)}`);
    } catch (err) {
      host.innerHTML = `<div class="archive-empty"><i class="fas fa-circle-xmark"></i><p>${esc(err.message)}</p>
        <button class="btn-archive-back" onclick="window.GNS_ARCHIVE.backToArchive()">Về kho ngữ liệu</button></div>`;
      return;
    }

    const r = data.record;
    document.title = `${r.title} — Ngân hàng Giọng nói Số`;

    const row = (label, value) => value
      ? `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>` : '';

    const player = r.audioUrl
      ? `<audio controls src="${esc(r.audioUrl)}" class="record-audio"></audio>`
      : (r.youtube_url
        ? `<p class="record-note"><i class="fab fa-youtube"></i> Bản ghi từ YouTube:
           <a href="${esc(r.youtube_url)}" target="_blank" rel="noopener">mở nguồn</a></p>`
        : '<p class="record-note">Bản ghi này chưa có tệp âm thanh.</p>');

    host.innerHTML = `
      <button class="btn-archive-back" onclick="window.GNS_ARCHIVE.backToArchive()">
        <i class="fas fa-arrow-left"></i> Kho ngữ liệu
      </button>

      <h2 class="record-title">${esc(r.title)}</h2>
      <p class="record-sub">
        <i class="fas fa-location-dot"></i> ${esc(r.province || '—')}${r.locality ? ' · ' + esc(r.locality) : ''}
        &nbsp;·&nbsp; ${esc(r.dialectGroup || '')}
      </p>

      ${player}

      ${r.transcriptDialect ? `
        <section class="record-block">
          <h3>Lời thoại — phương ngữ</h3>
          <p class="record-text dialect">${esc(r.transcriptDialect)}</p>
        </section>` : ''}
      ${r.transcriptStandard ? `
        <section class="record-block">
          <h3>Tiếng Việt phổ thông</h3>
          <p class="record-text">${esc(r.transcriptStandard)}</p>
        </section>` : ''}
      ${r.ipa ? `
        <section class="record-block">
          <h3>Phiên âm quốc tế (IPA)</h3>
          <p class="record-text ipa">${esc(r.ipa)}</p>
        </section>` : ''}

      <section class="record-block">
        <h3>Siêu dữ liệu</h3>
        <table class="record-table">
          ${row('Người nói', r.isAnonymous ? 'Ẩn danh' : r.speaker)}
          ${row('Nhóm tuổi', r.ageGroup)}
          ${row('Giới tính', r.gender)}
          ${row('Chủ đề', r.topic)}
          ${row('Ngày ghi âm', r.recordedAt)}
          ${row('Thời lượng', r.durationSeconds ? fmtTime(r.durationSeconds) : '')}
          ${row('Tần số lấy mẫu', r.sampleRate ? (r.sampleRate / 1000).toFixed(1) + ' kHz' : '')}
          ${row('Số kênh', r.channels === 1 ? 'Mono' : (r.channels === 2 ? 'Stereo' : ''))}
          ${row('Người thu thập', r.collector)}
          ${row('Thiết bị ghi', r.device)}
          ${typeof r.sttConfidence === 'number'
            ? `<tr><th>Độ tin cậy nhận dạng</th><td>${r.sttConfidence}%
               <em style="opacity:.65">— đo từ log-xác suất của Whisper</em></td></tr>` : ''}
        </table>
      </section>

      <section class="record-block">
        <h3>Giấy phép</h3>
        <p class="record-text">
          ${data.license
            ? (data.license.url
              ? `<a href="${esc(data.license.url)}" target="_blank" rel="noopener">${esc(data.license.label)}</a>`
              : esc(data.license.label))
            : esc(r.license)}
        </p>
      </section>

      <section class="record-block">
        <h3>Trích dẫn bản ghi này</h3>
        <div class="record-cite">
          <code id="cite-text">${esc(data.citation.text)}</code>
          <button onclick="window.GNS_ARCHIVE.copyCite('cite-text')"><i class="fas fa-copy"></i> Sao chép</button>
        </div>
        <details class="record-bibtex">
          <summary>BibTeX</summary>
          <div class="record-cite">
            <code id="cite-bibtex">${esc(data.citation.bibtex)}</code>
            <button onclick="window.GNS_ARCHIVE.copyCite('cite-bibtex')"><i class="fas fa-copy"></i> Sao chép</button>
          </div>
        </details>
      </section>`;
  }

  state.renderRecord = renderRecord;

  function backToArchive() {
    // Router lo phần URL và tiêu đề
    if (window.GNS_ROUTER) window.GNS_ROUTER.go('/kho-ngu-lieu');
    else if (typeof window.switchTab === 'function') window.switchTab('archive-view');
  }

  state.backToArchive = backToArchive;

  function copyCite(id) {
    const el = $(id);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent)
      .then(() => alert('Đã sao chép vào clipboard.'))
      .catch(() => alert('Không sao chép được. Hãy bôi đen và copy thủ công.'));
  }

  state.copyCite = copyCite;

  // ------------------------------------------------------------------
  // Độ phủ dữ liệu — chỉ cho người đóng góp biết chỗ nào còn thiếu
  // ------------------------------------------------------------------

  async function renderCoverage() {
    const host = $('coverage-panel');
    if (!host) return;

    let data;
    try {
      data = await window.apiJson('/api/coverage');
    } catch (_) {
      host.innerHTML = '';
      return;
    }

    const max = Math.max(1, ...data.provinces.map(p => p.records));
    const rows = data.provinces.map(p => {
      const pct = Math.round((p.records / max) * 100);
      const gap = p.records === 0;
      return `
        <div class="coverage-row ${gap ? 'gap' : ''}">
          <span class="coverage-name">${esc(p.province)}</span>
          <span class="coverage-bar"><span style="width:${pct}%"></span></span>
          <span class="coverage-num">${p.records} bản ghi · ${p.words} từ</span>
          ${gap ? '<span class="coverage-flag">chưa có bản ghi nào</span>' : ''}
        </div>`;
    }).join('');

    host.innerHTML = `
      <h3><i class="fas fa-chart-simple"></i> Độ phủ dữ liệu theo tỉnh</h3>
      <p class="coverage-hint">Những tỉnh còn ít bản ghi là nơi kho đang cần đóng góp nhất.</p>
      ${rows}`;
  }

  state.renderCoverage = renderCoverage;

  // ------------------------------------------------------------------
  // Bản ghi trùng lặp (khu quản trị)
  // ------------------------------------------------------------------

  async function renderDuplicates() {
    const host = $('dup-panel');
    if (!host) return;
    host.innerHTML = '<div class="dup-empty"><i class="fas fa-spinner fa-spin"></i> Đang rà soát…</div>';

    let data;
    try {
      data = await window.apiJson('/api/admin/duplicates');
    } catch (err) {
      host.innerHTML = `<div class="dup-empty">${esc(err.message)}</div>`;
      return;
    }

    if (!data.groups.length) {
      host.innerHTML = '<div class="dup-empty"><i class="fas fa-circle-check" style="color:var(--color-success)"></i> Không phát hiện bản ghi trùng lặp nào.</div>';
      return;
    }

    const total = data.groups.reduce((sum, g) => sum + g.count, 0);
    host.innerHTML = `
      <p style="font-size:13px;color:var(--text-muted);margin:0 0 14px">
        Phát hiện <strong>${data.groups.length}</strong> nhóm nghi trùng, tổng <strong>${total}</strong> bản ghi.
        Đối chiếu theo tiêu đề đã chuẩn hoá + tỉnh + thời lượng. Hãy nghe lại rồi xoá bản thừa ở tab kiểm duyệt.
      </p>
      ${data.groups.map(g => `
        <div class="dup-group">
          <div class="dup-group-head"><i class="fas fa-clone"></i> ${g.count} bản ghi giống nhau</div>
          ${g.records.map(r => `
            <div class="dup-item">
              <strong>${esc(r.title)}</strong>
              <span class="dup-badge ${r.status === 'approved' ? 'approved' : 'pending'}">${r.status === 'approved' ? 'đã duyệt' : 'chờ duyệt'}</span>
              <span>${esc(r.province || '—')}</span>
              <span>${r.durationSeconds ? fmtTime(r.durationSeconds) : 'chưa đo thời lượng'}</span>
              ${r.citationSlug ? `<a href="/ban-ghi/${esc(r.citationSlug)}" target="_blank" rel="noopener">mở trang riêng</a>` : ''}
            </div>`).join('')}
        </div>`).join('')}`;
  }

  state.renderDuplicates = renderDuplicates;

  // ------------------------------------------------------------------
  // Khởi động: nếu vào thẳng permalink thì mở luôn bản ghi đó
  // ------------------------------------------------------------------

  // Định tuyến do router.js lo; ở đây chỉ nạp phần độ phủ.
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderCoverage, 300);
  });
})();

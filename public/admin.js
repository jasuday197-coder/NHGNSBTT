/* ==========================================================================
   BẢNG ĐIỀU KHIỂN QUẢN TRỊ (admin.js)
   Tổng quan · Người dùng · Nhật ký hệ thống · Nhật ký giọng nói AI · Sức khoẻ
   ========================================================================== */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = { users: null, userQuery: { q: '', role: '', status: '', page: 1 } };
  window.GNS_ADMIN = state;

  function esc(t) {
    return String(t === null || t === undefined ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const mb = (b) => b === null || b === undefined ? '—' : (b / 1048576).toFixed(1) + ' MB';
  const gb = (b) => b === null || b === undefined ? '—' : (b / 1073741824).toFixed(1) + ' GB';

  function duration(sec) {
    if (!sec) return '—';
    const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
    if (d) return `${d} ngày ${h} giờ`;
    if (h) return `${h} giờ ${m} phút`;
    return `${m} phút`;
  }

  function when(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ------------------------------------------------------------------
  // Tổng quan
  // ------------------------------------------------------------------

  async function renderDashboard() {
    const host = $('admin-dashboard-panel');
    if (!host) return;
    host.innerHTML = '<div class="adm-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải…</div>';

    let d;
    try {
      d = await window.apiJson('/api/admin/dashboard');
    } catch (err) {
      host.innerHTML = `<div class="adm-loading">${esc(err.message)}</div>`;
      return;
    }

    const tile = (label, value, sub, tone) => `
      <div class="adm-tile ${tone || ''}">
        <span class="adm-tile-label">${esc(label)}</span>
        <strong class="adm-tile-value">${esc(value)}</strong>
        ${sub ? `<span class="adm-tile-sub">${esc(sub)}</span>` : ''}
      </div>`;

    // Biểu đồ cột 30 ngày, dựng bằng div nên không cần thư viện
    const max = Math.max(1, ...d.daily.map(x => x.count));
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i -= 1) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      const hit = d.daily.find(x => x.day === key);
      const n = hit ? hit.count : 0;
      days.push(`<span class="adm-bar" title="${key}: ${n} bản ghi"
                   style="height:${Math.max(3, (n / max) * 100)}%"></span>`);
    }

    host.innerHTML = `
      <div class="adm-tiles">
        ${tile('Chờ duyệt', d.audio.pending, d.audio.pending ? 'cần xử lý' : 'không còn tồn', d.audio.pending ? 'warn' : '')}
        ${tile('Bị báo cáo', d.audio.reported, d.audio.reported ? 'cần xem' : 'không có', d.audio.reported ? 'danger' : '')}
        ${tile('Đã duyệt', d.audio.approved, `${d.audio.speakers} người nói · ${d.audio.minutes} phút`)}
        ${tile('Cho nhân bản giọng', d.audio.cloneable, 'đã có đồng ý', d.audio.cloneable ? 'purple' : '')}
        ${tile('Tài khoản', d.users.total, `${d.users.admins} quản trị · ${d.users.disabled} bị khoá`)}
        ${tile('Đang đăng nhập', d.users.activeSessions, `${d.users.active7d} hoạt động 7 ngày`)}
        ${tile('Từ điển', d.lexicon.total, `${d.lexicon.withIpa} mục có IPA`)}
        ${tile('Lượt tổng hợp giọng', d.tts.total, `${d.tts.clones} lượt nhân bản · ${d.tts.last7d} trong 7 ngày`)}
      </div>

      <section class="adm-block">
        <h3>Đóng góp 30 ngày gần nhất</h3>
        <div class="adm-chart">${days.join('')}</div>
      </section>

      <section class="adm-block">
        <h3>Hoạt động gần đây</h3>
        ${d.recentActivity.length ? `
          <table class="adm-table">
            <thead><tr><th>Thời điểm</th><th>Người</th><th>Hành động</th><th>Chi tiết</th></tr></thead>
            <tbody>${d.recentActivity.map(a => `
              <tr>
                <td class="adm-dim">${esc(when(a.created_at))}</td>
                <td><strong>${esc(a.username || '—')}</strong></td>
                <td><code>${esc(a.action)}</code></td>
                <td class="adm-dim">${esc(a.detail || a.target_id || '')}</td>
              </tr>`).join('')}</tbody>
          </table>` : '<p class="adm-dim">Chưa có hoạt động nào.</p>'}
      </section>`;
  }

  // ------------------------------------------------------------------
  // Người dùng
  // ------------------------------------------------------------------

  async function renderUsers() {
    const host = $('admin-users-panel');
    if (!host) return;

    if (!host.dataset.ready) {
      host.innerHTML = `
        <div class="adm-toolbar">
          <input type="search" id="adm-user-q" placeholder="Tìm theo tên đăng nhập, email, họ tên…">
          <select id="adm-user-role">
            <option value="">Mọi quyền</option>
            <option value="admin">Quản trị viên</option>
            <option value="user">Thành viên</option>
          </select>
          <select id="adm-user-status">
            <option value="">Mọi trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="disabled">Đã khoá</option>
          </select>
        </div>
        <div id="adm-user-list"></div>`;
      host.dataset.ready = '1';

      let timer;
      $('adm-user-q').addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => loadUsers({ q: $('adm-user-q').value.trim(), page: 1 }), 300);
      });
      $('adm-user-role').addEventListener('change', () => loadUsers({ role: $('adm-user-role').value, page: 1 }));
      $('adm-user-status').addEventListener('change', () => loadUsers({ status: $('adm-user-status').value, page: 1 }));
    }

    loadUsers({});
  }

  async function loadUsers(patch) {
    Object.assign(state.userQuery, patch);
    const list = $('adm-user-list');
    if (!list) return;
    list.innerHTML = '<div class="adm-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải…</div>';

    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(state.userQuery)) if (v) params.set(k, v);

    let d;
    try {
      d = await window.apiJson(`/api/admin/users?${params}`);
    } catch (err) {
      list.innerHTML = `<div class="adm-loading">${esc(err.message)}</div>`;
      return;
    }
    state.users = d;

    if (!d.items.length) {
      list.innerHTML = '<div class="adm-loading">Không có tài khoản nào khớp.</div>';
      return;
    }

    list.innerHTML = `
      <p class="adm-dim" style="margin:0 0 10px">Tổng ${d.total} tài khoản</p>
      <table class="adm-table adm-users">
        <thead><tr>
          <th>Tài khoản</th><th>Quyền</th><th>Trạng thái</th>
          <th>Đóng góp</th><th>Đăng nhập gần nhất</th><th>Thao tác</th>
        </tr></thead>
        <tbody>${d.items.map(u => renderUserRow(u, d.currentUserId)).join('')}</tbody>
      </table>`;
  }

  function renderUserRow(u, currentUserId) {
    const isSelf = u.id === currentUserId;
    const actions = [];

    if (!isSelf) {
      actions.push(u.role === 'admin'
        ? `<button class="adm-btn" onclick="window.GNS_ADMIN.updateUser(${u.id},{role:'user'})">Hạ xuống thành viên</button>`
        : `<button class="adm-btn primary" onclick="window.GNS_ADMIN.updateUser(${u.id},{role:'admin'})">Nâng lên quản trị</button>`);

      actions.push(u.status === 'active'
        ? `<button class="adm-btn danger" onclick="window.GNS_ADMIN.updateUser(${u.id},{status:'disabled'})">Khoá</button>`
        : `<button class="adm-btn" onclick="window.GNS_ADMIN.updateUser(${u.id},{status:'active'})">Mở khoá</button>`);
    }

    if (u.isLocked) {
      actions.push(`<button class="adm-btn" onclick="window.GNS_ADMIN.updateUser(${u.id},{unlock:true})">Gỡ khoá đăng nhập</button>`);
    }
    if (u.activeSessions > 0) {
      actions.push(`<button class="adm-btn" onclick="window.GNS_ADMIN.revokeSessions(${u.id})">Đăng xuất mọi thiết bị</button>`);
    }

    return `
      <tr class="${u.status === 'disabled' ? 'adm-row-off' : ''}">
        <td>
          <strong>${esc(u.username)}</strong>${isSelf ? ' <span class="adm-tag">bạn</span>' : ''}
          ${u.fullName ? `<br><span class="adm-dim">${esc(u.fullName)}</span>` : ''}
          ${u.email ? `<br><span class="adm-dim">${esc(u.email)}</span>` : ''}
        </td>
        <td><span class="adm-badge ${u.role}">${u.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</span></td>
        <td>
          <span class="adm-badge ${u.status}">${u.status === 'active' ? 'Hoạt động' : 'Đã khoá'}</span>
          ${u.isLocked ? '<br><span class="adm-warn">tạm khoá do sai mật khẩu</span>' : ''}
          ${u.activeSessions ? `<br><span class="adm-dim">${u.activeSessions} phiên</span>` : ''}
        </td>
        <td>${u.contributions}</td>
        <td class="adm-dim">${esc(when(u.lastLoginAt))}</td>
        <td><div class="adm-actions">${actions.join('') || '<span class="adm-dim">—</span>'}</div></td>
      </tr>`;
  }

  async function updateUser(id, patch) {
    const label = patch.role ? 'đổi quyền' : (patch.status === 'disabled' ? 'khoá tài khoản' : (patch.status ? 'mở khoá' : 'gỡ khoá đăng nhập'));
    if (!confirm(`Xác nhận ${label} cho tài khoản #${id}?`)) return;

    try {
      const d = await window.apiJson('/api/admin/users/update', {
        method: 'POST', body: JSON.stringify({ id, ...patch })
      });
      alert(d.message);
      loadUsers({});
    } catch (err) {
      alert(err.message);
    }
  }

  async function revokeSessions(id) {
    if (!confirm(`Đăng xuất tài khoản #${id} khỏi mọi thiết bị?`)) return;
    try {
      const d = await window.apiJson('/api/admin/users/revoke-sessions', {
        method: 'POST', body: JSON.stringify({ id })
      });
      alert(d.message);
      loadUsers({});
    } catch (err) {
      alert(err.message);
    }
  }

  state.updateUser = updateUser;
  state.revokeSessions = revokeSessions;

  // ------------------------------------------------------------------
  // Sức khoẻ hệ thống
  // ------------------------------------------------------------------

  async function renderSystem() {
    const host = $('admin-system-panel');
    if (!host) return;
    host.innerHTML = '<div class="adm-loading"><i class="fas fa-spinner fa-spin"></i> Đang kiểm tra…</div>';

    let d;
    try {
      d = await window.apiJson('/api/admin/system');
    } catch (err) {
      host.innerHTML = `<div class="adm-loading">${esc(err.message)}</div>`;
      return;
    }

    const row = (k, v) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`;
    const dot = (ok, text) => `<span class="adm-dot ${ok ? 'ok' : 'bad'}"></span>${esc(text)}`;
    const disk = d.storage.disk;

    host.innerHTML = `
      <div class="adm-sys-grid">
        <section class="adm-block">
          <h3>Ứng dụng</h3>
          <table class="adm-table adm-kv">
            ${row('Môi trường', esc(d.app.env))}
            ${row('Node.js', esc(d.app.nodeVersion))}
            ${row('Thời gian chạy', duration(d.app.uptimeSeconds))}
            ${row('Bộ nhớ tiến trình', mb(d.app.memoryRssBytes))}
          </table>
        </section>

        <section class="adm-block">
          <h3>Cơ sở dữ liệu</h3>
          <table class="adm-table adm-kv">
            ${row('Kết nối', dot(d.database.ok, d.database.ok ? 'Bình thường' : 'Mất kết nối'))}
            ${row('Phiên bản', esc(d.database.version || '—'))}
            ${row('Dung lượng', mb(d.database.sizeBytes))}
            ${d.database.error ? row('Lỗi', `<span class="adm-warn">${esc(d.database.error)}</span>`) : ''}
          </table>
        </section>

        <section class="adm-block">
          <h3>Máy chủ</h3>
          <table class="adm-table adm-kv">
            ${row('Hệ điều hành', esc(d.host.platform))}
            ${row('CPU', `${d.host.cpus} nhân · tải ${d.host.loadAvg.join(' / ')}`)}
            ${row('RAM', `${gb(d.host.totalMemBytes - d.host.freeMemBytes)} / ${gb(d.host.totalMemBytes)} đã dùng`)}
            ${row('Uptime máy', duration(d.host.uptimeSeconds))}
          </table>
        </section>

        <section class="adm-block">
          <h3>Lưu trữ</h3>
          <table class="adm-table adm-kv">
            ${row('Tệp âm thanh', `${d.storage.uploads.files} tệp · ${mb(d.storage.uploads.bytes)}`)}
            ${row('Cache giọng AI', `${d.storage.ttsCache.files} tệp · ${mb(d.storage.ttsCache.bytes)}`)}
            ${disk ? row('Đĩa', `
              <div class="adm-meter ${disk.usedPercent > 85 ? 'hot' : ''}">
                <span style="width:${disk.usedPercent}%"></span>
              </div>
              <span class="adm-dim">${disk.usedPercent}% đã dùng · còn ${gb(disk.freeBytes)}</span>`) : ''}
          </table>
        </section>

        <section class="adm-block">
          <h3>Giọng nói AI</h3>
          <table class="adm-table adm-kv">
            ${row('Trạng thái', dot(d.tts.enabled && d.tts.service.status === 'ok',
              d.tts.enabled ? `Bật — dịch vụ ${d.tts.service.status}` : 'Đang tắt'))}
            ${row('Nhân bản từ kho', d.tts.corpusCloningAllowed
              ? '<span class="adm-warn">Đang CHO PHÉP</span>' : 'Đang tắt')}
            ${d.tts.service.model ? row('Model', esc(d.tts.service.model)) : ''}
            ${d.tts.service.model_loaded !== undefined
              ? row('Model đã nạp', d.tts.service.model_loaded ? 'Rồi' : 'Chưa (nạp khi có yêu cầu đầu tiên)') : ''}
          </table>
        </section>

        <section class="adm-block">
          <h3>Giới hạn đang áp dụng</h3>
          <table class="adm-table adm-kv">
            ${row('Body JSON tối đa', mb(d.limits.jsonBodyBytes))}
            ${row('Tải lên tối đa', mb(d.limits.uploadBodyBytes))}
            ${row('Tệp âm thanh tối đa', mb(d.limits.audioBytes))}
            ${row('Phiên đăng nhập', `${d.limits.sessionTtlHours} giờ`)}
            ${row('Cho đăng ký mới', d.limits.allowRegistration ? 'Có' : 'Không')}
          </table>
        </section>
      </div>`;
  }

  // ------------------------------------------------------------------
  // Nhật ký
  // ------------------------------------------------------------------

  async function renderAuditLog(action) {
    const host = $('admin-audit-panel');
    if (!host) return;
    host.innerHTML = '<div class="adm-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải…</div>';

    let d;
    try {
      d = await window.apiJson('/api/admin/audit-log' + (action ? `?action=${encodeURIComponent(action)}` : ''));
    } catch (err) {
      host.innerHTML = `<div class="adm-loading">${esc(err.message)}</div>`;
      return;
    }

    host.innerHTML = `
      <div class="adm-toolbar">
        <select id="adm-audit-filter">
          <option value="">Mọi hành động (${d.items.length})</option>
          ${d.actions.map(a => `<option value="${esc(a.action)}"${a.action === action ? ' selected' : ''}>${esc(a.action)} (${a.count})</option>`).join('')}
        </select>
      </div>
      ${d.items.length ? `
        <table class="adm-table">
          <thead><tr><th>Thời điểm</th><th>Người</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th><th>IP</th></tr></thead>
          <tbody>${d.items.map(a => `
            <tr>
              <td class="adm-dim">${esc(when(a.created_at))}</td>
              <td><strong>${esc(a.username || '—')}</strong></td>
              <td><code>${esc(a.action)}</code></td>
              <td class="adm-dim">${esc(a.target_id || '')}</td>
              <td class="adm-dim">${esc(a.detail || '')}</td>
              <td class="adm-dim">${esc(a.ip || '')}</td>
            </tr>`).join('')}</tbody>
        </table>` : '<p class="adm-dim">Chưa có nhật ký nào.</p>'}`;

    const filter = $('adm-audit-filter');
    if (filter) filter.addEventListener('change', () => renderAuditLog(filter.value));
  }

  async function renderTtsLog() {
    const host = $('admin-ttslog-panel');
    if (!host) return;
    host.innerHTML = '<div class="adm-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải…</div>';

    let rows;
    try {
      rows = await window.apiJson('/api/admin/tts-log');
    } catch (err) {
      host.innerHTML = `<div class="adm-loading">${esc(err.message)}</div>`;
      return;
    }

    if (!rows.length) {
      host.innerHTML = '<p class="adm-dim">Chưa có lượt tổng hợp giọng nào.</p>';
      return;
    }

    host.innerHTML = `
      <p class="adm-dim" style="margin:0 0 10px">
        Mọi lượt tổng hợp đều được ghi lại. Lượt <strong>nhân bản</strong> ghi rõ giọng của ai đã bị dùng.
      </p>
      <table class="adm-table">
        <thead><tr><th>Thời điểm</th><th>Người dùng</th><th>Kiểu</th><th>Giọng / nguồn</th><th>Nội dung</th><th>Giây</th></tr></thead>
        <tbody>${rows.map(r => `
          <tr>
            <td class="adm-dim">${esc(when(r.created_at))}</td>
            <td><strong>${esc(r.username || '—')}</strong></td>
            <td><span class="adm-badge ${r.mode === 'clone' ? 'danger' : ''}">${r.mode === 'clone' ? 'Nhân bản' : 'Dựng sẵn'}</span></td>
            <td>${esc(r.mode === 'clone' ? `${r.source_speaker || '?'} — ${r.source_title || r.source_audio}` : (r.voice || '—'))}</td>
            <td class="adm-dim">${esc(r.text_excerpt || '')}</td>
            <td class="adm-dim">${esc(r.seconds || '—')}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  }

  // ------------------------------------------------------------------
  // Cấu hình khoá API
  // ------------------------------------------------------------------

  async function renderSettings() {
    const host = $('admin-settings-panel');
    if (!host) return;
    host.innerHTML = '<div class="adm-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải…</div>';

    let d;
    try {
      d = await window.apiJson('/api/admin/settings');
    } catch (err) {
      host.innerHTML = `<div class="adm-loading">${esc(err.message)}</div>`;
      return;
    }

    host.innerHTML = `
      <div class="adm-block">
        <h3>Khoá API dịch vụ ngoài</h3>
        <p class="adm-dim" style="margin:0 0 16px; line-height:1.6">
          Khoá được mã hoá AES-256-GCM trước khi lưu vào cơ sở dữ liệu, và
          <strong>không bao giờ gửi lại về trình duyệt</strong> — chỉ hiện dạng che.
          Nếu biến môi trường trong <code>.env</code> có giá trị thì nó được ưu tiên,
          dùng khi cần cứu hệ thống.
        </p>
        ${d.items.map(renderSettingRow).join('')}
      </div>`;

    d.items.forEach((item) => {
      const form = $(`set-form-${item.name}`);
      if (form) form.addEventListener('submit', (e) => { e.preventDefault(); saveSetting(item.name); });
    });
  }

  function renderSettingRow(item) {
    const status = item.configured
      ? `<span class="adm-badge active">Đã cấu hình</span>`
      : `<span class="adm-badge disabled">Chưa có</span>`;

    const source = item.source === 'env'
      ? '<span class="adm-warn">đang lấy từ .env — sửa ở đây sẽ không có tác dụng cho tới khi gỡ khỏi .env</span>'
      : (item.source === 'db' && item.updatedBy
        ? `<span class="adm-dim">${esc(item.updatedBy)} cập nhật ${esc(when(item.updatedAt))}</span>`
        : '');

    return `
      <div class="set-row">
        <div class="set-head">
          <div>
            <strong>${esc(item.label)}</strong> ${status}
            <p class="adm-dim" style="margin:3px 0 0">${esc(item.hint)}</p>
          </div>
          ${item.masked ? `<code class="set-mask">${esc(item.masked)}</code>` : ''}
        </div>

        <form class="set-form" id="set-form-${esc(item.name)}">
          <input type="password" id="set-input-${esc(item.name)}" autocomplete="new-password"
                 placeholder="${item.configured ? 'Dán khoá mới để thay thế…' : 'Dán khoá vào đây…'}">
          <button type="submit" class="adm-btn primary">Lưu</button>
          ${item.canTest ? `<button type="button" class="adm-btn" onclick="window.GNS_ADMIN.testSetting('${esc(item.name)}')">Kiểm tra</button>` : ''}
          ${item.configured && item.source === 'db'
            ? `<button type="button" class="adm-btn danger" onclick="window.GNS_ADMIN.clearSetting('${esc(item.name)}')">Xoá</button>` : ''}
        </form>
        <div class="set-result" id="set-result-${esc(item.name)}">${source}</div>
      </div>`;
  }

  async function saveSetting(name) {
    const input = $(`set-input-${name}`);
    const out = $(`set-result-${name}`);
    if (!input || !input.value.trim()) {
      if (out) out.innerHTML = '<span class="adm-warn">Chưa nhập gì.</span>';
      return;
    }

    out.innerHTML = '<span class="adm-dim">Đang lưu…</span>';
    try {
      const d = await window.apiJson('/api/admin/settings', {
        method: 'POST', body: JSON.stringify({ name, value: input.value.trim() })
      });
      input.value = '';
      alert(d.message);
      renderSettings();
    } catch (err) {
      out.innerHTML = `<span class="adm-warn">${esc(err.message)}</span>`;
    }
  }

  async function clearSetting(name) {
    if (!confirm('Xoá khoá này khỏi cơ sở dữ liệu?')) return;
    try {
      const d = await window.apiJson('/api/admin/settings', {
        method: 'POST', body: JSON.stringify({ name, value: '' })
      });
      alert(d.message);
      renderSettings();
    } catch (err) {
      alert(err.message);
    }
  }

  async function testSetting(name) {
    const out = $(`set-result-${name}`);
    if (out) out.innerHTML = '<span class="adm-dim"><i class="fas fa-spinner fa-spin"></i> Đang gọi thử nhà cung cấp…</span>';
    try {
      const d = await window.apiJson('/api/admin/settings/test', {
        method: 'POST', body: JSON.stringify({ name })
      });
      if (out) {
        out.innerHTML = d.ok
          ? `<span class="set-ok"><i class="fas fa-circle-check"></i> ${esc(d.message)}</span>`
          : `<span class="adm-warn"><i class="fas fa-circle-xmark"></i> ${esc(d.message)}</span>`;
      }
    } catch (err) {
      if (out) out.innerHTML = `<span class="adm-warn">${esc(err.message)}</span>`;
    }
  }

  state.renderSettings = renderSettings;
  state.clearSetting = clearSetting;
  state.testSetting = testSetting;

  state.renderDashboard = renderDashboard;
  state.renderUsers = renderUsers;
  state.renderSystem = renderSystem;
  state.renderAuditLog = renderAuditLog;
  state.renderTtsLog = renderTtsLog;
})();

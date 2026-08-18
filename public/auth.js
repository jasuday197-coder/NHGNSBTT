/* ==========================================================================
   XÁC THỰC & PHÂN QUYỀN (auth.js)
   Nạp TRƯỚC app.js. Cung cấp window.apiFetch cho mọi lời gọi API.
   ========================================================================== */

(function () {
  'use strict';

  const state = {
    user: null,
    allowRegistration: true,
    ready: false
  };

  window.GNS_AUTH = state;

  const isLoggedIn = () => Boolean(state.user);
  const isAdmin = () => Boolean(state.user && state.user.role === 'admin');

  state.isLoggedIn = isLoggedIn;
  state.isAdmin = isAdmin;

  // ------------------------------------------------------------------
  // Lớp gọi API: luôn kèm cookie phiên và header chống CSRF
  // ------------------------------------------------------------------

  async function apiFetch(url, options = {}) {
    const headers = Object.assign(
      { 'X-Requested-With': 'XMLHttpRequest' },
      options.headers || {}
    );

    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, Object.assign({}, options, {
      headers,
      credentials: 'same-origin'
    }));

    // Phiên hết hạn giữa chừng -> cập nhật lại giao diện
    if (response.status === 401 && state.user) {
      state.user = null;
      renderAuthBar();
      applyPermissions();
    }

    return response;
  }

  /** Gọi API và trả JSON; ném Error kèm thông báo từ server khi thất bại. */
  async function apiJson(url, options) {
    const response = await apiFetch(url, options);
    let payload = null;
    try {
      payload = await response.json();
    } catch (_) {
      payload = null;
    }

    if (!response.ok) {
      const message = (payload && payload.error) || `Lỗi ${response.status}`;
      throw Object.assign(new Error(message), { status: response.status });
    }
    return payload;
  }

  window.apiFetch = apiFetch;
  window.apiJson = apiJson;

  // ------------------------------------------------------------------
  // Đồng bộ trạng thái đăng nhập
  // ------------------------------------------------------------------

  async function refreshSession() {
    try {
      const data = await apiJson('/api/auth/me');
      state.user = data.user || null;
      state.allowRegistration = data.allowRegistration !== false;
    } catch (_) {
      state.user = null;
    }
    state.ready = true;
    renderAuthBar();
    applyPermissions();
    document.dispatchEvent(new CustomEvent('gns:auth-changed', { detail: state.user }));
  }

  state.refresh = refreshSession;

  // ------------------------------------------------------------------
  // Hiển thị: thanh tài khoản trên navbar
  // ------------------------------------------------------------------

  function renderAuthBar() {
    const container = document.getElementById('navbar-auth');
    if (!container) return;

    if (!state.user) {
      container.innerHTML = `
        <button class="btn-auth btn-auth-login" id="btn-open-login">
          <i class="fas fa-right-to-bracket"></i> Đăng nhập
        </button>`;
      const btn = document.getElementById('btn-open-login');
      if (btn) btn.addEventListener('click', () => openAuthModal('login'));
      return;
    }

    const roleLabel = isAdmin() ? 'Quản trị viên' : 'Thành viên';
    container.innerHTML = `
      <div class="auth-user">
        <span class="auth-user-name" title="${escapeHtml(roleLabel)}">
          <i class="fas ${isAdmin() ? 'fa-user-shield' : 'fa-user'}"></i>
          ${escapeHtml(state.user.username)}
        </span>
        <button class="btn-auth btn-auth-logout" id="btn-logout" title="Đăng xuất">
          <i class="fas fa-right-from-bracket"></i>
        </button>
      </div>`;

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
  }

  /** Ẩn/hiện các phần giao diện theo quyền hiện tại. */
  function applyPermissions() {
    document.querySelectorAll('[data-requires-auth]').forEach((el) => {
      el.style.display = isLoggedIn() ? '' : 'none';
    });
    document.querySelectorAll('[data-requires-admin]').forEach((el) => {
      el.style.display = isAdmin() ? '' : 'none';
    });

    // Rời tab Admin nếu người dùng không còn quyền
    const adminView = document.getElementById('admin-view');
    if (adminView && adminView.classList.contains('active') && !isAdmin()) {
      if (typeof window.switchTab === 'function') window.switchTab('home-view');
    }
  }

  state.applyPermissions = applyPermissions;

  function escapeHtml(text) {
    return String(text === null || text === undefined ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ------------------------------------------------------------------
  // Hộp thoại đăng nhập / đăng ký
  // ------------------------------------------------------------------

  let currentMode = 'login';

  function openAuthModal(mode = 'login') {
    currentMode = mode;
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.add('active');
    renderAuthForm();

    const firstInput = modal.querySelector('input');
    if (firstInput) firstInput.focus();
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
    setAuthError('');
  }

  state.openAuthModal = openAuthModal;
  state.closeAuthModal = closeAuthModal;

  function renderAuthForm() {
    const body = document.getElementById('auth-modal-body');
    const titleEl = document.getElementById('auth-modal-title');
    if (!body || !titleEl) return;

    const isRegister = currentMode === 'register';
    titleEl.textContent = isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập';

    body.innerHTML = `
      <form id="auth-form" autocomplete="on" novalidate>
        <label class="auth-label" for="auth-username">Tên đăng nhập</label>
        <input class="auth-input" id="auth-username" name="username" type="text"
               autocomplete="username" required maxlength="64"
               placeholder="chữ, số, dấu chấm hoặc gạch dưới">

        ${isRegister ? `
        <label class="auth-label" for="auth-fullname">Họ và tên <span class="auth-optional">(không bắt buộc)</span></label>
        <input class="auth-input" id="auth-fullname" name="fullName" type="text"
               autocomplete="name" maxlength="190" placeholder="Nguyễn Văn A">` : ''}

        <label class="auth-label" for="auth-password">Mật khẩu</label>
        <input class="auth-input" id="auth-password" name="password" type="password"
               autocomplete="${isRegister ? 'new-password' : 'current-password'}"
               required minlength="8" maxlength="200"
               placeholder="${isRegister ? 'tối thiểu 8 ký tự, có cả chữ và số' : ''}">

        <div class="auth-error" id="auth-error" role="alert"></div>

        <button class="btn-auth-submit" type="submit" id="auth-submit">
          ${isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
        </button>

        ${state.allowRegistration ? `
        <p class="auth-switch">
          ${isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
          <button type="button" class="auth-switch-btn" id="auth-switch-btn">
            ${isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
          </button>
        </p>` : ''}
      </form>`;

    const form = document.getElementById('auth-form');
    if (form) form.addEventListener('submit', handleAuthSubmit);

    const switchBtn = document.getElementById('auth-switch-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        currentMode = currentMode === 'login' ? 'register' : 'login';
        renderAuthForm();
      });
    }
  }

  function setAuthError(message) {
    const el = document.getElementById('auth-error');
    if (el) el.textContent = message || '';
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError('');

    const submitBtn = document.getElementById('auth-submit');
    const username = (document.getElementById('auth-username') || {}).value || '';
    const password = (document.getElementById('auth-password') || {}).value || '';
    const fullNameEl = document.getElementById('auth-fullname');

    if (!username.trim() || !password) {
      setAuthError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang xử lý...';
    }

    const endpoint = currentMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = { username: username.trim(), password };
    if (fullNameEl && fullNameEl.value.trim()) payload.fullName = fullNameEl.value.trim();

    try {
      const data = await apiJson(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      state.user = data.user;
      closeAuthModal();
      renderAuthBar();
      applyPermissions();
      document.dispatchEvent(new CustomEvent('gns:auth-changed', { detail: state.user }));
    } catch (err) {
      setAuthError(err.message);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = currentMode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập';
      }
    }
  }

  async function doLogout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {
      // Dù server lỗi vẫn xoá trạng thái phía client
    }
    state.user = null;
    renderAuthBar();
    applyPermissions();
    document.dispatchEvent(new CustomEvent('gns:auth-changed', { detail: null }));
    if (typeof window.switchTab === 'function') window.switchTab('home-view');
  }

  state.logout = doLogout;

  /** Chặn hành động cần đăng nhập, đồng thời mở sẵn hộp thoại. */
  function requireLogin(message) {
    if (isLoggedIn()) return true;
    setTimeout(() => openAuthModal('login'), 0);
    if (message) alert(message);
    return false;
  }

  state.requireLogin = requireLogin;

  // ------------------------------------------------------------------
  // Khởi động
  // ------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);

    const overlay = document.getElementById('auth-modal');
    if (overlay) {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeAuthModal();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAuthModal();
    });

    refreshSession();
  });
})();

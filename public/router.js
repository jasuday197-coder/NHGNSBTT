/* ==========================================================================
   ĐỊNH TUYẾN (router.js)

   Trước đây cả trang web chỉ có một URL "/" — bấm sang Admin hay Từ điển thì
   thanh địa chỉ vẫn không đổi, không chia sẻ được link, F5 là mất chỗ đang xem.

   Giờ mỗi mục có đường dẫn riêng. Vẫn là SPA (không tải lại trang) nhưng
   URL, tiêu đề trang và nút back/forward hoạt động đúng như web nhiều trang.

   Nạp TRƯỚC app.js: app.js sẽ gọi vào GNS_ROUTER trong switchTab.
   ========================================================================== */

(function () {
  'use strict';

  const SITE = 'Ngân hàng Giọng nói Số Bắc Trung Bộ';

  // Đường dẫn ↔ view. Thứ tự trong mảng cũng là thứ tự hiển thị trên navbar.
  const ROUTES = [
    { path: '/',              view: 'home-view',       title: SITE },
    { path: '/ban-do',        view: 'map-view',        title: 'Bản đồ phương ngữ' },
    { path: '/tu-dien',       view: 'dictionary-view', title: 'Từ điển phương ngữ' },
    { path: '/dich-thuat',    view: 'translator-view', title: 'Dịch thuật phương ngữ' },
    { path: '/chatbot',       view: 'chatbot-view',    title: 'Chatbot chuyên gia' },
    { path: '/tro-choi',      view: 'quizzes-view',    title: 'Trò chơi phương ngữ' },
    { path: '/kho-ngu-lieu',  view: 'archive-view',    title: 'Kho ngữ liệu' },
    { path: '/can-dong-gop',  view: 'contribute-view', title: 'Cần đóng góp' },
    { path: '/giong-noi-ai',  view: 'tts-view',        title: 'Giọng nói AI' },
    { path: '/admin',         view: 'admin-view',      title: 'Quản trị hệ thống' }
  ];

  const byView = new Map(ROUTES.map(r => [r.view, r]));
  const byPath = new Map(ROUTES.map(r => [r.path, r]));

  // Trang chi tiết bản ghi: /ban-ghi/<ma-trich-dan>
  const RECORD_RE = /^\/ban-ghi\/([A-Za-z0-9._-]+)\/?$/;

  const state = { ROUTES, current: null, ready: false };
  window.GNS_ROUTER = state;

  const pathOf = (view) => (byView.get(view) || {}).path || '/';
  state.pathOf = pathOf;

  function setTitle(text) {
    document.title = text === SITE ? SITE : `${text} — ${SITE}`;
  }

  /**
   * Cập nhật thanh địa chỉ khi người dùng chuyển mục.
   * Gọi từ switchTab, KHÔNG tự chuyển view (tránh vòng lặp).
   */
  function syncUrl(view, { replace = false } = {}) {
    const route = byView.get(view);
    if (!route) return;

    state.current = route;
    setTitle(route.title);

    if (location.pathname === route.path) return;
    const method = replace ? 'replaceState' : 'pushState';
    history[method]({ view }, '', route.path + location.search);
  }

  state.syncUrl = syncUrl;

  /** Mở đúng view theo đường dẫn hiện tại. Trả về true nếu xử lý được. */
  function applyPath(pathname) {
    const clean = pathname.replace(/\/+$/, '') || '/';

    // Trang chi tiết bản ghi do archive.js dựng
    const record = clean.match(RECORD_RE);
    if (record) {
      if (typeof window.switchTab === 'function') {
        window.switchTab('record-view', { fromRouter: true });
      }
      if (window.GNS_ARCHIVE && window.GNS_ARCHIVE.renderRecord) {
        window.GNS_ARCHIVE.renderRecord(record[1]);
      }
      return true;
    }

    const route = byPath.get(clean);
    if (!route) return false;

    state.current = route;
    setTitle(route.title);
    if (typeof window.switchTab === 'function') {
      window.switchTab(route.view, { fromRouter: true });
    }
    return true;
  }

  state.applyPath = applyPath;

  /** Điều hướng bằng mã, dùng cho các nút trong trang. */
  function go(path) {
    if (location.pathname === path) return;
    history.pushState({}, '', path);
    applyPath(path);
  }

  state.go = go;

  // ------------------------------------------------------------------
  // Bắt sự kiện
  // ------------------------------------------------------------------

  window.addEventListener('popstate', () => {
    if (!applyPath(location.pathname)) {
      // Đường dẫn lạ (người dùng gõ tay) -> về trang chủ
      if (typeof window.switchTab === 'function') window.switchTab('home-view', { fromRouter: true });
    }
  });

  /**
   * Cho phép bấm chuột giữa / Ctrl+click để mở tab mới như link thật,
   * còn bấm thường thì chuyển trong SPA.
   */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-route]');
    if (!link) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    go(link.getAttribute('href'));
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Gắn href thật cho các mục navbar để mở tab mới / bookmark được
    document.querySelectorAll('.navbar-link[data-view]').forEach((item) => {
      const route = byView.get(item.getAttribute('data-view'));
      if (route) item.setAttribute('data-href', route.path);
    });

    // Định tuyến lần đầu theo URL người dùng vào
    setTimeout(() => {
      state.ready = true;
      if (!applyPath(location.pathname)) {
        history.replaceState({}, '', '/');
        if (typeof window.switchTab === 'function') window.switchTab('home-view', { fromRouter: true });
      }
    }, 250);
  });
})();

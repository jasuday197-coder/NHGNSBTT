'use strict';

const auth = require('../auth');
const store = require('../store');
const rateLimit = require('../ratelimit');
const { config } = require('../config');
const {
  HttpError, sendJson, readJsonBody, assertSameOrigin,
  setSessionCookie, clearSessionCookie, str
} = require('../http');

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  fullName: user.fullName || null,
  email: user.email || null,
  role: user.role
});

/**
 * @returns {boolean} true neu route da xu ly request
 */
async function handle(req, res, ctx) {
  const { pathname, method, ip } = ctx;

  // --- POST /api/auth/register -------------------------------------
  if (method === 'POST' && pathname === '/api/auth/register') {
    assertSameOrigin(req);

    if (!config.allowRegistration) {
      throw new HttpError(403, 'Hệ thống đang tạm ngưng nhận đăng ký tài khoản mới.');
    }
    rateLimit.guard(res, 'register', ip);

    const body = await readJsonBody(req);
    const created = await auth.registerUser({
      username: str(body.username, 64),
      password: typeof body.password === 'string' ? body.password : '',
      email: str(body.email, 190),
      fullName: str(body.fullName || body.full_name, 190),
      role: 'user' // Nang len admin chi qua CLI, khong bao gio qua HTTP
    });

    const user = await auth.authenticate(body.username.trim(), body.password);
    const session = await auth.createSession(user.id, { ip, userAgent: req.headers['user-agent'] });
    setSessionCookie(res, session.token, session.expiresAt);

    await store.writeAuditLog({
      userId: created.id, username: created.username, action: 'user.register', ip
    });

    sendJson(res, 201, { success: true, user: publicUser(user) });
    return true;
  }

  // --- POST /api/auth/login ----------------------------------------
  if (method === 'POST' && pathname === '/api/auth/login') {
    assertSameOrigin(req);
    rateLimit.guard(res, 'login', ip);

    const body = await readJsonBody(req);
    const user = await auth.authenticate(body.username, body.password);
    const session = await auth.createSession(user.id, { ip, userAgent: req.headers['user-agent'] });

    rateLimit.reset('login', ip);
    setSessionCookie(res, session.token, session.expiresAt);

    await store.writeAuditLog({
      userId: user.id, username: user.username, action: 'user.login', ip
    });

    sendJson(res, 200, { success: true, user: publicUser(user) });
    return true;
  }

  // --- POST /api/auth/logout ---------------------------------------
  if (method === 'POST' && pathname === '/api/auth/logout') {
    assertSameOrigin(req);
    await auth.destroySession(ctx.sessionToken);
    clearSessionCookie(res);
    sendJson(res, 200, { success: true });
    return true;
  }

  // --- GET /api/auth/me --------------------------------------------
  if (method === 'GET' && pathname === '/api/auth/me') {
    sendJson(res, 200, {
      success: true,
      authenticated: Boolean(ctx.user),
      user: ctx.user ? publicUser(ctx.user) : null,
      allowRegistration: config.allowRegistration
    });
    return true;
  }

  // --- POST /api/auth/change-password ------------------------------
  if (method === 'POST' && pathname === '/api/auth/change-password') {
    assertSameOrigin(req);
    if (!ctx.user) throw new HttpError(401, 'Bạn cần đăng nhập.');

    const body = await readJsonBody(req);
    await auth.changePassword(ctx.user.id, body.currentPassword, body.newPassword);
    clearSessionCookie(res);

    await store.writeAuditLog({
      userId: ctx.user.id, username: ctx.user.username, action: 'user.change_password', ip
    });

    sendJson(res, 200, { success: true, message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
    return true;
  }

  return false;
}

module.exports = { handle, publicUser };

'use strict';

/**
 * Tao hoac nang cap tai khoan quan tri.
 * Day la duong duy nhat de co role=admin — khong the tu HTTP.
 *
 *   node scripts/create-admin.js --username admin --password 'MatKhau123'
 *   node scripts/create-admin.js --username an --promote
 *   node scripts/create-admin.js --username an --reset-password 'MoiABC123'
 */

const { assertValid } = require('../lib/config');
const db = require('../lib/db');
const auth = require('../lib/auth');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

async function main() {
  assertValid();
  const args = parseArgs(process.argv.slice(2));

  const username = typeof args.username === 'string' ? args.username.trim() : '';
  if (!username) {
    console.error('Thiếu --username.\n');
    console.error('Ví dụ:');
    console.error("  node scripts/create-admin.js --username admin --password 'MatKhau123'");
    console.error('  node scripts/create-admin.js --username an --promote');
    process.exitCode = 1;
    return;
  }

  const existing = await db.queryOne('SELECT id, username, role FROM users WHERE username = ?', [username]);

  // --- Nang quyen tai khoan san co ---
  if (args.promote) {
    if (!existing) {
      console.error(`✗ Không tìm thấy tài khoản "${username}".`);
      process.exitCode = 1;
      return;
    }
    await db.execute("UPDATE users SET role = 'admin' WHERE id = ?", [existing.id]);
    console.log(`✓ Đã nâng "${username}" lên quyền admin.`);
    return;
  }

  // --- Dat lai mat khau ---
  if (typeof args['reset-password'] === 'string') {
    if (!existing) {
      console.error(`✗ Không tìm thấy tài khoản "${username}".`);
      process.exitCode = 1;
      return;
    }
    const problem = auth.validatePasswordStrength(args['reset-password']);
    if (problem) {
      console.error(`✗ ${problem}`);
      process.exitCode = 1;
      return;
    }
    await db.execute('UPDATE users SET password_hash = ?, failed_logins = 0, locked_until = NULL WHERE id = ?',
      [auth.hashPassword(args['reset-password']), existing.id]);
    await auth.destroyAllSessionsFor(existing.id);
    console.log(`✓ Đã đặt lại mật khẩu cho "${username}". Mọi phiên đăng nhập cũ đã bị huỷ.`);
    return;
  }

  // --- Tao moi ---
  const password = typeof args.password === 'string' ? args.password : '';
  if (!password) {
    console.error('Thiếu --password (hoặc dùng --promote / --reset-password).');
    process.exitCode = 1;
    return;
  }

  if (existing) {
    console.error(`✗ Tài khoản "${username}" đã tồn tại (role hiện tại: ${existing.role}).`);
    console.error('  Dùng --promote để nâng quyền, hoặc --reset-password để đổi mật khẩu.');
    process.exitCode = 1;
    return;
  }

  const created = await auth.registerUser({
    username,
    password,
    email: typeof args.email === 'string' ? args.email : null,
    fullName: typeof args['full-name'] === 'string' ? args['full-name'] : null,
    role: 'admin'
  });

  console.log(`✓ Đã tạo tài khoản admin "${created.username}" (id ${created.id}).`);
}

main()
  .catch((err) => {
    console.error('✗', err.message);
    process.exitCode = 1;
  })
  .finally(() => db.close());

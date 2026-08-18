'use strict';

const mysql = require('mysql2/promise');
const { config } = require('./config');

let pool = null;

function getPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: config.db.connectionLimit,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z',
    // Bat buoc dung placeholder -> khong the noi chuoi SQL bang tay
    namedPlaceholders: false,
    dateStrings: false
  });

  return pool;
}

/** Truy van tra ve mang ban ghi. */
async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

/** Truy van tra ve ban ghi dau tien hoac null. */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length ? rows[0] : null;
}

/** INSERT/UPDATE/DELETE, tra ve metadata (insertId, affectedRows). */
async function execute(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

/** Chay nhieu lenh trong mot transaction; tu dong rollback khi loi. */
async function transaction(handler) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await handler(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try { await conn.rollback(); } catch (_) { /* connection da hong */ }
    throw err;
  } finally {
    conn.release();
  }
}

async function ping() {
  const conn = await getPool().getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}

async function close() {
  if (!pool) return;
  await pool.end();
  pool = null;
}

module.exports = { getPool, query, queryOne, execute, transaction, ping, close };

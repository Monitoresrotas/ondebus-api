import pg from 'pg';
const { Pool } = pg;

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

export async function q(sql, params) {
  if (!pool) throw new Error('DB indisponível: defina DATABASE_URL');
  const res = await pool.query(sql, params);
  return res.rows;
}

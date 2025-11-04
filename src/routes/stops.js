import { Router } from 'express';
import { pool, q } from '../db.js';
import stopsMock from '../data/stops.json' assert { type: 'json' };

const router = Router();

router.get('/', async (req, res) => {
  const qstr = (req.query.query || '').toString().trim();
  if (!pool) {
    // fallback mock
    const out = qstr ? stopsMock.filter(s => s.name.toLowerCase().includes(qstr.toLowerCase())) : stopsMock.slice(0,25);
    return res.json({ count: out.length, stops: out });
  }
  if (!qstr) {
    const rows = await q('SELECT stop_id as id, stop_name as name, stop_lat as lat, stop_lon as lng, zone_id as zone FROM stops LIMIT 25', []);
    return res.json({ count: rows.length, stops: rows });
  }
  const rows = await q(
    `SELECT stop_id as id, stop_name as name, stop_lat as lat, stop_lon as lng, zone_id as zone
     FROM stops WHERE stop_name ILIKE $1 LIMIT 50`, [`%${qstr}%`]
  );
  res.json({ count: rows.length, stops: rows });
});

export default router;

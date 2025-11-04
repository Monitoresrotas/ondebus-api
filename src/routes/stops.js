import { Router } from 'express';
import stops from '../data/stops.json' assert { type: 'json' };

const router = Router();

/**
 * GET /v1/stops?query=amadora
 * retorna stops com .name que contenha o termo (case-insensitive)
 */
router.get('/', (req, res) => {
  const q = (req.query.query || '').toString().trim().toLowerCase();
  const out = q
    ? stops.filter(s => s.name.toLowerCase().includes(q))
    : stops.slice(0, 25);
  res.json({ count: out.length, stops: out });
});

export default router;

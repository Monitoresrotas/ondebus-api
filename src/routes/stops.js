import { Router } from 'express';
import { cmStops } from '../integrations/cm.js';

const router = Router();

// GET /v1/stops?query=amadora
router.get('/', async (req, res) => {
  try {
    const q = (req.query.query || req.query.q || '').toString();
    const stops = await cmStops(q);
    res.json({ count: stops.length, stops });
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch stops', detail: String(e).slice(0,300) });
  }
});

export default router;

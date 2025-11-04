import { Router } from 'express';
import { pool, q } from '../db.js';
import routesMock from '../data/routes.json' assert { type: 'json' };
import { buildGPX } from '../lib/gpx.js';

const router = Router();

// GET /v1/variant/:id/gpx → se DB: assume id=shape_id; fallback mock mantém antigo
router.get('/:id/gpx', async (req, res) => {
  const { id } = req.params;

  if (pool) {
    const shp = await q(
      `SELECT shape_pt_lat as lat, shape_pt_lon as lon
       FROM shapes WHERE shape_id=$1 ORDER BY shape_pt_sequence ASC`, [id]);
    if (!shp.length) {
      // fallback via stop_times por trip_id
      const sts = await q(
        `SELECT s.stop_lat as lat, s.stop_lon as lon
         FROM stop_times st JOIN stops s ON st.stop_id=s.stop_id
         WHERE st.trip_id=$1 ORDER BY st.stop_sequence ASC`, [id]);
      if (!sts.length) return res.status(404).json({ error: 'shape/trip não encontrado' });
      const gpx = buildGPX({ name: `Percurso ${id}`, coords: sts.map(p => [p.lat, p.lon]) });
      res.setHeader('Content-Type', 'application/gpx+xml; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.gpx"`);
      return res.send(gpx);
    }
    const gpx = buildGPX({ name: `Percurso ${id}`, coords: shp.map(p => [p.lat, p.lon]) });
    res.setHeader('Content-Type', 'application/gpx+xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.gpx"`);
    return res.send(gpx);
  }

  // mock antigo
  for (const r of routesMock) {
    for (const v of r.variants) {
      if (v.id === id) {
        const gpx = buildGPX({ name: `${r.name} (${v.direction})`, coords: v.coords });
        res.setHeader('Content-Type', 'application/gpx+xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${v.id}.gpx"`);
        return res.send(gpx);
      }
    }
  }
  res.status(404).json({ error: 'Variante não encontrada' });
});

export default router;

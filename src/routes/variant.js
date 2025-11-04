import { Router } from 'express';
import { buildGPXFromLatLngs } from '../utils/gpx.js';
import { cmPatternsForLine, cmShape } from '../integrations/cm.js';

const router = Router();

// MVP: /v1/variant/:id/gpx?line=XXX
// Interpretação: :id = patternId (ou shapeId).
// Se vier ?line=, tentamos pegar o primeiro pattern e respetivo shape.
router.get('/:id/gpx', async (req, res) => {
  try {
    const { id } = req.params;
    const line = (req.query.line || '').toString();
    let points = [];

    if (line) {
      const patterns = await cmPatternsForLine(line);
      const pattern = patterns.find(p => p.id === id) || patterns[0];
      const shapeId = pattern?.shape_id || pattern?.shapeId || pattern?.shape?.id;
      if (!shapeId) throw new Error('shapeId não encontrado para esta linha/pattern');
      const shape = await cmShape(shapeId);
      const coords = shape?.coordinates || shape?.points || shape?.shape || [];
      points = coords.map(c => Array.isArray(c) ? c : [c.lat ?? c.latitude, c.lon ?? c.longitude]).filter(p => p?.length === 2);
    } else {
      // fallback: assumir que :id já é um shapeId
      const shape = await cmShape(id);
      const coords = shape?.coordinates || shape?.points || shape?.shape || [];
      points = coords.map(c => Array.isArray(c) ? c : [c.lat ?? c.latitude, c.lon ?? c.longitude]).filter(p => p?.length === 2);
    }

    if (!points.length) return res.status(404).json({ error: 'Sem pontos para GPX' });
    const gpx = buildGPXFromLatLngs(points, { name: `ONDEBUS ${id}` });
    res.setHeader('Content-Type', 'application/gpx+xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.gpx"`);
    res.send(gpx);
  } catch (e) {
    res.status(502).json({ error: 'Falha ao gerar GPX', detail: String(e).slice(0,300) });
  }
});

export default router;

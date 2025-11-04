import { Router } from 'express';
import routes from '../data/routes.json' assert { type: 'json' };
import { buildGPX } from '../lib/gpx.js';

const router = Router();

/**
 * GET /v1/variant/:id/gpx?direction=ida|volta
 * Fornece ficheiro GPX para download
 */
router.get('/:id/gpx', (req, res) => {
  const { id } = req.params;
  const requestedDir = (req.query.direction || '').toString().toLowerCase();

  const match = findVariant(id, requestedDir);
  if (!match) {
    return res.status(404).json({ error: 'Variante não encontrada' });
  }

  const name = `${match.route.name} (${match.variant.direction})`;
  const gpx = buildGPX({ name, coords: match.variant.coords });

  res.setHeader('Content-Type', 'application/gpx+xml; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${match.variant.id}.gpx"`);
  res.send(gpx);
});

function findVariant(variantId, direction) {
  for (const route of routes) {
    for (const variant of route.variants) {
      const okId = variant.id === variantId;
      const okDir = !direction || variant.direction.toLowerCase() === direction;
      if (okId && okDir) return { route, variant };
    }
  }
  // fallback: aceitar só por id, ignorando direction
  for (const route of routes) {
    for (const variant of route.variants) {
      if (variant.id === variantId) return { route, variant };
    }
  }
  return null;
}

export default router;

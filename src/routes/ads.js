import { Router } from 'express';
import ads from '../data/ads.json' assert { type: 'json' };

const router = Router();

/**
 * GET /v1/ads?zone=Lisboa&stopId=STP_1002&routeId=R1&operator=Carris%20Metropolitana
 * Seleção simples por “score”: +3 se coincidir stop, +2 se coincidir route, +1 por zone e por operator
 * 204 se não houver match com score > 0
 */
router.get('/', (req, res) => {
  const zone = (req.query.zone || '').toString();
  const stopId = (req.query.stopId || '').toString();
  const routeId = (req.query.routeId || '').toString();
  const operator = (req.query.operator || '').toString();

  let best = null;
  let bestScore = 0;

  for (const ad of ads) {
    let score = 0;
    if (zone && ad.zones?.includes(zone)) score += 1;
    if (operator && ad.operators?.includes(operator)) score += 1;
    if (routeId && ad.routes?.includes(routeId)) score += 2;
    if (stopId && ad.stops?.includes(stopId)) score += 3;
    if (score > bestScore) {
      bestScore = score;
      best = ad;
    }
  }

  if (!best || bestScore === 0) {
    return res.status(204).send(); // sem conteúdo (não mostra anúncio)
  }

  res.json({
    ad: {
      id: best.id,
      title: best.title,
      image: best.image,
      cta: best.cta,
      score: bestScore
    }
  });
});

export default router;

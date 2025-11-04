import { Router } from 'express';
const router = Router();

// memória (MVP). Próxima etapa: guardar em PostgreSQL.
const metrics = { impressions: [], clicks: [] };

// POST /v1/ads/impression
router.post('/impression', (req, res) => {
  const { adId, routeId, stopId, context } = req.body || {};
  metrics.impressions.push({ ts: Date.now(), adId, routeId, stopId, context });
  res.json({ ok: true });
});

// POST /v1/ads/click
router.post('/click', (req, res) => {
  const { adId, routeId, stopId, context } = req.body || {};
  metrics.clicks.push({ ts: Date.now(), adId, routeId, stopId, context });
  res.json({ ok: true });
});

// GET /v1/ads?zone=&routeId=&stopId=&operator=
router.get('/', (req, res) => {
  // Seleção simples (placeholder para passageiros)
  const { zone, routeId, stopId, operator } = req.query;
  // devolve sempre o mesmo mock quando há algum contexto — o frontend já está preparado
  if (zone || routeId || stopId || operator) {
    return res.json({
      ad: {
        id: 'AD_01',
        title: 'Café Sete Rios — pequeno-almoço',
        image: 'https://picsum.photos/seed/cafe/600/300',
        cta: 'https://exemplo-cafe.pt',
        score: 7
      }
    });
  }
  return res.status(204).end();
});

export default router;

import { Router } from 'express';
const router = Router();

// In-memory ad store (MVP). Depois ligamos a PostgreSQL.
const ADS = [
  {
    id: 'AD_01',
    title: 'Café Sete Rios — pequeno-almoço',
    image: 'https://picsum.photos/seed/cafe/600/300',
    cta: 'https://exemplo-cafe.pt',
    match: { zone: 'Lisboa', routeId: 'R1' }
  },
  {
    id: 'AD_02',
    title: 'Oficina Express — revisão em 30 min',
    image: 'https://picsum.photos/seed/oficina/600/300',
    cta: 'https://exemplo-oficina.pt',
    match: { stopId: 'SeteRios' }
  }
];

// tracking (memória)
const METRICS = {}; // { adId: { impressions: n, clicks: n } }

function addMetric(adId, type) {
  METRICS[adId] ??= { impressions: 0, clicks: 0 };
  METRICS[adId][type] += 1;
}

// GET /v1/ads?zone=Lisboa&stopId=...&routeId=...&operator=...
router.get('/', (req, res) => {
  const { zone, stopId, routeId } = req.query;
  const candidates = ADS.filter(ad => {
    const m = ad.match || {};
    // casa se todos os campos definidos coincidirem
    return (!m.zone || m.zone === zone) &&
           (!m.routeId || m.routeId === routeId) &&
           (!m.stopId || m.stopId === stopId);
  });
  // ordenar (MVP: por id)
  const ad = candidates[0] || null;
  if (!ad) return res.json({ ad: null });
  addMetric(ad.id, 'impressions');
  res.json({ ad });
});

// POST /v1/ads/impression {adId}
router.post('/impression', (req, res) => {
  const { adId } = req.body || {};
  if (adId) addMetric(adId, 'impressions');
  res.json({ ok: true, metrics: METRICS[adId] || { impressions: 0, clicks: 0 } });
});

// POST /v1/ads/click {adId}
router.post('/click', (req, res) => {
  const { adId } = req.body || {};
  if (adId) addMetric(adId, 'clicks');
  res.json({ ok: true, metrics: METRICS[adId] || { impressions: 0, clicks: 0 } });
});

// GET /v1/ads/metrics (opcional p/ debug)
router.get('/metrics', (_req, res) => res.json(METRICS));

export default router;

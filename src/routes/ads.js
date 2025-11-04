const metrics = { impressions: [], clicks: [] };

router.post('/impression', (req, res) => {
  const { adId, routeId, stopId, context } = req.body || {};
  metrics.impressions.push({ ts: Date.now(), adId, routeId, stopId, context });
  res.json({ ok: true });
});

router.post('/click', (req, res) => {
  const { adId, routeId, stopId, context } = req.body || {};
  metrics.clicks.push({ ts: Date.now(), adId, routeId, stopId, context });
  res.json({ ok: true });
});

export default router;

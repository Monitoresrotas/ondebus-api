import { Router } from "express";

const router = Router();

/**
 * GET /v1/ads?stopId=xxx&routeId=yyy
 * mock simples: devolve 0 ou 1 anúncio.
 */
router.get("/", (req, res) => {
  const { stopId, routeId } = req.query;

  // regra mínima: só mostra anúncio se houver algum contexto
  if (!stopId && !routeId) return res.json({ ads: [] });

  const ad = {
    id: "ad_001",
    title: "Café do Terminal",
    text: "Promo: pastel + café €1,20",
    cta: "Anunciar aqui",
    url: "https://ondebus.sbs/anunciar",
    targeting: { stopId: stopId || null, routeId: routeId || null }
  };

  res.json({ ads: [ad] });
});

export default router;

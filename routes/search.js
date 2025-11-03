import { Router } from "express";
import routes from "../data/mock_routes.json" with { type: "json" };

const router = Router();

/**
 * GET /v1/search?from=...&to=...
 * Devolve rotas mock com score simples por correspondência parcial.
 */
router.get("/", (req, res) => {
  const from = (req.query.from || "").toString().trim().toLowerCase();
  const to = (req.query.to || "").toString().trim().toLowerCase();

  const scored = routes
    .map((r) => {
      let score = 0;
      if (from && r.origem.toLowerCase().includes(from)) score += 1;
      if (to && r.destino.toLowerCase().includes(to)) score += 1;
      return { ...r, score };
    })
    .filter((r) => r.score > 0 || (!from && !to));

  scored.sort((a, b) => b.score - a.score);
  res.json(scored);
});

export default router;

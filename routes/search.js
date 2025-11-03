import { Router } from "express";

const router = Router();

// 🔁 Mock embutido (deixa de depender de /data/mock_routes.json)
const routes = [
  { "id": "rt_101", "linha": "101", "origem": "Cacém", "destino": "Oeiras", "duracaoMin": 42 },
  { "id": "rt_1523", "linha": "1523", "origem": "Cacém", "destino": "Rossio", "duracaoMin": 55 },
  { "id": "rt_750", "linha": "750", "origem": "Algés", "destino": "Campo Grande", "duracaoMin": 35 }
];

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

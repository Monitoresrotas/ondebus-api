import { Router } from "express";
import stops from "../data/mock_stops.json" assert { type: "json" };

const router = Router();

/**
 * GET /v1/stops?q=texto
 * Filtra por nome (contém, case-insensitive)
 */
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();
  if (!q) return res.json(stops);
  const out = stops.filter(s => s.nome.toLowerCase().includes(q));
  res.json(out);
});

export default router;

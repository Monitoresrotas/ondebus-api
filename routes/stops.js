import { Router } from "express";

const router = Router();

// 🔁 Mock embutido (deixa de depender de /data/mock_stops.json)
const stops = [
  { "id": "stp_001", "nome": "Cacém (Estação)", "zona": "Sintra" },
  { "id": "stp_002", "nome": "Oeiras (Centro)", "zona": "Oeiras" },
  { "id": "stp_003", "nome": "Rossio", "zona": "Lisboa" }
];

/**
 * GET /v1/stops?q=texto
 * Filtra por nome (contém, case-insensitive). Se q vazio, devolve todas.
 */
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();
  if (!q) return res.json(stops);
  const out = stops.filter((s) => s.nome.toLowerCase().includes(q));
  res.json(out);
});

export default router;

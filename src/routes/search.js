import { Router } from 'express';
import routes from '../data/routes.json' assert { type: 'json' };

const router = Router();

/**
 * GET /v1/search?origem=Amadora&destino=Sete%20Rios
 * devolve itinerários mockados com legs e metadados básicos
 */
router.get('/', (req, res) => {
  const origem  = (req.query.origem  || '').toString();
  const destino = (req.query.destino || '').toString();

  // lógica mock: devolve todas as rotas; no futuro aplicaremos scoring real
  const results = routes.map(r => ({
    id: r.routeId,
    name: r.name,
    operator: r.operator,
    zone: r.zone,
    durationMin: estimateDuration(r),
    variants: r.variants.map(v => ({
      id: v.id,
      direction: v.direction,
      points: v.coords
    })),
    legs: [
      {
        mode: r.operator.includes('Metro') ? 'metro' : (r.operator === 'CP' ? 'comboio' : 'autocarro'),
        summary: r.name,
        polylinePoints: r.variants[0]?.coords || []
      }
    ]
  }));

  res.json({
    query: { origem, destino },
    count: results.length,
    itineraries: results
  });
});

function estimateDuration(r) {
  const pts = r.variants?.[0]?.coords?.length || 3;
  return 10 + pts * 5; // mock: 10 min + 5 por ponto
}

export default router;

import { Router } from 'express';
import { cmStops, cmTimes, cmVehicles } from '../integrations/cm.js';

const router = Router();

// MVP simples: recebe origem/destino (texto), lista candidatos e junta um "itinerary"
// com apoio de tempo-real (ETA na primeira paragem de destino se existir).
// GET /v1/search?origem=Amadora&destino=Sete%20Rios
router.get('/', async (req, res) => {
  try {
    const origem = (req.query.origem || '').toString().trim();
    const destino = (req.query.destino || '').toString().trim();
    if (!origem || !destino) return res.status(400).json({ error: 'Parâmetros obrigatórios: origem, destino' });

    const [stopsOri, stopsDst] = await Promise.all([ cmStops(origem), cmStops(destino) ]);
    const o = stopsOri[0], d = stopsDst[0];
    if (!o || !d) return res.json({ query: { origem, destino }, count: 0, itineraries: [] });

    // Tempo-real (ETA) — tentativa de previsão na paragem de destino
    const eta = await cmTimes({ stopId: d.id }).catch(() => []);
    const vehicles = await cmVehicles().catch(() => []);

    const itineraries = [{
      id: `IT_${o.id}_${d.id}`,
      name: `${o.name} → ${d.name}`,
      operator: 'Carris Metropolitana',
      zone: 'AML',
      durationMin: 0, // desconhecido no MVP sem grafo; iremos calcular quando ligarmos patamares GTFS
      realtime: {
        destinationStop: d.id,
        etaRaw: eta
      },
      legs: [{
        mode: 'bus',
        summary: `${o.name} → ${d.name}`,
        from: { id: o.id, name: o.name, lat: o.lat, lng: o.lng },
        to:   { id: d.id, name: d.name, lat: d.lat, lng: d.lng },
        vehiclesSample: vehicles.slice(0, 10).map(v => ({
          vehicleId: v?.id || v?.vehicle_id,
          line: v?.line || v?.route_short_name || v?.route,
          lat: v?.lat ?? v?.latitude,
          lng: v?.lon ?? v?.longitude,
          ts:  v?.timestamp
        }))
      }]
    }];

    res.json({ query: { origem, destino }, count: itineraries.length, itineraries });
  } catch (e) {
    res.status(502).json({ error: 'Falha no /v1/search', detail: String(e).slice(0,300) });
  }
});

export default router;

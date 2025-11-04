import { Router } from 'express';
import { pool, q } from '../db.js';
import routesMock from '../data/routes.json' assert { type: 'json' };

const router = Router();

router.get('/', async (req, res) => {
  const origem  = (req.query.origem  || '').toString().trim();
  const destino = (req.query.destino || '').toString().trim();

  if (!pool) {
    // fallback mock
    const results = routesMock.map(r => ({
      id: r.routeId,
      name: r.name,
      operator: r.operator,
      zone: r.zone,
      durationMin: 10 + (r.variants?.[0]?.coords?.length || 3) * 5,
      variants: r.variants.map(v => ({ id: v.id, direction: v.direction, points: v.coords })),
      legs: [{ mode: modeOf(r.operator), summary: r.name, polylinePoints: r.variants[0]?.coords || [] }]
    }));
    return res.json({ query: { origem, destino }, count: results.length, itineraries: results });
  }

  // 1) escolher stops candidatos por nome
  const fromStops = await q(`SELECT stop_id, stop_name FROM stops WHERE stop_name ILIKE $1 LIMIT 10`, [`%${origem}%`]);
  const toStops   = await q(`SELECT stop_id, stop_name FROM stops WHERE stop_name ILIKE $1 LIMIT 10`, [`%${destino}%`]);

  // 2) procurar 1 ligação direta (mesmo trip, sequência crescente)
  for (const f of fromStops) {
    for (const t of toStops) {
      const path = await q(`
        SELECT st_from.trip_id, r.route_id, r.route_short_name, r.route_long_name, t.shape_id,
               st_from.stop_sequence as seq_from, st_to.stop_sequence as seq_to
        FROM stop_times st_from
        JOIN stop_times st_to   ON st_from.trip_id = st_to.trip_id
        JOIN trips t            ON st_from.trip_id = t.trip_id
        JOIN routes r           ON t.route_id = r.route_id
        WHERE st_from.stop_id = $1 AND st_to.stop_id = $2 AND st_from.stop_sequence < st_to.stop_sequence
        ORDER BY st_to.stop_sequence - st_from.stop_sequence ASC
        LIMIT 1
      `, [f.stop_id, t.stop_id]);
      if (path.length) {
        const row = path[0];
        // obter polyline:
        let points = [];
        if (row.shape_id) {
          const shp = await q(
            `SELECT shape_pt_lat as lat, shape_pt_lon as lon
             FROM shapes WHERE shape_id=$1 ORDER BY shape_pt_sequence ASC`, [row.shape_id]);
          points = shp.map(p => [p.lat, p.lon]);
        } else {
          const sts = await q(
            `SELECT s.stop_lat as lat, s.stop_lon as lon
             FROM stop_times st JOIN stops s ON st.stop_id = s.stop_id
             WHERE trip_id=$1 AND stop_sequence BETWEEN $2 AND $3
             ORDER BY stop_sequence ASC`, [row.trip_id, row.seq_from, row.seq_to]);
          points = sts.map(p => [p.lat, p.lon]);
        }
        const name = row.route_long_name || row.route_short_name || row.route_id;
        const itinerary = {
          id: row.route_id,
          name,
          operator: operatorOf(row.route_id),
          zone: 'Lisboa', // sem zones no GTFS padrão; ajustaremos mais tarde
          durationMin: Math.max(8, Math.round(points.length * 2.8)),
          variants: [{ id: row.shape_id || row.trip_id, direction: 'ida', points }],
          legs: [{ mode: 'autocarro', summary: name, polylinePoints: points }]
        };
        return res.json({ query: { origem, destino }, count: 1, itineraries: [itinerary] });
      }
    }
  }

  // sem ligação direta → vazio (mais tarde faremos intermodal/transferências)
  return res.json({ query: { origem, destino }, count: 0, itineraries: [] });
});

function modeOf(op) {
  if (!op) return 'autocarro';
  if (/metro/i.test(op)) return 'metro';
  if (/cp/i.test(op)) return 'comboio';
  return 'autocarro';
}
function operatorOf(routeId) { return 'Operador'; }

export default router;

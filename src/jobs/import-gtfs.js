import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  if (!pool) throw new Error('Defina DATABASE_URL para importar GTFS');
  const url = process.env.GTFS_URL;
  if (!url) throw new Error('Defina GTFS_URL com o ZIP do GTFS');

  // download GTFS (simples, via fetch nativo node18+)
  const tmpZip = path.join(__dirname, 'gtfs.zip');
  console.log('→ A descarregar GTFS:', url);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Falha no download do GTFS: ' + resp.status);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(tmpZip, buf);
  console.log('✓ GTFS guardado.');

  // aplicar schema
  const schema = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('✓ Schema aplicado (limpo + criado)');

  // unzip e carregar CSVs necessários
  const zip = new AdmZip(tmpZip);
  const files = zip.getEntries().map(e => e.entryName);

  const getCsv = (name) => {
    const entry = zip.getEntry(name);
    if (!entry) return null;
    const text = entry.getData().toString('utf8');
    return parse(text, { columns: true, skip_empty_lines: true });
  };

  // stops.txt
  const stops = getCsv('stops.txt');
  if (!stops) throw new Error('stops.txt não encontrado no GTFS');
  console.log(`→ stops: ${stops.length}`);
  for (const s of stops) {
    await pool.query(
      `INSERT INTO stops(stop_id, stop_name, stop_lat, stop_lon, zone_id)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (stop_id) DO UPDATE SET stop_name=EXCLUDED.stop_name,
        stop_lat=EXCLUDED.stop_lat, stop_lon=EXCLUDED.stop_lon, zone_id=EXCLUDED.zone_id`,
      [s.stop_id, s.stop_name, Number(s.stop_lat), Number(s.stop_lon), s.zone_id || null]
    );
  }

  // routes.txt
  const routes = getCsv('routes.txt') || [];
  console.log(`→ routes: ${routes.length}`);
  for (const r of routes) {
    await pool.query(
      `INSERT INTO routes(route_id, agency_id, route_short_name, route_long_name, route_type)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (route_id) DO UPDATE SET 
         agency_id=EXCLUDED.agency_id, route_short_name=EXCLUDED.route_short_name,
         route_long_name=EXCLUDED.route_long_name, route_type=EXCLUDED.route_type`,
      [r.route_id, r.agency_id || null, r.route_short_name || null, r.route_long_name || null, Number(r.route_type || 3)]
    );
  }

  // trips.txt
  const trips = getCsv('trips.txt') || [];
  console.log(`→ trips: ${trips.length}`);
  for (const t of trips) {
    await pool.query(
      `INSERT INTO trips(trip_id, route_id, service_id, shape_id)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (trip_id) DO UPDATE SET 
         route_id=EXCLUDED.route_id, service_id=EXCLUDED.service_id, shape_id=EXCLUDED.shape_id`,
      [t.trip_id, t.route_id, t.service_id || null, t.shape_id || null]
    );
  }

  // stop_times.txt
  const stopTimes = getCsv('stop_times.txt') || [];
  console.log(`→ stop_times: ${stopTimes.length}`);
  // batch insert (simples)
  for (const st of stopTimes) {
    await pool.query(
      `INSERT INTO stop_times(trip_id, arrival_time, departure_time, stop_id, stop_sequence)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (trip_id, stop_sequence) DO UPDATE SET 
         arrival_time=EXCLUDED.arrival_time, departure_time=EXCLUDED.departure_time, stop_id=EXCLUDED.stop_id`,
      [st.trip_id, st.arrival_time || null, st.departure_time || null, st.stop_id, Number(st.stop_sequence)]
    );
  }

  // shapes.txt (se existir)
  if (files.includes('shapes.txt')) {
    const shapes = getCsv('shapes.txt') || [];
    console.log(`→ shapes: ${shapes.length}`);
    for (const sh of shapes) {
      await pool.query(
        `INSERT INTO shapes(shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (shape_id, shape_pt_sequence) DO NOTHING`,
        [sh.shape_id, Number(sh.shape_pt_lat), Number(sh.shape_pt_lon), Number(sh.shape_pt_sequence)]
      );
    }
  } else {
    console.log('! shapes.txt ausente — usaremos stop_times para desenhar a linha.');
  }

  fs.unlinkSync(tmpZip);
  console.log('✓ Import GTFS concluído.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

// Adaptador simples para a API pública da Carris Metropolitana
// Docs (confirmadas): https://docs.carrismetropolitana.pt/ (API + GTFS/RT)
const CM_BASE = process.env.CM_API_BASE || 'https://api.carrismetropolitana.pt';
const CM_KEY  = process.env.CM_API_KEY || '';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (CM_KEY) headers['Authorization'] = `Bearer ${CM_KEY}`;
  return headers;
}

export async function cmFetch(path, params = {}) {
  const url = new URL(path.startsWith('http') ? path : `${CM_BASE}${path}`);
  // anexar query
  if (params.query) {
    for (const [k, v] of Object.entries(params.query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CM ${url.pathname} ${res.status} ${text}`.slice(0, 500));
  }
  return res.json();
}

/**
 * Paragens (por termo; se vazio devolve paginação default)
 * GET /network/stops (na v2)
 */
export async function cmStops(searchTerm = '') {
  // Alguns deployments expõem /stops direto; nos docs v2 aparece /api/current/network/stops (proxy).
  // Usamos o "network/stops" que a infra redireciona.
  const path = '/network/stops';
  const data = await cmFetch(path, { query: searchTerm ? { query: searchTerm } : {} });
  // Normalizar para {id,name,lat,lng,zone}
  const stops = (data?.data || data || []).map(s => ({
    id: s.id || s.stop_id || s.code || String(s?.gid ?? s?.id),
    name: s.name || s.stop_name,
    lat: s.lat ?? s.latitude ?? s.stop_lat,
    lng: s.lon ?? s.longitude ?? s.stop_lon,
    zone: s.zone_id || s.zone || s.municipality || 'AML'
  })).filter(s => s.id && s.name);
  return stops;
}

/**
 * Veículos em tempo real
 * Docs: JSON API fornece vehicle positions (alternativa a GTFS-RT). 
 * Endpoint típico: /vehicles
 */
export async function cmVehicles() {
  const data = await cmFetch('/vehicles');
  return data?.data || data || [];
}

/**
 * ETA / previsões de chegada (por stopId opcionalmente por route/line)
 * Alguns ambientes expõem /times?stopId=...&line=...
 */
export async function cmTimes({ stopId, line } = {}) {
  const query = {};
  if (stopId) query.stopId = stopId;
  if (line) query.line = line;
  const data = await cmFetch('/times', { query });
  return data?.data || data || [];
}

/**
 * Linhas / padrões / shapes (para construir GPX de forma simples)
 * Ex: /lines, /patterns/:id, /shapes/:id
 */
export async function cmPatternsForLine(lineId) {
  const patterns = await cmFetch(`/lines/${encodeURIComponent(lineId)}/patterns`);
  return patterns?.data || patterns || [];
}

export async function cmShape(shapeId) {
  const shape = await cmFetch(`/shapes/${encodeURIComponent(shapeId)}`);
  return shape?.data || shape || [];
}

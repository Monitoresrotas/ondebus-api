export function buildGPX({ name = 'Percurso ONDEBUS', coords = [] }) {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="ONDEBUS" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${escapeXml(name)}</name></metadata>
  <trk><name>${escapeXml(name)}</name><trkseg>
`;
  const segs = coords.map(([lat, lon]) => `    <trkpt lat="${lat}" lon="${lon}"></trkpt>`).join('\n');
  const footer = `
  </trkseg></trk>
</gpx>`;
  return header + segs + footer;
}

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, s => (
    { '<':'&lt;', '>':'&gt;', '&':'&amp;', "'":'&apos;', '"':'&quot;' }[s]
  ));
}

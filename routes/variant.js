import { Router } from "express";
import variants from "../data/mock_variants.json" with { type: "json" };

const router = Router();

/**
 * GET /v1/variant/:id/gpx
 * Devolve GPX da variante (mock) para download.
 */
router.get("/:id/gpx", (req, res) => {
  const id = req.params.id;
  const v = variants.find((x) => x.id === id);
  if (!v) return res.status(404).send("Variant not found");

  const gpx = buildGPX(v);
  res
    .set("Content-Type", "application/gpx+xml")
    .set("Content-Disposition", `attachment; filename="${id}.gpx"`)
    .send(gpx);
});

function buildGPX(variant) {
  const trkpts = variant.coords
    .map(([lon, lat]) => `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="ONDEBUS" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${variant.nome}</name>
  </metadata>
  <trk>
    <name>${variant.nome}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

export default router;

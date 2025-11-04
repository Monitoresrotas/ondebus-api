# ONDEBUS API (MVP)

API mock (Express) para suportar o frontend estático (Hostinger) em https://ondebus.sbs.

## Endpoints

- `GET /v1/health` → status
- `GET /v1/stops?query=...` → paragens (mock)
- `GET /v1/search?origem=...&destino=...` → itinerários (mock)
- `GET /v1/ads?zone=...&stopId=...&routeId=...&operator=...` → anúncio contextual (204 se nenhum)
- `GET /v1/variant/:id/gpx?direction=ida|volta` → download GPX

## Desenvolvimento local

```bash
npm install
npm run dev
# http://localhost:3000/v1/health

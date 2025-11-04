import express from 'express';
import morgan from 'morgan';

import healthRouter from './src/routes/health.js';
import stopsRouter from './src/routes/stops.js';
import searchRouter from './src/routes/search.js';
import variantRouter from './src/routes/variant.js';
import adsRouter from './src/routes/ads.js';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// CORS simples
const origins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origins.length || origins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Raiz — evita 404 nos healthchecks
app.get('/', (_req, res) => {
  res.json({ status: 'ONDEBUS API', version: '0.3.0', time: new Date().toISOString() });
});

app.use('/v1/health', healthRouter);
app.use('/v1/stops', stopsRouter);
app.use('/v1/search', searchRouter);
app.use('/v1/variant', variantRouter);
app.use('/v1/ads', adsRouter);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.path }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[ondebus] a escutar na porta ${port}`);
});

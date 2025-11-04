import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import health from './routes/health.js';
import stops from './routes/stops.js';
import search from './routes/search.js';
import ads from './routes/ads.js';
import variant from './routes/variant.js';

const app = express();

// Segurança básica e logging
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

// CORS: site estático (Hostinger) + dev
const allowed = [
  'https://ondebus.sbs',
  'https://www.ondebus.sbs',
  'http://localhost:5173',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS bloqueado'), false);
  }
}));

// Prefixo da API
app.use('/v1/health', health);
app.use('/v1/stops', stops);
app.use('/v1/search', search);
app.use('/v1/ads', ads);
app.use('/v1/variant', variant);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;

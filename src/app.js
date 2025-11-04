import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRouter from './routes/health.js';
import stopsRouter from './routes/stops.js';
import searchRouter from './routes/search.js';
import adsRouter from './routes/ads.js';
import variantRouter from './routes/variant.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// raiz devolve 404 (intencional) — só API
app.head('/', (_, res) => res.sendStatus(404));
app.get('/',  (_, res) => res.status(404).json({error:'Not found'}));

app.use('/v1/health', healthRouter);
app.use('/v1/stops', stopsRouter);
app.use('/v1/search', searchRouter);
app.use('/v1/ads', adsRouter);
app.use('/v1/variant', variantRouter);

export default app;

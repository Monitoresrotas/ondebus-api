import { Router } from 'express';
const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'ondebus-api',
    version: '0.1.0',
    time: new Date().toISOString()
  });
});

export default router;

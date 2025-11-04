import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    name: 'ondebus-api',
    version: process.env.npm_package_version || 'dev',
    time: new Date().toISOString()
  });
});

export default router;

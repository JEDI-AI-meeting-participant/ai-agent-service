const express = require('express');
const router = express.Router();

// 健康检查端点
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-agent-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 详细健康检查
router.get('/detailed', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    service: 'ai-agent-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  });
});

module.exports = router;
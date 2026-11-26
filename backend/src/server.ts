import { app } from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    logger.info(`✓ INTELLIAVATAR 2.0 Backend running on port ${config.port}`);
    logger.info(`✓ Health check available at http://localhost:${config.port}/health`);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully.');
    server.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
  process.exit(1);
});

import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads serving
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint (Required by Render)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    service: 'intelliavatar-backend',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

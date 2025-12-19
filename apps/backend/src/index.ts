import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import accessibilityRoutes from './routes/accessibility';

const app: Application = express();

// Middleware
app.use(helmet());

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test API endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Accessibility Analyzer Backend API is running!',
    timestamp: new Date().toISOString(),
    status: 'success',
  });
});

// Accessibility routes
app.use('/api/v1', accessibilityRoutes);

// Export for Vercel serverless functions
export default app;

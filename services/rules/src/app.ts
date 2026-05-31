import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFoundHandler } from '@fms/shared';
import { swaggerSpec } from './swagger';
import rulesRoutes from './routes/rules.routes';
import complianceRoutes from './routes/compliance.routes';
import warningsRoutes from './routes/warnings.routes';

const app = express();

app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'rules' }));

app.use('/rules', rulesRoutes);
app.use('/compliance', complianceRoutes);
app.use('/compliance/warnings', warningsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

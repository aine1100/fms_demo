import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const app = express();

app.use(cors());
app.use(helmet());

const PORT = process.env.API_GATEWAY_PORT || 4000;

// Define service URLs
const services = {
  auth: `http://localhost:${process.env.AUTH_PORT || 4001}`,
  customer: `http://localhost:${process.env.CUSTOMER_PORT || 4002}`,
  extinguisher: `http://localhost:${process.env.EXTINGUISHER_PORT || 4003}`,
  notification: `http://localhost:${process.env.NOTIFICATION_PORT || 4004}`,
  payment: `http://localhost:${process.env.PAYMENT_PORT || 4005}`,
  inspection: `http://localhost:${process.env.INSPECTION_PORT || 4006}`,
  rules: `http://localhost:${process.env.RULES_PORT || 4007}`,
};

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Setup proxies
app.use('/auth', createProxyMiddleware({ target: services.auth, changeOrigin: true }));
app.use('/customers', createProxyMiddleware({ target: services.customer, changeOrigin: true }));
app.use('/extinguishers', createProxyMiddleware({ target: services.extinguisher, changeOrigin: true }));
app.use('/notifications', createProxyMiddleware({ target: services.notification, changeOrigin: true }));
app.use('/payments', createProxyMiddleware({ target: services.payment, changeOrigin: true }));
app.use('/inspections', createProxyMiddleware({ target: services.inspection, changeOrigin: true }));
app.use('/rules', createProxyMiddleware({ target: services.rules, changeOrigin: true }));
app.use('/compliance', createProxyMiddleware({ target: services.rules, changeOrigin: true })); // handled by rules service

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});

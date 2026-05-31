import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import app from './app';

const PORT = process.env.PAYMENT_PORT || 4005;

app.listen(PORT, () => {
  console.log(`Payment service running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

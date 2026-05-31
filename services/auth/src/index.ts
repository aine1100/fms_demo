import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import app from './app';

const PORT = process.env.AUTH_PORT || 4001;

app.listen(PORT, () => {
  console.log(`Auth service running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

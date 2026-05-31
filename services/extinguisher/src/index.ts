import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import app from './app';

const PORT = process.env.EXTINGUISHER_PORT || 4003;

app.listen(PORT, () => {
  console.log(`Extinguisher service running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

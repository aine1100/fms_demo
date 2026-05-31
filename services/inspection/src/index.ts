import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import app from './app';

const PORT = process.env.INSPECTION_PORT || 4006;

app.listen(PORT, () => {
  console.log(`Inspection service running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

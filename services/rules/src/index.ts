import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import app from './app';

const PORT = process.env.RULES_PORT || 4007;

app.listen(PORT, () => {
  console.log(`Rules service running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

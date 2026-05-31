import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import app from './app';

const PORT = process.env.NOTIFICATION_PORT || 4004;

app.listen(PORT, () => {
  console.log(`Notification service running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

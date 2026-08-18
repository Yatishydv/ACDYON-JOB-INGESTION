import app from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

export default async function handler(req, res) {
  // Ensure database is connected before handling request
  await connectDatabase();
  
  // Hand off the request to Express
  return app(req, res);
}

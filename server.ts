import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TULPAR Workforce Suite', timestamp: new Date().toISOString() });
});

// Serve dist static files if built
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// For SPA routing fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TULPAR production server running on http://0.0.0.0:${PORT}`);
});

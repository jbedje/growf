const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware basique
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Route de test
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'GROWF Backend Test Server Running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API Test endpoint working!',
    version: '1.0.0'
  });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
  console.log(`📖 Health check: http://localhost:${port}/health`);
});
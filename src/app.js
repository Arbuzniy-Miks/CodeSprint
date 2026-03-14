const express = require('express');
const cors = require('cors');
const path = require('path');
require('express-async-errors');

// Роуты
const uploadRoutes = require('./routes/upload.routes');
const documentRoutes = require('./routes/document.routes');
const askRoutes = require('./routes/ask.routes');
const summaryRoutes = require('./routes/summary.routes');
const testRoutes = require('./routes/test.routes');

const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/test', testRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Для всех остальных запросов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use(errorMiddleware);

module.exports = app;
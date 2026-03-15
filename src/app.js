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

// Статические файлы из public
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

// Главная страница - отдаем main.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/main.html'));
});

// Для всех остальных запросов - 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling
app.use(errorMiddleware);

module.exports = app;
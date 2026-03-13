const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== ВАЖНО: CORS ПЕРВЫМ! =====
app.use(cors({
  origin: '*', // Для хакатона разрешаем всё
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Импорт роутов
const testRoutes = require('./routes/test.routes');

// Базовый роут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DocMind API работает!',
    timestamp: new Date().toISOString()
  });
});

// Подключение роутов
app.use('/api/test', testRoutes);

// Обработка несуществующих роутов
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Роут не найден',
    path: req.originalUrl
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: err.message
  });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📍 Локально: http://localhost:${PORT}`);
  console.log(`🌐 В сети: http://0.0.0.0:${PORT}`);
  console.log(`🧪 Тестовые эндпоинты: http://localhost:${PORT}/api/test`);
  console.log('---');
});

module.exports = app;
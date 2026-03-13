const express = require('express');
const path = require('path');
const cors = require('cors');

const documentRoutes = require('./routes/document.routes');
const uploadRoutes = require('./routes/upload.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use('/api/documents', documentRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorMiddleware);

module.exports = app;
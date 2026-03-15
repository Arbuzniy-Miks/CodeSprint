const AppError = require('../utils/AppError');

const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Ошибки Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Запись с такими данными уже существует'
    });
  }

  // Необработанные ошибки
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Внутренняя ошибка сервера' 
      : err.message
  });
};

module.exports = errorMiddleware;
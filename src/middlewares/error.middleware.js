const multer = require('multer');

module.exports = (err, req, res, next) => {
  console.error('ERROR:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Файл превышает максимально допустимый размер 20 МБ'
      });
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(statusCode).json({
    success: false,
    message
  });
};
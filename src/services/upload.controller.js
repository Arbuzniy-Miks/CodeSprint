const documentService = require('../services/document.service');
const AppError = require('../utils/AppError');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Файл не был загружен', 400);
    }

    const documentData = await documentService.processUploadedFile(req.file);

    res.status(201).json({
      success: true,
      message: 'Файл успешно загружен и обработан',
      data: documentData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument
};
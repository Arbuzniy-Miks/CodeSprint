const documentService = require('../services/document.service');
const AppError = require('../utils/AppError');

const getDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);

    if (!document) {
      throw new AppError('Документ не найден', 404);
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

const getAllDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getAllDocuments();

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocument,
  getAllDocuments
};
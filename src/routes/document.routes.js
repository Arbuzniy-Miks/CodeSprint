const express = require('express');
const documentService = require('../services/document.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const documents = await documentService.getAllDocuments();

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения документов'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Документ не найден'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения документа'
    });
  }
});

module.exports = router;
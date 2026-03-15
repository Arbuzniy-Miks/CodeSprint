const express = require('express');
const documentService = require('../services/document.service');
const aiService = require('../services/ai.service');

const router = express.Router();

// Получить все документы
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

// Получить документ по ID
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

// Получить краткую сводку документа через AI
router.get('/:id/summary', async (req, res) => {
    try {
        console.log(`📄 Запрос сводки для документа ${req.params.id}`);
        
        const document = await documentService.getDocumentById(req.params.id);
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Документ не найден'
            });
        }
        
        if (!document.extractedText) {
            return res.status(400).json({
                success: false,
                message: 'Текст документа не извлечен'
            });
        }
        
        // Вызываем AI сервис
        const aiResponse = await aiService.generateSummary(document.extractedText);
        
        // Сохраняем сводку в базу данных (опционально)
        // await documentService.updateDocumentSummary(req.params.id, aiResponse.summary);
        
        res.json({
            success: true,
            summary: aiResponse.summary,
            keyPoints: aiResponse.keyPoints || [],
            documentId: document.id
        });
    } catch (error) {
        console.error('❌ Ошибка получения сводки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения сводки'
        });
    }
});

// Ответить на вопрос по документу через AI
router.post('/:id/ask', async (req, res) => {
    try {
        const { question } = req.body;
        
        console.log(`❓ Запрос ответа для документа ${req.params.id}: "${question}"`);
        
        const document = await documentService.getDocumentById(req.params.id);
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Документ не найден'
            });
        }
        
        if (!document.extractedText) {
            return res.status(400).json({
                success: false,
                message: 'Текст документа не извлечен'
            });
        }
        
        // Вызываем AI сервис
        const aiResponse = await aiService.answerQuestion(question, document.extractedText);
        
        res.json({
            success: true,
            answer: aiResponse.answer,
            confidence: aiResponse.confidence || 0,
            documentId: document.id
        });
    } catch (error) {
        console.error('❌ Ошибка получения ответа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения ответа'
        });
    }
});

// Проверка статуса AI сервиса
router.get('/ai/status', async (req, res) => {
    const status = await aiService.healthCheck();
    res.json({
        success: true,
        ai: status
    });
});

module.exports = router;
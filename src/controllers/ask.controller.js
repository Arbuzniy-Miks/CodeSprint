const documentService = require('../services/document.service');
const retrievalService = require('../services/retrieval.service');
const llmService = require('../services/llm.service');
const questionAnswerService = require('../services/question-answer.service');
const AppError = require('../utils/AppError');

const askQuestion = async (req, res, next) => {
  try {
    const { question, documentId } = req.body;

    if (!question || !question.trim()) {
      throw new AppError('Вопрос не может быть пустым', 400);
    }

    // ── 1. Если передан конкретный documentId ─────────────────────────────
    if (documentId) {
      const document = await documentService.getDocumentById(documentId);

      if (!document) {
        throw new AppError('Документ не найден', 404);
      }

      if (!document.extractedText || !document.extractedText.trim()) {
        return res.json({
          success: true,
          answer: 'Документ не содержит извлечённого текста. Возможно, файл повреждён или не поддерживается.',
          documentId,
          confidence: 0
        });
      }

      // Переиндексируем если нужно
      retrievalService.indexDocument(document.extractedText, document.id);

      // Ищем релевантные chunks
      const relevantChunks = retrievalService.retrieveRelevantChunks(question, 3);
      const context = relevantChunks.length > 0
        ? relevantChunks.map(c => c.text).join('\n\n')
        : document.extractedText.substring(0, 2000);

      // Спрашиваем LLM
      const result = await llmService.answerQuestion(question, context);

      // Сохраняем в БД
      await questionAnswerService.createQuestionAnswer({
        documentId,
        question,
        answer: result.answer,
        sourceChunk: relevantChunks.length > 0 ? relevantChunks[0].text : null
      });

      return res.json({
        success: true,
        answer: result.answer,
        confidence: result.confidence,
        source: result.source,
        documentId,
        documentName: document.originalName
      });
    }

    // ── 2. Если documentId не передан — ищем по всем документам ──────────
    const allDocuments = await documentService.getAllDocuments();

    if (!allDocuments.length) {
      return res.json({
        success: true,
        answer: 'Документы не загружены. Прикрепите файл через 📎 и задайте вопрос.',
        confidence: 0
      });
    }

    // Берём последний загруженный документ с текстом
    const docWithText = allDocuments.find(d => d.extractedText && d.extractedText.trim());

    if (!docWithText) {
      return res.json({
        success: true,
        answer: 'Ни один из загруженных документов не содержит распознанного текста.',
        confidence: 0
      });
    }

    // Индексируем и ищем
    retrievalService.indexDocument(docWithText.extractedText, docWithText.id);
    const relevantChunks = retrievalService.retrieveRelevantChunks(question, 3);
    const context = relevantChunks.length > 0
      ? relevantChunks.map(c => c.text).join('\n\n')
      : docWithText.extractedText.substring(0, 2000);

    const result = await llmService.answerQuestion(question, context);

    await questionAnswerService.createQuestionAnswer({
      documentId: docWithText.id,
      question,
      answer: result.answer,
      sourceChunk: relevantChunks.length > 0 ? relevantChunks[0].text : null
    });

    return res.json({
      success: true,
      answer: result.answer,
      confidence: result.confidence,
      source: result.source,
      documentId: docWithText.id,
      documentName: docWithText.originalName
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { askQuestion };

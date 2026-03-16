const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const FOLDER_ID = process.env.YANDEX_FOLDER_ID;
const API_KEY   = process.env.YANDEX_API_KEY;
const askQuestion = async (req, res, next) => {
  try {
    const { question, documentId, documentIds } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Вопрос обязателен' });
    }
    const ids = [];
    if (Array.isArray(documentIds) && documentIds.length) {
      ids.push(...documentIds);
    } else if (documentId) {
      ids.push(documentId);
    }
    if (!ids.length) {
      return res.status(400).json({ success: false, message: 'Не передан ID документа' });
    }
    const docs = await prisma.document.findMany({
      where: { id: { in: ids } }
    });
    if (!docs.length) {
      return res.status(404).json({ success: false, message: 'Документы не найдены' });
    }
    let combinedText = '';
    const foundNames = [];
    for (const doc of docs) {
      if (doc.extractedText && doc.extractedText.trim()) {
        combinedText += `\n\n=== Документ: ${doc.originalName} ===\n${doc.extractedText}`;
        foundNames.push(doc.originalName);
      }
    }
    if (!combinedText.trim()) {
      return res.status(404).json({ success: false, message: 'Текст из документов не удалось извлечь' });
    }
    const trimmedText = combinedText.substring(0, 15000);
    const docsLabel = foundNames.length === 1
      ? `документа "${foundNames[0]}"`
      : `${foundNames.length} документов: ${foundNames.join(', ')}`;
    const promptText = `Ты — умный AI-ассистент по работе с документами. Отвечай на вопросы ТОЛЬКО на основе предоставленного текста из ${docsLabel}.
Если информации для ответа нет в тексте — ответь ТОЧНО фразой: "Информация отсутствует в загруженных файлах".
Не придумывай ничего от себя. Отвечай развернуто, красиво и по делу.
Текст документов:
${trimmedText}`;
    const bodyData = {
      modelUri: `gpt://${FOLDER_ID}/yandexgpt/latest`,
      completionOptions: {
        stream: false,
        temperature: 0.1,
        maxTokens: "2000"
      },
      messages: [
        { role: "system", text: promptText },
        { role: "user",   text: question }
      ]
    };
    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${API_KEY}`
      },
      body: JSON.stringify(bodyData)
    });
    if (!response.ok) {
      const err = await response.text();
      console.error("Ошибка от Яндекса:", err);
      throw new Error("Яндекс отклонил запрос");
    }
    const data = await response.json();
    const answer = data.result.alternatives[0].message.text;
    for (const doc of docs) {
      try {
        await prisma.questionAnswer.create({
          data: {
            documentId: doc.id,
            question,
            answer,
            sourceChunk: trimmedText.substring(0, 500)
          }
        });
      } catch (e) {
        console.log("Ошибка сохранения Q&A:", e.message);
      }
    }
    res.json({
      success: true,
      data: {
        answer,
        documentsUsed: foundNames.length,
        documentNames: foundNames
      }
    });
  } catch (error) {
    console.error("Критическая ошибка YandexGPT:", error);
    res.status(500).json({ success: false, message: 'Ошибка при обращении к нейросети Яндекса' });
  }
};
module.exports = { askQuestion };

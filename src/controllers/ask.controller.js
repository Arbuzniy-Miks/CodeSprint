const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const askQuestion = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ success: false, message: 'Не передан ID документа или вопрос' });
    }

    // 1. Достаем текст из нашей базы данных
    const document = await prisma.document.findUnique({ where: { id: documentId } });

    if (!document || !document.extractedText) {
      return res.status(404).json({ success: false, message: 'Документ не найден или текст пуст' });
    }

    const text = document.extractedText;

    // 2. Ключи доступа к YandexGPT (Прямое подключение)

    // 3. Формируем ИДЕАЛЬНЫЙ промпт (Инструкцию для Яндекса)
    const promptText = `Ты — умный AI-ассистент по работе с документами. Отвечай на вопросы ТОЛЬКО на основе предоставленного текста.
Если информации для ответа нет в тексте — ответь ТОЧНО фразой: "Информация отсутствует в загруженном файле".
Не придумывай ничего от себя. Отвечай развернуто, красиво и по делу.

Текст документа:
${text.substring(0, 15000)}`;

    // 4. Отправляем запрос в мозг Яндекса
    const bodyData = {
      modelUri: `gpt://${folderId}/yandexgpt/latest`,
      completionOptions: {
        stream: false,
        temperature: 0.1, // Низкая температура, чтобы бот не фантазировал
        maxTokens: "2000"
      },
      messages: [
        { role: "system", text: promptText },
        { role: "user", text: question }
      ]
    };

    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${apiKey}`
      },
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Ошибка от Яндекса:", err);
      throw new Error("Яндекс отклонил запрос");
    }

    const data = await response.json();
    
    // Достаем ответ от нейросети
    const answer = data.result.alternatives[0].message.text;

    // 5. Сохраняем в историю
    try {
      await prisma.questionAnswer.create({
        data: { documentId: document.id, question: question, answer: answer }
      });
    } catch (e) {
      console.log("Ошибка сохранения в БД:", e.message);
    }

    // 6. Возвращаем ответ на красивый фронтенд
    res.json({ success: true, data: { answer: answer } });

  } catch (error) {
    console.error("❌ Критическая ошибка YandexGPT:", error);
    res.status(500).json({ success: false, message: 'Ошибка при обращении к нейросети Яндекса' });
  }
};

module.exports = { askQuestion };
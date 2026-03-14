/**
 * Сервис для разбиения текста на chunks
 */
class ChunkService {
  /**
   * Разбить текст на chunks
   * @param {string} text - Исходный текст
   * @param {number} maxChunkSize - Максимальный размер chunk в символах
   * @returns {Array<string>} - Массив chunks
   */
  splitIntoChunks(text, maxChunkSize = 1000) {
    if (!text || text.length === 0) {
      return [];
    }

    const chunks = [];
    const paragraphs = text.split(/\n\s*\n/); // Разделяем по параграфам
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      // Если параграф сам по себе больше maxChunkSize, разбиваем его
      if (paragraph.length > maxChunkSize) {
        // Если текущий chunk не пустой, добавляем его
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // Разбиваем большой параграф на предложения
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        let tempChunk = '';
        
        for (const sentence of sentences) {
          if ((tempChunk + sentence).length > maxChunkSize) {
            if (tempChunk) {
              chunks.push(tempChunk.trim());
              tempChunk = sentence;
            } else {
              // Если предложение слишком большое, обрезаем
              chunks.push(sentence.substring(0, maxChunkSize));
            }
          } else {
            tempChunk += sentence;
          }
        }
        
        if (tempChunk) {
          chunks.push(tempChunk.trim());
        }
      } else {
        // Если добавление параграфа превышает лимит
        if ((currentChunk + '\n\n' + paragraph).length > maxChunkSize) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = paragraph;
        } else {
          if (currentChunk) {
            currentChunk += '\n\n' + paragraph;
          } else {
            currentChunk = paragraph;
          }
        }
      }
    }
    
    // Добавляем последний chunk
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Получить chunks по индексам
   * @param {Array<string>} chunks - Массив всех chunks
   * @param {Array<number>} indices - Индексы нужных chunks
   * @returns {Array<string>} - Массив выбранных chunks
   */
  getChunksByIndices(chunks, indices) {
    return indices
      .filter(index => index >= 0 && index < chunks.length)
      .map(index => chunks[index]);
  }
}

module.exports = new ChunkService();
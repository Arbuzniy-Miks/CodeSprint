const chunkService = require('./chunk.service');

/**
 * Сервис для поиска релевантных chunks
 */
class RetrievalService {
  constructor() {
    this.chunks = [];
  }

  /**
   * Индексировать текст
   * @param {string} text - Исходный текст
   * @param {string} documentId - ID документа
   */
  indexDocument(text, documentId) {
    const chunks = chunkService.splitIntoChunks(text);
    this.chunks = chunks.map((chunk, index) => ({
      id: `${documentId}_chunk_${index}`,
      documentId,
      text: chunk,
      index
    }));
    
    return this.chunks;
  }

  /**
   * Найти релевантные chunks по запросу
   * @param {string} query - Поисковый запрос
   * @param {number} topK - Количество результатов
   * @returns {Array} - Массив релевантных chunks
   */
  retrieveRelevantChunks(query, topK = 3) {
    if (!this.chunks.length) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const keywords = queryLower
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Простой поиск по ключевым словам
    const scoredChunks = this.chunks.map(chunk => {
      const chunkLower = chunk.text.toLowerCase();
      let score = 0;
      
      for (const keyword of keywords) {
        if (chunkLower.includes(keyword)) {
          score += 1;
          // Больше вес за точное совпадение
          if (chunkLower.includes(` ${keyword} `)) {
            score += 1;
          }
        }
      }
      
      return {
        ...chunk,
        score
      };
    });

    // Сортируем по убыванию score и берем topK
    return scoredChunks
      .filter(chunk => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Очистить индекс
   */
  clear() {
    this.chunks = [];
  }
}

module.exports = new RetrievalService();
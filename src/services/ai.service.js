const axios = require('axios');

class AIService {
    constructor() {
        this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    }

    async generateSummary(text) {
        try {
            console.log('🤖 Запрос к AI на суммаризацию...');
            
            const response = await axios.post(`${this.aiServiceUrl}/summary`, {
                text: text
            });
            
            console.log('✅ Ответ от AI получен');
            return response.data;
        } catch (error) {
            console.error('❌ Ошибка AI сервиса:', error.message);
            
            // Заглушка на случай ошибки
            return {
                summary: text.substring(0, 200) + '... (AI сервис недоступен)',
                keyPoints: ['AI сервис временно недоступен']
            };
        }
    }

    async answerQuestion(question, context) {
        try {
            console.log('🤖 Запрос к AI на ответ...');
            
            const response = await axios.post(`${this.aiServiceUrl}/ask`, {
                question: question,
                context: context
            });
            
            console.log('✅ Ответ от AI получен');
            return response.data;
        } catch (error) {
            console.error('❌ Ошибка AI сервиса:', error.message);
            
            // Заглушка на случай ошибки
            return {
                answer: 'Информация отсутствует в загруженном файле (AI сервис недоступен)',
                confidence: 0
            };
        }
    }

    async healthCheck() {
        try {
            const response = await axios.get(`${this.aiServiceUrl}/health`);
            return response.data;
        } catch (error) {
            return { status: 'unavailable' };
        }
    }
}

module.exports = new AIService();
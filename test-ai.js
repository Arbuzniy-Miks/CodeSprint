const axios = require('axios');

async function testAI() {
    try {
        console.log('Тест 1: health check через 127.0.0.1');
        const health = await axios.get('http://127.0.0.1:5001/health');
        console.log('✅ Health ответ:', health.data);

        console.log('\nТест 2: summary');
        const summary = await axios.post('http://127.0.0.1:5001/summary', {
            text: 'Это тестовый документ. Он содержит информацию о договоре аренды.'
        });
        console.log('✅ Summary ответ:', summary.data);
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Соединение отклонено. Убедитесь, что AI сервис запущен на порту 5001');
            console.error('   Проверьте: http://127.0.0.1:5001/health в браузере');
        }
        if (error.response) {
            console.error('Статус:', error.response.status);
            console.error('Данные:', error.response.data);
        }
    }
}

testAI();
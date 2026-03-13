// Конфигурация API
const API_URL = 'http://localhost:3000/api/test';
// Добавь эту функцию в начало файла
async function testConnection() {
    try {
        const response = await fetch('http://localhost:3000/');
        const data = await response.json();
        console.log('✅ Подключение успешно:', data);
        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения:', error);
        alert('Ошибка: Бэкенд не запущен! Запустите: npm run dev');
        return false;
    }
}
// Утилита для логирования
function addLog(method, endpoint, status, data) {
    const logsDiv = document.getElementById('logs');
    const time = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="log-method ${method}">${method}</span>
        <span>${endpoint}</span>
        <span style="color: ${status < 400 ? '#49cc90' : '#f93e3e'}"> - ${status}</span>
    `;
    
    logsDiv.insertBefore(logEntry, logsDiv.firstChild);
}

// Очистить логи
function clearLogs() {
    document.getElementById('logs').innerHTML = '';
}

// Утилита для отображения результатов
function displayResult(elementId, data, isError = false) {
    const resultDiv = document.getElementById(elementId);
    resultDiv.textContent = JSON.stringify(data, null, 2);
    resultDiv.className = `result ${isError ? 'error' : 'success'}`;
}

// Проверка здоровья сервера
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        addLog('GET', '/health', response.status, data);
        displayResult('statusResult', data);
    } catch (error) {
        addLog('GET', '/health', 0, error);
        displayResult('statusResult', { error: error.message }, true);
    }
}

// Получить всех пользователей
async function getUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();
        
        addLog('GET', '/users', response.status, data);
        displayResult('usersResult', data);
    } catch (error) {
        addLog('GET', '/users', 0, error);
        displayResult('usersResult', { error: error.message }, true);
    }
}

// Получить пользователя по ID
async function getUserById() {
    const id = document.getElementById('getUserId').value;
    
    if (!id) {
        alert('Введите ID пользователя');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`);
        const data = await response.json();
        
        addLog('GET', `/users/${id}`, response.status, data);
        displayResult('userByIdResult', data, !response.ok);
    } catch (error) {
        addLog('GET', `/users/${id}`, 0, error);
        displayResult('userByIdResult', { error: error.message }, true);
    }
}

// Создать пользователя
async function createUser() {
    const name = document.getElementById('createName').value;
    const email = document.getElementById('createEmail').value;
    const role = document.getElementById('createRole').value;
    
    if (!name || !email) {
        alert('Заполните имя и email');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, role })
        });
        
        const data = await response.json();
        
        addLog('POST', '/users', response.status, data);
        displayResult('createResult', data, !response.ok);
        
        // Очистить форму при успехе
        if (response.ok) {
            document.getElementById('createName').value = '';
            document.getElementById('createEmail').value = '';
            document.getElementById('createRole').value = 'user';
        }
    } catch (error) {
        addLog('POST', '/users', 0, error);
        displayResult('createResult', { error: error.message }, true);
    }
}

// Обновить пользователя
async function updateUser() {
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const email = document.getElementById('updateEmail').value;
    const role = document.getElementById('updateRole').value;
    
    if (!id) {
        alert('Введите ID пользователя');
        return;
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        addLog('PUT', `/users/${id}`, response.status, data);
        displayResult('updateResult', data, !response.ok);
        
        // Очистить форму при успехе
        if (response.ok) {
            document.getElementById('updateId').value = '';
            document.getElementById('updateName').value = '';
            document.getElementById('updateEmail').value = '';
            document.getElementById('updateRole').value = '';
        }
    } catch (error) {
        addLog('PUT', `/users/${id}`, 0, error);
        displayResult('updateResult', { error: error.message }, true);
    }
}

// Удалить пользователя
async function deleteUser() {
    const id = document.getElementById('deleteId').value;
    
    if (!id) {
        alert('Введите ID пользователя');
        return;
    }
    
    if (!confirm(`Вы уверены, что хотите удалить пользователя с ID ${id}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        addLog('DELETE', `/users/${id}`, response.status, data);
        displayResult('deleteResult', data, !response.ok);
        
        // Очистить форму при успехе
        if (response.ok) {
            document.getElementById('deleteId').value = '';
        }
    } catch (error) {
        addLog('DELETE', `/users/${id}`, 0, error);
        displayResult('deleteResult', { error: error.message }, true);
    }
}

// Эхо тест
async function echoTest() {
    const echoData = document.getElementById('echoData').value;
    
    let jsonData;
    try {
        jsonData = JSON.parse(echoData || '{}');
    } catch (e) {
        alert('Невалидный JSON');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/echo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });
        
        const data = await response.json();
        
        addLog('POST', '/echo', response.status, data);
        displayResult('echoResult', data);
    } catch (error) {
        addLog('POST', '/echo', 0, error);
        displayResult('echoResult', { error: error.message }, true);
    }
}

// Автоматическая проверка при загрузке страницы
window.addEventListener('load', async () => {
    const isConnected = await testConnection();
    
    if (isConnected) {
        checkHealth();
        addLog('INFO', 'Frontend loaded', 200, { message: 'Тестер готов к работе' });
    }
});
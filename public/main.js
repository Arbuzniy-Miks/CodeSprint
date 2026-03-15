// Chat state
let chatSessions = []; // Все сохранённые чаты
let currentSessionId = null; // ID активного чата

// DOM elements
const chatInput = document.getElementById('chat-input');
const sendBtn = document.querySelector('.send-btn');
const chatMessages = document.getElementById('chat-messages');
const welcomeScreen = document.getElementById('welcome-screen');
const historyToday = document.getElementById('history-today');
const historyWeek = document.getElementById('history-week');
const historyMonth = document.getElementById('history-month');

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    
    if (this.scrollHeight > 200) {
        this.style.overflowY = 'auto';
    } else {
        this.style.overflowY = 'hidden';
    }
});

// Send message
function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    welcomeScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');
    
    addMessageToSession('user', text);
    
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    setTimeout(() => {
        const aiResponse = generateMockResponse(text);
        addMessageToSession('ai', aiResponse);
    }, 1000);
}

// Создать новую сессию
function createNewSession(firstMessage) {
    const session = {
        id: Date.now(),
        title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date()
    };
    chatSessions.push(session);
    currentSessionId = session.id;
    return session;
}

// Получить активную сессию
function getCurrentSession() {
    return chatSessions.find(s => s.id === currentSessionId);
}

// Добавить сообщение в активную сессию
function addMessageToSession(sender, text) {
    let session = getCurrentSession();
    
    if (!session) {
        session = createNewSession(text);
    }
    
    const message = {
        id: Date.now(),
        sender: sender,
        text: text,
        time: new Date()
    };
    
    session.messages.push(message);
    session.lastActivity = new Date();
    
    if (session.messages.filter(m => m.sender === 'user').length === 1) {
        session.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
    }
    
    renderMessage(message);
    updateHistorySidebar();
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return message;
}

// Загрузить сессию из истории
function loadSession(sessionId) {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    currentSessionId = sessionId;
    chatMessages.innerHTML = '';
    welcomeScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');
    
    session.messages.forEach(msg => renderMessage(msg));
    chatInput.focus();
}

// Render single message
function renderMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender}`;
    
    const avatar = message.sender === 'user' ? 'Вы' : 'AI';
    const timeStr = message.time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-text">${escapeHtml(message.text)}</div>
            <div class="message-time">${timeStr}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
}

// Generate mock AI response
function generateMockResponse(userText) {
    const responses = [
        "Это интересный вопрос! Позвольте мне помочь вам разобраться.",
        "Я понимаю, о чем вы говорите. Вот что я думаю по этому поводу...",
        "Спасибо за ваш вопрос! Вот мой ответ:",
        "Отличный вопрос! Давайте рассмотрим это подробнее.",
        "Я могу помочь вам с этим. Вот информация, которую вы ищете:"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           "\n\nПока это заглушка. Когда подключим бэкенд, здесь будет настоящий ответ от ИИ.";
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

function updateHistorySidebar() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const todaySessions = [];
    const weekSessions = [];
    const monthSessions = [];
    
    chatSessions.forEach(session => {
        const lastDate = new Date(session.lastActivity);
        const preview = session.title;
        
        if (lastDate >= today) {
            todaySessions.push({ id: session.id, title: preview, time: lastDate });
        } else if (lastDate >= weekAgo) {
            weekSessions.push({ id: session.id, title: preview, time: lastDate });
        } else if (lastDate >= monthAgo) {
            monthSessions.push({ id: session.id, title: preview, time: lastDate });
        }
    });
    
    renderHistorySection(historyToday, todaySessions, true);
    renderHistorySection(historyWeek, weekSessions, true);
    renderHistorySection(historyMonth, monthSessions, true);
}

function renderHistorySection(container, items, isSession = false) {
    container.innerHTML = '';
    
    items.reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = item.title;
        div.title = new Date(item.time).toLocaleString('ru-RU');
        
        if (isSession) {
            div.style.cursor = 'pointer';
            div.addEventListener('click', () => loadSession(item.id));
        }
        
        container.appendChild(div);
    });
}

document.querySelector('.sidebar-nav li:first-child').addEventListener('click', () => {
    currentSessionId = null;
    chatMessages.innerHTML = '';
    chatMessages.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    chatInput.focus();
});

// Event listeners
sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

chatInput.focus();

// Modal elements
const loginModal = document.getElementById('login-modal');
const loginBtn = document.querySelector('.login-btn');
const modalClose = document.getElementById('modal-close');
const registerBtn = document.getElementById('register-btn');
const passwordInput = document.getElementById('password-input');
const emailInput = document.getElementById('email-input');

loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    emailInput.focus();
});

modalClose.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.add('hidden');
    }
});

registerBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        if (!email) emailInput.style.borderColor = '#ff4444';
        if (!password) passwordInput.style.borderColor = '#ff4444';
        
        setTimeout(() => {
            emailInput.style.borderColor = '#3a3a3a';
            passwordInput.style.borderColor = '#3a3a3a';
        }, 2000);
        return;
    }
    
    mockLogin(email);
    loginModal.classList.add('hidden');
    emailInput.value = '';
    passwordInput.value = '';
});

function mockLogin(email) {
    window.currentUser = { email: email };
    
    const displayEmail = document.getElementById('display-email');
    const userProfile = document.getElementById('user-profile');
    
    displayEmail.textContent = email;
    userProfile.classList.remove('hidden');
    document.body.classList.add('logged-in');
    
    console.log('✓ Пользователь "вошёл":', email);
}

emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        registerBtn.click();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !loginModal.classList.contains('hidden')) {
        loginModal.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (window.currentUser?.email) {
        document.getElementById('display-email').textContent = window.currentUser.email;
        document.getElementById('user-profile').classList.remove('hidden');
        document.body.classList.add('logged-in');
    }
});

// Profile Modal elements
const profileModal = document.getElementById('profile-modal');
const userProfile = document.getElementById('user-profile');
const profileModalClose = document.getElementById('profile-modal-close');
const profileModalEmail = document.getElementById('profile-modal-email');
const signOutBtn = document.getElementById('sign-out-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');

const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteConfirmClose = document.getElementById('delete-confirm-close');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

userProfile.addEventListener('click', () => {
    if (window.currentUser?.email) {
        profileModalEmail.textContent = window.currentUser.email;
        profileModal.classList.remove('hidden');
    }
});

profileModalClose.addEventListener('click', () => {
    profileModal.classList.add('hidden');
});

profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        profileModal.classList.add('hidden');
    }
});

signOutBtn.addEventListener('click', () => {
    window.currentUser = null;
    document.getElementById('user-profile').classList.add('hidden');
    document.body.classList.remove('logged-in');
    profileModal.classList.add('hidden');
    console.log('✓ Пользователь вышел');
});

deleteAccountBtn.addEventListener('click', () => {
    profileModal.classList.add('hidden');
    deleteConfirmModal.classList.remove('hidden');
});

deleteConfirmClose.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
});

cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
});

deleteConfirmModal.addEventListener('click', (e) => {
    if (e.target === deleteConfirmModal) {
        deleteConfirmModal.classList.add('hidden');
    }
});

confirmDeleteBtn.addEventListener('click', () => {
    console.log('⚠️ Account deleted:', window.currentUser?.email);
    
    window.currentUser = null;
    document.getElementById('user-profile').classList.add('hidden');
    document.body.classList.remove('logged-in');
    deleteConfirmModal.classList.add('hidden');
    
    chatSessions = [];
    currentSessionId = null;
    chatMessages.innerHTML = '';
    chatMessages.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    
    alert('Account deleted successfully');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!profileModal.classList.contains('hidden')) {
            profileModal.classList.add('hidden');
        }
        if (!deleteConfirmModal.classList.contains('hidden')) {
            deleteConfirmModal.classList.add('hidden');
        }
    }
});

// ===== ФУНКЦИОНАЛ ЗАГРУЗКИ ФАЙЛОВ =====
// Хранилище ID последнего документа
window.lastDocumentId = null;

// Создаем скрытый input для выбора файлов
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.pdf,.jpg,.jpeg,.png,.docx,.txt';
fileInput.style.display = 'none';
fileInput.multiple = false;
document.body.appendChild(fileInput);

// Находим кнопки для загрузки
const attachBtn = document.querySelector('.option-btn[title="Прикрепить файл"]');
const scanBtn = document.querySelector('.option-btn[title="Сканер"]');
const photoBtn = document.querySelector('.option-btn[title="Фото"]');

console.log('🔍 Кнопки найдены:', {
    attachBtn: !!attachBtn,
    scanBtn: !!scanBtn,
    photoBtn: !!photoBtn
});

// Функция загрузки файла на сервер
async function uploadFile(file) {
    console.log('🚀 uploadFile вызвана!', file);
    console.log('Имя файла:', file.name);
    console.log('Размер:', file.size);
    
    const formData = new FormData();
    formData.append('file', file);
    
    addMessageToSession('user', `📎 Загружаю файл: ${file.name}`);
    
    try {
        console.log('📤 Отправка запроса на /api/upload...');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Ответ получен, статус:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Ошибка ответа:', errorText);
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Файл загружен, результат:', result);
        
        window.lastDocumentId = result.data?.id;
        console.log('💾 Сохранен ID документа:', window.lastDocumentId);
        
        addMessageToSession('ai', `✅ Файл "${file.name}" успешно загружен и обработан.\n\nТеперь вы можете задавать вопросы по этому документу.`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        addMessageToSession('ai', `❌ Ошибка при загрузке файла: ${error.message}`);
    }
}

// Обработчик выбора файла
fileInput.addEventListener('change', function(e) {
    console.log('📁 Файл выбран!', this.files);
    if (this.files && this.files[0]) {
        console.log('✅ Есть файл, вызываем uploadFile');
        uploadFile(this.files[0]);
    } else {
        console.log('❌ Файл не выбран');
    }
    this.value = '';
});

// Привязываем кнопки к выбору файла
if (attachBtn) {
    attachBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('📎 Нажата кнопка "Прикрепить файл"');
        fileInput.accept = '.pdf,.jpg,.jpeg,.png,.docx,.txt';
        fileInput.click();
    });
}

if (scanBtn) {
    scanBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('📷 Нажата кнопка "Сканер"');
        fileInput.accept = '.jpg,.jpeg,.png';
        fileInput.click();
    });
}

if (photoBtn) {
    photoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🖼️ Нажата кнопка "Фото"');
        fileInput.accept = '.jpg,.jpeg,.png';
        fileInput.click();
    });
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С AI =====
// Функция для получения краткой сводки
async function getDocumentSummary() {
    console.log('📄 Запрос сводки для документа:', window.lastDocumentId);
    
    if (!window.lastDocumentId) {
        addMessageToSession('ai', '❌ Сначала загрузите документ');
        return;
    }
    
    try {
        const response = await fetch(`/api/summary/${window.lastDocumentId}`);
        console.log('📥 Ответ от /api/summary, статус:', response.status);
        
        if (!response.ok) throw new Error('Ошибка получения сводки');
        
        const data = await response.json();
        console.log('✅ Получена сводка:', data);
        
        addMessageToSession('ai', `📄 **Краткая сводка документа:**\n\n${data.summary || 'Сводка не доступна'}`);
    } catch (error) {
        console.error('❌ Ошибка получения сводки:', error);
        addMessageToSession('ai', `❌ Ошибка при получении сводки: ${error.message}`);
    }
}

// Функция для вопроса по документу
async function askQuestion(question) {
    console.log('❓ Запрос ответа на вопрос:', question);
    console.log('📄 ID документа:', window.lastDocumentId);
    
    if (!window.lastDocumentId) {
        addMessageToSession('ai', '❌ Сначала загрузите документ');
        return '❌ Сначала загрузите документ';
    }
    
    try {
        const response = await fetch('/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                documentId: window.lastDocumentId,
                question: question
            })
        });
        
        console.log('📥 Ответ от /api/ask, статус:', response.status);
        
        if (!response.ok) throw new Error('Ошибка получения ответа');
        
        const data = await response.json();
        console.log('✅ Получен ответ:', data);
        
        return data.answer || 'Нет ответа';
    } catch (error) {
        console.error('❌ Ошибка:', error);
        return `❌ Ошибка: ${error.message}`;
    }
}

// Финальная версия sendMessage с поддержкой AI
window.sendMessage = async function() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    console.log('📝 Отправка сообщения:', text);
    console.log('📄 ID документа:', window.lastDocumentId);
    
    welcomeScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');
    
    addMessageToSession('user', text);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Проверяем, есть ли запрос на сводку
    if (text.toLowerCase().includes('сводк') || 
        text.toLowerCase().includes('summary') || 
        text.toLowerCase().includes('кратк') ||
        text.toLowerCase().includes('о чем')) {
        
        console.log('📄 Обнаружен запрос сводки');
        await getDocumentSummary();
    } 
    else if (window.lastDocumentId) {
        console.log('❓ Есть документ, отправляем вопрос к AI');
        const answer = await askQuestion(text);
        addMessageToSession('ai', answer);
    } 
    else {
        console.log('🤖 Нет документа, используем заглушку');
        setTimeout(() => {
            const aiResponse = generateMockResponse(text);
            addMessageToSession('ai', aiResponse);
        }, 1000);
    }
};

// Переназначаем обработчик кнопки отправки
sendBtn.removeEventListener('click', sendMessage);
sendBtn.addEventListener('click', window.sendMessage);

// Обновляем обработчик Enter
chatInput.removeEventListener('keydown', chatInput._keydownHandler);
chatInput._keydownHandler = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.sendMessage();
    }
};
chatInput.addEventListener('keydown', chatInput._keydownHandler);

console.log('✅ Загрузка файлов и AI функции инициализированы');
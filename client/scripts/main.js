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
    
    addMessageToSession('user', text); // ← изменили здесь
    
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    setTimeout(() => {
        const aiResponse = generateMockResponse(text);
        addMessageToSession('ai', aiResponse); // ← и здесь
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
    
    // Если сессии нет — создаём новую
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
    
    // Обновляем заголовок, если это первое сообщение пользователя
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

// Обновляем renderHistorySection — добавляем клик по сессии
function renderHistorySection(container, items, isSession = false) {
    container.innerHTML = '';
    
    items.reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = item.title;
        div.title = new Date(item.time).toLocaleString('ru-RU');
        
        // Если это сессия — добавляем клик для загрузки
        if (isSession) {
            div.style.cursor = 'pointer';
            div.addEventListener('click', () => loadSession(item.id));
        }
        
        container.appendChild(div);
    });
}

document.querySelector('.sidebar-nav li:first-child').addEventListener('click', () => {
    // Сбрасываем активную сессию
    currentSessionId = null;
    
    // Очищаем чат и показываем приветствие
    chatMessages.innerHTML = '';
    chatMessages.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    
    // Фокус на поле ввода
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

// Focus input on load
chatInput.focus();

// Modal elements
const loginModal = document.getElementById('login-modal');
const loginBtn = document.querySelector('.login-btn');
const modalClose = document.getElementById('modal-close');
const registerBtn = document.getElementById('register-btn');
const passwordInput = document.getElementById('password-input'); // новое поле
const emailInput = document.getElementById('email-input');

// Open modal
loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    emailInput.focus();
});

// Close modal
modalClose.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

// Close modal on overlay click
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.add('hidden');
    }
});

/// Регистрация
registerBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Простая валидация
    if (!email || !password) {
        if (!email) emailInput.style.borderColor = '#ff4444';
        if (!password) passwordInput.style.borderColor = '#ff4444';
        
        setTimeout(() => {
            emailInput.style.borderColor = '#3a3a3a';
            passwordInput.style.borderColor = '#3a3a3a';
        }, 2000);
        return;
    }
    
    // ✅ "Регистрация" прошла — показываем профиль
    mockLogin(email);
    
    // Закрываем модалку
    loginModal.classList.add('hidden');
    
    // Очищаем поля
    emailInput.value = '';
    passwordInput.value = '';
});

// Функция "входа" (мок)
function mockLogin(email) {
    // Сохраняем в памяти (позже будет localStorage/бэкенд)
    window.currentUser = { email: email };
    
    // Показываем почту в сайдбаре
    const displayEmail = document.getElementById('display-email');
    const userProfile = document.getElementById('user-profile');
    
    displayEmail.textContent = email;
    userProfile.classList.remove('hidden');
    
    // Скрываем кнопку Login в хедере
    document.body.classList.add('logged-in');
    
    console.log('✓ Пользователь "вошёл":', email);
}

// Enter key in email input
emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        continueBtn.click();
    }
});

// Close modal on Escape key
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

// Delete confirmation modal
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteConfirmClose = document.getElementById('delete-confirm-close');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// Open profile modal
userProfile.addEventListener('click', () => {
    if (window.currentUser?.email) {
        profileModalEmail.textContent = window.currentUser.email;
        profileModal.classList.remove('hidden');
    }
});

// Close profile modal
profileModalClose.addEventListener('click', () => {
    profileModal.classList.add('hidden');
});

// Close profile modal on overlay click
profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        profileModal.classList.add('hidden');
    }
});

// Sign out
signOutBtn.addEventListener('click', () => {
    // Clear user data
    window.currentUser = null;
    
    // Hide profile in sidebar
    document.getElementById('user-profile').classList.add('hidden');
    
    // Show login button
    document.body.classList.remove('logged-in');
    
    // Close modal
    profileModal.classList.add('hidden');
    
    // Clear chat sessions (опционально)
    // chatSessions = [];
    // currentSessionId = null;
    
    console.log('✓ Пользователь вышел');
});

// Open delete confirmation
deleteAccountBtn.addEventListener('click', () => {
    profileModal.classList.add('hidden');
    deleteConfirmModal.classList.remove('hidden');
});

// Close delete confirmation
deleteConfirmClose.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
});

cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
});

// Close delete modal on overlay click
deleteConfirmModal.addEventListener('click', (e) => {
    if (e.target === deleteConfirmModal) {
        deleteConfirmModal.classList.add('hidden');
    }
});

// Confirm delete account
confirmDeleteBtn.addEventListener('click', () => {
    // Here you would send delete request to backend
    console.log('⚠️ Account deleted:', window.currentUser?.email);
    
    // Clear user data
    window.currentUser = null;
    
    // Hide profile in sidebar
    document.getElementById('user-profile').classList.add('hidden');
    
    // Show login button
    document.body.classList.remove('logged-in');
    
    // Close modal
    deleteConfirmModal.classList.add('hidden');
    
    // Clear chat
    chatSessions = [];
    currentSessionId = null;
    chatMessages.innerHTML = '';
    chatMessages.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    
    alert('Account deleted successfully');
});

// Close modals on Escape key
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
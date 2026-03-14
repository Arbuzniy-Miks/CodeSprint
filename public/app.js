console.log('DocMind app.js loaded');

// ========== STATE ==========
let chatSessions     = [];
let currentSessionId = null;
let attachedFile     = null;
let lastDocumentId   = null;
let authToken        = localStorage.getItem('docmind_token') || null;
let currentUser      = null;

// ========== DOM ==========
const chatInput       = document.getElementById('chat-input');
const sendBtn         = document.querySelector('.send-btn');
const chatMessages    = document.getElementById('chat-messages');
const welcomeScreen   = document.getElementById('welcome-screen');
const documentsList   = document.getElementById('documents-list');
const historyToday    = document.getElementById('history-today');
const historyWeek     = document.getElementById('history-week');
const historyMonth    = document.getElementById('history-month');
const backendStatus   = document.getElementById('backend-status');

const attachedFileInfo = document.getElementById('attached-file-info');
const attachedFileName = document.getElementById('attached-file-name');

const loginModal     = document.getElementById('login-modal');
const loginBtn       = document.getElementById('login-btn');
const modalClose     = document.getElementById('modal-close');

const regEmail       = document.getElementById('reg-email');
const regPassword    = document.getElementById('reg-password');
const regPassword2   = document.getElementById('reg-password2');
const registerBtn    = document.getElementById('register-btn');
const regMessage     = document.getElementById('reg-message');

const loginEmail     = document.getElementById('login-email');
const loginPassword  = document.getElementById('login-password');
const loginSubmitBtn = document.getElementById('login-submit-btn');
const loginMessage   = document.getElementById('login-message');

const profileModal      = document.getElementById('profile-modal');
const userProfile       = document.getElementById('user-profile');
const profileModalClose = document.getElementById('profile-modal-close');
const profileModalEmail = document.getElementById('profile-modal-email');
const profileModalId    = document.getElementById('profile-modal-id');
const signOutBtn        = document.getElementById('sign-out-btn');
const deleteAccountBtn  = document.getElementById('delete-account-btn');

const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteConfirmClose = document.getElementById('delete-confirm-close');
const cancelDeleteBtn    = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn   = document.getElementById('confirm-delete-btn');

const navNewDoc = document.getElementById('nav-newdoc');
const navList   = document.getElementById('nav-list');
const navSearch = document.getElementById('nav-search');

const toastEl = document.getElementById('toast');

// ========== TOAST ==========
function showToast(msg, type = 'default', duration = 3000) {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (type !== 'default' ? ' ' + type : '');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => { toastEl.className = 'toast'; }, duration);
}

// ========== AUTH MESSAGE ==========
function setMessage(el, text, type) {
    el.textContent = text;
    el.className = 'auth-message ' + type;
}
function clearMessage(el) {
    el.textContent = '';
    el.className = 'auth-message';
}

// ========== API HELPERS ==========
function authHeaders() {
    return authToken ? { 'Authorization': 'Bearer ' + authToken } : {};
}
function authJsonHeaders() {
    return { 'Content-Type': 'application/json', ...authHeaders() };
}

// ========== HEALTH ==========
async function checkHealth() {
    try {
        await fetch('/api/health');
        backendStatus.innerHTML = '<span style="color:#4ade80;">● Online</span>';
    } catch {
        backendStatus.innerHTML = '<span style="color:#ff4444;">● Offline</span>';
    }
}

// ========== AUTH API ==========
async function apiRegister(email, password) {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
}

async function apiLogin(email, password) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
}

async function apiGetMe() {
    try {
        const res = await fetch('/api/auth/me', { headers: authHeaders() });
        if (res.ok) return (await res.json()).user;
    } catch {}
    return null;
}

async function apiDeleteAccount() {
    try {
        const res = await fetch('/api/auth/account', {
            method: 'DELETE',
            headers: authHeaders()
        });
        return res.ok;
    } catch { return false; }
}

// ========== CHAT API ==========
async function apiLoadSessions() {
    try {
        const res = await fetch('/api/chat/sessions', { headers: authHeaders() });
        if (res.ok) {
            const data = await res.json();
            return data.sessions || [];
        }
    } catch {}
    return [];
}

async function apiCreateSession(title) {
    try {
        const res = await fetch('/api/chat/sessions', {
            method: 'POST',
            headers: authJsonHeaders(),
            body: JSON.stringify({ title })
        });
        if (res.ok) return (await res.json()).session;
    } catch {}
    return null;
}

async function apiSaveMessage(sessionId, sender, text) {
    try {
        await fetch('/api/chat/sessions/' + sessionId + '/messages', {
            method: 'POST',
            headers: authJsonHeaders(),
            body: JSON.stringify({ sender, text })
        });
    } catch {}
}

async function apiUpdateSessionTitle(sessionId, title) {
    try {
        await fetch('/api/chat/sessions/' + sessionId, {
            method: 'PATCH',
            headers: authJsonHeaders(),
            body: JSON.stringify({ title })
        });
    } catch {}
}

async function apiDeleteSession(sessionId) {
    try {
        await fetch('/api/chat/sessions/' + sessionId, {
            method: 'DELETE',
            headers: authHeaders()
        });
    } catch {}
}

// ========== UPLOAD & DOCS API ==========
async function uploadFileToBackend(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: authHeaders(),
            body: formData
        });
        const data = await res.json();
        return { success: res.ok, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function loadDocumentsFromBackend() {
    try {
        const res = await fetch('/api/documents', { headers: authHeaders() });
        const data = await res.json();
        return Array.isArray(data) ? data : (data.data || data.documents || []);
    } catch { return []; }
}

// ========== AUTH STATE ==========
function setLoggedIn(user, token) {
    authToken = token;
    currentUser = user;
    localStorage.setItem('docmind_token', token);
    document.getElementById('display-email').textContent = user.email;
    document.getElementById('user-profile').classList.remove('hidden');
    document.body.classList.add('logged-in');
}

function setLoggedOut() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('docmind_token');
    document.getElementById('user-profile').classList.add('hidden');
    document.body.classList.remove('logged-in');
}

async function restoreSession() {
    if (!authToken) return;
    const user = await apiGetMe();
    if (user) {
        currentUser = user;
        document.getElementById('display-email').textContent = user.email;
        document.getElementById('user-profile').classList.remove('hidden');
        document.body.classList.add('logged-in');
        // Загружаем историю из БД
        await loadSessionsFromDB();
    } else {
        setLoggedOut();
    }
}

// ========== LOAD SESSIONS FROM DB ==========
async function loadSessionsFromDB() {
    const sessions = await apiLoadSessions();
    if (!sessions.length) return;

    chatSessions = sessions.map(s => ({
        id: s.id,
        dbId: s.id,
        title: s.title,
        messages: (s.messages || []).map(m => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            time: new Date(m.createdAt)
        })),
        createdAt: new Date(s.createdAt),
        lastActivity: new Date(s.updatedAt)
    }));

    updateHistorySidebar();
}

// ========== MODAL TABS ==========
document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-' + target).classList.add('active');
        clearMessage(regMessage);
        clearMessage(loginMessage);
    });
});

// ========== REGISTER ==========
registerBtn.addEventListener('click', async () => {
    const email = regEmail.value.trim();
    const pass  = regPassword.value;
    const pass2 = regPassword2.value;
    clearMessage(regMessage);

    if (!email || !pass || !pass2) { setMessage(regMessage, 'Заполните все поля', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage(regMessage, 'Введите корректный email', 'error'); return; }
    if (pass.length < 4) { setMessage(regMessage, 'Пароль минимум 4 символа', 'error'); return; }
    if (pass !== pass2) { setMessage(regMessage, 'Пароли не совпадают', 'error'); return; }

    registerBtn.disabled = true;
    registerBtn.innerHTML = '<span class="btn-spinner"></span>Registering...';

    const result = await apiRegister(email, pass);

    registerBtn.disabled = false;
    registerBtn.textContent = 'Register';

    if (result.ok) {
        setMessage(regMessage, '✅ Аккаунт создан!', 'success');
        setLoggedIn(result.data.user, result.data.token);
        await loadSessionsFromDB();
        setTimeout(() => {
            loginModal.classList.add('hidden');
            resetRegForm();
            showToast('Добро пожаловать, ' + result.data.user.email + '!', 'success');
        }, 800);
    } else {
        const msg = result.data.error || 'Ошибка регистрации';
        setMessage(regMessage, '❌ ' + msg + (result.status === 409 ? ' — войдите во вкладке "Login"' : ''), 'error');
    }
});

function resetRegForm() {
    regEmail.value = '';
    regPassword.value = '';
    regPassword2.value = '';
    clearMessage(regMessage);
}

regEmail.addEventListener('keydown',     e => { if (e.key === 'Enter') regPassword.focus(); });
regPassword.addEventListener('keydown',  e => { if (e.key === 'Enter') regPassword2.focus(); });
regPassword2.addEventListener('keydown', e => { if (e.key === 'Enter') registerBtn.click(); });

// ========== LOGIN ==========
loginSubmitBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const pass  = loginPassword.value;
    clearMessage(loginMessage);

    if (!email || !pass) { setMessage(loginMessage, 'Введите email и пароль', 'error'); return; }

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerHTML = '<span class="btn-spinner"></span>Входим...';

    const result = await apiLogin(email, pass);

    loginSubmitBtn.disabled = false;
    loginSubmitBtn.textContent = 'Login';

    if (result.ok) {
        setMessage(loginMessage, '✅ Вход выполнен!', 'success');
        setLoggedIn(result.data.user, result.data.token);
        // Загружаем историю сразу после входа
        await loadSessionsFromDB();
        setTimeout(() => {
            loginModal.classList.add('hidden');
            loginEmail.value = '';
            loginPassword.value = '';
            clearMessage(loginMessage);
            showToast('Добро пожаловать, ' + result.data.user.email + '!', 'success');
        }, 600);
    } else {
        setMessage(loginMessage, '❌ ' + (result.data.error || 'Неверный email или пароль'), 'error');
    }
});

loginEmail.addEventListener('keydown',    e => { if (e.key === 'Enter') loginPassword.focus(); });
loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') loginSubmitBtn.click(); });

// ========== OPEN/CLOSE MODAL ==========
loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="register"]').classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-register').classList.add('active');
    clearMessage(regMessage);
    clearMessage(loginMessage);
    setTimeout(() => regEmail.focus(), 100);
});

modalClose.addEventListener('click', () => loginModal.classList.add('hidden'));
loginModal.addEventListener('click', e => { if (e.target === loginModal) loginModal.classList.add('hidden'); });

// ========== PROFILE MODAL ==========
userProfile.addEventListener('click', () => {
    if (!currentUser) return;
    profileModalEmail.textContent = currentUser.email;
    if (profileModalId) profileModalId.textContent = 'ID: ' + currentUser.id;
    profileModal.classList.remove('hidden');
});

profileModalClose.addEventListener('click', () => profileModal.classList.add('hidden'));
profileModal.addEventListener('click', e => { if (e.target === profileModal) profileModal.classList.add('hidden'); });

signOutBtn.addEventListener('click', () => {
    setLoggedOut();
    chatSessions = [];
    currentSessionId = null;
    lastDocumentId = null;
    chatMessages.innerHTML = '';
    chatMessages.classList.add('hidden');
    documentsList.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    updateHistorySidebar();
    profileModal.classList.add('hidden');
    showToast('Вы вышли из аккаунта');
});

// ========== DELETE ACCOUNT ==========
deleteAccountBtn.addEventListener('click', () => {
    profileModal.classList.add('hidden');
    deleteConfirmModal.classList.remove('hidden');
});

deleteConfirmClose.addEventListener('click', () => deleteConfirmModal.classList.add('hidden'));
cancelDeleteBtn.addEventListener('click',    () => deleteConfirmModal.classList.add('hidden'));
deleteConfirmModal.addEventListener('click', e => { if (e.target === deleteConfirmModal) deleteConfirmModal.classList.add('hidden'); });

confirmDeleteBtn.addEventListener('click', async () => {
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.innerHTML = '<span class="btn-spinner"></span>Deleting...';

    const ok = await apiDeleteAccount();

    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Delete';

    if (ok) {
        setLoggedOut();
        deleteConfirmModal.classList.add('hidden');
        chatSessions = [];
        currentSessionId = null;
        lastDocumentId = null;
        chatMessages.innerHTML = '';
        chatMessages.classList.add('hidden');
        documentsList.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        updateHistorySidebar();
        showToast('Аккаунт удалён', 'error');
    } else {
        showToast('Ошибка удаления аккаунта', 'error');
        deleteConfirmModal.classList.add('hidden');
    }
});

// ========== ESCAPE ==========
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        loginModal.classList.add('hidden');
        profileModal.classList.add('hidden');
        deleteConfirmModal.classList.add('hidden');
    }
});

// ========== TEXTAREA AUTO-RESIZE ==========
chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    this.style.overflowY = this.scrollHeight > 200 ? 'auto' : 'hidden';
});

// ========== FILE ATTACHMENT ==========
// Кнопки переопределяются в inline-скрипте index.html,
// но attachedFile нужен глобально для sendMessage
function formatSize(bytes) {
    if (bytes < 1024)    return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// ========== SEND MESSAGE ==========
async function sendMessage() {
    // attachedFile может быть как локальная переменная так и window.attachedFile (из inline-скрипта)
    const file    = attachedFile || window.attachedFile || null;
    const text    = chatInput.value.trim();
    const hasFile = !!file;
    if (!text && !hasFile) return;

    welcomeScreen.classList.add('hidden');
    documentsList.classList.add('hidden');
    chatMessages.classList.remove('hidden');

    if (hasFile) {
        const fileName = file.name;
        const userText = text || '📎 ' + fileName;

        await addMessageToSession('user', userText);
        await addMessageToSession('ai', '⏳ Загружаю и распознаю "' + fileName + '"...');

        const result = await uploadFileToBackend(file);
        removeLastAiMessage();

        if (result.success) {
            const d = result.data;
            lastDocumentId = d.id || null;

            let resp = '✅ Файл "' + fileName + '" загружен!\n';
            if (d.id)            resp += '🆔 ID: ' + d.id + '\n';
            if (d.size)          resp += '📦 Размер: ' + formatSize(d.size) + '\n';
            if (d.status)        resp += '📊 Статус: ' + d.status + '\n';
            if (d.extractedText) {
                resp += '\n📝 Начало текста:\n' + d.extractedText.substring(0, 400);
                resp += '\n\n💬 Задайте вопрос по документу!';
            } else {
                resp += '\n⚠️ Текст не удалось извлечь.';
            }
            await addMessageToSession('ai', resp);
        } else {
            lastDocumentId = null;
            await addMessageToSession('ai', '❌ Ошибка: ' + (result.data?.error || result.error || 'неизвестная ошибка'));
        }

        // Сбрасываем файл и в локальной переменной, и в глобальной
        attachedFile = null;
        window.attachedFile = null;
        const fi = document.getElementById('file-upload-input');
        const ci = document.getElementById('camera-input');
        const gi = document.getElementById('gallery-input');
        if (fi) fi.value = '';
        if (ci) ci.value = '';
        if (gi) gi.value = '';
        if (attachedFileInfo) attachedFileInfo.classList.add('hidden');

    } else {
        await addMessageToSession('user', text);
        await addMessageToSession('ai', '⏳ Думаю...');

        try {
            const body = { question: text };
            if (lastDocumentId) body.documentId = lastDocumentId;

            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: authJsonHeaders(),
                body: JSON.stringify(body)
            });

            removeLastAiMessage();

            if (res.ok) {
                const data = await res.json();
                let answer = data.answer || data.response || JSON.stringify(data);
                if (data.confidence !== undefined && data.confidence > 0) {
                    answer += '\n🎯 Уверенность: ' + Math.round(data.confidence * 100) + '%';
                }
                await addMessageToSession('ai', answer);
            } else {
                await addMessageToSession('ai', generateFallback(text));
            }
        } catch {
            removeLastAiMessage();
            await addMessageToSession('ai', generateFallback(text));
        }
    }

    chatInput.value = '';
    chatInput.style.height = 'auto';
}

function generateFallback(text) {
    const l = text.toLowerCase();
    if (l.includes('помощь') || l.includes('help')) {
        return 'DocMind AI — работа с документами.\n\n📎 Прикрепите файл\n📋 List — документы\n🔍 Search — поиск\n➕ NewDoc — новый чат';
    }
    return 'Загрузите документ через 📎 и задайте вопрос по нему.';
}

function removeLastAiMessage() {
    const session = getCurrentSession();
    if (session) {
        for (let i = session.messages.length - 1; i >= 0; i--) {
            if (session.messages[i].sender === 'ai') {
                session.messages.splice(i, 1);
                break;
            }
        }
    }
    const msgs = chatMessages.querySelectorAll('.message.ai');
    if (msgs.length) msgs[msgs.length - 1].remove();
}

// ========== SESSIONS ==========
async function createNewSession(firstMessage) {
    const title = firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');

    const session = {
        id: 'local_' + Date.now(),
        dbId: null,
        title,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date()
    };

    if (authToken) {
        const dbSession = await apiCreateSession(title);
        if (dbSession) {
            session.id   = dbSession.id;
            session.dbId = dbSession.id;
        }
    }

    chatSessions.push(session);
    currentSessionId = session.id;
    return session;
}

function getCurrentSession() {
    return chatSessions.find(s => s.id === currentSessionId);
}

async function addMessageToSession(sender, text) {
    let session = getCurrentSession();
    if (!session) session = await createNewSession(text);

    const message = {
        id: Date.now() + Math.random(),
        sender,
        text,
        time: new Date()
    };

    session.messages.push(message);
    session.lastActivity = new Date();

    // Обновляем заголовок по первому сообщению пользователя
    const userMsgs = session.messages.filter(m => m.sender === 'user');
    if (userMsgs.length === 1 && sender === 'user') {
        session.title = text.substring(0, 40) + (text.length > 40 ? '...' : '');
        if (session.dbId) apiUpdateSessionTitle(session.dbId, session.title);
    }

    // Сохраняем в БД (только не-временные сообщения)
    if (session.dbId && authToken && !text.startsWith('⏳')) {
        await apiSaveMessage(session.dbId, sender, text);
    }

    renderMessage(message);
    updateHistorySidebar();
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
}

function loadSession(sessionId) {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    currentSessionId = sessionId;
    lastDocumentId = null;
    chatMessages.innerHTML = '';
    welcomeScreen.classList.add('hidden');
    documentsList.classList.add('hidden');
    chatMessages.classList.remove('hidden');
    session.messages.forEach(msg => renderMessage(msg));
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.focus();
}

function renderMessage(message) {
    const div = document.createElement('div');
    div.className = 'message ' + message.sender;
    const avatar  = message.sender === 'user' ? 'Вы' : 'AI';
    const t       = message.time instanceof Date ? message.time : new Date(message.time);
    const timeStr = t.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    div.innerHTML =
        '<div class="message-avatar">' + avatar + '</div>' +
        '<div class="message-content">' +
        '<div class="message-text">' + escapeHtml(message.text) + '</div>' +
        '<div class="message-time">' + timeStr + '</div>' +
        '</div>';

    chatMessages.appendChild(div);
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML.replace(/\n/g, '<br>');
}

// ========== HISTORY SIDEBAR ==========
function updateHistorySidebar() {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo  = new Date(today.getTime() - 7  * 86400000);
    const monthAgo = new Date(today.getTime() - 30 * 86400000);

    const t = [], w = [], m = [];
    chatSessions.forEach(s => {
        const d    = new Date(s.lastActivity);
        const item = { id: s.id, dbId: s.dbId, title: s.title, time: d };
        if (d >= today)         t.push(item);
        else if (d >= weekAgo)  w.push(item);
        else if (d >= monthAgo) m.push(item);
    });

    renderHistorySection(historyToday,  t);
    renderHistorySection(historyWeek,   w);
    renderHistorySection(historyMonth,  m);
}

function renderHistorySection(container, items) {
    container.innerHTML = '';
    [...items].reverse().forEach(item => {
        const wrap = document.createElement('div');
        wrap.className = 'history-item';
        wrap.style.cssText = 'display:flex; align-items:center; gap:6px;';

        const title = document.createElement('span');
        title.className = 'history-item-title';
        title.textContent = item.title;
        title.title = new Date(item.time).toLocaleString('ru-RU');
        title.style.cssText = 'flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;';
        title.addEventListener('click', () => loadSession(item.id));

        const del = document.createElement('button');
        del.className = 'history-item-del';
        del.textContent = '×';
        del.title = 'Удалить';
        del.addEventListener('click', async e => {
            e.stopPropagation();
            if (item.dbId && authToken) await apiDeleteSession(item.dbId);
            chatSessions = chatSessions.filter(s => s.id !== item.id);
            if (currentSessionId === item.id) {
                currentSessionId = null;
                lastDocumentId = null;
                chatMessages.innerHTML = '';
                chatMessages.classList.add('hidden');
                welcomeScreen.classList.remove('hidden');
            }
            updateHistorySidebar();
        });

        wrap.appendChild(title);
        wrap.appendChild(del);
        container.appendChild(wrap);
    });
}

// ========== NAV ==========
navNewDoc.addEventListener('click', () => {
    currentSessionId = null;
    lastDocumentId   = null;
    chatMessages.innerHTML = '';
    chatMessages.classList.add('hidden');
    documentsList.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    chatInput.focus();
});

navList.addEventListener('click', async () => {
    welcomeScreen.classList.add('hidden');
    chatMessages.classList.add('hidden');
    documentsList.classList.remove('hidden');
    documentsList.innerHTML =
        '<div class="message ai"><div class="message-avatar">AI</div>' +
        '<div class="message-content"><div class="message-text">⏳ Загружаю документы...</div></div></div>';

    const docs = await loadDocumentsFromBackend();
    documentsList.innerHTML = '';

    if (!docs.length) {
        documentsList.innerHTML =
            '<div class="message ai"><div class="message-avatar">AI</div>' +
            '<div class="message-content"><div class="message-text">📭 Документов нет. Загрузите через 📎</div></div></div>';
        return;
    }

    const header = document.createElement('div');
    header.className = 'message ai';
    header.innerHTML =
        '<div class="message-avatar">AI</div>' +
        '<div class="message-content"><div class="message-text">📋 <b>Документы (' + docs.length + '):</b></div></div>';
    documentsList.appendChild(header);

    docs.forEach((doc, i) => {
        const d      = document.createElement('div');
        d.className  = 'message ai';
        const name   = doc.originalName || doc.filename || 'Документ ' + (i + 1);
        const size   = doc.size      ? formatSize(doc.size)                          : '';
        const date   = doc.createdAt ? new Date(doc.createdAt).toLocaleString('ru-RU') : '';
        const status = doc.status    || '';

        d.innerHTML =
            '<div class="message-avatar">' + (i + 1) + '</div>' +
            '<div class="message-content"><div class="message-text">' +
            '📄 <b>' + escapeHtml(name) + '</b>' +
            (size   ? '<br>📦 ' + size   : '') +
            (status ? '<br>📊 ' + status : '') +
            (date   ? '<br>📅 ' + date   : '') +
            '<br><button class="doc-ask-btn" style="margin-top:8px; padding:6px 14px; background:#3a3a3a; border:none; border-radius:8px; color:#e0e0e0; cursor:pointer; font-size:13px;">💬 Задать вопрос</button>' +
            '</div></div>';

        d.querySelector('.doc-ask-btn').addEventListener('click', () => {
            lastDocumentId = doc.id;
            currentSessionId = null;
            chatMessages.innerHTML = '';
            documentsList.classList.add('hidden');
            chatMessages.classList.remove('hidden');
            welcomeScreen.classList.add('hidden');
            addMessageToSession('ai', '📄 Выбран: ' + name + '\nЗадайте вопрос по содержимому.');
            chatInput.focus();
        });

        documentsList.appendChild(d);
    });
});

navSearch.addEventListener('click', () => {
    const query = prompt('Поисковый запрос:');
    if (!query) return;
    welcomeScreen.classList.add('hidden');
    documentsList.classList.add('hidden');
    chatMessages.classList.remove('hidden');
    currentSessionId = null;
    chatMessages.innerHTML = '';
    addMessageToSession('user', '🔍 ' + query);

    fetch('/api/documents/search?q=' + encodeURIComponent(query), { headers: authHeaders() })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
            const results = Array.isArray(data) ? data : (data.results || []);
            if (results.length) {
                let txt = 'Найдено ' + results.length + ':\n\n';
                results.forEach((r, i) => { txt += (i + 1) + '. ' + (r.originalName || r.name) + '\n'; });
                addMessageToSession('ai', txt);
            } else {
                addMessageToSession('ai', 'Ничего не найдено по "' + query + '"');
            }
        })
        .catch(() => addMessageToSession('ai', 'Поиск пока не реализован на бэкенде.'));
});

// ========== SEND ==========
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// ========== INIT ==========
checkHealth();
setInterval(checkHealth, 30000);
restoreSession();
chatInput.focus();

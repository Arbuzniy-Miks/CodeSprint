console.log('DocMind app.js loaded');
let chatSessions     = [];
let currentSessionId = null;
let attachedFiles    = [];
let lastDocumentIds  = [];
let authToken        = localStorage.getItem('docmind_token') || null;
let currentUser      = null;
const MAX_FILES      = 5;
const TEMP_TEXTS     = ['Обрабатываю...', 'Думаю...', 'Загружаю'];
const chatInput          = document.getElementById('chat-input');
const sendBtn            = document.getElementById('send-btn') || document.querySelector('.send-btn');
const chatMessages       = document.getElementById('chat-messages');
const welcomeScreen      = document.getElementById('welcome-screen');
const documentsList      = document.getElementById('documents-list');
const historyToday       = document.getElementById('history-today');
const historyWeek        = document.getElementById('history-week');
const historyMonth       = document.getElementById('history-month');
const backendStatus      = document.getElementById('backend-status');
const attachedFileInfo   = document.getElementById('attached-file-info');
const removeAttachedEl   = document.getElementById('remove-attached');
const loginModal         = document.getElementById('login-modal');
const loginBtn           = document.getElementById('login-btn');
const modalClose         = document.getElementById('modal-close');
const regEmail           = document.getElementById('reg-email');
const regPassword        = document.getElementById('reg-password');
const regPassword2       = document.getElementById('reg-password2');
const registerBtn        = document.getElementById('register-btn');
const regMessage         = document.getElementById('reg-message');
const loginEmail         = document.getElementById('login-email');
const loginPassword      = document.getElementById('login-password');
const loginSubmitBtn     = document.getElementById('login-submit-btn');
const loginMessage       = document.getElementById('login-message');
const profileModal       = document.getElementById('profile-modal');
const userProfile        = document.getElementById('user-profile');
const profileModalClose  = document.getElementById('profile-modal-close');
const profileModalEmail  = document.getElementById('profile-modal-email');
const profileModalId     = document.getElementById('profile-modal-id');
const signOutBtn         = document.getElementById('sign-out-btn');
const deleteAccountBtn   = document.getElementById('delete-account-btn');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteConfirmClose = document.getElementById('delete-confirm-close');
const cancelDeleteBtn    = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn   = document.getElementById('confirm-delete-btn');
const navNewDoc          = document.getElementById('nav-newdoc');
const navList            = document.getElementById('nav-list');
const navSearch          = document.getElementById('nav-search');
const toastEl            = document.getElementById('toast');
const fileUploadInput    = document.getElementById('file-upload-input');
const cameraInput        = document.getElementById('camera-input');
const galleryInput       = document.getElementById('gallery-input');
function showToast(msg, type = 'default', duration = 3000) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (type !== 'default' ? ' ' + type : '');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => { toastEl.className = 'toast'; }, duration);
}
function setMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'auth-message ' + type;
}
function clearMessage(el) {
    if (!el) return;
    el.textContent = '';
    el.className = 'auth-message';
}
function authHeaders() {
    return authToken ? { 'Authorization': 'Bearer ' + authToken } : {};
}
function authJsonHeaders() {
    return { 'Content-Type': 'application/json', ...authHeaders() };
}
async function checkHealth() {
    if (!backendStatus) return;
    try {
        await fetch('/api/health');
        backendStatus.innerHTML = '<span style="color:#4ade80;">● Online</span>';
    } catch {
        backendStatus.innerHTML = '<span style="color:#ff4444;">● Offline</span>';
    }
}
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
        const res = await fetch('/api/auth/account', { method: 'DELETE', headers: authHeaders() });
        return res.ok;
    } catch { return false; }
}
async function apiLoadSessions() {
    try {
        const res = await fetch('/api/chat/sessions', { headers: authHeaders() });
        if (res.ok) return (await res.json()).sessions || [];
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
        await fetch('/api/chat/sessions/' + sessionId, { method: 'DELETE', headers: authHeaders() });
    } catch {}
}
async function uploadFileToBackend(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData });
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
function setLoggedIn(user, token) {
    authToken = token;
    currentUser = user;
    localStorage.setItem('docmind_token', token);
    const de = document.getElementById('display-email');
    if (de) de.textContent = user.email;
    const up = document.getElementById('user-profile');
    if (up) up.classList.remove('hidden');
    document.body.classList.add('logged-in');
}
function setLoggedOut() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('docmind_token');
    const up = document.getElementById('user-profile');
    if (up) up.classList.add('hidden');
    document.body.classList.remove('logged-in');
}
async function restoreSession() {
    if (!authToken) return;
    const user = await apiGetMe();
    if (user) {
        currentUser = user;
        const de = document.getElementById('display-email');
        if (de) de.textContent = user.email;
        const up = document.getElementById('user-profile');
        if (up) up.classList.remove('hidden');
        document.body.classList.add('logged-in');
        await loadSessionsFromDB();
    } else {
        setLoggedOut();
    }
}
async function loadSessionsFromDB() {
    const sessions = await apiLoadSessions();
    if (!sessions.length) return;
    chatSessions = sessions.map(s => ({
        id: s.id,
        dbId: s.id,
        title: s.title,
        messages: (s.messages || [])
            .filter(m => !TEMP_TEXTS.some(t => m.text.startsWith(t)))
            .map(m => ({
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
function formatSize(bytes) {
    if (bytes < 1024)    return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}
function renderAttachedFiles() {
    const info = document.getElementById('attached-file-info');
    if (!info) return;
    if (!attachedFiles.length) {
        info.classList.remove('file-visible');
        info.innerHTML = '';
        return;
    }
    info.classList.add('file-visible');
    info.innerHTML = '';
    attachedFiles.forEach((file, index) => {
        const tag = document.createElement('div');
        tag.style.cssText = 'display:flex;align-items:center;gap:6px;background:#3a3a3a;border-radius:8px;padding:5px 10px;font-size:13px;color:#c0c0c0;max-width:220px;flex-shrink:0;';
        const icon = document.createElement('span');
        icon.textContent = '📎';
        icon.style.flexShrink = '0';
        const name = document.createElement('span');
        name.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;';
        name.textContent = file.name;
        name.title = file.name + ' (' + formatSize(file.size) + ')';
        const del = document.createElement('button');
        del.textContent = '×';
        del.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:16px;line-height:1;padding:0 2px;flex-shrink:0;';
        del.onmouseover = () => del.style.color = '#ff4444';
        del.onmouseout  = () => del.style.color = '#888';
        del.addEventListener('click', () => {
            attachedFiles.splice(index, 1);
            if (fileUploadInput) fileUploadInput.value = '';
            if (cameraInput)     cameraInput.value = '';
            if (galleryInput)    galleryInput.value = '';
            renderAttachedFiles();
        });
        tag.appendChild(icon);
        tag.appendChild(name);
        tag.appendChild(del);
        info.appendChild(tag);
    });
    if (attachedFiles.length > 1) {
        const counter = document.createElement('div');
        counter.style.cssText = 'font-size:11px;color:#666;padding:2px 4px;align-self:center;';
        counter.textContent = attachedFiles.length + '/' + MAX_FILES;
        info.appendChild(counter);
    }
}
function clearAttachedFiles() {
    attachedFiles = [];
    if (fileUploadInput) fileUploadInput.value = '';
    if (cameraInput)     cameraInput.value = '';
    if (galleryInput)    galleryInput.value = '';
    renderAttachedFiles();
}
function addFilesToList(files) {
    if (!files || !files.length) return;
    const arr = Array.from(files);
    let added = 0;
    for (const file of arr) {
        if (attachedFiles.length >= MAX_FILES) {
            showToast('Максимум ' + MAX_FILES + ' файлов', 'error');
            break;
        }
        const isDup = attachedFiles.some(f => f.name === file.name && f.size === file.size);
        if (!isDup) { attachedFiles.push(file); added++; }
    }
    if (added > 0) renderAttachedFiles();
}
const attachBtnEl = document.getElementById('attach-btn');
if (attachBtnEl && fileUploadInput) {
    fileUploadInput.multiple = true;
    attachBtnEl.addEventListener('click', () => { fileUploadInput.value = ''; fileUploadInput.click(); });
    fileUploadInput.addEventListener('change', e => addFilesToList(e.target.files));
}
const scanBtnEl = document.getElementById('scan-btn');
if (scanBtnEl && cameraInput) {
    scanBtnEl.addEventListener('click', () => { cameraInput.value = ''; cameraInput.click(); });
    cameraInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) { addFilesToList([file]); autoUploadFromCamera(file); }
    });
}
const photoBtnEl = document.getElementById('photo-btn');
if (photoBtnEl && galleryInput) {
    galleryInput.multiple = true;
    photoBtnEl.addEventListener('click', () => { galleryInput.value = ''; galleryInput.click(); });
    galleryInput.addEventListener('change', e => addFilesToList(e.target.files));
}
if (removeAttachedEl) removeAttachedEl.addEventListener('click', clearAttachedFiles);
function addTempAiMessage(text) {
    if (!chatMessages) return;
    const message = { id: 'temp_' + Date.now(), sender: 'ai', text, time: new Date() };
    renderMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function removeLastAiMessage() {
    if (!chatMessages) return;
    const msgs = chatMessages.querySelectorAll('.message.ai');
    if (msgs.length) msgs[msgs.length - 1].remove();
}
async function autoUploadFromCamera(file) {
    attachedFiles = attachedFiles.filter(f => !(f.name === file.name && f.size === file.size));
    renderAttachedFiles();
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (documentsList) documentsList.classList.add('hidden');
    if (chatMessages)  chatMessages.classList.remove('hidden');
    await addMessageToSession('user', '📎 ' + file.name);
    addTempAiMessage('Загружаю...');
    const result = await uploadFileToBackend(file);
    removeLastAiMessage();
    if (result.success) {
        const d = result.data;
        if (d.id) {
            lastDocumentIds.push(d.id);
            lastDocumentIds = [...new Set(lastDocumentIds)];
        }
        await addMessageToSession('ai',
            '"' + file.name + '" загружен!\n' +
            (d.extractedText ? 'Задайте вопрос по документу!' : '⚠️ Текст не удалось извлечь.')
        );
    } else {
        await addMessageToSession('ai', '❌ Ошибка: ' + (result.data?.error || result.error || 'неизвестная'));
    }
}
async function sendMessage() {
    const files    = [...attachedFiles];
    const text     = chatInput ? chatInput.value.trim() : '';
    const hasFiles = files.length > 0;
    if (!text && !hasFiles) return;
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (documentsList) documentsList.classList.add('hidden');
    if (chatMessages)  chatMessages.classList.remove('hidden');
    if (chatInput) { chatInput.value = ''; chatInput.style.height = 'auto'; }
    attachedFiles = [];
    renderAttachedFiles();
    if (fileUploadInput) fileUploadInput.value = '';
    if (cameraInput)     cameraInput.value = '';
    if (galleryInput)    galleryInput.value = '';
    if (hasFiles) {
        const fileNames = files.map(f => '(' + f.name + ')').join(', ');
        const userText  = text ? text + '\n' + fileNames : fileNames;
        await addMessageToSession('user', userText);
        addTempAiMessage('Обрабатываю...');
        const newIds = [];
        for (const file of files) {
            const result = await uploadFileToBackend(file);
            if (result.success && result.data.id) newIds.push(result.data.id);
        }
        removeLastAiMessage();
        if (!newIds.length) {
            await addMessageToSession('ai', '❌ Не удалось загрузить файлы.');
            return;
        }
        lastDocumentIds.push(...newIds);
        lastDocumentIds = [...new Set(lastDocumentIds)];
        if (text) {
            await askYandex(text, lastDocumentIds);
        } else {
            await addMessageToSession('ai',
                '' + (files.length > 1 ? files.length + ' файла загружено' : '"' + files[0].name + '" загружен') +
                '\nЗадайте вопрос по документу!'
            );
        }
    } else {
        await addMessageToSession('user', text);
        await askYandex(text, lastDocumentIds);
    }
}
async function askYandex(question, docIds) {
    addTempAiMessage('Думаю...');
    try {
        const body = { question };
        if (docIds.length === 1) {
            body.documentId = docIds[0];
        } else if (docIds.length > 1) {
            body.documentIds = docIds;
            body.documentId  = docIds[docIds.length - 1];
        }
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: authJsonHeaders(),
            body: JSON.stringify(body)
        });
        removeLastAiMessage();
        if (res.ok) {
            const data = await res.json();
            const answer = (data.data && data.data.answer) || data.answer || data.response || JSON.stringify(data);
            await addMessageToSession('ai', answer);
        } else {
            const err = await res.json().catch(() => ({}));
            await addMessageToSession('ai', '❌ ' + (err.message || 'Сервер не смог ответить'));
        }
    } catch {
        removeLastAiMessage();
        await addMessageToSession('ai', '❌ Ошибка сети: сервер не отвечает.');
    }
}
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
        if (dbSession) { session.id = dbSession.id; session.dbId = dbSession.id; }
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
    const message = { id: Date.now() + Math.random(), sender, text, time: new Date() };
    session.messages.push(message);
    session.lastActivity = new Date();
    const userMsgs = session.messages.filter(m => m.sender === 'user');
    if (userMsgs.length === 1 && sender === 'user') {
        session.title = text.substring(0, 40) + (text.length > 40 ? '...' : '');
        if (session.dbId) apiUpdateSessionTitle(session.dbId, session.title);
    }
    const isTemp = TEMP_TEXTS.some(t => text.startsWith(t));
    if (session.dbId && authToken && !isTemp) {
        await apiSaveMessage(session.dbId, sender, text);
    }
    renderMessage(message);
    updateHistorySidebar();
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
}
function loadSession(sessionId) {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    currentSessionId = sessionId;
    lastDocumentIds = [];
    clearAttachedFiles();
    if (chatMessages) {
        chatMessages.innerHTML = '';
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (documentsList) documentsList.classList.add('hidden');
        chatMessages.classList.remove('hidden');
        session.messages.forEach(msg => renderMessage(msg));
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    if (chatInput) chatInput.focus();
}

function renderMessage(message) {
    if (!chatMessages) return;
    const div = document.createElement('div');
    div.className = 'message ' + message.sender;
    const avatar  = message.sender === 'user' ? 'Вы' : 'AI';
    const t       = message.time instanceof Date ? message.time : new Date(message.time);
    const timeStr = t.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const avatarEl = document.createElement('div');
    avatarEl.className = 'message-avatar';
    avatarEl.textContent = avatar;
    const content = document.createElement('div');
    content.className = 'message-content';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = escapeHtml(message.text);
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const timeEl = document.createElement('span');
    timeEl.className = 'message-time';
    timeEl.textContent = timeStr;
    if (message.sender === 'ai') {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.title = 'Скопировать';
        copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(message.text).then(() => {
                copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
                }, 2000);
            }).catch(() => showToast('Не удалось скопировать', 'error'));
        });
        meta.appendChild(copyBtn);
        meta.appendChild(timeEl);
    } else {
        meta.appendChild(timeEl);
    }
    content.appendChild(bubble);
    content.appendChild(meta);
    div.appendChild(avatarEl);
    div.appendChild(content);
    chatMessages.appendChild(div);
}
function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML.replace(/\n/g, '<br>');
}

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
    if (historyToday)  renderHistorySection(historyToday,  t);
    if (historyWeek)   renderHistorySection(historyWeek,   w);
    if (historyMonth)  renderHistorySection(historyMonth,  m);
}
function renderHistorySection(container, items) {
    container.innerHTML = '';
    [...items].reverse().forEach(item => {
        const wrap = document.createElement('div');
        wrap.className = 'history-item';
        const title = document.createElement('span');
        title.className = 'history-item-title';
        title.textContent = item.title;
        title.title = new Date(item.time).toLocaleString('ru-RU');
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
                lastDocumentIds  = [];
                if (chatMessages) { chatMessages.innerHTML = ''; chatMessages.classList.add('hidden'); }
                if (welcomeScreen) welcomeScreen.classList.remove('hidden');
            }
            updateHistorySidebar();
        });
        wrap.appendChild(title);
        wrap.appendChild(del);
        container.appendChild(wrap);
    });
}

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

if (registerBtn) {
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
            setMessage(regMessage, 'Аккаунт создан!', 'success');
            setLoggedIn(result.data.user, result.data.token);
            await loadSessionsFromDB();
            setTimeout(() => {
                loginModal.classList.add('hidden');
                resetRegForm();
                showToast('Добро пожаловать, ' + result.data.user.email + '!', 'success');
            }, 800);
        } else {
            const msg = result.data.error || 'Ошибка регистрации';
            setMessage(regMessage, '' + msg + (result.status === 409 ? ' — войдите во вкладке "Login"' : ''), 'error');
        }
    });
}
function resetRegForm() {
    if (regEmail)     regEmail.value = '';
    if (regPassword)  regPassword.value = '';
    if (regPassword2) regPassword2.value = '';
    clearMessage(regMessage);
}
if (regEmail)     regEmail.addEventListener('keydown',     e => { if (e.key === 'Enter') regPassword.focus(); });
if (regPassword)  regPassword.addEventListener('keydown',  e => { if (e.key === 'Enter') regPassword2.focus(); });
if (regPassword2) regPassword2.addEventListener('keydown', e => { if (e.key === 'Enter') registerBtn.click(); });

if (loginSubmitBtn) {
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
            setMessage(loginMessage, 'Вход выполнен!', 'success');
            setLoggedIn(result.data.user, result.data.token);
            await loadSessionsFromDB();
            setTimeout(() => {
                loginModal.classList.add('hidden');
                loginEmail.value = '';
                loginPassword.value = '';
                clearMessage(loginMessage);
                showToast('Добро пожаловать, ' + result.data.user.email + '!', 'success');
            }, 600);
        } else {
            setMessage(loginMessage, '' + (result.data.error || 'Неверный email или пароль'), 'error');
        }
    });
}
if (loginEmail)    loginEmail.addEventListener('keydown',    e => { if (e.key === 'Enter') loginPassword.focus(); });
if (loginPassword) loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') loginSubmitBtn.click(); });

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
        document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="register"]').classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-register').classList.add('active');
        clearMessage(regMessage);
        clearMessage(loginMessage);
        setTimeout(() => regEmail && regEmail.focus(), 100);
    });
}
if (modalClose) modalClose.addEventListener('click', () => loginModal.classList.add('hidden'));
if (loginModal)  loginModal.addEventListener('click', e => { if (e.target === loginModal) loginModal.classList.add('hidden'); });

if (userProfile) {
    userProfile.addEventListener('click', () => {
        if (!currentUser) return;
        if (profileModalEmail) profileModalEmail.textContent = currentUser.email;
        if (profileModalId)    profileModalId.textContent = 'ID: ' + currentUser.id;
        profileModal.classList.remove('hidden');
    });
}
if (profileModalClose) profileModalClose.addEventListener('click', () => profileModal.classList.add('hidden'));
if (profileModal) profileModal.addEventListener('click', e => { if (e.target === profileModal) profileModal.classList.add('hidden'); });
if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        setLoggedOut();
        chatSessions = []; currentSessionId = null; lastDocumentIds = [];
        clearAttachedFiles();
        if (chatMessages) { chatMessages.innerHTML = ''; chatMessages.classList.add('hidden'); }
        if (documentsList) documentsList.classList.add('hidden');
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        updateHistorySidebar();
        profileModal.classList.add('hidden');
        showToast('Вы вышли из аккаунта');
    });
}

if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', () => { profileModal.classList.add('hidden'); deleteConfirmModal.classList.remove('hidden'); });
if (deleteConfirmClose) deleteConfirmClose.addEventListener('click', () => deleteConfirmModal.classList.add('hidden'));
if (cancelDeleteBtn)    cancelDeleteBtn.addEventListener('click',    () => deleteConfirmModal.classList.add('hidden'));
if (deleteConfirmModal) deleteConfirmModal.addEventListener('click', e => { if (e.target === deleteConfirmModal) deleteConfirmModal.classList.add('hidden'); });
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = '<span class="btn-spinner"></span>Deleting...';
        const ok = await apiDeleteAccount();
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete';
        if (ok) {
            setLoggedOut();
            deleteConfirmModal.classList.add('hidden');
            chatSessions = []; currentSessionId = null; lastDocumentIds = [];
            clearAttachedFiles();
            if (chatMessages) { chatMessages.innerHTML = ''; chatMessages.classList.add('hidden'); }
            if (documentsList) documentsList.classList.add('hidden');
            if (welcomeScreen) welcomeScreen.classList.remove('hidden');
            updateHistorySidebar();
            showToast('Аккаунт удалён', 'error');
        } else {
            showToast('Ошибка удаления аккаунта', 'error');
            deleteConfirmModal.classList.add('hidden');
        }
    });
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (loginModal)         loginModal.classList.add('hidden');
        if (profileModal)       profileModal.classList.add('hidden');
        if (deleteConfirmModal) deleteConfirmModal.classList.add('hidden');
    }
});

if (chatInput) {
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
        this.style.overflowY = this.scrollHeight > 200 ? 'auto' : 'hidden';
    });
}

if (navNewDoc) {
    navNewDoc.addEventListener('click', () => {
        currentSessionId = null; lastDocumentIds = [];
        clearAttachedFiles();
        if (chatMessages) { chatMessages.innerHTML = ''; chatMessages.classList.add('hidden'); }
        if (documentsList)  documentsList.classList.add('hidden');
        if (welcomeScreen)  welcomeScreen.classList.remove('hidden');
        if (chatInput)      chatInput.focus();
    });
}
if (navList) {
    navList.addEventListener('click', async () => {
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (chatMessages)  chatMessages.classList.add('hidden');
        if (documentsList) {
            documentsList.classList.remove('hidden');
            documentsList.innerHTML =
                '<div class="message ai"><div class="message-avatar">AI</div>' +
                '<div class="message-content"><div class="message-bubble">⏳ Загружаю документы...</div></div></div>';
        }
        const docs = await loadDocumentsFromBackend();
        if (documentsList) documentsList.innerHTML = '';
        if (!docs.length) {
            if (documentsList) documentsList.innerHTML =
                '<div class="message ai"><div class="message-avatar">AI</div>' +
                '<div class="message-content"><div class="message-bubble">📭 Документов нет. Загрузите через 📎</div></div></div>';
            return;
        }
        if (documentsList) {
            const header = document.createElement('div');
            header.className = 'message ai';
            header.innerHTML = '<div class="message-avatar">AI</div><div class="message-content"><div class="message-bubble">📋 <b>Документы (' + docs.length + '):</b></div></div>';
            documentsList.appendChild(header);
            docs.forEach((doc, i) => {
                const d = document.createElement('div');
                d.className = 'message ai';
                const name   = doc.originalName || doc.filename || 'Документ ' + (i + 1);
                const size   = doc.size      ? formatSize(doc.size) : '';
                const date   = doc.createdAt ? new Date(doc.createdAt).toLocaleString('ru-RU') : '';
                const status = doc.status    || '';
                d.innerHTML =
                    '<div class="message-avatar">' + (i + 1) + '</div>' +
                    '<div class="message-content"><div class="message-bubble">' +
                    '📄 <b>' + escapeHtml(name) + '</b>' +
                    (size   ? '<br>📦 ' + size   : '') +
                    (status ? '<br>📊 ' + status : '') +
                    (date   ? '<br>📅 ' + date   : '') +
                    '<br><button class="doc-ask-btn" style="margin-top:8px;padding:6px 14px;background:#3a3a3a;border:none;border-radius:8px;color:#e0e0e0;cursor:pointer;font-size:13px;">💬 Выбрать документ</button>' +
                    '</div></div>';
                d.querySelector('.doc-ask-btn').addEventListener('click', () => {
                    lastDocumentIds = [doc.id];
                    currentSessionId = null;
                    if (chatMessages) { chatMessages.innerHTML = ''; chatMessages.classList.remove('hidden'); }
                    if (documentsList) documentsList.classList.add('hidden');
                    if (welcomeScreen) welcomeScreen.classList.add('hidden');
                    addMessageToSession('ai', '📄 Выбран: ' + name + '\nЗадайте вопрос по содержимому.');
                    if (chatInput) chatInput.focus();
                });
                documentsList.appendChild(d);
            });
        }
    });
}
if (navSearch) {
    navSearch.addEventListener('click', () => {
        const query = prompt('Поисковый запрос:');
        if (!query) return;
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (documentsList) documentsList.classList.add('hidden');
        if (chatMessages)  chatMessages.classList.remove('hidden');
        currentSessionId = null;
        if (chatMessages)  chatMessages.innerHTML = '';
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
            .catch(() => addMessageToSession('ai', 'Поиск пока не реализован.'));
    });
}
if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (chatInput) {
    chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}
checkHealth();
setInterval(checkHealth, 30000);
restoreSession();
if (chatInput) chatInput.focus();
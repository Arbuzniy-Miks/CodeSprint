console.log('app.js loaded');

const statusEl = document.getElementById('uploadStatus');

async function checkBackend() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();

    console.log('health:', data);

    if (statusEl) {
      statusEl.textContent = 'Связь с backend есть';
      statusEl.className = 'status success';
    }
  } catch (error) {
    console.error('Ошибка связи с backend:', error);

    if (statusEl) {
      statusEl.textContent = 'Нет связи с backend';
      statusEl.className = 'status error';
    }
  }
}

checkBackend();
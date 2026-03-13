🧠 DocMind AI - AI-ассистент для работы с документами
Code Sprint 2026 | 13-16 января | Загружайте PDF, JPG или PNG и получайте текст, краткую сводку и ответы на вопросы

🎯 Описание
DocMind AI - это интеллектуальный ассистент для анализа документов с использованием OCR и LLM технологий.

Какую проблему решаем?
📚 Ежедневно люди тратят часы на чтение и анализ документов. DocMind AI автоматизирует этот процесс:

Студенты - быстрый анализ учебных материалов и конспектов
Юристы - извлечение ключевой информации из договоров
Бизнес - обработка отчётов, счетов и деловой документации
Основные возможности
Функция	Описание
📄 Загрузка документов	PDF, JPG, PNG
🔍 OCR распознавание	Извлечение текста из изображений
📝 Краткая сводка	Автоматическое саммари документа
❓ Вопрос-ответ	Задавайте вопросы по содержимому
🛡️ Антигаллюцинации	Ответы только на основе документа
🛠️ Технологии
Backend
Node.js + Express
Tesseract.js (OCR)
pdf-parse
Frontend
HTML5 / CSS3
Vanilla JavaScript
AI/ML
Google Gemini API
📦 Установка
Bash

# Клонировать репозиторий
git clone https://github.com/YOUR_USERNAME/docmind-project.git
cd docmind-project

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
Отредактируйте .env:

env

GEMINI_API_KEY=your_api_key_here
PORT=3000
🚀 Запуск
Bash

# Запустить backend (development)
npm run dev

# В новом терминале - запустить frontend
cd frontend
npx http-server -p 8080
🌐 Откройте в браузере: http://localhost:8080

📁 Структура проекта
text

docmind-project/
├── src/                    # Backend
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── frontend/               # Frontend
│   ├── index.html
│   ├── styles/
│   └── js/
├── storage/                # Загруженные файлы
├── docs/                   # Документация
├── .env.example
└── README.md
👥 Команда
Участник	Роль	Задачи
🎨 Марина	Designer & Backend	UI/UX дизайн, серверная логика
💻 Саша	Frontend Developer	Клиентская часть, интерфейс
🤖 Катя	ML Engineer	Интеграция Gemini, промпты
📄 Лицензия
MIT

🏆 Code Sprint 2026


Сделано с ❤️ командой Undefined



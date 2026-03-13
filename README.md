@"
# 🧠 DocMind AI - AI-ассистент для работы с документами

> Хакатон проект: Загружайте PDF, JPG или PNG и получайте текст, краткую сводку и ответы на вопросы

## 🎯 Описание

DocMind AI - это интеллектуальный ассистент для анализа документов с использованием OCR и LLM технологий.

### Основные возможности:
- 📄 Загрузка документов (PDF, JPG, PNG)
- 🔍 OCR распознавание текста
- 📝 Автоматическое создание краткой сводки
- ❓ Вопросы-ответы по содержимому документа
- 🛡️ Защита от AI-галлюцинаций

## 🛠️ Технологии

### Backend
- Node.js + Express
- Tesseract.js (OCR)
- pdf-parse
- OpenAI API

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

## 📦 Установка

\`\`\`bash
# Клонировать репозиторий
git clone https://github.com/ВАШ_ЮЗЕРНЕЙМ/docmind-project.git
cd docmind-project

# Установить зависимости
npm install

# Создать .env файл
copy .env.example .env
# Отредактируйте .env и добавьте свой API ключ
\`\`\`

## 🚀 Запуск

\`\`\`bash
# Development режим
npm run dev

# В другом терминале запустите фронтенд
cd frontend
npx http-server -p 8080
\`\`\`

Откройте: http://localhost:8080

## 📁 Структура проекта

\`\`\`
docmind-project/
├── src/                    # Backend код
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── frontend/               # Frontend код
│   ├── index.html
│   ├── styles/
│   └── js/
├── storage/                # Хранилище файлов
├── docs/                   # Документация
└── README.md
\`\`\`

## 👥 Команда

- Марина - Full Stack Developer

## 📄 Лицензия

MIT

## 🏆 Хакатон 2024
"@ | Out-File -FilePath README.md -Encoding UTF8

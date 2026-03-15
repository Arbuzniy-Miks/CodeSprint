from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path

# Добавляем путь к текущей папке
sys.path.append(os.path.dirname(__file__))

# Импортируем вашу нейросеть
from advanced_document_analyzer import AdvancedDocumentAnalyzer
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Загружаем переменные окружения
load_dotenv()

# Инициализируем анализатор с API ключом из .env
API_KEY = os.getenv('GEMINI_API_KEY')
if not API_KEY:
    print("❌ ОШИБКА: GEMINI_API_KEY не найден в .env файле")
    print("Создайте файл .env и добавьте строку: GEMINI_API_KEY=ваш_ключ")
    sys.exit(1)

analyzer = AdvancedDocumentAnalyzer(API_KEY)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "ai-service",
        "port": os.environ.get('PORT', 5001),
        "api_key_configured": bool(API_KEY)
    })

@app.route('/summary', methods=['POST'])
def get_summary():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "Нет текста для анализа"}), 400
        
        print(f"📝 Генерация сводки...")
        summary = analyzer.get_document_summary(text)
        
        return jsonify({
            "success": True,
            "summary": summary
        })
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    try:
        data = request.json
        question = data.get('question', '')
        context = data.get('context', '')
        
        if not question:
            return jsonify({"error": "Нет вопроса"}), 400
        
        if not context:
            return jsonify({"error": "Нет контекста документа"}), 400
        
        print(f"❓ Вопрос: {question}")
        answer = analyzer.answer_question_from_document(context, question)
        
        return jsonify({
            "success": True,
            "answer": answer
        })
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Запуск AI сервиса на порту {port}")
    print(f"🔑 API ключ: {'✅ настроен' if API_KEY else '❌ НЕ НАСТРОЕН'}")
    app.run(host='0.0.0.0', port=port, debug=True)
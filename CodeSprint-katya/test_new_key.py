import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

print("🚀 ТЕСТ НОВОГО API КЛЮЧА")
print("="*50)

api_key = os.getenv("GEMINI_API_KEY")
print(f"🔑 Используется ключ: {api_key[:10]}...{api_key[-5:]}")

try:
    # Создаем клиент
    client = genai.Client(api_key=api_key)
    
    # Пробуем простой запрос
    print("\n📡 Отправка запроса к Gemini API...")
    
    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents='Напиши "Привет, мир!" на русском языке'
    )
    
    print(f"✅ УСПЕХ! Ответ получен:")
    print(f"📝 {response.text}")
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
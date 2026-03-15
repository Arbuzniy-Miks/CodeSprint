from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

print("📋 ДОСТУПНЫЕ МОДЕЛИ:")
print("="*50)

try:
    # Получаем список моделей
    models = client.models.list()
    
    for model in models:
        if 'generateContent' in str(model.supported_actions):
            print(f"✅ {model.name}")
except Exception as e:
    print(f"❌ Ошибка: {e}")
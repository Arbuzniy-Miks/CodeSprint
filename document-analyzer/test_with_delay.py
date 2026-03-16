"""
Тест с задержкой между запросами (чтобы не превышать лимиты)
"""

import os
import time
from dotenv import load_dotenv
from advanced_document_analyzer import AdvancedDocumentAnalyzer

load_dotenv()

print("ТЕСТ С ЗАДЕРЖКОЙ (чтобы не превышать лимиты)")
print("="*60)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Нет API ключа")
    exit(1)

analyzer = AdvancedDocumentAnalyzer(api_key)

test_texts = [
    ("Сегодня хорошая погода. Я иду гулять в парк.", "О чем текст?"),
    ("В современном мире цифровые технологии играют ключевую роль.", "Это AI?"),
    ("Годовой отчет: выручка 150 млн, сотрудников 150 человек.", "Какая выручка?")
]

for i, (text, question) in enumerate(test_texts, 1):
    print(f"\nТЕСТ {i}")
    print("-"*40)
    
    try:
        result = analyzer.full_analysis(
            file_content=text.encode('utf-8'),
            file_name=f"test{i}.txt",
            query=question
        )
        
        print(f"Успешно!")
        print(f"Вероятность AI: {result['ai_detection'].get('ai_probability', 'N/A')}%")
        print(f"Оригинальность: {result['originality_analysis'].get('originality_score', 'N/A')}/100")
        
    except Exception as e:
        print(f"Ошибка: {e}")
    
    if i < len(test_texts):
        print(f"\nЖдем 5 секунд перед следующим запросом...")
        time.sleep(5)

print("\n✨ ТЕСТ ЗАВЕРШЕН")
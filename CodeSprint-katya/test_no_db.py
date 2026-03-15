"""
Простой тест нейросети без подключения к базе данных
Просто запустите этот файл и увидите результат!
"""

import os
from dotenv import load_dotenv
from advanced_document_analyzer import AdvancedDocumentAnalyzer

# Загружаем API ключ из .env файла
load_dotenv()

print("🚀 ПРОВЕРКА РАБОТЫ НЕЙРОСЕТИ")
print("="*60)

# Проверяем наличие API ключа
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ Ошибка: Не найден API ключ в файле .env")
    print("📝 Создайте файл .env и добавьте строку: GEMINI_API_KEY=ваш_ключ")
    exit(1)

print("✅ API ключ найден")

# Создаем анализатор
try:
    analyzer = AdvancedDocumentAnalyzer(api_key)
    print("✅ Анализатор создан")
except Exception as e:
    print(f"❌ Ошибка при создании анализатора: {e}")
    exit(1)

# Тест 1: Короткий текст
print("\n" + "="*60)
print("📝 ТЕСТ 1: Анализ короткого текста")
print("="*60)

text1 = "Сегодня хорошая погода. Я иду гулять в парк."
print(f"Текст: {text1}")

try:
    result1 = analyzer.full_analysis(
        file_content=text1.encode('utf-8'),
        file_name="test1.txt",
        query="О чем этот текст?"
    )
    
    print(f"\n✅ Результат:")
    print(f"   🤖 Вероятность AI: {result1['ai_detection'].get('ai_probability', 'N/A')}%")
    print(f"   📝 Оригинальность: {result1['originality_analysis'].get('originality_score', 'N/A')}/100")
    print(f"   ❓ Ответ: {result1.get('answer_to_query', 'N/A')}")
except Exception as e:
    print(f"❌ Ошибка: {e}")

# Тест 2: Текст похожий на AI
print("\n" + "="*60)
print("🤖 ТЕСТ 2: Анализ текста, похожего на AI")
print("="*60)

text2 = """
В современном мире цифровые технологии играют ключевую роль в развитии бизнеса.
Оптимизация процессов и внедрение инновационных решений позволяют компаниям
достигать поставленных целей. Важно отметить, что синергия между различными
подсистемами создает благоприятную среду для масштабирования.
"""
print(f"Текст: {text2[:100]}...")

try:
    result2 = analyzer.full_analysis(
        file_content=text2.encode('utf-8'),
        file_name="test2.txt",
        query="Этот текст похож на AI?"
    )
    
    print(f"\n✅ Результат:")
    print(f"   🤖 Вероятность AI: {result2['ai_detection'].get('ai_probability', 'N/A')}%")
    print(f"   📝 Оригинальность: {result2['originality_analysis'].get('originality_score', 'N/A')}/100")
    print(f"   ❓ Ответ: {result2.get('answer_to_query', 'N/A')}")
except Exception as e:
    print(f"❌ Ошибка: {e}")

# Тест 3: Длинный текст
print("\n" + "="*60)
print("📚 ТЕСТ 3: Анализ длинного текста")
print("="*60)

text3 = """
Годовой отчет компании за 2025 год.

Финансовые показатели:
- Выручка: 150 млн рублей
- Чистая прибыль: 25 млн рублей
- Количество сотрудников: 150 человек

Основные достижения:
1. Запуск нового продукта в марте
2. Выход на рынок Казахстана
3. Увеличение клиентской базы на 30%

Планы на 2026 год:
- Расширение команды разработки
- Открытие офиса в Санкт-Петербурге
- Запуск мобильного приложения
"""

try:
    result3 = analyzer.full_analysis(
        file_content=text3.encode('utf-8'),
        file_name="test3.txt",
        query="Какая выручка компании и сколько сотрудников?"
    )
    
    print(f"\n✅ Результат:")
    print(f"   🤖 Вероятность AI: {result3['ai_detection'].get('ai_probability', 'N/A')}%")
    print(f"   📝 Оригинальность: {result3['originality_analysis'].get('originality_score', 'N/A')}/100")
    print(f"   ❓ Ответ: {result3.get('answer_to_query', 'N/A')}")
except Exception as e:
    print(f"❌ Ошибка: {e}")

print("\n" + "="*60)
print("✨ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!")
print("="*60)
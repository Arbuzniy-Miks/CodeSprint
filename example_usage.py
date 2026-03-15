#!/usr/bin/env python
"""
Пример использования анализатора документов
"""

import os
from advanced_document_analyzer import (
    AdvancedDocumentAnalyzer,
    run_analysis_pipeline,
    load_files_from_directory
)
from dotenv import load_dotenv

load_dotenv()

def main():
    print("="*60)
    print("🔍 ПРИМЕР ИСПОЛЬЗОВАНИЯ АНАЛИЗАТОРА ДОКУМЕНТОВ")
    print("="*60)
    
    # Вариант 1: Анализ одного файла вручную
    print("\n📁 Вариант 1: Ручной анализ одного файла")
    analyzer = AdvancedDocumentAnalyzer(os.getenv("GEMINI_API_KEY"))
    
    # Создаем тестовый текстовый файл
    test_text = "Это тестовый документ для проверки работы системы."
    result = analyzer.full_analysis(
        file_content=test_text.encode('utf-8'),
        file_name="test.txt",
        query="Что это за документ?"
    )
    print(f"Результат: {result['answer_to_query']}")
    
    # Вариант 2: Анализ через пайплайн
    print("\n📊 Вариант 2: Анализ через пайплайн с сохранением в БД")
    
    # Подготавливаем тестовые файлы
    files_data = []
    
    # Текстовый файл
    files_data.append((
        test_text.encode('utf-8'),
        "test.txt",
        "Проанализируй этот текст"
    ))
    
    # Запускаем пайплайн
    run_analysis_pipeline(files_data, target_audience="general")
    
    # Вариант 3: Анализ всех файлов из папки
    print("\n📂 Вариант 3: Анализ всех файлов из папки")
    if os.path.exists("./uploads"):
        files = load_files_from_directory("./uploads", "Опиши содержимое")
        if files:
            run_analysis_pipeline(files, target_audience="business")
        else:
            print("Папка uploads пуста")
    else:
        print("Создайте папку uploads и положите туда файлы для анализа")

if __name__ == "__main__":
    main()
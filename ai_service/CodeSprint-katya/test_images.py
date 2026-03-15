#!/usr/bin/env python3
"""
Тестовый скрипт для проверки работы с PNG и JPG изображениями
"""

import os
from advanced_document_analyzer import AdvancedDocumentAnalyzer
from PIL import Image, ImageDraw, ImageFont
import io
import base64
from dotenv import load_dotenv

load_dotenv()

def create_test_png():
    """Создает тестовое PNG изображение с текстом"""
    img = Image.new('RGB', (800, 400), color='white')
    d = ImageDraw.Draw(img)
    
    # Пробуем загрузить шрифт, если нет - используем дефолтный
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    # Рисуем текст
    d.text((50, 50), "Тестовый документ для OCR", fill='black', font=font)
    d.text((50, 100), "Это PNG изображение с текстом", fill='black', font=font)
    d.text((50, 150), "Дата теста: 2026-03-13", fill='black', font=font)
    d.text((50, 200), "Формат: PNG", fill='black', font=font)
    d.text((50, 250), "Строка для проверки распознавания", fill='black', font=font)
    
    # Сохраняем в байты
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    return img_bytes.getvalue()

def create_test_jpg():
    """Создает тестовое JPG изображение с текстом"""
    img = Image.new('RGB', (800, 400), color='lightgray')
    d = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    d.text((50, 50), "JPG Image Test", fill='black', font=font)
    d.text((50, 100), "This is a JPG image with text", fill='black', font=font)
    d.text((50, 150), "Testing OCR capabilities", fill='black', font=font)
    d.text((50, 200), "Date: 2026-03-13", fill='black', font=font)
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    return img_bytes.getvalue()

def test_png_processing():
    """Тестирует обработку PNG"""
    print("\n" + "="*50)
    print("🧪 ТЕСТИРОВАНИЕ PNG")
    print("="*50)
    
    # Создаем тестовое PNG
    png_content = create_test_png()
    
    # Инициализируем анализатор
    analyzer = AdvancedDocumentAnalyzer(os.getenv("GEMINI_API_KEY"))
    
    # Тест 1: Извлечение текста
    print("\n📋 Тест 1: Извлечение текста из PNG")
    text = analyzer.extract_text_from_file(png_content, "test.png")
    print(f"Результат OCR:")
    print(f"{text[:200]}...")
    
    # Тест 2: AI-детекция
    print("\n🤖 Тест 2: AI-детекция")
    ai_result = analyzer.detect_ai_generated(text, "test.png")
    print(f"Вероятность AI: {ai_result.get('ai_probability')}%")
    print(f"Классификация: {ai_result.get('classification')}")
    
    # Тест 3: Полный анализ
    print("\n🔍 Тест 3: Полный анализ")
    full_result = analyzer.full_analysis(
        png_content, 
        "test.png", 
        "Какой формат файла анализируется?"
    )
    print(f"Ответ на вопрос: {full_result.get('answer_to_query')}")
    
    return full_result

def test_jpg_processing():
    """Тестирует обработку JPG"""
    print("\n" + "="*50)
    print("🧪 ТЕСТИРОВАНИЕ JPG")
    print("="*50)
    
    # Создаем тестовое JPG
    jpg_content = create_test_jpg()
    
    # Инициализируем анализатор
    analyzer = AdvancedDocumentAnalyzer(os.getenv("GEMINI_API_KEY"))
    
    # Тест 1: Извлечение текста
    print("\n📋 Тест 1: Извлечение текста из JPG")
    text = analyzer.extract_text_from_file(jpg_content, "test.jpg")
    print(f"Результат OCR:")
    print(f"{text[:200]}...")
    
    # Тест 2: Улучшение с предобработкой
    print("\n🔄 Тест 2: Тест улучшения изображения")
    enhanced = analyzer._enhance_image_for_ocr(jpg_content, '.jpg')
    print(f"Размер до: {len(jpg_content)} байт")
    print(f"Размер после: {len(enhanced)} байт")
    
    return text

if __name__ == "__main__":
    print("🚀 ЗАПУСК ТЕСТОВ ДЛЯ PNG И JPG")
    print("="*50)
    
    # Проверяем API ключ
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ Ошибка: GEMINI_API_KEY не найден в .env файле")
        exit(1)
    
    # Тестируем PNG
    png_result = test_png_processing()
    
    # Тестируем JPG
    jpg_result = test_jpg_processing()
    
    print("\n" + "="*50)
    print("✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО")
    print("="*50)

from advanced_document_analyzer import load_files_from_directory, run_analysis_pipeline

# Загружаем все файлы из папки uploads
files = load_files_from_directory("./uploads", "Что в этом документе?")

# Запускаем анализ
run_analysis_pipeline(files, target_audience="business")    
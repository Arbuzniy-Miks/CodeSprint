import sys
print(f"Python: {sys.executable}")
print(f"Версия: {sys.version}\n")

print("ПРОВЕРКА ИМПОРТОВ:")
print("="*50)

try:
    from google import genai
    print("✅ google.genai")
except ImportError as e:
    print(f"❌ google.genai: {e}")

try:
    import dlt
    print("✅ dlt")
except ImportError as e:
    print(f"❌ dlt: {e}")

try:
    from PIL import Image
    print("✅ PIL")
except ImportError as e:
    print(f"❌ PIL: {e}")

try:
    import cv2
    print("✅ cv2")
except ImportError as e:
    print(f"❌ cv2: {e}")

try:
    import PyPDF2
    print("✅ PyPDF2")
except ImportError as e:
    print(f"❌ PyPDF2: {e}")

try:
    import docx
    print("✅ docx")
except ImportError as e:
    print(f"❌ docx: {e}")

try:
    import psycopg2
    print("✅ psycopg2")
except ImportError as e:
    print(f"❌ psycopg2: {e}")
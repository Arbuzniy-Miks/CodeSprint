FROM python:3.10-slim

WORKDIR /app

# Устанавливаем системные зависимости (исправленная версия)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgl1-mesa-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Запускаем приложение
CMD ["python", "web_interface.py"]
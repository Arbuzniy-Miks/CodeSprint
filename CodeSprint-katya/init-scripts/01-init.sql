-- 01-init.sql
-- Включаем расширение pgvector для работы с эмбеддингами
CREATE EXTENSION IF NOT EXISTS vector;

-- Создаем таблицу для хранения анализов документов
CREATE TABLE IF NOT EXISTS document_analyses (
    id SERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_format TEXT,
    file_size INTEGER,
    extracted_text TEXT,
    text_length INTEGER,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Результаты AI-детекции в JSONB формате
    ai_detection JSONB DEFAULT '{}'::jsonb,
    
    -- Рекомендации по оригинальности
    originality_analysis JSONB DEFAULT '{}'::jsonb,
    
    -- Ответ на вопрос пользователя
    answer_to_query TEXT,
    
    -- Векторное представление документа (эмбеддинг)
    embedding vector(768),
    
    -- Метаданные
    batch_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT TRUE,
    error TEXT,
    
    -- Информация о пользователе (если есть авторизация)
    user_id INTEGER,
    session_id TEXT,
    
    -- Теги и категории
    tags TEXT[],
    category TEXT
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_document_analyses_file_name ON document_analyses(file_name);
CREATE INDEX IF NOT EXISTS idx_document_analyses_created_at ON document_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_document_analyses_batch_id ON document_analyses(batch_id);
CREATE INDEX IF NOT EXISTS idx_document_analyses_user_id ON document_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_document_analyses_category ON document_analyses(category);

-- GIN индексы для полнотекстового поиска
CREATE INDEX IF NOT EXISTS idx_document_analyses_text_gin ON document_analyses USING gin(to_tsvector('russian', COALESCE(extracted_text, '')));
CREATE INDEX IF NOT EXISTS idx_document_analyses_ai_detection_gin ON document_analyses USING gin(ai_detection);
CREATE INDEX IF NOT EXISTS idx_document_analyses_originality_gin ON document_analyses USING gin(originality_analysis);

-- GiST индекс для поиска по эмбеддингам (векторный поиск)
CREATE INDEX IF NOT EXISTS idx_document_analyses_embedding ON document_analyses USING ivfflat (embedding vector_cosine_ops);

-- Таблица для хранения чанков документов (для более точного поиска)
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES document_analyses(id) ON DELETE CASCADE,
    chunk_index INTEGER,
    chunk_text TEXT,
    chunk_embedding vector(768),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для поиска по чанкам
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (chunk_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);

-- Таблица для пользователей (если нужна авторизация)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Таблица для логов запросов
CREATE TABLE IF NOT EXISTS query_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES document_analyses(id),
    user_id INTEGER REFERENCES users(id),
    query_text TEXT,
    response_text TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для обновления updated_at
CREATE TRIGGER update_document_analyses_updated_at 
    BEFORE UPDATE ON document_analyses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Функция для поиска похожих документов
CREATE OR REPLACE FUNCTION find_similar_documents(
    query_embedding vector(768),
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    id INTEGER,
    file_name TEXT,
    similarity FLOAT,
    extracted_text TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.file_name,
        1 - (d.embedding <=> query_embedding) as similarity,
        d.extracted_text
    FROM document_analyses d
    WHERE 1 - (d.embedding <=> query_embedding) > similarity_threshold
    ORDER BY similarity DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения статистики
CREATE OR REPLACE FUNCTION get_analysis_stats(
    start_date TIMESTAMP DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date TIMESTAMP DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_documents BIGINT,
    avg_text_length NUMERIC,
    ai_generated_count BIGINT,
    human_written_count BIGINT,
    avg_originality_score NUMERIC,
    top_file_formats JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_documents,
        AVG(text_length)::NUMERIC as avg_text_length,
        COUNT(CASE WHEN ai_detection->>'classification' = 'ai_generated' THEN 1 END)::BIGINT as ai_generated,
        COUNT(CASE WHEN ai_detection->>'classification' = 'human_written' THEN 1 END)::BIGINT as human_written,
        AVG((originality_analysis->>'originality_score')::FLOAT)::NUMERIC as avg_originality,
        (
            SELECT json_object_agg(format, count)
            FROM (
                SELECT file_format, COUNT(*) as count
                FROM document_analyses
                GROUP BY file_format
                ORDER BY count DESC
                LIMIT 5
            ) formats
        ) as top_file_formats
    FROM document_analyses
    WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Комментарии к таблицам и колонкам
COMMENT ON TABLE document_analyses IS 'Основная таблица для хранения результатов анализа документов';
COMMENT ON COLUMN document_analyses.ai_detection IS 'JSON с результатами AI-детекции (вероятность, классификация, признаки)';
COMMENT ON COLUMN document_analyses.originality_analysis IS 'JSON с рекомендациями по улучшению оригинальности';
COMMENT ON COLUMN document_analyses.embedding IS 'Векторное представление документа для семантического поиска';
COMMENT ON TABLE document_chunks IS 'Чанки документов для более точного поиска';
COMMENT ON TABLE users IS 'Пользователи системы';
COMMENT ON TABLE query_logs IS 'Логи запросов для анализа производительности';
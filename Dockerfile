FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Кэш SQLite — на смонтированный том
VOLUME ["/app/data"]
ENV CACHE_DB_PATH=/app/data/cache.sqlite3

EXPOSE 3001

# 1 worker + threads: rate-limiter state живёт в одном процессе,
# чтобы не превысить общий лимит Wordstat 10 RPS на API-ключ.
CMD ["gunicorn", "-w", "1", "--threads", "4", "-b", "0.0.0.0:3001", "--timeout", "300", "--access-logfile", "-", "--error-logfile", "-", "app:app"]

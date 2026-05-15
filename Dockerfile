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

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:3001", "--access-logfile", "-", "--error-logfile", "-", "app:app"]

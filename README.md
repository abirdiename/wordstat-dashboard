# B2B Wordstat Trends Dashboard

Веб-приложение для построения динамики поисковых запросов по продуктам через **Yandex Cloud SearchAPI v2 (Wordstat)**.

- Множественные продукты × типы запросов (Бренд / Дженерик / Конкуренты) — каждая комбинация отдельной линией.
- Гранулярность: день / неделя / месяц / год.
- SQLite-кэш с TTL 7 дней и инвалидацией последних 3 дней раз в сутки.
- Chart.js 4, мультилинейный график.
- Экспорт CSV (wide format).

## Локальный запуск

```bash
cp .env.example .env
# Открыть .env и вписать YANDEX_API_KEY + YANDEX_FOLDER_ID

# Docker (рекомендуется):
docker compose -f docker-compose.dev.yml up --build

# Или напрямую:
pip install -r requirements.txt
python app.py
```

Откроется на http://localhost:3001.

## Структура

| Файл | Что |
|---|---|
| `app.py` | Flask backend, прокси к Wordstat + SQLite-кэш |
| `index.html`, `script.js`, `style.css` | Frontend на vanilla JS + Chart.js |
| `Dockerfile` | Образ приложения (gunicorn) |
| `docker-compose.yml` | Prod-стек: app + nginx + certbot |
| `docker-compose.dev.yml` | Dev-стек (без nginx, hot reload) |
| `nginx/conf.d/app.conf` | HTTPS-конфиг (после получения серта) |
| `nginx/conf.d/app.bootstrap.conf` | HTTP-only конфиг для первой выдачи серта |
| `deploy.sh` | Скрипт первичного деплоя на Yandex Cloud VM |

## API

`POST /api/wordstat`

```json
{
  "series": [
    {"name": "Командировки — Бренд", "queries": ["q1", "q2"]},
    {"name": "Командировки — Дженерик", "queries": ["q3"]}
  ],
  "from": "2025-01-01",
  "to": "2025-12-31",
  "granularity": "month"
}
```

Ответ:
```json
{
  "series": [
    {"name": "Командировки — Бренд", "points": [{"date": "2025-01-01", "value": 12345}]}
  ],
  "from": "2025-01-01",
  "to": "2025-12-31",
  "granularity": "PERIOD_MONTHLY"
}
```

Заголовок `X-Cache: HIT|MISS` показывает, отдан ли ответ из кэша.

## Деплой на Yandex Cloud

1. Создать VM (Ubuntu 22.04, 2 vCPU / 2 GB, 20 GB диск):
   ```bash
   yc compute instance create \
     --name wordstat-app \
     --zone ru-central1-a \
     --cores 2 --memory 2 --core-fraction 50 \
     --create-boot-disk image-family=ubuntu-2204-lts,size=20 \
     --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4 \
     --ssh-key ~/.ssh/id_rsa.pub
   ```

2. В DNS-зоне домена `b2b-ws-trends.ru` добавить A-записи (`@` и `www`) на публичный IP VM.

3. На VM:
   ```bash
   ssh ubuntu@<IP>
   sudo -i
   git clone https://github.com/abirdiename/wordstat-dashboard.git /opt/wordstat-dashboard
   cd /opt/wordstat-dashboard
   cp .env.example .env
   # вписать YANDEX_API_KEY и YANDEX_FOLDER_ID
   LETSENCRYPT_EMAIL=you@example.com ./deploy.sh
   ```

`deploy.sh` ставит Docker, поднимает nginx в HTTP-only режиме, получает Let's Encrypt серт для `b2b-ws-trends.ru` + `www.b2b-ws-trends.ru`, переключает nginx на HTTPS-конфиг и запускает фоновый certbot для авто-обновления.

## Получить YANDEX_API_KEY и YANDEX_FOLDER_ID

1. https://console.yandex.cloud → нужный каталог → запомнить `Folder ID`.
2. IAM → Сервисные аккаунты → создать с ролью `search-api.executor`.
3. На сервисном аккаунте → API-ключи → создать → скопировать значение.

Подробнее: [Yandex Cloud Wordstat API docs](https://yandex.cloud/en/docs/search-api/api-ref/Wordstat/getDynamics).

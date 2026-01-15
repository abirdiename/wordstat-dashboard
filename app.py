from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv

load_dotenv()
import requests
from datetime import datetime, timedelta, date
import calendar

import os
from flask import Flask, send_from_directory, request, jsonify

import sqlite3
import hashlib
import json
import time
from pathlib import Path


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")
# ------------------- SQLITE CACHE (SAFE) -------------------
CACHE_ENABLED = True  # если что-то пойдёт не так — поставь False и всё будет как раньше
CACHE_TTL_SECONDS = 7 * 24 * 60 * 60  # 7 дней
RECENT_REFRESH_SECONDS = 24 * 60 * 60  # 24 часа
CACHE_DB_PATH = str(Path(__file__).with_name("cache.sqlite3"))
# Для "дотекающих" данных: если диапазон включает последние дни,
# то считаем кэш устаревшим и пересчитываем раз в 24 часа.
RECENT_DAYS = 3
RECENT_REFRESH_SECONDS = 24 * 60 * 60



def _db_connect():
    # timeout важен, чтобы не падать при параллельных запросах
    conn = sqlite3.connect(CACHE_DB_PATH, timeout=10) 
    conn.row_factory = sqlite3.Row
    # WAL помогает при нескольких процессах gunicorn
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn


def cache_init():
    conn = _db_connect()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS cache (
            key TEXT PRIMARY KEY,
            created_at INTEGER NOT NULL,
            response_json TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def cache_make_key(payload: dict) -> str:
    """
    Делаем хэш из всего payload запроса, чтобы кэш был корректным.
    Важно: сортируем ключи, чтобы одинаковые запросы давали один ключ.
    """
    normalized = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

def _touches_recent_days(to_d: date) -> bool:
    # Если конец диапазона попадает на последние RECENT_DAYS дней,
    # значит данные могут "дотекать"
    return to_d >= (date.today() - timedelta(days=RECENT_DAYS - 1))



def cache_get(key: str, to_d: date | None = None):
    now = int(time.time())
    conn = _db_connect()
    row = conn.execute("SELECT created_at, response_json FROM cache WHERE key=?", (key,)).fetchone()
    conn.close()

    if not row:
        return None

    created_at = int(row["created_at"])

    # 1) общий TTL
    if now - created_at > CACHE_TTL_SECONDS:
        return None

    # 2) спец-правило для последних RECENT_DAYS: обновляем раз в 24 часа
    if to_d is not None and _touches_recent_days(to_d):
        if now - created_at > RECENT_REFRESH_SECONDS:
            return None

    try:
        return json.loads(row["response_json"])
    except Exception:
        return None


def cache_set(key: str, data):
    now = int(time.time())
    conn = _db_connect()
    conn.execute(
        "INSERT OR REPLACE INTO cache(key, created_at, response_json) VALUES(?, ?, ?)",
        (key, now, json.dumps(data, ensure_ascii=False)),
    )
    conn.commit()
    conn.close()


# инициализируем БД при старте приложения
cache_init()
# ------------------- /SQLITE CACHE -------------------

from flask import send_from_directory

@app.get("/")
def home():
    return send_from_directory(".", "index.html")


# ========== НАСТРОЙКИ ==========
WORDSTAT_BASE_URL = "https://api.wordstat.yandex.net"
WORDSTAT_TOKEN = os.getenv("WORDSTAT_TOKEN", "").strip()


# ========== ЛОГИ (чтобы видеть запросы) ==========
@app.before_request
def _log_request():
    print("➡️", request.method, request.path)


# ========== CORS (чтобы браузер не блокировал запросы) ==========
@app.after_request
def _add_cors_headers(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp


@app.route("/api/wordstat", methods=["OPTIONS"])
def _wordstat_options():
    return ("", 204)


# ========== ВСПОМОГАТЕЛЬНОЕ ==========
def parse_ymd(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def fmt_ymd(d: date) -> str:
    return d.strftime("%Y-%m-%d")


def map_granularity_to_period(granularity: str) -> str:
    # фронт: day/week/month/year
    # Wordstat: daily/weekly/monthly
    if granularity == "day":
        return "daily"
    if granularity == "week":
        return "weekly"
    # month и year => monthly (год можно агрегировать отдельно позже)
    return "monthly"


def clamp_daily_last_60_days(from_d: date, to_d: date) -> tuple[date, date]:
    # daily обычно ограничен последними ~60 днями — подрежем диапазон, чтобы не ломалось
    today = date.today()
    min_from = today - timedelta(days=60)
    if from_d < min_from:
        from_d = min_from
    if to_d > today:
        to_d = today
    if from_d > to_d:
        from_d = to_d
    return from_d, to_d


def align_week_range(from_d: date, to_d: date) -> tuple[date, date]:
    # Подгоняем к неделе: понедельник..воскресенье
    from_aligned = from_d - timedelta(days=from_d.weekday())  # Mon=0
    to_aligned = to_d + timedelta(days=(6 - to_d.weekday()))  # Sun=6
    return from_aligned, to_aligned


def align_month_range(from_d: date, to_d: date) -> tuple[date, date]:
    from_aligned = date(from_d.year, from_d.month, 1)
    last_day = calendar.monthrange(to_d.year, to_d.month)[1]
    to_aligned = date(to_d.year, to_d.month, last_day)
    return from_aligned, to_aligned


def normalize_phrase_for_dynamics(phrase: str) -> str:
    """
    Для /v1/dynamics лучше без сложных операторов.
    Сделаем безопасно: "слово1 +слово2 +слово3"
    """
    raw = (phrase or "").strip()
    for ch in ['"', "!", "(", ")", "[", "]", "{", "}", ":", ";"]:
        raw = raw.replace(ch, " ")
    parts = [p for p in raw.split() if p]
    if not parts:
        return ""
    out = parts[0]
    for p in parts[1:]:
        out += f" +{p}"
    return out


def call_wordstat_dynamics(phrase: str, period: str, from_date: str, to_date: str):
    url = f"{WORDSTAT_BASE_URL}/v1/dynamics"
    headers = {
        "Content-type": "application/json;charset=utf-8",
        "Authorization": f"Bearer {WORDSTAT_TOKEN}",
    }
    payload = {
        "phrase": phrase,
        "period": period,
        "fromDate": from_date,
        "toDate": to_date,
    }

    r = requests.post(url, json=payload, headers=headers, timeout=30)
    if r.status_code != 200:
        raise RuntimeError(f"Wordstat error {r.status_code}: {r.text}")

    return r.json()


# ========== РОУТЫ ==========
@app.get("/health")
def health():
    return "OK"


@app.post("/api/wordstat")
def wordstat_proxy():
    if not WORDSTAT_TOKEN:
        return jsonify({"error": "WORDSTAT_TOKEN is not set. Set it via: export WORDSTAT_TOKEN='...'" }), 500

    data = request.get_json(force=True) or {}

    queries = data.get("queries", [])
    from_s = data.get("from")
    to_s = data.get("to")
    granularity = data.get("granularity", "day")

    if not isinstance(queries, list) or not queries:
        return jsonify({"error": "queries must be a non-empty array"}), 400
    if not from_s or not to_s:
        return jsonify({"error": "from/to required (YYYY-MM-DD)"}), 400

    try:
        from_d = parse_ymd(from_s)
        to_d = parse_ymd(to_s)
    except Exception:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    period = map_granularity_to_period(granularity)

    # Подгоняем диапазон под правила/ограничения
    if period == "daily":
        from_d, to_d = clamp_daily_last_60_days(from_d, to_d)
    elif period == "weekly":
        from_d, to_d = align_week_range(from_d, to_d)
    else:
        from_d, to_d = align_month_range(from_d, to_d)

    from_api = fmt_ymd(from_d)
    to_api = fmt_ymd(to_d)

    # ------------------- CACHE CHECK (AFTER CLAMP) -------------------
    # Ключ строим из фактических параметров, которые реально уйдут в Wordstat
    cache_key = None
    if CACHE_ENABLED:
        cache_payload = {
            "queries": [str(q) for q in queries],  # как пришло (фронт)
            "period": period,
            "from": from_api,
            "to": to_api,
        }
        cache_key = cache_make_key(cache_payload)
        cached = cache_get(cache_key, to_d=to_d)
        if cached is not None:
            resp = jsonify(cached)
            resp.headers["X-Cache"] = "HIT"
            return resp
    # ------------------- /CACHE CHECK -------------------

    summed = {}  # date -> value

    try:
        for q in queries:
            phrase = normalize_phrase_for_dynamics(str(q))
            if not phrase:
                continue

            ws = call_wordstat_dynamics(
                phrase=phrase,
                period=period,
                from_date=from_api,
                to_date=to_api,
            )

            for p in ws.get("dynamics", []):
                d = p.get("date")
                c = int(p.get("count") or 0)
                if d:
                    summed[d] = summed.get(d, 0) + c

        out = [{"date": d, "value": summed[d]} for d in sorted(summed.keys())]

        # ------------------- CACHE SAVE -------------------
        if CACHE_ENABLED and cache_key:
            cache_set(cache_key, out)
        # ------------------- /CACHE SAVE ------------------

        resp = jsonify(out)
        resp.headers["X-Cache"] = "MISS"
        return resp

    except Exception as e:
        # Важно: отдаём текст ошибки в ответ, чтобы было понятно, что сломалось
        return jsonify({"error": str(e)}), 502



if __name__ == "__main__":
    # host=127.0.0.1 чтобы работало локально, порт 3001 как в твоём script.js
    app.run(host="0.0.0.0", port=3001, debug=True)
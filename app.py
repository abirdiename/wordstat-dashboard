"""Wordstat Trends — Flask backend.

API:
  POST /api/wordstat
    body: {
      "series": [{"name": str, "queries": [str, ...]}, ...],   # рекомендуемый формат
      "queries": [str, ...],                                    # legacy: одна серия
      "from": "YYYY-MM-DD",
      "to":   "YYYY-MM-DD",
      "granularity": "day"|"week"|"month"|"year"
    }
    response: {
      "series": [{"name": str, "points": [{"date": "YYYY-MM-DD", "value": int}, ...]}, ...],
      "from": "YYYY-MM-DD",
      "to":   "YYYY-MM-DD",
      "granularity": "daily"|"weekly"|"monthly"
    }

ENV:
  YANDEX_API_KEY   — API-ключ Yandex Cloud (для SearchAPI Wordstat)
  YANDEX_FOLDER_ID — ID каталога Yandex Cloud
  PORT             — порт (по умолчанию 3001)
"""

from __future__ import annotations

import calendar
import hashlib
import json
import logging
import os
import sqlite3
import time
from datetime import date, datetime, timedelta
from pathlib import Path

import threading

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

load_dotenv()

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
log = logging.getLogger("wordstat-dashboard")

BASE_DIR = Path(__file__).resolve().parent

WORDSTAT_URL = "https://searchapi.api.cloud.yandex.net/v2/wordstat/dynamics"
YANDEX_API_KEY = os.getenv("YANDEX_API_KEY", "").strip()
YANDEX_FOLDER_ID = os.getenv("YANDEX_FOLDER_ID", "").strip()

CACHE_ENABLED = os.getenv("CACHE_ENABLED", "1") == "1"
CACHE_DB_PATH = os.getenv("CACHE_DB_PATH", str(BASE_DIR / "cache.sqlite3"))

# Yandex Cloud SearchAPI rate limit: 10 RPS. Берём 8 для запаса.
MAX_RPS = float(os.getenv("WORDSTAT_MAX_RPS", "8"))
_RATE_LOCK = threading.Lock()
_LAST_CALL_TS = [0.0]  # mutable holder so closure may update
CACHE_TTL_SECONDS = 7 * 24 * 60 * 60
RECENT_DAYS = 3
RECENT_REFRESH_SECONDS = 24 * 60 * 60

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


# ---------- SQLite cache ----------
def _db_connect() -> sqlite3.Connection:
    conn = sqlite3.connect(CACHE_DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn


def cache_init() -> None:
    parent = Path(CACHE_DB_PATH).parent
    parent.mkdir(parents=True, exist_ok=True)
    with _db_connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS cache (
                key          TEXT PRIMARY KEY,
                created_at   INTEGER NOT NULL,
                response_json TEXT NOT NULL
            )
            """
        )
        conn.commit()


def _touches_recent_days(to_d: date) -> bool:
    return to_d >= (date.today() - timedelta(days=RECENT_DAYS - 1))


def cache_get(key: str, to_d: date | None = None):
    now = int(time.time())
    with _db_connect() as conn:
        row = conn.execute(
            "SELECT created_at, response_json FROM cache WHERE key=?", (key,)
        ).fetchone()
    if not row:
        return None
    created_at = int(row["created_at"])
    if now - created_at > CACHE_TTL_SECONDS:
        return None
    if to_d is not None and _touches_recent_days(to_d) and now - created_at > RECENT_REFRESH_SECONDS:
        return None
    try:
        return json.loads(row["response_json"])
    except json.JSONDecodeError:
        return None


def cache_set(key: str, data) -> None:
    with _db_connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO cache(key, created_at, response_json) VALUES(?, ?, ?)",
            (key, int(time.time()), json.dumps(data, ensure_ascii=False)),
        )
        conn.commit()


cache_init()


# ---------- HTTP helpers ----------
@app.before_request
def _log_request():
    log.info("%s %s", request.method, request.path)


@app.after_request
def _cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp


@app.route("/api/wordstat", methods=["OPTIONS"])
def _wordstat_options():
    return ("", 204)


@app.get("/")
def home():
    return send_from_directory(str(BASE_DIR), "index.html")


@app.get("/health")
def health():
    return jsonify(
        {
            "ok": True,
            "api_key_configured": bool(YANDEX_API_KEY),
            "folder_id_configured": bool(YANDEX_FOLDER_ID),
        }
    )


# ---------- Date / period helpers ----------
def parse_ymd(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def fmt_ymd(d: date) -> str:
    return d.strftime("%Y-%m-%d")


def map_granularity_to_period(granularity: str) -> str:
    """Mapping для нового API: PERIOD_DAILY / PERIOD_WEEKLY / PERIOD_MONTHLY."""
    if granularity == "day":
        return "PERIOD_DAILY"
    if granularity == "week":
        return "PERIOD_WEEKLY"
    return "PERIOD_MONTHLY"  # month / year


def clamp_daily_last_60_days(from_d: date, to_d: date) -> tuple[date, date]:
    """API ограничивает дневную гранулярность последними ~60 днями."""
    today = date.today()
    min_from = today - timedelta(days=60)
    if from_d < min_from:
        from_d = min_from
    if to_d > today:
        to_d = today
    if from_d > to_d:
        from_d = to_d
    return from_d, to_d


def to_rfc3339(d: date, end_of_day: bool = False) -> str:
    if end_of_day:
        return f"{d.isoformat()}T23:59:59Z"
    return f"{d.isoformat()}T00:00:00Z"


def parse_rfc3339_date(s: str) -> str | None:
    """Извлекает YYYY-MM-DD из RFC3339 datetime, который возвращает API."""
    if not s:
        return None
    return s[:10]


def align_week_range(from_d: date, to_d: date) -> tuple[date, date]:
    return (
        from_d - timedelta(days=from_d.weekday()),
        to_d + timedelta(days=6 - to_d.weekday()),
    )


def align_month_range(from_d: date, to_d: date) -> tuple[date, date]:
    last_day = calendar.monthrange(to_d.year, to_d.month)[1]
    return date(from_d.year, from_d.month, 1), date(to_d.year, to_d.month, last_day)


def normalize_phrase_for_dynamics(phrase: str) -> str:
    """Простой синтаксис без операторов — у нового API есть лимит 400 символов на фразу."""
    raw = (phrase or "").strip()
    for ch in ['"', "!", "(", ")", "[", "]", "{", "}", ":", ";"]:
        raw = raw.replace(ch, " ")
    cleaned = " ".join(raw.split())
    return cleaned[:400]


def _rate_limit() -> None:
    """Token-bucket-lite: serialise calls so we never exceed MAX_RPS."""
    min_interval = 1.0 / MAX_RPS
    with _RATE_LOCK:
        delta = time.monotonic() - _LAST_CALL_TS[0]
        if delta < min_interval:
            time.sleep(min_interval - delta)
        _LAST_CALL_TS[0] = time.monotonic()


# ---------- Wordstat API call (Yandex Cloud SearchAPI v2) ----------
def call_wordstat_dynamics(
    phrase: str, period: str, from_iso: str, to_iso: str
) -> dict:
    headers = {
        "Authorization": f"Api-Key {YANDEX_API_KEY}",
        "Content-Type": "application/json",
    }
    payload: dict = {
        "phrase": phrase,
        "period": period,
        "fromDate": from_iso,
        "toDate": to_iso,
    }
    if YANDEX_FOLDER_ID:
        payload["folderId"] = YANDEX_FOLDER_ID

    # Retry policy:
    #   - 429 hourly  -> fail-fast (ждать смысла нет, окно сбрасывается раз в час)
    #   - 429 per-sec -> retry с короткой задержкой (мы под лимитом, но мог быть всплеск)
    #   - 5xx          -> retry с экспоненциальным бэкоффом
    backoff = 1.0
    for attempt in range(4):
        _rate_limit()
        r = requests.post(WORDSTAT_URL, json=payload, headers=headers, timeout=30)
        if r.status_code == 200:
            return r.json()
        body = r.text[:500]
        if r.status_code == 429:
            if "wordstatRequestsPerHour" in body:
                raise RuntimeError(f"Wordstat error 429: {body}")  # fail-fast
            log.warning("wordstat 429 RPS on attempt %d, sleep %.1fs", attempt + 1, backoff)
            time.sleep(backoff)
            backoff = min(backoff * 2, 4)
            continue
        if 500 <= r.status_code < 600:
            log.warning("wordstat %s on attempt %d, sleep %.1fs", r.status_code, attempt + 1, backoff)
            time.sleep(backoff)
            backoff = min(backoff * 2, 8)
            continue
        raise RuntimeError(f"Wordstat error {r.status_code}: {body}")
    raise RuntimeError(f"Wordstat error {r.status_code} after retries: {body}")


def _phrase_cache_key(phrase: str, period: str, from_d: date, to_d: date) -> str:
    """Стабильный ключ кэша для одной фразы."""
    raw = f"phrase|v2|{phrase}|{period}|{from_d.isoformat()}|{to_d.isoformat()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def fetch_phrase_points(
    phrase: str, period: str, from_d: date, to_d: date
) -> list[dict]:
    """Возвращает [{date, value}] для одной фразы. Кэширует на уровне фразы."""
    key = _phrase_cache_key(phrase, period, from_d, to_d)
    if CACHE_ENABLED:
        cached = cache_get(key, to_d=to_d)
        if cached is not None:
            return cached

    from_iso = to_rfc3339(from_d)
    to_iso = to_rfc3339(to_d, end_of_day=True)
    ws = call_wordstat_dynamics(phrase, period, from_iso, to_iso)

    points: list[dict] = []
    for p in ws.get("results", []) or []:
        d = parse_rfc3339_date(p.get("date"))
        try:
            c = int(p.get("count") or 0)
        except (TypeError, ValueError):
            c = 0
        if d:
            points.append({"date": d, "value": c})
    points.sort(key=lambda x: x["date"])

    if CACHE_ENABLED:
        cache_set(key, points)
    return points


def fetch_series_points(
    queries: list[str], period: str, from_d: date, to_d: date,
    phrase_cache: dict[str, list[dict]] | None = None,
) -> list[dict]:
    """Сумма точек по всем фразам серии. phrase_cache используется для дедупа в рамках одного запроса."""
    summed: dict[str, int] = {}
    for q in queries:
        phrase = normalize_phrase_for_dynamics(str(q))
        if not phrase:
            continue
        if phrase_cache is not None and phrase in phrase_cache:
            points = phrase_cache[phrase]
        else:
            points = fetch_phrase_points(phrase, period, from_d, to_d)
            if phrase_cache is not None:
                phrase_cache[phrase] = points
        for p in points:
            summed[p["date"]] = summed.get(p["date"], 0) + int(p["value"])
    return [{"date": d, "value": summed[d]} for d in sorted(summed.keys())]


# ---------- Main endpoint ----------
def _parse_series(data: dict) -> list[dict]:
    """Принимает либо новый формат `series`, либо legacy `queries`. Возвращает список серий."""
    if isinstance(data.get("series"), list) and data["series"]:
        out = []
        for idx, s in enumerate(data["series"]):
            if not isinstance(s, dict):
                continue
            queries = s.get("queries") or []
            if not isinstance(queries, list) or not queries:
                continue
            name = str(s.get("name") or f"Серия {idx + 1}")
            out.append({"name": name, "queries": [str(q) for q in queries if str(q).strip()]})
        return out
    legacy = data.get("queries")
    if isinstance(legacy, list) and legacy:
        return [{"name": "Запросы", "queries": [str(q) for q in legacy if str(q).strip()]}]
    return []


@app.post("/api/wordstat")
def wordstat_proxy():
    if not YANDEX_API_KEY:
        return jsonify({"error": "YANDEX_API_KEY is not set. Add it to .env"}), 500
    if not YANDEX_FOLDER_ID:
        return jsonify({"error": "YANDEX_FOLDER_ID is not set. Add it to .env"}), 500

    data = request.get_json(force=True, silent=True) or {}
    series_in = _parse_series(data)
    from_s = data.get("from")
    to_s = data.get("to")
    granularity = data.get("granularity", "day")

    if not series_in:
        return jsonify({"error": "either 'series' or 'queries' must be a non-empty array"}), 400
    if not from_s or not to_s:
        return jsonify({"error": "from/to required (YYYY-MM-DD)"}), 400

    try:
        from_d = parse_ymd(from_s)
        to_d = parse_ymd(to_s)
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if granularity == "day":
        from_d, to_d = clamp_daily_last_60_days(from_d, to_d)
    elif granularity == "week":
        from_d, to_d = align_week_range(from_d, to_d)
    else:  # month / year
        from_d, to_d = align_month_range(from_d, to_d)
    period = map_granularity_to_period(granularity)

    from_api, to_api = fmt_ymd(from_d), fmt_ymd(to_d)

    try:
        # Дедуп: одна фраза, появляясь в разных сериях, вызывается ровно один раз.
        phrase_cache: dict[str, list[dict]] = {}
        result_series = []
        for s in series_in:
            points = fetch_series_points(s["queries"], period, from_d, to_d, phrase_cache)
            result_series.append({"name": s["name"], "points": points})
        out = {
            "series": result_series,
            "from": from_api,
            "to": to_api,
            "granularity": period,
        }
    except requests.RequestException as e:
        log.exception("network error calling wordstat")
        return jsonify({"error": f"network: {e}"}), 502
    except RuntimeError as e:
        msg = str(e)
        if "wordstatRequestsPerHour" in msg:
            friendly = (
                "Часовой лимит Wordstat API исчерпан (по умолчанию 100 запросов в час на ключ). "
                "Подожди до начала следующего часа или запроси увеличение квоты в Yandex Cloud → "
                "Quotas → Search API. После этого даже большие подборки будут проходить."
            )
            log.warning("hourly quota hit")
            return jsonify({"error": friendly, "detail": msg}), 429
        if "wordstatRequestsPerSecond" in msg:
            return jsonify({"error": "Wordstat: rate limit 10 RPS, попробуй ещё раз", "detail": msg}), 429
        log.error("wordstat api error: %s", e)
        return jsonify({"error": msg}), 502
    except Exception as e:
        log.exception("unexpected error")
        return jsonify({"error": f"internal: {e}"}), 500

    resp = jsonify(out)
    resp.headers["X-Cache"] = "PHRASE-LEVEL"
    return resp


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)

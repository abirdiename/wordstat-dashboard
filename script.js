/* =========================================================
   Wordstat Trends (Vanilla JS)
   - Фильтры: продукт, тип, гранулярность, даты
   - Конфиг запросов редактируется и хранится в localStorage
   - График без библиотек (canvas)
   ========================================================= */

// ------------------- БАЗОВАЯ КОНФИГУРАЦИЯ -------------------
// Продукты и дефолтные запросы. Ты заменишь на свои.
const DEFAULT_QUERY_CONFIG = {
"Командировки": {
brand: ["корпоративные поездки яндекс",
"корпоративные поездки yandex",
"яндекс бизнес поездки",
"яндекс бизнес путешествия",
"Яндекс Бронирование для корпоративных клиентов",
"яндекс деловые поездки",
"яндекс деловые путешествия",
"яндекс командировки",
"Яндекс Корпоративное путешествие",
"Яндекс Организация деловых путешествий",
"яндекс поездки по работе",
"яндекс путешествия для бизнеса",
"яндекс рабочие поездки",
"Яндекс Сервис для деловых поездок",
"яндекс служебные поездки",
"яндекс такси командировка",
"Яндекс Управление бизнес-поездками",
"Яндекс Услуги по деловым поездкам",
"yandex бизнес поездки",
"yandex бизнес путешествия",
"yandex Бронирование для корпоративных клиентов",
"yandex деловые поездки",
"yandex деловые путешествия",
"yandex командировки",
"yandex Корпоративное путешествие",
"yandex Организация деловых путешествий",
"yandex поездки по работе",
"yandex путешествия для бизнеса",
"yandex рабочие поездки",
"yandex Сервис для деловых поездок",
"yandex служебные поездки",
"yandex Управление бизнес-поездками",
"yandex Услуги по деловым поездкам",
"yandex go business travel"],
generic: [,
"автоматизация командировок",
"агентство деловых поездок",
"агентство командировок",
"бизнес путешествия",
"бронирование деловых поездок",
"бронирование для бизнеса",
"деловые поездки руководителя",
"деловые поездки сотрудников",
"командировки для бизнеса",
"командировки для юр лиц",
"командировки для юридических лиц",
"командировки по россии организация",
"командировки сотрудников",
"командировочные билеты на поезд",
"командировочные проживание в гостинице",
"командировочный отель",
"командировочных билетов",
"компенсация жилья в командировке",
"корпоративная программа для бронирования",
"корпоративное бронирование билетов",
"корпоративное бронирование отелей",
"корпоративное проживание",
"корпоративное путешествие",
"корпоративные деловые поездки",
"корпоративные командировки",
"корпоративные поездки",
"корпоративные системы бронирования",
"купить билет на самолет сотруднику",
"купить билеты в командировку",
"купить командировочные билеты",
"найм жилья командировка",
"обслуживание командировок",
"оказание командировочные услуги",
"организатор командировок",
"организация деловых поездок",
"организация деловых путешествий",
"организация командировок",
"организация корпоративных поездок",
"организация питания в командировке",
"отель для деловых поездок",
"отель для командировок",
"оформление деловых поездок",
"покупка билетов в командировку",
"покупка билетов для бизнеса",
"покупка билетов для сотрудников",
"сервис бронирования командировок",
"сервис деловых поездок",
"сервис для командировок",
"сервис командирования",
"сервис корпоративных поездок",
"сервис по заказу билетов для бизнеса",
"сервис электронного командирования",
"снять апартаменты для бизнеса",
"снять апартаменты юр лицам",
"снять апартаменты юридическим лицам",
"снять апартаменты юрлицам",
"снять гостиницу для бизнеса",
"снять гостиницу юр лицам",
"снять гостиницу юридическим лицам",
"снять гостиницу юрлицам",
"снять жилье для командировочных",
"снять жилье юр лицам",
"снять жилье юридическим лицам",
"снять жилье юрлицам",
"снять квартиру для бизнеса",
"снять квартиру юр лицам",
"снять квартиру юридическим лицам",
"снять квартиру юрлицам",
"снять отель для бизнеса",
"снять отель юр лицам",
"снять отель юридическим лицам",
"снять отель юрлицам",
"снять хостел для бизнеса",
"снять хостел юр лицам",
"снять хостел юридическим лицам",
"снять хостел юрлицам",
"транспортные услуги в командировке",
"тревел бизнес сервис",
"управление командированием",
"управление командировками",
"услуги деловых поездок",
"услуги командировочным",
"фирмы по командировкам"],
competitors: ["конкурент 1 командировки", "конкурент 2 билеты"]
},
"Такси": {
brand: ["бизнес аккаунт яндекс такси",
"договор с яндекс такси для юридических",
"корпоративное такси яндекс",
"корпоративное taxi яндекс",
"корпоративный кабинет яндекс такси для бизнеса",
"корпоративный тариф яндекс такси",
"подключить яндекс такси бизнес",
"я го для бизнеса",
"яндекс бизнес го",
"яндекс бизнес такси корпоративным",
"яндекс го для бизнеса",
"яндекс го корпоративный",
"яндекс гоу для бизнеса",
"яндекс для организаций",
"яндекс но для бизнеса",
"яндекс такси бизнес кабинет",
"яндекс такси для бизнеса",
"яндекс такси для корпоративных клиентов",
"яндекс такси для организаций",
"яндекс такси для юр лиц",
"яндекс такси для юридических лиц",
"яндекс такси договор с юр",
"яндекс такси корпоративный",
"яндекс такси юр",
"яндекс такси юридический",
"яндекс go для бизнеса",
"яндекс go кабинет для бизнеса",
"яндекс go корпоративный",
"яндекс taxi для юр лиц",
"яндекс taxi для юридических лиц",
"b2b yandex taxi",
"go для бизнеса",
"yandex go для бизнеса",
"yandex taxi для бизнеса",
"yandex taxi для юр лиц",
"yandex taxi для юридических лиц",
"yandex taxi корпоративный"],
generic: ["бизнес аккаунт такси",
"договор с такси на перевозку",
"договор такси юридическое лицо",
"корп такси",
"корпоративное такси",
"такси бизнес кабинет",
"такси для бизнеса",
"такси для корпоративных клиентов",
"такси для организаций",
"такси договор юр лицо",
"такси договор юрлицо",
"такси за счет компании",
"такси юр лиц",
"такси юридическим лицам",
"такси юрлиц",
"такси для компании",
"такси для организации"],
competitors: ["конкурент 1 такси", "конкурент 2 такси"]
},
"Доставка": {
brand: ["бизнес аккаунт яндекс доставка",
"бизнес профиль яндекс доставка",
"грузоперевозки москва яндекс",
"грузоперевозки яндекс го",
"доставка документов яндекс",
"заказать газель яндекс грузовой",
"заказать доставку документов яндекс",
"отправка документов яндекс доставка",
"подключить яндекс грузовой",
"фулфилмент яндекс доставка",
"яндекс бизнес грузоперевозки",
"яндекс го грузовой",
"яндекс гоу грузоперевозки",
"яндекс грузовой для бизнеса",
"яндекс грузовой москва",
"яндекс грузовой подключение",
"яндекс грузовые перевозки",
"яндекс грузоперевозки межгород",
"яндекс грузоперевозки официальный сайт",
"яндекс грузоперевозки подключение",
"яндекс грузоперевозки цены",
"яндекс доставка бизнес кабинет",
"яндекс доставка бизнес личный",
"яндекс доставка больших грузов",
"яндекс доставка груза для интернет магазинов",
"яндекс доставка груза для юридических лиц",
"яндекс доставка грузов по россии",
"яндекс доставка грузов стоимость",
"яндекс доставка грузовая машина",
"яндекс доставка грузовое такси",
"яндекс доставка грузоперевозки",
"яндекс доставка для бизнеса",
"яндекс доставка для интернет магазинов тарифы",
"яндекс доставка для корпоративных клиентов",
"яндекс доставка для организаций",
"яндекс доставка для юр лиц",
"яндекс доставка для юрлиц",
"яндекс доставка до маркетплейсов",
"яндекс доставка до пункта выдачи"],
generic: [
"бизнес курьер",
"доставить документы",
"доставка для бизнеса",
"доставка для юр лиц",
"доставка для юрлиц",
"доставка для юридических лиц",
"доставка документов",
"корпоративная доставка",
"корпоративная логистика",
"курьер для бизнеса",
"отправка документов",
"логистика для бизнеса",
"автодоставка грузов",
"автоперевозки грузов",
"агрегатор доставки для интернет магазинов",
"газель перевозки межгород",
"грузовая доставка",
"грузоперевозки газель межгород",
"грузоперевозки грузов по россии",
"грузоперевозки для бизнеса",
"грузоперевозки для юр лиц",
"грузоперевозки для юридических лиц",
"грузоперевозки доставка груза",
"грузоперевозки межгород",
"грузоперевозки между городами",
"грузоперевозки по россии",
"грузоперевозки по рф",
"грузоперевозок по россии",
"доставка грузов перевозки",
"доставка грузоперевозки",
"доставка для интернет магазинов",
"доставка для маркетплейс",
"доставка до маркетплейсов",
"доставка крупногабаритных грузов",
"доставка на склад",
"доставка на склады маркетплейсов",
"доставка товара на склад",
"доставке до маркетплейсов",
"логистика для интернет магазинов",
"междугородние грузоперевозки",
"отвезти коробки на склад",
"отвезти товар на склад",
"отправить товар на склад",
"перевозка грузов межгород",
"перевозка грузов по россии",
"фулфилмент доставка"],
competitors: ["конкурент 1 доставка", "конкурент 2 доставка"]
},
"Каршеринг": {
brand:["драйв для бизнеса",
"драйв корпоративный",
"каршеринг для бизнеса яндекс",
"корпоративный каршеринг яндекс",
"корпоративный клиент драйв",
"драйв юридическим",
"драйв юр лиц",
"драйв юрлиц",
"яндекс каршеринг юридическим",
"яндекс каршернинг юр лиц",
"яндекс каршеринг юрлиц"],
generic: ["авто для бизнеса",
"авто для юридических лиц",
"автомобиль для бизнеса",
"автомобиль для юридических лиц",
"аренда авто бизнес",
"аренда авто для юр лиц",
"аренда авто для юридических лиц",
"аренда автомобиля для сотрудника",
"аренда машины для бизнеса",
"аренда машины для организации",
"аренда машины юридическим лицом",
"аренда служебного автомобиля",
"договор аренды авто юр лицом",
"каршеринг для бизнеса",
"каршеринг для компании",
"каршеринг для юридических лиц",
"коммерческий каршеринг",
"корпоративные авто",
"корпоративный автомобиль",
"корпоративный автопарк",
"корпоративный каршеринг",
"машина для малого бизнеса",
"машина для юридических лиц",
"машины для бизнеса",
"машины для малого бизнесе",
"служебные автомобили для сотрудников"]},
"Заправки": {
brand:["бизнес аккаунт яндекс заправки",
"бизнес го яндекс топливо",
"бизнес счет яндекс заправки",
"топливная карта яндекс для юридических лиц",
"топливные карты яндекс для юр лиц",
"яндекс го заправки для бизнеса",
"яндекс гоу заправки для бизнеса",
"яндекс заправка для ип",
"яндекс заправки бизнес карта",
"яндекс заправки для бизнеса",
"яндекс заправки для корпоративных",
"яндекс заправки для юр лиц",
"яндекс заправки для юридических лиц",
"яндекс заправки корпоративный личный кабинет",
"яндекс заправки топливные карты",
"яндекс топливные карты для бизнеса",
"яндекс топливо для юр лиц",
"яндекс go заправка для бизнеса",
"яндекс go топливные карты",
"yandex fuels",
"яндекс заправка юр лица"],
generic: ["карта на азс",
"бензин для ип",
"бензин для юр лиц",
"бензин для юридических лиц",
"бензин сотрудникам",
"бензиновая карта",
"бизнес зарядка электромобилей",
"виртуальная карта заправки",
"возмещение бензина",
"возмещение расходов на бензин",
"возмещение топлива",
"заправить авто для бизнеса",
"заправка для бизнеса",
"заправка для юр лиц",
"заправка для юридических лиц",
"заправка по топливным картам",
"заправки для ип",
"заправочная карта",
"карта для заправки на азс",
"карта заправок для юридических лиц",
"карта зарядных станций в москве",
"карта на бензин",
"карта на топливо",
"карта оплаты бензина",
"компенсация бензина работнику",
"компенсация бензина сотруднику",
"компенсация за бензин",
"компенсация топлива",
"корпоративная заправка",
"корпоративная карта заправок",
"купить топливную карту для ип",
"купить топливную карту для юридических",
"оплата бензина сотрудникам",
"топливная карта",
"топливо для бизнеса",
"топливо для ип",
"топливо для юр лиц",
"топливо для юридических лиц"]
}}
function isoDate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ------------------- localStorage ключи -------------------
const LS_QUERY_CONFIG = "wordstat_query_config_v1";
// Адрес твоего Flask-сервера (app.py). Если он на другом порту — поменяй.
const API_BASE = "http://127.0.0.1:3002";

// ------------------- DOM -------------------
const productSelect = document.getElementById("productSelect");
const typeSegment = document.getElementById("typeSegment");
const granularitySegment = document.getElementById("granularitySegment");
const dateFrom = document.getElementById("dateFrom");
const dateTo = document.getElementById("dateTo");
const runBtn = document.getElementById("runBtn");
const editQueriesBtn = document.getElementById("editQueriesBtn");
const dataModeSelect = document.getElementById("dataMode");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const chartTitle = document.getElementById("chartTitle");
const chartSubtitle = document.getElementById("chartSubtitle");
const legendEl = document.getElementById("legend");

const kpiTotal = document.getElementById("kpiTotal");
const kpiAvg = document.getElementById("kpiAvg");
const kpiTrend = document.getElementById("kpiTrend");

const canvas = document.getElementById("chartCanvas");
const ctx = canvas.getContext("2d");

const tableBody = document.querySelector("#dataTable tbody");
const exportCsvBtn = document.getElementById("exportCsvBtn");

// Модалка
const modalBackdrop = document.getElementById("modalBackdrop");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalSaveBtn = document.getElementById("modalSaveBtn");
const modalResetBtn = document.getElementById("modalResetBtn");
const queriesTextarea = document.getElementById("queriesTextarea");
const modalSubtitle = document.getElementById("modalSubtitle");

// ------------------- STATE -------------------
let queryConfig = loadQueryConfig();
let selectedType = "brand";
let selectedGranularity = "day";
let lastSeries = []; // [{date,value}]

// ------------------- INIT -------------------
init();

function init() {
  // Заполняем продукты
  const products = Object.keys(queryConfig);
  for (const p of products) {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    productSelect.appendChild(opt);
  }

  // Даты по умолчанию: последние 30 дней
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 30);

  dateFrom.value = isoDate(start);
  dateTo.value = isoDate(now);

  // События
  typeSegment.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg");
    if (!btn) return;
    selectedType = btn.dataset.type;
    setActiveSegment(typeSegment, btn);
    updateSubtitle();
  });

  granularitySegment.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg");
    if (!btn) return;
    selectedGranularity = btn.dataset.granularity;
    setActiveSegment(granularitySegment, btn);
    updateSubtitle();
  });

  productSelect.addEventListener("change", () => {
    updateSubtitle();
  });

  runBtn.addEventListener("click", async () => {
    await run();
  });

  editQueriesBtn.addEventListener("click", () => openEditor());
  modalCloseBtn.addEventListener("click", () => closeEditor());
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeEditor();
  });
  modalSaveBtn.addEventListener("click", () => saveEditor());
  modalResetBtn.addEventListener("click", () => resetEditor());

  exportCsvBtn.addEventListener("click", () => exportCSV());

  // Первая отрисовка
  updateSubtitle();
  setStatus("idle", "Готово");
  drawEmpty();
}

// ------------------- UI helpers -------------------
function setActiveSegment(container, activeBtn) {
  container.querySelectorAll(".seg").forEach((b) => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

function setStatus(kind, text) {
  statusDot.className = `dot ${kind}`;
  statusText.textContent = text;
}

function updateSubtitle() {
  const product = productSelect.value || Object.keys(queryConfig)[0];
  const queries = getQueries(product, selectedType);
  chartTitle.textContent = `${product} • ${typeLabel(selectedType)}`;
  chartSubtitle.textContent =
    `${selectedGranularityLabel(selectedGranularity)} • ${queries.length} запрос(ов)`;
}

// ------------------- Конфиг запросов -------------------
function loadQueryConfig() {
  try {
    const raw = localStorage.getItem(LS_QUERY_CONFIG);
    if (!raw) return structuredClone(DEFAULT_QUERY_CONFIG);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return structuredClone(DEFAULT_QUERY_CONFIG);

    // Мягкая нормализация: если чего-то нет — подставим дефолты
    const merged = structuredClone(DEFAULT_QUERY_CONFIG);
    for (const product of Object.keys(parsed)) {
      merged[product] = merged[product] || { brand: [], generic: [], competitors: [] };
      for (const t of ["brand", "generic", "competitors"]) {
        if (Array.isArray(parsed[product]?.[t])) merged[product][t] = parsed[product][t];
      }
    }
    return merged;
  } catch {
    return structuredClone(DEFAULT_QUERY_CONFIG);
  }
}

function saveQueryConfig() {
  localStorage.setItem(LS_QUERY_CONFIG, JSON.stringify(queryConfig));
}

function getQueries(product, type) {
  return (queryConfig?.[product]?.[type] ?? []).filter((s) => String(s).trim().length > 0);
}

function typeLabel(type) {
  return type === "brand" ? "Бренд" : type === "generic" ? "Дженерик" : "Конкуренты";
}

function selectedGranularityLabel(g) {
  return g === "day" ? "По дням" : g === "week" ? "По неделям" : g === "month" ? "По месяцам" : "По годам";
}

// ------------------- Редактор запросов -------------------
function openEditor() {
  const product = productSelect.value;
  const list = getQueries(product, selectedType);
  queriesTextarea.value = list.join("\n");
  modalSubtitle.textContent = `${product} • ${typeLabel(selectedType)}`;
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");
  queriesTextarea.focus();
}

function closeEditor() {
  modalBackdrop.classList.add("hidden");
  modalBackdrop.setAttribute("aria-hidden", "true");
}

function saveEditor() {
  const product = productSelect.value;
  const lines = queriesTextarea.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  queryConfig[product] = queryConfig[product] || { brand: [], generic: [], competitors: [] };
  queryConfig[product][selectedType] = lines;

  saveQueryConfig();
  closeEditor();
  updateSubtitle();
}

function resetEditor() {
  const product = productSelect.value;
  queryConfig = structuredClone(DEFAULT_QUERY_CONFIG);
  saveQueryConfig();
  queriesTextarea.value = getQueries(product, selectedType).join("\n");
  updateSubtitle();
}

// ------------------- Основной запуск -------------------
async function run() {
  const product = productSelect.value;
  const queries = getQueries(product, selectedType);

  if (!queries.length) {
    setStatus("warn", "Нет запросов. Добавь их в редакторе.");
    drawEmpty("Нет запросов для выбранного фильтра");
    fillTable([]);
    fillKPIs([]);
    return;
  }

  const from = dateFrom.value;
  const to = dateTo.value;
  if (!from || !to || from > to) {
    setStatus("warn", "Проверь даты (from ≤ to)");
    return;
  }

  setStatus("busy", "Загружаю данные…");

  try {
    const mode = dataModeSelect.value;
    const series =
      mode === "mock"
        ? await mockFetch(queries, from, to, selectedGranularity)
        : await fetchWordstat(queries, from, to, selectedGranularity);

    lastSeries = series;

    
    setStatus("ok", "Готово");
    renderLegend([{ name: "Суммарно по запросам" }]);
    drawChart(series);
    fillTable(series);
    fillKPIs(series);
  } catch (err) {
    console.error(err);
    setStatus("error", "Ошибка загрузки");
    drawEmpty("Не удалось получить данные");
    fillTable([]);
    fillKPIs([]);
  }
}

// ------------------- API: сюда подключишь Wordstat -------------------
/**
 * ОЖИДАЕМЫЙ формат результата:
 * return [{ date: "YYYY-MM-DD"|"YYYY-W##"|"YYYY-MM"|"YYYY", value: number }, ...]
 *
 * Где value — суммарная частота по выбранному списку запросов.
 */
async function fetchWordstat(queries, from, to, granularity) {
  const res = await fetch("/api/wordstat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queries, from, to, granularity })
  });
  
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // ожидаем формат: [{date, value}, ...]
  if (!Array.isArray(data)) {
    throw new Error("Неверный формат ответа от сервера");
  }

  return data;
}

// ------------------- MOCK данные (для дизайна и логики) -------------------
async function mockFetch(queries, from, to, granularity) {
  // имитируем задержку сети
  await sleep(350);

  const points = buildDateAxis(from, to, granularity);
  // генерим «правдоподобную» динамику
  let base = 200 + queries.length * 120;
  const series = points.map((d, i) => {
    const wave = Math.sin(i / 2.6) * 0.12 + Math.sin(i / 7.5) * 0.08;
    const noise = (Math.random() - 0.5) * 0.18;
    const trend = i * (0.006 + queries.length * 0.0002);
    const value = Math.max(0, Math.round(base * (1 + wave + noise) + base * trend));
    return { date: d, value };
  });

  return series;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ------------------- Генерация оси дат -------------------
function buildDateAxis(fromISO, toISO, granularity) {
  const from = new Date(fromISO);
  const to = new Date(toISO);

  if (granularity === "day") {
    const out = [];
    const cur = new Date(from);
    while (cur <= to) {
      out.push(isoDate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  if (granularity === "week") {
    // ISO week (упрощённо): считаем недели от даты from
    const out = [];
    const cur = new Date(from);
    let idx = 1;
    while (cur <= to) {
      const y = cur.getFullYear();
      out.push(`${y}-W${String(idx).padStart(2, "0")}`);
      cur.setDate(cur.getDate() + 7);
      idx++;
      if (idx > 53) idx = 1;
    }
    return out;
  }

  if (granularity === "month") {
    const out = [];
    const cur = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);
    while (cur <= end) {
      out.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
      cur.setMonth(cur.getMonth() + 1);
    }
    return out;
  }

  // year
  const out = [];
  for (let y = from.getFullYear(); y <= to.getFullYear(); y++) {
    out.push(String(y));
  }
  return out;
}

// ------------------- График (Canvas) -------------------
function drawEmpty(text = "Выбери фильтры и нажми «Построить»") {
  clearCanvas();
  ctx.save();
  ctx.fillStyle = "#0f172a";
  ctx.globalAlpha = 0.65;
  ctx.font = "20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawChart(series) {
  if (!series?.length) {
    drawEmpty("Нет данных");
    return;
  }

  const padding = { left: 70, right: 60, top: 24, bottom: 60 };
  const w = canvas.width - padding.left - padding.right;
  const h = canvas.height - padding.top - padding.bottom;

  const values = series.map((p) => p.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = Math.max(1, maxV - minV);

  const xFor = (i) => padding.left + (w * i) / Math.max(1, series.length - 1);
  const yFor = (v) => padding.top + h - (h * (v - minV)) / range;

  clearCanvas();

  // фон
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // сетка + оси
  drawGrid(padding, w, h, minV, maxV);

  // линия
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#2563eb";
  ctx.beginPath();
  series.forEach((p, i) => {
    const x = xFor(i);
    const y = yFor(p.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  // точки
  ctx.save();
  ctx.fillStyle = "#1d4ed8";
  series.forEach((p, i) => {
    const x = xFor(i);
    const y = yFor(p.value);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // подписи X (редко)
  ctx.save();
  ctx.fillStyle = "#0f172a";
  ctx.globalAlpha = 0.75;
  ctx.font = "13px system-ui, -apple-system, Segoe UI, Roboto, Arial";

  const yLabel = padding.top + h + 34;
  const step = Math.ceil(series.length / 8);

  for (let i = 0; i < series.length; i += step) {
    const x = xFor(i);

    if (i === 0) ctx.textAlign = "left";
    else if (i >= series.length - 1) ctx.textAlign = "right";
    else ctx.textAlign = "center";

    ctx.fillText(formatTickLabel(series[i].date), x, yLabel);
  }

  // последняя (если вдруг step её пропустил)
  const lastI = series.length - 1;
  ctx.textAlign = "right";
  ctx.fillText(formatTickLabel(series[lastI].date), xFor(lastI), yLabel);

  ctx.restore();
}

function drawGrid(padding, w, h, minV, maxV) {
  ctx.save();
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  // горизонтальные линии (5)
  const lines = 5;
  for (let i = 0; i <= lines; i++) {
    const y = padding.top + (h * i) / lines;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + w, y);
    ctx.stroke();
  }

  // ось Y подписи
  ctx.fillStyle = "#0f172a";
  ctx.globalAlpha = 0.7;
  ctx.font = "13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "right";

  for (let i = 0; i <= lines; i++) {
    const v = Math.round(maxV - ((maxV - minV) * i) / lines);
    const y = padding.top + (h * i) / lines + 4;
    ctx.fillText(String(v), padding.left - 10, y);
  }

  // оси
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + h);
  ctx.lineTo(padding.left + w, padding.top + h);
  ctx.stroke();

  ctx.restore();
}

function renderLegend(items) {
  legendEl.innerHTML = "";
  for (const it of items) {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<span class="swatch"></span><span>${it.name}</span>`;
    legendEl.appendChild(chip);
  }
}

// ------------------- Таблица + KPI -------------------
function fillTable(series) {
  tableBody.innerHTML = "";
  for (const p of series) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(p.date)}</td><td>${formatNum(p.value)}</td>`;
    tableBody.appendChild(tr);
  }
}

function fillKPIs(series) {
  if (!series?.length) {
    kpiTotal.textContent = "—";
    kpiAvg.textContent = "—";
    kpiTrend.textContent = "—";
    return;
  }
  const sum = series.reduce((a, b) => a + b.value, 0);
  const avg = sum / series.length;
  const first = series[0].value;
  const last = series[series.length - 1].value;
  const delta = last - first;
  const pct = first === 0 ? 0 : (delta / first) * 100;

  kpiTotal.textContent = formatNum(sum);
  kpiAvg.textContent = formatNum(Math.round(avg));

  const sign = delta > 0 ? "▲" : delta < 0 ? "▼" : "•";
  kpiTrend.textContent = `${sign} ${formatNum(delta)} (${pct.toFixed(1)}%)`;
}

function exportCSV() {
  if (!lastSeries?.length) return;

  const rows = [["date", "value"], ...lastSeries.map((p) => [p.date, String(p.value)])];
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `wordstat_${productSelect.value}_${selectedType}_${selectedGranularity}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function csvEscape(s) {
  const str = String(s);
  if (/[",\n]/.test(str)) return `"${str.replaceAll('"', '""')}"`;
  return str;
}

function formatNum(n) {
  return new Intl.NumberFormat("ru-RU").format(n);
}

function formatTickLabel(s) {
  // "2026-01-15" -> "15.01"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s.slice(8,10)}.${s.slice(5,7)}`;
  // "2026-01" -> "01.2026"
  if (/^\d{4}-\d{2}$/.test(s)) return `${s.slice(5,7)}.${s.slice(0,4)}`;
  // "2026-W03" -> "W03"
  if (/^\d{4}-W\d{2}$/.test(s)) return s.slice(5);
  return s;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
}};

// ============================================================
//  Wordstat Trends — фронт
//  Chart.js, мульти-серии (Продукт × Тип)
// ============================================================

const LS_QUERY_CONFIG = "wordstat_query_config_v2";
const LS_FILTERS      = "wordstat_filters_v1";

const TYPE_LABEL = { brand: "Бренд", generic: "Дженерик" };

// Русские склонения: pluralize(5, ['серия','серии','серий']) -> 'серий'
function pluralize(n, forms) {
  const mod10 = Math.abs(n) % 10;
  const mod100 = Math.abs(n) % 100;
  if (mod100 >= 11 && mod100 <= 19) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}
const FORMS_SERIES  = ["серия", "серии", "серий"];
const FORMS_QUERIES = ["запрос", "запроса", "запросов"];

const PALETTE = [
  "#2563eb", "#ef4444", "#10b981", "#f59e0b", "#7c3aed",
  "#0ea5e9", "#ec4899", "#84cc16", "#64748b", "#dc2626",
  "#14b8a6", "#a855f7",
];

const $ = (id) => document.getElementById(id);
const statusDot = $("statusDot");
const statusText = $("statusText");
const productChecks = $("productChecks");
const typeChecks = $("typeChecks");
const granularitySegment = $("granularitySegment");
const dateFrom = $("dateFrom");
const dateTo = $("dateTo");
const runBtn = $("runBtn");
const editQueriesBtn = $("editQueriesBtn");
const chartTitle = $("chartTitle");
const chartSubtitle = $("chartSubtitle");
const kpiTotal = $("kpiTotal");
const kpiAvg = $("kpiAvg");
const kpiTrend = $("kpiTrend");
const canvas = $("chartCanvas");
const tableHead = document.querySelector("#dataTable thead");
const tableBody = document.querySelector("#dataTable tbody");
const exportCsvBtn = $("exportCsvBtn");
const quotaText = $("quotaText");
const quotaBarFill = $("quotaBarFill");

const modalBackdrop = $("modalBackdrop");
const modalCloseBtn = $("modalCloseBtn");
const modalSaveBtn = $("modalSaveBtn");
const modalResetBtn = $("modalResetBtn");
const queriesTextarea = $("queriesTextarea");
const modalSubtitle = $("modalSubtitle");
const editProductSelect = $("editProductSelect");
const editTypeSelect = $("editTypeSelect");

let queryConfig = loadQueryConfig();
let selectedGranularity = "week";
let chart = null;
let lastResponse = null;

init();

function init() {
  renderProductChecks();
  renderEditProductOptions();
  restoreFilters();

  granularitySegment.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg");
    if (!btn) return;
    selectedGranularity = btn.dataset.granularity;
    setActiveSegment(granularitySegment, btn);
    saveFilters();
  });

  typeChecks.addEventListener("change", saveFilters);
  productChecks.addEventListener("change", saveFilters);
  dateFrom.addEventListener("change", saveFilters);
  dateTo.addEventListener("change", saveFilters);

  runBtn.addEventListener("click", run);

  editQueriesBtn.addEventListener("click", openEditor);
  modalCloseBtn.addEventListener("click", closeEditor);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeEditor();
  });
  modalSaveBtn.addEventListener("click", saveEditor);
  modalResetBtn.addEventListener("click", resetEditor);
  editProductSelect.addEventListener("change", loadEditorText);
  editTypeSelect.addEventListener("change", loadEditorText);

  exportCsvBtn.addEventListener("click", exportCSV);

  setStatus("idle", "Готово");
  drawEmpty();
  refreshQuota();
  setInterval(refreshQuota, 30000);
}

async function refreshQuota() {
  try {
    const res = await fetch("/api/quota", { cache: "no-store" });
    if (!res.ok) return;
    const q = await res.json();
    updateQuotaWidget(q);
  } catch {}
}

function updateQuotaWidget(q) {
  if (!q || typeof q.used !== "number") return;
  const used = q.used;
  const limit = q.limit || 2000;
  const remaining = q.remaining ?? Math.max(0, limit - used);
  quotaText.textContent = `${formatNum(used)} / ${formatNum(limit)}`;
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  quotaBarFill.style.width = pct + "%";
  quotaBarFill.classList.remove("warn", "danger");
  if (pct >= 85) quotaBarFill.classList.add("danger");
  else if (pct >= 60) quotaBarFill.classList.add("warn");
  let title = `Использовано: ${used} из ${limit} (осталось ${remaining}).`;
  if (q.reset_in_sec > 0) {
    const m = Math.floor(q.reset_in_sec / 60);
    title += ` Окно сместится на 1 запрос через ~${m} мин.`;
  }
  quotaText.parentElement.title = title;
}

function saveFilters() {
  const state = {
    products: getCheckedValues(productChecks),
    types: getCheckedValues(typeChecks),
    granularity: selectedGranularity,
    from: dateFrom.value,
    to: dateTo.value,
  };
  try { localStorage.setItem(LS_FILTERS, JSON.stringify(state)); } catch {}
}

function restoreFilters() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(LS_FILTERS) || "{}"); } catch {}

  if (saved.from && saved.to) {
    dateFrom.value = saved.from;
    dateTo.value = saved.to;
  } else {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - 3);
    dateFrom.value = isoDate(start);
    dateTo.value = isoDate(now);
  }

  if (saved.granularity) {
    selectedGranularity = saved.granularity;
    granularitySegment.querySelectorAll(".seg").forEach((b) => {
      b.classList.toggle("active", b.dataset.granularity === selectedGranularity);
    });
  }

  const products = Object.keys(queryConfig);
  const checkedProducts = saved.products?.length ? saved.products : products.slice(0, 1);
  productChecks.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = checkedProducts.includes(cb.value);
  });

  if (saved.types?.length) {
    typeChecks.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = saved.types.includes(cb.value);
    });
  }
}

function setActiveSegment(container, activeBtn) {
  container.querySelectorAll(".seg").forEach((b) => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

function setStatus(kind, text) {
  statusDot.className = `dot ${kind}`;
  statusText.textContent = text;
}

function getCheckedValues(container) {
  return [...container.querySelectorAll('input[type="checkbox"]:checked')].map((cb) => cb.value);
}

function renderProductChecks() {
  productChecks.innerHTML = "";
  for (const p of Object.keys(queryConfig)) {
    const label = document.createElement("label");
    label.className = "check";
    label.innerHTML = `<input type="checkbox" value="${escapeAttr(p)}"> ${escapeHtml(p)}`;
    productChecks.appendChild(label);
  }
}

function renderEditProductOptions() {
  editProductSelect.innerHTML = "";
  for (const p of Object.keys(queryConfig)) {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    editProductSelect.appendChild(opt);
  }
}

function loadQueryConfig() {
  try {
    const raw = localStorage.getItem(LS_QUERY_CONFIG);
    if (!raw) return structuredClone(DEFAULT_QUERY_CONFIG);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return structuredClone(DEFAULT_QUERY_CONFIG);
    const merged = {};
    for (const product of Object.keys({ ...DEFAULT_QUERY_CONFIG, ...parsed })) {
      const base = DEFAULT_QUERY_CONFIG[product] || { brand: [], generic: [] };
      const user = parsed[product] || {};
      merged[product] = {
        brand: Array.isArray(user.brand) ? user.brand : (base.brand || []),
        generic: Array.isArray(user.generic) ? user.generic : (base.generic || []),
      };
    }
    return merged;
  } catch {
    return structuredClone(DEFAULT_QUERY_CONFIG);
  }
}

function saveQueryConfig() {
  try { localStorage.setItem(LS_QUERY_CONFIG, JSON.stringify(queryConfig)); } catch {}
}

function getQueries(product, type) {
  return (queryConfig?.[product]?.[type] ?? [])
    .filter((s) => s && String(s).trim().length > 0)
    .map((s) => String(s).trim());
}

function openEditor() {
  const checkedProducts = getCheckedValues(productChecks);
  if (checkedProducts[0]) editProductSelect.value = checkedProducts[0];
  const checkedTypes = getCheckedValues(typeChecks);
  if (checkedTypes[0]) editTypeSelect.value = checkedTypes[0];
  loadEditorText();
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");
  queriesTextarea.focus();
}

function closeEditor() {
  modalBackdrop.classList.add("hidden");
  modalBackdrop.setAttribute("aria-hidden", "true");
}

function loadEditorText() {
  const product = editProductSelect.value;
  const type = editTypeSelect.value;
  const list = getQueries(product, type);
  queriesTextarea.value = list.join("\n");
  modalSubtitle.textContent = `${product} • ${TYPE_LABEL[type]} • ${list.length} ${pluralize(list.length, FORMS_QUERIES)}`;
}

function saveEditor() {
  const product = editProductSelect.value;
  const type = editTypeSelect.value;
  const lines = queriesTextarea.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  queryConfig[product] = queryConfig[product] || { brand: [], generic: [] };
  queryConfig[product][type] = lines;
  saveQueryConfig();
  loadEditorText();
  setStatus("ok", "Список сохранён");
}

function resetEditor() {
  queryConfig = structuredClone(DEFAULT_QUERY_CONFIG);
  saveQueryConfig();
  renderProductChecks();
  renderEditProductOptions();
  loadEditorText();
  setStatus("ok", "Сброшено к дефолту");
}

async function run() {
  const products = getCheckedValues(productChecks);
  const types = getCheckedValues(typeChecks);
  const from = dateFrom.value;
  const to = dateTo.value;

  if (!products.length) { setStatus("warn", "Выбери хотя бы один продукт"); return; }
  if (!types.length)    { setStatus("warn", "Выбери хотя бы один тип запросов"); return; }
  if (!from || !to || from > to) { setStatus("warn", "Проверь даты (from ≤ to)"); return; }

  const series = [];
  for (const product of products) {
    for (const type of types) {
      const queries = getQueries(product, type);
      if (!queries.length) continue;
      series.push({ name: `${product} — ${TYPE_LABEL[type]}`, queries });
    }
  }

  if (!series.length) { setStatus("warn", "У выбранных комбинаций нет запросов"); return; }

  const seriesWord = pluralize(series.length, FORMS_SERIES);
  setStatus("busy", `Загружаю ${series.length} ${seriesWord}…`);
  chartSubtitle.textContent = `${series.length} ${seriesWord} • ${granularityLabel(selectedGranularity)}`;

  try {
    const res = await fetch("/api/wordstat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ series, from, to, granularity: selectedGranularity }),
    });
    let data;
    try { data = await res.json(); } catch { data = null; }
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    if (!data?.series) throw new Error("Неверный формат ответа");

    lastResponse = data;
    setStatus("ok", "Готово");
    if (data.quota) updateQuotaWidget(data.quota);

    const gran = data.granularity || selectedGranularity;
    renderChart(data.series, gran);
    renderTable(data.series, gran);
    renderKPIs(data.series);
  } catch (err) {
    console.error(err);
    setStatus("error", `Ошибка: ${err.message || err}`);
    drawEmpty("Не удалось получить данные");
    renderTable([]);
    renderKPIs([]);
  }
}

function granularityLabel(g) {
  return g === "day" ? "По дням" :
         g === "week" ? "По неделям" :
         g === "month" ? "По месяцам" : "По годам";
}

function drawEmpty(text = "Выбери фильтры и нажми «Построить»") {
  if (chart) { chart.destroy(); chart = null; }
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.fillStyle = "rgba(15,23,42,.55)";
  ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function collectAllDates(seriesList) {
  const set = new Set();
  for (const s of seriesList) for (const p of (s.points || [])) set.add(p.date);
  return [...set].sort();
}

function renderChart(seriesList, granularity) {
  if (chart) chart.destroy();

  const rawLabels = collectAllDates(seriesList);
  const datasets = seriesList.map((s, i) => {
    const byDate = Object.fromEntries((s.points || []).map((p) => [p.date, p.value]));
    return {
      label: s.name,
      data: rawLabels.map((d) => byDate[d] ?? null),
      borderColor: PALETTE[i % PALETTE.length],
      backgroundColor: PALETTE[i % PALETTE.length] + "20",
      tension: 0.25,
      borderWidth: 2,
      pointRadius: rawLabels.length > 60 ? 0 : 3,
      pointHoverRadius: 5,
      spanGaps: true,
    };
  });

  canvas.parentElement.style.height = "440px";

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: rawLabels.map((d) => formatTickLabel(d, granularity)),
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            // В тултипе всегда показываем полную дату YYYY-MM-DD
            title: (items) => items.length ? rawLabels[items[0].dataIndex] : "",
            label: (ctx) => `${ctx.dataset.label}: ${formatNum(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => formatNum(v) } },
        x: { ticks: { maxRotation: 0, autoSkipPadding: 16 } },
      },
    },
  });
}

function renderTable(seriesList, granularity) {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
  if (!seriesList?.length) {
    tableHead.innerHTML = "<tr><th>Дата</th></tr>";
    return;
  }
  const dates = collectAllDates(seriesList);

  const trh = document.createElement("tr");
  trh.innerHTML = `<th>Дата</th>` + seriesList.map((s) => `<th>${escapeHtml(s.name)}</th>`).join("");
  tableHead.appendChild(trh);

  const byDate = seriesList.map((s) => Object.fromEntries((s.points || []).map((p) => [p.date, p.value])));
  for (const d of dates) {
    const tr = document.createElement("tr");
    const label = formatTickLabel(d, granularity);
    const cells = byDate.map((m) => `<td>${m[d] != null ? formatNum(m[d]) : "—"}</td>`).join("");
    tr.innerHTML = `<td>${escapeHtml(label)}</td>${cells}`;
    tableBody.appendChild(tr);
  }
}

function renderKPIs(seriesList) {
  if (!seriesList?.length) {
    kpiTotal.textContent = kpiAvg.textContent = kpiTrend.textContent = "—";
    return;
  }
  const dates = collectAllDates(seriesList);
  const totalByDate = dates.map((d) => {
    let sum = 0;
    for (const s of seriesList) {
      const v = (s.points || []).find((p) => p.date === d)?.value;
      if (typeof v === "number") sum += v;
    }
    return { date: d, value: sum };
  });

  const sum = totalByDate.reduce((a, b) => a + b.value, 0);
  const avg = sum / Math.max(1, totalByDate.length);
  const first = totalByDate[0]?.value || 0;
  const last = totalByDate[totalByDate.length - 1]?.value || 0;
  const delta = last - first;
  const pct = first === 0 ? 0 : (delta / first) * 100;

  kpiTotal.textContent = formatNum(sum);
  kpiAvg.textContent = formatNum(Math.round(avg));
  const sign = delta > 0 ? "▲" : delta < 0 ? "▼" : "•";
  kpiTrend.textContent = `${sign} ${formatNum(delta)} (${pct.toFixed(1)}%)`;
}

function exportCSV() {
  if (!lastResponse?.series?.length) return;
  const seriesList = lastResponse.series;
  const dates = collectAllDates(seriesList);
  const header = ["date", ...seriesList.map((s) => s.name)];
  const byDate = seriesList.map((s) => Object.fromEntries((s.points || []).map((p) => [p.date, p.value])));
  const rows = [header, ...dates.map((d) => [d, ...byDate.map((m) => m[d] ?? "")])];
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wordstat_${selectedGranularity}_${dateFrom.value}_${dateTo.value}.csv`;
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

function isoDate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatNum(n) {
  return new Intl.NumberFormat("ru-RU").format(n);
}

function formatTickLabel(s, granularity) {
  // Все даты приходят как YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const yyyy = s.slice(0, 4);
  const mm   = s.slice(5, 7);
  const dd   = s.slice(8, 10);
  switch (granularity) {
    case "year":  return yyyy;                         // 2025
    case "month": return `${mm}.${yyyy}`;              // 04.2025
    case "week":  // fallthrough — для недель так же как для дня
    case "day":
    default:      return `${dd}.${mm}.${yyyy.slice(2)}`; // 15.04.25
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s) {
  return escapeHtml(s);
}

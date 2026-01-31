const LANG_KEY = "lang";
const DEFAULT_LANG = "en";

const TARGET_KEY_MAP = {
  "Turret 1": "target.turret1",
  "Turret 2": "target.turret2",
  "Turret 3": "target.turret3",
  "Turret 4": "target.turret4",
  "Castle": "target.castle"
};

const STRINGS = {
  en: {
    appTitle: "Rally Helper",
    addRally: "Add Rally Creator",
    searchPlaceholder: "Search Rally Creator...",
    language: "Language",
    tabAlly: "Ally",
    tabEnemy: "Enemy",
    listTitle: "Rally Creators & Targets",
    calculate: "Calculate",
    resultTitle: "Result (UTC)",
    copy: "Copy",
    copied: "Copied",
    import: "Import",
    export: "Export",
    alliesSection: "Allies",
    enemiesSection: "Enemies",
    noTarget: "No target",
    allyTimings: "Ally timings",
    rallyWord: "Rally",
    bufferLabel: "Buffer (sec)",
    counterRally: "Counter rally",
    minLabel: "min",
    secLabel: "sec",
    "target.turret1": "Turret 1",
    "target.turret2": "Turret 2",
    "target.turret3": "Turret 3",
    "target.turret4": "Turret 4",
    "target.castle": "Castle"
  },
  es: {
    appTitle: "Ayudante de Rally",
    addRally: "Agregar creador de rally",
    searchPlaceholder: "Buscar creador de rally...",
    language: "Idioma",
    tabAlly: "Aliado",
    tabEnemy: "Enemigo",
    listTitle: "Creadores de Rally y Objetivos",
    calculate: "Calcular",
    resultTitle: "Resultado (UTC)",
    copy: "Copiar",
    copied: "Copiado",
    import: "Importar",
    export: "Exportar",
    alliesSection: "Aliados",
    enemiesSection: "Enemigos",
    noTarget: "Sin objetivo",
    allyTimings: "Tiempos aliados",
    rallyWord: "Rally",
    bufferLabel: "Buffer (seg)",
    counterRally: "Contra rally",
    minLabel: "min",
    secLabel: "seg",
    "target.turret1": "Torreta 1",
    "target.turret2": "Torreta 2",
    "target.turret3": "Torreta 3",
    "target.turret4": "Torreta 4",
    "target.castle": "Castillo"
  },
  ko: {
    appTitle: "랠리 도우미",
    addRally: "랠리 생성기 추가",
    searchPlaceholder: "랠리 생성기 검색...",
    language: "언어",
    tabAlly: "아군",
    tabEnemy: "적군",
    listTitle: "랠리 생성기 및 목표",
    calculate: "계산",
    resultTitle: "결과 (UTC)",
    copy: "복사",
    copied: "복사됨",
    import: "가져오기",
    export: "내보내기",
    alliesSection: "아군",
    enemiesSection: "적군",
    noTarget: "목표 없음",
    allyTimings: "아군 타이밍",
    rallyWord: "랠리",
    bufferLabel: "버퍼 (초)",
    counterRally: "카운터 랠리",
    minLabel: "분",
    secLabel: "초",
    "target.turret1": "포탑 1",
    "target.turret2": "포탑 2",
    "target.turret3": "포탑 3",
    "target.turret4": "포탑 4",
    "target.castle": "성"
  },
  "zh-Hant": {
    appTitle: "集結助手",
    addRally: "新增集結發起者",
    searchPlaceholder: "搜尋集結發起者...",
    language: "語言",
    tabAlly: "盟軍",
    tabEnemy: "敵軍",
    listTitle: "集結發起者與目標",
    calculate: "計算",
    resultTitle: "結果 (UTC)",
    copy: "複製",
    copied: "已複製",
    import: "匯入",
    export: "匯出",
    alliesSection: "盟軍",
    enemiesSection: "敵軍",
    noTarget: "無目標",
    allyTimings: "盟軍時間",
    rallyWord: "集結",
    bufferLabel: "緩衝 (秒)",
    counterRally: "反制集結",
    minLabel: "分",
    secLabel: "秒",
    "target.turret1": "砲塔 1",
    "target.turret2": "砲塔 2",
    "target.turret3": "砲塔 3",
    "target.turret4": "砲塔 4",
    "target.castle": "城堡"
  }
};

let currentLang = DEFAULT_LANG;

export function initI18n() {
  const saved = localStorage.getItem(LANG_KEY);
  setLanguage(saved || DEFAULT_LANG);
}

export function setLanguage(lang) {
  if (!STRINGS[lang]) {
    currentLang = DEFAULT_LANG;
  } else {
    currentLang = lang;
  }
  localStorage.setItem(LANG_KEY, currentLang);
  document.documentElement.lang = currentLang === "zh-Hant" ? "zh-Hant" : currentLang;
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  const table = STRINGS[currentLang] || STRINGS[DEFAULT_LANG];
  return table[key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
}

export function targetLabel(name) {
  const key = TARGET_KEY_MAP[name];
  return key ? t(key) : name;
}

export function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    el.setAttribute("placeholder", t(key));
  });

  document.title = t("appTitle");
}

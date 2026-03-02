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
    filterByTarget: "Filter by target",
    sortTargets: "Sort",
    calculateTarget: "Target",
    allTargets: "All",
    findLabel: "Find",
    findPlaceholder: "Find name...",
    replaceLabel: "Replace",
    replacePlaceholder: "Replace with...",
    findNext: "Find",
    replaceOne: "Replace",
    replaceAll: "Replace All",
    findReplaceToggle: "Find & Replace",
    toggleCards: "Toggle cards",
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
    enemyAllies: "Enemy allies",
    noAlliesYet: "No ally creators yet",
    chooseEnemyAllies: "Choose allies for counter",
    availableAllies: "Available allies",
    selectedAllies: "Selected allies",
    selectedCount: "{count} selected",
    selectedCountNone: "No allies selected",
    save: "Save",
    cancel: "Cancel",
    marchTimes: "March times",
    coordinatesLabel: "Coordinates",
    coordinatesPlaceholder: "x,y",
    formationsLabel: "Formations",
    formationNone: "-",
    formationCustom: "custom",
    formationCustomPlaceholder: "type custom formation...",
    setGlobalBuffer: "Set global",
    confirmSetGlobalBuffer: "Set all buffers to {value} sec?",
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
    filterByTarget: "Filtrar por objetivo",
    sortTargets: "Ordenar",
    calculateTarget: "Objetivo",
    allTargets: "Todos",
    findLabel: "Buscar",
    findPlaceholder: "Buscar nombre...",
    replaceLabel: "Reemplazar",
    replacePlaceholder: "Reemplazar con...",
    findNext: "Buscar",
    replaceOne: "Reemplazar",
    replaceAll: "Reemplazar todo",
    findReplaceToggle: "Buscar y reemplazar",
    toggleCards: "Mostrar/ocultar tarjetas",
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
    enemyAllies: "Aliados del enemigo",
    noAlliesYet: "Aun no hay aliados",
    chooseEnemyAllies: "Elegir aliados para counter",
    availableAllies: "Aliados disponibles",
    selectedAllies: "Aliados elegidos",
    selectedCount: "{count} elegidos",
    selectedCountNone: "Sin aliados elegidos",
    save: "Guardar",
    cancel: "Cancelar",
    marchTimes: "Tiempos de marcha",
    coordinatesLabel: "Coordenadas",
    coordinatesPlaceholder: "x,y",
    formationsLabel: "Formaciones",
    formationNone: "-",
    formationCustom: "custom",
    formationCustomPlaceholder: "escribe formacion personalizada...",
    setGlobalBuffer: "Global",
    confirmSetGlobalBuffer: "¿Aplicar {value} seg a todos?",
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
    filterByTarget: "목표별 필터",
    sortTargets: "정렬",
    calculateTarget: "목표",
    allTargets: "전체",
    findLabel: "찾기",
    findPlaceholder: "이름 찾기...",
    replaceLabel: "바꾸기",
    replacePlaceholder: "다음으로 변경...",
    findNext: "찾기",
    replaceOne: "바꾸기",
    replaceAll: "모두 바꾸기",
    findReplaceToggle: "찾기/바꾸기",
    toggleCards: "카드 표시/숨기기",
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
    enemyAllies: "적 동맹",
    noAlliesYet: "아군 생성기가 없습니다",
    chooseEnemyAllies: "카운터 아군 선택",
    availableAllies: "사용 가능한 아군",
    selectedAllies: "선택된 아군",
    selectedCount: "{count}명 선택됨",
    selectedCountNone: "선택된 아군 없음",
    save: "저장",
    cancel: "취소",
    marchTimes: "행군 시간",
    coordinatesLabel: "좌표",
    coordinatesPlaceholder: "x,y",
    formationsLabel: "포메이션",
    formationNone: "-",
    formationCustom: "custom",
    formationCustomPlaceholder: "사용자 포메이션 입력...",
    setGlobalBuffer: "전체 적용",
    confirmSetGlobalBuffer: "모든 버퍼를 {value}초로 설정할까요?",
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
    filterByTarget: "依目標篩選",
    sortTargets: "排序",
    calculateTarget: "目標",
    allTargets: "全部",
    findLabel: "尋找",
    findPlaceholder: "尋找名稱...",
    replaceLabel: "取代",
    replacePlaceholder: "取代為...",
    findNext: "尋找",
    replaceOne: "取代",
    replaceAll: "全部取代",
    findReplaceToggle: "尋找與取代",
    toggleCards: "顯示/隱藏卡片",
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
    enemyAllies: "敵方盟友",
    noAlliesYet: "尚無盟軍發起者",
    chooseEnemyAllies: "選擇反制盟軍",
    availableAllies: "可用盟軍",
    selectedAllies: "已選盟軍",
    selectedCount: "已選 {count}",
    selectedCountNone: "尚未選擇盟軍",
    save: "儲存",
    cancel: "取消",
    marchTimes: "行軍時間",
    coordinatesLabel: "座標",
    coordinatesPlaceholder: "x,y",
    formationsLabel: "編隊",
    formationNone: "-",
    formationCustom: "custom",
    formationCustomPlaceholder: "輸入自訂編隊...",
    setGlobalBuffer: "全部套用",
    confirmSetGlobalBuffer: "將所有緩衝設為 {value} 秒？",
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

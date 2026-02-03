import {
  createRallyCreator,
  enableDrag,
  openFirst,
  openOnly,
  updateRallyList,
  setTargetOptions
} from "./ui.js";
import { calculateAgainstEnemy, calculateAll } from "./calc.js";
import {
  TARGETS,
  NO_TARGET,
  getRallyTarget,
  getRallyName,
  getRallyBuffer,
  setRallyBuffer
} from "./helpers.js";
import { loadFromStorage, saveToStorage, importFromJson, exportToJson } from "./storage.js";
import { applyTranslations, getLanguage, initI18n, setLanguage, t, targetLabel } from "./i18n.js";

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    activeType: "ally",
    counters: { ally: 0, enemy: 0 },
    globalBuffer: 0
  };

  const containers = {
    ally: document.getElementById("allyContainer"),
    enemy: document.getElementById("enemyContainer")
  };

  const app = {
    state,
    containers,
    rallyList: document.getElementById("rallyList"),
    resultBox: document.getElementById("resultBox")
  };

  initI18n();
  initLanguageSelect(app);
  applyTranslations();

  initTabs(app);
  initAddButton(app);
  initSearch(app);
  initTargetSort(app);
  initCalculateTargetFilter(app);
  initFindReplace(app);
  initCardsToggle(app);
  initCalculate(app);
  initCopyButton(app);
  initImport(app);
  initExport(app);

  loadFromStorage(app, {
    createRallyCreator,
    updateRallyList,
    calculateAgainstEnemy,
    openOnly,
    enableDrag,
    onSetGlobalBuffer: rally => applyGlobalBuffer(app, rally)
  });

  document.addEventListener("input", () => saveToStorage(app));
  document.addEventListener("click", () => saveToStorage(app));
});

function initTabs(app) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
      app.state.activeType = tab.dataset.type;

      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      app.containers.ally.classList.toggle(
        "hidden",
        app.state.activeType !== "ally"
      );
      app.containers.enemy.classList.toggle(
        "hidden",
        app.state.activeType !== "enemy"
      );

      updateRallyList(app, calculateAgainstEnemy);
    };
  });
}

function initAddButton(app) {
  document.getElementById("addRally").onclick = () => {
    app.state.counters[app.state.activeType]++;
    const rally = createRallyCreator(
      app,
      app.state.activeType,
      app.state.counters[app.state.activeType],
      {
        openOnly,
        enableDrag,
        onUpdateList: () => updateRallyList(app, calculateAgainstEnemy),
        onSetGlobalBuffer: target => applyGlobalBuffer(app, target)
      }
    );
    if (rally) {
      setRallyBuffer(rally, app.state.globalBuffer ?? 0);
    }
    openFirst(app, app.state.activeType);
    updateRallyList(app, calculateAgainstEnemy);
  };
}

function initSearch(app) {
  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", () => {
    const val = searchInput.value.trim().toLowerCase();
    if (!val) return;

    const container = app.containers[app.state.activeType];
    const rallies = [...container.querySelectorAll(".rally")];
    const matches = [];
    const rest = [];

    rallies.forEach(r => {
      const name = r.querySelector(".rally-header input")?.value.toLowerCase() || "";
      if (name.includes(val)) {
        matches.push(r);
      } else {
        rest.push(r);
      }
    });

    if (matches.length) {
      [...matches, ...rest].forEach(r => container.appendChild(r));
      openOnly(app, matches[0], app.state.activeType);
      updateRallyList(app, calculateAgainstEnemy);
    }
  });
}

function initFindReplace(app) {
  const findInput = document.getElementById("findInput");
  const replaceInput = document.getElementById("replaceInput");
  const findBtn = document.getElementById("findNext");
  const replaceBtn = document.getElementById("replaceOne");
  const replaceAllBtn = document.getElementById("replaceAll");
  const panel = document.getElementById("findReplacePanel");
  const toggleBtn = document.getElementById("toggleFindReplace");
  if (!findInput || !replaceInput || !findBtn || !replaceBtn || !replaceAllBtn || !panel || !toggleBtn) return;

  app.findState = { lastIndex: -1, lastMatch: null };
  const setPanelOpen = open => {
    panel.classList.toggle("is-open", open);
    toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      findInput.focus();
      findInput.select();
    }
  };

  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.contains("is-open");
    setPanelOpen(!isOpen);
  });

  const findNext = () => {
    const query = findInput.value.trim();
    if (!query) return;
    const matches = getFindMatches(app, query);
    if (!matches.length) return;

    const startIndex = app.findState.lastIndex ?? -1;
    const next = matches.find(m => m.index > startIndex) || matches[0];
    app.findState.lastIndex = next.index;
    app.findState.lastMatch = next.rally;
    focusMatch(app, next);
  };

  const replaceOne = () => {
    const query = findInput.value.trim();
    if (!query) return;
    let target = app.findState.lastMatch;
    if (!target || !nameContains(target, query)) {
      const matches = getFindMatches(app, query);
      if (!matches.length) return;
      const next = matches.find(m => m.index > (app.findState.lastIndex ?? -1)) || matches[0];
      app.findState.lastIndex = next.index;
      app.findState.lastMatch = next.rally;
      target = next.rally;
      focusMatch(app, next);
    }

    const updated = replaceNameOnce(getRallyName(target), query, replaceInput.value);
    setRallyName(target, updated);
    updateRallyList(app, calculateAgainstEnemy);
    saveToStorage(app);
  };

  const replaceAll = () => {
    const query = findInput.value.trim();
    if (!query) return;
    const replacement = replaceInput.value;
    const regex = new RegExp(escapeRegExp(query), "gi");
    const needle = query.toLowerCase();
    let updatedAny = false;

    getAllRallies(app).forEach(({ rally }) => {
      const name = getRallyName(rally);
      if (!name.toLowerCase().includes(needle)) return;
      updatedAny = true;
      setRallyName(rally, name.replace(regex, replacement));
    });

    if (updatedAny) {
      updateRallyList(app, calculateAgainstEnemy);
      saveToStorage(app);
    }

    app.findState.lastIndex = -1;
    app.findState.lastMatch = null;
  };

  findBtn.addEventListener("click", findNext);
  replaceBtn.addEventListener("click", replaceOne);
  replaceAllBtn.addEventListener("click", replaceAll);

  findInput.addEventListener("input", () => {
    app.findState.lastIndex = -1;
    app.findState.lastMatch = null;
  });

  findInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      findNext();
    }
  });

  replaceInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      replaceOne();
    }
  });
}

function initCardsToggle(app) {
  const btn = document.getElementById("toggleCards");
  const left = document.querySelector(".left");
  if (!btn || !left) return;

  const setCollapsed = collapsed => {
    left.classList.toggle("cards-collapsed", collapsed);
    btn.classList.toggle("is-collapsed", collapsed);
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  };

  setCollapsed(false);

  btn.addEventListener("click", () => {
    const isCollapsed = left.classList.contains("cards-collapsed");
    setCollapsed(!isCollapsed);
  });
}

function initTargetSort(app) {
  const select = document.getElementById("targetSortSelect");
  const button = document.getElementById("sortTargets");
  if (!select || !button) return;

  app.targetSortSelect = select;
  setTargetOptions(select);
  select.value = NO_TARGET;

  button.addEventListener("click", () => {
    const preferred = select.value;
    sortContainerByTarget(app.containers.ally, preferred);
    sortContainerByTarget(app.containers.enemy, preferred);
    updateRallyList(app, calculateAgainstEnemy);
  });
}

function initCalculate(app) {
  document.getElementById("calculate").onclick = () => {
    const filter = app.calculateTargetSelect?.value ?? "ALL";
    calculateAll(app, filter);
  };
}

function initCopyButton(app) {
  const btn = document.getElementById("copyResult");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const text = app.resultBox.textContent.trim();
    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopyText(text);
      }
      btn.textContent = applyCopyLabel(true);
    } catch {
      fallbackCopyText(text);
      btn.textContent = applyCopyLabel(true);
    }

    setTimeout(() => {
      btn.textContent = applyCopyLabel(false);
    }, 1200);
  });
}

function initImport(app) {
  const fileInput = document.getElementById("importFile");
  const btn = document.getElementById("importData");
  if (!fileInput || !btn) return;

  btn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      importFromJson(app, text, {
        createRallyCreator,
        updateRallyList,
        calculateAgainstEnemy,
        openOnly,
        enableDrag,
        onSetGlobalBuffer: rally => applyGlobalBuffer(app, rally)
      });
      fileInput.value = "";
    } catch {
      // ignore malformed files
    }
  });
}

function initExport(app) {
  const btn = document.getElementById("exportData");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const payload = exportToJson();
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rallies.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

function fallbackCopyText(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  area.style.left = "-1000px";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  try {
    document.execCommand("copy");
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    const resultBox = document.getElementById("resultBox");
    if (resultBox) {
      range.selectNodeContents(resultBox);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } finally {
    area.remove();
  }
}

function applyGlobalBuffer(app, rally) {
  const value = getRallyBuffer(rally);
  const message = formatConfirmMessage(value);
  if (!window.confirm(message)) return;

  app.state.globalBuffer = value;
  document.querySelectorAll(".rally").forEach(item => {
    setRallyBuffer(item, value);
  });
  saveToStorage(app);
}

function initLanguageSelect(app) {
  const select = document.getElementById("langSelect");
  if (!select) return;

  select.value = getLanguage();
  select.addEventListener("change", () => {
    setLanguage(select.value);
    applyTranslations();
    refreshTargetSortOptions(app);
    refreshCalculateTargetOptions(app);
    updateRallyList(app, calculateAgainstEnemy);
  });
}

function applyCopyLabel(isCopied) {
  const key = isCopied ? "copied" : "copy";
  return t(key);
}

function formatConfirmMessage(value) {
  const template = t("confirmSetGlobalBuffer");
  return template.includes("{value}")
    ? template.replace("{value}", value)
    : template;
}

function getAllRallies(app) {
  const list = [];
  ["ally", "enemy"].forEach(type => {
    app.containers[type].querySelectorAll(".rally").forEach(rally => {
      list.push({ rally, type });
    });
  });
  return list;
}

function getFindMatches(app, query) {
  const q = query.toLowerCase();
  return getAllRallies(app)
    .map((item, index) => ({
      ...item,
      index,
      name: getRallyName(item.rally).toLowerCase()
    }))
    .filter(item => item.name.includes(q));
}

function nameContains(rally, query) {
  return getRallyName(rally).toLowerCase().includes(query.toLowerCase());
}

function replaceNameOnce(name, query, replacement) {
  const lower = name.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return name;
  return name.slice(0, idx) + replacement + name.slice(idx + query.length);
}

function setRallyName(rally, value) {
  const input = rally.querySelector(".rally-header input");
  if (!input) return;
  input.value = value;
}

function focusMatch(app, match) {
  setActiveType(app, match.type);
  openOnly(app, match.rally, match.type);
  match.rally.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setActiveType(app, type) {
  if (app.state.activeType === type) return;
  const tab = document.querySelector(`.tab[data-type="${type}"]`);
  if (tab) tab.click();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function refreshTargetSortOptions(app) {
  const select = app.targetSortSelect;
  if (!select) return;
  const current = select.value;
  setTargetOptions(select);
  if ([...TARGETS, NO_TARGET].includes(current)) {
    select.value = current;
  }
}

function initCalculateTargetFilter(app) {
  const select = document.getElementById("calculateTargetSelect");
  if (!select) return;
  app.calculateTargetSelect = select;
  setCalculateTargetOptions(select);
  select.value = "ALL";
}

function refreshCalculateTargetOptions(app) {
  const select = app.calculateTargetSelect;
  if (!select) return;
  const current = select.value;
  setCalculateTargetOptions(select);
  const valid = ["ALL", ...TARGETS];
  if (valid.includes(current)) {
    select.value = current;
  }
}

function setCalculateTargetOptions(select) {
  select.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "ALL";
  allOpt.textContent = t("allTargets");
  select.appendChild(allOpt);

  TARGETS.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = targetLabel(name);
    select.appendChild(opt);
  });
}

function getTargetSortOrder(preferred) {
  const base = [...TARGETS, NO_TARGET];
  if (!preferred || !base.includes(preferred)) return base;
  return [preferred, ...base.filter(target => target !== preferred)];
}

function sortContainerByTarget(container, preferredTarget) {
  const order = getTargetSortOrder(preferredTarget);
  const orderIndex = new Map(order.map((target, index) => [target, index]));
  const rallies = [...container.querySelectorAll(".rally")];
  const sorted = rallies
    .map((rally, index) => ({
      rally,
      index,
      target: getRallyTarget(rally)
    }))
    .sort((a, b) => {
      const aRank = orderIndex.get(a.target) ?? order.length;
      const bRank = orderIndex.get(b.target) ?? order.length;
      if (aRank !== bRank) return aRank - bRank;
      return a.index - b.index;
    });

  sorted.forEach(({ rally }) => container.appendChild(rally));
}

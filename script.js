import {
  createRallyCreator,
  enableDrag,
  openFirst,
  openOnly,
  updateRallyList
} from "./ui.js";
import { calculateAgainstEnemy, calculateAll } from "./calc.js";
import { loadFromStorage, saveToStorage, importFromJson, exportToJson } from "./storage.js";
import { applyTranslations, getLanguage, initI18n, setLanguage, t } from "./i18n.js";

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    activeType: "ally",
    counters: { ally: 0, enemy: 0 }
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
  initCalculate(app);
  initCopyButton(app);
  initImport(app);
  initExport(app);

  loadFromStorage(app, {
    createRallyCreator,
    updateRallyList,
    calculateAgainstEnemy,
    openOnly,
    enableDrag
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
    createRallyCreator(
      app,
      app.state.activeType,
      app.state.counters[app.state.activeType],
      {
        openOnly,
        enableDrag,
        onUpdateList: () => updateRallyList(app, calculateAgainstEnemy)
      }
    );
    openFirst(app, app.state.activeType);
    updateRallyList(app, calculateAgainstEnemy);
  };
}

function initSearch(app) {
  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", () => {
    const val = searchInput.value.toLowerCase();
    if (!val) return;

    const rally = [...app.containers[app.state.activeType].querySelectorAll(".rally")]
      .find(r => r.querySelector(".rally-header input").value.toLowerCase().includes(val));

    if (rally) {
      app.containers[app.state.activeType].prepend(rally);
      openOnly(app, rally, app.state.activeType);
      updateRallyList(app, calculateAgainstEnemy);
    }
  });
}

function initCalculate(app) {
  document.getElementById("calculate").onclick = () => {
    calculateAll(app);
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
        enableDrag
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

function initLanguageSelect(app) {
  const select = document.getElementById("langSelect");
  if (!select) return;

  select.value = getLanguage();
  select.addEventListener("change", () => {
    setLanguage(select.value);
    applyTranslations();
    updateRallyList(app, calculateAgainstEnemy);
  });
}

function applyCopyLabel(isCopied) {
  const key = isCopied ? "copied" : "copy";
  return t(key);
}

import {
  TARGETS,
  NO_TARGET,
  getRallyName,
  getRallyTarget,
  isRallyEnabled,
  setRallyEnabled,
  setRallyTarget,
  getEnemyAllies,
  setEnemyAllies,
  getRallyCoordinates,
  calculateCoordinateMarchTime
} from "./helpers.js";
import { t, targetLabel } from "./i18n.js";

const enemyAlliesModalState = {
  root: null,
  app: null,
  activeRally: null
};

const marchTimesModalState = {
  root: null,
  body: null,
  title: null,
  activeRally: null,
  originalGrid: null,
  modalGrid: null
};

export function createRallyCreator(app, type, number, hooks) {
  const rally = document.createElement("div");
  rally.className = "rally";
  rally.draggable = !("ontouchstart" in window);
  rally.dataset.type = type;
  rally.dataset.enabled = "true";
  rally.dataset.target = NO_TARGET;

  const defaultName = `${t(type === "ally" ? "tabAlly" : "tabEnemy")} ${t("rallyWord")} ${number}`;
  const isEnemy = type === "enemy";

  rally.innerHTML = `
    <div class="rally-row">
      <div class="col col-enable">
        <label class="enable-wrap">
          <input type="checkbox" class="enable-toggle" checked>
          <span class="enable-dot"></span>
        </label>
      </div>
      <div class="col col-name">
        <input type="text" class="rally-name" value="${defaultName}">
        <input type="text" class="coordinates" placeholder="x,y" data-i18n-placeholder="coordinatesPlaceholder">
      </div>
      <div class="col col-formation">
        <select class="formation-select" aria-label="Formation">
          <option value="" data-i18n="formationNone">-</option>
          <option value="60/40">60/40</option>
          <option value="50/20/30">50/20/30</option>
          <option value="60/0/40">60/0/40</option>
          <option value="60/10/30">60/10/30</option>
          <option value="custom" data-i18n="formationCustom">custom</option>
        </select>
        <input type="text" class="formation-custom hidden" placeholder="formation..." data-i18n-placeholder="formationCustomPlaceholder">
        ${isEnemy ? `
        <button type="button" class="choose-enemy-allies" data-i18n="chooseEnemyAllies">Choose allies for counter</button>
        <div class="enemy-allies-summary"></div>
        ` : ""}
      </div>
      <div class="t-grid">
        ${TARGETS.map(name => createTBox(name, !isEnemy)).join("")}
      </div>
      <div class="col col-buffer">
        ${isEnemy ? `
        <span class="enemy-fixed-buffer"><span data-i18n="bufferLabel">Buffer (sec)</span>: 0</span>
        ` : `
        <label class="buffer-label">
          <input type="number" class="buffer" min="0" value="0">
          <span data-i18n="bufferLabel">Buffer (sec)</span>
        </label>
        <label class="pet-toggle"><input type="checkbox" class="pets-toggle"><span>Pets</span><small class="pets-status">Off</small></label>
        <details class="pets-settings"><summary>Settings</summary><label>Hours<input class="pets-duration" type="number" min="0.01" step="0.01" value="2"></label><label>Bonus %<input class="pets-bonus" type="number" min="0" step="1" value="30"></label><label>Remaining<input class="pets-countdown" value="02:00:00" inputmode="numeric"></label></details>
        <label class="counter-toggle">
          <input type="checkbox" class="counter-master" checked>
          <span data-i18n="counterRally">Counter rally</span>
        </label>
        `}
      </div>
      <div class="col col-actions">
        <button class="delete" type="button" aria-label="Delete">x</button>
      </div>
    </div>
  `;

  app.containers[type].prepend(rally);

  rally.querySelector(".delete").addEventListener("click", e => {
    e.stopPropagation();
    rally.remove();
    hooks.onUpdateList();
  });

  const nameInput = rally.querySelector(".rally-name");
  const enableToggle = rally.querySelector(".enable-toggle");

  if (nameInput) {
    nameInput.addEventListener("input", hooks.onUpdateList);
  }

  if (enableToggle) {
    enableToggle.addEventListener("change", () => {
      setRallyEnabled(rally, enableToggle.checked);
      hooks.onUpdateList();
    });
  }

  hooks.enableDrag(app, rally, app.containers[type], hooks.onUpdateList);

  setupCounterControls(rally);
  initFormationControls(rally);
  if (!isEnemy) initPetsControls(rally);
  if (isEnemy) {
    initEnemyAlliesControls(app, rally);
  }

  return rally;
}

export function refreshCoordinateMarchTimes(rally, force = false) {
  if (!rally || rally.dataset.type === "enemy") return;
  const pets = getPetsState(rally);
  TARGETS.forEach(target => {
    const input = rally.querySelector(`.t-box[data-name="${target}"] .sec`);
    if (!input || (input.dataset.manual === "true" && !force)) return;
    const seconds = calculateCoordinateMarchTime(getRallyCoordinates(rally), target, pets.active ? pets.bonus : 0);
    if (seconds === null) return;
    input.value = seconds;
    input.dataset.manual = "false";
  });
}

export function refreshPets(rally) {
  if (!rally || rally.dataset.type === "enemy") return;
  const wasActive = rally.dataset.petsActive === "true";
  const state = getPetsState(rally);
  const toggle = rally.querySelector(".pets-toggle");
  const status = rally.querySelector(".pets-status");
  const countdown = rally.querySelector(".pets-countdown");
  if (toggle) toggle.checked = state.active;
  if (status) status.textContent = state.active ? formatCountdown(state.until - Date.now()) : "Off";
  if (countdown && document.activeElement !== countdown) countdown.value = state.active ? formatCountdown(state.until - Date.now()) : "00:00:00";
  rally.dataset.petsActive = state.active ? "true" : "false";
  if (wasActive !== state.active) refreshCoordinateMarchTimes(rally, true);
}

function initPetsControls(rally) {
  const toggle = rally.querySelector(".pets-toggle");
  const duration = rally.querySelector(".pets-duration");
  const bonus = rally.querySelector(".pets-bonus");
  const countdown = rally.querySelector(".pets-countdown");
  if (!toggle || !duration || !bonus || !countdown) return;
  toggle.addEventListener("change", () => {
    rally.dataset.petsUntil = toggle.checked ? String(Date.now() + Number(duration.value || 0) * 3600000) : "";
    refreshPets(rally); refreshCoordinateMarchTimes(rally, true);
    rally.dispatchEvent(new Event("input", { bubbles: true }));
  });
  bonus.addEventListener("input", () => refreshCoordinateMarchTimes(rally, true));
  countdown.addEventListener("change", () => {
    const seconds = parseCountdown(countdown.value);
    if (seconds === null) { refreshPets(rally); return; }
    rally.dataset.petsUntil = seconds ? String(Date.now() + seconds * 1000) : "";
    refreshPets(rally); refreshCoordinateMarchTimes(rally, true);
    rally.dispatchEvent(new Event("input", { bubbles: true }));
  });
  rally.querySelector(".coordinates")?.addEventListener("input", () => refreshCoordinateMarchTimes(rally, true));
  rally.querySelectorAll(".t-box .sec").forEach(input => input.addEventListener("input", () => { input.dataset.manual = "true"; }));
  refreshPets(rally);
}

function getPetsState(rally) {
  const until = Number(rally.dataset.petsUntil) || 0;
  return { until, active: until > Date.now(), bonus: Number(rally.querySelector(".pets-bonus")?.value || 0) };
}

function parseCountdown(value) {
  const match = /^(\d{1,3}):([0-5]\d):([0-5]\d)$/.exec(String(value).trim());
  return match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) : null;
}

function formatCountdown(milliseconds) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  return [Math.floor(total / 3600), Math.floor(total % 3600 / 60), total % 60].map(value => String(value).padStart(2, "0")).join(":");
}

export function createTBox(name, showCounterCheck = true) {
  const counterHtml = showCounterCheck
    ? `
      <label class="counter-check-row">
        <input type="checkbox" class="counter-check" checked aria-label="Counter target">
      </label>
    `
    : "";
  return `
    <div class="t-box" data-name="${name}">
      <input type="number" class="sec" min="0" value="0" placeholder="sec" data-i18n-placeholder="secLabel" aria-label="seconds">
      ${counterHtml}
    </div>
  `;
}

function initFormationControls(rally) {
  const select = rally.querySelector(".formation-select");
  const custom = rally.querySelector(".formation-custom");
  if (!select || !custom) return;

  const sync = () => {
    custom.classList.toggle("hidden", select.value !== "custom");
  };

  select.addEventListener("change", sync);
  sync();
}

function initMarchTimesControls(rally) {
  const btn = rally.querySelector(".open-march-times");
  if (!btn) return;
  btn.addEventListener("click", e => {
    e.stopPropagation();
    openMarchTimesModal(rally);
  });
}

export function openOnly(app, target, type) {
  app.containers[type].querySelectorAll(".rally").forEach(r => r.classList.remove("open"));
  target.classList.add("open");
}

export function openFirst(app, type) {
  const first = app.containers[type].querySelector(".rally");
  if (first) openOnly(app, first, type);
}

export function enableDrag(app, rally, container, onUpdateList) {
  rally.addEventListener("dragstart", () => rally.classList.add("dragging"));
  rally.addEventListener("dragend", () => {
    rally.classList.remove("dragging");
    onUpdateList();
  });

  container.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = container.querySelector(".dragging");
    if (!dragging) return;

    const after = [...container.querySelectorAll(".rally:not(.dragging)")]
      .find(r => e.clientY < r.offsetTop + r.offsetHeight / 2);

    container.insertBefore(dragging, after);
  });
}

export function updateRallyList(app, calculateAgainstEnemy) {
  syncEnemyAllySelections(app);
  syncMarchTimesModal();
  app.rallyList.innerHTML = "";

  addSection(app, t("alliesSection"), "ally");
  app.containers.ally.querySelectorAll(".rally").forEach(r => addRow(app, r, calculateAgainstEnemy));

  addSection(app, t("enemiesSection"), "enemy");
  app.containers.enemy.querySelectorAll(".rally").forEach(r => addRow(app, r, calculateAgainstEnemy));
}

function addSection(app, title, type) {
  const header = document.createElement("div");
  header.className = "list-section";
  if (type) header.classList.add(`list-section--${type}`);
  header.textContent = title;
  app.rallyList.appendChild(header);
}

function addRow(app, rally, calculateAgainstEnemy) {
  const row = document.createElement("div");
  row.className = "target-row";
  if (!isRallyEnabled(rally)) row.classList.add("is-disabled");

  const nameWrap = document.createElement("div");
  nameWrap.className = "target-name";

  const toggleBtn = createToggleButton(rally, row);
  const nameSpan = document.createElement("span");
  nameSpan.textContent = getRallyName(rally);

  nameWrap.append(toggleBtn, nameSpan);

  const select = document.createElement("select");
  setTargetOptions(select);
  select.value = getRallyTarget(rally);
  select.addEventListener("change", () => setRallyTarget(rally, select.value));

  row.append(nameWrap, select);

  if (rally.dataset.type === "enemy") {
    const btn = document.createElement("button");
    btn.textContent = t("allyTimings");
    btn.onclick = () => calculateAgainstEnemy(app, rally, row);
    row.appendChild(btn);
  }

  app.rallyList.appendChild(row);
}

export function setTargetOptions(select) {
  select.innerHTML = "";

  const base = document.createElement("option");
  base.textContent = t("noTarget");
  base.value = NO_TARGET;
  select.appendChild(base);

  TARGETS.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = targetLabel(name);
    select.appendChild(opt);
  });
}

function createToggleButton(rally, row) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "visibility-toggle";
  btn.innerHTML = getVisibilityIcons();
  updateToggleButton(btn, isRallyEnabled(rally));

  btn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isRallyEnabled(rally);
    setRallyEnabled(rally, next);
    updateToggleButton(btn, next);
    row.classList.toggle("is-disabled", !next);
  });

  return btn;
}

function updateToggleButton(btn, enabled) {
  btn.classList.toggle("is-off", !enabled);
  btn.setAttribute(
    "aria-label",
    enabled ? "Include in calculate" : "Exclude from calculate"
  );
  btn.title = enabled ? "Included in calculate" : "Excluded from calculate";
}

function getVisibilityIcons() {
  return `
    <svg class="icon-on" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <svg class="icon-off" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 4.5c2.7-2 5.6-3 9-3 6.5 0 10.5 7.5 10.5 7.5-.8 1.5-2 3.3-3.7 4.8" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <path d="M6.3 7.5C4.5 9 3.4 10.7 3 12c0 0 4 7.5 9 7.5 2.2 0 4.2-.6 6-1.6" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <path d="M3 3l18 18" fill="none" stroke="currentColor" stroke-width="1.5"/>
    </svg>
  `;
}

function getTargetKey(name) {
  const map = {
    "Turret 1": "target.turret1",
    "Turret 2": "target.turret2",
    "Turret 3": "target.turret3",
    "Turret 4": "target.turret4",
    "Castle": "target.castle"
  };
  return map[name] || "";
}

function setupCounterControls(rally) {
  const master = rally.querySelector(".counter-master");
  const checks = [...rally.querySelectorAll(".counter-check")];
  if (!master) return;

  master.addEventListener("change", () => {
    const value = master.checked;
    checks.forEach(input => {
      input.checked = value;
    });
  });
}

function syncMarchTimesModal() {
  const active = marchTimesModalState.activeRally;
  if (!active) return;
  if (!document.body.contains(active)) {
    closeMarchTimesModal();
    return;
  }
  if (marchTimesModalState.title) {
    marchTimesModalState.title.textContent = `${t("marchTimes")} - ${getRallyName(active)}`;
  }
}

function ensureMarchTimesModal() {
  if (marchTimesModalState.root) return;
  const root = document.createElement("div");
  root.className = "march-times-modal hidden";
  root.innerHTML = `
    <div class="march-times-backdrop"></div>
    <div class="march-times-sheet" role="dialog" aria-modal="true">
      <div class="march-times-header">
        <h3 class="march-times-title"></h3>
        <button type="button" class="march-times-close">x</button>
      </div>
      <div class="march-times-body"></div>
    </div>
  `;
  root.querySelector(".march-times-backdrop")
    .addEventListener("click", closeMarchTimesModal);
  root.querySelector(".march-times-close")
    .addEventListener("click", closeMarchTimesModal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && marchTimesModalState.activeRally) {
      closeMarchTimesModal();
    }
  });

  document.body.appendChild(root);
  marchTimesModalState.root = root;
  marchTimesModalState.body = root.querySelector(".march-times-body");
  marchTimesModalState.title = root.querySelector(".march-times-title");
}

function openMarchTimesModal(rally) {
  ensureMarchTimesModal();
  closeMarchTimesModal();

  const sourceHost = rally.querySelector(".march-times-source");
  const originalGrid = sourceHost?.querySelector(".t-grid");
  if (!originalGrid || !marchTimesModalState.body) return;
  const modalGrid = originalGrid.cloneNode(true);

  marchTimesModalState.activeRally = rally;
  marchTimesModalState.originalGrid = originalGrid;
  marchTimesModalState.modalGrid = modalGrid;
  marchTimesModalState.title.textContent = `${t("marchTimes")} - ${getRallyName(rally)}`;
  marchTimesModalState.body.appendChild(modalGrid);
  marchTimesModalState.root.classList.remove("hidden");
}

function closeMarchTimesModal() {
  const state = marchTimesModalState;
  if (state.modalGrid && state.originalGrid) {
    copyGridValues(state.modalGrid, state.originalGrid);
    state.originalGrid.dispatchEvent(new Event("input", { bubbles: true }));
    state.modalGrid.remove();
  }
  if (state.root) {
    state.root.classList.add("hidden");
  }
  state.activeRally = null;
  state.originalGrid = null;
  state.modalGrid = null;
}

function copyGridValues(fromGrid, toGrid) {
  TARGETS.forEach(target => {
    const fromBox = fromGrid.querySelector(`.t-box[data-name="${target}"]`);
    const toBox = toGrid.querySelector(`.t-box[data-name="${target}"]`);
    if (!fromBox || !toBox) return;

    const fromSec = fromBox.querySelector(".sec");
    const toSec = toBox.querySelector(".sec");
    if (fromSec && toSec) toSec.value = fromSec.value;

    const fromCheck = fromBox.querySelector(".counter-check");
    const toCheck = toBox.querySelector(".counter-check");
    if (fromCheck && toCheck) toCheck.checked = fromCheck.checked;
  });
}

function getAllyCreatorNames(app) {
  const names = [...app.containers.ally.querySelectorAll(".rally")]
    .map(rally => getRallyName(rally).trim())
    .filter(Boolean);
  return [...new Set(names)];
}

function syncEnemyAllySelections(app) {
  const allyNames = getAllyCreatorNames(app);
  app.containers.enemy.querySelectorAll(".rally").forEach(rally => {
    const selected = getEnemyAllies(rally).filter(name => allyNames.includes(name));
    setEnemyAllies(rally, selected);
    updateEnemyAlliesSummary(rally, allyNames);
  });

  const active = enemyAlliesModalState.activeRally;
  if (active && !document.body.contains(active)) {
    closeEnemyAlliesModal();
    return;
  }
  if (active) {
    renderEnemyAlliesModal(active, allyNames);
  }
}

function initEnemyAlliesControls(app, enemyRally) {
  const btn = enemyRally.querySelector(".choose-enemy-allies");
  if (!btn) return;
  btn.addEventListener("click", e => {
    e.stopPropagation();
    openEnemyAlliesModal(app, enemyRally);
  });
  updateEnemyAlliesSummary(enemyRally, getAllyCreatorNames(app));
}

function updateEnemyAlliesSummary(enemyRally, allyNames) {
  const summary = enemyRally.querySelector(".enemy-allies-summary");
  if (!summary) return;
  const selected = getEnemyAllies(enemyRally).filter(name => allyNames.includes(name));
  if (!allyNames.length) {
    summary.textContent = t("noAlliesYet");
    return;
  }
  if (!selected.length) {
    summary.textContent = t("selectedCountNone");
    return;
  }
  const template = t("selectedCount");
  summary.textContent = template.includes("{count}")
    ? template.replace("{count}", String(selected.length))
    : `${selected.length} selected`;
}

function openEnemyAlliesModal(app, enemyRally) {
  const allyNames = getAllyCreatorNames(app);
  ensureEnemyAlliesModal(app);
  enemyAlliesModalState.activeRally = enemyRally;
  enemyAlliesModalState.app = app;
  renderEnemyAlliesModal(enemyRally, allyNames);
  enemyAlliesModalState.root.classList.remove("hidden");
}

function closeEnemyAlliesModal() {
  if (!enemyAlliesModalState.root) return;
  enemyAlliesModalState.root.classList.add("hidden");
  enemyAlliesModalState.activeRally = null;
}

function ensureEnemyAlliesModal(app) {
  if (enemyAlliesModalState.root) return;
  const root = document.createElement("div");
  root.className = "enemy-allies-modal hidden";
  root.innerHTML = `
    <div class="enemy-allies-backdrop"></div>
    <div class="enemy-allies-dialog" role="dialog" aria-modal="true">
      <div class="enemy-allies-dialog-header">
        <h3 class="enemy-allies-title"></h3>
      </div>
      <div class="enemy-allies-dual-list">
        <div class="enemy-allies-list-block">
          <div class="enemy-allies-list-title"></div>
          <select class="enemy-allies-available" multiple size="12"></select>
        </div>
        <div class="enemy-allies-actions">
          <button type="button" class="enemy-allies-add">&gt;</button>
          <button type="button" class="enemy-allies-add-all">&gt;&gt;</button>
          <button type="button" class="enemy-allies-remove">&lt;</button>
          <button type="button" class="enemy-allies-remove-all">&lt;&lt;</button>
        </div>
        <div class="enemy-allies-list-block">
          <div class="enemy-allies-list-title"></div>
          <select class="enemy-allies-selected" multiple size="12"></select>
        </div>
      </div>
      <div class="enemy-allies-dialog-footer">
        <button type="button" class="enemy-allies-cancel"></button>
        <button type="button" class="enemy-allies-save"></button>
      </div>
    </div>
  `;

  const available = root.querySelector(".enemy-allies-available");
  const selected = root.querySelector(".enemy-allies-selected");

  root.querySelector(".enemy-allies-backdrop")
    .addEventListener("click", closeEnemyAlliesModal);
  root.querySelector(".enemy-allies-cancel")
    .addEventListener("click", closeEnemyAlliesModal);
  root.querySelector(".enemy-allies-save")
    .addEventListener("click", () => {
      const activeRally = enemyAlliesModalState.activeRally;
      if (activeRally) {
        setEnemyAllies(activeRally, getOptionValues(selected));
        updateEnemyAlliesSummary(activeRally, getAllyCreatorNames(app));
      }
      closeEnemyAlliesModal();
    });

  root.querySelector(".enemy-allies-add")
    .addEventListener("click", () => moveSelectedOptions(available, selected));
  root.querySelector(".enemy-allies-add-all")
    .addEventListener("click", () => moveAllOptions(available, selected));
  root.querySelector(".enemy-allies-remove")
    .addEventListener("click", () => moveSelectedOptions(selected, available));
  root.querySelector(".enemy-allies-remove-all")
    .addEventListener("click", () => moveAllOptions(selected, available));

  available.addEventListener("dblclick", () => moveSelectedOptions(available, selected));
  selected.addEventListener("dblclick", () => moveSelectedOptions(selected, available));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && enemyAlliesModalState.activeRally) {
      closeEnemyAlliesModal();
    }
  });

  document.body.appendChild(root);
  enemyAlliesModalState.root = root;
}

function renderEnemyAlliesModal(enemyRally, allyNames) {
  const root = enemyAlliesModalState.root;
  if (!root) return;

  root.querySelector(".enemy-allies-title").textContent = t("chooseEnemyAllies");
  const listTitles = root.querySelectorAll(".enemy-allies-list-title");
  listTitles[0].textContent = t("availableAllies");
  listTitles[1].textContent = t("selectedAllies");
  root.querySelector(".enemy-allies-cancel").textContent = t("cancel");
  root.querySelector(".enemy-allies-save").textContent = t("save");

  const selectedSet = new Set(getEnemyAllies(enemyRally).filter(name => allyNames.includes(name)));
  const available = root.querySelector(".enemy-allies-available");
  const selected = root.querySelector(".enemy-allies-selected");
  available.innerHTML = "";
  selected.innerHTML = "";

  allyNames.forEach(name => {
    const opt = new Option(name, name);
    if (selectedSet.has(name)) {
      selected.add(opt);
    } else {
      available.add(opt);
    }
  });
}

function moveSelectedOptions(source, target) {
  [...source.selectedOptions].forEach(option => {
    target.add(new Option(option.text, option.value));
    option.remove();
  });
  sortOptions(source);
  sortOptions(target);
}

function moveAllOptions(source, target) {
  [...source.options].forEach(option => {
    target.add(new Option(option.text, option.value));
    option.remove();
  });
  sortOptions(target);
}

function sortOptions(select) {
  const items = [...select.options].map(opt => ({ text: opt.text, value: opt.value }));
  items.sort((a, b) => a.text.localeCompare(b.text));
  select.innerHTML = "";
  items.forEach(item => select.add(new Option(item.text, item.value)));
}

function getOptionValues(select) {
  return [...select.options].map(option => option.value).filter(Boolean);
}

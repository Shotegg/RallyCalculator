import {
  TARGETS,
  NO_TARGET,
  getRallyName,
  getRallyTarget,
  isRallyEnabled,
  setRallyEnabled,
  setRallyTarget
} from "./helpers.js";
import { t, targetLabel } from "./i18n.js";

export function createRallyCreator(app, type, number, hooks) {
  const rally = document.createElement("div");
  rally.className = "rally";
  rally.draggable = !("ontouchstart" in window);
  rally.dataset.type = type;
  rally.dataset.enabled = "true";
  rally.dataset.target = NO_TARGET;

  const defaultName = `${t(type === "ally" ? "tabAlly" : "tabEnemy")} ${t("rallyWord")} ${number}`;

  rally.innerHTML = `
    <div class="rally-header">
      <div class="header-left">
        <span class="drag-handle">::</span>
        <input type="text" value="${defaultName}">
      </div>
      <div class="header-right">
        <button class="delete">x</button>
      </div>
    </div>

    <div class="rally-content">
      <div class="buffer-row">
        <label class="buffer-label">
          <span data-i18n="bufferLabel">Buffer (sec)</span>
          <input type="number" class="buffer" min="0" value="0">
        </label>
        <label class="counter-toggle">
          <input type="checkbox" class="counter-master" checked>
          <span data-i18n="counterRally">Counter rally</span>
        </label>
      </div>
      <div class="t-grid">
        ${TARGETS.map(createTBox).join("")}
      </div>
    </div>
  `;

  app.containers[type].prepend(rally);

  rally.querySelector(".delete").addEventListener("click", e => {
    e.stopPropagation();
    rally.remove();
    hooks.onUpdateList();
  });

  const headerLeft = rally.querySelector(".header-left");
  const headerRight = rally.querySelector(".header-right");
  const nameInput = rally.querySelector(".rally-header input");

  headerLeft.addEventListener("click", e => {
    e.stopPropagation();
    hooks.openOnly(app, rally, type);
    nameInput.focus();
    nameInput.select();
  });

  headerRight.addEventListener("click", e => {
    e.stopPropagation();
    hooks.openOnly(app, rally, type);
  });

  nameInput.addEventListener("input", hooks.onUpdateList);

  hooks.enableDrag(app, rally, app.containers[type], hooks.onUpdateList);

  setupCounterControls(rally);
}

export function createTBox(name) {
  const label = targetLabel(name);
  return `
    <div class="t-box" data-name="${name}">
      <strong data-i18n="${getTargetKey(name)}">${label}</strong>
      <div class="time-field">
        <span class="time-label" data-i18n="minLabel">min</span>
        <input type="number" class="min" min="0" value="0" placeholder="min" data-i18n-placeholder="minLabel" aria-label="minutes">
      </div>
      <div class="time-field">
        <span class="time-label" data-i18n="secLabel">sec</span>
        <input type="number" class="sec" min="0" value="0" placeholder="sec" data-i18n-placeholder="secLabel" aria-label="seconds">
      </div>
      <label class="counter-check-row">
        <input type="checkbox" class="counter-check" checked aria-label="Counter target">
      </label>
    </div>
  `;
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
  app.rallyList.innerHTML = "";

  addSection(app, t("alliesSection"));
  app.containers.ally.querySelectorAll(".rally").forEach(r => addRow(app, r, calculateAgainstEnemy));

  addSection(app, t("enemiesSection"));
  app.containers.enemy.querySelectorAll(".rally").forEach(r => addRow(app, r, calculateAgainstEnemy));
}

function addSection(app, title) {
  const header = document.createElement("div");
  header.className = "list-section";
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

function setTargetOptions(select) {
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

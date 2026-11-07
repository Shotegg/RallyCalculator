import {
  NO_TARGET,
  getRallyName,
  getRallyTarget,
  isRallyEnabled,
  getRallyBuffer,
  isTargetCounterEnabled,
  setRallyEnabled,
  setRallyBuffer,
  setRallyTarget,
  setTargetCounterEnabled,
  getEnemyAllies,
  setEnemyAllies,
  TARGETS,
  getRallyCoordinates,
  setRallyCoordinates,
  getRallyFormationSelection,
  setRallyFormationSelection,
  getRallyFormationCustom,
  setRallyFormationCustom
} from "./helpers.js";

export function saveToStorage(app) {
  const data = [];

  document.querySelectorAll(".rally").forEach(rally => {
    const isEnemy = rally.dataset.type === "enemy";
    const obj = {
      type: rally.dataset.type,
      name: getRallyName(rally),
      enabled: isRallyEnabled(rally),
      target: getRallyTarget(rally),
      buffer: isEnemy ? 0 : getRallyBuffer(rally),
      coordinates: getRallyCoordinates(rally),
      formation: getRallyFormationSelection(rally),
      formationCustom: getRallyFormationCustom(rally),
      petsUntil: rally.dataset.petsUntil || "",
      petsDuration: rally.querySelector(".pets-duration")?.value || "2",
      petsBonus: rally.querySelector(".pets-bonus")?.value || "30"
    };
    if (isEnemy) {
      obj.enemyAllies = getEnemyAllies(rally);
    }
    obj.counterTargets = isEnemy ? createFalseCounterTargets() : getCounterTargets(rally);
    obj.boxes = {};

    rally.querySelectorAll(".t-box").forEach(box => {
      obj.boxes[box.dataset.name] = {
        sec: box.querySelector(".sec").value
      };
    });

    data.push(obj);
  });

  localStorage.setItem("rallies", JSON.stringify(data));
}

export function loadFromStorage(app, hooks) {
  const data = JSON.parse(localStorage.getItem("rallies") || "[]");
  data.forEach(r => {
    app.state.counters[r.type]++;
    hooks.createRallyCreator(app, r.type, app.state.counters[r.type], {
      openOnly: hooks.openOnly,
      enableDrag: hooks.enableDrag,
      onUpdateList: () => hooks.updateRallyList(app, hooks.calculateAgainstEnemy)
    });

    const rally = app.containers[r.type].querySelector(".rally");

    rally.querySelector(".rally-name").value = r.name;
    setRallyEnabled(rally, r.enabled !== false);
    setRallyTarget(rally, r.target || NO_TARGET);
    setRallyBuffer(rally, r.type === "enemy" ? 0 : (r.buffer ?? 0));
    setRallyCoordinates(rally, r.coordinates || "");
    applyPets(rally, r);
    applyFormationFields(rally, r);
    applyCounterTargets(rally, r.type === "enemy" ? createFalseCounterTargets() : (r.counterTargets || {}));
    if (r.type === "enemy") {
      setEnemyAllies(rally, r.enemyAllies || []);
    }

    Object.entries(r.boxes || {}).forEach(([key, val]) => {
      const box = rally.querySelector(`.t-box[data-name="${key}"]`);
      if (!box) return;
      const sec = Number(val?.sec ?? 0);
      const min = Number(val?.min ?? 0);
      const total = Number.isFinite(sec) ? sec + (Number.isFinite(min) ? min * 60 : 0) : 0;
      box.querySelector(".sec").value = total;
    });
  });

  hooks.updateRallyList(app, hooks.calculateAgainstEnemy);
}

export function exportToJson() {
  const data = JSON.parse(localStorage.getItem("rallies") || "[]");
  const sanitized = data.map(item => {
    if (!item || typeof item !== "object") return item;
    const next = { ...item };
    next.name = sanitizeName(next.name || "");
    if (Array.isArray(next.enemyAllies)) {
      next.enemyAllies = next.enemyAllies.map(name => sanitizeName(name));
    }
    return next;
  });
  return JSON.stringify(sanitized, null, 2);
}

export function importFromJson(app, jsonText, hooks) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return;
  }

  if (!Array.isArray(data)) return;

  app.containers.ally.innerHTML = "";
  app.containers.enemy.innerHTML = "";
  app.state.counters = { ally: 0, enemy: 0 };

  data.forEach(r => {
    if (!r || !r.type) return;
    app.state.counters[r.type]++;
    hooks.createRallyCreator(app, r.type, app.state.counters[r.type], {
      openOnly: hooks.openOnly,
      enableDrag: hooks.enableDrag,
      onUpdateList: () => hooks.updateRallyList(app, hooks.calculateAgainstEnemy)
    });

    const rally = app.containers[r.type].querySelector(".rally");
    if (!rally) return;

    rally.querySelector(".rally-name").value = r.name || "";
    setRallyEnabled(rally, r.enabled !== false);
    setRallyTarget(rally, r.target || NO_TARGET);
    setRallyBuffer(rally, r.type === "enemy" ? 0 : (r.buffer ?? 0));
    setRallyCoordinates(rally, r.coordinates || "");
    applyPets(rally, r);
    applyFormationFields(rally, r);
    applyCounterTargets(rally, r.type === "enemy" ? createFalseCounterTargets() : (r.counterTargets || {}));
    if (r.type === "enemy") {
      setEnemyAllies(rally, r.enemyAllies || []);
    }

    Object.entries(r.boxes || {}).forEach(([key, val]) => {
      const box = rally.querySelector(`.t-box[data-name="${key}"]`);
      if (!box) return;
      const sec = Number(val?.sec ?? 0);
      const min = Number(val?.min ?? 0);
      const total = Number.isFinite(sec) ? sec + (Number.isFinite(min) ? min * 60 : 0) : 0;
      box.querySelector(".sec").value = total;
    });
  });

  hooks.updateRallyList(app, hooks.calculateAgainstEnemy);
  saveToStorage(app);
}

function getCounterTargets(rally) {
  const map = {};
  rally.querySelectorAll(".t-box").forEach(box => {
    const target = box.dataset.name;
    map[target] = isTargetCounterEnabled(rally, target);
  });
  return map;
}

function applyCounterTargets(rally, map) {
  Object.entries(map).forEach(([target, enabled]) => {
    setTargetCounterEnabled(rally, target, enabled);
  });

  const master = rally.querySelector(".counter-master");
  const checks = [...rally.querySelectorAll(".counter-check")];
  if (master && checks.length) {
    master.checked = checks.every(input => input.checked);
  }
}

function createFalseCounterTargets() {
  return TARGETS.reduce((acc, target) => {
    acc[target] = false;
    return acc;
  }, {});
}

function sanitizeName(name) {
  return String(name || "")
    .replace(/\s*\[[^\]]*]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function applyFormationFields(rally, record) {
  const preset = String(record?.formation || "");
  const customText = String(record?.formationCustom || "");
  const presetValues = new Set(["", "60/40", "50/20/30", "custom"]);

  if (presetValues.has(preset)) {
    setRallyFormationCustom(rally, customText);
    setRallyFormationSelection(rally, preset);
    return;
  }

  // Backward compatibility: custom text stored directly in `formation`.
  setRallyFormationCustom(rally, preset || customText);
  setRallyFormationSelection(rally, "custom");
}

function applyPets(rally, record) {
  if (rally.dataset.type === "enemy") return;
  rally.dataset.petsUntil = record?.petsUntil || "";
  const duration = rally.querySelector(".pets-duration");
  const bonus = rally.querySelector(".pets-bonus");
  if (duration) duration.value = record?.petsDuration ?? "2";
  if (bonus) bonus.value = record?.petsBonus ?? "30";
}

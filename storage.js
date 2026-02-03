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
  setTargetCounterEnabled
} from "./helpers.js";

export function saveToStorage(app) {
  const data = [];

  document.querySelectorAll(".rally").forEach(rally => {
    const obj = {
      type: rally.dataset.type,
      name: getRallyName(rally),
      enabled: isRallyEnabled(rally),
      target: getRallyTarget(rally),
      buffer: getRallyBuffer(rally),
      counterTargets: getCounterTargets(rally),
      boxes: {}
    };

    rally.querySelectorAll(".t-box").forEach(box => {
      obj.boxes[box.dataset.name] = {
        min: box.querySelector(".min").value,
        sec: box.querySelector(".sec").value
      };
    });

    data.push(obj);
  });

  localStorage.setItem("rallies", JSON.stringify(data));
  if (app?.state) {
    localStorage.setItem("globalBuffer", String(app.state.globalBuffer ?? 0));
  }
}

export function loadFromStorage(app, hooks) {
  const data = JSON.parse(localStorage.getItem("rallies") || "[]");
  const savedGlobal = localStorage.getItem("globalBuffer");
  if (app?.state) {
    const parsed = Number(savedGlobal);
    app.state.globalBuffer = Number.isFinite(parsed) ? parsed : (app.state.globalBuffer ?? 0);
  }

  data.forEach(r => {
    app.state.counters[r.type]++;
    hooks.createRallyCreator(app, r.type, app.state.counters[r.type], {
      openOnly: hooks.openOnly,
      enableDrag: hooks.enableDrag,
      onUpdateList: () => hooks.updateRallyList(app, hooks.calculateAgainstEnemy),
      onSetGlobalBuffer: hooks.onSetGlobalBuffer
    });

    const rally = app.containers[r.type].querySelector(".rally");

    rally.querySelector(".rally-header input").value = r.name;
    setRallyEnabled(rally, r.enabled !== false);
    setRallyTarget(rally, r.target || NO_TARGET);
    setRallyBuffer(rally, r.buffer ?? 0);
    applyCounterTargets(rally, r.counterTargets || {});

    Object.entries(r.boxes || {}).forEach(([key, val]) => {
      const box = rally.querySelector(`.t-box[data-name="${key}"]`);
      if (!box) return;
      box.querySelector(".min").value = val.min;
      box.querySelector(".sec").value = val.sec;
    });
  });

  hooks.updateRallyList(app, hooks.calculateAgainstEnemy);
}

export function exportToJson() {
  const data = JSON.parse(localStorage.getItem("rallies") || "[]");
  return JSON.stringify(data, null, 2);
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
      onUpdateList: () => hooks.updateRallyList(app, hooks.calculateAgainstEnemy),
      onSetGlobalBuffer: hooks.onSetGlobalBuffer
    });

    const rally = app.containers[r.type].querySelector(".rally");
    if (!rally) return;

    rally.querySelector(".rally-header input").value = r.name || "";
    setRallyEnabled(rally, r.enabled !== false);
    setRallyTarget(rally, r.target || NO_TARGET);
    setRallyBuffer(rally, r.buffer ?? 0);
    applyCounterTargets(rally, r.counterTargets || {});

    Object.entries(r.boxes || {}).forEach(([key, val]) => {
      const box = rally.querySelector(`.t-box[data-name="${key}"]`);
      if (!box) return;
      box.querySelector(".min").value = val.min ?? 0;
      box.querySelector(".sec").value = val.sec ?? 0;
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

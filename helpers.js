export const TARGETS = ["Turret 1", "Turret 2", "Turret 3", "Turret 4", "Castle"];
export const NO_TARGET = "No target";

export function formatUTC(d) {
  return [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
    .map(v => String(v).padStart(2, "0"))
    .join(":");
}

export function getRallyName(rally) {
  return rally.querySelector(".rally-header input").value;
}

export function getRallyTarget(rally) {
  return rally.dataset.target || NO_TARGET;
}

export function setRallyTarget(rally, target) {
  rally.dataset.target = target;
}

export function isRallyEnabled(rally) {
  return rally.dataset.enabled !== "false";
}

export function setRallyEnabled(rally, enabled) {
  rally.dataset.enabled = enabled ? "true" : "false";
}

export function getRallyBuffer(rally) {
  const input = rally.querySelector(".buffer");
  const value = Number(input?.value ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function setRallyBuffer(rally, value) {
  const input = rally.querySelector(".buffer");
  if (!input) return;
  input.value = Number.isFinite(Number(value)) ? value : 0;
}

export function isTargetCounterEnabled(rally, target) {
  const box = rally.querySelector(`.t-box[data-name="${target}"]`);
  const input = box?.querySelector(".counter-check");
  return Boolean(input?.checked);
}

export function setTargetCounterEnabled(rally, target, enabled) {
  const box = rally.querySelector(`.t-box[data-name="${target}"]`);
  const input = box?.querySelector(".counter-check");
  if (!input) return;
  input.checked = Boolean(enabled);
}

export function getEnemyAllies(rally) {
  const raw = rally.dataset.enemyAllies;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(v => String(v).trim()).filter(Boolean);
      }
    } catch {
      // fallback to legacy DOM extraction
    }
  }
  return [...rally.querySelectorAll(".enemy-ally-check:checked")]
    .map(input => String(input.value || "").trim())
    .filter(Boolean);
}

export function setEnemyAllies(rally, allyNames) {
  const selected = [...new Set((allyNames || []).map(v => String(v).trim()).filter(Boolean))];
  rally.dataset.enemyAllies = JSON.stringify(selected);
  const selectedSet = new Set(selected);
  rally.querySelectorAll(".enemy-ally-check").forEach(input => {
    input.checked = selectedSet.has(input.value);
  });
}

export function getRallyCoordinates(rally) {
  const input = rally.querySelector(".coordinates");
  return String(input?.value || "").trim();
}

export function setRallyCoordinates(rally, value) {
  const input = rally.querySelector(".coordinates");
  if (!input) return;
  input.value = String(value || "");
}

export function getRallyFormationSelection(rally) {
  const select = rally.querySelector(".formation-select");
  return String(select?.value || "");
}

export function setRallyFormationSelection(rally, value) {
  const select = rally.querySelector(".formation-select");
  if (!select) return;
  select.value = value || "";
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

export function getRallyFormationCustom(rally) {
  const input = rally.querySelector(".formation-custom");
  return String(input?.value || "").trim();
}

export function setRallyFormationCustom(rally, value) {
  const input = rally.querySelector(".formation-custom");
  if (!input) return;
  input.value = String(value || "");
}

export function getRallyFormationValue(rally) {
  const selected = getRallyFormationSelection(rally);
  if (!selected) return "";
  if (selected === "custom") return getRallyFormationCustom(rally);
  return selected;
}

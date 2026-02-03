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

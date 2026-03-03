import {
  TARGETS,
  NO_TARGET,
  formatUTC,
  getRallyBuffer,
  getRallyName,
  isRallyEnabled,
  isTargetCounterEnabled,
  getRallyFormationValue
} from "./helpers.js";
import { targetLabel } from "./i18n.js";

export function calculateAgainstEnemy(app, enemyRally, row) {
  const target = row.querySelector("select").value;
  if (target === NO_TARGET) return;

  const enemyBox = enemyRally.querySelector(`.t-box[data-name="${target}"]`);
  const enemyTime =
    Number(enemyBox.querySelector(".min").value) * 60 +
    Number(enemyBox.querySelector(".sec").value);

  app.resultBox.textContent = "";
  const now = new Date();
  const results = [];

  app.containers.ally.querySelectorAll(".rally").forEach(ally => {
    if (!isTargetCounterEnabled(ally, target)) return;

    const allyBox = ally.querySelector(`.t-box[data-name="${target}"]`);
    const allyTime =
      Number(allyBox.querySelector(".min").value) * 60 +
      Number(allyBox.querySelector(".sec").value);

    if (allyTime > enemyTime) return;

    const t = new Date(now.getTime() + (enemyTime - allyTime) * 1000);
    results.push({
      name: sanitizeName(getRallyName(ally)),
      time: t,
      target,
      formation: getRallyFormationValue(ally)
    });
  });

  renderGroupedResults(app, results);
  appendFormationSummary(app, results);
}

export function calculateAll(app, filterTarget = "ALL") {
  app.resultBox.textContent = "";
  const rallies = [...document.querySelectorAll(".rally")];
  const rows = [...document.querySelectorAll(".target-row")];
  const groups = {};
  const normalizedFilter = filterTarget || "ALL";

  rallies.forEach((rally, i) => {
    if (rally.dataset.type === "enemy") return;

    const target = rows[i]?.querySelector("select")?.value ?? NO_TARGET;
    if (target === NO_TARGET) return;
    if (normalizedFilter !== "ALL" && target !== normalizedFilter) return;
    if (!isRallyEnabled(rally)) return;

    const box = rally.querySelector(`.t-box[data-name="${target}"]`);
    const targetTime =
      Number(box.querySelector(".min").value) * 60 +
      Number(box.querySelector(".sec").value);
    const buffer = getRallyBuffer(rally);

    if (!groups[target]) groups[target] = [];
    groups[target].push({
      name: sanitizeName(getRallyName(rally)),
      targetTime,
      buffer,
      formation: getRallyFormationValue(rally)
    });
  });

  const now = new Date();
  const results = [];

  Object.entries(groups).forEach(([target, group]) => {
    if (!group.length) return;

    const first = group.reduce((best, g) => {
      const bestValue = best.targetTime + best.buffer;
      const nextValue = g.targetTime + g.buffer;
      return nextValue > bestValue ? g : best;
    }, group[0]);

    const firstStart = new Date(now.getTime() + first.buffer * 1000);

    group.forEach(g => {
      const offsetSeconds = first.targetTime - g.targetTime;
      const t = new Date(firstStart.getTime() + offsetSeconds * 1000);
      results.push({
        name: g.name,
        time: t,
        target,
        formation: g.formation
      });
    });
  });

  renderGroupedResults(app, results);
  appendFormationSummary(app, results);
}

function renderGroupedResults(app, results) {
  if (!results.length) return;

  const grouped = new Map();
  results.forEach(item => {
    if (!grouped.has(item.target)) grouped.set(item.target, []);
    grouped.get(item.target).push(item);
  });

  const orderedTargets = TARGETS.filter(target => grouped.has(target));
  orderedTargets.forEach((target, index) => {
    const items = grouped.get(target) || [];
    items.sort((a, b) => a.time.getTime() - b.time.getTime());

    app.resultBox.textContent += `${targetLabel(target)}\n`;
    items.forEach(item => {
      app.resultBox.textContent += `${item.name} -> ${formatUTC(item.time)}\n`;
    });

    if (index < orderedTargets.length - 1) {
      app.resultBox.textContent += "\n";
    }
  });
}

function sanitizeName(name) {
  return name
    .replace(/\s*\[[^\]]*]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function appendFormationSummary(app, results) {
  const lines = [];
  const seen = new Set();

  results.forEach(item => {
    const name = String(item.name || "").trim();
    const formation = String(item.formation || "").trim();
    if (!name || !formation) return;
    if (seen.has(name)) return;
    seen.add(name);
    lines.push(`${name}: ${formation}`);
  });

  if (!lines.length) return;
  app.resultBox.textContent += `\nFormations:\n${lines.join("\n")}\n`;
}

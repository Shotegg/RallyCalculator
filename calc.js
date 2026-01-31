import {
  NO_TARGET,
  formatUTC,
  getRallyBuffer,
  getRallyName,
  isRallyEnabled,
  isTargetCounterEnabled
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
      name: getRallyName(ally),
      time: t,
      target
    });
  });

  results
    .sort((a, b) => a.time.getTime() - b.time.getTime())
    .forEach(r => {
      app.resultBox.textContent += `${r.name} -> ${formatUTC(r.time)} -> ${targetLabel(r.target)}\n`;
    });
}

export function calculateAll(app) {
  app.resultBox.textContent = "";
  const rallies = [...document.querySelectorAll(".rally")];
  const rows = [...document.querySelectorAll(".target-row")];
  const groups = {};

  rallies.forEach((rally, i) => {
    if (rally.dataset.type === "enemy") return;

    const target = rows[i]?.querySelector("select")?.value ?? NO_TARGET;
    if (target === NO_TARGET) return;
    if (!isRallyEnabled(rally)) return;

    const box = rally.querySelector(`.t-box[data-name="${target}"]`);
    const targetTime =
      Number(box.querySelector(".min").value) * 60 +
      Number(box.querySelector(".sec").value);
    const buffer = getRallyBuffer(rally);

    if (!groups[target]) groups[target] = [];
    groups[target].push({
      name: getRallyName(rally),
      targetTime,
      buffer
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
        target
      });
    });
  });

  results
    .sort((a, b) => a.time.getTime() - b.time.getTime())
    .forEach(r => {
      app.resultBox.textContent += `${r.name} -> ${formatUTC(r.time)} -> ${targetLabel(r.target)}\n`;
    });
}

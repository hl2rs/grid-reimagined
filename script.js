const graph = document.getElementById("activity-graph");

const year = new Date().getFullYear();
const firstDay = new Date(year, 0, 1);
const dayOfWeek = firstDay.getDay();
const offset = (dayOfWeek + 6) % 7;

for (let i = 0; i < offset; i++) {
  const empty = document.createElement("span");
  graph.appendChild(empty);
}

const daysInYear =
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;

const activityData = Array.from({ length: daysInYear }, () =>
  Math.floor(Math.random() * 5)
);

activityData.forEach((count, index) => {
  const date = getDateFromDayOfYear(index + 1);
  const day = document.createElement("div");

  day.classList.add("day", `level-${count}`, `m-${date.getMonth() + 1}`);
  //

  day.setAttribute("title", date.toDateString());

  graph.appendChild(day);
});

function getDateFromDayOfYear(dayOfYear, year = 2025) {
  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() + (dayOfYear - 1));

  return start;
}

const rand = (min, max) => Math.random() * (max - min) + min;

function triggerGlow(el, opts) {
  if (el.dataset.glowing === "1") return;
  el.dataset.glowing = "1";

  const radius = opts?.radius || rand(0.6, 1.6).toFixed(2) + "ch";
  const spread = opts?.spread || rand(0.2, 0.9).toFixed(2) + "ch";
  const alpha = opts?.alpha || rand(0.45, 0.95).toFixed(2);
  const duration = opts?.duration || rand(0.9, 1.9).toFixed(2) + "s";

  el.style.setProperty("--glow-radius", radius);
  el.style.setProperty("--glow-spread", spread);
  el.style.setProperty("--glow-alpha", alpha);
  el.style.setProperty("--glow-duration", duration);

  el.classList.remove("glow");
  void el.offsetWidth;
  el.classList.add("glow");

  el.addEventListener(
    "animationend",
    () => {
      el.classList.remove("glow");
      el.style.removeProperty("--glow-radius");
      el.style.removeProperty("--glow-spread");
      el.style.removeProperty("--glow-alpha");
      el.style.removeProperty("--glow-duration");
      delete el.dataset.glowing;
    },
    { once: true }
  );
}

const MAX_CONCURRENT_GLOWS = 20;

function countActiveGlows() {
  return (
    graph.querySelectorAll(".day.glow").length +
    graph.querySelectorAll('.day[data-glowing="1"]').length
  );
}

function scheduleBatch() {
  const dayElements = Array.from(graph.querySelectorAll(".day"));
  if (!dayElements.length) return;

  const current = countActiveGlows();
  const capacity = Math.max(0, MAX_CONCURRENT_GLOWS - current);
  if (capacity === 0) {
    const retryDelay = rand(300, 900);
    setTimeout(scheduleBatch, retryDelay);
    return;
  }

  const batchSize = Math.max(1, Math.floor(rand(1, capacity + 1)));

  const available = dayElements.filter(
    (el) => el.dataset.glowing !== "1" && !el.classList.contains("glow")
  );
  if (!available.length) {
    setTimeout(scheduleBatch, rand(300, 900));
    return;
  }

  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  const selected = available.slice(0, Math.min(batchSize, available.length));

  const spreadWindowMs = rand(400, 1200);
  selected.forEach((el) => {
    const delay = rand(0, spreadWindowMs);
    setTimeout(() => triggerGlow(el), delay);
  });

  const nextDelay = rand(500, 1500);
  setTimeout(scheduleBatch, nextDelay);
}

function waveGlow() {
  const days = Array.from(graph.querySelectorAll(".day"));
  if (!days.length) return 0;

  const stepMs = 70;
  let maxD = 0;

  days.forEach((el, i) => {
    const absolute = offset + i;
    const col = Math.floor(absolute / 7);
    const row = absolute % 7;
    const d = col + row;
    if (d > maxD) maxD = d;

    const delay = d * stepMs;
    setTimeout(
      () =>
        triggerGlow(el, {
          radius: "1.4ch",
          spread: "0.6ch",
          alpha: "0.88",
          duration: "1.2s",
        }),
      delay
    );
  });

  return maxD * stepMs + 1200;
}

const waveTotalMs = waveGlow();
setTimeout(() => scheduleBatch(), Math.max(300, waveTotalMs));

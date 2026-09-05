#!/usr/bin/env node
// 実際の SVG を独立に多角形クリッピングし、表示面積と時間の対応を検証する。
// アプリの面積表・積分式は期待値に使用しない。利用者データ・通信は使わない。
// 実行: node scripts/test-hourglass.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(path.join(root, "app.js"), "utf8");
const css = readFileSync(path.join(root, "styles.css"), "utf8");
const noop = () => {};
let now = Date.parse("2026-09-06T00:00:00Z");
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}
function element() {
  const classes = new Set();
  const attrs = new Map();
  return {
    attrs, classes, dataset: {}, value: "", innerHTML: "", textContent: "",
    addEventListener: noop, focus: noop,
    setAttribute: (key, value) => attrs.set(key, String(value)),
    removeAttribute: (key) => attrs.delete(key),
    querySelector: () => null, querySelectorAll: () => [],
    classList: {
      add: (name) => classes.add(name), remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle(name, on = !classes.has(name)) { if (on) classes.add(name); else classes.delete(name); },
    },
    style: { setProperty: (key, value) => attrs.set(key, value) },
  };
}
const generic = element();
const sand = element();
const sheet = element();
sheet.querySelector = (selector) => selector === ".focus-sand" ? sand : null;
const sandNodes = new Map();
for (const selector of [".focus-sand__upper", ".focus-sand__lower", ".focus-sand__surface",
  ".focus-sand__stream", ".focus-sand__fall-clip", ".focus-sand__impact-position"]) {
  sandNodes.set(selector, element());
}
const upperNodes = [element(), element()];
const lowerNodes = [element(), element()];
sand.querySelector = (selector) => sandNodes.get(selector) || null;
sand.querySelectorAll = (selector) => selector === "[data-sand-top]" ? upperNodes
  : selector === "[data-sand-pile]" ? lowerNodes : [];
const events = new Map();
const doc = {
  hidden: false, activeElement: null, documentElement: generic,
  querySelector: (selector) => selector === "#session-sheet" ? sheet : generic,
  querySelectorAll: () => [], getElementById: () => generic,
  addEventListener: (event, handler) => events.set(event, handler),
};
const sandbox = {
  console, URL, URLSearchParams, Blob, Date: ClockDate, navigator: {}, document: doc,
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  setTimeout: () => 1, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  window: {
    supabase: { createClient: () => ({ auth: { onAuthStateChange: noop } }) },
    addEventListener: noop, setTimeout: () => 1, clearTimeout: noop,
    setInterval: () => 1, clearInterval: noop, scrollTo: noop,
  },
};
const context = vm.createContext(sandbox);
const run = (code) => vm.runInContext(code, context);
run(source);
run("render = () => {}; requestWakeLock = () => {}; scheduleFocusAlarm = () => {};");
run("bindEvents()");
const plain = (expression) => JSON.parse(run(`JSON.stringify(${expression})`));

// M/L/H/V/Z の SVG パスを独立に読む。新しい曲線を導入した場合は、黙って
// 誤差を見逃さずこのテストを更新するよう、非対応コマンドは明示的に失敗する。
function polygon(pathData) {
  const tokens = pathData.match(/[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g);
  const points = [];
  let x = 0;
  let y = 0;
  let command;
  for (let i = 0; i < tokens.length;) {
    if (/^[a-zA-Z]$/.test(tokens[i])) command = tokens[i++];
    if (command === "Z") break;
    assert.ok(["M", "L", "H", "V"].includes(command), `Unsupported path command: ${command}`);
    if (command === "M" || command === "L") { x = Number(tokens[i++]); y = Number(tokens[i++]); }
    else if (command === "H") x = Number(tokens[i++]);
    else y = Number(tokens[i++]);
    points.push([x, y]);
    if (command === "M") command = "L";
  }
  return points;
}
const cross = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
function signedArea(points) {
  return points.reduce((sum, point, i) => {
    const next = points[(i + 1) % points.length];
    return sum + point[0] * next[1] - next[0] * point[1];
  }, 0) / 2;
}
function clippedArea(subject, clipping) {
  const sign = Math.sign(signedArea(clipping));
  let output = subject;
  for (let i = 0; i < clipping.length && output.length; i += 1) {
    const a = clipping[i];
    const b = clipping[(i + 1) % clipping.length];
    const input = output;
    output = [];
    for (let j = 0; j < input.length; j += 1) {
      const previous = input[(j + input.length - 1) % input.length];
      const current = input[j];
      const before = sign * cross(a, b, previous);
      const after = sign * cross(a, b, current);
      if ((before >= 0) !== (after >= 0)) {
        const t = before / (before - after);
        output.push([previous[0] + t * (current[0] - previous[0]), previous[1] + t * (current[1] - previous[1])]);
      }
      if (after >= 0) output.push(current);
    }
  }
  return Math.abs(signedArea(output));
}
function renderedAreas(progress) {
  const html = run(`renderFocusSandClock(${progress})`);
  const topClip = polygon(html.match(/<clipPath id="sandTopClip"><path d="([^"]+)"/)[1]);
  const bottomClip = polygon(html.match(/<clipPath id="sandBottomClip"><path d="([^"]+)"/)[1]);
  const upper = polygon(html.match(/<path data-sand-top class="focus-sand__mass" d="([^"]+)"/)[1]);
  const lower = polygon(html.match(/<path data-sand-pile class="focus-sand__mass focus-sand__mass--pile" d="([^"]+)"/)[1]);
  return {
    upper: clippedArea(upper, topClip) / Math.abs(signedArea(topClip)),
    lower: clippedArea(lower, bottomClip) / Math.abs(signedArea(bottomClip)),
  };
}
function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}, tolerance ${tolerance}`);
}
let passed = 0;
let failed = 0;
function test(label, fn) {
  now = Date.parse("2026-09-06T00:00:00Z");
  doc.hidden = false;
  sand.classes.clear();
  run("ui.finishDraft = null; state.activeSession = {type:'task', durationSeconds:1500, accumulatedSeconds:0, startedAt:Date.now(), endsAt:Date.now()+1500000};");
  try { fn(); passed += 1; console.log(`ok - ${label}`); }
  catch (error) { failed += 1; console.error(`not ok - ${label}\n${error.stack}`); }
}

test("独立クリッピングの基礎計算（矩形交差・三角形・逆向き・空集合）", () => {
  const square = [[0, 0], [10, 0], [10, 10], [0, 10]];
  close(clippedArea([[5, -5], [15, -5], [15, 5], [5, 5]], square), 25);
  close(clippedArea([[0, 0], [10, 0], [0, 10]], square), 50);
  close(clippedArea(square, [...square].reverse()), 100);
  close(clippedArea([[20, 0], [30, 0], [30, 10], [20, 10]], square), 0);
});
for (const percent of [0, 25, 50, 75, 100]) {
  test(`進捗${percent}%の実際のSVGクリップ後面積が残量・経過に一致`, () => {
    const actual = renderedAreas(percent / 100);
    close(actual.upper, 1 - percent / 100, 0.004);
    close(actual.lower, percent / 100, 0.004);
  });
}
test("0〜100%で上の砂は単調減少、下の砂は単調増加し、総面積も保たれる", () => {
  let previous = renderedAreas(0);
  for (let step = 1; step <= 100; step += 1) {
    const current = renderedAreas(step / 100);
    assert.ok(current.upper <= previous.upper + 1e-9, `upper grew at ${step}%`);
    assert.ok(current.lower >= previous.lower - 1e-9, `lower shrank at ${step}%`);
    close(current.upper + current.lower, 1, 0.005);
    previous = current;
  }
});
test("開始時は下が空、完了時は上が空で砂流・着地表現を停止", () => {
  assert.match(run("renderFocusSandClock(0)"), /opacity="0" class="focus-sand__lower"/);
  const completed = run("renderFocusSandClock(1)");
  assert.match(completed, /opacity="0" class="focus-sand__upper"/);
  assert.match(completed, /class="focus-visual focus-sand is-complete is-idle/);
});
test("残り7.5秒（99.5%）では砂粒を止めず、正確に0秒で完了にする", () => {
  const running = run("renderFocusSandClock(getSessionProgressRatio(state.activeSession, 7500))");
  assert.doesNotMatch(running, /is-complete|is-idle/);
  run("updateFocusTimerVisual(7500)");
  assert.equal(sand.classes.has("is-complete"), false);
  assert.equal(sand.classes.has("is-idle"), false);
  run("updateFocusTimerVisual(0)");
  assert.equal(sand.classes.has("is-complete"), true);
  assert.equal(sand.classes.has("is-idle"), true);
});
test("開始前・記録仕上げ時には粒を流さない", () => {
  run("state.activeSession = null");
  assert.match(run("renderFocusSandClock(0)"), /is-idle/);
  run("state.activeSession = { durationSeconds: 1500 }; ui.finishDraft = {};");
  assert.match(run("renderFocusSandClock(0.5)"), /is-idle/);
});
test("保存した終了時刻に従って背景滞在後も経過が進み、予定超過は100%で止まる", () => {
  close(run("getSessionProgressRatio()"), 0);
  now += 300000;
  close(run("getSessionProgressRatio()"), 0.2);
  now += 3000000;
  close(run("getSessionProgressRatio()"), 1);
  close(run("getSessionProgressRatio(state.activeSession, 2000000)"), 0);
});
test("途中から再開しても砂を戻さず、割当由来のplannedSecondsに依存しない", () => {
  run("state.activeSession = {type:'task',durationSeconds:1200,accumulatedSeconds:300,plannedSeconds:3600,startedAt:Date.now(),endsAt:Date.now()+1200000};");
  close(run("getSessionProgressRatio()"), 0.2);
  now += 300000;
  close(run("getSessionProgressRatio()"), 0.4);
  run("state.activeSession = {...state.activeSession,durationSeconds:900,accumulatedSeconds:600,startedAt:Date.now(),endsAt:Date.now()+900000};");
  close(run("getSessionProgressRatio()"), 0.4);
  close(run("getSessionProgressRatio(state.activeSession, 0)"), 1);
});
test("更新は砂本体とテクスチャを同じ輪郭へ移し、落下位置も残量に同期", () => {
  run("updateFocusTimerVisual(750000)");
  const geometry = plain("buildSandClockGeometry(0.5)");
  for (const node of upperNodes) assert.equal(node.attrs.get("d"), geometry.topD);
  for (const node of lowerNodes) assert.equal(node.attrs.get("d"), geometry.pileD);
  assert.equal(sand.attrs.get("--sand-fall"), `${geometry.fallDistance.toFixed(2)}px`);
  assert.equal(sand.attrs.get("aria-label"), "集中の進み具合 50%");
});
test("非表示イベントで粒を即時停止し、復帰時に解除して同じ終了時刻を保持", () => {
  const endsAt = run("state.activeSession.endsAt");
  const visibility = events.get("visibilitychange");
  assert.equal(typeof visibility, "function");
  doc.hidden = true;
  visibility();
  assert.equal(sand.classes.has("is-background"), true);
  assert.match(run("renderFocusSandClock(0.3)"), /is-background/);
  now += 120000;
  doc.hidden = false;
  visibility();
  assert.equal(sand.classes.has("is-background"), false);
  assert.equal(run("state.activeSession.endsAt"), endsAt);
  close(run("getSessionProgressRatio()"), 0.08);
});

// CSSの該当ブロックを構造で取り出す。CSS実行の代替ではなく、背景停止と
// reduced-motionの契約が消えたときの回帰検出。実機の描画QAは別途行う。
function cssBody(text, marker) {
  const begin = text.indexOf(marker);
  assert.ok(begin >= 0, `Missing CSS block: ${marker}`);
  const open = text.indexOf("{", begin);
  let depth = 1;
  let end = open + 1;
  for (; end < text.length && depth; end += 1) {
    if (text[end] === "{") depth += 1;
    if (text[end] === "}") depth -= 1;
  }
  assert.equal(depth, 0);
  return text.slice(open + 1, end - 1);
}
function declarationFor(text, selector, property) {
  for (const match of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!match[1].split(",").map((part) => part.trim()).includes(selector)) continue;
    const declarations = match[2].split(";").map((part) => part.trim().split(/:(.*)/s));
    const found = declarations.find(([key]) => key === property);
    if (found) return found[1].trim();
  }
  return undefined;
}
test("CSSは背景で粒・着地アニメーションを休止し、低減設定で動く表現を隠す", () => {
  for (const part of ["grain", "impact"]) {
    assert.equal(declarationFor(css, `.focus-sand.is-background .focus-sand__${part}`, "animation-play-state"), "paused");
  }
  const reduced = cssBody(css, "@media (prefers-reduced-motion: reduce)");
  for (const part of ["grain", "impact"]) {
    assert.match(declarationFor(reduced, `.focus-sand__${part}`, "animation"), /^none\s*!important$/);
  }
  for (const part of ["fall", "impact"]) {
    assert.equal(declarationFor(reduced, `.focus-sand__${part}`, "opacity"), "0");
  }
  assert.equal(declarationFor(reduced, ".focus-sand__mass", "display"), undefined);
});

console.log(`\nHourglass: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

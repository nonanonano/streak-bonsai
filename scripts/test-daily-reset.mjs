#!/usr/bin/env node
// 日付リセット系ロジックのユニットテスト。
// app.js はブラウザ前提の単一ファイルのため、対象の純関数だけを
// ソースから抽出して検証する(DOM・Supabase不要)。
// 実行: node scripts/test-daily-reset.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(path.join(root, "app.js"), "utf8");

// function <name>(...) { ... } をブレース対応で切り出す。
// 対象関数は文字列/正規表現リテラル内にブレースを含まない前提。
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `app.js に function ${name} が見つかりません`);
  // 引数リストを括弧対応で読み飛ばす(デフォルト引数の {} を本体と誤認しないため)
  let i = source.indexOf("(", start);
  let paren = 0;
  for (; i < source.length; i += 1) {
    if (source[i] === "(") paren += 1;
    else if (source[i] === ")") {
      paren -= 1;
      if (paren === 0) break;
    }
  }
  let depth = 0;
  i = source.indexOf("{", i);
  for (; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return source.slice(start, i + 1);
}

const names = [
  "toISODate",
  "normalizeGoalContinuation",
  "normalizeGoalContinuations",
  "getGoalContinuationDate",
  "filterStaleContinuations",
];
const fns = new Function(
  `${names.map(extract).join("\n")}\nreturn { ${names.join(", ")} };`,
)();

const {
  toISODate,
  normalizeGoalContinuation,
  normalizeGoalContinuations,
  filterStaleContinuations,
} = fns;

let passed = 0;
function test(label, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${label}`);
}

// ---- toISODate: ローカル日付で年月日を返す(UTCずれなし) ----
test("toISODate はローカル日付を返す", () => {
  assert.equal(toISODate(new Date(2026, 6, 24, 0, 0, 1)), "2026-07-24");
  assert.equal(toISODate(new Date(2026, 6, 24, 23, 59, 59)), "2026-07-24");
  assert.equal(toISODate(new Date(2026, 0, 1)), "2026-01-01");
});

// ---- normalizeGoalContinuation: 不正値は null ----
test("残り0秒以下・非数値の保留は null", () => {
  assert.equal(normalizeGoalContinuation({ remainingSeconds: 0 }), null);
  assert.equal(normalizeGoalContinuation({ remainingSeconds: -5 }), null);
  assert.equal(normalizeGoalContinuation({ remainingSeconds: "abc" }), null);
  assert.equal(normalizeGoalContinuation(), null);
});

test("残り秒数は 1〜240分 にクランプ", () => {
  assert.equal(
    normalizeGoalContinuation({ remainingSeconds: 999999 }).remainingSeconds,
    240 * 60,
  );
  assert.equal(
    normalizeGoalContinuation({ remainingSeconds: 0.4 }).remainingSeconds,
    1,
  );
});

// ---- normalizeGoalContinuations: 想定外の型は {} ----
test("配列・null・文字列の保留マップは空になる", () => {
  assert.deepEqual(normalizeGoalContinuations([]), {});
  assert.deepEqual(normalizeGoalContinuations(null), {});
  assert.deepEqual(normalizeGoalContinuations("x"), {});
});

// ---- filterStaleContinuations: 保留は当日限り(goalType不問) ----
function iso(date) {
  return date.toISOString();
}

test("昨日の保留は落ち、今日の保留は残る", () => {
  const now = new Date(2026, 6, 24, 9, 0, 0);
  const yesterday = new Date(2026, 6, 23, 22, 0, 0);
  const result = filterStaleContinuations(
    {
      staleGoal: { remainingSeconds: 600, pausedAt: iso(yesterday) },
      freshGoal: { remainingSeconds: 300, pausedAt: iso(now) },
    },
    now,
  );
  assert.deepEqual(Object.keys(result), ["freshGoal"]);
});

test("日付境界: 前日23:59は落ち、当日00:00は残る", () => {
  const now = new Date(2026, 6, 24, 0, 30, 0);
  const result = filterStaleContinuations(
    {
      lastNight: {
        remainingSeconds: 600,
        pausedAt: iso(new Date(2026, 6, 23, 23, 59, 59)),
      },
      midnight: {
        remainingSeconds: 600,
        pausedAt: iso(new Date(2026, 6, 24, 0, 0, 0)),
      },
    },
    now,
  );
  assert.deepEqual(Object.keys(result), ["midnight"]);
});

test("pausedAt が壊れている保留は落ちる", () => {
  const now = new Date(2026, 6, 24, 9, 0, 0);
  const result = filterStaleContinuations(
    { broken: { remainingSeconds: 600, pausedAt: "not-a-date" } },
    now,
  );
  assert.deepEqual(result, {});
});

test("1週間前の保留も落ちる(習慣・目標の区別なし)", () => {
  const now = new Date(2026, 6, 24, 9, 0, 0);
  const result = filterStaleContinuations(
    {
      oldGoal: {
        remainingSeconds: 900,
        pausedAt: iso(new Date(2026, 6, 17, 12, 0, 0)),
      },
    },
    now,
  );
  assert.deepEqual(result, {});
});

console.log(`\nall ${passed} tests passed`);

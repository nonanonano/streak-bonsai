#!/usr/bin/env node
// 実際のapp.jsを隔離したブラウザ代替環境で読み、削除→保存→再読込まで検証する。
// 実行: node scripts/test-goal-deletion.mjs（ネットワーク・利用者データへのアクセスなし）
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(path.join(root, "app.js"), "utf8");
const storage = new Map();
const noop = () => {};
const element = {
  addEventListener: noop, setAttribute: noop, removeAttribute: noop,
  querySelector: () => null, querySelectorAll: () => [],
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  style: {}, dataset: {}, value: "", innerHTML: "", textContent: "",
};
const sandbox = {
  console, URL, URLSearchParams, Blob,
  setTimeout: () => 1, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  navigator: {},
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  document: {
    querySelector: () => element, querySelectorAll: () => [], getElementById: () => element,
    addEventListener: noop, hidden: false, activeElement: null,
  },
  window: {
    supabase: { createClient: () => ({ auth: { onAuthStateChange: noop } }) },
    addEventListener: noop, setTimeout: () => 1, clearTimeout: noop,
    setInterval: () => 1, clearInterval: noop, scrollTo: noop,
  },
};
const context = vm.createContext(sandbox);
const run = (code) => vm.runInContext(code, context);
const snapshot = () => JSON.parse(run("JSON.stringify(state)"));
run(source);
run(`
  function seedGoals(specs = [{ id: "habit", name: "朝の読書", type: "habit" }]) {
    state = buildSeedState();
    state.meta.demoMode = false;
    state.goals = specs.map((spec) => createGoalRecord({
      id: spec.id, setup: { ...state.setup, goal: spec.name, goalType: spec.type || "goal" },
      archived: Boolean(spec.archived),
      logs: [{ logId: spec.id + "-log", date: toISODate(new Date()), outcome: "A", elapsedSeconds: 60 }],
    }));
    applyGoalRecord(state.goals[0]);
    ui.setupMode = "edit";
    ui.setupSection = "home";
    ui.setupDraft = expandSetup(state.setup);
    ui.deleteConfirmGoalId = null;
  }
  function clickAction(action, goalId = "habit") {
    const target = { dataset: { action, goalId }, tagName: "BUTTON" };
    handleClick({ target: { closest: () => target }, preventDefault() {}, stopPropagation() {} });
  }
`);

let passed = 0;
function test(label, fn) {
  storage.clear();
  run("seedGoals()");
  fn();
  passed += 1;
  console.log(`ok - ${label}`);
}

test("初回起動は実績も目標も0件で、完了したと表示しない", () => {
  run("state = loadState(); ensureGoalCollection(); ensureDailyPlan()");
  const initial = snapshot();
  assert.deepEqual(initial.goals, []);
  assert.deepEqual(initial.logs, []);
  assert.deepEqual(initial.taskLogs, []);
  assert.deepEqual(initial.tasks, []);
  assert.equal(initial.meta.demoMode, false);
  assert.match(run("renderTodayView()"), /今日はまだ空いています/);
  assert.doesNotMatch(run("renderTodayView()"), /今日の分はおわり/);
  assert.equal(run("buildSeedState().goals.length"), 1);
});

test("保存済みユーザーの目標と記録を初回用データで置き換えない", () => {
  run("saveState(); state = loadState(); ensureGoalCollection()");
  assert.equal(snapshot().goals[0].setup.goal, "朝の読書");
  assert.equal(snapshot().goals[0].logs[0].logId, "habit-log");
});

test("最後の習慣を削除し、関連する保留と予定だけ除く", () => {
  run(`
    state.tasks = [normalizeTask({ id: "task", title: "買い物", minutes: 5 }), normalizeTask({ id: "legacy", title: "朝の読書", sourceGoalId: "habit" })];
    state.taskLogs = [{ logId: "task-log", itemId: "task", outcome: "A" }, { logId: "legacy-log", itemId: "legacy", outcome: "A" }];
    state.goalContinuations = { habit: { remainingSeconds: 60 }, other: { remainingSeconds: 120 } };
    state.dailyPlan.includedWorkIds = ["goal::habit", "legacy", "task"];
    state.dailyPlan.excludedWorkIds = ["goal::habit"];
    state.dailyPlan.workOrderIds = ["goal::habit", "legacy", "task"];
    state.dailyPlan.startTimes = { "goal::habit": "20:00", legacy: "20:05", task: "20:10" };
    state.dailyPlan.defaultStartTimes = { "goal::habit": "20:00", task: "20:10" };
    state.dailyPlan.allocations = [{ workId: "goal::habit" }, { workId: "legacy" }, { workId: "task" }];
  `);
  assert.equal(run('deleteGoalRecord("habit")'), true);
  const saved = snapshot();
  assert.deepEqual(saved.goals, []);
  assert.equal(saved.meta.activeGoalId, null);
  assert.equal(saved.setup.goal, "");
  assert.deepEqual(saved.logs, []);
  assert.deepEqual(saved.tasks.map((task) => task.id), ["task"]);
  assert.deepEqual(saved.taskLogs.map((entry) => entry.logId), ["task-log"]);
  assert.deepEqual(Object.keys(saved.goalContinuations), ["other"]);
  assert.deepEqual(saved.dailyPlan.includedWorkIds, ["task"]);
  assert.deepEqual(saved.dailyPlan.excludedWorkIds, []);
  assert.deepEqual(saved.dailyPlan.workOrderIds, ["task"]);
  assert.deepEqual(saved.dailyPlan.startTimes, { task: "20:10" });
  assert.deepEqual(saved.dailyPlan.defaultStartTimes, { task: "20:10" });
  assert.deepEqual(saved.dailyPlan.allocations, [{ workId: "task" }]);
});

test("全削除後、保存・再起動・記録画面で目標が復活しない", () => {
  run('deleteGoalRecord("habit"); saveState(); state = loadState(); ensureGoalCollection(); getAllExecutionLogs(); saveState()');
  assert.deepEqual(snapshot().goals, []);
  assert.equal(run("listGoals().length"), 0);
  assert.equal(run("state.meta.demoMode"), false);
  assert.match(run("renderSettingsHome()"), /習慣・目標はまだありません/);
  assert.equal(typeof run("renderTodayView()"), "string");
  assert.equal(typeof run("renderReviewView()"), "string");
});

test("旧形式のデータは目標名と記録を維持して移行する", () => {
  run("const legacyState = cloneData(state); delete legacyState.goals; state = mergeState(buildSeedState(), legacyState); ensureGoalCollection(); saveState()");
  assert.equal(snapshot().goals.length, 1);
  assert.equal(snapshot().goals[0].setup.goal, "朝の読書");
  assert.equal(snapshot().goals[0].logs[0].logId, "habit-log");
});

test("残りが非表示の目標だけでも内容を上書きしない", () => {
  run('seedGoals([{ id: "active", name: "削除する目標" }, { id: "archive", name: "保存した目標", archived: true }]); deleteGoalRecord("active"); saveState(); state = loadState(); ensureGoalCollection()');
  const saved = snapshot();
  assert.equal(saved.goals.length, 1);
  assert.equal(saved.goals[0].id, "archive");
  assert.equal(saved.goals[0].setup.goal, "保存した目標");
  assert.equal(saved.goals[0].logs[0].logId, "archive-log");
  assert.equal(saved.goals[0].archived, true);
  assert.equal(run("listGoals().length"), 0);
});

test("非アクティブ項目の削除は表示中の記録を維持する", () => {
  run('seedGoals([{ id: "active", name: "続ける目標" }, { id: "remove", name: "削除する目標" }]); deleteGoalRecord("remove"); saveState()');
  assert.equal(snapshot().meta.activeGoalId, "active");
  assert.equal(snapshot().goals[0].setup.goal, "続ける目標");
  assert.equal(snapshot().goals[0].logs[0].logId, "active-log");
});

test("不明なIDとタイマー実行中の削除はデータを変更しない", () => {
  const before = snapshot();
  assert.equal(run('deleteGoalRecord("unknown")'), false);
  assert.deepEqual(snapshot(), before);
  run('state.activeSession = { type: "goal", goalId: "habit", endsAt: Date.now() + 60000 }');
  const running = snapshot();
  assert.equal(run('deleteGoalRecord("habit")'), false);
  assert.deepEqual(snapshot(), running);
});

test("Taskだけの状態でもタイマーを保存・再開できる", () => {
  run('deleteGoalRecord("habit"); state.activeSession = { type: "task", taskId: "task", endsAt: Date.now() + 60000 }; saveState(); state = loadState(); ensureGoalCollection(); listGoals(); saveState()');
  assert.deepEqual(snapshot().goals, []);
  assert.equal(snapshot().activeSession.taskId, "task");
});

test("最後の習慣に削除ボタンがあり、新規作成中には出さない", () => {
  assert.match(run("renderGoalSettingsDetail(expandSetup(state.setup))"), /data-action="confirm-delete-goal"/);
  assert.match(run("renderGoalSettingsDetail(expandSetup(state.setup))"), /この習慣を削除する/);
  run('ui.setupMode = "new_goal"');
  assert.doesNotMatch(run("renderGoalSettingsDetail(buildNewGoalDraft(state.setup))"), /data-action="confirm-delete-goal"/);
});

test("設定への移動と削除確認・取り消し・確定が機能する", () => {
  run('clickAction("open-goal-settings")');
  assert.equal(snapshot().meta.currentView, "setup");
  run('clickAction("delete-goal")');
  assert.equal(snapshot().goals.length, 1);
  run('clickAction("confirm-delete-goal"); clickAction("cancel-delete-goal")');
  assert.equal(run("ui.deleteConfirmGoalId"), null);
  assert.equal(snapshot().goals.length, 1);
  run('clickAction("confirm-delete-goal"); clickAction("delete-goal")');
  assert.deepEqual(snapshot().goals, []);
  assert.equal(run("ui.setupSection"), "home");
});

test("最後の習慣を非表示にして再表示しても記録が残る", () => {
  run('clickAction("archive-goal")');
  assert.equal(run("listGoals().length"), 0);
  assert.equal(snapshot().goals[0].logs[0].logId, "habit-log");
  run('clickAction("restore-goal"); state = loadState(); ensureGoalCollection()');
  assert.equal(run("listGoals().length"), 1);
  assert.equal(snapshot().goals[0].logs[0].logId, "habit-log");
  assert.equal(snapshot().goals[0].archived, false);
});

test("全削除後に新しい目標を1件だけ作成できる", () => {
  run('deleteGoalRecord("habit"); ui.setupMode = "new_goal"; ui.setupDraft = buildNewGoalDraft(state.setup); ui.setupDraft.goal = "新しい目標"');
  assert.equal(run("commitSetupDraft()"), "created");
  assert.equal(snapshot().goals.length, 1);
  assert.equal(snapshot().goals[0].setup.goal, "新しい目標");
  assert.deepEqual(snapshot().goals[0].logs, []);
});

test("全削除後に名前が空欄の目標を作らない", () => {
  run('deleteGoalRecord("habit"); ui.setupMode = "new_goal"; ui.setupDraft = buildNewGoalDraft(state.setup); ui.setupDraft.goal = "  "');
  assert.equal(run("commitSetupDraft()"), null);
  assert.deepEqual(snapshot().goals, []);
});

console.log(`\nall ${passed} tests passed`);

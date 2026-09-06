#!/usr/bin/env node
// 実際のapp.js全体をVMで読み、イベント→状態→保存→再読込の流れを検証する。
// DOM描画・タイマー・FileReaderのみ代替。ネットワークと利用者データにはアクセスしない。
// 実行: node scripts/test-task-workflow.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

process.env.TZ = "Asia/Tokyo";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(path.join(root, "app.js"), "utf8");
const storage = new Map();
const messages = [];
const noop = () => {};
let now = Date.parse("2026-09-05T15:05:00.000Z"); // JST 9月6日 00:05、UTCとは日付が違う
let reads = 0;
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}
class MemoryFileReader {
  readAsText(file) {
    reads += 1;
    this.onload?.({ target: { result: file.text } });
  }
}
const element = {
  addEventListener: noop, setAttribute: noop, removeAttribute: noop, focus: noop,
  querySelector: () => null, querySelectorAll: () => [],
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  style: {}, dataset: {}, value: "", innerHTML: "", textContent: "",
};
const sandbox = {
  console, URL, URLSearchParams, Blob, Date: ClockDate, FileReader: MemoryFileReader,
  setTimeout: () => 1, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  navigator: {},
  recordMessage: (message) => messages.push(message),
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
const plain = (expression) => JSON.parse(run(`JSON.stringify(${expression})`));
const snapshot = () => plain("state");
run(source);
run(`
  render = () => {}; // イベントによるDOM差替えのみ停止。各render関数自体は後段で実行する。
  showToast = (message) => recordMessage(message);
  function resetWorkflow() {
    state = buildSeedState();
    state.activeSession = null;
    state.goals = [];
    clearActiveGoalRecord();
    state.tasks = [];
    state.goalContinuations = {};
    state.taskLogs = [];
    state.meta.demoMode = false;
    state.meta.currentView = "today";
    state.dailyPlan = normalizeDailyPlan({ capacityMinutes: 60 });
    ui.todayMode = "execution";
    ui.taskComposerQuadrant = null;
    ui.selectedTaskId = null;
    ui.taskShowShelved = false;
    ui.taskSuppressClickUntil = 0;
    ui.reviewGoalFilter = "all";
    resetTaskDraft();
  }
  function clickAction(action, extra = {}) {
    const target = { tagName: "BUTTON", dataset: { action, ...extra } };
    handleClick({ target: { closest: () => target }, preventDefault() {}, stopPropagation() {} });
  }
  function enterDraft(title, minutes = "25") {
    for (const [field, value] of Object.entries({ title, minutes })) {
      handleInput({ target: { value, dataset: { taskDraftField: field },
        matches: (selector) => selector === "[data-task-draft-field]" } });
    }
  }
  function pressTaskKey({ isComposing = false, keyCode = 13, key = "Enter", composer = false } = {}) {
    let clicks = 0;
    let prevented = 0;
    const container = { querySelector: (selector) => selector === '[data-action="add-task"]'
      ? { click: () => { clicks += 1; clickAction("add-task"); } } : null };
    const target = {
      matches: (selector) => selector === '[data-task-draft-field="title"]',
      closest: (selector) => selector.split(",").map((part) => part.trim())
        .includes(composer ? ".task-quadrant__composer" : ".time-task-capture") ? container : null,
    };
    handleKeydown({ target, key, keyCode, isComposing, preventDefault: () => { prevented += 1; } });
    return { clicks, prevented };
  }
`);

let passed = 0;
let failed = 0;
function test(label, fn) {
  storage.clear();
  messages.length = 0;
  reads = 0;
  now = Date.parse("2026-09-05T15:05:00.000Z");
  run("resetWorkflow()");
  try {
    fn();
    passed += 1;
    console.log(`ok - ${label}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${label}\n${error.stack}`);
  }
}
const click = (action, extra = {}) => run(`clickAction(${JSON.stringify(action)}, ${JSON.stringify(extra)})`);
const draft = (title, minutes = "25") => run(`enterDraft(${JSON.stringify(title)}, ${JSON.stringify(minutes)})`);
const reload = () => run("state = loadState(); ensureGoalCollection(); ensureDailyPlan()");
const todayIds = () => plain("getTodayOrderedWorkItems().map((item) => item.id)");
const restore = (data) => run(`importData({ text: ${JSON.stringify(typeof data === "string" ? data : JSON.stringify(data))} })`);

test("空欄・空白だけの追加では保存せず、Taskも増えない", () => {
  for (const title of ["", " \n\t　"]) {
    draft(title);
    click("add-task");
    assert.equal(snapshot().tasks.length, 0);
    assert.equal(storage.size, 0);
    assert.equal(messages.at(-1), "Task名を入れてください。");
  }
});

test("目標0件でもTaskが即座に今日へ入り、保存再読込後も残る", () => {
  draft("  資格の例題を解く  ", "25");
  click("add-task");
  const task = snapshot().tasks[0];
  assert.equal(task.title, "資格の例題を解く");
  assert.equal(task.minutes, 25);
  assert.equal(task.plannedDate, "2026-09-06");
  assert.equal(task.quadrant, "urgentNotImportant");
  assert.deepEqual(todayIds(), [task.id]);
  assert.deepEqual(snapshot().goals, []);
  assert.equal(snapshot().meta.activeGoalId, null);
  reload();
  assert.deepEqual(todayIds(), [task.id]);
  assert.deepEqual(snapshot().goals, []);
  assert.match(run("renderTodayView()"), /資格の例題を解く/);
  assert.equal(plain("ui.taskDraft").title, "");
});

for (const quadrant of ["urgentImportant", "notUrgentImportant", "urgentNotImportant", "notUrgentNotImportant"]) {
  test(`4象限の${quadrant}から追加しても今日に直接入る`, () => {
    click("set-today-mode", { mode: "organize" });
    click("open-task-composer", { quadrant });
    draft("象限から追加", "7");
    click("add-task");
    const task = snapshot().tasks[0];
    assert.equal(task.quadrant, quadrant);
    assert.equal(task.plannedDate, "2026-09-06");
    assert.deepEqual(todayIds(), [task.id]);
    assert.match(run("renderTaskQuadrantBoard(groupActiveWorkItemsByQuadrant())"), /今日の予定 7分/);
  });
}

test("象限入力を開いてから今日へ戻ると既定の象限に追加する", () => {
  click("set-today-mode", { mode: "organize" });
  click("open-task-composer", { quadrant: "notUrgentNotImportant" });
  click("set-today-mode", { mode: "execution" });
  assert.equal(plain("ui.taskComposerQuadrant"), null);
  draft("普通の用事");
  click("add-task");
  assert.equal(snapshot().tasks[0].quadrant, "urgentNotImportant");
});

test("JST深夜とUTC午前0時をまたいでも、日本の同じ今日に追加される", () => {
  draft("日本の深夜");
  click("add-task");
  now = Date.parse("2026-09-06T00:05:00.000Z"); // JST 09:05
  draft("日本の朝");
  click("add-task");
  assert.deepEqual(snapshot().tasks.map((task) => task.plannedDate), ["2026-09-06", "2026-09-06"]);
  assert.equal(todayIds().length, 2);
  now = Date.parse("2026-09-06T15:05:00.000Z"); // JST 翌日00:05
  draft("日本の翌日");
  click("add-task");
  assert.deepEqual(plain("getTodayOrderedWorkItems().map((item) => item.title)").sort(), ["日本の翌日", "日本の朝", "日本の深夜"].sort());
  assert.deepEqual(snapshot().tasks.map((task) => task.plannedDate).sort(), ["2026-09-06", "2026-09-06", "2026-09-07"]);
});

test("手動で今日から外したTaskは、保存・再描画・再読込でも戻らない", () => {
  draft("今日はしない");
  click("add-task");
  const id = snapshot().tasks[0].id;
  click("toggle-work-today", { workId: id });
  assert.equal(snapshot().tasks[0].plannedDate, "");
  assert.deepEqual(todayIds(), []);
  reload();
  run("renderTodayView(); renderTaskQuadrantBoard(groupActiveWorkItemsByQuadrant()); saveState()");
  assert.deepEqual(todayIds(), []);
  click("toggle-work-today", { workId: id });
  assert.deepEqual(todayIds(), [id]);
});

test("昨日予定の未完了Taskは今日に残り、未予定・未来予定・棚上げ・完了Taskは入らない", () => {
  run(`state.tasks = normalizeTasks([
    { id: "unscheduled", title: "未予定", quadrant: "notUrgentImportant" },
    { id: "yesterday", title: "昨日", plannedDate: "2026-09-05" },
    { id: "future", title: "未来", plannedDate: "2026-09-08" },
    { id: "shelved", title: "棚上げ", status: "shelved", plannedDate: "2026-09-05" },
    { id: "done", title: "完了", status: "done", plannedDate: "2026-09-05" }
  ]); saveState()`);
  reload();
  draft("新しいTask");
  click("add-task");
  assert.deepEqual(plain("getTodayOrderedWorkItems().map((item) => item.title)").sort(), ["新しいTask", "昨日"].sort());
  assert.equal(snapshot().tasks.find((task) => task.id === "unscheduled").plannedDate, "");
  assert.equal(snapshot().tasks.find((task) => task.id === "yesterday").plannedDate, "2026-09-05");
  assert.equal(snapshot().tasks.find((task) => task.id === "future").plannedDate, "2026-09-08");
});

test("開いたまま日本時間の午前0時をまたいでも未完了Taskが今日から消えない", () => {
  now = Date.parse("2026-09-06T14:59:00.000Z");
  draft("日付をまたぐTask");
  click("add-task");
  const before = snapshot().tasks[0];
  assert.deepEqual(todayIds(), [before.id]);
  now += 120_000;
  assert.equal(run("toISODate(new Date())"), "2026-09-07");
  assert.deepEqual(todayIds(), [before.id]);
  assert.equal(snapshot().dailyPlan.date, "2026-09-07");
  assert.deepEqual(snapshot().tasks[0], before);
});

test("数日後の再読込でも未完了Taskと元の予定日・進捗・小Taskを保持する", () => {
  run(`state.tasks = normalizeTasks([{ id: "carryover", title: "週をまたぐTask",
    minutes: 40, completedMinutes: 12, quadrant: "notUrgentImportant", priority: 2,
    plannedDate: "2026-09-04", accumulatedSeconds: 45,
    subtasks: [{ id: "part-1", title: "済んだ準備", done: true }, { id: "part-2", title: "残り" }]
  }]); ensureDailyPlan(); saveState()`);
  const before = snapshot().tasks[0];
  now = Date.parse("2026-09-13T16:00:00.000Z");
  reload();
  assert.deepEqual(todayIds(), ["carryover"]);
  assert.deepEqual(snapshot().tasks[0], before);
  assert.equal(run("getWorkItemPlannableMinutes(getTodayOrderedWorkItems()[0])"), 28);
  run("saveState()");
  reload();
  assert.deepEqual(todayIds(), ["carryover"]);
  assert.deepEqual(snapshot().tasks[0], before);
});

test("未来予定はその日まで今日に入らず、予定日を過ぎると今日に残る", () => {
  run(`state.tasks = normalizeTasks([{ id: "future", title: "指定日から開始", plannedDate: "2026-09-08" }]); saveState()`);
  assert.deepEqual(todayIds(), []);
  now = Date.parse("2026-09-07T14:59:00.000Z"); // JST 9月7日23:59
  reload();
  assert.deepEqual(todayIds(), []);
  now += 120_000;
  assert.deepEqual(todayIds(), ["future"]);
  now = Date.parse("2026-09-10T15:05:00.000Z");
  reload();
  assert.deepEqual(todayIds(), ["future"]);
  assert.equal(snapshot().tasks[0].plannedDate, "2026-09-08");
});

test("今日に残ったTaskを完了すると翌日以降に再表示せず、完了データは保持する", () => {
  run(`state.tasks = normalizeTasks([{ id: "finished", title: "片づけた用事", plannedDate: "2026-09-05", minutes: 15 }]); saveState()`);
  assert.deepEqual(todayIds(), ["finished"]);
  click("complete-task", { taskId: "finished" });
  assert.deepEqual(todayIds(), []);
  const completed = snapshot().tasks[0];
  assert.equal(completed.status, "done");
  assert.equal(completed.completedMinutes, 15);
  now = Date.parse("2026-09-09T15:05:00.000Z");
  reload();
  assert.deepEqual(todayIds(), []);
  assert.deepEqual(snapshot().tasks[0], completed);
});

test("棚上げした未着手Taskは翌日も今日に戻らず、戻すとその日の今日へ復帰する", () => {
  draft("いったん棚上げする用事", "33");
  click("add-task");
  const before = snapshot().tasks[0];
  click("shelve-task", { taskId: before.id });
  assert.deepEqual(todayIds(), []);
  assert.equal(snapshot().tasks[0].status, "shelved");
  assert.equal(snapshot().tasks[0].title, before.title);
  assert.equal(snapshot().tasks[0].minutes, before.minutes);
  assert.ok(!snapshot().dailyPlan.workOrderIds.includes(before.id));
  now = Date.parse("2026-09-08T15:05:00.000Z");
  reload();
  assert.deepEqual(todayIds(), []);
  assert.equal(snapshot().tasks.length, 1);
  click("restore-task", { taskId: before.id });
  assert.deepEqual(todayIds(), [before.id]);
  assert.equal(snapshot().tasks[0].status, "active");
  assert.equal(snapshot().tasks[0].plannedDate, "2026-09-09");
  assert.equal(snapshot().tasks[0].shelvedAt, null);
  reload();
  assert.deepEqual(todayIds(), [before.id]);
});

test("残りを残したTaskも棚上げでき、翌日以降の復帰で残り秒数・進捗・小Taskを失わない", () => {
  run(`state.tasks = normalizeTasks([{ id: "paused", title: "途中の学習", plannedDate: "2026-09-05",
    minutes: 30, completedMinutes: 10, accumulatedSeconds: 95, pausedRemainingSeconds: 505,
    pausedSegmentMinutes: 10, pausedAt: "2026-09-05T12:00:00.000Z", pausedAllocationId: "segment-a",
    subtasks: [{ id: "step", title: "途中の問題", done: false }]
  }]); ensureDailyPlan(); saveState()`);
  const before = snapshot().tasks[0];
  assert.deepEqual(todayIds(), ["paused"]);
  click("shelve-task", { taskId: "paused" });
  assert.deepEqual(todayIds(), []);
  now = Date.parse("2026-09-10T15:05:00.000Z");
  reload();
  assert.deepEqual(todayIds(), []);
  click("restore-task", { taskId: "paused" });
  reload();
  assert.deepEqual(todayIds(), ["paused"]);
  const restored = snapshot().tasks[0];
  for (const field of ["id", "title", "minutes", "completedMinutes", "accumulatedSeconds", "pausedRemainingSeconds", "pausedSegmentMinutes", "pausedAt", "pausedAllocationId", "subtasks"]) {
    assert.deepEqual(restored[field], before[field], field);
  }
  assert.equal(restored.plannedDate, "2026-09-11");
  assert.equal(run("getTaskPausedSeconds(getTodayOrderedWorkItems()[0])"), 505);
});

test("未予定のまま棚上げされた古いTaskも、戻すと今日に入り翌日へ残る", () => {
  run(`state.tasks = normalizeTasks([{ id: "old-shelf", title: "古い棚上げ", status: "shelved" }]); saveState()`);
  click("restore-task", { taskId: "old-shelf" });
  assert.deepEqual(todayIds(), ["old-shelf"]);
  assert.equal(snapshot().tasks[0].plannedDate, "2026-09-06");
  now = Date.parse("2026-09-06T15:05:00.000Z");
  reload();
  assert.deepEqual(todayIds(), ["old-shelf"]);
});

for (const pausedRemainingSeconds of [null, 505]) {
  test(`今日の${pausedRemainingSeconds ? "中断中" : "未着手"}Taskに棚上げボタンを表示する`, () => {
    run(`state.tasks = normalizeTasks([{ id: "card", title: "今日のカード", plannedDate: "2026-09-05", pausedRemainingSeconds: ${pausedRemainingSeconds} }])`);
    const html = run("renderTodayWorkItem(getTodayOrderedWorkItems()[0], 0)");
    assert.match(html, /data-action="shelve-task"/);
    assert.match(html, /data-task-id="card"/);
    assert.match(html, />棚上げ<\/button>/);
    assert.doesNotMatch(html, /data-action="toggle-work-today"/);
  });
}

test("今日の習慣には引き続き今日から外す操作を表示する", () => {
  const html = run(`renderTodayWorkItem({ id: "goal:habit", sourceId: "habit", kind: "goal", title: "毎日の習慣", minutes: 10, quadrant: "notUrgentImportant", isHabit: true }, 0)`);
  assert.match(html, /data-action="toggle-work-today"/);
  assert.match(html, />今日から外す<\/button>/);
  assert.doesNotMatch(html, /data-action="shelve-task"/);
});

test("今日の棚上げ一覧から残り時間を確認して今日に戻せる", () => {
  assert.doesNotMatch(run("renderTodayView()"), /data-action="toggle-shelved-tasks"/);
  draft("棚から戻す用事", "18");
  click("add-task");
  const id = snapshot().tasks[0].id;
  click("shelve-task", { taskId: id });
  assert.match(run("renderTodayView()"), /data-action="toggle-shelved-tasks"/);
  assert.doesNotMatch(run("renderTodayView()"), /data-action="restore-task"/);
  click("toggle-shelved-tasks");
  const html = run("renderTodayView()");
  assert.match(html, /棚から戻す用事/);
  assert.match(html, /残り 18分/);
  assert.match(html, /data-action="restore-task"/);
  assert.match(html, />今日に戻す<\/button>/);
  click("restore-task", { taskId: id });
  assert.deepEqual(todayIds(), [id]);
  assert.doesNotMatch(run("renderTodayView()"), /data-action="toggle-shelved-tasks"/);
});

test("同じ保存ボタンの連続操作では入力を二重追加しない", () => {
  draft("一度だけ");
  click("add-task");
  click("add-task");
  assert.equal(snapshot().tasks.length, 1);
});

for (const composer of [false, true]) {
  test(`${composer ? "4象限" : "今日"}のIME変換確定では追加せず、次のEnterで1件追加`, () => {
    if (composer) {
      click("set-today-mode", { mode: "organize" });
      click("open-task-composer", { quadrant: "notUrgentImportant" });
    }
    draft("日本語を入力");
    assert.deepEqual(plain(`pressTaskKey({ isComposing: true, composer: ${composer} })`), { clicks: 0, prevented: 0 });
    assert.deepEqual(plain(`pressTaskKey({ keyCode: 229, composer: ${composer} })`), { clicks: 0, prevented: 0 });
    assert.equal(snapshot().tasks.length, 0);
    assert.equal(plain("ui.taskDraft").title, "日本語を入力");
    assert.deepEqual(plain(`pressTaskKey({ composer: ${composer} })`), { clicks: 1, prevented: 1 });
    assert.equal(snapshot().tasks.length, 1);
    assert.equal(todayIds().length, 1);
  });
}

test("Enter以外のキーはTaskを送信しない", () => {
  draft("まだ入力中");
  assert.deepEqual(plain('pressTaskKey({ key: "a", keyCode: 65 })'), { clicks: 0, prevented: 0 });
  assert.equal(snapshot().tasks.length, 0);
});

test("4象限の分数は空き時間を基準にし、今日の予定は残り時間だけを集計する", () => {
  run(`state.tasks = normalizeTasks([
    { id: "today", title: "今日の学習", minutes: 30, completedMinutes: 5, quadrant: "notUrgentImportant", plannedDate: "2026-09-06" },
    { id: "later", title: "将来の学習", minutes: 120, quadrant: "notUrgentImportant" }
  ]); state.dailyPlan.slots = [{ id: "two-hours", start: "19:00", end: "21:00" }]`);
  const html = run("renderTaskQuadrantBoard(groupActiveWorkItemsByQuadrant())");
  for (const label of ["今日の空き120分", "目安 30% · 約36分", "目安 50% · 約60分", "目安 20% · 約24分", "目安 0% · 約0分", "今日の予定 25分"]) {
    assert.ok(html.includes(label), label);
  }
  assert.ok(!html.includes("今日の予定 145分"));
  assert.match(html, /数値は書籍の指定ではありません/);
  assert.match(html, /休息・運動/);
});

test("4象限・Reviewは目標0件、Task0件でもNaNやInfinityを表示しない", () => {
  const html = run("renderTaskQuadrantBoard(groupActiveWorkItemsByQuadrant()) + renderReviewView()");
  assert.doesNotMatch(html, /NaN|Infinity|undefined/);
  assert.match(html, /目安 50% · 約30分/);
  assert.match(html, /育てる · 目安50%/);
});

test("Reviewの育てる割合は実行秒数を使い、予定分数で水増ししない", () => {
  const html = run(`renderAllocationReview([
    { date: "2026-09-06", quadrant: "notUrgentImportant", elapsedSeconds: 600, plannedSeconds: 3000 },
    { date: "2026-09-06", quadrant: "urgentImportant", elapsedSeconds: 1800, plannedSeconds: 1800 }
  ])`);
  assert.match(html, /<strong>25%<\/strong>/);
  assert.doesNotMatch(html, /NaN|Infinity/);
});

test("正しいバックアップはsetup・Task・0件の目標を復元し、実際に保存できる", () => {
  draft("バックアップのTask", "17");
  click("add-task");
  run('state.setup.minimumExample = "復元した設定"; state.meta.backupMarker = "kept"; saveState()');
  const backup = snapshot();
  run("resetWorkflow()");
  draft("復元前のTask");
  click("add-task");
  restore(backup);
  assert.equal(messages.at(-1), "データを復元しました。");
  assert.equal(reads, 1);
  assert.equal(snapshot().setup.minimumExample, "復元した設定");
  assert.equal(snapshot().meta.backupMarker, "kept");
  assert.deepEqual(snapshot().tasks.map((task) => task.title), ["バックアップのTask"]);
  assert.equal(snapshot().tasks[0].minutes, 17);
  assert.deepEqual(snapshot().goals, []);
  reload();
  assert.deepEqual(snapshot().goals, []);
  assert.deepEqual(plain("getTodayOrderedWorkItems().map((item) => item.title)"), ["バックアップのTask"]);
});

test("旧形式のバックアップも、実データの目標名で復元する", () => {
  const backup = snapshot();
  delete backup.goals;
  backup.setup.goal = "復元する実際の目標";
  backup.logs = [];
  restore(backup);
  assert.equal(messages.at(-1), "データを復元しました。");
  assert.equal(snapshot().goals.length, 1);
  assert.equal(snapshot().goals[0].setup.goal, "復元する実際の目標");
});

for (const [label, invalid] of [
  ["壊れたJSON", "{ broken"], ["null", "null"], ["配列ルート", "[]"],
  ["setup欠落", "{}"], ["setup=null", '{"setup":null}'],
  ["setup文字列", '{"setup":"invalid"}'], ["setup配列", '{"setup":[]}'],
  ["目標データ破損", '{"setup":{"goal":"破損した復元データ"},"goals":[null]}'],
]) {
  test(`${label}は復元を拒否し、現在の状態と保存内容を保持する`, () => {
    draft("消えてはいけないTask");
    click("add-task");
    const before = snapshot();
    const savedBefore = [...storage];
    restore(invalid);
    assert.equal(messages.at(-1), "ファイルの読み込みに失敗しました。");
    assert.deepEqual(snapshot(), before);
    assert.deepEqual([...storage], savedBefore);
  });
}

test("タイマー実行中は復元用ファイルを読まず、現在のTaskを守る", () => {
  draft("集中しているTask");
  click("add-task");
  const backup = snapshot();
  run('state.activeSession = { type: "task", taskId: state.tasks[0].id, startedAt: Date.now(), endsAt: Date.now() + 60000 }');
  const before = snapshot();
  restore(backup);
  assert.equal(reads, 0);
  assert.equal(messages.at(-1), "タイマーを終了してからデータを復元してください。");
  assert.deepEqual(snapshot(), before);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

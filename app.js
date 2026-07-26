// =========================================================
// SUPABASE 設定
// =========================================================
const SUPABASE_URL = "https://kyzyyciutnkhaxadwdlx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8BS-Guu8UUfb3sEHRfHGRg_vTvB0FyB";

// supabase.js が読み込めなくてもアプリ本体は必ず起動させる（ローカルデータで動作）
function createSupabaseStub() {
  const offlineError = { message: "オフラインのため利用できません" };
  const query = {
    select() { return this; },
    eq() { return this; },
    single() { return Promise.resolve({ data: null, error: offlineError }); },
    upsert() { return Promise.resolve({ data: null, error: offlineError }); },
  };
  return {
    __stub: true,
    auth: {
      onAuthStateChange(callback) {
        setTimeout(() => callback("INITIAL_SESSION", null), 0);
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async getUser() { return { data: { user: null } }; },
      async signInWithPassword() { return { error: offlineError }; },
      async signUp() { return { error: offlineError }; },
      async resetPasswordForEmail() { return { error: offlineError }; },
      async signOut() { return { error: null }; },
    },
    functions: {
      async invoke() { return { data: null, error: offlineError }; },
    },
    from() { return query; },
    channel() { return { on() { return this; }, subscribe() { return this; } }; },
    removeChannel() {},
  };
}

const sb = (() => {
  try {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storageKey: "streakbonsai-auth-v1",
      },
    });
  } catch (err) {
    console.warn("Supabase unavailable, running local-only:", err);
    return createSupabaseStub();
  }
})();

const APP_BUILD = "20260725c 新規Taskは育てるへ";
const STORAGE_KEY = "tomosu-state-v1";
const CURRENT_STORAGE_KEY = "streakgarden-state-v1";
const LEGACY_STORAGE_KEYS = [STORAGE_KEY];
const TASK_DEFAULT_MINUTES = 5;
const TIME_SNAP_MINUTES = 5;
const AVAILABILITY_DAY_MINUTES = 24 * 60;
const INLINE_AVAILABILITY_DRAG_STEP_PX = 7;
const MAX_AVAILABILITY_SLOTS = 8;
const DEFAULT_AVAILABILITY_SLOTS = [
  { id: "availability-evening", start: "20:00", end: "21:00" },
];
const TASK_QUADRANT_DEFAULT = "inbox";
// 新規Taskの初期象限。書き留めた時点で「やるつもりだが今すぐではない」＝重要・非緊急とみなす。
// 未整理に入れると4象限ボードの最下部へ埋もれて見失うため、最初から育てるへ置く。
const TASK_QUADRANT_NEW = "notUrgentImportant";
const TASK_QUADRANTS = [
  {
    key: "urgentImportant",
    title: "緊急×重要",
    concept: "今やる",
    frameworkLabel: "ビッグロック",
    axis: "緊急度 高 / 重要度 高",
    target: 30,
    defaultMinutes: 30,
    note: "今やる。時間は決める",
  },
  {
    key: "notUrgentImportant",
    title: "重要・非緊急",
    concept: "育てる",
    frameworkLabel: "未来投資",
    axis: "緊急度 低 / 重要度 高",
    target: 50,
    defaultMinutes: 45,
    note: "先に予定を押さえる",
  },
  {
    key: "urgentNotImportant",
    title: "緊急・低重要",
    concept: "軽くする",
    frameworkLabel: "小石",
    axis: "緊急度 高 / 重要度 低",
    target: 20,
    defaultMinutes: 10,
    note: "任せる・軽くする",
  },
  {
    key: "notUrgentNotImportant",
    title: "低重要・非緊急",
    concept: "手放す",
    frameworkLabel: "砂・水",
    axis: "緊急度 低 / 重要度 低",
    target: 0,
    defaultMinutes: 5,
    note: "削る・保留する",
  },
];
const TASK_QUADRANT_KEYS = TASK_QUADRANTS.map((quadrant) => quadrant.key);
const PLAN_RANK = { C: 1, B: 2, A: 3 };
const PLAN_META = {
  A: { label: "標準", tag: "通常" },
  B: { label: "短め", tag: "短縮" },
  C: { label: "最小", tag: "救済" },
};
const REPLAN_MODES = {
  lighten_today: "今日を軽くする",
  reset_week: "今週を立て直す",
  break_goal: "目標を分解する",
  retarget_goal: "目標を更新する",
  consult_block: "詰まりを相談する",
};
const SETUP_SECTIONS = {
  home: {
    label: "設定",
    hint: "目標と集中環境",
    title: "設定",
    copy: "目標と集中環境を整えます。",
  },
  detail: {
    label: "目標設定",
    hint: "目標ごとに編集",
    title: "目標設定",
    copy: "目標に必要な設定をまとめて編集します。",
  },
  goal: {
    label: "目標編集",
    hint: "登録済みを直す",
    title: "目標編集",
    copy: "登録済みの目標をここで編集します。",
  },
  schedule: {
    label: "実施時間",
    hint: "いつ動くか",
    title: "実施時間",
    copy: "曜日ごとに、取りかかる時間だけをここで整えます。",
  },
  plan: {
    label: "分数",
    hint: "何分やるか",
    title: "分数",
    copy: "1回に集中する時間だけを決めます。",
  },
};
const ROADMAP_TARGETS = {
  goal: 100,
  checkpoint: 70,
  foundation: 52,
  week: 42,
  next: 28,
};
const ROADMAP_ID_ORDER = ["goal", "checkpoint", "foundation", "week", "next"];
const WEEKDAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// 植物・盆栽の種類キー。描画機能は廃止済みで、保存データ(flowerType/bonsaiKey)の
// 検証と互換性維持のためにキーだけ残している。
const FLOWER_LIBRARY = { ume: {}, sakura: {}, satsuki: {} };
const BONSAI_LIBRARY = { pine: {}, maple: {}, moss: {} };


// 目標ごとの識別色。テーマに馴染む深めの8色から、目標IDのハッシュで安定的に割り当てる。
// 同じ花/盆栽を選んでいても目標ごとに色が変わるので、表示中の目標が一目で分かる。
const GOAL_COLOR_PALETTE = [
  "#c2562f", // テラコッタ
  "#4e7a65", // 若葉
  "#a67c1f", // 金茶
  "#4c6e88", // 藍
  "#8a4f6b", // 梅紫
  "#2f7d78", // 青緑
  "#a85a3c", // 赤土
  "#667238", // 苔緑
];

function getGoalSignatureColor(goalOrId) {
  const id = typeof goalOrId === "string" ? goalOrId : (goalOrId && goalOrId.id) || "";
  if (!id) {
    return GOAL_COLOR_PALETTE[0];
  }
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return GOAL_COLOR_PALETTE[hash % GOAL_COLOR_PALETTE.length];
}

function hexToRgba(hex, alpha = 1) {
  const h = String(hex).replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const screenRoot = document.querySelector("#screen-root");
const screenFrame = document.querySelector(".screen-frame");
const todayLabel = document.querySelector("#today-label");
const setupShortcut = document.querySelector("#setup-shortcut");
const bottomNav = document.querySelector("#bottom-nav");
const tabbarButtons = Array.from(document.querySelectorAll(".tabbar__item"));
const sessionSheet = document.querySelector("#session-sheet");
const toastEl = document.querySelector("#toast");

let state = loadState();
let ui = {
  todayMode: "execution",
  setupDraft: null,
  setupMode: "edit",
  setupSection: "home",
  appShieldStatus: {
    available: Boolean(window.webkit?.messageHandlers?.appShield),
    enabled: null,
    authorized: null,
    allowedAppCount: 0,
  },
  goalLibraryDraft: null,
  deleteConfirmGoalId: null,
  roadmapDraft: null,
  reviewLogDraft: null,
  reviewLogExpanded: false,
  reviewGoalFilter: "all",
  reviewRangeDays: 7,
  taskDraft: { title: "", minutes: String(TASK_DEFAULT_MINUTES) },
  taskShowShelved: false,
  taskDragId: null,
  taskDragBeforeId: null,
  taskPointerDrag: null,
  taskSuppressClickUntil: 0,
  taskSubtaskDrafts: {},
  taskEditRenderTimer: null,
  selectedTaskId: null,
  todayPlannerOpen: true,
  planPointerDrag: null,
  availabilityDraft: null,
  availabilityPointerDrag: null,
  availabilityMode: "default",
  availabilityReturnView: "setup",
  focusLockHelp: null,
  pendingFocusStart: null,
  sessionOpen: false,
  selectedSessionPlan: "A",
  finishDraft: null,
  showAbortConfirm: false,
  toastTimer: null,
  clockTimer: null,
  sessionTimer: null,
};

// init() は Supabase auth 解決後に呼ばれます（ファイル末尾参照）

function buildInitialPlanTuning() {
  return {
    defaultPlanByDay: {},
    rescuePrimaryDays: [],
  };
}

function buildInitialReplan() {
  return {
    mode: "lighten_today",
    text: "",
    preview: [],
    goalDraft: "",
    currentLevelDraft: "",
    missionDraft: "",
    weekDraft: "",
    nextDraft: "",
  };
}

function cloneData(value) {
  if (value == null) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

function createLogId() {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeLogEntry(entry = {}, index = 0) {
  const nextEntry = cloneData(entry) || {};
  const parsedRecordedAt = new Date(nextEntry.recordedAt || "");
  const recordedAt = Number.isNaN(parsedRecordedAt.getTime()) ? new Date().toISOString() : parsedRecordedAt.toISOString();
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(String(nextEntry.date || ""))
    ? String(nextEntry.date)
    : toISODate(new Date(recordedAt));
  const fallbackId = `${recordedAt}-${index}`.replace(/[^a-zA-Z0-9_-]+/g, "-");
  const elapsedSeconds = Number(nextEntry.elapsedSeconds);
  const plannedSeconds = Number(nextEntry.plannedSeconds);

  return {
    ...nextEntry,
    logId: nextEntry.logId || `log-${fallbackId}`,
    date: dateValue,
    recordedAt,
    elapsedSeconds: Number.isFinite(elapsedSeconds) ? elapsedSeconds : nextEntry.elapsedSeconds,
    plannedSeconds: Number.isFinite(plannedSeconds) ? plannedSeconds : nextEntry.plannedSeconds,
  };
}

function normalizeLogs(logs = []) {
  return (Array.isArray(logs) ? logs : [])
    .map((entry, index) => normalizeLogEntry(entry, index))
    .sort((left, right) => new Date(left.recordedAt) - new Date(right.recordedAt));
}

function inferDefaultFlowerType(setup = {}) {
  const goalText = `${setup.goal || ""} ${setup.currentLevel || ""}`.toLowerCase();
  if (/始|最初|まず|first|week|週|1週/.test(goalText)) {
    return "ume";
  }
  if (/試験|受験|発表|本番|プレゼン|面接|提出|exam|test/.test(goalText)) {
    return "sakura";
  }
  return "satsuki";
}

function normalizeFlowerType(flowerType, setup = {}) {
  // Migrate old flower type keys
  const migrate = { tulip: "ume", sunflower: "sakura", lavender: "satsuki" };
  const resolved = migrate[flowerType] || flowerType;
  return FLOWER_LIBRARY[resolved] ? resolved : inferDefaultFlowerType(setup);
}

function normalizeStudyDays(studyDays) {
  if (!Array.isArray(studyDays)) {
    return [...WEEKDAY_KEYS];
  }

  const selected = new Set(studyDays);
  return WEEKDAY_KEYS.filter((key) => selected.has(key));
}

function getSharedStudyDays(leftDays, rightDays) {
  const rightSet = new Set(normalizeStudyDays(rightDays));
  return normalizeStudyDays(leftDays).filter((key) => rightSet.has(key));
}

function isGoalScheduledForDate(goalOrSetup, date = new Date()) {
  const setup = goalOrSetup && goalOrSetup.setup ? goalOrSetup.setup : goalOrSetup;
  return normalizeStudyDays(setup.studyDays).includes(weekdayKeyFromDate(date));
}

function formatStudyDays(studyDays) {
  const days = normalizeStudyDays(studyDays);

  if (!days.length) {
    return "未設定";
  }
  if (days.length === WEEKDAY_KEYS.length) {
    return "毎日";
  }
  if (days.join(",") === "Mon,Tue,Wed,Thu,Fri") {
    return "平日";
  }
  if (days.join(",") === "Sat,Sun") {
    return "土日";
  }

  return days.map((key) => weekdayShortLabel(key)).join(" ");
}

function toggleStudyDay(studyDays, weekdayKey) {
  const days = normalizeStudyDays(studyDays);
  return days.includes(weekdayKey)
    ? days.filter((key) => key !== weekdayKey)
    : normalizeStudyDays([...days, weekdayKey]);
}

function normalizeOptionalDate(value) {
  return String(value || "").trim();
}

function formatDeadlineBadge(deadline) {
  const normalized = normalizeOptionalDate(deadline);
  return normalized ? `期限 ${normalized}` : "期限なし";
}

function getExecutionDatesFromLogs(logs = []) {
  const executed = logs
    .filter((entry) => isExecutionOutcome(entry.outcome))
    .map((entry) => entry.date);
  return [...new Set(executed)].sort();
}

function getRecentHabitSlots(logs, studyDays, limit = 7) {
  const days = normalizeStudyDays(studyDays);
  const today = new Date();
  const slots = [];
  for (let i = 0; i < 56 && slots.length < limit; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dayKey = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    if (!days.includes(dayKey)) continue;
    const ds = toISODate(d);
    const log = (Array.isArray(logs) ? logs : []).find(l => l.date === ds);
    const done = Boolean(log && log.outcome !== "miss" && log.outcome !== "none");
    slots.unshift({ done, isToday: i === 0, dayKey, date: ds });
  }
  while (slots.length < limit) slots.unshift({ done: false, isToday: false, filler: true });
  return slots;
}

function weekdayShortLabel(key) {
  return weekdayLabel(key).slice(0, 1);
}

function renderHabitHistory(logs, studyDays) {
  const slots = getRecentHabitSlots(logs, studyDays);
  const completed = slots.filter((slot) => slot.done).length;

  return `
    <div class="habit-history" aria-label="直近7回の実行状況。完は完了、未は未完了です。">
      <div class="habit-history__head">
        <span>直近7回</span>
        <span>${completed}/7 完了</span>
      </div>
      <div class="habit-history__days">
        ${slots.map((slot) => {
          if (slot.filler) {
            return `
              <span class="habit-history__day is-empty" aria-hidden="true">
                <span class="habit-history__weekday">-</span>
                <span class="habit-history__state">-</span>
              </span>
            `;
          }
          const statusText = slot.done ? "完" : "未";
          return `
            <span class="habit-history__day ${slot.done ? "is-done" : "is-miss"} ${slot.isToday ? "is-today" : ""}" title="${escapeHtml(`${slot.date} ${weekdayLabel(slot.dayKey)} ${slot.done ? "完了" : "未完了"}`)}">
              <span class="habit-history__weekday">${escapeHtml(weekdayShortLabel(slot.dayKey))}</span>
              <span class="habit-history__state">${statusText}</span>
            </span>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderStreakDots(logs, studyDays) {
  const slots = getRecentHabitSlots(logs, studyDays);
  return `<span class="streak-dots">${slots.map(s =>
    `<span class="streak-dot${s.done ? " is-done" : ""}${s.isToday ? " is-today" : ""}${s.filler ? " is-filler" : ""}"></span>`
  ).join("")}</span>`;
}

function createGoalId() {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createSubtaskId() {
  return `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeTaskMinutes(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) {
    return TASK_DEFAULT_MINUTES;
  }
  return Math.max(1, Math.min(240, Math.round(minutes)));
}

function normalizeTaskQuadrant(value) {
  if (value === TASK_QUADRANT_DEFAULT || TASK_QUADRANT_KEYS.includes(value)) {
    return value;
  }
  return TASK_QUADRANT_DEFAULT;
}

function normalizeTaskSubtask(subtask = {}) {
  const now = new Date().toISOString();
  const title = String(subtask.title || "").trim();
  const done = Boolean(subtask.done || subtask.completedAt);

  return {
    id: subtask.id || createSubtaskId(),
    title: title || "小さなTask",
    done,
    createdAt: subtask.createdAt || now,
    updatedAt: subtask.updatedAt || subtask.createdAt || now,
    completedAt: done ? (subtask.completedAt || now) : null,
  };
}

function normalizeTaskSubtasks(subtasks) {
  return Array.isArray(subtasks)
    ? subtasks.map(normalizeTaskSubtask).filter((subtask) => subtask.title)
    : [];
}

function normalizeTask(task = {}) {
  const now = new Date().toISOString();
  const title = String(task.title || "").trim();
  const status = ["active", "shelved", "done"].includes(task.status)
    ? task.status
    : "active";
  const rawPausedRemainingSeconds = Number(task.pausedRemainingSeconds);
  const pausedRemainingSeconds = status !== "done"
    && Number.isFinite(rawPausedRemainingSeconds)
    && rawPausedRemainingSeconds > 0
      ? Math.max(1, Math.min(240 * 60, Math.ceil(rawPausedRemainingSeconds)))
      : null;
  const minutes = normalizeTaskMinutes(task.minutes);
  const completedMinutes = Math.max(
    0,
    Math.min(minutes, Math.round(Number(task.completedMinutes) || 0)),
  );
  const accumulatedSeconds = Math.max(0, Number(task.accumulatedSeconds) || 0);
  const remainingMinutes = Math.max(1, minutes - completedMinutes);
  const pausedSegmentMinutes = pausedRemainingSeconds
    ? Math.max(
        1,
        Math.min(
          remainingMinutes,
          Math.round(Number(task.pausedSegmentMinutes))
            || Math.ceil((pausedRemainingSeconds + accumulatedSeconds) / 60),
        ),
      )
    : null;

  return {
    id: task.id || createTaskId(),
    title: title || "無題のTask",
    minutes,
    completedMinutes,
    status,
    quadrant: normalizeTaskQuadrant(task.quadrant),
    priority: task.priority !== null && task.priority !== "" && Number.isFinite(Number(task.priority)) ? Number(task.priority) : null,
    plannedDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.plannedDate || "")) ? String(task.plannedDate) : "",
    sourceGoalId: String(task.sourceGoalId || ""),
    sourceGoalPlanKey: String(task.sourceGoalPlanKey || ""),
    accumulatedSeconds,
    plannedSeconds: Math.max(1, Number(task.plannedSeconds) || normalizeTaskMinutes(task.minutes) * 60),
    createdAt: task.createdAt || now,
    updatedAt: task.updatedAt || task.createdAt || now,
    completedAt: task.completedAt || null,
    shelvedAt: task.shelvedAt || null,
    lastStartedAt: task.lastStartedAt || null,
    pausedRemainingSeconds,
    pausedSegmentMinutes,
    pausedAt: pausedRemainingSeconds ? (task.pausedAt || now) : null,
    pausedAllocationId: pausedRemainingSeconds ? String(task.pausedAllocationId || "") : "",
    subtasks: normalizeTaskSubtasks(task.subtasks),
  };
}

function normalizeTasks(tasks) {
  return Array.isArray(tasks) ? tasks.map(normalizeTask) : [];
}

function migrateLegacyTaskSources(tasks, goals) {
  const candidates = Array.isArray(goals) ? goals : [];
  return normalizeTasks(tasks).map((task) => {
    if (task.sourceGoalId || getTaskPausedSeconds(task) <= 0) return task;
    const matchingGoal = candidates.find((goal) => (
      String(goal?.setup?.goal || goal?.title || "").trim() === task.title
    ));
    if (!matchingGoal) return task;
    return normalizeTask({
      ...task,
      sourceGoalId: matchingGoal.id,
      sourceGoalPlanKey: "A",
      quadrant: normalizeGoalQuadrant(matchingGoal.setup?.quadrant),
      plannedDate: task.plannedDate || toISODate(new Date()),
      plannedSeconds: Math.max(task.plannedSeconds, getGoalDurationMinutes(matchingGoal) * 60),
    });
  });
}

function normalizeGoalContinuation(continuation = {}) {
  const remainingSeconds = Number(continuation.remainingSeconds ?? continuation.pausedRemainingSeconds);
  if (!Number.isFinite(remainingSeconds) || remainingSeconds <= 0) {
    return null;
  }

  const normalizedRemaining = Math.max(1, Math.min(240 * 60, Math.ceil(remainingSeconds)));
  const accumulatedSeconds = Math.max(0, Math.round(Number(continuation.accumulatedSeconds) || 0));
  const plannedSeconds = Math.max(
    normalizedRemaining + accumulatedSeconds,
    Math.round(Number(continuation.plannedSeconds) || 0),
  );

  return {
    remainingSeconds: normalizedRemaining,
    accumulatedSeconds,
    plannedSeconds,
    planKey: ["A", "B", "C"].includes(continuation.planKey) ? continuation.planKey : "A",
    pausedAt: continuation.pausedAt || new Date().toISOString(),
  };
}

function normalizeGoalContinuations(continuations) {
  if (!continuations || typeof continuations !== "object" || Array.isArray(continuations)) {
    return {};
  }

  return Object.entries(continuations).reduce((result, [goalId, continuation]) => {
    const normalized = normalizeGoalContinuation(continuation);
    if (goalId && normalized) {
      result[goalId] = normalized;
    }
    return result;
  }, {});
}

function getGoalContinuationDate(continuation) {
  const pausedAt = new Date(continuation?.pausedAt || "");
  return Number.isNaN(pausedAt.getTime()) ? "" : toISODate(pausedAt);
}

// 保留した残り時間は保留した当日だけ有効。日付が変わったら習慣・目標とも破棄する。
function filterStaleContinuations(continuations, referenceDate = new Date()) {
  const today = toISODate(referenceDate);
  return Object.entries(normalizeGoalContinuations(continuations)).reduce(
    (result, [goalId, continuation]) => {
      if (getGoalContinuationDate(continuation) === today) {
        result[goalId] = continuation;
      }
      return result;
    },
    {},
  );
}

function expireStaleContinuations(referenceDate = new Date()) {
  const previous = normalizeGoalContinuations(state.goalContinuations);
  const current = filterStaleContinuations(previous, referenceDate);
  const expiredCount = Object.keys(previous).length - Object.keys(current).length;
  state.goalContinuations = current;
  return expiredCount;
}

function migrateLegacyGoalContinuations(tasks, goals, continuations) {
  const candidates = Array.isArray(goals) ? goals : [];
  const goalIds = new Set(candidates.map((goal) => goal?.id).filter(Boolean));
  const nextContinuations = normalizeGoalContinuations(continuations);
  const nextTasks = [];

  migrateLegacyTaskSources(tasks, candidates).forEach((task) => {
    const remainingSeconds = getTaskPausedSeconds(task);
    if (!task.sourceGoalId || !goalIds.has(task.sourceGoalId) || remainingSeconds <= 0) {
      nextTasks.push(task);
      return;
    }

    const candidate = normalizeGoalContinuation({
      remainingSeconds,
      accumulatedSeconds: task.accumulatedSeconds,
      plannedSeconds: task.plannedSeconds,
      planKey: task.sourceGoalPlanKey,
      pausedAt: task.pausedAt,
    });
    const current = nextContinuations[task.sourceGoalId];
    const candidateTime = Date.parse(candidate?.pausedAt || "") || 0;
    const currentTime = Date.parse(current?.pausedAt || "") || 0;
    if (candidate && (!current || candidateTime >= currentTime)) {
      nextContinuations[task.sourceGoalId] = candidate;
    }
  });

  return {
    tasks: nextTasks,
    goalContinuations: nextContinuations,
  };
}

function ensureGoalContinuations() {
  state.goalContinuations = filterStaleContinuations(state.goalContinuations);
  return state.goalContinuations;
}

function getGoalContinuation(goalId) {
  if (!goalId) return null;
  return ensureGoalContinuations()[goalId] || null;
}

function setGoalContinuation(goalId, continuation) {
  const normalized = normalizeGoalContinuation(continuation);
  if (!goalId || !normalized) return null;
  const continuations = ensureGoalContinuations();
  continuations[goalId] = normalized;
  return normalized;
}

function clearGoalContinuation(goalId) {
  const continuations = ensureGoalContinuations();
  const current = continuations[goalId] || null;
  if (goalId && current) {
    delete continuations[goalId];
  }
  return current;
}

function createAvailabilitySlotId(prefix = "availability") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createPlanAllocationId() {
  return `allocation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function clockTimeToMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

function minutesToClockTime(value) {
  const minutes = Math.max(0, Math.min(1439, Math.round(Number(value) || 0)));
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function legacyCapacitySlots(capacityValue) {
  const capacity = Number.isFinite(Number(capacityValue))
    ? Math.max(15, Math.min(480, Math.round(Number(capacityValue) / 5) * 5))
    : 60;
  const endMinutes = 21 * 60;
  return [{
    id: "availability-evening",
    start: minutesToClockTime(endMinutes - capacity),
    end: minutesToClockTime(endMinutes),
  }];
}

function normalizeAvailabilitySlot(slot = {}, index = 0) {
  const startMinutes = clockTimeToMinutes(slot.start);
  const endMinutes = clockTimeToMinutes(slot.end);
  if (startMinutes === null || endMinutes === null || endMinutes - startMinutes < 5) {
    return null;
  }
  return {
    id: String(slot.id || createAvailabilitySlotId(`availability-${index + 1}`)),
    start: minutesToClockTime(startMinutes),
    end: minutesToClockTime(endMinutes),
  };
}

function normalizeAvailabilitySlots(slots, fallbackCapacity = 60) {
  const candidates = Array.isArray(slots) && slots.length
    ? slots
    : legacyCapacitySlots(fallbackCapacity);
  const normalized = candidates
    .slice(0, MAX_AVAILABILITY_SLOTS)
    .map(normalizeAvailabilitySlot)
    .filter(Boolean)
    .sort((left, right) => clockTimeToMinutes(left.start) - clockTimeToMinutes(right.start));
  const result = [];

  normalized.forEach((slot) => {
    const previous = result[result.length - 1];
    const rawStart = clockTimeToMinutes(slot.start);
    const end = clockTimeToMinutes(slot.end);
    const start = previous
      ? Math.max(rawStart, clockTimeToMinutes(previous.end))
      : rawStart;
    if (end - start < 5) return;
    result.push({ ...slot, start: minutesToClockTime(start) });
  });

  return result.length ? result : cloneData(DEFAULT_AVAILABILITY_SLOTS);
}

function getAvailabilitySlotMinutes(slot) {
  const start = clockTimeToMinutes(slot?.start);
  const end = clockTimeToMinutes(slot?.end);
  return start === null || end === null ? 0 : Math.max(0, end - start);
}

function getAvailabilityMinutes(slots) {
  return normalizeAvailabilitySlots(slots)
    .reduce((sum, slot) => sum + getAvailabilitySlotMinutes(slot), 0);
}

function normalizePlanAllocations(allocations, slots) {
  const slotMap = new Map((slots || []).map((slot) => [slot.id, slot]));
  const usedBySlot = new Map();
  const now = new Date().toISOString();

  return (Array.isArray(allocations) ? allocations : []).reduce((result, allocation) => {
    const slot = slotMap.get(String(allocation?.slotId || ""));
    const workId = String(allocation?.workId || "");
    if (!slot || !workId) return result;
    const used = usedBySlot.get(slot.id) || 0;
    const available = Math.max(0, getAvailabilitySlotMinutes(slot) - used);
    const minutes = Math.min(available, Math.max(0, Math.round(Number(allocation.minutes) || 0)));
    if (minutes < 1) return result;
    usedBySlot.set(slot.id, used + minutes);
    result.push({
      id: String(allocation.id || createPlanAllocationId()),
      workId,
      slotId: slot.id,
      minutes,
      createdAt: allocation.createdAt || now,
      completedAt: allocation.completedAt || null,
    });
    return result;
  }, []);
}

function normalizeWorkIdList(values) {
  return [...new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => String(value || ""))
      .filter(Boolean)
  )];
}

function snapScheduleMinute(value) {
  if (value === null || value === undefined || value === "") return null;
  const minute = Number(value);
  if (!Number.isFinite(minute)) return null;
  return Math.max(0, Math.min(
    1435,
    Math.round(minute / TIME_SNAP_MINUTES) * TIME_SNAP_MINUTES,
  ));
}

function normalizeScheduleStartTimes(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value).reduce((result, [workId, start]) => {
    const minute = snapScheduleMinute(clockTimeToMinutes(start));
    if (!workId || minute === null) return result;
    result[String(workId)] = minutesToClockTime(minute);
    return result;
  }, {});
}

function normalizeDailyPlan(plan = {}) {
  const today = toISODate(new Date());
  const defaultSlots = normalizeAvailabilitySlots(
    plan.defaultSlots,
    plan.capacityMinutes,
  );
  const isToday = String(plan.date || "") === today;
  const slots = normalizeAvailabilitySlots(
    isToday && Array.isArray(plan.slots) ? plan.slots : defaultSlots,
    getAvailabilityMinutes(defaultSlots),
  );
  const defaultStartTimes = normalizeScheduleStartTimes(plan.defaultStartTimes);

  return {
    date: today,
    capacityMinutes: getAvailabilityMinutes(slots),
    defaultSlots,
    slots,
    allocations: normalizePlanAllocations(isToday ? plan.allocations : [], slots),
    includedWorkIds: isToday ? normalizeWorkIdList(plan.includedWorkIds) : [],
    excludedWorkIds: isToday ? normalizeWorkIdList(plan.excludedWorkIds) : [],
    workOrderIds: isToday ? normalizeWorkIdList(plan.workOrderIds) : [],
    defaultStartTimes,
    startTimes: isToday ? normalizeScheduleStartTimes(plan.startTimes) : cloneData(defaultStartTimes),
  };
}

function ensureDailyPlan() {
  state.dailyPlan = normalizeDailyPlan(state.dailyPlan);
  reconcileDailyPlanSelections(state.dailyPlan);
  reconcileDailyPlanAllocations(state.dailyPlan);
  state.dailyPlan.capacityMinutes = getAvailabilityMinutes(state.dailyPlan.slots);
  return state.dailyPlan;
}

function isTaskPlannedToday(task, date = new Date()) {
  return String(task?.plannedDate || "") === toISODate(date);
}

function getTaskQuadrantMeta(quadrantKey) {
  return TASK_QUADRANTS.find((quadrant) => quadrant.key === quadrantKey) || null;
}

function getQuadrantColor(quadrantKey) {
  return {
    urgentImportant: "#c45b48",
    notUrgentImportant: "#327a62",
    urgentNotImportant: "#b4812c",
    notUrgentNotImportant: "#7b7d78",
    inbox: "#8a8176",
  }[quadrantKey] || "#8a8176";
}

const GOAL_WORK_PREFIX = "goal::";

function goalWorkId(goalId) {
  return `${GOAL_WORK_PREFIX}${goalId}`;
}

function isGoalWorkId(workId) {
  return String(workId || "").startsWith(GOAL_WORK_PREFIX);
}

function goalIdFromWorkId(workId) {
  return isGoalWorkId(workId) ? String(workId).slice(GOAL_WORK_PREFIX.length) : "";
}

function normalizeGoalQuadrant(value) {
  return TASK_QUADRANT_KEYS.includes(value) ? value : "notUrgentImportant";
}

function workItemPriority(item, fallback = 9999) {
  if (item?.priority === null || item?.priority === undefined || item?.priority === "") {
    return fallback;
  }
  const value = Number(item?.priority);
  return Number.isFinite(value) ? value : fallback;
}

function compareWorkItems(left, right) {
  const priorityGap = workItemPriority(left) - workItemPriority(right);
  if (priorityGap !== 0) return priorityGap;
  if (left.kind !== right.kind) return left.kind === "goal" ? -1 : 1;
  return String(left.createdAt || left.title || "").localeCompare(String(right.createdAt || right.title || ""), "ja");
}

function goalToWorkItem(goal, index = 0) {
  const continuation = getGoalContinuation(goal.id);
  return {
    id: goalWorkId(goal.id),
    sourceId: goal.id,
    kind: "goal",
    title: goal.setup?.goal || goal.title || "目標",
    minutes: getGoalDurationMinutes(goal),
    quadrant: normalizeGoalQuadrant(goal.setup?.quadrant),
    priority: goal.setup?.priority !== null && goal.setup?.priority !== "" && Number.isFinite(Number(goal.setup?.priority))
      ? Number(goal.setup.priority)
      : 100 + index,
    goal,
    isHabit: goal.setup?.goalType === "habit",
    plannedDate: isGoalScheduledForDate(goal) ? toISODate(new Date()) : "",
    pausedRemainingSeconds: continuation?.remainingSeconds || 0,
    accumulatedSeconds: continuation?.accumulatedSeconds || 0,
    plannedSeconds: continuation?.plannedSeconds || getGoalDurationMinutes(goal) * 60,
    subtasks: [],
  };
}

function taskToWorkItem(task) {
  return {
    ...task,
    kind: "task",
    sourceId: task.id,
    isHabit: false,
  };
}

function getActiveWorkItems() {
  const tasks = normalizeTasks(state.tasks)
    .filter((task) => task.status === "active")
    .map(taskToWorkItem);
  const goals = listGoals()
    .map(goalToWorkItem);
  return [...goals, ...tasks].sort(compareWorkItems);
}

function isWorkItemDefaultedToToday(item) {
  if (!item) return false;
  if (item.kind === "task") {
    return isTaskPlannedToday(item);
  }
  return isGoalScheduledForDate(item.goal);
}

function isWorkItemSelectedToday(item, plan = state.dailyPlan) {
  if (!item) return false;
  if (getTaskPausedSeconds(item) > 0) return true;
  const workId = String(item.id || "");
  if (normalizeWorkIdList(plan?.includedWorkIds).includes(workId)) return true;
  if (normalizeWorkIdList(plan?.excludedWorkIds).includes(workId)) return false;
  return isWorkItemDefaultedToToday(item);
}

function reconcileDailyPlanSelections(plan) {
  if (!plan) return plan;
  const activeItems = getActiveWorkItems();
  const validIds = new Set(activeItems.map((item) => item.id));
  plan.includedWorkIds = normalizeWorkIdList(plan.includedWorkIds)
    .filter((workId) => validIds.has(workId));
  plan.excludedWorkIds = normalizeWorkIdList(plan.excludedWorkIds)
    .filter((workId) => validIds.has(workId) && !plan.includedWorkIds.includes(workId));

  const selectedIds = new Set(
    activeItems
      .filter((item) => getWorkItemPlannableMinutes(item) > 0 && isWorkItemSelectedToday(item, plan))
      .map((item) => item.id)
  );
  plan.defaultStartTimes = Object.fromEntries(
    Object.entries(normalizeScheduleStartTimes(plan.defaultStartTimes))
      .filter(([workId]) => validIds.has(workId))
  );
  const previousAllocationOrder = (plan.allocations || []).map((allocation) => allocation.workId);
  const fallbackOrder = [...activeItems]
    .filter((item) => selectedIds.has(item.id))
    .sort((left, right) => {
      const leftStart = clockTimeToMinutes(plan.startTimes?.[left.id]);
      const rightStart = clockTimeToMinutes(plan.startTimes?.[right.id]);
      if (leftStart !== null && rightStart !== null && leftStart !== rightStart) return leftStart - rightStart;
      if (leftStart !== null && rightStart === null) return -1;
      if (leftStart === null && rightStart !== null) return 1;
      return compareWorkItems(left, right);
    })
    .map((item) => item.id);
  plan.workOrderIds = normalizeWorkIdList([
    ...normalizeWorkIdList(plan.workOrderIds),
    ...previousAllocationOrder,
    ...fallbackOrder,
  ]).filter((workId) => selectedIds.has(workId));
  plan.startTimes = Object.fromEntries(
    Object.entries(normalizeScheduleStartTimes(plan.startTimes))
      .filter(([workId]) => selectedIds.has(workId))
  );
  return plan;
}

function getTaskRemainingMinutes(task) {
  const normalized = normalizeTask(task);
  return Math.max(0, normalized.minutes - normalized.completedMinutes);
}

function getTaskPausedSegmentMinutes(task) {
  const normalized = normalizeTask(task);
  if (!normalized.pausedRemainingSeconds) return 0;
  return Math.min(
    getTaskRemainingMinutes(normalized),
    Math.max(1, Number(normalized.pausedSegmentMinutes) || 1),
  );
}

function getWorkItemPlannableMinutes(item) {
  if (!item) return 0;
  if (item.kind === "task") {
    return item.status === "done" ? 0 : getTaskRemainingMinutes(item);
  }
  if (getGoalMissionStateForDate(item.goal).isClosed) {
    return 0;
  }
  const continuation = getGoalContinuation(item.sourceId);
  return continuation
    ? Math.max(1, Math.ceil(continuation.remainingSeconds / 60))
    : Math.max(1, Number(item.minutes) || getGoalDurationMinutes(item.goal));
}

function getDailyPlanningItems(plan = state.dailyPlan) {
  return getActiveWorkItems()
    .filter((item) => getWorkItemPlannableMinutes(item) > 0 && isWorkItemSelectedToday(item, plan))
    .sort(compareWorkItems);
}

function getTodayOrderedWorkItems() {
  const plan = ensureDailyPlan();
  const order = new Map(plan.workOrderIds.map((workId, index) => [workId, index]));
  return getDailyPlanningItems(plan).sort((left, right) => {
    const orderGap = (order.get(left.id) ?? Number.MAX_SAFE_INTEGER)
      - (order.get(right.id) ?? Number.MAX_SAFE_INTEGER);
    return orderGap || compareWorkItems(left, right);
  });
}

function setWorkItemSelectedToday(workId, selected) {
  const item = getWorkItemById(workId);
  if (!item) return null;
  if (!selected && getTaskPausedSeconds(item) > 0) {
    return { item, selected: true, blockedByContinuation: true };
  }

  const plan = ensureDailyPlan();
  const include = new Set(normalizeWorkIdList(plan.includedWorkIds));
  const exclude = new Set(normalizeWorkIdList(plan.excludedWorkIds));
  include.delete(item.id);
  exclude.delete(item.id);

  if (item.kind === "task") {
    updateTask(item.sourceId, () => ({ plannedDate: selected ? toISODate(new Date()) : "" }));
  } else if (selected !== isWorkItemDefaultedToToday(item)) {
    (selected ? include : exclude).add(item.id);
  }

  plan.includedWorkIds = [...include];
  plan.excludedWorkIds = [...exclude];
  if (selected) {
    plan.workOrderIds = normalizeWorkIdList([...plan.workOrderIds, item.id]);
  } else {
    plan.workOrderIds = plan.workOrderIds.filter((id) => id !== item.id);
    delete plan.startTimes[item.id];
    removePendingWorkAllocations(plan, item.id);
  }
  reconcileDailyPlanSelections(plan);
  return { item: getWorkItemById(workId), selected };
}

function moveTodayWorkItem(workId, beforeWorkId = null) {
  const plan = ensureDailyPlan();
  const order = new Map(plan.workOrderIds.map((id, index) => [id, index]));
  const selectedIds = getDailyPlanningItems(plan)
    .sort((left, right) => {
      const orderGap = (order.get(left.id) ?? Number.MAX_SAFE_INTEGER)
        - (order.get(right.id) ?? Number.MAX_SAFE_INTEGER);
      return orderGap || compareWorkItems(left, right);
    })
    .map((item) => item.id);
  if (!selectedIds.includes(workId)) return null;
  const nextOrder = selectedIds.filter((id) => id !== workId);
  const beforeIndex = beforeWorkId ? nextOrder.indexOf(beforeWorkId) : -1;
  nextOrder.splice(beforeIndex >= 0 ? beforeIndex : nextOrder.length, 0, workId);
  plan.workOrderIds = nextOrder;
  return nextOrder;
}

function setTodayWorkStartMinute(workId, minute, { reorder = false } = {}) {
  let plan = ensureDailyPlan();
  const snappedMinute = snapScheduleMinute(minute);
  if (snappedMinute === null || !plan.workOrderIds.includes(workId)) return null;

  if (reorder) {
    const otherRows = buildTodayTimeRows(getTodayOrderedWorkItems(), plan)
      .filter((row) => row.item.id !== workId);
    const beforeWorkId = otherRows.find((row) => snappedMinute < row.endMinutes)?.item.id || null;
    moveTodayWorkItem(workId, beforeWorkId);
    plan = ensureDailyPlan();
  }

  plan.startTimes[workId] = minutesToClockTime(snappedMinute);
  const row = buildTodayTimeRows(getTodayOrderedWorkItems(), plan)
    .find((entry) => entry.item.id === workId);
  return row || null;
}

function getTodayInsertionStartMinute(workId, beforeWorkId = null) {
  const items = getTodayOrderedWorkItems().filter((item) => item.id !== workId);
  const plan = ensureDailyPlan();
  const rows = buildTodayTimeRows(items, plan);
  if (beforeWorkId) {
    const beforeRow = rows.find((row) => row.item.id === beforeWorkId);
    if (beforeRow) return beforeRow.startMinutes;
  }
  return rows.at(-1)?.endMinutes
    ?? getScheduleAvailabilityRanges(plan)[0]?.start
    ?? 20 * 60;
}

function repackTodayWorkStartTimes({
  firstStartMinute = null,
  anchorWorkId = "",
  anchorMinute = null,
  keepAnchorGap = false,
} = {}) {
  const items = getTodayOrderedWorkItems();
  const plan = ensureDailyPlan();
  if (!items.length) {
    plan.startTimes = {};
    return null;
  }

  const firstWorkId = items[0].id;
  const fallbackStart = getScheduleAvailabilityRanges(plan)[0]?.start ?? 20 * 60;
  const snappedFirst = snapScheduleMinute(firstStartMinute);
  const snappedAnchor = snapScheduleMinute(anchorMinute);
  const baseStart = keepAnchorGap && anchorWorkId === firstWorkId && snappedAnchor !== null
    ? snappedAnchor
    : snappedFirst ?? snappedAnchor ?? fallbackStart;
  plan.startTimes = {
    [firstWorkId]: minutesToClockTime(baseStart),
  };

  const anchorIndex = items.findIndex((item) => item.id === anchorWorkId);
  if (keepAnchorGap && anchorIndex > 0 && snappedAnchor !== null) {
    const packedRows = buildTodayTimeRows(items, plan);
    const previousEnd = packedRows[anchorIndex - 1]?.endMinutes;
    if (Number.isFinite(previousEnd) && snappedAnchor - previousEnd > TIME_SNAP_MINUTES) {
      plan.startTimes[anchorWorkId] = minutesToClockTime(snappedAnchor);
    }
  }

  return buildTodayTimeRows(items, plan)
    .find((row) => row.item.id === anchorWorkId) || null;
}

function getPlanAllocationsForWork(plan, workId, { includeCompleted = true } = {}) {
  return (plan?.allocations || []).filter((allocation) => (
    allocation.workId === workId
    && (includeCompleted || !allocation.completedAt)
  ));
}

function getPlanSlotUsedMinutes(plan, slotId) {
  return (plan?.allocations || [])
    .filter((allocation) => allocation.slotId === slotId)
    .reduce((sum, allocation) => sum + allocation.minutes, 0);
}

function appendPlanAllocation(plan, workId, slotId, minutes) {
  const rounded = Math.max(0, Math.round(Number(minutes) || 0));
  if (!plan || !workId || !slotId || rounded < 1) return null;
  const allocation = {
    id: createPlanAllocationId(),
    workId,
    slotId,
    minutes: rounded,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  plan.allocations.push(allocation);
  return allocation;
}

function allocateWorkItemIntoPlan(plan, item, requestedMinutes, startSlotId = "") {
  const minutes = Math.max(0, Math.round(Number(requestedMinutes) || 0));
  if (!plan || !item || minutes < 1) {
    return { allocatedMinutes: 0, remainingMinutes: minutes };
  }
  const startIndex = Math.max(0, plan.slots.findIndex((slot) => slot.id === startSlotId));
  const slots = plan.slots.slice(startIndex);
  let remaining = minutes;
  let allocatedMinutes = 0;

  if (item.kind !== "task") {
    const target = slots.find((slot) => (
      getAvailabilitySlotMinutes(slot) - getPlanSlotUsedMinutes(plan, slot.id) >= remaining
    ));
    if (target) {
      appendPlanAllocation(plan, item.id, target.id, remaining);
      allocatedMinutes = remaining;
      remaining = 0;
    }
    return { allocatedMinutes, remainingMinutes: remaining };
  }

  let allocationSlots = slots;
  const pausedSegmentMinutes = getTaskPausedSegmentMinutes(item);
  if (pausedSegmentMinutes > 0) {
    const segmentMinutes = Math.min(remaining, pausedSegmentMinutes);
    const targetIndex = slots.findIndex((slot) => (
      getAvailabilitySlotMinutes(slot) - getPlanSlotUsedMinutes(plan, slot.id) >= segmentMinutes
    ));
    if (targetIndex < 0) {
      return { allocatedMinutes, remainingMinutes: remaining };
    }
    appendPlanAllocation(plan, item.id, slots[targetIndex].id, segmentMinutes);
    allocatedMinutes += segmentMinutes;
    remaining -= segmentMinutes;
    allocationSlots = slots.slice(targetIndex);
  }

  allocationSlots.forEach((slot) => {
    if (remaining <= 0) return;
    const available = Math.max(
      0,
      getAvailabilitySlotMinutes(slot) - getPlanSlotUsedMinutes(plan, slot.id),
    );
    const take = Math.min(remaining, available);
    if (take < 1) return;
    appendPlanAllocation(plan, item.id, slot.id, take);
    allocatedMinutes += take;
    remaining -= take;
  });

  return { allocatedMinutes, remainingMinutes: remaining };
}

function trimPendingWorkAllocations(plan, workId, targetMinutes) {
  let remaining = Math.max(0, Math.round(Number(targetMinutes) || 0));
  plan.allocations = (plan.allocations || []).reduce((result, allocation) => {
    if (allocation.workId !== workId || allocation.completedAt) {
      result.push(allocation);
      return result;
    }
    if (remaining <= 0) return result;
    const minutes = Math.min(allocation.minutes, remaining);
    result.push({ ...allocation, minutes });
    remaining -= minutes;
    return result;
  }, []);
}

function removePendingWorkAllocations(plan, workId) {
  plan.allocations = (plan.allocations || []).filter((allocation) => (
    allocation.workId !== workId || allocation.completedAt
  ));
}

function reconcileDailyPlanAllocations(plan) {
  if (!plan || !Array.isArray(plan.slots)) return plan;
  const activeItems = getActiveWorkItems();
  const itemById = new Map(activeItems.map((item) => [item.id, item]));
  plan.allocations = normalizePlanAllocations(plan.allocations, plan.slots)
    .filter((allocation) => itemById.has(allocation.workId));

  activeItems.forEach((item) => {
    const outstanding = getWorkItemPlannableMinutes(item);
    let pending = getPlanAllocationsForWork(plan, item.id, { includeCompleted: false });
    const pendingMinutes = pending.reduce((sum, allocation) => sum + allocation.minutes, 0);
    if (pendingMinutes > outstanding) {
      trimPendingWorkAllocations(plan, item.id, outstanding);
    }
  });

  return plan;
}

function planWorkItemToday(workId, startSlotId = "") {
  const result = setWorkItemSelectedToday(workId, true);
  if (!result) return null;
  return {
    item: result.item,
    allocatedMinutes: getWorkItemPlannableMinutes(result.item),
    remainingMinutes: 0,
    startSlotId,
  };
}

function removeWorkItemFromDailyPlan(workId) {
  const plan = ensureDailyPlan();
  plan.allocations = plan.allocations.filter((allocation) => allocation.workId !== workId);
  delete plan.startTimes[workId];
}

function markPlanAllocationCompleted(allocationId) {
  const plan = ensureDailyPlan();
  let completed = null;
  plan.allocations = plan.allocations.map((allocation) => {
    if (allocation.id !== allocationId) return allocation;
    completed = { ...allocation, completedAt: allocation.completedAt || new Date().toISOString() };
    return completed;
  });
  return completed;
}

function getTodayPlanningOverflow(plan = ensureDailyPlan()) {
  let remainingCapacity = getAvailabilityMinutes(plan.slots);
  return getTodayOrderedWorkItems().map((item) => {
    const minutes = getWorkItemPlannableMinutes(item);
    const outsideMinutes = Math.max(0, minutes - Math.max(0, remainingCapacity));
    remainingCapacity -= minutes;
    return { item, minutes: outsideMinutes };
  }).filter((entry) => entry.minutes > 0);
}

function getTodayPlanStats(plan = ensureDailyPlan()) {
  const capacityMinutes = getAvailabilityMinutes(plan.slots);
  const allocatedMinutes = getDailyPlanningItems(plan)
    .reduce((sum, item) => sum + getWorkItemPlannableMinutes(item), 0);
  const overflowMinutes = Math.max(0, allocatedMinutes - capacityMinutes);
  return {
    capacityMinutes,
    allocatedMinutes,
    freeMinutes: Math.max(0, capacityMinutes - allocatedMinutes),
    overflowMinutes,
  };
}

function autoArrangeTodayPlan() {
  const plan = ensureDailyPlan();
  reconcileDailyPlanSelections(plan);
  plan.capacityMinutes = getAvailabilityMinutes(plan.slots);
  return getTodayPlanStats(plan);
}

function buildAvailabilityDraft(mode = "default") {
  const plan = ensureDailyPlan();
  const slots = mode === "today" ? plan.slots : plan.defaultSlots;
  return cloneData(normalizeAvailabilitySlots(slots, plan.capacityMinutes));
}

function getAvailabilitySlotEdgeBounds(slots, slotId, edge) {
  const source = Array.isArray(slots) ? slots : [];
  const index = source.findIndex((slot) => slot.id === slotId);
  if (index < 0 || !["start", "end"].includes(edge)) return null;

  const slot = source[index];
  const start = clockTimeToMinutes(slot.start);
  const end = clockTimeToMinutes(slot.end);
  if (start === null || end === null) return null;
  const previousEnd = index > 0
    ? clockTimeToMinutes(source[index - 1]?.end)
    : 0;
  const nextStart = index < source.length - 1
    ? clockTimeToMinutes(source[index + 1]?.start)
    : AVAILABILITY_DAY_MINUTES - TIME_SNAP_MINUTES;

  if (edge === "start") {
    const min = Math.max(0, previousEnd ?? 0);
    const max = Math.max(min, end - TIME_SNAP_MINUTES);
    return { min, max, current: start };
  }

  const min = Math.min(
    AVAILABILITY_DAY_MINUTES - TIME_SNAP_MINUTES,
    start + TIME_SNAP_MINUTES,
  );
  const max = Math.max(min, nextStart ?? (AVAILABILITY_DAY_MINUTES - TIME_SNAP_MINUTES));
  return { min, max, current: end };
}

function getAvailabilityDraftEdgeBounds(slotId, edge) {
  return getAvailabilitySlotEdgeBounds(ui.availabilityDraft, slotId, edge);
}

function updateAvailabilityEdgeInSlots(slots, slotId, edge, minute) {
  const bounds = getAvailabilitySlotEdgeBounds(slots, slotId, edge);
  if (!bounds) return null;
  const snapped = Math.round(Number(minute) / TIME_SNAP_MINUTES) * TIME_SNAP_MINUTES;
  const bounded = Math.max(bounds.min, Math.min(bounds.max, snapped));
  let updatedSlot = null;
  const updatedSlots = slots.map((slot) => {
    if (slot.id !== slotId) return slot;
    updatedSlot = { ...slot, [edge]: minutesToClockTime(bounded) };
    return updatedSlot;
  });
  return { slots: updatedSlots, slot: updatedSlot, minute: bounded };
}

function updateAvailabilityDraftEdge(slotId, edge, minute) {
  const result = updateAvailabilityEdgeInSlots(ui.availabilityDraft, slotId, edge, minute);
  if (!result) return null;
  ui.availabilityDraft = result.slots;
  return result.slot;
}

function getAvailabilityDraftTotalMinutes() {
  const draft = Array.isArray(ui.availabilityDraft) ? ui.availabilityDraft : [];
  return draft
    .map(normalizeAvailabilitySlot)
    .filter(Boolean)
    .reduce((sum, slot) => sum + getAvailabilitySlotMinutes(slot), 0);
}

function refreshAvailabilityEditorDOM(slotId, slot, draggedEdge = "", offsetY = 0) {
  const row = Array.from(document.querySelectorAll("[data-availability-slot-row]"))
    .find((element) => element.dataset.availabilitySlotRow === slotId);
  if (!row || !slot) return;
  const start = clockTimeToMinutes(slot.start) ?? 0;
  const end = clockTimeToMinutes(slot.end) ?? start + TIME_SNAP_MINUTES;
  const duration = row.querySelector("[data-availability-range-duration]");
  if (duration) duration.textContent = formatLoggedDuration(getAvailabilitySlotMinutes(slot) * 60);
  ["start", "end"].forEach((edge) => {
    const minute = edge === "start" ? start : end;
    const handle = row.querySelector(`[data-availability-drag-handle="${edge}"]`);
    const input = row.querySelector(`[data-availability-field="${edge}"]`);
    const time = row.querySelector(`[data-availability-range-time="${edge}"]`);
    if (handle) {
      handle.setAttribute("aria-valuenow", String(minute));
      handle.setAttribute("aria-valuetext", minutesToClockTime(minute));
      handle.style.setProperty("--availability-drag-offset", edge === draggedEdge ? `${offsetY}px` : "0px");
    }
    if (input) input.value = minutesToClockTime(minute);
    if (time) time.textContent = minutesToClockTime(minute);
  });
  const total = document.querySelector("[data-availability-total]");
  if (total) total.textContent = formatLoggedDuration(getAvailabilityDraftTotalMinutes() * 60);
}

function createNextAvailabilitySlot(slots) {
  const normalized = normalizeAvailabilitySlots(slots);
  const last = normalized[normalized.length - 1];
  const lastEnd = clockTimeToMinutes(last?.end);
  let start = lastEnd === null ? 20 * 60 : lastEnd;
  if (start > 22 * 60 + 30) {
    start = 7 * 60;
  }
  const end = Math.min(23 * 60 + 59, start + 30);
  return {
    id: createAvailabilitySlotId(),
    start: minutesToClockTime(start),
    end: minutesToClockTime(end),
  };
}

function getWorkItemById(workId) {
  if (isGoalWorkId(workId)) {
    const goalId = goalIdFromWorkId(workId);
    const goal = listGoals().find((item) => item.id === goalId);
    return goal ? goalToWorkItem(goal) : null;
  }
  const task = getTaskById(workId);
  return task ? taskToWorkItem(task) : null;
}

function groupActiveWorkItemsByQuadrant(items = getActiveWorkItems()) {
  const groups = {
    [TASK_QUADRANT_DEFAULT]: [],
  };
  TASK_QUADRANTS.forEach((quadrant) => {
    groups[quadrant.key] = [];
  });

  items.forEach((item) => {
    const key = item.kind === "goal"
      ? normalizeGoalQuadrant(item.quadrant)
      : normalizeTaskQuadrant(item.quadrant);
    groups[key].push(item);
  });

  Object.values(groups).forEach((itemsInGroup) => itemsInGroup.sort(compareWorkItems));

  return groups;
}

function patchWorkItem(workId, patch) {
  if (isGoalWorkId(workId)) {
    const goalId = goalIdFromWorkId(workId);
    state.goals = state.goals.map((goal) => {
      if (goal.id !== goalId) return goal;
      return { ...goal, setup: { ...goal.setup, ...patch } };
    });
    if (state.meta.activeGoalId === goalId) {
      state.setup = { ...state.setup, ...patch };
    }
    return;
  }
  const sourceGoalId = getTaskById(workId)?.sourceGoalId || "";
  state.tasks = normalizeTasks(state.tasks).map((task) => (
    task.id === workId ? normalizeTask({ ...task, ...patch, updatedAt: new Date().toISOString() }) : task
  ));
  if (sourceGoalId && patch.quadrant) {
    state.goals = state.goals.map((goal) => (
      goal.id === sourceGoalId ? { ...goal, setup: { ...goal.setup, quadrant: normalizeGoalQuadrant(patch.quadrant) } } : goal
    ));
    if (state.meta.activeGoalId === sourceGoalId) {
      state.setup = { ...state.setup, quadrant: normalizeGoalQuadrant(patch.quadrant) };
    }
  }
}

function moveTaskToQuadrant(workId, quadrantKey, beforeWorkId = null) {
  syncActiveGoalRecord();
  const current = getWorkItemById(workId);
  if (!current) return null;

  const nextQuadrant = current.kind === "goal"
    ? normalizeGoalQuadrant(quadrantKey)
    : normalizeTaskQuadrant(quadrantKey);
  const meta = getTaskQuadrantMeta(nextQuadrant);
  const patch = { quadrant: nextQuadrant };
  if (
    current.kind === "task"
    && meta
    && current.quadrant !== nextQuadrant
    && current.minutes === TASK_DEFAULT_MINUTES
    && meta.defaultMinutes !== TASK_DEFAULT_MINUTES
  ) {
    patch.minutes = meta.defaultMinutes;
  }
  patchWorkItem(workId, patch);

  const targetItems = getActiveWorkItems()
    .filter((item) => item.quadrant === nextQuadrant && item.id !== workId);
  const moved = getWorkItemById(workId);
  const beforeIndex = beforeWorkId
    ? targetItems.findIndex((item) => item.id === beforeWorkId)
    : -1;
  targetItems.splice(beforeIndex >= 0 ? beforeIndex : targetItems.length, 0, moved);
  targetItems.forEach((item, index) => patchWorkItem(item.id, { priority: index }));

  return getWorkItemById(workId);
}

function assignTaskQuadrant(taskId, quadrantKey) {
  return moveTaskToQuadrant(taskId, quadrantKey);
}

function updateTaskMinutes(taskId, minutes) {
  return updateTask(taskId, () => ({
    minutes: normalizeTaskMinutes(minutes),
  }));
}

function getTaskPausedSeconds(task) {
  const seconds = Number(task?.pausedRemainingSeconds);
  return Number.isFinite(seconds) && seconds > 0
    ? Math.max(1, Math.min(240 * 60, Math.ceil(seconds)))
    : 0;
}

function formatTaskRemaining(seconds) {
  return formatCountdown(Math.max(1, Number(seconds) || 1) * 1000);
}

function getTaskStartLabel(task) {
  return getTaskPausedSeconds(task) > 0 ? "再開" : "開始";
}

function getTaskQuadrantToastLabel(quadrantKey) {
  if (quadrantKey === TASK_QUADRANT_DEFAULT) {
    return "未整理";
  }
  const meta = getTaskQuadrantMeta(quadrantKey);
  return meta ? meta.concept : "未整理";
}

function getTaskById(taskId) {
  return (state.tasks || []).find((task) => task.id === taskId) || null;
}

function ensureTaskDraft() {
  if (!ui.taskDraft) {
    ui.taskDraft = { title: "", minutes: String(TASK_DEFAULT_MINUTES) };
  }
  if (!ui.taskDraft.minutes) {
    ui.taskDraft.minutes = String(TASK_DEFAULT_MINUTES);
  }
  return ui.taskDraft;
}

function resetTaskDraft() {
  ui.taskDraft = { title: "", minutes: String(TASK_DEFAULT_MINUTES) };
}

function ensureTaskSubtaskDrafts() {
  if (!ui.taskSubtaskDrafts) {
    ui.taskSubtaskDrafts = {};
  }
  return ui.taskSubtaskDrafts;
}

function getTaskSubtaskDraft(taskId) {
  const drafts = ensureTaskSubtaskDrafts();
  return drafts[taskId] || "";
}

function setTaskSubtaskDraft(taskId, value) {
  const drafts = ensureTaskSubtaskDrafts();
  drafts[taskId] = value;
}

function clearTaskSubtaskDraft(taskId) {
  const drafts = ensureTaskSubtaskDrafts();
  delete drafts[taskId];
}

function getTaskSubtaskProgress(task) {
  const subtasks = normalizeTaskSubtasks(task.subtasks);
  return {
    total: subtasks.length,
    done: subtasks.filter((subtask) => subtask.done).length,
  };
}

function updateTaskTitle(taskId, title) {
  const cleaned = String(title || "").trim();
  return updateTask(taskId, () => ({
    title: cleaned || "無題のTask",
  }));
}

function addTaskSubtask(taskId, title) {
  const cleaned = String(title || "").trim();
  if (!cleaned) {
    return null;
  }
  const now = new Date().toISOString();
  return updateTask(taskId, (task) => ({
    subtasks: [
      ...normalizeTaskSubtasks(task.subtasks),
      normalizeTaskSubtask({
        id: createSubtaskId(),
        title: cleaned,
        createdAt: now,
        updatedAt: now,
      }),
    ],
  }));
}

function updateTaskSubtask(taskId, subtaskId, updater) {
  let found = false;
  const task = updateTask(taskId, (currentTask) => ({
    subtasks: normalizeTaskSubtasks(currentTask.subtasks).map((subtask) => {
      if (subtask.id !== subtaskId) {
        return subtask;
      }
      found = true;
      return normalizeTaskSubtask({
        ...subtask,
        ...updater(subtask),
        updatedAt: new Date().toISOString(),
      });
    }),
  }));

  return found ? task : null;
}

function removeTaskSubtask(taskId, subtaskId) {
  let removed = false;
  const task = updateTask(taskId, (currentTask) => ({
    subtasks: normalizeTaskSubtasks(currentTask.subtasks).filter((subtask) => {
      if (subtask.id === subtaskId) {
        removed = true;
        return false;
      }
      return true;
    }),
  }));

  return removed ? task : null;
}

function scheduleTaskEditRender() {
  window.clearTimeout(ui.taskEditRenderTimer);
  ui.taskEditRenderTimer = window.setTimeout(() => {
    const active = document.activeElement;
    if (active?.closest?.(".task-selected-panel")) {
      return;
    }
    render();
  }, 80);
}

const DEVICE_APP_LOCK_TIMEOUT_MS = 5000;
let deviceAppLockRequest = null;

function getDeviceAppLockBridge() {
  return window.webkit?.messageHandlers?.focusLock
    || window.webkit?.messageHandlers?.guidedAccess
    || null;
}

function requestDeviceAppLock(enabled) {
  const handler = getDeviceAppLockBridge();
  if (!handler || typeof handler.postMessage !== "function") {
    return Promise.resolve({
      supported: false,
      enabled: Boolean(enabled),
      success: !enabled,
      isEnabled: false,
    });
  }

  if (deviceAppLockRequest?.timer) {
    window.clearTimeout(deviceAppLockRequest.timer);
    deviceAppLockRequest.resolve({
      supported: true,
      enabled: deviceAppLockRequest.enabled,
      success: false,
      isEnabled: false,
      cancelled: true,
    });
  }

  const requestId = `lock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      if (deviceAppLockRequest?.requestId === requestId) {
        deviceAppLockRequest = null;
      }
      resolve({
        supported: true,
        enabled: Boolean(enabled),
        success: false,
        isEnabled: false,
        timeout: true,
      });
    }, DEVICE_APP_LOCK_TIMEOUT_MS);

    deviceAppLockRequest = {
      requestId,
      enabled: Boolean(enabled),
      resolve,
      timer,
    };

    try {
      handler.postMessage({ enabled: Boolean(enabled), requestId });
    } catch (_err) {
      window.clearTimeout(timer);
      deviceAppLockRequest = null;
      resolve({
        supported: true,
        enabled: Boolean(enabled),
        success: false,
        isEnabled: false,
      });
    }
  });
}

function syncDeviceAppLock() {
  requestDeviceAppLock(Boolean(state.activeSession && !ui.finishDraft));
}

function requestAppShieldStatus() {
  const bridge = window.webkit?.messageHandlers?.appShield;
  ui.appShieldStatus.available = Boolean(bridge);
  if (!bridge) {
    return false;
  }

  try {
    bridge.postMessage({ action: "status" });
    return true;
  } catch (err) {
    console.warn("app shield status unavailable:", err);
    return false;
  }
}

function handleAppShieldStatus(event) {
  const detail = event.detail || {};
  ui.appShieldStatus = {
    available: detail.available !== false,
    enabled: typeof detail.enabled === "boolean" ? detail.enabled : null,
    authorized: typeof detail.authorized === "boolean" ? detail.authorized : null,
    allowedAppCount: Math.max(0, Number(detail.allowedAppCount) || 0),
  };

  if (state.meta.currentView === "setup" && ui.setupSection === "home") {
    render();
  }
}

function getFocusAlarmBridge() {
  return window.webkit?.messageHandlers?.focusAlarm || null;
}

function scheduleFocusAlarm(session = state.activeSession) {
  const bridge = getFocusAlarmBridge();
  if (!bridge || !session?.endsAt) {
    return false;
  }

  const title = isTaskSession(session)
    ? (session.taskTitle || "Task")
    : (state.setup?.goal || "集中セッション");
  try {
    bridge.postMessage({
      action: "schedule",
      endsAt: Number(session.endsAt),
      title,
    });
    return true;
  } catch (_err) {
    return false;
  }
}

function cancelFocusAlarm() {
  const bridge = getFocusAlarmBridge();
  if (!bridge) {
    return false;
  }
  try {
    bridge.postMessage({ action: "cancel" });
    return true;
  } catch (_err) {
    return false;
  }
}

function syncFocusAlarm() {
  if (state.activeSession && !ui.finishDraft) {
    scheduleFocusAlarm(state.activeSession);
  } else {
    cancelFocusAlarm();
  }
}

function handleFocusAlarmStatus(event) {
  if (event.detail?.authorized === false) {
    showToast("終了アラームがオフです。iPhoneの設定で砂時計の通知を許可してください。");
  }
}

function buildFocusLockHelp(result = {}) {
  const fallbackButton = result.usesHomeIndicator === false ? "ホームボタン" : "サイドボタン";
  const shortcutButton = result.shortcutButton || fallbackButton;

  return {
    mode: result.mode === "appShield" ? "appShield" : "guidedAccess",
    deviceModel: result.deviceModel || "このiPhone",
    deviceIdentifier: result.deviceIdentifier || "",
    shortcutButton,
    shortcutInstruction: result.shortcutInstruction || `${shortcutButton}を3回クリック`,
    isTimeout: Boolean(result.timeout),
  };
}

function startPendingFocusSession(pending = ui.pendingFocusStart) {
  if (!pending) {
    return;
  }

  if (pending.type === "task") {
    beginTaskSession(pending.taskId || "", pending.allocationId || "");
    render();
    return;
  }

  if (pending.type === "goal" && pending.goalId && pending.goalId !== state.meta.activeGoalId) {
    activateGoal(pending.goalId);
  }

  const planKey = pending.planKey || ui.selectedSessionPlan;
  const started = beginSession(planKey, pending.allocationId || "");
  if (!started) return;
  render();
  showToast(started.isResume
    ? `残り ${formatTaskRemaining(started.durationSeconds)} から再開しました。`
    : `${Math.max(1, Math.ceil(started.durationSeconds / 60))}分を開始しました。`);
}

function retryPendingFocusStart() {
  const pending = ui.pendingFocusStart;
  if (!pending) {
    ui.focusLockHelp = null;
    ui.sessionOpen = false;
    render();
    return;
  }

  ui.focusLockHelp = null;
  requireDeviceAppLockBeforeStart(() => startPendingFocusSession(pending), pending);
}

async function requireDeviceAppLockBeforeStart(startCallback, pending = null) {
  if (pending) {
    ui.pendingFocusStart = pending;
  }

  if (!getDeviceAppLockBridge()) {
    ui.focusLockHelp = null;
    startCallback();
    ui.pendingFocusStart = null;
    return true;
  }

  showToast("iPhoneを固定しています...");
  const result = await requestDeviceAppLock(true);
  if (result.success && result.isEnabled) {
    ui.focusLockHelp = null;
    startCallback();
    ui.pendingFocusStart = null;
    return true;
  }

  ui.focusLockHelp = buildFocusLockHelp(result);
  ui.sessionOpen = true;
  ui.showAbortConfirm = false;
  render();
  showToast("iPhone固定の準備が必要です。案内を開きました。");
  return false;
}

function handleGuidedAccessResult(event) {
  const detail = event.detail || {};
  if (deviceAppLockRequest && detail.requestId === deviceAppLockRequest.requestId) {
    window.clearTimeout(deviceAppLockRequest.timer);
    const pending = deviceAppLockRequest;
    deviceAppLockRequest = null;
    pending.resolve({
      supported: true,
      ...detail,
      enabled: Boolean(detail.enabled),
      success: Boolean(detail.success),
      isEnabled: Boolean(detail.isEnabled),
    });
    return;
  }

  if (detail.enabled && detail.success === false && state.activeSession && !ui.finishDraft) {
    showToast("iPhone固定に失敗しました。設定でアクセスガイドをオンにしてください。");
  }
}

function updateTask(taskId, updater) {
  let updatedTask = null;
  state.tasks = normalizeTasks(state.tasks).map((task) => {
    if (task.id !== taskId) {
      return task;
    }
    updatedTask = normalizeTask({
      ...task,
      ...updater(task),
      updatedAt: new Date().toISOString(),
    });
    return updatedTask;
  });
  return updatedTask;
}

function isTaskSession(session = state.activeSession) {
  return session && session.type === "task";
}

function getFallbackPlanKey(preferredKey = ui.selectedSessionPlan) {
  if (preferredKey && state.plans && state.plans[preferredKey]) {
    return preferredKey;
  }

  const recommended = getRecommendedPlan(state);
  if (recommended && state.plans && state.plans[recommended]) {
    return recommended;
  }

  return Object.keys(state.plans || {}).find((key) => state.plans[key]) || "";
}

function clearActiveSessionRuntime() {
  if (ui.sessionTimer) {
    window.clearInterval(ui.sessionTimer);
    ui.sessionTimer = null;
  }
  releaseWakeLock();
  state.activeSession = null;
  ui.sessionOpen = false;
  ui.finishDraft = null;
  ui.showAbortConfirm = false;
  cancelFocusAlarm();
  syncDeviceAppLock();
}

function reconcileActiveSession({ persist = false } = {}) {
  const session = state.activeSession;
  if (!session) {
    return false;
  }

  if (isTaskSession(session)) {
    const task = getTaskById(session.taskId);
    if (task && task.status === "active") {
      return false;
    }

    clearActiveSessionRuntime();
    if (persist) {
      saveState();
    }
    return true;
  }

  if (state.plans && state.plans[session.planKey]) {
    return false;
  }

  const fallbackPlanKey = getFallbackPlanKey(session.planKey);
  if (fallbackPlanKey && state.plans[fallbackPlanKey]) {
    const now = Date.now();
    const fallbackMinutes = Number(state.plans[fallbackPlanKey].minutes) || 1;
    state.activeSession = {
      ...session,
      planKey: fallbackPlanKey,
      startedAt: Number.isFinite(Number(session.startedAt)) ? Number(session.startedAt) : now,
      endsAt: Number.isFinite(Number(session.endsAt)) ? Number(session.endsAt) : now + fallbackMinutes * 60 * 1000,
    };
    ui.selectedSessionPlan = fallbackPlanKey;
    if (persist) {
      saveState();
    }
    return false;
  }

  clearActiveSessionRuntime();
  if (persist) {
    saveState();
  }
  return true;
}

function mergePlanDefinition(basePlan, savedPlan) {
  if (!savedPlan) {
    return basePlan;
  }

  return {
    ...basePlan,
    description: savedPlan.description || basePlan.description,
  };
}

function createGoalRecord(config = {}) {
  const setup = cloneData(config.setup || state?.setup || {});
  setup.studyDays = normalizeStudyDays(setup.studyDays);
  setup.quadrant = normalizeGoalQuadrant(setup.quadrant);
  setup.priority = setup.priority !== null && setup.priority !== "" && Number.isFinite(Number(setup.priority)) ? Number(setup.priority) : null;
  setup.flowerType = normalizeFlowerType(setup.flowerType, setup);
  setup.goalType = setup.goalType === "habit" ? "habit" : "goal";
  setup.bonsaiKey = BONSAI_LIBRARY[setup.bonsaiKey] ? setup.bonsaiKey : "pine";
  const normalizedMinutes = resolvePlanMinuteValues(setup, setup);
  setup.normalMinutes = normalizedMinutes.normalMinutes;
  setup.shortMinutes = normalizedMinutes.shortMinutes;
  setup.minimumMinutes = normalizedMinutes.minimumMinutes;

  const isHabit = setup.goalType === "habit";

  const roadmap = isHabit
    ? []
    : (Array.isArray(config.roadmap)
      ? normalizeRoadmapItems(config.roadmap, setup)
      : buildInitialRoadmap(setup));

  const todayState = isHabit
    ? { missionTitle: setup.goal, missionNote: "", recommendedPlan: "A", lastOutcome: null, lastRecordedAt: null, ...(config.today || {}) }
    : {
        ...buildToday(setup, roadmap),
        ...(config.today || {}),
      };

  const basePlans = buildPlans(setup, todayState.missionTitle);
  const defaultTuning = buildInitialPlanTuning();
  const nextPlanTuning = {
    ...defaultTuning,
    ...(config.planTuning || {}),
    defaultPlanByDay: {
      ...defaultTuning.defaultPlanByDay,
      ...((config.planTuning && config.planTuning.defaultPlanByDay) || {}),
    },
    rescuePrimaryDays: Array.isArray(config.planTuning && config.planTuning.rescuePrimaryDays)
      ? cloneData(config.planTuning.rescuePrimaryDays)
      : defaultTuning.rescuePrimaryDays,
  };

  return {
    id: config.id || createGoalId(),
    title: (setup.goal || "").trim() || "\u76ee\u6a19",
    programStartDate: config.programStartDate || toISODate(new Date()),
    setup,
    roadmap,
    today: todayState,
    plans: {
      A: mergePlanDefinition(basePlans.A, config.plans && config.plans.A),
      B: mergePlanDefinition(basePlans.B, config.plans && config.plans.B),
      C: mergePlanDefinition(basePlans.C, config.plans && config.plans.C),
    },
    planTuning: nextPlanTuning,
    replan: { ...buildInitialReplan(), ...(config.replan || {}) },
    logs: normalizeLogs(config.logs),
    activeSession: config.activeSession ? cloneData(config.activeSession) : null,
    archived: config.archived || false,
    archivedAt: config.archivedAt || null,
  };
}

function applyGoalRecord(goalRecord) {
  state.programStartDate = goalRecord.programStartDate;
  state.setup = cloneData(goalRecord.setup);
  state.roadmap = cloneData(goalRecord.roadmap);
  state.today = cloneData(goalRecord.today);
  state.plans = cloneData(goalRecord.plans);
  state.planTuning = cloneData(goalRecord.planTuning);
  state.replan = cloneData(goalRecord.replan);
  state.logs = cloneData(goalRecord.logs);
  state.activeSession = cloneData(goalRecord.activeSession);
  state.meta.activeGoalId = goalRecord.id;
}

function captureActiveGoalRecord(goalId = state.meta.activeGoalId) {
  const existing = Array.isArray(state.goals)
    ? state.goals.find((g) => g.id === goalId)
    : null;
  return createGoalRecord({
    id: goalId,
    programStartDate: state.programStartDate,
    setup: state.setup,
    roadmap: state.roadmap,
    today: state.today,
    plans: state.plans,
    planTuning: state.planTuning,
    replan: state.replan,
    logs: state.logs,
    activeSession: state.activeSession,
    archived: existing ? existing.archived : false,
    archivedAt: existing ? existing.archivedAt : null,
  });
}

function ensureGoalCollection() {
  if (!state.meta) {
    state.meta = {};
  }

  const hasSavedGoals = Array.isArray(state.goals) && state.goals.length;
  state.goals = hasSavedGoals
    ? state.goals.map((goal) => createGoalRecord(goal))
    : [createGoalRecord({
      id: state.meta.activeGoalId || createGoalId(),
      programStartDate: state.programStartDate,
      setup: state.setup,
      roadmap: state.roadmap,
      today: state.today,
      plans: state.plans,
      planTuning: state.planTuning,
      replan: state.replan,
      logs: state.logs,
      activeSession: state.activeSession,
    })];

  if (!state.meta.activeGoalId || !state.goals.some((goal) => goal.id === state.meta.activeGoalId)) {
    state.meta.activeGoalId = state.goals[0].id;
  }

  const activeGoal = state.goals.find((goal) => goal.id === state.meta.activeGoalId) || state.goals[0];
  applyGoalRecord(activeGoal);
}

function syncActiveGoalRecord() {
  if (!state.meta) {
    state.meta = {};
  }

  if (!Array.isArray(state.goals) || !state.goals.length) {
    const goalId = state.meta.activeGoalId || createGoalId();
    state.meta.activeGoalId = goalId;
    state.goals = [captureActiveGoalRecord(goalId)];
    return;
  }

  state.goals = state.goals.map((goal) => createGoalRecord(goal));
  if (!state.meta.activeGoalId || !state.goals.some((goal) => goal.id === state.meta.activeGoalId)) {
    state.meta.activeGoalId = state.goals[0].id;
  }

  const activeGoal = captureActiveGoalRecord(state.meta.activeGoalId);
  const activeIndex = state.goals.findIndex((goal) => goal.id === activeGoal.id);

  if (activeIndex === -1) {
    state.goals = [activeGoal, ...state.goals];
    return;
  }

  state.goals = state.goals.map((goal, index) => (index === activeIndex ? activeGoal : goal));
}

function listGoals() {
  ensureGoalCollection();
  return [...state.goals].filter(g => !g.archived).sort((left, right) => {
    if (left.id === state.meta.activeGoalId) return -1;
    if (right.id === state.meta.activeGoalId) return 1;
    return 0;
  });
}

function listArchivedGoals() {
  ensureGoalCollection();
  return [...state.goals]
    .filter(g => g.archived)
    .sort((a, b) => (b.archivedAt || "").localeCompare(a.archivedAt || ""));
}

function compareGoalsByPrimaryWindow(left, right) {
  const leftStart = parseWindow(left?.setup?.primaryWindow || "99:99-99:99").start;
  const rightStart = parseWindow(right?.setup?.primaryWindow || "99:99-99:99").start;

  if (leftStart !== rightStart) {
    return leftStart - rightStart;
  }

  return String(left?.setup?.goal || "").localeCompare(String(right?.setup?.goal || ""), "ja");
}

function listGoalsByPrimaryWindow() {
  ensureGoalCollection();
  return [...state.goals].sort(compareGoalsByPrimaryWindow);
}

function listGoalsForToday(date = new Date()) {
  const dateStr = toISODate(date);
  return listGoals()
    .filter((goal) => isGoalScheduledForDate(goal, date))
    .filter((goal) => {
      if (goal.setup && goal.setup.goalType === "habit") {
        // Hide habit if already completed today
        const todayLog = (goal.logs || []).find(l => l.date === dateStr);
        return !(todayLog && todayLog.outcome !== "miss" && todayLog.outcome !== "none");
      }
      return !getGoalMissionStateForDate(goal, date).isClosed;
    })
    .sort(compareGoalsByPrimaryWindow);
}

function activateGoal(goalId) {
  const currentView = state.meta.currentView || "today";
  syncActiveGoalRecord();
  const nextGoal = state.goals.find((goal) => goal.id === goalId);
  if (!nextGoal) {
    return false;
  }

  applyGoalRecord(nextGoal);
  state.meta.currentView = currentView;
  ui.setupDraft = currentView === "setup" ? expandSetup(state.setup) : null;
  ui.setupMode = "edit";
  ui.sessionOpen = false;
  ui.finishDraft = null;
  ui.reviewLogDraft = null;
  ui.reviewLogExpanded = false;
  syncSelectedSessionPlan(true);
  syncRetargetDraftFromState();
  saveState();
  return true;
}

function init() {
  if (!state.meta) {
    state = buildSeedState();
  }
  ensureGoalCollection();
  const expiredContinuations = expireStaleContinuations();
  ensureDailyPlan();
  if (state.meta.demoMode && state.meta.currentView === "setup") {
    state.meta.currentView = "today";
    saveNavState();
  }
  syncSelectedSessionPlan(true);
  if (expiredContinuations > 0) {
    saveState();
  }
  // 実行中セッションを抱えたまま再起動された場合は、砂時計を開いた状態で復帰する。
  // uiはメモリ上のみでsessionOpenが既定false のため、これがないとタイマーとアプリ制限は
  // 生きているのに完了・中断のボタンが出せず、操作不能になる。
  if (state.activeSession && !ui.finishDraft) {
    ui.sessionOpen = true;
  }
  startClock();
  startSessionTicker();
  bindEvents();
  render();
  requestAppShieldStatus();
  syncDeviceAppLock();
  syncFocusAlarm();
  // 3分ごとに他デバイスの変更を自動取得（画面非表示中とタイマー中は行わない）
  setInterval(() => {
    if (!document.hidden && !state.activeSession) _resyncFromSupabase();
  }, 180 * 1000);
}

function updateVH() {
  document.documentElement.style.setProperty("--real-100vh", window.innerHeight + "px");
}

function bindEvents() {
  // 画面の向き切り替え時にビューポート高さを再計算
  updateVH();
  window.addEventListener("resize", updateVH);
  window.addEventListener("orientationchange", () => {
    setTimeout(updateVH, 50);
    setTimeout(updateVH, 300);
  });

  // iOS/Android: 最初のユーザー操作でAudioContextを解禁
  document.addEventListener("touchstart", _ensureAudioCtx, { once: true });
  document.addEventListener("click", _ensureAudioCtx, { once: true });

  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);
  document.addEventListener("dragstart", handleTaskDragStart);
  document.addEventListener("dragover", handleTaskDragOver);
  document.addEventListener("dragleave", handleTaskDragLeave);
  document.addEventListener("drop", handleTaskDrop);
  document.addEventListener("dragend", handleTaskDragEnd);
  document.addEventListener("pointerdown", handleTaskPointerDown);
  document.addEventListener("pointermove", handleTaskPointerMove, { passive: false });
  document.addEventListener("pointerup", handleTaskPointerEnd);
  document.addEventListener("pointercancel", handleTaskPointerEnd);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("focus-lock-result", handleGuidedAccessResult);
  window.addEventListener("guided-access-result", handleGuidedAccessResult);
  window.addEventListener("app-shield-status", handleAppShieldStatus);
  window.addEventListener("focus-alarm-status", handleFocusAlarmStatus);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (state.activeSession && !ui.finishDraft) {
      // 復帰時は保存済みの終了時刻を正として画面を組み直す。
      // WebViewのタイマーが停止していても、残り時間を最初からに戻さない。
      ui.sessionOpen = true;
      requestWakeLock();
      render();
      scheduleFocusAlarm(state.activeSession);
      return;
    }
    const expiredContinuations = expireStaleContinuations();
    if (expiredContinuations > 0) {
      ensureDailyPlan();
      saveState();
      render();
    }
    // タブに戻ったとき他のデバイスの変更を取得
    _resyncFromSupabase();
  });
  window.addEventListener("pagehide", () => {
    if (!state.activeSession) return;
    syncActiveGoalRecord();
    localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
  });
}

function handleKeydown(event) {
  if (event.key === "Enter" && event.target.matches?.(".time-task-capture__title")) {
    event.preventDefault();
    event.target.closest(".time-task-capture")?.querySelector('[data-action="add-task"]')?.click();
    return;
  }
  const inlineAvailabilityHandle = event.target.closest?.("[data-inline-availability-drag-handle]");
  if (inlineAvailabilityHandle && ["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
    const slotId = inlineAvailabilityHandle.dataset.slotId || "";
    const edge = inlineAvailabilityHandle.dataset.inlineAvailabilityDragHandle || "";
    const plan = ensureDailyPlan();
    const bounds = getAvailabilitySlotEdgeBounds(plan.slots, slotId, edge);
    if (!bounds) return;
    const minute = event.key === "Home"
      ? bounds.min
      : event.key === "End"
        ? bounds.max
        : bounds.current + (event.key === "ArrowDown" ? TIME_SNAP_MINUTES : -TIME_SNAP_MINUTES);
    const result = updateAvailabilityEdgeInSlots(plan.slots, slotId, edge, minute);
    if (result) {
      plan.slots = result.slots;
      finalizeTodayAvailability(plan);
      saveState();
      render();
      Array.from(document.querySelectorAll("[data-inline-availability-drag-handle]"))
        .find((handle) => handle.dataset.slotId === slotId && handle.dataset.inlineAvailabilityDragHandle === edge)
        ?.focus();
    }
    event.preventDefault();
    return;
  }
  const availabilityHandle = event.target.closest?.("[data-availability-drag-handle]");
  if (availabilityHandle && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    const slotId = availabilityHandle.dataset.slotId || "";
    const edge = availabilityHandle.dataset.availabilityDragHandle || "";
    const bounds = getAvailabilityDraftEdgeBounds(slotId, edge);
    if (!bounds) return;
    const minute = event.key === "Home"
      ? bounds.min
      : event.key === "End"
        ? bounds.max
        : bounds.current + (["ArrowDown", "ArrowRight"].includes(event.key) ? TIME_SNAP_MINUTES : -TIME_SNAP_MINUTES);
    const slot = updateAvailabilityDraftEdge(slotId, edge, minute);
    if (slot) {
      render();
      Array.from(document.querySelectorAll("[data-availability-drag-handle]"))
        .find((handle) => handle.dataset.slotId === slotId && handle.dataset.availabilityDragHandle === edge)
        ?.focus();
    }
    event.preventDefault();
    return;
  }
  if (event.target.matches("input, textarea, select")) {
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  const tabViews = ["today", "review"];
  const viewIndex = Number(event.key) - 1;
  if (viewIndex >= 0 && viewIndex < tabViews.length) {
    if (state.activeSession) {
      ui.sessionOpen = true;
      render();
      showToast("セッション中は画面を切り替えられません");
      return;
    }
    state.meta.currentView = tabViews[viewIndex];
    if (state.meta.currentView === "today") {
      ui.todayMode = "execution";
    }
    saveNavState();
    render();
    if (screenFrame) screenFrame.scrollTop = 0;
    return;
  }

  if (event.key === "Escape") {
    if (state.activeSession) {
      keepSessionLocked("タイマー中は閉じられません。中断すると他の操作に戻れます。");
      return;
    }
    if (state.meta.currentView === "setup") {
      ui.setupDraft = null;
      ui.goalLibraryDraft = null;
      ui.roadmapDraft = null;
      ui.setupMode = "edit";
      state.meta.currentView = "today";
      render();
    } else if (ui.sessionOpen || state.activeSession) {
      ui.sessionOpen = false;
      render();
    }
  }
}

const SESSION_LOCK_ACTIONS = new Set([
  "close-session",
  "select-session-plan",
  "begin-session",
  "complete-session",
  "save-finish-log",
  "cancel-finish",
  "confirm-abort-session",
  "cancel-abort-confirm",
  "hold-session",
  "abort-session",
]);

function keepSessionLocked(message = "タイマー中は他の操作ができません。中断すると戻れます。") {
  ui.sessionOpen = true;
  render();
  showToast(message);
}

function blockWhenSessionLocked(action) {
  if (state.activeSession && reconcileActiveSession({ persist: true })) {
    return false;
  }

  if (!state.activeSession || SESSION_LOCK_ACTIONS.has(action)) {
    return false;
  }

  keepSessionLocked();
  return true;
}

function renderWithTransition() {
  if (typeof document.startViewTransition === "function") {
    document.startViewTransition(() => {
      render();
    });
    return;
  }

  render();
}

function handleClick(event) {
  if (ui.taskSuppressClickUntil && Date.now() < ui.taskSuppressClickUntil) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const { action } = target.dataset;
  if (action === "select-task" && target.tagName !== "BUTTON") {
    const nestedControl = event.target.closest("input, select, textarea, button");
    if (nestedControl) {
      return;
    }
  }
  if (blockWhenSessionLocked(action)) {
    return;
  }

  if (action === "dismiss-focus-lock-help") {
    ui.focusLockHelp = null;
    ui.pendingFocusStart = null;
    ui.sessionOpen = false;
    render();
    return;
  }

  if (action === "retry-focus-lock") {
    retryPendingFocusStart();
    return;
  }

  if (action === "navigate") {
    if (state.activeSession) {
      keepSessionLocked("タイマー中は画面を切り替えられません。中断すると戻れます。");
      return;
    }
      if (target.dataset.view !== "review") {
      ui.reviewLogDraft = null;
      ui.reviewLogExpanded = false;
    }
    const requestedView = target.dataset.view;
    if (requestedView === "tasks") {
      ui.todayMode = "organize";
    } else if (requestedView === "today") {
      ui.todayMode = "execution";
    }
    state.meta.currentView = requestedView === "garden" || requestedView === "tasks" ? "today" : requestedView;
    saveNavState();
    render();
    if (screenFrame) screenFrame.scrollTop = 0;
    return;
  }

  if (action === "set-today-mode") {
    ui.todayMode = ["time", "organize"].includes(target.dataset.mode)
      ? target.dataset.mode
      : "execution";
    ui.selectedTaskId = null;
    renderWithTransition();
    if (screenFrame) screenFrame.scrollTop = 0;
    return;
  }

  if (action === "set-habit-default-time") {
    const workId = target.dataset.workId || "";
    const item = getWorkItemById(workId);
    const items = getTodayOrderedWorkItems();
    const plan = ensureDailyPlan();
    const row = buildTodayTimeRows(items, plan)
      .find((entry) => entry.item.id === workId);
    if (!item?.isHabit || !row) return;

    const duration = Math.max(TIME_SNAP_MINUTES, getGoalDurationMinutes(item.goal));
    const requestedStart = Math.max(0, row.startMinutes % AVAILABILITY_DAY_MINUTES);
    const endMinute = Math.min(AVAILABILITY_DAY_MINUTES - TIME_SNAP_MINUTES, requestedStart + duration);
    const startMinute = Math.max(0, Math.min(requestedStart, endMinute - TIME_SNAP_MINUTES));
    const window = `${minutesToClockTime(startMinute)}-${minutesToClockTime(endMinute)}`;
    patchWorkItem(workId, {
      primaryWindow: window,
      backupWindow: window,
      rescueWindow: window,
    });
    plan.defaultStartTimes = {
      ...normalizeScheduleStartTimes(plan.defaultStartTimes),
      [workId]: minutesToClockTime(startMinute),
    };
    saveState();
    renderWithTransition();
    showToast(`習慣の時間を ${window} にしました。`);
    return;
  }

  if (action === "go-to-today") {
    state.meta.currentView = "today";
    ui.todayMode = "execution";
    ui.selectedTaskId = null;
    saveNavState();
    renderWithTransition();
    if (screenFrame) screenFrame.scrollTop = 0;
    return;
  }

  if (action === "open-review") {
    const goalId = target.dataset.goalId || "";
    ui.reviewGoalFilter = goalId || "all";
    ui.reviewLogDraft = null;
    ui.reviewLogExpanded = false;
    state.meta.currentView = "review";
    saveNavState();
    renderWithTransition();
    if (screenFrame) screenFrame.scrollTop = 0;
    return;
  }

  if (action === "set-review-range") {
    const days = Number(target.dataset.days);
    ui.reviewRangeDays = days === 30 ? 30 : 7;
    render();
    return;
  }

  if (action === "toggle-today-planner") {
    ui.todayPlannerOpen = !ui.todayPlannerOpen;
    renderWithTransition();
    return;
  }

  if (action === "auto-plan-today") {
    const stats = autoArrangeTodayPlan();
    saveState();
    renderWithTransition();
    showToast(stats.overflowMinutes > 0
      ? `空き枠に入り切らない ${stats.overflowMinutes}分は残してあります。`
      : "空き時間に沿って並べました。");
    return;
  }

  if (action === "plan-work-today") {
    const result = planWorkItemToday(target.dataset.workId || "", target.dataset.slotId || "");
    if (!result) return;
    saveState();
    renderWithTransition();
    showToast(result.remainingMinutes > 0
      ? `${result.allocatedMinutes}分を入れ、残り${result.remainingMinutes}分は未配置にしました。`
      : "空き時間に入れました。");
    return;
  }

  if (action === "open-availability-settings" || action === "open-today-availability" || action === "adjust-today-capacity") {
    ui.availabilityMode = action === "open-availability-settings" ? "default" : "today";
    ui.availabilityReturnView = ui.availabilityMode === "today" ? "time" : "setup";
    ui.availabilityDraft = buildAvailabilityDraft(ui.availabilityMode);
    ui.setupSection = "availability";
    state.meta.currentView = "setup";
    renderWithTransition();
    if (screenFrame) screenFrame.scrollTop = 0;
    return;
  }

  if (action === "add-availability-slot") {
    const draft = Array.isArray(ui.availabilityDraft) ? ui.availabilityDraft : buildAvailabilityDraft(ui.availabilityMode);
    if (draft.length >= MAX_AVAILABILITY_SLOTS) {
      showToast(`空き枠は${MAX_AVAILABILITY_SLOTS}個までです。`);
      return;
    }
    ui.availabilityDraft = [...draft, createNextAvailabilitySlot(draft)];
    render();
    return;
  }

  if (action === "remove-availability-slot") {
    const slotId = target.dataset.slotId || "";
    const draft = Array.isArray(ui.availabilityDraft) ? ui.availabilityDraft : [];
    if (draft.length <= 1) {
      showToast("空き枠は1つ以上残してください。");
      return;
    }
    ui.availabilityDraft = draft.filter((slot) => slot.id !== slotId);
    render();
    return;
  }

  if (action === "cancel-availability-settings") {
    ui.availabilityDraft = null;
    if (ui.availabilityReturnView === "time") {
      state.meta.currentView = "today";
      ui.todayMode = "time";
    } else {
      ui.setupSection = "home";
    }
    renderWithTransition();
    return;
  }

  if (action === "save-availability-settings") {
    const rawDraft = Array.isArray(ui.availabilityDraft) ? ui.availabilityDraft : [];
    const validDraft = rawDraft.map(normalizeAvailabilitySlot).filter(Boolean);
    if (!validDraft.length) {
      showToast("開始と終了を5分以上あけて設定してください。");
      return;
    }
    const slots = normalizeAvailabilitySlots(validDraft);
    const plan = ensureDailyPlan();
    const completedAllocations = plan.allocations.filter((allocation) => allocation.completedAt);
    if (ui.availabilityMode === "default") {
      plan.defaultSlots = cloneData(slots);
    }
    plan.slots = cloneData(slots);
    plan.allocations = normalizePlanAllocations(completedAllocations, plan.slots);
    reconcileDailyPlanSelections(plan);
    reconcileDailyPlanAllocations(plan);
    plan.capacityMinutes = getAvailabilityMinutes(plan.slots);
    ui.availabilityDraft = null;
    if (ui.availabilityReturnView === "time") {
      state.meta.currentView = "today";
      ui.todayMode = "time";
    } else {
      ui.setupSection = "home";
    }
    saveState();
    renderWithTransition();
    showToast(ui.availabilityMode === "default" ? "いつもの空き時間を保存しました。" : "今日の空き時間を更新しました。");
    return;
  }

  if (action === "add-today-task") {
    const draft = ensureTaskDraft();
    const title = String(draft.title || "").trim();
    if (!title) {
      showToast("やることを入れてください。");
      return;
    }
    const now = new Date().toISOString();
    state.tasks = [normalizeTask({
      id: createTaskId(),
      title,
      minutes: normalizeTaskMinutes(draft.minutes),
      status: "active",
      quadrant: TASK_QUADRANT_NEW,
      plannedDate: toISODate(new Date()),
      createdAt: now,
      updatedAt: now,
    }), ...normalizeTasks(state.tasks)];
    ensureDailyPlan();
    resetTaskDraft();
    saveState();
    render();
    showToast("今日に追加しました。");
    return;
  }

  if (action === "toggle-task-today" || action === "toggle-work-today") {
    const workId = target.dataset.workId || target.dataset.taskId || "";
    const item = getWorkItemById(workId);
    if (!item) return;
    const addToToday = !isWorkItemSelectedToday(item, ensureDailyPlan());
    const result = setWorkItemSelectedToday(workId, addToToday);
    if (result?.blockedByContinuation) {
      showToast("中断した続きは、完了するまで今日に残ります。");
      return;
    }
    const stats = getTodayPlanStats();
    saveState();
    renderWithTransition();
    showToast(addToToday
      ? stats.overflowMinutes > 0
        ? `今日に入れました。${stats.overflowMinutes}分多めです。`
        : "今日に入れました。"
      : "今日やらないへ移しました。");
    return;
  }

  if (action === "repeat-review-entry") {
    const entry = getAllExecutionLogs().find((item) => item.logId === target.dataset.logId);
    if (!entry) {
      showToast("記録が見つかりませんでした。");
      return;
    }

    if (entry.itemKind === "goal") {
      const goal = listGoals().find((item) => item.id === entry.goalId);
      if (!goal) {
        showToast("元の習慣・目標が見つかりませんでした。");
        return;
      }
      const planKey = state.plans?.[entry.outcome] ? entry.outcome : getLaunchPlan(state);
      const pending = { type: "goal", goalId: goal.id, planKey, explicitRepeat: true };
      requireDeviceAppLockBeforeStart(() => startPendingFocusSession(pending), pending);
      return;
    }

    const now = new Date().toISOString();
    const minutes = Math.max(1, Math.ceil(Number(entry.plannedSeconds || entry.elapsedSeconds || 300) / 60));
    const repeatedTask = normalizeTask({
      id: createTaskId(),
      title: entry.itemTitle || "Task",
      minutes,
      status: "active",
      quadrant: entry.quadrant,
      plannedDate: toISODate(new Date()),
      plannedSeconds: minutes * 60,
      createdAt: now,
      updatedAt: now,
    });
    state.tasks = [repeatedTask, ...normalizeTasks(state.tasks)];
    saveState();
    const pending = { type: "task", taskId: repeatedTask.id, explicitRepeat: true };
    requireDeviceAppLockBeforeStart(() => startPendingFocusSession(pending), pending);
    return;
  }

  if (action === "open-setup") {
    if (state.activeSession) {
      keepSessionLocked("タイマー中は設定を開けません。中断すると戻れます。");
      return;
    }
    ui.setupMode = "edit";
    ui.setupDraft = expandSetup(state.setup);
    ui.goalLibraryDraft = null;
    ui.roadmapDraft = null;
    ui.reviewLogDraft = null;
    ui.reviewLogExpanded = false;
    ui.setupSection = target.dataset.section && target.dataset.section !== "home" ? "detail" : "home";
    state.meta.currentView = "setup";
    render();
    requestAppShieldStatus();
    return;
  }

  if (action === "start-new-goal") {
    ui.setupMode = "new_goal";
    ui.setupDraft = buildNewGoalDraft(state.setup);
    ui.goalLibraryDraft = null;
    ui.roadmapDraft = null;
    ui.reviewLogDraft = null;
    ui.reviewLogExpanded = false;
    ui.setupSection = "detail";
    state.meta.currentView = "setup";
    render();
    return;
  }

  if (action === "open-goal-settings") {
    const goalId = target.dataset.goalId || "";
    if (!goalId || !activateGoal(goalId)) {
      return;
    }
    ui.setupMode = "edit";
    ui.setupDraft = expandSetup(state.setup);
    ui.setupSection = "detail";
    ui.deleteConfirmGoalId = null;
    render();
    if (screenFrame) screenFrame.scrollTop = 0;
    return;
  }

  if (action === "back-to-settings") {
    ui.setupMode = "edit";
    ui.setupDraft = expandSetup(state.setup);
    ui.setupSection = "home";
    ui.deleteConfirmGoalId = null;
    render();
    requestAppShieldStatus();
    if (screenFrame) screenFrame.scrollTop = 0;
    return;
  }

  if (action === "edit-current-goal") {
    ui.setupMode = "edit";
    ui.setupDraft = expandSetup(state.setup);
    ui.goalLibraryDraft = null;
    ui.roadmapDraft = null;
    ui.reviewLogDraft = null;
    ui.reviewLogExpanded = false;
    ui.setupSection = target.dataset.section || ui.setupSection || "goal";
    state.meta.currentView = "setup";
    render();
    return;
  }

  if (action === "select-goal") {
    const goalId = target.dataset.goalId || "";
    if (goalId && goalId !== state.meta.activeGoalId && activateGoal(goalId)) {
      renderWithTransition();
    }
    return;
  }

  if (action === "activate-goal") {
    if (activateGoal(target.dataset.goalId || "")) {
      ui.goalLibraryDraft = null;
      render();
      showToast("表示する目標を切り替えました。");
    }
    return;
  }

  // データ保持したまま非表示へ移動
  if (action === "archive-goal") {
    const goalId = target.dataset.goalId;
    ensureGoalCollection();
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    if (listGoals().length <= 1) {
      showToast("最後の目標は非表示にできません。");
      return;
    }
    goal.archived = true;
    goal.archivedAt = toISODate(new Date());
    // アーカイブ対象がアクティブ目標なら別の目標へ切り替え
    if (goalId === state.meta.activeGoalId) {
      const next = state.goals.find(g => !g.archived && g.id !== goalId);
      if (next) { applyGoalRecord(next); state.meta.activeGoalId = next.id; }
    }
    ui.goalLibraryDraft = null;
    ui.deleteConfirmGoalId = null;
    ui.setupSection = "home";
    saveState();
    render();
    showToast("目標を非表示にしました。");
    return;
  }

  // 完全消去の確認ステップ
  if (action === "confirm-delete-goal") {
    ui.deleteConfirmGoalId = target.dataset.goalId;
    render();
    return;
  }

  if (action === "cancel-delete-goal") {
    ui.deleteConfirmGoalId = null;
    render();
    return;
  }

  // 完全消去（確認後）
  if (action === "delete-goal") {
    const goalId = target.dataset.goalId;
    ensureGoalCollection();
    if (state.goals.length <= 1) {
      showToast("最後の目標は削除できません。");
      return;
    }
    if (goalId === state.meta.activeGoalId) {
      const next = state.goals.find(g => !g.archived && g.id !== goalId);
      if (next) { applyGoalRecord(next); state.meta.activeGoalId = next.id; }
    }
    state.goals = state.goals.filter(g => g.id !== goalId);
    ui.goalLibraryDraft = null;
    ui.deleteConfirmGoalId = null;
    ui.setupSection = "home";
    saveState();
    render();
    showToast("目標を完全に削除しました。");
    return;
  }

  // 非表示リストから完全消去
  if (action === "purge-archived-goal") {
    const goalId = target.dataset.goalId;
    ensureGoalCollection();
    state.goals = state.goals.filter(g => g.id !== goalId);
    ui.deleteConfirmGoalId = null;
    saveState();
    render();
    showToast("非表示の目標を削除しました。");
    return;
  }

  if (action === "start-goal-library-edit") {
    ui.goalLibraryDraft = buildGoalLibraryDraft(target.dataset.goalId || "");
    render();
    return;
  }

  if (action === "cancel-goal-library-edit") {
    ui.goalLibraryDraft = null;
    render();
    return;
  }

  if (action === "save-goal-library-edit") {
    if (!commitGoalLibraryDraft()) {
      showToast("目標名を入れてください。");
      return;
    }
    render();
    showToast("目標を更新しました。");
    return;
  }

  if (action === "close-setup") {
    ui.setupDraft = null;
    ui.goalLibraryDraft = null;
    ui.roadmapDraft = null;
    ui.setupMode = "edit";
    state.meta.currentView = "today";
    render();
    return;
  }

  if (action === "export-data") {
    exportData();
    return;
  }

  if (action === "sign-out") {
    signOut();
    return;
  }

  if (action === "delete-account") {
    deleteAccount();
    return;
  }

  if (action === "open-privacy") {
    window.location.assign("./privacy.html");
    return;
  }

  if (action === "configure-app-shield") {
    const bridge = window.webkit?.messageHandlers?.appShield;
    if (!bridge) {
      showToast("集中中のアプリ設定はiPhoneアプリで利用できます。");
      return;
    }
    try {
      bridge.postMessage({ action: "configure" });
    } catch (err) {
      showToast("アプリ制限はiPhoneアプリでのみ使えます。");
    }
    return;
  }

  if (action === "import-data") {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.addEventListener("change", (e) => {
      importData(e.target.files[0]);
    });
    fileInput.click();
    return;
  }

  if (action === "select-setup-section") {
    ui.setupSection = target.dataset.section || "home";
    render();
    return;
  }

  if (action === "select-study-mode") {
    ensureSetupDraft();
    ui.setupDraft.studyMode = target.dataset.value;
    render();
    return;
  }

  if (action === "toggle-study-day") {
    ensureSetupDraft();
    const weekdayKey = target.dataset.weekday || "";
    const nextDays = toggleStudyDay(ui.setupDraft.studyDays, weekdayKey);
    if (!nextDays.length) {
      showToast("実施曜日を1つ以上選んでください。");
      return;
    }
    ui.setupDraft.studyDays = nextDays;
    render();
    return;
  }

  if (action === "select-goal-library-type") {
    if (!ui.goalLibraryDraft) return;
    const t = target.dataset.goalType;
    if (t === "habit" || t === "goal") {
      ui.goalLibraryDraft.goalType = t;
      render();
    }
    return;
  }

  if (action === "save-setup") {
    if ((state.meta.demoMode || ui.setupMode === "new_goal") && !ui.setupDraft.goal.trim()) {
      showToast("新しい目標名を入れてください。");
      return;
    }
    const conflicts = getPrimaryWindowRoster(ui.setupDraft).filter((item) => item.overlaps);
    const saveResult = commitSetupDraft();
    if (!saveResult) {
      return;
    }
    ui.goalLibraryDraft = null;
    ui.setupSection = "home";
    render();
    requestAppShieldStatus();
    if (saveResult === "created" && conflicts.length) {
      showToast(`目標を追加しました。実施時間は ${conflicts.map((item) => item.label).join(" / ")} と重なっています。`);
    } else if (saveResult === "created") {
      showToast("目標を追加しました。設定画面で確認できます。");
    } else if (saveResult === "reset" && conflicts.length) {
      showToast(`設定を保存しました。実施時間は ${conflicts.map((item) => item.label).join(" / ")} と重なっています。`);
    } else if (saveResult === "reset") {
      showToast("設定を保存しました。");
    } else if (conflicts.length) {
      showToast(`設定を保存しました。実施時間は ${conflicts.map((item) => item.label).join(" / ")} と重なっています。`);
    } else {
      showToast("設定を保存しました。");
    }
    return;
  }
  if (action === "add-task") {
    const draft = ensureTaskDraft();
    const title = String(draft.title || "").trim();
    if (!title) {
      showToast("Task名を入れてください。");
      return;
    }
    state.tasks = normalizeTasks(state.tasks);
    state.tasks.unshift(normalizeTask({
      id: createTaskId(),
      title,
      minutes: normalizeTaskMinutes(draft.minutes),
      status: "active",
      quadrant: TASK_QUADRANT_NEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    resetTaskDraft();
    saveState();
    render();
    showToast("Taskに追加しました。");
    return;
  }

  if (action === "start-task-session") {
    const taskId = target.dataset.taskId || "";
    const allocationId = target.dataset.allocationId || "";
    if (state.meta.currentView === "today" && ui.todayMode === "organize") {
      const task = getTaskById(taskId);
      if (task && !isTaskPlannedToday(task)) {
        updateTask(taskId, () => ({ plannedDate: toISODate(new Date()) }));
        saveState();
      }
      ui.todayMode = "execution";
      ui.selectedTaskId = null;
      renderWithTransition();
      if (screenFrame) screenFrame.scrollTop = 0;
      showToast("開始は「今日」から行います。");
      return;
    }
    const pending = { type: "task", taskId, allocationId };
    requireDeviceAppLockBeforeStart(() => {
      startPendingFocusSession(pending);
    }, pending);
    return;
  }

  if (action === "select-task") {
    ui.selectedTaskId = target.dataset.taskId || null;
    render();
    return;
  }

  if (action === "add-subtask") {
    const taskId = target.dataset.taskId || "";
    const title = getTaskSubtaskDraft(taskId).trim();
    if (!title) {
      showToast("小Task名を入れてください。");
      return;
    }
    const task = addTaskSubtask(taskId, title);
    if (task) {
      clearTaskSubtaskDraft(taskId);
      saveState();
      render();
      showToast("小Taskを追加しました。");
    }
    return;
  }

  if (action === "toggle-subtask") {
    const taskId = target.dataset.taskId || "";
    const subtaskId = target.dataset.subtaskId || "";
    const task = updateTaskSubtask(taskId, subtaskId, (subtask) => {
      const done = !subtask.done;
      return {
        done,
        completedAt: done ? new Date().toISOString() : null,
      };
    });
    if (task) {
      saveState();
      render();
    }
    return;
  }

  if (action === "delete-subtask") {
    const taskId = target.dataset.taskId || "";
    const subtaskId = target.dataset.subtaskId || "";
    const task = removeTaskSubtask(taskId, subtaskId);
    if (task) {
      saveState();
      render();
      showToast("小Taskを削除しました。");
    }
    return;
  }

  if (action === "complete-task") {
    const taskId = target.dataset.taskId || "";
    const task = updateTask(taskId, (currentTask) => ({
      status: "done",
      completedMinutes: currentTask.minutes,
      completedAt: new Date().toISOString(),
      pausedRemainingSeconds: null,
      pausedSegmentMinutes: null,
      pausedAt: null,
      pausedAllocationId: "",
    }));
    if (task) {
      removeWorkItemFromDailyPlan(taskId);
      if (ui.selectedTaskId === taskId) {
        ui.selectedTaskId = null;
      }
      saveState();
      render();
      showToast("Taskを完了にしました。");
    }
    return;
  }

  if (action === "shelve-task") {
    const taskId = target.dataset.taskId || "";
    const task = updateTask(taskId, () => ({
      status: "shelved",
      shelvedAt: new Date().toISOString(),
    }));
    if (task) {
      removeWorkItemFromDailyPlan(taskId);
      if (ui.selectedTaskId === taskId) {
        ui.selectedTaskId = null;
      }
      saveState();
      render();
      showToast("Taskを棚上げしました。");
    }
    return;
  }

  if (action === "restore-task") {
    const task = updateTask(target.dataset.taskId || "", () => ({
      status: "active",
      shelvedAt: null,
    }));
    if (task) {
      saveState();
      render();
      showToast("Taskを戻しました。");
    }
    return;
  }

  if (action === "delete-task") {
    const taskId = target.dataset.taskId || "";
    const before = normalizeTasks(state.tasks).length;
    removeWorkItemFromDailyPlan(taskId);
    state.tasks = normalizeTasks(state.tasks).filter((task) => task.id !== taskId);
    if (state.tasks.length !== before) {
      if (ui.selectedTaskId === taskId) {
        ui.selectedTaskId = null;
      }
      saveState();
      render();
      showToast("Taskを削除しました。");
    }
    return;
  }

  if (action === "toggle-shelved-tasks") {
    ui.taskShowShelved = !ui.taskShowShelved;
    render();
    return;
  }

  if (action === "start-goal-session") {
    const goalId = target.dataset.goalId || "";
    const allocationId = target.dataset.allocationId || "";
    const goal = listGoals().find((item) => item.id === goalId);
    if (goal && getGoalMissionStateForDate(goal).isClosed) {
      ui.reviewGoalFilter = goal.id;
      state.meta.currentView = "review";
      saveNavState();
      renderWithTransition();
      if (screenFrame) screenFrame.scrollTop = 0;
      showToast("今日は完了済みです。もう一度行う場合はReviewから選べます。");
      return;
    }
    if (state.meta.currentView === "today" && ui.todayMode === "organize") {
      ui.todayMode = "execution";
      ui.selectedTaskId = null;
      renderWithTransition();
      if (screenFrame) screenFrame.scrollTop = 0;
      showToast("開始は「今日」から行います。");
      return;
    }
    if (goalId && goalId !== state.meta.activeGoalId) {
      activateGoal(goalId);
    }
    const planKey = getLaunchPlan(state);
    ui.selectedSessionPlan = planKey;
    const pending = { type: "goal", goalId: goalId || state.meta.activeGoalId, planKey, allocationId };
    requireDeviceAppLockBeforeStart(() => {
      startPendingFocusSession(pending);
    }, pending);
    return;
  }

  if (action === "close-session") {
    if (state.activeSession) {
      keepSessionLocked("タイマー中は閉じられません。中断すると他の操作に戻れます。");
      return;
    }
    ui.sessionOpen = false;
    ui.focusLockHelp = null;
    ui.pendingFocusStart = null;
    render();
    return;
  }

  if (action === "select-session-plan") {
    const planKey = target.dataset.plan;
    if (state.activeSession && !ui.finishDraft) {
      keepSessionLocked("タイマー中は分数を変更できません。完了するか中断してください。");
      return;
    }
    if (ui.finishDraft) {
      if (!state.plans[planKey]) return;
      ui.finishDraft.outcome = planKey;
      ui.finishDraft.plannedSeconds = state.plans[planKey].minutes * 60;
      render();
      return;
    }

    ui.selectedSessionPlan = planKey;
    if (state.activeSession) {
      if (state.activeSession.planKey !== planKey) {
        openFinishDraft(planKey);
      }
      render();
      return;
    }

    render();
    return;
  }

  if (action === "begin-session") {
    const planKey = ui.selectedSessionPlan;
    const pending = { type: "plan", planKey };
    requireDeviceAppLockBeforeStart(() => {
      startPendingFocusSession(pending);
    }, pending);
    return;
  }

  if (action === "complete-session") {
    if (isTaskSession()) {
      const completesLegacyGoal = Boolean(state.activeSession?.sourceGoalId);
      const result = completeTaskSession();
      render();
      showToast(completesLegacyGoal
        ? "習慣・目標を完了にしました。"
        : result?.taskCompleted
          ? "Taskを完了にしました。"
          : "この時間枠を完了しました。");
      return;
    }
    openFinishDraft(state.activeSession ? state.activeSession.planKey : ui.selectedSessionPlan);
    render();
    return;
  }

  if (action === "save-finish-log") {
    saveFinishDraft();
    render();
    showToast("今日の記録を残しました。");
    return;
  }

  if (action === "cancel-finish") {
    ui.finishDraft = null;
    scheduleFocusAlarm(state.activeSession);
    syncDeviceAppLock();
    startSessionTicker();
    render();
    return;
  }

  if (action === "confirm-abort-session") {
    ui.showAbortConfirm = true;
    render();
    return;
  }

  if (action === "cancel-abort-confirm") {
    ui.showAbortConfirm = false;
    render();
    return;
  }

  if (action === "hold-session") {
    holdActiveSession();
    return;
  }

  if (action === "abort-session") {
    const legacyGoalTaskId = isTaskSession() && state.activeSession?.sourceGoalId
      ? state.activeSession.taskId
      : "";
    if (ui.sessionTimer) {
      window.clearInterval(ui.sessionTimer);
      ui.sessionTimer = null;
    }
    releaseWakeLock();
    if (legacyGoalTaskId) {
      state.tasks = normalizeTasks(state.tasks).filter((task) => task.id !== legacyGoalTaskId);
    }
    state.activeSession = null;
    ui.sessionOpen = false;
    ui.finishDraft = null;
    ui.showAbortConfirm = false;
    cancelFocusAlarm();
    syncDeviceAppLock();
    saveState();
    render();
    showToast("今回はここで終了しました。");
    return;
  }

  if (action === "select-goal-type") {
    ensureSetupDraft();
    const goalType = target.dataset.goalType;
    if (goalType === "habit" || goalType === "goal") {
      ui.setupDraft.goalType = goalType;
    }
    render();
    return;
  }

  if (action === "open-roadmap-editor") {
    if (ui.setupMode !== "new_goal") {
      ui.setupMode = "edit";
      ui.setupDraft = expandSetup(state.setup);
    }
    ui.setupSection = "roadmap";
    ui.roadmapDraft = buildRoadmapDraft(target.dataset.roadmapId || "", target.dataset.afterId || "");
    state.meta.currentView = "setup";
    render();
    return;
  }

  if (action === "cancel-roadmap-editor") {
    ui.roadmapDraft = null;
    render();
    return;
  }

  if (action === "save-roadmap-item") {
    const saved = commitRoadmapDraft();
    render();
    if (saved) {
      showToast("マイルストーンを保存しました。");
    } else {
      showToast("タイトルを入れてください。");
    }
    return;
  }

  if (action === "delete-roadmap-item") {
    deleteRoadmapItem(target.dataset.roadmapId || "");
    render();
    showToast("マイルストーンを削除しました。");
    return;
  }

  if (action === "open-review-log-editor") {
    const opened = openReviewLogDraft(target.dataset.logId || "");
    render();
    showToast(opened ? "記録を修正できます。" : "修正できる記録が見つかりません。");
    return;
  }

  if (action === "cancel-review-log-edit") {
    ui.reviewLogDraft = null;
    render();
    return;
  }

  if (action === "toggle-review-log-list") {
    ui.reviewLogExpanded = !ui.reviewLogExpanded;
    render();
    return;
  }

  if (action === "save-review-log") {
    const saved = saveReviewLogDraft();
    render();
    showToast(saved ? "記録を更新しました。" : "実施日と実施時間を確認してください。");
    return;
  }

  if (action === "select-replan-mode") {
    state.replan.mode = target.dataset.mode;
    if (state.replan.mode === "retarget_goal") {
      syncRetargetDraftFromState();
    }
    state.replan.preview = generateReplanPreview(state.replan.mode, state.replan.text, state);
    saveState();
    render();
    return;
  }

  if (action === "generate-replan") {
    state.replan.preview = generateReplanPreview(state.replan.mode, state.replan.text, state);
    saveState();
    render();
    return;
  }

  if (action === "apply-replan") {
    applyReplan(state.replan.mode, state.replan.preview);
    state.replan.preview = generateReplanPreview(state.replan.mode, state.replan.text, state);
    state.meta.currentView = "today";
    saveState();
    render();
    showToast("差分を適用しました。");
  }
}

function handleInput(event) {
  const target = event.target;

  if (target.matches("[data-availability-field]")) {
    const slotId = target.dataset.slotId || "";
    const field = target.dataset.availabilityField;
    if (!["start", "end"].includes(field) || !Array.isArray(ui.availabilityDraft)) {
      return;
    }
    ui.availabilityDraft = ui.availabilityDraft.map((slot) => (
      slot.id === slotId ? { ...slot, [field]: target.value } : slot
    ));
    return;
  }

  if (state.meta.currentView === "setup") {
    ensureSetupDraft();

    if (target.matches("[data-setup-field]")) {
      ui.setupDraft[target.dataset.setupField] = target.value;
      return;
    }

    if (target.matches("[data-goal-library-field]")) {
      if (!ui.goalLibraryDraft) {
        return;
      }

      ui.goalLibraryDraft[target.dataset.goalLibraryField] = target.value;
      return;
    }
  }

  if (target.matches("[data-task-draft-field]")) {
    const draft = ensureTaskDraft();
    draft[target.dataset.taskDraftField] = target.value;
    return;
  }

  if (target.matches("[data-subtask-draft-field]")) {
    setTaskSubtaskDraft(target.dataset.taskId || "", target.value);
    return;
  }

  if (target.matches("[data-task-title-field]")) {
    const task = updateTaskTitle(target.dataset.taskTitleField || "", target.value);
    if (task) {
      saveState();
    }
    return;
  }

  if (target.matches("[data-subtask-title-field]")) {
    const task = updateTaskSubtask(
      target.dataset.taskId || "",
      target.dataset.subtaskTitleField || "",
      () => ({ title: target.value })
    );
    if (task) {
      saveState();
    }
    return;
  }

  if (target.matches("[data-finish-field]")) {
    if (!ui.finishDraft) {
      return;
    }

    if (target.dataset.finishField === "elapsedInput") {
      const parsed = parseElapsedInput(target.value);
      if (parsed !== null && parsed > 0) {
        ui.finishDraft.elapsedSeconds = parsed;
        target.classList.remove("is-invalid");
        const edited = parsed !== ui.finishDraft._originalElapsed;
        target.classList.toggle("is-edited", edited);
        // Update the human-readable unit label without full re-render (keeps focus)
        const unitEl = target.closest(".elapsed-timer-wrap")?.querySelector(".elapsed-timer-unit");
        if (unitEl) unitEl.textContent = edited ? formatLoggedDuration(parsed) : "";
      } else {
        target.classList.add("is-invalid");
        target.classList.remove("is-edited");
      }
      return;
    }

    ui.finishDraft[target.dataset.finishField] = target.value;
    return;
  }

  if (target.matches("[data-review-log-field]")) {
    if (!ui.reviewLogDraft) {
      return;
    }

    ui.reviewLogDraft[target.dataset.reviewLogField] = target.value;
    return;
  }

  if (target.matches("[data-roadmap-field]")) {
    if (!ui.roadmapDraft) {
      return;
    }

    ui.roadmapDraft[target.dataset.roadmapField] = target.value;
    return;
  }

  if (target.matches("[data-replan-field]")) {
    state.replan[target.dataset.replanField] = target.value;
    saveState();
  }
}

function handleChange(event) {
  const target = event.target;

  if (target.matches("[data-time-start-field]")) {
    const minute = clockTimeToMinutes(target.value);
    const row = setTodayWorkStartMinute(target.dataset.timeStartField || "", minute, { reorder: true });
    if (!row) {
      showToast("開始時刻を確認してください。");
      render();
      return;
    }
    saveState();
    renderWithTransition();
    showToast(row.shiftedMinutes > 0
      ? `${formatScheduleClock(row.startMinutes)}からに調整しました。`
      : `${formatScheduleClock(row.startMinutes)}からにしました。`);
    return;
  }

  if (target.matches("[data-availability-field]")) {
    render();
    return;
  }

  if (target.matches("[data-review-goal-filter]")) {
    ui.reviewGoalFilter = target.value || "all";
    ui.reviewLogDraft = null;
    render();
    return;
  }

  if (target.matches("[data-task-title-field]")) {
    const task = updateTaskTitle(target.dataset.taskTitleField || "", target.value);
    if (task) {
      saveState();
      scheduleTaskEditRender();
    }
    return;
  }

  if (target.matches("[data-subtask-title-field]")) {
    const task = updateTaskSubtask(
      target.dataset.taskId || "",
      target.dataset.subtaskTitleField || "",
      () => ({ title: target.value })
    );
    if (task) {
      saveState();
      scheduleTaskEditRender();
    }
    return;
  }

  if (target.matches("[data-task-minutes-field]")) {
    const task = updateTaskMinutes(target.dataset.taskMinutesField || "", target.value);
    if (task) {
      saveState();
      render();
    }
    return;
  }

  if (target.matches("[data-task-quadrant-select]")) {
    const nextQuadrant = normalizeTaskQuadrant(target.value);
    const taskId = target.dataset.taskQuadrantSelect || "";
    const task = assignTaskQuadrant(taskId, nextQuadrant);
    if (task) {
      ui.selectedTaskId = nextQuadrant === TASK_QUADRANT_DEFAULT ? null : taskId;
      saveState();
      render();
      showToast(`${getTaskQuadrantToastLabel(nextQuadrant)}に移しました。`);
    }
  }
}

function getTaskDragSource(target) {
  return target?.closest?.("[data-task-draggable='true'][data-task-id]") || null;
}

function getTaskPointerDragCard(target) {
  const handle = target?.closest?.("[data-task-drag-handle]");
  return handle ? handle.closest("[data-task-draggable='true'][data-task-id]") : null;
}

function getTaskDropZone(target) {
  return target?.closest?.("[data-task-quadrant-zone]") || null;
}

function getTaskDropItem(target) {
  return target?.closest?.("[data-task-drop-item='true'][data-task-id]") || null;
}

function clearTaskDropMarkers() {
  document.querySelectorAll(".is-drop-before, .is-drop-after").forEach((el) => {
    el.classList.remove("is-drop-before", "is-drop-after");
  });
}

function clearTaskDragState() {
  document.querySelectorAll(".is-drag-over, .is-dragging, .is-drop-before, .is-drop-after").forEach((el) => {
    el.classList.remove("is-drag-over", "is-dragging", "is-drop-before", "is-drop-after");
  });
  ui.taskDragBeforeId = null;
  removeTaskDragPreview();
  document.body.classList.remove("is-task-pointer-dragging");
}

function getTaskDragTitle(source) {
  return source?.querySelector?.(".task-board-item__title, .task-card__title")?.textContent?.trim()
    || "Task";
}

function createTaskDragPreview(source, event) {
  removeTaskDragPreview();
  const rect = source.getBoundingClientRect();
  const preview = document.createElement("div");
  const title = getTaskDragTitle(source);
  const width = Math.min(Math.max(rect.width, 148), 260);
  preview.className = "task-drag-preview";
  preview.style.width = `${width}px`;
  preview.innerHTML = `
    <span class="task-drag-preview__grip" aria-hidden="true"></span>
    <span class="task-drag-preview__title">${escapeHtml(title)}</span>
  `;
  document.body.appendChild(preview);

  const drag = ui.taskPointerDrag;
  if (drag) {
    drag.previewEl = preview;
    drag.offsetX = Math.min(Math.max(event.clientX - rect.left, 18), width - 18);
    drag.offsetY = Math.min(Math.max(event.clientY - rect.top, 12), rect.height - 8);
    updateTaskDragPreview(event.clientX, event.clientY);
  }
}

function updateTaskDragPreview(clientX, clientY) {
  const drag = ui.taskPointerDrag;
  if (!drag?.previewEl) {
    return;
  }

  const x = Math.round(clientX - drag.offsetX);
  const y = Math.round(clientY - drag.offsetY);
  drag.previewEl.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(-1deg)`;
}

function removeTaskDragPreview() {
  const preview = ui.taskPointerDrag?.previewEl || document.querySelector(".task-drag-preview");
  preview?.remove();
}

function updateTaskDropIntent(target, clientY) {
  const zone = getTaskDropZone(target);
  document.querySelectorAll(".is-drag-over").forEach((el) => {
    if (el !== zone) {
      el.classList.remove("is-drag-over");
    }
  });
  clearTaskDropMarkers();
  ui.taskDragBeforeId = null;

  if (!zone) {
    return null;
  }

  zone.classList.add("is-drag-over");
  const item = getTaskDropItem(target);
  if (!item || item.dataset.taskId === ui.taskDragId || !zone.contains(item)) {
    return zone;
  }

  const rect = item.getBoundingClientRect();
  const shouldInsertBefore = clientY < rect.top + rect.height / 2;
  if (shouldInsertBefore) {
    ui.taskDragBeforeId = item.dataset.taskId || null;
    item.classList.add("is-drop-before");
    return zone;
  }

  const items = Array.from(zone.querySelectorAll("[data-task-drop-item='true'][data-task-id]"))
    .filter((el) => el.dataset.taskId !== ui.taskDragId);
  const itemIndex = items.indexOf(item);
  ui.taskDragBeforeId = items[itemIndex + 1]?.dataset.taskId || null;
  item.classList.add("is-drop-after");
  return zone;
}

function handleTaskDragStart(event) {
  if (state.activeSession) {
    return;
  }
  const source = getTaskDragSource(event.target);
  if (!source) {
    return;
  }

  ui.taskDragId = source.dataset.taskId || "";
  ui.taskDragBeforeId = null;
  source.classList.add("is-dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", ui.taskDragId);
  }
}

function handleTaskDragOver(event) {
  if (state.activeSession || !ui.taskDragId) {
    return;
  }
  const zone = updateTaskDropIntent(event.target, event.clientY);
  if (!zone) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

function handleTaskDragLeave(event) {
  const zone = getTaskDropZone(event.target);
  if (!zone || zone.contains(event.relatedTarget)) {
    return;
  }
  zone.classList.remove("is-drag-over");
}

function handleTaskDrop(event) {
  const zone = getTaskDropZone(event.target);
  if (state.activeSession || !zone) {
    return;
  }

  event.preventDefault();
  const taskId = event.dataTransfer?.getData("text/plain") || ui.taskDragId || "";
  const nextQuadrant = normalizeTaskQuadrant(zone.dataset.taskQuadrantZone || TASK_QUADRANT_DEFAULT);
  const task = moveTaskToQuadrant(taskId, nextQuadrant, ui.taskDragBeforeId);
  ui.taskDragId = null;
  clearTaskDragState();
  if (task) {
    ui.selectedTaskId = nextQuadrant === TASK_QUADRANT_DEFAULT ? null : taskId;
    saveState();
    render();
    showToast(`${getTaskQuadrantToastLabel(nextQuadrant)}に移しました。`);
  }
}

function handleTaskDragEnd() {
  ui.taskDragId = null;
  clearTaskDragState();
}

function getAvailabilitySlotBodyHeight(slot) {
  return Math.min(128, Math.max(50, Math.round(getAvailabilitySlotMinutes(slot) * 0.72)));
}

function finalizeTodayAvailability(plan) {
  const completedAllocations = plan.allocations.filter((allocation) => allocation.completedAt);
  plan.slots = normalizeAvailabilitySlots(plan.slots, plan.capacityMinutes);
  plan.allocations = normalizePlanAllocations(completedAllocations, plan.slots);
  reconcileDailyPlanSelections(plan);
  reconcileDailyPlanAllocations(plan);
  plan.capacityMinutes = getAvailabilityMinutes(plan.slots);
}

function refreshInlineAvailabilityDOM(plan, slotId, slot, draggedEdge = "", offsetY = 0) {
  if (slot) {
    Array.from(document.querySelectorAll("[data-inline-availability-drag-handle]"))
      .filter((handle) => handle.dataset.slotId === slotId)
      .forEach((handle) => {
        const edge = handle.dataset.inlineAvailabilityDragHandle;
        const row = handle.closest(".time-availability-handle");
        const time = row?.querySelector(`[data-inline-availability-time="${edge}"]`);
        const minute = clockTimeToMinutes(slot[edge]) ?? 0;
        handle.setAttribute("aria-valuenow", String(minute));
        handle.setAttribute("aria-valuetext", slot[edge]);
        handle.style.setProperty("--availability-drag-offset", edge === draggedEdge ? `${offsetY}px` : "0px");
        if (time) time.textContent = slot[edge];
      });
  }

  const total = getAvailabilityMinutes(plan.slots);
  document.querySelectorAll("[data-inline-availability-total]")
    .forEach((element) => { element.textContent = `${total}分`; });
}

function startInlineAvailabilityPointerDrag(event) {
  if (state.activeSession || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return false;
  const handle = event.target?.closest?.("[data-inline-availability-drag-handle]");
  if (!handle) return false;
  const slotId = handle.dataset.slotId || "";
  const edge = handle.dataset.inlineAvailabilityDragHandle || "";
  const plan = ensureDailyPlan();
  const bounds = getAvailabilitySlotEdgeBounds(plan.slots, slotId, edge);
  if (!bounds) return false;

  event.preventDefault();
  event.stopPropagation();
  ui.availabilityPointerDrag = {
    mode: "inline",
    pointerId: event.pointerId,
    slotId,
    edge,
    handleEl: handle,
    rowEl: handle.closest(".time-availability-handle"),
    startY: event.clientY,
    originMinute: bounds.current,
    originalSlots: cloneData(plan.slots),
    hasChanged: false,
  };
  handle.setPointerCapture?.(event.pointerId);
  handle.classList.add("is-dragging");
  ui.availabilityPointerDrag.rowEl?.classList.add("is-dragging");
  document.body.classList.add("is-availability-dragging", "is-inline-availability-dragging");
  return true;
}

function moveInlineAvailabilityPointerDrag(event, drag) {
  event.preventDefault();
  const stepDelta = Math.round((event.clientY - drag.startY) / INLINE_AVAILABILITY_DRAG_STEP_PX);
  const targetMinute = drag.originMinute + (stepDelta * TIME_SNAP_MINUTES);
  const plan = ensureDailyPlan();
  const result = updateAvailabilityEdgeInSlots(plan.slots, drag.slotId, drag.edge, targetMinute);
  if (!result) return true;
  plan.slots = result.slots;
  plan.capacityMinutes = getAvailabilityMinutes(plan.slots);
  drag.hasChanged = drag.hasChanged || result.minute !== drag.originMinute;
  const visualOffset = ((result.minute - drag.originMinute) / TIME_SNAP_MINUTES) * INLINE_AVAILABILITY_DRAG_STEP_PX;
  refreshInlineAvailabilityDOM(plan, drag.slotId, result.slot, drag.edge, visualOffset);
  return true;
}

function endInlineAvailabilityPointerDrag(event, drag) {
  drag.handleEl?.releasePointerCapture?.(event.pointerId);
  drag.handleEl?.classList.remove("is-dragging");
  drag.rowEl?.classList.remove("is-dragging");
  document.body.classList.remove("is-availability-dragging", "is-inline-availability-dragging");
  ui.availabilityPointerDrag = null;
  event.preventDefault();

  const plan = ensureDailyPlan();
  if (event.type === "pointercancel") {
    plan.slots = drag.originalSlots;
    plan.capacityMinutes = getAvailabilityMinutes(plan.slots);
    render();
    return true;
  }
  if (!drag.hasChanged) return true;
  finalizeTodayAvailability(plan);
  saveState();
  renderWithTransition();
  showToast("今日の空き時間を更新しました。");
  return true;
}

function startAvailabilityPointerDrag(event) {
  if (startInlineAvailabilityPointerDrag(event)) return true;
  if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return false;
  const handle = event.target?.closest?.("[data-availability-drag-handle]");
  const track = handle?.closest?.("[data-availability-range-rail]");
  if (!handle || !track || !Array.isArray(ui.availabilityDraft)) return false;
  const slotId = handle.dataset.slotId || track.dataset.slotId || "";
  const edge = handle.dataset.availabilityDragHandle || "";
  const bounds = getAvailabilityDraftEdgeBounds(slotId, edge);
  if (!slotId || !bounds) return false;

  event.preventDefault();
  event.stopPropagation();
  ui.availabilityPointerDrag = {
    mode: "settings",
    pointerId: event.pointerId,
    slotId,
    edge,
    handleEl: handle,
    trackEl: track,
    startY: event.clientY,
    originMinute: bounds.current,
    originalDraft: cloneData(ui.availabilityDraft),
    hasChanged: false,
  };
  handle.setPointerCapture?.(event.pointerId);
  handle.classList.add("is-dragging");
  document.body.classList.add("is-availability-dragging");
  return true;
}

function moveAvailabilityPointerDrag(event) {
  const drag = ui.availabilityPointerDrag;
  if (!drag || drag.pointerId !== event.pointerId) return false;
  if (drag.mode === "inline") return moveInlineAvailabilityPointerDrag(event, drag);
  event.preventDefault();
  const stepDelta = Math.round((event.clientY - drag.startY) / INLINE_AVAILABILITY_DRAG_STEP_PX);
  const slot = updateAvailabilityDraftEdge(
    drag.slotId,
    drag.edge,
    drag.originMinute + (stepDelta * TIME_SNAP_MINUTES),
  );
  if (slot) {
    const currentMinute = clockTimeToMinutes(slot[drag.edge]) ?? drag.originMinute;
    const visualOffset = ((currentMinute - drag.originMinute) / TIME_SNAP_MINUTES) * INLINE_AVAILABILITY_DRAG_STEP_PX;
    drag.hasChanged = drag.hasChanged || currentMinute !== drag.originMinute;
    refreshAvailabilityEditorDOM(drag.slotId, slot, drag.edge, visualOffset);
  }
  return true;
}

function endAvailabilityPointerDrag(event) {
  const drag = ui.availabilityPointerDrag;
  if (!drag || drag.pointerId !== event.pointerId) return false;
  if (drag.mode === "inline") return endInlineAvailabilityPointerDrag(event, drag);
  drag.handleEl?.releasePointerCapture?.(event.pointerId);
  drag.handleEl?.classList.remove("is-dragging");
  document.body.classList.remove("is-availability-dragging");
  ui.availabilityPointerDrag = null;
  event.preventDefault();
  if (event.type === "pointercancel") {
    ui.availabilityDraft = drag.originalDraft;
    render();
    return true;
  }
  if (drag.hasChanged) render();
  return true;
}

function getPlanPointerDragCard(target) {
  const handle = target?.closest?.("[data-plan-drag-handle]");
  return handle ? handle.closest("[data-plan-work-id]") : null;
}

function clearPlanPointerDragState() {
  document.querySelectorAll("[data-time-plan-zone].is-drag-over, [data-plan-work-id].is-dragging, .time-plan-item.is-drop-before, .time-plan-item.is-drop-after, .time-timeline-gap.is-drag-over")
    .forEach((element) => element.classList.remove("is-drag-over", "is-dragging", "is-drop-before", "is-drop-after"));
  ui.planPointerDrag?.previewEl?.remove();
  document.querySelector(".day-plan-drag-preview")?.remove();
  document.body.classList.remove("is-day-plan-dragging");
}

function createPlanDragPreview(source, event) {
  const rect = source.getBoundingClientRect();
  const title = source.querySelector(".time-plan-item__title, .time-candidate__title, .day-plan-segment__title, strong")?.textContent?.trim() || "Task";
  const preview = document.createElement("div");
  const width = Math.min(Math.max(rect.width, 156), 280);
  preview.className = "day-plan-drag-preview";
  preview.style.width = `${width}px`;
  preview.innerHTML = `
    ${renderPlanDragGrip()}
    <strong>${escapeHtml(title)}</strong>
    <span class="day-plan-drag-preview__time"></span>
  `;
  document.body.appendChild(preview);
  ui.planPointerDrag.previewEl = preview;
  ui.planPointerDrag.offsetX = Math.min(Math.max(event.clientX - rect.left, 18), width - 18);
  ui.planPointerDrag.offsetY = Math.min(Math.max(event.clientY - rect.top, 12), rect.height - 8);
  updatePlanDragPreview(event.clientX, event.clientY);
}

function updatePlanDragPreviewTime(minute = null, outsideAvailability = false) {
  const label = ui.planPointerDrag?.previewEl?.querySelector(".day-plan-drag-preview__time");
  if (!label) return;
  label.textContent = Number.isFinite(minute)
    ? `${formatScheduleClock(minute)}から${outsideAvailability ? " · 枠外" : ""}`
    : "";
  label.classList.toggle("is-visible", Number.isFinite(minute));
  label.classList.toggle("is-outside", Number.isFinite(minute) && outsideAvailability);
}

function updatePlanDragPreview(clientX, clientY) {
  const drag = ui.planPointerDrag;
  if (!drag?.previewEl) return;
  const x = Math.round(clientX - drag.offsetX);
  const y = Math.round(clientY - drag.offsetY);
  drag.previewEl.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(-1deg)`;
}

function setPlanPointerDropZone(clientX, clientY) {
  const drag = ui.planPointerDrag;
  if (!drag) return null;
  const target = document.elementFromPoint(clientX, clientY);
  const zone = target?.closest?.("[data-time-plan-zone]") || null;
  document.querySelectorAll("[data-time-plan-zone].is-drag-over").forEach((element) => {
    if (element !== zone) element.classList.remove("is-drag-over");
  });
  document.querySelectorAll(".time-plan-item.is-drop-before, .time-plan-item.is-drop-after").forEach((element) => {
    element.classList.remove("is-drop-before", "is-drop-after");
  });
  document.querySelectorAll(".time-timeline-gap.is-drag-over").forEach((element) => {
    element.classList.remove("is-drag-over");
  });
  if (!zone) {
    drag.dropZone = "";
    drag.beforeWorkId = null;
    drag.targetStartMinute = null;
    drag.targetIsGap = false;
    drag.targetOutsideAvailability = false;
    updatePlanDragPreviewTime();
    return null;
  }
  zone.classList.add("is-drag-over");
  drag.dropZone = zone.dataset.timePlanZone || "";
  if (drag.dropZone !== "today") {
    drag.beforeWorkId = null;
    drag.targetStartMinute = null;
    drag.targetIsGap = false;
    drag.targetOutsideAvailability = false;
    updatePlanDragPreviewTime();
    return zone;
  }

  const availabilityRanges = getScheduleAvailabilityRanges(ensureDailyPlan());

  const gap = target?.closest?.("[data-time-gap-start]") || null;
  if (gap) {
    const rect = gap.getBoundingClientRect();
    const start = Number(gap.dataset.timeGapStart);
    const end = Number(gap.dataset.timeGapEnd);
    const ratio = rect.height > 0
      ? Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      : 0;
    drag.beforeWorkId = gap.dataset.timeDropBefore || null;
    drag.targetStartMinute = snapScheduleMinute(start + ((end - start) * ratio));
    drag.targetIsGap = true;
    drag.targetOutsideAvailability = Number.isFinite(drag.targetStartMinute)
      && !isMinuteInAvailability(drag.targetStartMinute, availabilityRanges);
    gap.classList.add("is-drag-over");
    updatePlanDragPreviewTime(drag.targetStartMinute, drag.targetOutsideAvailability);
    return zone;
  }

  const items = Array.from(zone.querySelectorAll("[data-time-order-item]"))
    .filter((element) => element.dataset.timeOrderItem !== drag.workId);
  const item = target?.closest?.("[data-time-order-item]") || null;
  drag.targetIsGap = false;
  if (!item || item.dataset.timeOrderItem === drag.workId) {
    const first = items[0];
    if (first && clientY < first.getBoundingClientRect().top + first.getBoundingClientRect().height / 2) {
      drag.beforeWorkId = first.dataset.timeOrderItem || null;
      drag.targetStartMinute = Number(first.dataset.timeStartMinute);
      first.classList.add("is-drop-before");
    } else {
      drag.beforeWorkId = null;
      drag.targetStartMinute = Number(items.at(-1)?.dataset.timeEndMinute ?? zone.dataset.timeEmptyStart);
    }
    drag.targetIsGap = items.length === 0 && Number.isFinite(drag.targetStartMinute);
    drag.targetOutsideAvailability = Number.isFinite(drag.targetStartMinute)
      && !isMinuteInAvailability(drag.targetStartMinute, availabilityRanges);
    updatePlanDragPreviewTime(drag.targetStartMinute, drag.targetOutsideAvailability);
    return zone;
  }

  const rect = item.getBoundingClientRect();
  const itemStart = Number(item.dataset.timeStartMinute);
  const itemEnd = Number(item.dataset.timeEndMinute);
  const insertBefore = clientY < rect.top + rect.height / 2;
  drag.targetStartMinute = insertBefore ? itemStart : itemEnd;
  drag.targetIsGap = false;
  drag.targetOutsideAvailability = Number.isFinite(drag.targetStartMinute)
    && !isMinuteInAvailability(drag.targetStartMinute, availabilityRanges);
  if (insertBefore) {
    drag.beforeWorkId = item.dataset.timeOrderItem || null;
    item.classList.add("is-drop-before");
    updatePlanDragPreviewTime(drag.targetStartMinute, drag.targetOutsideAvailability);
    return zone;
  }

  const itemIndex = items.indexOf(item);
  drag.beforeWorkId = items.slice(itemIndex + 1)
    .find((candidate) => candidate.dataset.timeOrderItem !== item.dataset.timeOrderItem)
    ?.dataset.timeOrderItem || null;
  item.classList.add("is-drop-after");
  updatePlanDragPreviewTime(drag.targetStartMinute, drag.targetOutsideAvailability);
  return zone;
}

function startPlanPointerDrag(event) {
  if (state.activeSession || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
    return false;
  }
  const source = getPlanPointerDragCard(event.target);
  if (!source) return false;
  const workId = source.dataset.planWorkId || "";
  const item = getWorkItemById(workId);
  if (!item) return false;

  event.preventDefault();
  event.stopPropagation();
  ui.planPointerDrag = {
    workId,
    sourceSelected: isWorkItemSelectedToday(item, ensureDailyPlan()),
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    hasMoved: false,
    dropZone: "",
    beforeWorkId: null,
    targetStartMinute: null,
    targetIsGap: false,
    targetOutsideAvailability: false,
    sourceEl: source,
    previewEl: null,
    offsetX: 18,
    offsetY: 16,
  };
  source.setPointerCapture?.(event.pointerId);
  source.classList.add("is-dragging");
  document.body.classList.add("is-day-plan-dragging");
  createPlanDragPreview(source, event);
  return true;
}

function movePlanPointerDrag(event) {
  const drag = ui.planPointerDrag;
  if (!drag || drag.pointerId !== event.pointerId) return false;
  const deltaX = event.clientX - drag.startX;
  const deltaY = event.clientY - drag.startY;
  if (Math.hypot(deltaX, deltaY) >= 3) {
    drag.hasMoved = true;
  }
  event.preventDefault();
  updatePlanDragPreview(event.clientX, event.clientY);
  if (drag.hasMoved) {
    autoScrollTaskDrag(event.clientY);
    setPlanPointerDropZone(event.clientX, event.clientY);
  }
  return true;
}

function endPlanPointerDrag(event) {
  const drag = ui.planPointerDrag;
  if (!drag || drag.pointerId !== event.pointerId) return false;
  const wasCancelled = event.type === "pointercancel";
  if (drag.hasMoved && !wasCancelled && !drag.dropZone) {
    setPlanPointerDropZone(event.clientX, event.clientY);
  }
  const dropZone = drag.dropZone;
  const canDrop = drag.hasMoved && !wasCancelled && Boolean(dropZone);
  const beforeWorkId = drag.beforeWorkId || null;
  const targetStartMinute = drag.targetStartMinute;
  const targetIsGap = drag.targetIsGap;
  const targetOutsideAvailability = Boolean(drag.targetOutsideAvailability);
  const existingFirstStartMinute = buildTodayTimeRows(getTodayOrderedWorkItems(), ensureDailyPlan())[0]?.startMinutes ?? null;
  drag.sourceEl?.releasePointerCapture?.(event.pointerId);
  ui.planPointerDrag = null;
  ui.taskSuppressClickUntil = Date.now() + 350;
  clearPlanPointerDragState();
  event.preventDefault();
  if (!canDrop || state.activeSession) return true;

  if (dropZone === "later") {
    if (!drag.sourceSelected) return true;
    const selection = setWorkItemSelectedToday(drag.workId, false);
    if (selection?.blockedByContinuation) {
      showToast("中断した続きは、完了するまで今日に残ります。");
      return true;
    }
    if (selection) {
      saveState();
      renderWithTransition();
      showToast("今日やらないへ移しました。");
    }
    return true;
  }

  if (dropZone === "today") {
    if (!drag.sourceSelected) {
      setWorkItemSelectedToday(drag.workId, true);
    }
    const result = moveTodayWorkItem(drag.workId, beforeWorkId);
    if (!result) return true;
    const resolvedStartMinute = Number.isFinite(targetStartMinute)
      ? targetStartMinute
      : getTodayInsertionStartMinute(drag.workId, beforeWorkId);
    const scheduledRow = repackTodayWorkStartTimes({
      firstStartMinute: existingFirstStartMinute,
      anchorWorkId: drag.workId,
      anchorMinute: resolvedStartMinute,
      keepAnchorGap: targetIsGap,
    });
    const scheduledOutsideAvailability = scheduledRow
      ? !isMinuteInAvailability(scheduledRow.startMinutes, getScheduleAvailabilityRanges(ensureDailyPlan()))
      : targetOutsideAvailability;
    const stats = getTodayPlanStats();
    saveState();
    renderWithTransition();
    showToast(drag.sourceSelected
      ? scheduledRow
        ? scheduledOutsideAvailability
          ? `${formatScheduleClock(scheduledRow.startMinutes)}から、空き時間の外に移しました。`
          : `${formatScheduleClock(scheduledRow.startMinutes)}からに移しました。`
        : "今日の順番を変更しました。"
      : scheduledOutsideAvailability
        ? `空き時間の外に入れました。${stats.overflowMinutes > 0 ? `${stats.overflowMinutes}分多めです。` : ""}`
        : stats.overflowMinutes > 0
          ? `今日に入れました。${stats.overflowMinutes}分多めです。`
          : "今日に入れました。");
  }
  return true;
}

function handleTaskPointerDown(event) {
  if (startAvailabilityPointerDrag(event)) {
    return;
  }
  if (startPlanPointerDrag(event)) {
    return;
  }
  if (state.activeSession || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
    return;
  }
  const card = getTaskPointerDragCard(event.target);
  if (!card) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  ui.taskDragId = card.dataset.taskId || "";
  ui.taskDragBeforeId = null;
  ui.taskPointerDrag = {
    taskId: ui.taskDragId,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    active: true,
    hasMoved: false,
    overQuadrant: null,
    beforeTaskId: null,
    sourceEl: card,
    previewEl: null,
    offsetX: 18,
    offsetY: 16,
  };
  card.setPointerCapture?.(event.pointerId);
  card.classList.add("is-dragging");
  document.body.classList.add("is-task-pointer-dragging");
  createTaskDragPreview(card, event);
}

function setPointerDragZone(clientX, clientY) {
  const drag = ui.taskPointerDrag;
  if (!drag) {
    return null;
  }
  const zone = updateTaskDropIntent(document.elementFromPoint(clientX, clientY), clientY);
  if (!zone) {
    drag.overQuadrant = null;
    drag.beforeTaskId = null;
    return null;
  }
  drag.overQuadrant = normalizeTaskQuadrant(zone.dataset.taskQuadrantZone || TASK_QUADRANT_DEFAULT);
  drag.beforeTaskId = ui.taskDragBeforeId;
  return zone;
}

function autoScrollTaskDrag(clientY) {
  const frame = screenFrame || document.querySelector(".screen-frame");
  if (!frame) {
    return;
  }
  const rect = frame.getBoundingClientRect();
  const edge = 86;
  const maxStep = 18;
  let step = 0;
  if (clientY > rect.bottom - edge) {
    step = maxStep;
  } else if (clientY < rect.top + edge) {
    step = -maxStep;
  }
  if (step) {
    frame.scrollBy({ top: step, behavior: "auto" });
  }
}

function handleTaskPointerMove(event) {
  if (moveAvailabilityPointerDrag(event)) {
    return;
  }
  if (movePlanPointerDrag(event)) {
    return;
  }
  const drag = ui.taskPointerDrag;
  if (!drag || drag.pointerId !== event.pointerId || state.activeSession) {
    return;
  }

  const deltaX = event.clientX - drag.startX;
  const deltaY = event.clientY - drag.startY;
  if (Math.hypot(deltaX, deltaY) >= 3) {
    drag.hasMoved = true;
  }
  if (!drag.hasMoved) {
    updateTaskDragPreview(event.clientX, event.clientY);
    event.preventDefault();
    return;
  }

  event.preventDefault();
  updateTaskDragPreview(event.clientX, event.clientY);
  autoScrollTaskDrag(event.clientY);
  setPointerDragZone(event.clientX, event.clientY);
}

function handleTaskPointerEnd(event) {
  if (endAvailabilityPointerDrag(event)) {
    return;
  }
  if (endPlanPointerDrag(event)) {
    return;
  }
  const drag = ui.taskPointerDrag;
  if (!drag || drag.pointerId !== event.pointerId) {
    return;
  }

  const nextQuadrant = drag.active && drag.hasMoved
    ? drag.overQuadrant || setPointerDragZone(event.clientX, event.clientY)?.dataset.taskQuadrantZone
    : null;
  const beforeTaskId = drag.beforeTaskId || ui.taskDragBeforeId || null;
  drag.sourceEl?.releasePointerCapture?.(event.pointerId);
  ui.taskPointerDrag = null;
  ui.taskDragId = null;
  ui.taskSuppressClickUntil = Date.now() + 350;
  clearTaskDragState();

  if (!drag.active || !drag.hasMoved || state.activeSession || !nextQuadrant) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  const normalizedQuadrant = normalizeTaskQuadrant(nextQuadrant);
  const task = moveTaskToQuadrant(drag.taskId, normalizedQuadrant, beforeTaskId);
  if (task) {
    ui.selectedTaskId = normalizedQuadrant === TASK_QUADRANT_DEFAULT ? null : drag.taskId;
    saveState();
    render();
    showToast(`${getTaskQuadrantToastLabel(normalizedQuadrant)}に移しました。`);
  }
}

function safeRender() {
  const el = document.activeElement;
  if ((el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) || safeRender._ime) {
    clearTimeout(safeRender._t);
    safeRender._t = setTimeout(safeRender, 800);
    return;
  }
  render();
}
safeRender._t = null;
safeRender._ime = false;
document.addEventListener('compositionstart', () => { safeRender._ime = true; });
document.addEventListener('compositionend', () => { safeRender._ime = false; });

function render() {
  window.clearTimeout(ui.taskEditRenderTimer);
  updateGuestBanner();
  reconcileActiveSession();
  if (state.activeSession) {
    ui.sessionOpen = true;
  }
  let currentView = state.meta.currentView || "today";
  if (currentView === "tasks") {
    ui.todayMode = "organize";
    currentView = "today";
    state.meta.currentView = "today";
  }
  if (currentView === "garden" || currentView === "roadmap") {
    currentView = "today";
    state.meta.currentView = "today";
  }
  if (currentView === "replan") {
    currentView = "setup";
    state.meta.currentView = "setup";
    ui.setupMode = ui.setupMode === "new_goal" ? "new_goal" : "edit";
    ui.setupSection = ui.setupMode === "new_goal" ? "detail" : "home";
    if (!ui.setupDraft) {
      ui.setupDraft = expandSetup(state.setup);
    }
  }

  todayLabel.textContent = formatHeaderDate(new Date());
  setupShortcut.textContent = currentView === "setup" ? "閉じる" : "設定";
  setupShortcut.dataset.action = currentView === "setup" ? "close-setup" : "open-setup";
  if (currentView === "setup") {
    delete setupShortcut.dataset.section;
  } else {
    setupShortcut.dataset.section = "home";
  }

  if (screenFrame) {
    screenFrame.classList.toggle("is-setup", currentView === "setup");
  }
  if (bottomNav) {
    bottomNav.hidden = currentView === "setup";
  }

  tabbarButtons.forEach((button) => {
    const isActive = button.dataset.view === currentView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  const renderMap = {
    setup: renderSetupView,
    today: renderTodayView,
    tasks: renderTasksView,
    review: renderReviewView,
  };

  try {
    screenRoot.innerHTML = (renderMap[currentView] || renderMap.today)();
  } catch (err) {
    console.error("render error:", err);
    screenRoot.innerHTML = `<div class="screen" style="padding:32px 24px;text-align:center;"><p style="font-size:1.1rem;margin-bottom:8px;">表示エラーが発生しました</p><p style="font-size:0.82rem;color:var(--muted)">${escapeHtml(String(err.message || err))}</p></div>`;
  }
  renderSessionSheet();
  startSessionTicker();

  // 習慣 / 目標でアンビエント背景色を切り替え
  const ambientLeft = document.querySelector(".ambient--left");
  const ambientRight = document.querySelector(".ambient--right");
  if (ambientLeft && ambientRight) {
    const isHabitGoal = state.setup.goalType === "habit";
    if (isHabitGoal) {
      ambientLeft.style.background = "radial-gradient(circle, rgba(130,190,155,0.8) 0%, rgba(130,190,155,0) 70%)";
      ambientRight.style.background = "radial-gradient(circle, rgba(90,160,120,0.65) 0%, rgba(90,160,120,0) 70%)";
    } else {
      ambientLeft.style.background = "radial-gradient(circle, rgba(218,120,100,0.75) 0%, rgba(218,120,100,0) 70%)";
      ambientRight.style.background = "radial-gradient(circle, rgba(195,90,80,0.6) 0%, rgba(195,90,80,0) 70%)";
    }
  }
}

function deriveShortMinutes(normalMinutes, minimumMinutes) {
  return Math.max(minimumMinutes, Math.min(normalMinutes, roundToFive(normalMinutes / 3)));
}

function resolvePlanMinuteValues(source = {}, fallback = {}) {
  const fallbackNormal = clamp(Number(fallback.normalMinutes) || 30, 5, 180);
  const fallbackMinimum = clamp(Number(fallback.minimumMinutes) || 2, 1, 30);
  const fallbackShort = clamp(
    Number(fallback.shortMinutes) || deriveShortMinutes(fallbackNormal, fallbackMinimum),
    fallbackMinimum,
    fallbackNormal,
  );
  const normalMinutes = clamp(Number(source.normalMinutes) || fallbackNormal, 5, 180);
  const minimumMinutes = clamp(Number(source.minimumMinutes) || fallbackMinimum, 1, 30);
  const shortBase = source.shortMinutes === "" || source.shortMinutes == null
    ? fallbackShort
    : Number(source.shortMinutes);
  const shortMinutes = clamp(shortBase || deriveShortMinutes(normalMinutes, minimumMinutes), minimumMinutes, normalMinutes);

  return {
    normalMinutes,
    shortMinutes,
    minimumMinutes,
  };
}

function buildSetupPlanPreview(draft) {
  const fallback = state.setup;
  const minutes = resolvePlanMinuteValues(draft, fallback);
  return {
    goal: (draft.goal || fallback.goal).trim() || fallback.goal,
    currentLevel: (draft.currentLevel ?? fallback.currentLevel).trim(),
    studyDays: normalizeStudyDays(draft.studyDays ?? fallback.studyDays),
    normalMinutes: minutes.normalMinutes,
    shortMinutes: minutes.shortMinutes,
    minimumMinutes: minutes.minimumMinutes,
    minimumExample: (draft.minimumExample || fallback.minimumExample).trim() || fallback.minimumExample,
  };
}

function buildSetupSnapshotFromDraft(draft, fallback = state.setup) {
  return {
    goal: (draft.goal || fallback.goal || "").trim(),
    deadline: normalizeOptionalDate(draft.deadline ?? fallback.deadline),
    currentLevel: (draft.currentLevel ?? fallback.currentLevel ?? "").trim(),
  };
}

function getSetupDraftRoadmapItems() {
  ensureSetupDraft();
  const snapshot = buildSetupSnapshotFromDraft(ui.setupDraft);
  const sourceRoadmap = Array.isArray(ui.setupDraft.roadmap)
    ? ui.setupDraft.roadmap
    : buildInitialRoadmap(snapshot);
  const nextRoadmap = preserveRoadmapForSetupEdit(sourceRoadmap, snapshot);
  ui.setupDraft.roadmap = nextRoadmap;
  return nextRoadmap;
}

function buildEditableRoadmapPreview() {
  if (ui.setupMode !== "new_goal") {
    return computeRoadmap(state);
  }

  return {
    milestones: getSetupDraftRoadmapItems().map((item) => ({
      ...item,
      isActive: false,
      isComplete: false,
    })),
  };
}

function buildDraftPrimaryWindow(draft) {
  return `${draft.primaryStart || "21:00"}-${draft.primaryEnd || "21:30"}`;
}

function windowRangesOverlap(leftWindow, rightWindow) {
  const left = parseWindow(leftWindow);
  const right = parseWindow(rightWindow);

  if (![left.start, left.end, right.start, right.end].every(Number.isFinite)) {
    return false;
  }

  return left.start < right.end && right.start < left.end;
}

function getPrimaryWindowRoster(draft) {
  const excludeGoalId = ui.setupMode === "new_goal" ? "" : state.meta.activeGoalId;
  const draftWindow = buildDraftPrimaryWindow(draft);
  const draftDays = normalizeStudyDays(draft.studyDays);

  return listGoalsByPrimaryWindow()
    .filter((goal) => goal.id !== excludeGoalId)
    .map((goal) => {
      const studyDays = normalizeStudyDays(goal.setup.studyDays);
      const sharedDays = getSharedStudyDays(draftDays, studyDays);

      return {
        id: goal.id,
        label: goal.setup.goal,
        window: goal.setup.primaryWindow,
        studyDays,
        sharedDays,
        overlaps: sharedDays.length > 0 && windowRangesOverlap(draftWindow, goal.setup.primaryWindow),
      };
    });
}

function getEditableScheduleRows(draft) {
  const rosterById = new Map(getPrimaryWindowRoster(draft).map((item) => [item.id, item]));

  return listGoalsByPrimaryWindow().map((goal) => {
    const isActive = goal.id === state.meta.activeGoalId;
    const rosterItem = rosterById.get(goal.id);

    return {
      id: goal.id,
      label: isActive ? (draft.goal || goal.setup.goal) : goal.setup.goal,
      window: isActive ? buildDraftPrimaryWindow(draft) : goal.setup.primaryWindow,
      studyDays: isActive ? normalizeStudyDays(draft.studyDays) : normalizeStudyDays(goal.setup.studyDays),
      sharedDays: rosterItem?.sharedDays || [],
      overlaps: Boolean(rosterItem?.overlaps),
      isActive,
    };
  });
}

function renderEditableScheduleRow(item, draft) {
  const statusBadge = item.isActive
    ? `<span class="status-badge status-badge--done">表示中</span>`
    : `<span class="status-badge ${item.overlaps ? "status-badge--danger" : ""}">${item.overlaps ? "重なり" : item.sharedDays.length ? "別時間" : "別曜日"}</span>`;

  return `
    <article class="goal-window-row ${item.isActive ? "is-active" : ""} ${item.overlaps ? "is-conflict" : ""}">
      <div class="goal-window-row__head">
        <div class="goal-window-row__body">
          <strong class="goal-window-row__name">${escapeHtml(item.label)}</strong>
          <div class="goal-window-row__meta">実施時間 ${escapeHtml(item.window)} / ${escapeHtml(formatStudyDays(item.studyDays))}</div>
        </div>
        <div class="goal-window-row__actions">
          ${statusBadge}
          ${item.isActive
            ? ""
            : `<button type="button" class="soft-button goal-window-row__pick" data-action="activate-goal" data-goal-id="${escapeHtml(item.id)}">編集する</button>`}
        </div>
      </div>
      ${item.isActive
        ? `
          <div class="goal-window-row__editor">
            ${renderWindowField("実施時間", "primaryStart", "primaryEnd", draft.primaryStart, draft.primaryEnd)}
            <div class="field">
              <span class="field__label">曜日</span>
              <div class="weekday-choice-row goal-window-row__days">
                ${WEEKDAY_KEYS.map((weekdayKey) => renderWeekdayChip(weekdayKey, draft.studyDays)).join("")}
              </div>
            </div>
            <div class="goal-window-row__save">
              <button type="button" class="action-button action-button--primary" data-action="save-setup">この内容で保存</button>
            </div>
          </div>
        `
        : ""}
    </article>
  `;
}

function renderPrimaryWindowRoster(draft) {
  const roster = getPrimaryWindowRoster(draft);
  const conflicts = roster.filter((item) => item.overlaps);
  const isNewGoal = ui.setupMode === "new_goal";
  const warningClass = conflicts.length && !isNewGoal ? "is-danger" : "";
  const warningText = conflicts.length
    ? (isNewGoal
      ? "同じ実施時間の目標があります。追加後に調整できます。"
      : `この実施時間は ${conflicts.map((item) => item.label).join(" / ")} と重なっています。`)
    : "";

  if (!isNewGoal) {
    const rows = getEditableScheduleRows(draft);
    return `
      <div class="stack setup-schedule-roster">
        <div class="setup-section-intro">
          <h3 class="section-title">時間</h3>
        </div>
        <div class="goal-window-list goal-window-list--editable">
          ${rows.map((item) => renderEditableScheduleRow(item, draft)).join("")}
        </div>
        ${warningText ? `<p class="setup-warning ${warningClass}">${escapeHtml(warningText)}</p>` : ""}
      </div>
    `;
  }

  return `
    <div class="stack setup-schedule-roster">
      <div class="setup-section-intro">
        <h3 class="section-title">時間の重なり</h3>
      </div>
      ${roster.length
        ? `
          <div class="goal-window-list">
            ${roster.map((item) => `
              <div class="goal-window-row ${item.overlaps && !isNewGoal ? "is-conflict" : ""}">
                <div class="goal-window-row__head">
                  <div class="goal-window-row__body">
                    <strong class="goal-window-row__name">${escapeHtml(item.label)}</strong>
                    <div class="goal-window-row__meta">実施時間 ${escapeHtml(item.window)} / ${escapeHtml(formatStudyDays(item.studyDays))}</div>
                  </div>
                  <div class="goal-window-row__actions">
                    <span class="status-badge ${item.overlaps && !isNewGoal ? "status-badge--danger" : ""}">${item.overlaps ? (isNewGoal ? "後で調整" : "重なり") : (item.sharedDays.length ? "別時間" : "別曜日")}</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `
        : `<p class="section-copy">まだ他の目標はありません。</p>`}
      ${warningText ? `<p class="setup-warning ${warningClass}">${escapeHtml(warningText)}</p>` : ""}
    </div>
  `;
}
function renderSetupSectionBody(section, draft) {
  if (section === "schedule") {
    if (ui.setupMode !== "new_goal") {
      return `
        <div class="stack setup-schedule">
          ${renderPrimaryWindowRoster(draft)}
        </div>
      `;
    }

    return `
      <div class="stack setup-schedule">
        ${renderPrimaryWindowRoster(draft)}
        <div class="field">
          <span class="field__label">曜日</span>
          <div class="weekday-choice-row">
            ${WEEKDAY_KEYS.map((weekdayKey) => renderWeekdayChip(weekdayKey, draft.studyDays)).join("")}
          </div>
        </div>
        ${renderWindowField("実施時間", "primaryStart", "primaryEnd", draft.primaryStart, draft.primaryEnd)}
      </div>
    `;
  }

  if (section === "plan") {
    return `
      <div class="plan-list">
        ${renderEditablePlanCard("A", "normalMinutes", draft.normalMinutes, "何分やるか")}
      </div>
    `;
  }

  if (ui.setupMode !== "new_goal") {
    return `
      <div class="stack">
        ${renderGoalLibrary()}
      </div>
    `;
  }

  const isHabitDraft = draft.goalType === "habit";
  return `
    <div class="stack">
      <div class="field">
        <span class="field__label">種類</span>
        <div class="goal-type-toggle">
          <button type="button" class="goal-type-btn ${!isHabitDraft ? "is-active" : ""}" data-action="select-goal-type" data-goal-type="goal">
            <span class="goal-type-btn__icon">🎯</span>
            <span class="goal-type-btn__label">目標達成</span>
          </button>
          <button type="button" class="goal-type-btn ${isHabitDraft ? "is-active" : ""}" data-action="select-goal-type" data-goal-type="habit">
            <span class="goal-type-btn__icon">↻</span>
            <span class="goal-type-btn__label">習慣</span>
          </button>
        </div>
      </div>
      <label class="field">
        <span class="field__label">目標</span>
        <input class="field__control" data-setup-field="goal" type="text" value="${escapeHtml(draft.goal)}" />
      </label>
      ${!isHabitDraft ? `
        <div class="field">
          <span class="field__label">期限</span>
          <input class="field__control" data-setup-field="deadline" type="date" value="${escapeHtml(draft.deadline)}" />
        </div>
      ` : `
        <p class="section-copy">毎日のチェックインだけ記録します。</p>
      `}
    </div>
  `;
}

function getLaunchPlan(currentState) {
  return currentState.plans?.A ? "A" : Object.keys(currentState.plans || {})[0] || "A";
}

function getGoalDurationMinutes(goal) {
  const rawMinutes = Number(goal?.plans?.A?.minutes ?? goal?.setup?.normalMinutes ?? 30);
  return Number.isFinite(rawMinutes) ? clamp(Math.round(rawMinutes), 1, 240) : 30;
}

function syncSelectedSessionPlan(forceRecommended = false) {
  if (state.activeSession?.planKey) {
    ui.selectedSessionPlan = state.activeSession.planKey;
    return ui.selectedSessionPlan;
  }

  const fallbackPlan = getLaunchPlan(state);
  if (forceRecommended || !state.plans?.[ui.selectedSessionPlan]) {
    ui.selectedSessionPlan = fallbackPlan;
  }
  return ui.selectedSessionPlan;
}

function renderSetupSectionIcon(sectionKey) {
  const icons = {
    goal: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7.5"></circle>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5"></path>
      </svg>
    `,
    schedule: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8"></circle>
        <path d="M12 7.5v5l3.5 2M8 2.5v3M16 2.5v3"></path>
      </svg>
    `,
    plan: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6.5h14M5 12h14M5 17.5h14"></path>
        <circle cx="9" cy="6.5" r="2"></circle>
        <circle cx="15" cy="12" r="2"></circle>
        <circle cx="11" cy="17.5" r="2"></circle>
      </svg>
    `,
    add: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8"></circle>
        <path d="M12 8v8M8 12h8"></path>
      </svg>
    `,
    settings: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2"></circle>
        <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3"></path>
      </svg>
    `,
  };

  return `<span class="setup-icon" aria-hidden="true">${icons[sectionKey] || icons.goal}</span>`;
}

function renderSetupMenuItem(config) {
  const attrs = [`data-action="${config.action}"`];
  if (config.section) {
    attrs.push(`data-section="${config.section}"`);
  }
  if (config.view) {
    attrs.push(`data-view="${config.view}"`);
  }

  return `
    <button type="button" class="setup-tab ${config.active ? "is-active" : ""}" ${attrs.join(" ")}>
      <span class="setup-tab__row">
        ${renderSetupSectionIcon(config.iconKey)}
        <span class="setup-tab__body">
          <span class="setup-tab__label">${escapeHtml(config.label)}</span>
        </span>
      </span>
    </button>
  `;
}

function renderGoalLibrary() {
  const goals = listGoalsByPrimaryWindow();
  const editingGoalId = ui.goalLibraryDraft ? ui.goalLibraryDraft.goalId : "";

  return `
    <div class="stack">
      <div class="setup-section-intro goal-library__intro goal-library__intro--inline">
        <h3 class="section-title">目標</h3>
        <button type="button" class="soft-button setup-inline-add" data-action="start-new-goal" data-section="goal">追加</button>
      </div>
      <div class="goal-library">
        ${goals.map((goal) => {
          const isActive = goal.id === state.meta.activeGoalId;
          const isEditing = editingGoalId === goal.id;
          const deadlineText = normalizeOptionalDate(isEditing ? ui.goalLibraryDraft?.deadline : goal.setup.deadline);
          const isHabitGoal = goal.setup && goal.setup.goalType === "habit";
          const meta = isHabitGoal
            ? "習慣"
            : formatDeadlineBadge(deadlineText);
          return `
            <article class="goal-library-card ${isActive ? "is-active" : ""}">
              <div class="goal-library-card__head">
                <strong>${escapeHtml(isEditing ? ui.goalLibraryDraft.goal : goal.setup.goal)}</strong>
                ${isActive ? `<span class="status-badge status-badge--done">表示中</span>` : ""}
              </div>
              ${isEditing
                ? `
                  <div class="goal-library-card__editor">
                    <div class="field">
                      <span class="field__label">種類</span>
                      <div class="goal-type-toggle goal-type-toggle--compact">
                        <button type="button" class="goal-type-btn ${ui.goalLibraryDraft.goalType !== "habit" ? "is-active" : ""}" data-action="select-goal-library-type" data-goal-type="goal">
                          <span class="goal-type-btn__icon">🎯</span>
                          <span class="goal-type-btn__label">目標達成</span>
                        </button>
                        <button type="button" class="goal-type-btn ${ui.goalLibraryDraft.goalType === "habit" ? "is-active" : ""}" data-action="select-goal-library-type" data-goal-type="habit">
                          <span class="goal-type-btn__icon">↻</span>
                          <span class="goal-type-btn__label">習慣</span>
                        </button>
                      </div>
                    </div>
                    <label class="field">
                      <span class="field__label">目標</span>
                      <input class="field__control" data-goal-library-field="goal" type="text" value="${escapeHtml(ui.goalLibraryDraft.goal)}" />
                    </label>
                    ${ui.goalLibraryDraft.goalType === "habit"
                      ? `<p class="section-copy">習慣タイプは日々のチェックインで継続状況を記録します。</p>`
                      : `<label class="field">
                          <span class="field__label">期限</span>
                          <input class="field__control" data-goal-library-field="deadline" type="date" value="${escapeHtml(ui.goalLibraryDraft.deadline)}" />
                        </label>`}
                    <div class="goal-library-card__actions">
                      <button type="button" class="soft-button goal-library-card__action" data-action="save-goal-library-edit">保存</button>
                      <button type="button" class="soft-button goal-library-card__action" data-action="cancel-goal-library-edit">閉じる</button>
                    </div>
                  </div>
                `
                : ui.deleteConfirmGoalId === goal.id
                  ? `
                    <p class="goal-library-card__delete-warn">⚠️ この目標を完全消去しますか？元に戻せません。</p>
                    <div class="goal-library-card__actions">
                      <button type="button" class="soft-button goal-library-card__action goal-library-card__action--danger" data-action="delete-goal" data-goal-id="${goal.id}">完全消去する</button>
                      <button type="button" class="soft-button goal-library-card__action" data-action="cancel-delete-goal">やめる</button>
                    </div>
                  `
                  : `
                    <p class="goal-library-card__meta">${escapeHtml(meta)}</p>
                    <div class="goal-library-card__actions">
                      <button type="button" class="soft-button goal-library-card__action" data-action="start-goal-library-edit" data-goal-id="${goal.id}">編集</button>
                      <button type="button" class="soft-button goal-library-card__action" data-action="archive-goal" data-goal-id="${goal.id}">非表示</button>
                    </div>
                  `}
            </article>
          `;
        }).join("")}
      </div>
      ${renderAlbumSection()}
    </div>
  `;
}

function renderTodayGoalCard(goal, index) {
  const isHabit = goal.setup && goal.setup.goalType === "habit";
  if (isHabit) {
    return renderTodayHabitCard(goal, index);
  }
  const missionState = getGoalMissionStateForDate(goal);
  const isActiveGoal = goal.id === state.meta.activeGoalId;
  const durationMinutes = getGoalDurationMinutes(goal);
  const cardClass = `${index === 0 ? "" : " focus-launch--stacked"} ${isActiveGoal ? "is-active-goal" : "is-inactive-goal"} ${missionState.isClosed ? "is-complete-goal" : "is-pending-goal"}`;
  const statusLabel = missionState.isClosed ? "完了" : "今日";

  return `
    <section class="focus-launch focus-launch--minimal${cardClass}" data-action="select-goal" data-goal-id="${goal.id}" role="button" tabindex="0" style="view-transition-name: goal-card-${goal.id}">
      <div class="focus-launch__simple-meta">
        <span>${escapeHtml(statusLabel)}</span>
        <span>${escapeHtml(goal.setup.primaryWindow || "")}</span>
      </div>
      <div class="focus-launch__title-row">
        <h1 class="focus-launch__goal focus-launch__goal--solo">${escapeHtml(goal.setup.goal)}</h1>
      </div>
      <div class="focus-start-row">
        <span class="focus-duration-pill">${escapeHtml(`${durationMinutes}分`)}</span>
        <button type="button" class="action-button action-button--primary focus-start-button" data-action="start-goal-session" data-goal-id="${goal.id}">開始</button>
      </div>
    </section>
  `;
}

function renderTodayHabitCard(goal, index) {
  const today = toISODate(new Date());
  const todayLog = (goal.logs || []).find(l => l.date === today && l.outcome !== "miss");
  const isDone = Boolean(todayLog);
  const isActiveGoal = goal.id === state.meta.activeGoalId;
  const durationMinutes = getGoalDurationMinutes(goal);
  const cardClass = `${index === 0 ? "" : " focus-launch--stacked"} ${isActiveGoal ? "is-active-goal" : "is-inactive-goal"} ${isDone ? "is-complete-goal" : "is-pending-goal"}`;

  return `
    <section class="focus-launch focus-launch--minimal focus-launch--habit${cardClass}" style="view-transition-name: goal-card-${goal.id}">
      <div class="focus-launch__simple-meta">
        <span>${isDone ? "完了" : "習慣"}</span>
        <span>${escapeHtml(goal.setup.primaryWindow || "")}</span>
      </div>
      <div class="focus-launch__title-row">
        <h1 class="focus-launch__goal focus-launch__goal--solo">${escapeHtml(goal.setup.goal)}</h1>
      </div>
      <div class="focus-start-row">
        <span class="focus-duration-pill">${escapeHtml(`${durationMinutes}分`)}</span>
        <button type="button" class="action-button action-button--primary focus-start-button" data-action="start-goal-session" data-goal-id="${goal.id}">開始</button>
      </div>
      <div class="bonsai-health-row">
        ${renderHabitHistory(goal.logs || [], goal.setup.studyDays)}
      </div>
    </section>
  `;
}

function renderActiveGoalContext(options = {}) {
  const goals = options.sortByPrimaryWindow ? listGoalsByPrimaryWindow() : listGoals();
  const currentColor = getGoalSignatureColor(state.meta.activeGoalId);

  return `
    <details class="goal-selector">
      <summary>
        <span class="hero__context goal-selector__current" style="color:${currentColor}">
          <span class="goal-selector__dot" style="background:${currentColor}"></span>対象目標: ${escapeHtml(state.setup.goal)}
        </span>
        <span class="goal-selector__button">選択</span>
      </summary>
      <div class="goal-selector__body">
        ${goals.map((goal) => {
          const isActive = goal.id === state.meta.activeGoalId;
          const dotColor = getGoalSignatureColor(goal.id);
          const optionStyle = `border-left-color:${dotColor};background:${isActive ? hexToRgba(dotColor, 0.16) : "rgba(255,251,245,0.86)"}`;
          return `
            <button
              type="button"
              class="goal-selector__option ${isActive ? "is-active" : ""}"
              style="${optionStyle}"
              data-action="activate-goal"
              data-goal-id="${goal.id}"
              ${isActive ? "disabled" : ""}
            >
              <span class="goal-selector__dot" style="background:${dotColor}"></span>
              <span class="goal-selector__option-title">${escapeHtml(goal.setup.goal)}</span>
              <span class="goal-selector__option-state"${isActive ? ` style="color:${dotColor}"` : ""}>${isActive ? "表示中" : "選ぶ"}</span>
            </button>
          `;
        }).join("")}
      </div>
    </details>
  `;
}

function renderSettingsIcon(iconKey) {
  const icons = {
    shield: '<path d="M12 3 5.5 5.6v5.7c0 4.2 2.7 7.8 6.5 9.2 3.8-1.4 6.5-5 6.5-9.2V5.6L12 3Z"></path><path d="m9.2 11.8 1.8 1.8 3.8-4"></path>',
    clock: '<circle cx="12" cy="12" r="8.5"></circle><path d="M12 7v5l3.4 2.1"></path>',
    goal: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3.2"></circle>',
    account: '<circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6"></path>',
    document: '<path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h4M10 12h5M10 16h5"></path>',
    back: '<path d="m15 18-6-6 6-6"></path>',
    chevron: '<path d="m9 18 6-6-6-6"></path>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[iconKey] || icons.goal}</svg>`;
}

function getAppShieldStatusCopy() {
  const status = ui.appShieldStatus;
  if (!status.available) {
    return { value: "iPhoneアプリで設定", tone: "muted" };
  }
  if (status.enabled === null) {
    return { value: "状態を確認中", tone: "muted" };
  }
  if (!status.enabled) {
    return { value: "オフ", tone: "muted" };
  }
  if (status.authorized === false) {
    return { value: "許可を完了してください", tone: "warning" };
  }
  return {
    value: `オン · ${status.allowedAppCount}個を許可`,
    tone: "active",
  };
}

function renderSettingsHome() {
  const goals = listGoals().sort(compareGoalsByPrimaryWindow);
  const shieldCopy = getAppShieldStatusCopy();
  const plan = ensureDailyPlan();
  const defaultMinutes = getAvailabilityMinutes(plan.defaultSlots);

  return `
    <div class="settings-home">
      <section class="settings-group" aria-labelledby="settings-focus-title">
        <div class="settings-group__heading">
          <h2 id="settings-focus-title">集中</h2>
        </div>
        <button type="button" class="settings-row settings-row--primary" data-action="configure-app-shield">
          <span class="settings-row__icon">${renderSettingsIcon("shield")}</span>
          <span class="settings-row__body">
            <strong>集中中のアプリ</strong>
            <span>使ってよいアプリを選ぶ</span>
          </span>
          <span class="settings-row__value is-${shieldCopy.tone}">${escapeHtml(shieldCopy.value)}</span>
          <span class="settings-row__chevron">${renderSettingsIcon("chevron")}</span>
        </button>
        <button type="button" class="settings-row" data-action="open-availability-settings">
          <span class="settings-row__icon">${renderSettingsIcon("clock")}</span>
          <span class="settings-row__body">
            <strong>いつもの空き時間</strong>
            <span>Todayの時間枠</span>
          </span>
          <span class="settings-row__value">${escapeHtml(`${plan.defaultSlots.length}枠 · ${formatLoggedDuration(defaultMinutes * 60)}`)}</span>
          <span class="settings-row__chevron">${renderSettingsIcon("chevron")}</span>
        </button>
      </section>

      <section class="settings-group" aria-labelledby="settings-goals-title">
        <div class="settings-group__heading settings-group__heading--action">
          <h2 id="settings-goals-title">習慣・目標</h2>
          <button type="button" class="settings-add-button" data-action="start-new-goal" aria-label="習慣・目標を追加">＋</button>
        </div>
        <div class="settings-goal-list">
          ${goals.map((goal) => {
            const isHabit = goal.setup?.goalType === "habit";
            const deadline = isHabit ? "習慣" : formatDeadlineBadge(goal.setup.deadline);
            const timing = `${formatStudyDays(goal.setup.studyDays)} · ${goal.setup.primaryWindow} · ${getGoalDurationMinutes(goal)}分`;
            const color = getGoalSignatureColor(goal.id);
            return `
              <button type="button" class="settings-goal-row" data-action="open-goal-settings" data-goal-id="${escapeHtml(goal.id)}" style="--goal-color:${color}">
                <span class="settings-goal-row__dot"></span>
                <span class="settings-goal-row__body">
                  <strong>${escapeHtml(goal.setup.goal)}</strong>
                  <span>${escapeHtml(`${deadline} · ${timing}`)}</span>
                </span>
                <span class="settings-row__chevron">${renderSettingsIcon("chevron")}</span>
              </button>
            `;
          }).join("")}
        </div>
      </section>

      <details class="settings-disclosure">
        <summary>
          <span class="settings-row__icon">${renderSettingsIcon("account")}</span>
          <span>アカウントとデータ</span>
          <span class="settings-row__chevron">${renderSettingsIcon("chevron")}</span>
        </summary>
        <div class="settings-disclosure__body">
          <button type="button" data-action="export-data">バックアップを書き出す</button>
          <button type="button" data-action="import-data">バックアップを読み込む</button>
          <button type="button" data-action="sign-out">ログアウト</button>
          <button type="button" class="is-danger" data-action="delete-account">アカウントを削除</button>
          <p class="setup-build-label">build ${APP_BUILD}</p>
        </div>
      </details>

      <section class="settings-group" aria-labelledby="settings-info-title">
        <div class="settings-group__heading">
          <h2 id="settings-info-title">情報</h2>
        </div>
        <button type="button" class="settings-row" data-action="open-privacy">
          <span class="settings-row__icon">${renderSettingsIcon("document")}</span>
          <span class="settings-row__body">
            <strong>プライバシーポリシー</strong>
          </span>
          <span class="settings-row__chevron">${renderSettingsIcon("chevron")}</span>
        </button>
      </section>

      ${renderAlbumSection()}
    </div>
  `;
}

function renderAvailabilityRangeEditor(slot, index) {
  const start = clockTimeToMinutes(slot.start) ?? 0;
  const end = clockTimeToMinutes(slot.end) ?? start + TIME_SNAP_MINUTES;
  return `
    <div
      class="availability-range"
      style="--availability-slot-height:${getAvailabilitySlotBodyHeight(slot)}px"
      data-availability-range-rail
      data-slot-id="${escapeHtml(slot.id)}"
    >
        <div class="availability-range__handle availability-range__handle--start">
          <button
            type="button"
            class="availability-range__grip"
            role="slider"
            aria-orientation="vertical"
            aria-label="${index + 1}番目の空き枠の開始"
            aria-valuemin="0"
            aria-valuemax="${AVAILABILITY_DAY_MINUTES - TIME_SNAP_MINUTES}"
            aria-valuenow="${start}"
            aria-valuetext="${escapeHtml(minutesToClockTime(start))}"
            data-availability-drag-handle="start"
            data-slot-id="${escapeHtml(slot.id)}"
          >${renderInlineAvailabilityGrip()}</button>
          <span>開始</span>
          <input
            type="time"
            step="${TIME_SNAP_MINUTES * 60}"
            value="${escapeHtml(slot.start)}"
            data-availability-field="start"
            data-slot-id="${escapeHtml(slot.id)}"
            aria-label="${index + 1}番目の空き枠の開始時刻"
          />
        </div>
        <div class="availability-range__body">
          <span aria-hidden="true"></span>
          <strong data-availability-range-duration>${escapeHtml(formatLoggedDuration(getAvailabilitySlotMinutes(slot) * 60))}</strong>
        </div>
        <div class="availability-range__handle availability-range__handle--end">
          <button
            type="button"
            class="availability-range__grip"
            role="slider"
            aria-orientation="vertical"
            aria-label="${index + 1}番目の空き枠の終了"
            aria-valuemin="0"
            aria-valuemax="${AVAILABILITY_DAY_MINUTES - TIME_SNAP_MINUTES}"
            aria-valuenow="${end}"
            aria-valuetext="${escapeHtml(minutesToClockTime(end))}"
            data-availability-drag-handle="end"
            data-slot-id="${escapeHtml(slot.id)}"
          >${renderInlineAvailabilityGrip()}</button>
          <span>終了</span>
          <input
            type="time"
            step="${TIME_SNAP_MINUTES * 60}"
            value="${escapeHtml(slot.end)}"
            data-availability-field="end"
            data-slot-id="${escapeHtml(slot.id)}"
            aria-label="${index + 1}番目の空き枠の終了時刻"
          />
        </div>
    </div>
  `;
}

function renderAvailabilitySettings() {
  const mode = ui.availabilityMode === "today" ? "today" : "default";
  const draft = Array.isArray(ui.availabilityDraft)
    ? ui.availabilityDraft
    : buildAvailabilityDraft(mode);
  const validSlots = draft.map(normalizeAvailabilitySlot).filter(Boolean);
  const totalMinutes = validSlots.reduce((sum, slot) => sum + getAvailabilitySlotMinutes(slot), 0);

  return `
    <div class="availability-settings">
      <div class="goal-settings-detail__header">
        <button type="button" class="goal-settings-back" data-action="cancel-availability-settings" aria-label="戻る">
          ${renderSettingsIcon("back")}
        </button>
        <div>
          <p>${mode === "today" ? "今日だけ" : "毎日の初期値"}</p>
          <h2>${mode === "today" ? "今日の空き時間" : "いつもの空き時間"}</h2>
        </div>
      </div>

      <section class="availability-editor">
        <div class="availability-editor__summary">
          <span>${escapeHtml(`${draft.length}枠`)}</span>
          <strong data-availability-total>${escapeHtml(formatLoggedDuration(totalMinutes * 60))}</strong>
        </div>
        <div class="availability-editor__slots">
          ${draft.map((slot, index) => `
            <div class="availability-editor__slot" data-availability-slot-row="${escapeHtml(slot.id)}">
              <span class="availability-editor__index">${index + 1}</span>
              <strong class="availability-editor__slot-title">空き枠</strong>
              <button type="button" data-action="remove-availability-slot" data-slot-id="${escapeHtml(slot.id)}" aria-label="${index + 1}番目の空き枠を削除">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"></path></svg>
              </button>
              ${renderAvailabilityRangeEditor(slot, index)}
            </div>
          `).join("")}
        </div>
        <button type="button" class="availability-editor__add" data-action="add-availability-slot">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
          <span>空き枠を追加</span>
        </button>
      </section>

      <button type="button" class="action-button action-button--primary goal-settings-save" data-action="save-availability-settings">保存する</button>
    </div>
  `;
}

function renderGoalSettingsDetail(draft) {
  const isNewGoal = ui.setupMode === "new_goal";
  const isHabit = draft.goalType === "habit";
  const canArchive = !isNewGoal && listGoals().length > 1;

  return `
    <div class="goal-settings-detail">
      <div class="goal-settings-detail__header">
        <button type="button" class="goal-settings-back" data-action="back-to-settings" aria-label="設定に戻る">
          ${renderSettingsIcon("back")}
        </button>
        <div>
          <p>${isNewGoal ? "新しい項目" : "項目の設定"}</p>
          <h2>${isNewGoal ? "目標を追加" : escapeHtml(state.setup.goal)}</h2>
        </div>
      </div>

      <section class="goal-settings-section">
        <h3>基本</h3>
        <div class="goal-type-toggle goal-type-toggle--settings">
          <button type="button" class="goal-type-btn ${!isHabit ? "is-active" : ""}" data-action="select-goal-type" data-goal-type="goal">
            <span class="goal-type-btn__label">目標</span>
          </button>
          <button type="button" class="goal-type-btn ${isHabit ? "is-active" : ""}" data-action="select-goal-type" data-goal-type="habit">
            <span class="goal-type-btn__label">習慣</span>
          </button>
        </div>
        <label class="field">
          <span class="field__label">名前</span>
          <input class="field__control" data-setup-field="goal" type="text" value="${escapeHtml(draft.goal)}" />
        </label>
        ${isHabit ? "" : `
          <label class="field">
            <span class="field__label">期限</span>
            <input class="field__control" data-setup-field="deadline" type="date" value="${escapeHtml(draft.deadline)}" />
          </label>
        `}
        <label class="field">
          <span class="field__label">優先度</span>
          <select class="field__control" data-setup-field="quadrant">
            ${TASK_QUADRANTS.map((quadrant) => `
              <option value="${escapeHtml(quadrant.key)}"${normalizeGoalQuadrant(draft.quadrant) === quadrant.key ? " selected" : ""}>${escapeHtml(quadrant.concept)} · ${escapeHtml(quadrant.title)}</option>
            `).join("")}
          </select>
        </label>
      </section>

      <section class="goal-settings-section">
        <h3>実施する時間</h3>
        <div class="field">
          <span class="field__label">曜日</span>
          <div class="weekday-choice-row">
            ${WEEKDAY_KEYS.map((weekdayKey) => renderWeekdayChip(weekdayKey, draft.studyDays)).join("")}
          </div>
        </div>
        ${renderWindowField("時間帯", "primaryStart", "primaryEnd", draft.primaryStart, draft.primaryEnd)}
      </section>

      <section class="goal-settings-section">
        <h3>1回の集中時間</h3>
        <label class="settings-minutes-field">
          <input class="field__control" data-setup-field="normalMinutes" type="number" min="5" max="180" inputmode="numeric" value="${escapeHtml(String(draft.normalMinutes))}" />
          <span>分</span>
        </label>
      </section>

      <button type="button" class="action-button action-button--primary goal-settings-save" data-action="save-setup">${isNewGoal ? "追加する" : "保存する"}</button>

      ${canArchive ? `
        <button type="button" class="goal-settings-archive" data-action="archive-goal" data-goal-id="${escapeHtml(state.meta.activeGoalId)}">この目標を非表示にする</button>
      ` : ""}
    </div>
  `;
}

function renderSetupView() {
  ensureSetupDraft();
  if (ui.setupSection === "availability") {
    return `
      <section class="screen screen--setup screen--settings">
        ${renderAvailabilitySettings()}
      </section>
    `;
  }
  const showHome = ui.setupSection === "home" && ui.setupMode !== "new_goal";
  ui.setupSection = showHome ? "home" : "detail";

  return `
    <section class="screen screen--setup screen--settings">
      ${showHome ? renderSettingsHome() : renderGoalSettingsDetail(ui.setupDraft)}
    </section>
  `;
}

function renderTodayView() {
  const mode = ["time", "organize"].includes(ui.todayMode) ? ui.todayMode : "execution";
  ui.todayMode = mode;
  return `
    <section class="screen screen--today screen--today-unified">
      <div class="today-mode-switch" role="tablist" aria-label="Todayの表示">
        <button type="button" role="tab" class="today-mode-switch__button ${mode === "execution" ? "is-active" : ""}" data-action="set-today-mode" data-mode="execution" aria-selected="${mode === "execution"}">今日</button>
        <button type="button" role="tab" class="today-mode-switch__button ${mode === "time" ? "is-active" : ""}" data-action="set-today-mode" data-mode="time" aria-selected="${mode === "time"}">時間</button>
        <button type="button" role="tab" class="today-mode-switch__button ${mode === "organize" ? "is-active" : ""}" data-action="set-today-mode" data-mode="organize" aria-selected="${mode === "organize"}">4象限</button>
      </div>
      ${mode === "time"
        ? renderTodayTimeView()
        : mode === "organize"
          ? renderTodayOrganizeView()
          : renderTodayExecutionView()}
    </section>
  `;
}

function getTaskResumeAllocationId(plan, task) {
  if (!task || getTaskPausedSeconds(task) <= 0) return "";
  const pendingAllocations = getPlanAllocationsForWork(plan, task.id, { includeCompleted: false });
  return pendingAllocations.find((allocation) => allocation.id === task.pausedAllocationId)?.id
    || pendingAllocations[0]?.id
    || "";
}

function getTodayExecutionItems() {
  return getTodayOrderedWorkItems().map((item) => {
    const pausedSeconds = getTaskPausedSeconds(item);
    return {
      ...item,
      minutes: pausedSeconds
        ? Math.max(1, Math.ceil(pausedSeconds / 60))
        : getWorkItemPlannableMinutes(item),
      allocationId: "",
      pausedRemainingSeconds: pausedSeconds || null,
      segmentIndex: 0,
      segmentCount: 1,
    };
  });
}

function getUnplannedTasks() {
  return normalizeTasks(state.tasks)
    .filter((task) => (
      task.status === "active"
      && !isTaskPlannedToday(task)
      && getTaskPausedSeconds(task) <= 0
    ))
    .sort(compareWorkItems);
}

function getTodayPlannedMinutes() {
  return getTodayOrderedWorkItems()
    .reduce((sum, item) => sum + getWorkItemPlannableMinutes(item), 0);
}

function renderTodayExecutionView() {
  const items = getTodayExecutionItems();
  const today = toISODate(new Date());
  const allDoneToday = !items.length && getAllExecutionLogs().some((entry) => entry.date === today);

  return `
    <div class="today-execution">
      <div class="today-work-list">
        ${items.length
          ? items.map((item, index) => renderTodayWorkItem(item, index)).join("")
          : `
            <section class="today-clear-state">
              <span>${allDoneToday ? "完了" : "空き"}</span>
              <h2>${allDoneToday ? "今日の分はおわり" : "今日はまだ空いています"}</h2>
            </section>
          `}
      </div>
    </div>
  `;
}

function renderPlanDragGrip(label = "移動") {
  return `
    <span class="day-plan-grip" data-plan-drag-handle aria-label="${escapeHtml(label)}" role="img">
      <svg viewBox="0 0 16 20" aria-hidden="true">
        <circle cx="5" cy="4" r="1.3"></circle><circle cx="11" cy="4" r="1.3"></circle>
        <circle cx="5" cy="10" r="1.3"></circle><circle cx="11" cy="10" r="1.3"></circle>
        <circle cx="5" cy="16" r="1.3"></circle><circle cx="11" cy="16" r="1.3"></circle>
      </svg>
    </span>
  `;
}

function renderTodayPlanSlot(slot, plan) {
  const allocations = plan.allocations.filter((allocation) => allocation.slotId === slot.id);
  const slotMinutes = getAvailabilitySlotMinutes(slot);
  const usedMinutes = allocations.reduce((sum, allocation) => sum + allocation.minutes, 0);
  const freeMinutes = Math.max(0, slotMinutes - usedMinutes);

  return `
    <div class="day-plan-slot">
      <div class="day-plan-slot__time">
        <strong>${escapeHtml(slot.start)}</strong>
        <span>${escapeHtml(slot.end)}</span>
      </div>
      <div class="day-plan-slot__track${allocations.length ? "" : " is-empty"}" data-plan-slot-id="${escapeHtml(slot.id)}">
        ${allocations.map((allocation) => {
          const item = getWorkItemById(allocation.workId);
          if (!item) return "";
          const color = getQuadrantColor(item.quadrant);
          const width = Math.max(7, (allocation.minutes / Math.max(1, slotMinutes)) * 100);
          const segmentList = getPlanAllocationsForWork(plan, item.id);
          const segmentIndex = Math.max(0, segmentList.findIndex((segment) => segment.id === allocation.id));
          const splitLabel = segmentList.length > 1 ? ` ${segmentIndex + 1}/${segmentList.length}` : "";
          return `
            <div
              class="day-plan-segment${allocation.completedAt ? " is-complete" : ""}"
              style="--segment-color:${color};--segment-width:${width}%"
              data-plan-work-id="${escapeHtml(item.id)}"
            >
              ${allocation.completedAt ? '<span class="day-plan-segment__check" aria-label="完了">✓</span>' : renderPlanDragGrip(`${item.title}を移動`)}
              <span class="day-plan-segment__title">${escapeHtml(item.title)}</span>
              <small>${escapeHtml(`${allocation.minutes}分${splitLabel}`)}</small>
            </div>
          `;
        }).join("")}
        ${freeMinutes > 0 ? `<div class="day-plan-slot__free" style="--free-width:${(freeMinutes / Math.max(1, slotMinutes)) * 100}%"><span>空き ${freeMinutes}分</span></div>` : ""}
      </div>
    </div>
  `;
}

function renderTodayPlanner(plan, unplannedTasks) {
  const stats = getTodayPlanStats(plan);
  const overflow = getTodayPlanningOverflow(plan);
  const fillRatio = Math.min(100, Math.round((stats.allocatedMinutes / Math.max(1, stats.capacityMinutes)) * 100));

  return `
    <section class="day-plan${stats.overflowMinutes > 0 ? " has-overflow" : ""}">
      <button type="button" class="day-plan__summary" data-action="toggle-today-planner" aria-expanded="${ui.todayPlannerOpen}">
        <span>
          <small>今日の時間</small>
          <strong>${escapeHtml(`${stats.allocatedMinutes}/${stats.capacityMinutes}分`)}</strong>
        </span>
        <span class="day-plan__balance${stats.overflowMinutes > 0 ? " is-overflow" : ""}">
          ${stats.overflowMinutes > 0 ? escapeHtml(`入らない ${stats.overflowMinutes}分`) : escapeHtml(`空き ${stats.freeMinutes}分`)}
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"></path></svg>
      </button>
      <div class="day-plan__progress" aria-hidden="true"><span style="width:${fillRatio}%"></span></div>

      ${ui.todayPlannerOpen ? `
        <div class="day-plan__body">
          <div class="day-plan__slots">
            ${plan.slots.map((slot) => renderTodayPlanSlot(slot, plan)).join("")}
          </div>

          ${overflow.length ? `
            <div class="day-plan-overflow">
              <div class="day-plan-overflow__head">
                <span>今日は入らない</span>
                <strong>${escapeHtml(`${stats.overflowMinutes}分`)}</strong>
              </div>
              ${overflow.map(({ item, minutes }) => `
                <div class="day-plan-overflow__item">
                  <span style="--work-accent:${getQuadrantColor(item.quadrant)}"></span>
                  <strong>${escapeHtml(item.title)}</strong>
                  <small>${escapeHtml(`${minutes}分`)}</small>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${unplannedTasks.length ? `
            <div class="day-plan-inbox">
              <div class="day-plan-inbox__head">
                <span>未計画</span>
                <button type="button" data-action="set-today-mode" data-mode="organize">整理</button>
              </div>
              <div class="day-plan-inbox__list">
                ${unplannedTasks.map((task) => `
                  <div class="day-plan-inbox__item" data-plan-work-id="${escapeHtml(task.id)}">
                    ${renderPlanDragGrip(`${task.title}を空き時間へ移動`)}
                    <strong>${escapeHtml(task.title)}</strong>
                    <small>${escapeHtml(`${getTaskRemainingMinutes(task)}分`)}</small>
                    <button type="button" data-action="plan-work-today" data-work-id="${escapeHtml(task.id)}" aria-label="${escapeHtml(task.title)}を今日に入れる">＋</button>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <div class="day-plan__actions">
            <button type="button" data-action="auto-plan-today">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h9M5 12h14M5 17h11"></path><path d="m16 5 3 2-3 2"></path></svg>
              <span>整える</span>
            </button>
            <button type="button" data-action="set-today-mode" data-mode="time">
              ${renderSettingsIcon("clock")}
              <span>時間</span>
            </button>
          </div>
        </div>
      ` : ""}
    </section>
  `;
}

function renderTodayWorkItem(item, index) {
  const quadrant = getTaskQuadrantMeta(item.quadrant) || getTaskQuadrantMeta("notUrgentImportant");
  const pausedSeconds = getTaskPausedSeconds(item);
  const minutesLabel = pausedSeconds ? `残り ${formatTaskRemaining(pausedSeconds)}` : `${item.minutes}分`;
  const itemType = item.kind === "goal" ? (item.isHabit ? "習慣" : "目標") : quadrant.concept;
  const startAction = item.kind === "goal" ? "start-goal-session" : "start-task-session";
  const idAttribute = item.kind === "goal"
    ? `data-goal-id="${escapeHtml(item.sourceId)}"`
    : `data-task-id="${escapeHtml(item.sourceId)}"`;

  return `
    <article class="today-work-item ${index === 0 ? "is-next" : ""}" style="--work-accent:${getQuadrantColor(item.quadrant)}">
      <div class="today-work-item__copy">
        <div class="today-work-item__meta">
          <span>${index === 0 ? "次にやる" : escapeHtml(itemType)}</span>
          ${index === 0 ? `<small>${escapeHtml(itemType)}</small>` : ""}
        </div>
        <h2>${escapeHtml(item.title)}</h2>
      </div>
      <div class="today-work-item__actions">
        <span>${escapeHtml(minutesLabel)}</span>
        <button type="button" class="today-work-item__start" data-action="${startAction}" ${idAttribute}>${pausedSeconds ? "再開" : "開始"}</button>
      </div>
    </article>
  `;
}

function getWorkItemTypeLabel(item) {
  if (item.kind === "goal") return item.isHabit ? "習慣" : "目標";
  return getTaskQuadrantMeta(item.quadrant)?.concept || "Task";
}

function getWorkItemQuadrantLabel(item) {
  return getTaskQuadrantMeta(item?.quadrant)?.concept || "未整理";
}

function getWorkItemPlanningLabel(item) {
  return item.kind === "goal" ? getWorkItemTypeLabel(item) : "Task";
}

function getScheduleAvailabilityRanges(plan) {
  return normalizeAvailabilitySlots(plan.slots, plan.capacityMinutes)
    .map((slot) => ({
      id: slot.id,
      start: clockTimeToMinutes(slot.start),
      end: clockTimeToMinutes(slot.end),
    }))
    .filter((slot) => slot.start !== null && slot.end !== null && slot.end > slot.start);
}

function formatScheduleClock(value) {
  const total = Math.max(0, Math.round(Number(value) || 0));
  const dayOffset = Math.floor(total / (24 * 60));
  const minuteOfDay = total % (24 * 60);
  const clock = `${String(Math.floor(minuteOfDay / 60)).padStart(2, "0")}:${String(minuteOfDay % 60).padStart(2, "0")}`;
  return dayOffset > 0 ? `翌 ${clock}` : clock;
}

function isMinuteInAvailability(minute, ranges) {
  return ranges.some((range) => minute >= range.start && minute < range.end);
}

function getNextAvailableMinute(minute, ranges) {
  const cursor = Math.max(0, Number(minute) || 0);
  for (const range of ranges) {
    if (cursor < range.start) return range.start;
    if (cursor < range.end) return cursor;
  }
  return cursor;
}

function buildContinuousScheduleSegments(startMinute, durationMinutes, ranges) {
  const start = Math.max(0, Math.round(startMinute));
  const end = start + Math.max(0, Math.round(durationMinutes));
  const boundaries = [...new Set([
    start,
    end,
    ...ranges.flatMap((range) => [range.start, range.end])
      .filter((minute) => minute > start && minute < end),
  ])].sort((left, right) => left - right);

  return boundaries.slice(0, -1).map((segmentStart, index) => {
    const segmentEnd = boundaries[index + 1];
    return {
      start: segmentStart,
      end: segmentEnd,
      minutes: segmentEnd - segmentStart,
      inside: isMinuteInAvailability(segmentStart, ranges),
    };
  });
}

function buildPackedScheduleSegments(startMinute, durationMinutes, ranges) {
  let cursor = getNextAvailableMinute(startMinute, ranges);
  let remaining = Math.max(0, Math.round(durationMinutes));
  const segments = [];

  while (remaining > 0) {
    const range = ranges.find((candidate) => cursor < candidate.end);
    if (!range) {
      segments.push({
        start: cursor,
        end: cursor + remaining,
        minutes: remaining,
        inside: false,
      });
      break;
    }
    cursor = Math.max(cursor, range.start);
    const take = Math.min(remaining, range.end - cursor);
    if (take > 0) {
      segments.push({
        start: cursor,
        end: cursor + take,
        minutes: take,
        inside: true,
      });
      cursor += take;
      remaining -= take;
    }
    if (remaining > 0 && cursor >= range.end) {
      const nextRange = ranges.find((candidate) => candidate.start >= cursor && candidate.end > cursor);
      cursor = nextRange?.start ?? cursor;
    }
  }

  return segments;
}

function getAvailableMinutesBetween(startMinute, endMinute, ranges) {
  if (endMinute <= startMinute) return 0;
  return ranges.reduce((sum, range) => (
    sum + Math.max(0, Math.min(endMinute, range.end) - Math.max(startMinute, range.start))
  ), 0);
}

function buildTodayTimeRows(items, plan) {
  const ranges = getScheduleAvailabilityRanges(plan);
  const defaultStart = ranges[0]?.start ?? 20 * 60;
  let cursor = null;

  return items.map((item) => {
    const minutes = getWorkItemPlannableMinutes(item);
    const requestedStart = clockTimeToMinutes(plan.startTimes?.[item.id]);
    const hasRequestedStart = requestedStart !== null;
    const candidateStart = hasRequestedStart
      ? cursor === null ? requestedStart : Math.max(cursor, requestedStart)
      : cursor ?? defaultStart;
    const startMinutes = hasRequestedStart
      ? candidateStart
      : getNextAvailableMinute(candidateStart, ranges);
    const startsInsideAvailability = isMinuteInAvailability(startMinutes, ranges);
    const segments = !hasRequestedStart || startsInsideAvailability
      ? buildPackedScheduleSegments(startMinutes, minutes, ranges)
      : buildContinuousScheduleSegments(startMinutes, minutes, ranges);
    const endMinutes = segments.at(-1)?.end ?? startMinutes;
    const insideMinutes = segments
      .filter((segment) => segment.inside)
      .reduce((sum, segment) => sum + segment.minutes, 0);
    const outsideMinutes = Math.max(0, minutes - insideMinutes);
    cursor = endMinutes;

    return {
      item,
      minutes,
      segments,
      ranges: segments.map((segment) => `${formatScheduleClock(segment.start)}–${formatScheduleClock(segment.end)}`),
      startMinutes,
      endMinutes,
      requestedStartMinutes: hasRequestedStart ? requestedStart : null,
      shiftedMinutes: hasRequestedStart ? Math.max(0, startMinutes - requestedStart) : 0,
      insideMinutes,
      outsideMinutes,
    };
  });
}

function renderTodayTimeSegment(row, segment, segmentIndex) {
  const pausedSeconds = getTaskPausedSeconds(row.item);
  const isPrimary = segmentIndex === 0;
  const isContinuation = !isPrimary;
  const timeText = `${formatScheduleClock(segment.start)}–${formatScheduleClock(segment.end)}`;
  const riskText = !segment.inside
    ? `${segment.minutes}分は空き時間の外`
    : isPrimary && row.shiftedMinutes > 0
      ? `前の予定から${row.shiftedMinutes}分後ろへ調整`
      : "";
  const splitText = isPrimary && row.segments.length > 1
    ? `${row.segments.length}つの時間枠に分けて予定`
    : "";
  const inputMinute = Math.max(0, row.startMinutes % (24 * 60));
  const plan = ensureDailyPlan();
  const savedHabitStart = row.item.isHabit
    ? clockTimeToMinutes(plan.defaultStartTimes?.[row.item.id])
      ?? clockTimeToMinutes(String(row.item.goal?.setup?.primaryWindow || "").split("-")[0])
    : null;
  const showHabitTimeAction = isPrimary
    && row.item.isHabit
    && savedHabitStart !== inputMinute;
  return `
    <article
      class="time-plan-item${segment.inside ? "" : " is-over is-fully-over"}${isContinuation ? " is-continuation-segment" : ""}"
      style="--time-block-height:${Math.min(118, Math.max(68, Math.round(segment.minutes * 1.2)))}px"
      data-plan-work-id="${escapeHtml(row.item.id)}"
      data-time-order-item="${escapeHtml(row.item.id)}"
      data-time-start-minute="${segment.start}"
      data-time-end-minute="${segment.end}"
      data-time-outside="${segment.inside ? "false" : "true"}"
    >
      ${renderPlanDragGrip(`${row.item.title}の順番を移動`)}
      ${isPrimary ? `
        <label class="time-plan-item__clock" title="${escapeHtml(timeText)}">
          <span>開始</span>
          <input
            type="time"
            step="${TIME_SNAP_MINUTES * 60}"
            value="${escapeHtml(minutesToClockTime(inputMinute))}"
            data-time-start-field="${escapeHtml(row.item.id)}"
            aria-label="${escapeHtml(`${row.item.title}の開始時刻`)}"
          />
          <small>– ${escapeHtml(formatScheduleClock(segment.end))}</small>
        </label>
      ` : `
        <div class="time-plan-item__clock" title="${escapeHtml(timeText)}">
          <span>続き</span>
          <strong>${escapeHtml(formatScheduleClock(segment.start))}</strong>
          <small>– ${escapeHtml(formatScheduleClock(segment.end))}</small>
        </div>
      `}
      <div class="time-plan-item__copy">
        <span>${escapeHtml(`${getWorkItemPlanningLabel(row.item)} · ${pausedSeconds ? `残り ${formatTaskRemaining(pausedSeconds)}` : `${segment.minutes}分`}`)}</span>
        <strong class="time-plan-item__title">${escapeHtml(row.item.title)}</strong>
        ${splitText ? `<small class="time-plan-item__split">${escapeHtml(splitText)}</small>` : ""}
        ${showHabitTimeAction ? `
          <button
            type="button"
            class="time-plan-item__habit-time"
            data-action="set-habit-default-time"
            data-work-id="${escapeHtml(row.item.id)}"
            aria-label="${escapeHtml(`${row.item.title}の習慣時間を${minutesToClockTime(inputMinute)}にする`)}"
          >習慣もこの時間に</button>
        ` : ""}
      </div>
      ${riskText ? `<small class="time-plan-item__risk">${escapeHtml(riskText)}</small>` : ""}
      ${isContinuation
        ? `<span class="time-plan-item__continuation">${segmentIndex + 1}/${row.segments.length}</span>`
        : pausedSeconds
          ? `<span class="time-plan-item__continuation">続き</span>`
          : `<button type="button" class="time-plan-item__remove" data-action="toggle-work-today" data-work-id="${escapeHtml(row.item.id)}" aria-label="${escapeHtml(row.item.title)}を今日やらないへ移す" title="今日やらないへ移す">やらない</button>`}
    </article>
  `;
}

function renderTodayTimeGap(startMinute, endMinute, ranges, beforeWorkId = "", showStartTime = true) {
  const minutes = Math.max(0, endMinute - startMinute);
  if (minutes < TIME_SNAP_MINUTES) return "";
  const availableMinutes = getAvailableMinutesBetween(startMinute, endMinute, ranges);
  const outsideMinutes = Math.max(0, minutes - availableMinutes);
  const availableLabel = formatLoggedDuration(availableMinutes * 60);
  const outsideLabel = formatLoggedDuration(outsideMinutes * 60);
  const label = outsideMinutes < 1
    ? `空き ${availableLabel}`
    : availableMinutes > 0
      ? `空き ${availableLabel} · 枠外 ${outsideLabel}`
      : `空き枠の外 ${outsideLabel}`;
  const stateClass = outsideMinutes < 1
    ? " is-available"
    : availableMinutes > 0
      ? " has-outside is-mixed"
      : " has-outside is-outside";
  const height = Math.min(76, Math.max(30, Math.round(minutes * 0.68)));
  return `
    <div
      class="time-timeline-gap${stateClass}"
      style="--timeline-gap-height:${height}px"
      data-time-gap-start="${startMinute}"
      data-time-gap-end="${endMinute}"
      data-time-gap-outside="${outsideMinutes > 0 ? "true" : "false"}"
      data-time-drop-before="${escapeHtml(beforeWorkId)}"
    >
      <time>${showStartTime ? escapeHtml(formatScheduleClock(startMinute)) : ""}</time>
      <span class="time-timeline-gap__line"></span>
      <strong>${escapeHtml(label)}</strong>
    </div>
  `;
}

function renderTodayTimeRows(rows, plan) {
  const ranges = getScheduleAvailabilityRanges(plan);
  const boundaryEvents = plan.slots.flatMap((slot, index) => ([
    { type: "start", minute: clockTimeToMinutes(slot.start) ?? 0, slot, index },
    { type: "end", minute: clockTimeToMinutes(slot.end) ?? 0, slot, index },
  ]));
  const segmentEvents = rows.flatMap((row) => row.segments.map((segment, segmentIndex) => ({
    type: "segment",
    minute: segment.start,
    row,
    segment,
    segmentIndex,
  })));
  const eventOrder = { start: 0, segment: 1, end: 2 };
  const events = [...boundaryEvents, ...segmentEvents].sort((left, right) => (
    left.minute - right.minute || eventOrder[left.type] - eventOrder[right.type]
  ));
  let cursor = events[0]?.minute ?? ranges[0]?.start ?? 20 * 60;
  const chunks = [];
  let previousEventType = "";

  events.forEach((event) => {
    if (event.minute > cursor) {
      const beforeWorkId = event.type === "segment" ? event.row.item.id : "";
      chunks.push(renderTodayTimeGap(cursor, event.minute, ranges, beforeWorkId, previousEventType === "segment"));
    }
    if (event.type === "segment") {
      chunks.push(renderTodayTimeSegment(event.row, event.segment, event.segmentIndex));
      cursor = Math.max(cursor, event.segment.end);
      previousEventType = event.type;
      return;
    }
    chunks.push(renderInlineAvailabilityHandle(event.slot, event.index, event.type));
    cursor = Math.max(cursor, event.minute);
    previousEventType = event.type;
  });

  return chunks.join("");
}

function renderTodayTimeCandidate(item) {
  return `
    <article
      class="time-candidate"
      data-plan-work-id="${escapeHtml(item.id)}"
      data-time-candidate-item="${escapeHtml(item.id)}"
    >
      ${renderPlanDragGrip(`${item.title}を今日へ移動`)}
      <div class="time-candidate__copy">
        <strong class="time-candidate__title">${escapeHtml(item.title)}</strong>
      </div>
      <span class="time-candidate__minutes">${escapeHtml(`${getWorkItemPlannableMinutes(item)}分`)}</span>
      <button type="button" data-action="toggle-work-today" data-work-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.title)}を今日に入れる" title="今日に入れる">＋</button>
    </article>
  `;
}

function renderInlineAvailabilityGrip() {
  return `
    <svg viewBox="0 0 18 22" aria-hidden="true">
      <path d="M9 2.5v17"></path>
      <path d="m5.5 6 3.5-3.5L12.5 6"></path>
      <path d="m5.5 16 3.5 3.5 3.5-3.5"></path>
    </svg>
  `;
}

function renderInlineAvailabilityHandle(slot, index, edge) {
  const isStart = edge === "start";
  const minute = clockTimeToMinutes(slot[edge]) ?? 0;
  const label = isStart ? "開始" : "終了";
  return `
    <div
      class="time-availability-handle time-availability-handle--${edge}"
    >
      <button
        type="button"
        class="time-availability-handle__grip"
        role="slider"
        aria-orientation="vertical"
        aria-label="${index + 1}番目の空き時間の${label}"
        aria-valuemin="0"
        aria-valuemax="${AVAILABILITY_DAY_MINUTES - TIME_SNAP_MINUTES}"
        aria-valuenow="${minute}"
        aria-valuetext="${escapeHtml(slot[edge])}"
        data-inline-availability-drag-handle="${edge}"
        data-slot-id="${escapeHtml(slot.id)}"
      >${renderInlineAvailabilityGrip()}</button>
      <span>${label}</span>
      <time data-inline-availability-time="${edge}">${escapeHtml(slot[edge])}</time>
    </div>
  `;
}

function renderTodayTimeView() {
  const plan = ensureDailyPlan();
  const draft = ensureTaskDraft();
  const items = getTodayOrderedWorkItems();
  const selectedIds = new Set(items.map((item) => item.id));
  const candidates = getActiveWorkItems()
    .filter((item) => getWorkItemPlannableMinutes(item) > 0 && !selectedIds.has(item.id))
    .sort(compareWorkItems);
  const rows = buildTodayTimeRows(items, plan);
  const stats = getTodayPlanStats(plan);
  const scheduledInsideMinutes = rows.reduce((sum, row) => sum + row.insideMinutes, 0);
  const scheduledOutsideMinutes = rows.reduce((sum, row) => sum + row.outsideMinutes, 0);
  const scheduledFreeMinutes = Math.max(0, stats.capacityMinutes - scheduledInsideMinutes);
  return `
    <div class="today-time">
      <section class="time-budget${scheduledOutsideMinutes > 0 ? " is-over" : ""}">
        <div class="time-budget__summary">
          <div class="time-budget__main">
            <span>今日の空き時間</span>
            <strong data-inline-availability-total>${escapeHtml(`${stats.capacityMinutes}分`)}</strong>
          </div>
          <div class="time-budget__status">
            <strong>${escapeHtml(scheduledOutsideMinutes > 0 ? `枠外 ${scheduledOutsideMinutes}分` : `あと${scheduledFreeMinutes}分`)}</strong>
            <span>${escapeHtml(`${stats.allocatedMinutes}分を予定`)}</span>
          </div>
        </div>
      </section>

      <section class="time-plan-section">
        <div class="time-plan-section__head">
          <h2>今日やる</h2>
          <span>${escapeHtml(`${items.length}件 · ${stats.allocatedMinutes}分`)}</span>
        </div>
        <div
          class="time-plan-list time-timeline"
          data-time-order-zone
          data-time-plan-zone="today"
          data-time-empty-start="${getScheduleAvailabilityRanges(plan)[0]?.start ?? 20 * 60}"
        >
          ${renderTodayTimeRows(rows, plan)}
        </div>
      </section>

      <section class="time-plan-section time-plan-section--candidates time-later-zone" data-time-plan-zone="later">
        <div class="time-plan-section__head">
          <h2>今日やらない</h2>
          <span>${escapeHtml(`${candidates.length}件`)}</span>
        </div>
        <div class="time-task-capture">
          <input
            class="field__control time-task-capture__title"
            data-task-draft-field="title"
            type="text"
            value="${escapeHtml(draft.title || "")}"
            placeholder="Taskを追加"
            aria-label="未予定のTask名"
          />
          <label class="task-minute-inline time-task-capture__minutes">
            <input
              class="field__control"
              data-task-draft-field="minutes"
              type="number"
              min="1"
              max="240"
              inputmode="numeric"
              value="${escapeHtml(String(draft.minutes || TASK_DEFAULT_MINUTES))}"
              aria-label="予定分数"
            />
            <span>分</span>
          </label>
          <button type="button" data-action="add-task" aria-label="未予定のTaskを追加" title="Taskを追加">＋</button>
        </div>
        <div class="time-candidate-list">
          ${candidates.length
            ? candidates.map(renderTodayTimeCandidate).join("")
            : '<div class="time-plan-empty">未予定のTaskはありません。</div>'}
        </div>
      </section>
    </div>
  `;
}

function renderTodayOrganizeView() {
  ensureDailyPlan();
  const draft = ensureTaskDraft();
  const tasks = normalizeTasks(state.tasks);
  const activeTasks = tasks.filter((task) => task.status === "active");
  const workItems = getActiveWorkItems();
  const activeGroups = groupActiveWorkItemsByQuadrant(workItems);
  const shelvedTasks = tasks.filter((task) => task.status === "shelved");
  const doneTasks = tasks.filter((task) => task.status === "done").slice(0, 5);

  return `
    <div class="today-organize">
      <section class="panel task-composer task-composer--simple">
        <div class="task-add-row task-add-row--simple">
          <input class="field__control task-title-input" data-task-draft-field="title" type="text" value="${escapeHtml(draft.title || "")}" placeholder="あとでやること" />
          <label class="task-minute-inline">
            <input class="field__control" data-task-draft-field="minutes" type="number" min="1" max="240" inputmode="numeric" value="${escapeHtml(String(draft.minutes || TASK_DEFAULT_MINUTES))}" aria-label="予定分数" />
            <span>分</span>
          </label>
          <button type="button" class="action-button action-button--primary task-add-button" data-action="add-task" aria-label="Taskを追加">＋</button>
        </div>
      </section>

      ${renderTaskQuadrantBoard(activeGroups)}
      ${renderSelectedTaskPanel(workItems)}
      ${renderTaskInbox(activeGroups[TASK_QUADRANT_DEFAULT])}

      <section class="task-list-section">
        <button type="button" class="task-shelf-toggle" data-action="toggle-shelved-tasks">
          <span>棚上げ中</span>
          <span>${escapeHtml(`${shelvedTasks.length}件`)}</span>
        </button>
        ${ui.taskShowShelved
          ? `<div class="task-list task-list--shelved">
              ${shelvedTasks.length
                ? shelvedTasks.map(renderShelvedTaskCard).join("")
                : `<section class="panel panel--warm task-empty"><p>棚上げ中のTaskはありません。</p></section>`}
            </div>`
          : ""}
      </section>

      ${doneTasks.length
        ? `<details class="task-history">
            <summary>完了済み ${escapeHtml(`${doneTasks.length}件`)}</summary>
            <div class="task-list task-list--done">
              ${doneTasks.map(renderDoneTaskCard).join("")}
            </div>
          </details>`
        : ""}
    </div>
  `;
}

function renderTasksView() {
  ui.todayMode = "organize";
  return renderTodayView();
}

function renderTaskResumeQueue(tasks) {
  if (!tasks.length) {
    return "";
  }

  return `
    <section class="task-resume-queue" aria-label="続きから再開">
      <div class="task-resume-queue__head">
        <strong>続き</strong>
        <span>${escapeHtml(`${tasks.length}件`)}</span>
      </div>
      ${tasks.map((task) => `
        <div class="task-resume-row">
          <div class="task-resume-row__work">
            <strong>${escapeHtml(task.title)}</strong>
            <span>残り ${escapeHtml(formatTaskRemaining(getTaskPausedSeconds(task)))}</span>
          </div>
          <button type="button" class="task-resume-row__button" data-action="start-task-session" data-task-id="${escapeHtml(task.id)}">再開</button>
        </div>
      `).join("")}
    </section>
  `;
}

function renderTaskInbox(tasks) {
  return `
    <section class="task-list-section task-inbox" data-task-quadrant-zone="${TASK_QUADRANT_DEFAULT}">
      <div class="task-list-section__head">
        <h3 class="section-title section-title--small">未整理</h3>
        <span class="status-badge">${escapeHtml(`${tasks.length}件`)}</span>
      </div>
      <div class="task-list task-list--inbox">
        ${tasks.length
          ? tasks.map((task) => renderActiveTaskCard(task)).join("")
          : `<div class="task-drop-empty">Taskは空です。</div>`}
      </div>
    </section>
  `;
}

function renderTaskQuadrantBoard(groups) {
  const assignedTasks = TASK_QUADRANTS.flatMap((quadrant) => groups[quadrant.key] || []);
  const totalMinutes = assignedTasks.reduce((sum, task) => sum + getWorkItemPlannableMinutes(task), 0);

  return `
    <section class="task-quadrant-board">
      <div class="task-board-head">
        <div>
          <h3 class="section-title section-title--small">優先順位</h3>
        </div>
        <span class="status-badge">${escapeHtml(`${assignedTasks.length}件 / ${totalMinutes}分`)}</span>
      </div>
      <div class="task-quadrant-grid">
        ${TASK_QUADRANTS.map((quadrant) => renderTaskQuadrant(quadrant, groups[quadrant.key] || [], totalMinutes)).join("")}
      </div>
    </section>
  `;
}

function renderTaskQuadrant(quadrant, tasks, boardTotalMinutes = 0) {
  const totalMinutes = tasks.reduce((sum, task) => sum + getWorkItemPlannableMinutes(task), 0);

  return `
    <section class="task-quadrant task-quadrant--${escapeHtml(quadrant.key)}" data-task-quadrant-zone="${escapeHtml(quadrant.key)}" style="--quadrant-color:${getQuadrantColor(quadrant.key)}">
      <div class="task-quadrant__head">
        <div class="task-quadrant__label">
          <span class="task-quadrant__axis">${escapeHtml(quadrant.frameworkLabel)}</span>
          <h4>${escapeHtml(quadrant.concept)}</h4>
          <p>${escapeHtml(quadrant.title)}</p>
        </div>
        <div class="task-quadrant__time">
          <strong>${escapeHtml(String(totalMinutes))}</strong>
          <span>分</span>
        </div>
      </div>
      <div class="task-quadrant__list">
        ${tasks.length
          ? tasks.map(renderTaskBoardItem).join("")
          : `<div class="task-drop-empty">空</div>`}
      </div>
    </section>
  `;
}

function renderTaskDragGrip() {
  return `<span class="task-drag-grip" data-task-drag-handle aria-hidden="true"></span>`;
}

function renderTaskResumeBadge(task, className = "task-resume-badge") {
  const seconds = getTaskPausedSeconds(task);
  return seconds > 0
    ? `<span class="${escapeHtml(className)}">残り ${escapeHtml(formatTaskRemaining(seconds))}</span>`
    : "";
}

function renderTaskBoardItem(task) {
  const isSelected = ui.selectedTaskId === task.id;
  const progress = getTaskSubtaskProgress(task);
  const progressBadge = progress.total
    ? `<span class="task-board-item__breakdown">${escapeHtml(`${progress.done}/${progress.total}`)}</span>`
    : "";
  const resumeBadge = renderTaskResumeBadge(task, "task-board-item__resume");
  const completedToday = task.kind === "goal" && getGoalMissionStateForDate(task.goal).isClosed;
  const selectedToday = isWorkItemSelectedToday(task, state.dailyPlan);
  const typeBadge = task.kind === "goal"
    ? `<span class="task-board-item__type${completedToday ? " is-complete" : ""}">${completedToday ? "今日完了" : (task.isHabit ? "習慣" : "目標")}</span>`
    : "";
  const todayBadge = selectedToday && !completedToday
    ? `<span class="task-board-item__type is-today">今日</span>`
    : "";
  const badges = resumeBadge || progressBadge || typeBadge || todayBadge
    ? `<span class="task-board-item__badges">${todayBadge}${typeBadge}${resumeBadge}${progressBadge}</span>`
    : "";
  return `
    <button
      type="button"
      class="task-board-item task-board-item--${escapeHtml(task.kind || "task")}${isSelected ? " is-selected" : ""}"
      data-action="select-task"
      data-task-id="${escapeHtml(task.id)}"
      data-task-draggable="true"
      data-task-drop-item="true"
    >
      ${renderTaskDragGrip()}
      <span class="task-board-item__title">${escapeHtml(task.title)}</span>
      ${badges}
    </button>
  `;
}

function renderSelectedTaskPanel(tasks) {
  const selectedTask = tasks.find((task) => task.id === ui.selectedTaskId);
  if (!selectedTask) {
    return "";
  }
  if (selectedTask.kind === "goal") {
    return renderSelectedGoalPanel(selectedTask);
  }
  const pausedSeconds = getTaskPausedSeconds(selectedTask);
  const plannedToday = isWorkItemSelectedToday(selectedTask, state.dailyPlan);

  return `
    <section class="task-selected-panel">
      <div class="task-selected-panel__main">
        <label class="task-edit-title-wrap">
          <span>${pausedSeconds ? `続き · 残り ${escapeHtml(formatTaskRemaining(pausedSeconds))}` : "Task"}</span>
          <input class="task-edit-title" data-task-title-field="${escapeHtml(selectedTask.id)}" type="text" value="${escapeHtml(selectedTask.title)}" aria-label="Task名" />
        </label>
        <div class="task-card__meta">
          <label class="task-card__minutes">
            <input class="task-card__minutes-input" data-task-minutes-field="${escapeHtml(selectedTask.id)}" type="number" min="1" max="240" inputmode="numeric" value="${escapeHtml(String(selectedTask.minutes))}" aria-label="予定分数" />
            <span>分</span>
          </label>
          <select class="task-card__quadrant-select" data-task-quadrant-select="${escapeHtml(selectedTask.id)}" aria-label="分類">
            ${renderTaskQuadrantOptions(selectedTask.quadrant)}
          </select>
        </div>
      </div>
      ${renderTaskBreakdown(selectedTask)}
      <div class="task-card__actions">
        ${pausedSeconds
          ? `<button type="button" class="action-button action-button--primary" data-action="go-to-today">続きは今日から</button>`
          : `<button type="button" class="action-button action-button--primary" data-action="toggle-work-today" data-work-id="${escapeHtml(selectedTask.id)}">${plannedToday ? "今日から外す" : "今日に入れる"}</button>`}
        <button type="button" class="soft-button" data-action="complete-task" data-task-id="${escapeHtml(selectedTask.id)}">完了</button>
        <button type="button" class="soft-button" data-action="shelve-task" data-task-id="${escapeHtml(selectedTask.id)}">あとで</button>
      </div>
    </section>
  `;
}

function renderSelectedGoalPanel(item) {
  const goal = item.goal;
  const timing = `${formatStudyDays(goal.setup.studyDays)} · ${goal.setup.primaryWindow}`;
  const pausedSeconds = getTaskPausedSeconds(item);
  const completedToday = getGoalMissionStateForDate(goal).isClosed;
  const selectedToday = isWorkItemSelectedToday(item, state.dailyPlan);
  return `
    <section class="task-selected-panel task-selected-panel--goal">
      <div class="task-selected-panel__main">
        <div class="task-edit-title-wrap">
          <span>${pausedSeconds ? `続き · 残り ${escapeHtml(formatTaskRemaining(pausedSeconds))}` : (item.isHabit ? "習慣" : "目標")}</span>
          <strong class="task-edit-title task-edit-title--static">${escapeHtml(item.title)}</strong>
        </div>
        <div class="task-card__meta">
          <span class="task-card__minutes task-card__minutes--static">${escapeHtml(pausedSeconds ? `残り ${formatTaskRemaining(pausedSeconds)}` : `${item.minutes}分`)}</span>
          <select class="task-card__quadrant-select" data-task-quadrant-select="${escapeHtml(item.id)}" aria-label="分類">
            ${renderGoalQuadrantOptions(item.quadrant)}
          </select>
        </div>
        <p class="task-selected-panel__schedule">${escapeHtml(timing)}</p>
      </div>
      <div class="task-card__actions">
        ${completedToday
          ? `<button type="button" class="action-button action-button--primary" disabled>今日完了</button>
             <button type="button" class="soft-button" data-action="open-review" data-goal-id="${escapeHtml(item.sourceId)}">Reviewを見る</button>`
          : pausedSeconds
            ? `<button type="button" class="action-button action-button--primary" data-action="go-to-today">続きは今日から</button>`
            : `<button type="button" class="action-button action-button--primary" data-action="toggle-work-today" data-work-id="${escapeHtml(item.id)}">${selectedToday ? "今日から外す" : "今日に入れる"}</button>`}
        <button type="button" class="soft-button" data-action="open-goal-settings" data-goal-id="${escapeHtml(item.sourceId)}">設定</button>
      </div>
    </section>
  `;
}

function renderTaskBreakdown(task) {
  const subtasks = normalizeTaskSubtasks(task.subtasks);
  const progress = getTaskSubtaskProgress(task);
  const draft = getTaskSubtaskDraft(task.id);

  return `
    <div class="task-breakdown">
      <div class="task-breakdown__head">
        <span>小Task</span>
        <span>${escapeHtml(`${progress.done}/${progress.total}`)}</span>
      </div>
      <div class="task-subtask-list">
        ${subtasks.length
          ? subtasks.map((subtask) => renderTaskSubtask(task, subtask)).join("")
          : `<div class="task-subtask-empty">まだ分解なし</div>`}
      </div>
      <div class="task-subtask-add">
        <input class="task-subtask-add__input" data-subtask-draft-field data-task-id="${escapeHtml(task.id)}" type="text" value="${escapeHtml(draft)}" placeholder="小さく分ける" aria-label="小Taskを追加" />
        <button type="button" class="task-subtask-add__button" data-action="add-subtask" data-task-id="${escapeHtml(task.id)}" aria-label="小Taskを追加">＋</button>
      </div>
    </div>
  `;
}

function renderTaskSubtask(task, subtask) {
  return `
    <div class="task-subtask${subtask.done ? " is-done" : ""}">
      <button type="button" class="task-subtask__toggle" data-action="toggle-subtask" data-task-id="${escapeHtml(task.id)}" data-subtask-id="${escapeHtml(subtask.id)}" aria-label="${subtask.done ? "未完了に戻す" : "完了にする"}">${subtask.done ? "✓" : ""}</button>
      <input class="task-subtask__title" data-subtask-title-field="${escapeHtml(subtask.id)}" data-task-id="${escapeHtml(task.id)}" type="text" value="${escapeHtml(subtask.title)}" aria-label="小Task名" />
      <button type="button" class="task-subtask__delete" data-action="delete-subtask" data-task-id="${escapeHtml(task.id)}" data-subtask-id="${escapeHtml(subtask.id)}" aria-label="小Taskを削除">×</button>
    </div>
  `;
}

function renderTaskQuadrantOptions(selectedQuadrant) {
  const normalized = normalizeTaskQuadrant(selectedQuadrant);
  const options = [
    { key: TASK_QUADRANT_DEFAULT, label: "未整理" },
    ...TASK_QUADRANTS.map((quadrant) => ({ key: quadrant.key, label: quadrant.concept })),
  ];

  return options.map((option) => `
    <option value="${escapeHtml(option.key)}"${normalized === option.key ? " selected" : ""}>${escapeHtml(option.label)}</option>
  `).join("");
}

function renderGoalQuadrantOptions(selectedQuadrant) {
  const normalized = normalizeGoalQuadrant(selectedQuadrant);
  return TASK_QUADRANTS.map((quadrant) => `
    <option value="${escapeHtml(quadrant.key)}"${normalized === quadrant.key ? " selected" : ""}>${escapeHtml(quadrant.concept)}</option>
  `).join("");
}

function renderActiveTaskCard(task) {
  const progress = getTaskSubtaskProgress(task);
  const progressBadge = progress.total
    ? `<span class="task-card__breakdown">${escapeHtml(`${progress.done}/${progress.total}`)}</span>`
    : "";
  const isSelected = ui.selectedTaskId === task.id;
  const plannedToday = isWorkItemSelectedToday(taskToWorkItem(task), state.dailyPlan);
  return `
    <article class="task-card task-card--active${isSelected ? " is-selected" : ""}" data-action="select-task" data-task-id="${escapeHtml(task.id)}" data-task-draggable="true" data-task-drop-item="true">
      <div class="task-card__main">
        <div class="task-card__title-row">
          ${renderTaskDragGrip()}
          <strong class="task-card__title">${escapeHtml(task.title)}</strong>
          ${renderTaskResumeBadge(task)}
          ${progressBadge}
        </div>
        <div class="task-card__meta">
          <label class="task-card__minutes">
            <input class="task-card__minutes-input" data-task-minutes-field="${escapeHtml(task.id)}" type="number" min="1" max="240" inputmode="numeric" value="${escapeHtml(String(task.minutes))}" aria-label="予定分数" />
            <span>分</span>
          </label>
          <select class="task-card__quadrant-select" data-task-quadrant-select="${escapeHtml(task.id)}" aria-label="分類">
            ${renderTaskQuadrantOptions(task.quadrant)}
          </select>
        </div>
      </div>
      <div class="task-card__actions">
        ${getTaskPausedSeconds(task)
          ? `<button type="button" class="action-button action-button--primary" data-action="go-to-today">続きは今日から</button>`
          : `<button type="button" class="action-button action-button--primary" data-action="toggle-work-today" data-work-id="${escapeHtml(task.id)}">${plannedToday ? "今日から外す" : "今日に入れる"}</button>`}
        <button type="button" class="soft-button" data-action="complete-task" data-task-id="${escapeHtml(task.id)}">完了</button>
        <button type="button" class="soft-button" data-action="shelve-task" data-task-id="${escapeHtml(task.id)}">棚上げ</button>
      </div>
    </article>
  `;
}

function renderShelvedTaskCard(task) {
  const pausedSeconds = getTaskPausedSeconds(task);
  return `
    <article class="task-card task-card--shelved">
      <div class="task-card__main">
        <strong>${escapeHtml(task.title)}</strong>
        <span>${escapeHtml(pausedSeconds ? `残り ${formatTaskRemaining(pausedSeconds)}` : `残り ${getTaskRemainingMinutes(task)}分`)}</span>
      </div>
      <div class="task-card__actions">
        <button type="button" class="soft-button" data-action="restore-task" data-task-id="${escapeHtml(task.id)}">戻す</button>
        <button type="button" class="soft-button soft-button--danger" data-action="delete-task" data-task-id="${escapeHtml(task.id)}">削除</button>
      </div>
    </article>
  `;
}

function renderDoneTaskCard(task) {
  return `
    <article class="task-card task-card--done">
      <div class="task-card__main">
        <strong>${escapeHtml(task.title)}</strong>
        <span>${escapeHtml(`${task.minutes}分`)}</span>
      </div>
      <div class="task-card__actions">
        <button type="button" class="soft-button soft-button--danger" data-action="delete-task" data-task-id="${escapeHtml(task.id)}">削除</button>
      </div>
    </article>
  `;
}

function isExecutionOutcome(outcome) {
  return ["A", "B", "C"].includes(outcome);
}

function isSameMissionLog(currentState, todayLog) {
  return !todayLog?.missionTitle || todayLog.missionTitle === currentState.today.missionTitle;
}

function getTodayMissionState(currentState, todayLog) {
  if (!todayLog) {
    return {
      panelClass: "panel--focus",
      badgeClass: "status-badge--accent",
      badge: "未完了",
      title: "まだ今日の1本は終わっていません。",
      detail: "終わるまでは、この1本だけを優先すれば十分です。",
      showPendingCue: true,
      isClosed: false,
    };
  }

  if (!isSameMissionLog(currentState, todayLog)) {
    return {
      panelClass: "panel--focus",
      badgeClass: "status-badge--accent",
      badge: "目標更新後",
      title: "目標を更新したので、新しい1本はまだ未着手です。",
      detail: `前の記録: ${buildLogSummary(todayLog)}`,
      showPendingCue: true,
      isClosed: false,
    };
  }

  if (todayLog.outcome === "miss") {
    return {
      panelClass: "panel--miss",
      badgeClass: "status-badge--danger",
      badge: "未実施",
      title: "今日はまだ閉じられていません。",
      detail: buildLogSummary(todayLog),
      showPendingCue: true,
      isClosed: false,
    };
  }

  return {
    panelClass: "panel--done",
    badgeClass: "status-badge--done",
    badge: "完了済み",
    title: "今日の1本は記録済みです。",
    detail: buildLogSummary(todayLog),
    showPendingCue: false,
    isClosed: true,
  };
}

function getLogByDateFromEntries(entries, date) {
  const datedEntries = (Array.isArray(entries) ? entries : [])
    .filter((entry) => entry.date === date)
    .sort((left, right) => new Date(left.recordedAt) - new Date(right.recordedAt));
  return datedEntries.length ? datedEntries[datedEntries.length - 1] : null;
}

function getGoalLogByDate(goalRecord, date) {
  return getLogByDateFromEntries(goalRecord?.logs, date);
}

function getGoalMissionStateForDate(goalRecord, date = new Date()) {
  const dateKey = typeof date === "string" ? date : toISODate(date);
  return getTodayMissionState(goalRecord, getGoalLogByDate(goalRecord, dateKey));
}

function renderRoadmapMilestoneCard(milestone, index, options = {}) {
  const editable = Boolean(options.editable);
  const isGoal = Boolean(options.isGoal);
  const deadlineLabel = milestone.deadline ? `期限 ${milestone.deadline}` : "";
  const targetLabel = Number.isFinite(Number(milestone.target)) ? `全体目安 ${Math.round(Number(milestone.target))}%` : "";

  return `
    <article class="milestone ${milestone.isActive ? "is-active" : ""} ${milestone.isComplete ? "is-complete" : ""} ${isGoal ? "is-goal" : ""}" data-step="${index + 1}">
      <div class="panel milestone__panel">
        <div class="milestone__head">
          <span class="milestone__label">${escapeHtml(milestone.label)}</span>
          ${isGoal
            ? `<span class="milestone__goal-badge">GOAL</span>`
            : targetLabel ? `<span class="milestone__target">${escapeHtml(targetLabel)}</span>` : ""}
        </div>
        ${deadlineLabel ? `<div class="milestone__meta">${escapeHtml(deadlineLabel)}</div>` : ""}
        ${editable ? `
          <div class="milestone__actions milestone__actions--compact">
            <button type="button" class="ghost-button" data-action="open-roadmap-editor" data-roadmap-id="${escapeHtml(milestone.id)}">修正</button>
            <button type="button" class="ghost-button" data-action="delete-roadmap-item" data-roadmap-id="${escapeHtml(milestone.id)}">削除</button>
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

function renderRoadmapInsertSlot(afterId = "") {
  const isOpen = Boolean(ui.roadmapDraft && ui.roadmapDraft.mode === "new" && (ui.roadmapDraft.insertAfterId || "") === afterId);
  if (isOpen) {
    return renderRoadmapEditor("+");
  }

  const afterAttr = afterId ? ` data-after-id="${escapeHtml(afterId)}"` : "";
  return `
    <article class="milestone milestone--insert" data-step="+">
      <button type="button" class="milestone-add-button" data-action="open-roadmap-editor" aria-label="マイルストーンを追加"${afterAttr}></button>
    </article>
  `;
}

function renderRoadmapMilestoneList(roadmap, options = {}) {
  const editable = Boolean(options.editable);

  if (!roadmap.milestones.length) {
    return editable
      ? `
        <div class="milestone-list milestone-list--editable">
          ${renderRoadmapInsertSlot("")}
        </div>
      `
      : `<p class="preview-empty">まだマイルストーンはありません。</p>`;
  }

  if (editable) {
    return `
      <div class="milestone-list milestone-list--editable">
        ${roadmap.milestones.map((milestone, index) => {
          const isEditing = Boolean(ui.roadmapDraft && ui.roadmapDraft.mode === "edit" && ui.roadmapDraft.id === milestone.id);
          return `
            ${isEditing ? renderRoadmapEditor(index + 1) : renderRoadmapMilestoneCard(milestone, index, options)}
            ${renderRoadmapInsertSlot(milestone.id)}
          `;
        }).join("")}
      </div>
    `;
  }

  // 閲覧モード: スタート→ゴールの順で表示（データは逆順）
  const reversed = [...roadmap.milestones].reverse();
  const goalIndex = reversed.length - 1;

  return `
    <div class="milestone-list">
      <div class="milestone-start-label">START</div>
      ${reversed.map((milestone, index) => {
        return renderRoadmapMilestoneCard(milestone, index, {
          ...options,
          isGoal: index === goalIndex,
        });
      }).join("")}
    </div>
  `;
}

function getRoadmapMilestoneForDisplay(roadmap) {
  const milestones = Array.isArray(roadmap?.milestones) ? roadmap.milestones : [];
  return roadmap.currentMilestone || milestones[milestones.length - 1] || null;
}

function renderRoadmapCurrentStatus(roadmap) {
  const milestone = getRoadmapMilestoneForDisplay(roadmap);
  if (!milestone) {
    return `<p class="preview-empty">まだマイルストーンはありません。</p>`;
  }

  const overallProgress = clamp(Math.round(Number(roadmap.learningProgress) || 0), 0, 100);
  const target = Math.max(1, Number(milestone.target) || 1);
  const achievementRate = milestone.isComplete
    ? 100
    : clamp(Math.round((overallProgress / target) * 100), 0, 100);
  const statusLabel = milestone.isComplete ? "到達済み" : "進行中";
  const deadlineLabel = milestone.deadline ? `期限 ${milestone.deadline}` : "期限なし";

  return `
    <article class="roadmap-focus-card">
      <div class="roadmap-focus-card__head">
        <div class="stack stack--tight">
          <span class="status-badge ${milestone.isComplete ? "status-badge--done" : "status-badge--accent"}">${escapeHtml(statusLabel)}</span>
          <h2 class="section-title">${escapeHtml(milestone.label)}</h2>
          <p class="section-copy">${escapeHtml(deadlineLabel)}</p>
        </div>
        <div class="roadmap-focus-card__value-block">
          <strong class="roadmap-focus-card__value">${overallProgress}%</strong>
          <span class="roadmap-focus-card__value-label">到達度</span>
        </div>
      </div>

      <div class="bullet-list">
        <div class="bullet-row">
          <div class="bullet">
            <span class="bullet__fill bullet__fill--sage" style="--fill:${overallProgress}%"></span>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderRoadmapEditor(stepLabel = "+") {
  if (!ui.roadmapDraft) {
    return "";
  }

  const draft = ui.roadmapDraft;
  const isEdit = draft.mode === "edit";
  const isGoalItem = isEdit && draft.id === "goal";

  return `
    <article class="milestone milestone--editor" data-step="${escapeHtml(String(stepLabel))}">
      <section class="panel panel--warm stack milestone-editor">
        <div>
          <h2 class="panel__title">${isEdit ? "マイルストーンを修正" : "マイルストーンを追加"}</h2>
        </div>
        <label class="field">
          <span class="field__label">タイトル</span>
          <input class="field__control" data-roadmap-field="label" type="text" value="${escapeHtml(draft.label || "")}" placeholder="模試で70% / 3分野を一周 など" />
        </label>
        <div class="field-grid field-grid--two">
          <label class="field">
            <span class="field__label">期限</span>
            <input class="field__control" data-roadmap-field="deadline" type="date" value="${escapeHtml(draft.deadline || "")}" ${isGoalItem ? "disabled" : ""} />
          </label>
          <label class="field">
            <span class="field__label">到達目安 (%)</span>
            <input class="field__control" data-roadmap-field="target" type="number" min="0" max="100" value="${escapeHtml(String(draft.target ?? 0))}" />
          </label>
        </div>
        ${isGoalItem ? '<p class="section-copy">最終期限は目標編集で変更します。</p>' : ''}
        <div class="action-row milestone-editor__actions">
          <button type="button" class="action-button action-button--primary" data-action="save-roadmap-item">${isEdit ? "修正を保存" : "追加する"}</button>
          <button type="button" class="soft-button" data-action="cancel-roadmap-editor">閉じる</button>
        </div>
      </section>
    </article>
  `;
}
function renderReviewView() {
  const allLogs = getAllExecutionLogs();
  const filteredLogs = ui.reviewGoalFilter === "all"
    ? allLogs
    : ui.reviewGoalFilter === "tasks"
      ? allLogs.filter((entry) => entry.itemKind === "task")
      : allLogs.filter((entry) => entry.goalId === ui.reviewGoalFilter);
  const rangeDays = ui.reviewRangeDays === 30 ? 30 : 7;
  const periodStart = toISODate(addDays(new Date(), -(rangeDays - 1)));
  const periodLogs = filteredLogs.filter((entry) => entry.date >= periodStart);

  return `
    <section class="screen screen--review screen--review-allocation">
      <div class="review-toolbar">
        <div class="review-range-switch" role="group" aria-label="表示期間">
          <button type="button" class="${rangeDays === 7 ? "is-active" : ""}" data-action="set-review-range" data-days="7">7日</button>
          <button type="button" class="${rangeDays === 30 ? "is-active" : ""}" data-action="set-review-range" data-days="30">30日</button>
        </div>
        <label>
          <span>表示</span>
          <select data-review-goal-filter aria-label="Reviewの対象">
            <option value="all"${ui.reviewGoalFilter === "all" ? " selected" : ""}>すべて</option>
            ${listGoals().map((goal) => `<option value="${escapeHtml(goal.id)}"${ui.reviewGoalFilter === goal.id ? " selected" : ""}>${escapeHtml(goal.setup.goal)}</option>`).join("")}
            <option value="tasks"${ui.reviewGoalFilter === "tasks" ? " selected" : ""}>単発Task</option>
          </select>
        </label>
      </div>

      ${renderDailyHistoryChart(periodLogs, rangeDays)}
      ${renderAllocationReview(periodLogs)}
      ${renderRecentActivity(filteredLogs)}

      ${ui.reviewGoalFilter !== "tasks" ? `
        <details class="review-maintenance">
          <summary>記録を修正</summary>
          ${renderReviewLogEditPanel()}
        </details>
      ` : ""}
    </section>
  `;
}

function getNiceMinuteScale(maxMinutes) {
  const value = Math.max(0, Number(maxMinutes) || 0);
  if (value <= 10) return 10;
  if (value <= 30) return Math.ceil(value / 5) * 5;
  if (value <= 60) return Math.ceil(value / 10) * 10;
  if (value <= 120) return Math.ceil(value / 30) * 30;
  return Math.ceil(value / 60) * 60;
}

function renderDailyHistoryChart(logs, rangeDays) {
  const today = new Date();
  const days = Array.from({ length: rangeDays }, (_, index) => {
    const date = toISODate(addDays(today, index - (rangeDays - 1)));
    const seconds = logs
      .filter((entry) => entry.date === date)
      .reduce((sum, entry) => sum + getLoggedSeconds(entry), 0);
    return { date, seconds, minutes: seconds / 60 };
  });
  const totalSeconds = days.reduce((sum, day) => sum + day.seconds, 0);
  const executedDays = days.filter((day) => day.seconds > 0).length;
  const scaleMinutes = getNiceMinuteScale(Math.max(0, ...days.map((day) => day.minutes)));
  const halfScale = Math.round(scaleMinutes / 2);

  return `
    <section class="review-history">
      <div class="review-history__headline">
        <div>
          <span>${escapeHtml(`直近${rangeDays}日 合計`)}</span>
          <strong>${escapeHtml(formatReviewDuration(totalSeconds))}</strong>
        </div>
        <p>${escapeHtml(`${executedDays}日実行`)}</p>
      </div>
      <div class="review-history__chart" style="--review-days:${rangeDays}">
        <div class="review-history__axis" aria-hidden="true">
          <span>${escapeHtml(`${scaleMinutes}分`)}</span>
          <span>${escapeHtml(`${halfScale}分`)}</span>
          <span>0</span>
        </div>
        <div class="review-history__plot" aria-label="日ごとの実行時間">
          <i class="review-history__grid review-history__grid--top" aria-hidden="true"></i>
          <i class="review-history__grid review-history__grid--middle" aria-hidden="true"></i>
          <div class="review-history__bars">
            ${days.map((day, index) => {
              const height = day.minutes > 0
                ? Math.max(4, Math.min(100, (day.minutes / scaleMinutes) * 100))
                : 0;
              const showLabel = rangeDays === 7 || index === 0 || index === rangeDays - 1 || index % 5 === 0;
              const label = day.date.slice(5).replace("-", "/");
              return `
                <div class="review-history__day" title="${escapeHtml(`${label} ${formatReviewDuration(day.seconds)}`)}">
                  <div class="review-history__bar-wrap">
                    <span class="review-history__bar${day.seconds > 0 ? " is-filled" : ""}" style="height:${height.toFixed(2)}%"></span>
                  </div>
                  <small>${showLabel ? escapeHtml(label) : ""}</small>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function getAllExecutionLogs() {
  syncActiveGoalRecord();
  const goalLogs = (state.goals || []).flatMap((goal) => (
    normalizeLogs(goal.logs || [])
      .filter((entry) => isExecutionOutcome(entry.outcome))
      .map((entry) => ({
        ...entry,
        itemKind: "goal",
        itemId: entry.itemId || goal.id,
        itemTitle: entry.itemTitle || entry.missionTitle || goal.setup?.goal || "目標",
        goalId: entry.goalId || goal.id,
        quadrant: normalizeGoalQuadrant(entry.quadrant || goal.setup?.quadrant),
      }))
  ));
  const taskLogs = normalizeLogs(state.taskLogs || []).map((entry) => ({
    ...entry,
    itemKind: "task",
    itemTitle: entry.itemTitle || "Task",
    quadrant: normalizeTaskQuadrant(entry.quadrant),
  }));

  return [...goalLogs, ...taskLogs]
    .sort((left, right) => new Date(right.recordedAt) - new Date(left.recordedAt));
}

function renderAllocationReview(logs) {
  const totalSeconds = logs.reduce((sum, entry) => sum + getLoggedSeconds(entry), 0);
  const plannedSeconds = logs.reduce((sum, entry) => sum + Math.max(0, Number(entry.plannedSeconds) || 0), 0);
  const executedDays = new Set(logs.map((entry) => entry.date)).size;
  const segments = TASK_QUADRANTS.map((quadrant) => {
    const seconds = logs
      .filter((entry) => entry.quadrant === quadrant.key)
      .reduce((sum, entry) => sum + getLoggedSeconds(entry), 0);
    return {
      ...quadrant,
      seconds,
      share: totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0,
    };
  });
  const futureShare = segments.find((item) => item.key === "notUrgentImportant")?.share || 0;

  return `
    <section class="review-allocation">
      <div class="review-allocation__headline">
        <div>
          <span>時間の使い方</span>
          <strong>${escapeHtml(`${executedDays}日`)}</strong>
        </div>
        <div class="review-allocation__future">
          <span>育てる</span>
          <strong>${futureShare}%</strong>
        </div>
      </div>
      <div class="review-allocation__bar" aria-label="4象限別の実行時間">
        ${segments.map((segment) => segment.seconds > 0
          ? `<span style="width:${Math.max(2, segment.share)}%;background:${getQuadrantColor(segment.key)}" title="${escapeHtml(`${segment.concept} ${segment.share}%`)}"></span>`
          : "").join("")}
      </div>
      <div class="review-allocation__legend">
        ${segments.map((segment) => `
          <div>
            <i style="background:${getQuadrantColor(segment.key)}"></i>
            <span>${escapeHtml(segment.concept)}</span>
            <strong>${escapeHtml(formatReviewDuration(segment.seconds))}</strong>
            <small>${segment.share}%</small>
          </div>
        `).join("")}
      </div>
      <div class="review-allocation__foot">
        <span>${executedDays}日実行</span>
        <span>予定 ${escapeHtml(formatReviewDuration(plannedSeconds))}</span>
      </div>
    </section>
  `;
}

function formatReviewDuration(seconds) {
  return Number(seconds) > 0 ? formatLoggedDuration(seconds) : "0分";
}

function renderRecentActivity(logs) {
  const recent = logs.filter((entry) => getLoggedSeconds(entry) > 0).slice(0, 6);
  if (!recent.length) return "";
  return `
    <section class="review-recent">
      <div class="review-recent__head">
        <h2>最近の実行</h2>
      </div>
      <div class="review-recent__list">
        ${recent.map((entry) => {
          const quadrant = getTaskQuadrantMeta(entry.quadrant);
          return `
            <article>
              <i style="background:${getQuadrantColor(entry.quadrant)}"></i>
              <div>
                <strong>${escapeHtml(entry.itemTitle || entry.missionTitle || "実行")}</strong>
                <span>${escapeHtml(`${formatReviewLogDate(entry.date)} · ${quadrant?.concept || "未整理"}`)}</span>
              </div>
              <b>${escapeHtml(formatLoggedDuration(getLoggedSeconds(entry)))}</b>
              <button type="button" data-action="repeat-review-entry" data-log-id="${escapeHtml(entry.logId)}">もう一度</button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function getActiveGoalRecord() {
  const goals = listGoals();
  return goals.find((goal) => goal.id === state.meta.activeGoalId) || goals[0] || null;
}

function renderReviewOverview(entries, metrics, totalStudySeconds) {
  const summaries = entries.map((entry) => {
    const seconds = getLogsByDate(entry.date).reduce((sum, log) => (
      isExecutionOutcome(log.outcome) ? sum + getLoggedSeconds(log) : sum
    ), 0);
    return { ...entry, seconds };
  });
  const executedDays = summaries.filter((entry) => entry.hasExecution).length;
  const weekSeconds = summaries.reduce((sum, entry) => sum + entry.seconds, 0);
  const maxSeconds = Math.max(1, ...summaries.map((entry) => entry.seconds));

  return `
    <section class="panel review-overview">
      <div class="review-overview__summary">
        <span>7日間</span>
        <strong>${escapeHtml(`${executedDays}/${summaries.length}`)}</strong>
        <small>${escapeHtml(`${metrics.executionRate}% / ${formatLoggedDuration(weekSeconds)}`)}</small>
      </div>
      <div class="review-bars" aria-label="直近7日間の実行グラフ">
        ${summaries.map((entry) => {
          const statusClass = entry.hasExecution
            ? "is-done"
            : (entry.outcome === "miss" ? "is-miss" : "is-empty");
          const barHeight = entry.hasExecution
            ? Math.max(14, Math.round((entry.seconds / maxSeconds) * 100))
            : (entry.outcome === "miss" ? 10 : 4);
          return `
            <div class="review-day ${statusClass}">
              <div class="review-day__bar"><span style="height:${barHeight}%"></span></div>
              <small>${escapeHtml(shortWeekday(entry.date))}</small>
            </div>
          `;
        }).join("")}
      </div>
      <div class="review-overview__foot">
        <span>累計 ${escapeHtml(formatLoggedDuration(totalStudySeconds))}</span>
      </div>
    </section>
  `;
}

function isGoalAchieved(goalRecord) {
  const roadmap = computeRoadmap(goalRecord);
  return roadmap.learningProgress >= ROADMAP_TARGETS.goal || roadmap.milestones.every((item) => item.isComplete);
}

function renderReviewLogGrid(entries) {
  return entries
    .map((entry) => {
      const outcomes = entry.outcomes && entry.outcomes.length ? entry.outcomes : [entry.outcome];
      const isMulti = outcomes.length > 1;
      const valueContent = isMulti
        ? renderStackedLogParts(outcomes.map((outcome) => logSymbol(outcome)))
        : escapeHtml(entry.logValue || logSymbol(entry.outcome));
      const noteContent = isMulti
        ? renderStackedLogParts(outcomes.map((outcome) => logSmallLabel(outcome)))
        : escapeHtml(entry.logNote || logSmallLabel(entry.outcome));

      return `
        <div class="log-pill ${isMulti ? "log-pill--multi" : ""}" data-outcome="${entry.outcome}">
          <span class="log-pill__day">${escapeHtml(shortWeekday(entry.date))}</span>
          <span class="log-pill__value ${isMulti ? "log-pill__value--multi" : ""}">${valueContent}</span>
          <span class="log-pill__note ${isMulti ? "log-pill__note--multi" : ""}">${noteContent}</span>
        </div>
      `;
    })
    .join("");
}

function renderReviewLogEditPanel() {
  const allLogs = getRecentExecutionLogs();
  if (!allLogs.length) {
    return "";
  }
  const collapsedCount = 5;
  const shouldCollapse = allLogs.length > collapsedCount;
  const visibleLogs = ui.reviewLogExpanded ? allLogs : allLogs.slice(0, collapsedCount);
  const toggleLabel = ui.reviewLogExpanded ? "前の記録を閉じる" : "さらに前の記録を見る";

  const activeEntry = ui.reviewLogDraft ? getLogEntryById(ui.reviewLogDraft.logId) : null;
  if (ui.reviewLogDraft && !activeEntry) {
    ui.reviewLogDraft = null;
  }

  return `
    <section class="panel stack">
      <div>
        <h2 class="section-title">記録を修正</h2>
      </div>
      ${activeEntry ? renderReviewLogEditor(activeEntry) : ""}
      <div class="review-log-list">
        ${visibleLogs.map((entry) => renderReviewLogCard(entry)).join("")}
      </div>
      ${shouldCollapse
        ? `<button type="button" class="soft-button review-log-toggle" data-action="toggle-review-log-list">${escapeHtml(toggleLabel)}</button>`
        : ""}
    </section>
  `;
}

function renderReviewLogEditor(entry) {
  const draft = ui.reviewLogDraft;
  if (!draft || draft.logId !== entry.logId) {
    return "";
  }

  return `
    <div class="review-log-editor">
      <div class="status-strip">
        <span class="status-badge status-badge--accent">修正中</span>
        <span class="status-badge">${escapeHtml(outcomeLabel(entry.outcome))}</span>
      </div>
      <div class="field-grid field-grid--two">
        <label class="field">
          <span class="field__label">実施日</span>
          <input class="field__control" data-review-log-field="date" type="date" value="${escapeHtml(draft.date)}" />
        </label>
        <div class="field">
          <span class="field__label">実施時間</span>
          <div class="review-log-duration">
            <input class="field__control" data-review-log-field="elapsedHours" type="number" min="0" inputmode="numeric" value="${escapeHtml(draft.elapsedHours)}" />
            <span>時間</span>
            <input class="field__control" data-review-log-field="elapsedMinutes" type="number" min="0" inputmode="numeric" value="${escapeHtml(draft.elapsedMinutes)}" />
            <span>分</span>
          </div>
        </div>
      </div>
      <div class="review-log-editor__actions">
        <button type="button" class="action-button action-button--primary" data-action="save-review-log">保存する</button>
        <button type="button" class="soft-button" data-action="cancel-review-log-edit">閉じる</button>
      </div>
    </div>
  `;
}

function renderReviewLogCard(entry) {
  const isEditing = ui.reviewLogDraft && ui.reviewLogDraft.logId === entry.logId;
  const loggedSeconds = getLoggedSeconds(entry);
  const meta = isExecutionOutcome(entry.outcome)
    ? `実行 ${formatLoggedDuration(loggedSeconds)}`
    : outcomeLabel(entry.outcome);
  const detailParts = [
    entry.milestoneLabel ? `節目 ${entry.milestoneLabel}` : "",
    entry.progressText ? `到達 ${entry.progressText}` : "",
    entry.reflection ? `メモ ${entry.reflection}` : "",
  ].filter(Boolean);

  return `
    <article class="review-log-card ${isEditing ? "is-active" : ""}">
      <div class="review-log-card__head">
        <div>
          <strong class="review-log-card__title">${escapeHtml(formatReviewLogDate(entry.date))}</strong>
          <p class="review-log-card__meta">${escapeHtml(meta)}</p>
        </div>
        <button type="button" class="ghost-button" data-action="open-review-log-editor" data-log-id="${escapeHtml(entry.logId)}">修正</button>
      </div>
      ${detailParts.length ? `<p class="review-log-card__detail">${escapeHtml(detailParts.join(" / "))}</p>` : ""}
    </article>
  `;
}

function renderAlbumSection() {
  const goals = listArchivedGoals();
  if (!goals.length) return "";
  const cards = goals.map(goal => {
    const isConfirm = ui.deleteConfirmGoalId === goal.id;
    const isHabit = goal.setup && goal.setup.goalType === "habit";
    const executionLogs = (goal.logs || []).filter((entry) => isExecutionOutcome(entry.outcome));
    const executedDays = new Set(executionLogs.map((entry) => entry.date)).size;
    const subtitle = isHabit
      ? `習慣 / 実行 ${executedDays}日`
      : `${formatDeadlineBadge(goal.setup.deadline)} / 実行 ${executedDays}日`;
    const archivedDate = goal.archivedAt ? goal.archivedAt.replace(/-/g, ".") : "";
    return `
      <div class="album-card">
        <div class="album-card__body">
          <p class="album-card__name">${escapeHtml(goal.setup.goal)}</p>
          <p class="album-card__sub">${escapeHtml(subtitle)}</p>
          ${archivedDate ? `<p class="album-card__date">${archivedDate} 保存</p>` : ""}
          ${isConfirm
            ? `<p class="album-card__warn">⚠️ 完全消去しますか？元に戻せません。</p>
               <div class="album-card__actions">
                 <button class="soft-button" data-action="purge-archived-goal" data-goal-id="${goal.id}">消去する</button>
                 <button class="soft-button" data-action="cancel-delete-goal">やめる</button>
               </div>`
            : `<div class="album-card__actions">
                 <button class="soft-button album-card__delete" data-action="confirm-delete-goal" data-goal-id="${goal.id}">完全消去</button>
               </div>`}
        </div>
      </div>
    `;
  }).join("");
  return `
    <section class="panel stack garden-album">
      <div>
        <h2 class="section-title">非表示の目標</h2>
        <p class="section-copy">Today から外した目標です。記録はここで見返せます。</p>
      </div>
      <div class="album-list">${cards}</div>
    </section>
  `;
}

function renderReplanView() {
  const preview = state.replan.preview || [];
  const isRetargetMode = state.replan.mode === "retarget_goal";

  if (isRetargetMode) {
    ensureRetargetDraft();
  }

  return `
    <section class="screen">
      <div class="hero">
        <div class="hero__accent"></div>
        ${renderActiveGoalContext()}
        <h1 class="hero__title">自由雑談ではなく、立て直しに集中する</h1>
      </div>

      <section class="stack">
        <div>
          <h2 class="section-title">よくある修正</h2>
        </div>
        <div class="mode-grid">
          ${Object.entries(REPLAN_MODES)
            .map(
              ([key, label]) => `
                <button type="button" class="mode-button ${state.replan.mode === key ? "is-active" : ""}" data-action="select-replan-mode" data-mode="${key}">
                  ${escapeHtml(label)}
                </button>
              `,
            )
            .join("")}
        </div>
      </section>

      ${isRetargetMode ? `
        <section class="panel stack">
          <div>
          <h2 class="panel__title">目標と次の一歩を更新</h2>
          </div>
          <label class="field">
            <span class="field__label">目標</span>
            <input class="field__control" data-replan-field="goalDraft" type="text" value="${escapeHtml(state.replan.goalDraft || "")}" />
          </label>
          <label class="field">
            <span class="field__label">今日のミッション</span>
            <input class="field__control" data-replan-field="missionDraft" type="text" value="${escapeHtml(state.replan.missionDraft || "")}" />
          </label>
          <div class="field-grid field-grid--two">
            <label class="field">
              <span class="field__label">今週の到達点</span>
              <input class="field__control" data-replan-field="weekDraft" type="text" value="${escapeHtml(state.replan.weekDraft || "")}" />
            </label>
            <label class="field">
              <span class="field__label">次の一歩</span>
              <input class="field__control" data-replan-field="nextDraft" type="text" value="${escapeHtml(state.replan.nextDraft || "")}" />
            </label>
          </div>
        </section>
      ` : ""}

      <section class="panel stack">
        <div>
          <h2 class="panel__title">相談内容</h2>
        </div>
        <label class="field">
          <textarea data-replan-field="text" placeholder="${isRetargetMode ? "例: ChatGPTと問題を出し合う勉強に寄せたい" : "困っていることを短く書く"}">${escapeHtml(state.replan.text || "")}</textarea>
        </label>
        <button type="button" class="action-button" data-action="generate-replan">差分を作る</button>
      </section>

      <section class="panel stack">
        <div>
          <h2 class="panel__title">差分プレビュー</h2>
        </div>
        ${
          preview.length
            ? `<ul class="preview-list">${preview.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p class="preview-empty">モードを選んで「差分を作る」を押すと、ここに変更案が出ます。</p>`
        }
      </section>

      <div class="action-row">
        <button type="button" class="soft-button" data-action="navigate" data-view="today">戻る</button>
        <button type="button" class="action-button action-button--primary" data-action="apply-replan">この変更を適用</button>
      </div>
    </section>
  `;
}

function renderPlanCard(planKey, plan, recommendedPlan, recommendedLabel = "推奨") {
  return `
    <article class="plan-card ${recommendedPlan === planKey ? "is-recommended" : ""}">
      <div class="plan-card__head">
        <div>
          <div class="plan-card__label">${PLAN_META[planKey].label} (${PLAN_META[planKey].tag})</div>
          <div class="plan-card__meta">${plan.minutes}分</div>
        </div>
        ${recommendedPlan === planKey ? `<span class="status-badge status-badge--accent">${escapeHtml(recommendedLabel)}</span>` : ""}
      </div>
    </article>
  `;
}

function renderEditablePlanCard(planKey, fieldName, value, hint) {
  const min = planKey === "A" ? 5 : 1;
  const max = planKey === "C" ? 30 : 180;
  return `
    <article class="plan-card plan-card--editable">
      <div class="plan-card__head">
        <div class="plan-card__label">${escapeHtml(hint)}</div>
      </div>
      <label class="plan-card__editor">
        <input class="field__control" data-setup-field="${fieldName}" type="number" min="${min}" max="${max}" value="${escapeHtml(String(value))}" />
        <span class="plan-card__unit">分</span>
      </label>
    </article>
  `;
}

function renderMetricCard(label, value, unit = "%") {
  return `
    <article class="metric-card">
      <div class="metric-card__head">
        <span class="metric-card__label">${escapeHtml(label)}</span>
      </div>
      <p class="metric-card__value">${escapeHtml(String(value))}${unit ? `<span class="metric-card__unit">${escapeHtml(unit)}</span>` : ""}</p>
    </article>
  `;
}

function renderBambooSvg(b, stage, stageRatio, health) {
  const hp = Math.max(0.35, health / 100);
  const fop = (0.65 + hp * 0.35).toFixed(2);

  const pot = `
    <rect x="30" y="113" width="60" height="17" rx="4" fill="${b.pot}"/>
    <rect x="27" y="109" width="66" height="7" rx="3.5" fill="${b.potRim}"/>
    <ellipse cx="60" cy="112" rx="27" ry="4.5" fill="${b.soil}" opacity="0.9"/>
  `;

  if (stage === 0) return pot + `<ellipse cx="60" cy="109" rx="3" ry="3" fill="${b.trunk}" opacity="0.7"/>`;

  const culmCount = Math.min(1 + Math.floor(stage / 2), 5);
  const culmPositions = [60, 48, 72, 42, 78].slice(0, culmCount);
  const maxHeight = 20 + stageRatio * 75;

  let culms = "";
  culmPositions.forEach((cx, i) => {
    const h = maxHeight * (0.7 + (i % 3) * 0.15);
    const top = 112 - h;
    const w = 5 - i * 0.5;

    culms += `<rect x="${cx - w/2}" y="${top}" width="${w}" height="${h}" rx="${w/2}" fill="${b.trunk}" opacity="${0.9 - i*0.06}"/>`;

    const nodeCount = Math.floor(h / 12);
    for (let n = 1; n < nodeCount; n++) {
      const ny = top + (h / nodeCount) * n;
      culms += `<rect x="${cx - w/2 - 1}" y="${ny - 1.5}" width="${w + 2}" height="3" rx="1.5" fill="${b.branch}" opacity="0.88"/>`;
    }

    const leafSpread = 10 + stageRatio * 8;
    if (stage >= 2 || i === 0) {
      culms += `
        <path d="M${cx} ${top} C${cx - leafSpread*0.8} ${top - 8} ${cx - leafSpread} ${top - 14} ${cx - leafSpread*1.1} ${top - 20}" stroke="${b.foliage}" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="${fop}"/>
        <path d="M${cx} ${top} C${cx + leafSpread*0.7} ${top - 7} ${cx + leafSpread} ${top - 12} ${cx + leafSpread*1.0} ${top - 18}" stroke="${b.foliage}" stroke-width="2" stroke-linecap="round" fill="none" opacity="${fop}"/>
        <path d="M${cx} ${top} C${cx - leafSpread*0.3} ${top - 10} ${cx} ${top - 18} ${cx + leafSpread*0.2} ${top - 24}" stroke="${b.foliageDark}" stroke-width="2" stroke-linecap="round" fill="none" opacity="${(Number(fop)*0.88).toFixed(2)}"/>
      `;
    }
  });

  return pot + culms;
}

// ============================================================
// 目標植物 SVGレンダラー（梅・桜・さつき）
// ============================================================

// ============================================================
// 習慣植物 SVGレンダラー（もみじ・苔）
// ============================================================

// ============================================================
// 旧フラワー SVGレンダラー（互換性のため保持）
// ============================================================

function renderStackedLogParts(parts) {
  return parts
    .filter(Boolean)
    .map((part, index, list) => `${index ? '<span class="log-pill__stack-sep">+</span>' : ""}<span class="log-pill__stack-part">${escapeHtml(part)}</span>`)
    .join("");
}

function renderChoiceChip(value, label, selected) {
  return `
    <button type="button" class="chip ${selected === value ? "is-active" : ""}" data-action="select-study-mode" data-value="${value}">
      ${label}
    </button>
  `;
}

function renderWeekdayChip(weekdayKey, studyDays) {
  const selectedDays = normalizeStudyDays(studyDays);
  const isActive = selectedDays.includes(weekdayKey);

  return `
    <button type="button" class="chip chip--weekday ${isActive ? "is-active" : ""}" data-action="toggle-study-day" data-weekday="${weekdayKey}">
      ${escapeHtml(weekdayShortLabel(weekdayKey))}
    </button>
  `;
}

function renderWindowField(label, startKey, endKey, startValue, endValue) {
  return `
    <div class="field">
      <span class="field__label">${label}</span>
      <div class="time-pair">
        <input class="field__control time-pair__input" data-setup-field="${startKey}" type="text" inputmode="numeric" autocomplete="off" placeholder="05:30" value="${escapeHtml(startValue)}" />
        <span>〜</span>
        <input class="field__control time-pair__input" data-setup-field="${endKey}" type="text" inputmode="numeric" autocomplete="off" placeholder="06:00" value="${escapeHtml(endValue)}" />
      </div>
    </div>
  `;
}

function renderFocusLockHelpPanel() {
  const help = ui.focusLockHelp || buildFocusLockHelp();
  const deviceLabel = help.deviceIdentifier
    ? `${help.deviceModel} (${help.deviceIdentifier})`
    : help.deviceModel;

  if (help.mode === "appShield") {
    return `
    <div class="sheet__backdrop" data-action="dismiss-focus-lock-help"></div>
    <section class="sheet__panel" role="dialog" aria-modal="true" aria-label="アプリ制限の許可">
      <div class="sheet__grab"></div>
      <div class="stack focus-lock-help">
        <div class="focus-lock-help__head">
          <span class="status-badge status-badge--accent">初回だけ</span>
          <h2 class="section-title">アプリ制限の許可が必要です</h2>
          <p class="section-copy">集中中に他のアプリを制限するには、iPhoneのスクリーンタイムへのアクセス許可が必要です。許可できるまでタイマーは始まりません。</p>
        </div>

        <ol class="focus-lock-steps">
          <li>
            <strong>もう一度開始する</strong>
            <span>下のボタンを押すと、iPhoneが許可画面を表示します。</span>
          </li>
          <li>
            <strong>「続ける」を選ぶ</strong>
            <span>スクリーンタイムのアクセス確認で「続ける」を選びます。</span>
          </li>
          <li>
            <strong>画面が出ないとき</strong>
            <span>iPhoneの「設定」→「スクリーンタイム」で、砂時計のアクセスを許可してください。</span>
          </li>
        </ol>

        <p class="focus-lock-note">アプリ制限を使わずに集中したいときは、設定の「集中中のアプリ」で「集中中にアプリを制限する」をオフにできます。</p>

        <div class="sheet__actions">
          <button type="button" class="action-button action-button--primary" data-action="retry-focus-lock">許可してもう一度開始</button>
          <button type="button" class="soft-button" data-action="dismiss-focus-lock-help">あとで</button>
        </div>
      </div>
    </section>
  `;
  }

  return `
    <div class="sheet__backdrop" data-action="dismiss-focus-lock-help"></div>
    <section class="sheet__panel" role="dialog" aria-modal="true" aria-label="iPhone固定の設定">
      <div class="sheet__grab"></div>
      <div class="stack focus-lock-help">
        <div class="focus-lock-help__head">
          <span class="status-badge status-badge--accent">初回だけ</span>
          <h2 class="section-title">iPhone固定をオンにする</h2>
          <p class="section-copy">${escapeHtml(deviceLabel)} では、${escapeHtml(help.shortcutInstruction)}でアクセスガイドを開始します。</p>
        </div>

        <div class="focus-lock-device">
          <span>この端末の操作</span>
          <strong>${escapeHtml(help.shortcutInstruction)}</strong>
        </div>

        <ol class="focus-lock-steps">
          <li>
            <strong>設定を開く</strong>
            <span>iPhoneの「設定」→「アクセシビリティ」→「アクセスガイド」を開きます。</span>
          </li>
          <li>
            <strong>アクセスガイドをオン</strong>
            <span>初回だけ、パスコード設定やFace ID設定も済ませておくと楽です。</span>
          </li>
          <li>
            <strong>砂時計に戻る</strong>
            <span>この画面で ${escapeHtml(help.shortcutInstruction)}。案内が出たら「開始」を押します。</span>
          </li>
          <li>
            <strong>もう一度開始する</strong>
            <span>下のボタンで再試行します。固定できた場合だけタイマーが始まります。</span>
          </li>
        </ol>

        <p class="focus-lock-note">集中タイマー中に外へ出たいときも、${escapeHtml(help.shortcutInstruction)}してアクセスガイドを解除します。</p>

        <div class="sheet__actions">
          <button type="button" class="action-button action-button--primary" data-action="retry-focus-lock">設定後にもう一度開始</button>
          <button type="button" class="soft-button" data-action="dismiss-focus-lock-help">あとで</button>
        </div>
      </div>
    </section>
  `;
}

function getSessionDurationMs(session = state.activeSession) {
  if (!session) {
    return 60 * 1000;
  }

  const durationSeconds = Number(session.durationSeconds);
  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return durationSeconds * 1000;
  }

  const minutes = isTaskSession(session)
    ? normalizeTaskMinutes(session.minutes)
    : Number(state.plans?.[session.planKey]?.minutes || 0);
  if (minutes > 0) {
    return minutes * 60 * 1000;
  }

  const span = Number(session.endsAt) - Number(session.startedAt);
  return Number.isFinite(span) && span > 0 ? span : 60 * 1000;
}

function getSessionRemainingSeconds(session = state.activeSession) {
  if (!session?.endsAt) {
    return 0;
  }
  return Math.max(0, Math.ceil((Number(session.endsAt) - Date.now()) / 1000));
}

function getSessionProgressRatio(session = state.activeSession, remainingMs = null) {
  if (!session) {
    return 0;
  }

  const duration = getSessionDurationMs(session);
  const remaining = remainingMs === null ? getRemainingMs(session.endsAt) : Number(remainingMs);
  return clamp((duration - Math.max(0, remaining)) / duration, 0, 1);
}

// =========================================================
// タイマー映像 — 元の「灯」砂時計
// =========================================================

// 砂時計のジオメトリ。1秒ごとに再計算し、CSS transitionでなめらかに繋ぐ。
// 上の砂は中央がすり鉢状にくぼみながら減り、下は安息角のついた山として積もる。
function buildSandClockGeometry(progressRatio = 0) {
  const progress = clamp(Number(progressRatio) || 0, 0, 1);
  const remaining = 1 - progress;
  const n = (value) => Number(value).toFixed(1);

  // 上室: 表面全体が中心へゆるやかに傾く漏斗状
  const surfaceY = 150 - 92 * Math.sqrt(Math.max(0, remaining));
  const dipY = Math.min(surfaceY + 2 + 9 * progress, 149);
  const topD = [
    `M 60 ${n(surfaceY)}`,
    `Q 102 ${n(dipY)} 110 ${n(dipY)}`,
    `Q 118 ${n(dipY)} 160 ${n(surfaceY)}`,
    "L 160 152 L 60 152 Z",
  ].join(" ");

  // 下室: 安息角のついた砂の山
  const pileHeight = 90 * Math.sqrt(Math.max(0, progress));
  const apexY = 245 - pileHeight;
  const baseHalf = Math.min(50, 10 + pileHeight * 0.85);
  const slopeY = apexY + pileHeight * 0.24;
  const pileD = [
    `M ${n(110 - baseHalf)} 247`,
    `Q ${n(110 - baseHalf * 0.5)} ${n(slopeY)} 110 ${n(apexY)}`,
    `Q ${n(110 + baseHalf * 0.5)} ${n(slopeY)} ${n(110 + baseHalf)} 247`,
    "Z",
  ].join(" ");

  const streamD = `M 110 151.5 L 110 ${n(Math.max(156, apexY - 2))}`;

  return {
    topD,
    pileD,
    streamD,
    topOpacity: remaining <= 0.003 ? "0" : "1",
    // 灯: 上のほむらは残りに応じて弱まり、下は積もるほど灯る
    haloTopOpacity: 0.25 + 0.75 * remaining,
    haloTopCy: 95 + 30 * progress,
    haloBottomOpacity: 0.12 + 0.8 * progress,
    haloBottomRy: 24 + 30 * progress,
  };
}

// 案「灯」: 暗い画面の中で砂だけが行灯のように光る。
// ガラスは光の輪郭だけ。すべてCSSアニメーション + 毎秒1回のパス更新。
function renderFocusSandClock(progressRatio = 0) {
  const progress = clamp(Number(progressRatio) || 0, 0, 1);
  const g = buildSandClockGeometry(progress);
  const flowing = Boolean(state.activeSession) && !ui.finishDraft && progress < 0.995;

  return `
    <figure
      class="focus-visual focus-sand${progress >= 0.995 ? " is-complete" : ""}${flowing ? "" : " is-idle"}"
      aria-label="集中の進み具合 ${Math.round(progress * 100)}%"
    >
      <svg class="focus-visual__svg" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <clipPath id="sandTopClip">
            <path d="M 77.5 55 C 77.5 100 104 130 108.6 150 L 111.4 150 C 116 130 142.5 100 142.5 55 Z" />
          </clipPath>
          <clipPath id="sandBottomClip">
            <path d="M 108.6 150 C 104 170 77.5 200 77.5 245 L 142.5 245 C 142.5 200 116 170 111.4 150 Z" />
          </clipPath>
          <linearGradient id="hgSandLumen" gradientUnits="userSpaceOnUse" x1="110" y1="50" x2="110" y2="250">
            <stop offset="0" stop-color="#ffe9a8" />
            <stop offset="1" stop-color="#d29e3e" />
          </linearGradient>
          <linearGradient id="hgStreamLumen" gradientUnits="userSpaceOnUse" x1="110" y1="150" x2="110" y2="250">
            <stop offset="0" stop-color="#ffefb5" />
            <stop offset="1" stop-color="#dfa94e" />
          </linearGradient>
          <radialGradient id="hgHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="rgba(255, 212, 116, 0.5)" />
            <stop offset="0.6" stop-color="rgba(255, 200, 100, 0.16)" />
            <stop offset="1" stop-color="rgba(255, 200, 100, 0)" />
          </radialGradient>
        </defs>

        <ellipse class="focus-sand__shadow" cx="110" cy="254" rx="36" ry="3.5" fill="rgba(44,40,32,0.07)" />

        <ellipse class="focus-sand__halo focus-sand__halo--top" fill="url(#hgHalo)" cx="110" cy="${g.haloTopCy.toFixed(1)}" rx="72" ry="60" style="opacity:${g.haloTopOpacity.toFixed(3)}" />
        <ellipse class="focus-sand__halo focus-sand__halo--bottom" fill="url(#hgHalo)" cx="110" cy="225" rx="80" ry="${g.haloBottomRy.toFixed(1)}" style="opacity:${g.haloBottomOpacity.toFixed(3)}" />

        <g clip-path="url(#sandTopClip)">
          <path class="focus-sand__mass" fill="url(#hgSandLumen)" d="${g.topD}" opacity="${g.topOpacity}" />
        </g>
        <g clip-path="url(#sandBottomClip)">
          <path class="focus-sand__mass focus-sand__mass--pile" fill="url(#hgSandLumen)" d="${g.pileD}" />
        </g>

        <path class="focus-sand__stream focus-sand__stream--glow" fill="none" stroke="rgba(255,222,140,0.22)" stroke-width="5.5" stroke-linecap="round" d="${g.streamD}" />
        <path class="focus-sand__stream focus-sand__stream--core" fill="none" stroke="url(#hgStreamLumen)" stroke-width="1.7" stroke-linecap="round" d="${g.streamD}" />
        <path class="focus-sand__stream focus-sand__stream--spark" fill="none" stroke="#fff3c8" stroke-width="0.9" stroke-linecap="round" stroke-dasharray="1.2 5.2" d="${g.streamD}" />

        <g class="focus-sand__glass">
          <path class="focus-sand__lip" fill="none" stroke="rgba(44,40,32,0.5)" stroke-width="2.2" stroke-linecap="round" d="M 74 52 H 146" />
          <path class="focus-sand__lip" fill="none" stroke="rgba(44,40,32,0.5)" stroke-width="2.2" stroke-linecap="round" d="M 74 248 H 146" />
          <path class="focus-sand__wall" fill="none" stroke="rgba(44,40,32,0.32)" stroke-width="1.6" stroke-linecap="round" d="M 74 52 C 74 100 102 132 106.5 150 C 102 168 74 200 74 248" />
          <path class="focus-sand__wall" fill="none" stroke="rgba(44,40,32,0.32)" stroke-width="1.6" stroke-linecap="round" d="M 146 52 C 146 100 118 132 113.5 150 C 118 168 146 200 146 248" />
          <path class="focus-sand__shine" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2.4" stroke-linecap="round" d="M 80 62 C 79 92 94 116 101 132" />
        </g>

        <circle class="focus-sand__mote" fill="#ffe9ad" cx="63" cy="120" r="1" style="--dx:5px; --dy:-9px; animation-duration:7s" />
        <circle class="focus-sand__mote" fill="#ffe9ad" cx="160" cy="180" r="0.8" style="--dx:-6px; --dy:-7px; animation-duration:9s; opacity:0.28" />
        <circle class="focus-sand__mote" fill="#ffe9ad" cx="145" cy="70" r="0.7" style="--dx:4px; --dy:6px; animation-duration:8s; opacity:0.25" />
      </svg>
    </figure>
  `;
}

function renderFocusTimerVisual(progressRatio = 0) {
  return renderFocusSandClock(progressRatio);
}

function updateFocusTimerVisual(remainingMs = null) {
  if (!state.activeSession) {
    return;
  }

  const progress = getSessionProgressRatio(state.activeSession, remainingMs);
  const label = `集中の進み具合 ${Math.round(progress * 100)}%`;

  const sand = sessionSheet.querySelector(".focus-sand");
  if (!sand) {
    return;
  }
  const g = buildSandClockGeometry(progress);
  const topMass = sand.querySelector(".focus-sand__mass:not(.focus-sand__mass--pile)");
  const pileMass = sand.querySelector(".focus-sand__mass--pile");
  const haloTop = sand.querySelector(".focus-sand__halo--top");
  const haloBottom = sand.querySelector(".focus-sand__halo--bottom");
  if (topMass) {
    topMass.setAttribute("d", g.topD);
    topMass.style.opacity = g.topOpacity;
  }
  if (pileMass) {
    pileMass.setAttribute("d", g.pileD);
  }
  if (haloTop) {
    haloTop.setAttribute("cy", g.haloTopCy.toFixed(1));
    haloTop.style.opacity = g.haloTopOpacity.toFixed(3);
  }
  if (haloBottom) {
    haloBottom.setAttribute("ry", g.haloBottomRy.toFixed(1));
    haloBottom.style.opacity = g.haloBottomOpacity.toFixed(3);
  }
  sand.querySelectorAll(".focus-sand__stream").forEach((stream) => {
    stream.setAttribute("d", g.streamD);
  });
  sand.setAttribute("aria-label", label);
  sand.classList.toggle("is-complete", progress >= 0.995);
  sand.classList.toggle("is-idle", !(state.activeSession && !ui.finishDraft && progress < 0.995));
}


function renderSessionSheet() {
  if (!ui.sessionOpen) {
    sessionSheet.hidden = true;
    sessionSheet.innerHTML = "";
    sessionSheet.className = "sheet";
    return;
  }

  const isLockedSession = Boolean(state.activeSession);
  const isRunningLockedSession = Boolean(state.activeSession && !ui.finishDraft);
  const taskSession = isTaskSession();
  const sessionTitle = taskSession ? (state.activeSession?.taskTitle || "Task") : state.setup.goal;
  const livePlanKey = taskSession ? "" : (state.plans[ui.selectedSessionPlan] ? ui.selectedSessionPlan : (state.activeSession ? state.activeSession.planKey : "A"));
  let displayPlanKey = ui.finishDraft ? ui.finishDraft.outcome : livePlanKey;
  let plan = taskSession
    ? { minutes: normalizeTaskMinutes(state.activeSession.minutes) }
    : state.plans[displayPlanKey];
  if (!plan && state.activeSession && !taskSession) {
    const fallbackPlanKey = getFallbackPlanKey(state.activeSession.planKey);
    if (fallbackPlanKey && state.plans[fallbackPlanKey]) {
      state.activeSession.planKey = fallbackPlanKey;
      ui.selectedSessionPlan = fallbackPlanKey;
      displayPlanKey = fallbackPlanKey;
      plan = state.plans[fallbackPlanKey];
    }
  }
  if (!plan) {
    sessionSheet.hidden = true;
    sessionSheet.innerHTML = "";
    if (state.activeSession) {
      sessionSheet.hidden = false;
      sessionSheet.className = "sheet sheet--locked";
      sessionSheet.innerHTML = `
        <div class="sheet__backdrop" data-action="close-session"></div>
        <section class="sheet__panel" role="dialog" aria-modal="true" aria-label="タイマー復旧">
          <div class="sheet__grab"></div>
          <div class="stack">
            <div class="sheet__lock-note">
              <span class="status-badge status-badge--accent">確認が必要</span>
              <p>前のタイマー情報が残っています。次へ進むには、このセッションを中断してください。</p>
            </div>
            <div class="sheet__actions">
              <button type="button" class="soft-button soft-button--danger" data-action="confirm-abort-session">中断する</button>
            </div>
          </div>
        </section>
      `;
      return;
    }
    ui.sessionOpen = false;
    return;
  }
  const displayedSessionMinutes = state.activeSession
    ? Math.max(1, Math.ceil(getSessionDurationMs(state.activeSession) / (60 * 1000)))
    : plan.minutes;
  const remaining = state.activeSession ? getRemainingMs(state.activeSession.endsAt) : plan.minutes * 60 * 1000;
  const overtime = state.activeSession && remaining <= 0;
  const sessionProgress = state.activeSession ? getSessionProgressRatio(state.activeSession, remaining) : 0;
  const isLaunchSheet = !state.activeSession && !ui.finishDraft;

  sessionSheet.hidden = false;
  sessionSheet.className = `sheet${isLockedSession ? " sheet--locked" : ""}${isLaunchSheet ? " sheet--launch" : ""}${isRunningLockedSession ? " sheet--running" : ""}`;
  if (ui.focusLockHelp && !state.activeSession && !ui.finishDraft) {
    sessionSheet.innerHTML = renderFocusLockHelpPanel();
    return;
  }

  sessionSheet.innerHTML = `
    <div class="sheet__backdrop" data-action="close-session"></div>
    <section class="sheet__panel" role="dialog" aria-modal="${isLockedSession ? "true" : "false"}" aria-label="${isLockedSession ? (taskSession ? "Taskタイマー" : "集中タイマー") : "セッション"}">
      <div class="sheet__grab"></div>
      <div class="stack">
        ${isRunningLockedSession ? `
          <div class="sheet__lock-note">
            <span class="status-badge status-badge--accent">集中モード</span>
            <p>タイマー中は他の操作をロックしています。戻るには中断してください。</p>
          </div>
        ` : ""}
        ${taskSession && ui.finishDraft
          ? `
            <div class="task-session-chip">
              <span class="status-badge">Task</span>
              <strong>${escapeHtml(sessionTitle || "Task")}</strong>
              <span>${escapeHtml(`${plan.minutes}分`)}</span>
            </div>
          `
          : ""}

        ${isLaunchSheet
          ? `
            <div class="sheet__actions sheet__actions--launch-primary">
              <button type="button" class="action-button action-button--primary" data-action="begin-session">開始</button>
              <button type="button" class="soft-button" data-action="close-session">あとで</button>
            </div>
          `
          : ""}

        ${
          ui.finishDraft
            ? `
              <div class="panel panel--cool stack">
                <div class="elapsed-timer-wrap">
                  <input
                    id="elapsed-input-field"
                    class="elapsed-timer-input${ui.finishDraft.elapsedSeconds !== ui.finishDraft._originalElapsed ? " is-edited" : ""}"
                    type="text"
                    inputmode="decimal"
                    autocomplete="off"
                    data-finish-field="elapsedInput"
                    placeholder="分"
                    value="${escapeHtml(formatElapsedForInput(ui.finishDraft.elapsedSeconds))}"
                  />
                  <span class="elapsed-timer-unit">${ui.finishDraft.elapsedSeconds !== ui.finishDraft._originalElapsed ? formatLoggedDuration(ui.finishDraft.elapsedSeconds) : "分:秒"}</span>
                </div>
                <p class="sheet__caption">実行時間 / 予定 ${formatLoggedDuration(ui.finishDraft.plannedSeconds)}<br><span style="opacity:0.6;font-size:0.78em">⏱ タップして修正（例: 10 または 1:30）</span></p>
              </div>
              <div class="panel stack">
                <h3 class="panel__title">記録の仕上げ</h3>
                <label class="field">
                  <span class="field__label">ひとこと</span>
                  <textarea data-finish-field="reflection" placeholder="任意。気づきがあれば一言だけ">${escapeHtml(ui.finishDraft.reflection)}</textarea>
                </label>
              </div>
            `
            : `
              <div class="panel panel--cool session-focus-panel${state.activeSession ? "" : " session-focus-panel--launch"}">
                ${sessionTitle ? `
                  <div class="session-current-work">
                    <span class="session-current-work__label">${taskSession ? "Task" : "今やること"}</span>
                    <strong class="session-current-work__title">${escapeHtml(sessionTitle)}</strong>
                    <span class="session-current-work__meta">${escapeHtml(`${displayedSessionMinutes}分`)}</span>
                  </div>
                ` : ""}
                ${renderFocusTimerVisual(sessionProgress)}
                <div class="sheet__time-readout" aria-live="polite">
                  <small id="session-timer-label">${overtime ? "予定時間になりました" : "残り時間"}</small>
                  <span id="session-timer-value">${overtime ? "00:00" : formatCountdown(remaining)}</span>
                </div>
                ${(state.activeSession?.departures > 0) ? `<p style="font-size:0.78rem;opacity:0.55;text-align:center;margin:4px 0 0">離脱 ${state.activeSession?.departures}回</p>` : ""}
              </div>
            `
        }

        ${isLaunchSheet ? "" : `
          <div class="sheet__actions">
            ${
              ui.finishDraft
                ? `
                  <button type="button" class="action-button action-button--primary" data-action="save-finish-log">記録して閉じる</button>
                  <button type="button" class="soft-button" data-action="cancel-finish">タイマーに戻る</button>
                `
                : state.activeSession
                  ? ui.showAbortConfirm
                    ? `
                      <div class="abort-confirm${overtime ? " abort-confirm--finished" : ""}">
                        <p class="abort-confirm__message">${overtime
                          ? "予定時間は終了しています。今回はここで終了しますか？"
                          : `残り ${escapeHtml(formatCountdown(remaining))}。同じ項目から再開できます。`}</p>
                        ${overtime ? "" : `<button type="button" class="action-button action-button--primary" data-action="hold-session">残りを残す</button>`}
                        <button type="button" class="action-button action-button--danger" data-action="abort-session">今回は終了</button>
                        <button type="button" class="soft-button" data-action="cancel-abort-confirm">戻る</button>
                      </div>
                    `
                    : taskSession
                      ? `
                    <button type="button" class="action-button action-button--primary" data-action="complete-session">完了</button>
                    <button type="button" class="soft-button soft-button--danger" data-action="confirm-abort-session">中断</button>
                  `
                    : `
                    <button type="button" class="action-button action-button--primary" data-action="complete-session">完了</button>
                    <button type="button" class="soft-button soft-button--danger" data-action="confirm-abort-session">中断</button>
                  `
                  : ""
            }
          </div>
        `}
      </div>
    </section>
  `;
}

// IME-safe wrapper around renderSessionSheet.
// Problem: while user types in the reflection textarea or elapsed input inside
// the session sheet, background rerenders (sync ticks, timer ticks, safeRender
// debounce) cause sessionSheet.innerHTML to be fully replaced. This drops focus
// and the mobile keyboard, and looks like a sudden "screen switch" — especially
// bad mid-IME composition for Japanese input.
//
// Fix: (1) track IME composition anywhere inside the sheet and defer sheet
// rebuilds until compositionend, (2) preserve the focused input's value,
// focus, and selection range across unavoidable rebuilds, (3) suppress the
// sheet-in slide animation on subsequent rebuilds so the user doesn't perceive
// the sheet as reopening.
(function () {
  const _originalRenderSessionSheet = renderSessionSheet;
  let _imeInSheet = false;
  let _pendingSheetRender = false;
  let _sheetAnimatedOnce = false;

  document.addEventListener(
    "compositionstart",
    (e) => {
      if (sessionSheet && e.target && sessionSheet.contains(e.target)) {
        _imeInSheet = true;
      }
    },
    true,
  );
  document.addEventListener(
    "compositionend",
    () => {
      if (!_imeInSheet) return;
      _imeInSheet = false;
      if (_pendingSheetRender) {
        _pendingSheetRender = false;
        renderSessionSheet();
      }
    },
    true,
  );

  renderSessionSheet = function () {
    // If user is mid-IME composition inside the sheet, defer the rebuild.
    if (_imeInSheet && ui.sessionOpen) {
      _pendingSheetRender = true;
      return;
    }

    // Reset animation flag when sheet is closed, so next open animates in.
    if (!ui.sessionOpen) {
      _sheetAnimatedOnce = false;
      return _originalRenderSessionSheet.apply(this, arguments);
    }

    // Capture focus info before rebuild.
    const active = document.activeElement;
    let focusInfo = null;
    if (
      active &&
      sessionSheet.contains(active) &&
      (active.tagName === "TEXTAREA" || active.tagName === "INPUT")
    ) {
      focusInfo = {
        finishField: active.dataset ? active.dataset.finishField : null,
        setupField: active.dataset ? active.dataset.setupField : null,
        id: active.id || null,
        value: active.value,
        start: active.selectionStart,
        end: active.selectionEnd,
      };
    }

    const result = _originalRenderSessionSheet.apply(this, arguments);

    // Suppress sheet-in animation on rebuilds (only play on first open).
    if (_sheetAnimatedOnce) {
      const panel = sessionSheet.querySelector(".sheet__panel");
      if (panel) panel.style.animation = "none";
    } else {
      _sheetAnimatedOnce = true;
    }

    // Restore focus/selection if we had one.
    if (focusInfo) {
      let target = null;
      if (focusInfo.finishField) {
        target = sessionSheet.querySelector(
          '[data-finish-field="' + focusInfo.finishField + '"]',
        );
      }
      if (!target && focusInfo.setupField) {
        target = sessionSheet.querySelector(
          '[data-setup-field="' + focusInfo.setupField + '"]',
        );
      }
      if (!target && focusInfo.id) {
        target = sessionSheet.querySelector("#" + focusInfo.id);
      }
      if (
        target &&
        (target.tagName === "TEXTAREA" || target.tagName === "INPUT")
      ) {
        // Prefer the freshly typed value over whatever came out of state,
        // in case state hadn't yet been flushed when render fired.
        if (target.value !== focusInfo.value) target.value = focusInfo.value;
        try {
          target.focus({ preventScroll: true });
          if (
            typeof focusInfo.start === "number" &&
            typeof focusInfo.end === "number"
          ) {
            target.setSelectionRange(focusInfo.start, focusInfo.end);
          }
        } catch (_err) {
          /* setSelectionRange not supported on this input type — ignore */
        }
      }
    }

    return result;
  };
})();

function openFinishDraft(planKey) {
  ui.selectedSessionPlan = planKey;
  const accumulatedSeconds = Math.max(0, Number(state.activeSession?.accumulatedSeconds || 0));
  const rawElapsed = state.activeSession
    ? Math.max(1, accumulatedSeconds + Math.round((Date.now() - state.activeSession.startedAt) / 1000))
    : state.plans[planKey].minutes * 60;
  const elapsedSeconds = Math.max(1, rawElapsed);
  const plannedSeconds = Math.max(
    1,
    Number(state.activeSession?.plannedSeconds || state.plans[planKey].minutes * 60),
  );

  ui.finishDraft = {
    outcome: planKey,
    elapsedSeconds,
    _originalElapsed: elapsedSeconds,
    plannedSeconds,
    progressText: "",
    reflection: "",
    milestoneId: "",
    milestoneStatus: "working",
  };

  if (ui.sessionTimer) {
    window.clearInterval(ui.sessionTimer);
    ui.sessionTimer = null;
  }
  cancelFocusAlarm();
  syncDeviceAppLock();
}

function saveFinishDraft() {
  if (!ui.finishDraft) {
    return;
  }

  const allocationId = state.activeSession?.allocationId || "";
  if (allocationId) {
    markPlanAllocationCompleted(allocationId);
  }
  recordLog(ui.finishDraft.outcome, null, ui.finishDraft);
  ui.finishDraft = null;
  ui.sessionOpen = false;
  state.activeSession = null;
  releaseWakeLock();
  cancelFocusAlarm();
  syncDeviceAppLock();
  saveState();
}

function holdActiveSession() {
  const session = state.activeSession;
  const remainingSeconds = getSessionRemainingSeconds(session);
  if (!session || remainingSeconds <= 0) {
    ui.showAbortConfirm = false;
    render();
    showToast("予定時間を過ぎているため、残り時間は保留できません。");
    return;
  }

  const startedFromTask = isTaskSession(session);
  const continuationGoalId = startedFromTask
    ? String(session.sourceGoalId || "")
    : String(session.goalId || state.meta.activeGoalId || "");
  const pausedAt = new Date().toISOString();
  const elapsedThisRun = Math.max(0, Math.round((Date.now() - Number(session.startedAt || Date.now())) / 1000));
  const accumulatedSeconds = Math.max(0, Number(session.accumulatedSeconds || 0)) + elapsedThisRun;
  let task = null;
  let continuation = null;
  let continuationTitle = "";

  if (continuationGoalId) {
    const goal = (state.goals || []).find((item) => item.id === continuationGoalId);
    if (goal) {
      continuation = setGoalContinuation(continuationGoalId, {
        remainingSeconds,
        accumulatedSeconds,
        plannedSeconds: Math.max(
          1,
          Number(session.plannedSeconds)
            || Number(goal.plans?.[session.planKey]?.minutes || goal.setup?.normalMinutes || 1) * 60,
        ),
        planKey: session.sourceGoalPlanKey || session.planKey || "A",
        pausedAt,
      });
      continuationTitle = goal.setup?.goal || goal.title || "習慣・目標";
      if (startedFromTask && session.taskId) {
        state.tasks = normalizeTasks(state.tasks).filter((item) => item.id !== session.taskId);
      }
    }
  } else if (startedFromTask) {
    task = updateTask(session.taskId, () => ({
      status: "active",
      completedAt: null,
      shelvedAt: null,
      pausedRemainingSeconds: remainingSeconds,
      pausedSegmentMinutes: Math.max(
        1,
        Number(session.segmentMinutes) || Math.ceil(Number(session.plannedSeconds || remainingSeconds) / 60),
      ),
      pausedAt,
      plannedDate: toISODate(new Date()),
      accumulatedSeconds,
      pausedAllocationId: session.allocationId || "",
    }));
  }

  if (!task && !continuation) {
    showToast("残り時間を保存できませんでした。");
    return;
  }

  clearActiveSessionRuntime();
  closePiP();
  ui.selectedTaskId = task ? task.id : goalWorkId(continuationGoalId);
  state.meta.currentView = "today";
  ui.todayMode = ["time", "organize"].includes(session.originMode)
    ? session.originMode
    : "execution";
  saveState();
  render();
  if (screenFrame) {
    screenFrame.scrollTop = 0;
  }
  showToast(continuation
    ? `「${continuationTitle}」に残り ${formatTaskRemaining(remainingSeconds)} を残しました。`
    : `残り ${formatTaskRemaining(remainingSeconds)} をこのTaskに残しました。`);
}

function beginSession(planKey, allocationId = "") {
  const goalId = state.meta.activeGoalId;
  const continuation = getGoalContinuation(goalId);
  const activePlanKey = continuation?.planKey && state.plans[continuation.planKey]
    ? continuation.planKey
    : planKey;
  const plan = state.plans[activePlanKey];
  if (!plan) {
    showToast("プランが見つかりません。設定を確認してください。");
    return null;
  }
  const dailyPlan = ensureDailyPlan();
  const allocation = dailyPlan.allocations.find((item) => (
    item.id === allocationId && item.workId === goalWorkId(goalId) && !item.completedAt
  ));
  const durationSeconds = continuation?.remainingSeconds || allocation?.minutes * 60 || plan.minutes * 60;
  const now = Date.now();
  state.activeSession = {
    type: "goal",
    goalId,
    goalTitle: state.setup?.goal || "",
    planKey: activePlanKey,
    durationSeconds,
    plannedSeconds: continuation?.plannedSeconds || plan.minutes * 60,
    accumulatedSeconds: continuation?.accumulatedSeconds || 0,
    allocationId: allocation?.id || "",
    originMode: ui.todayMode || "execution",
    startedAt: now,
    endsAt: now + durationSeconds * 1000,
    departures: 0,
  };
  clearGoalContinuation(goalId);
  ui.selectedSessionPlan = activePlanKey;
  ui.finishDraft = null;
  ui.sessionOpen = true;
  requestNotificationPermission();
  requestWakeLock();
  scheduleFocusAlarm(state.activeSession);
  syncDeviceAppLock();
  saveState();
  startSessionTicker();
  return { isResume: Boolean(continuation), durationSeconds };
}

function beginTaskSession(taskId, allocationId = "") {
  const task = getTaskById(taskId);
  if (!task || task.status !== "active") {
    showToast("開始できるTaskが見つかりません。");
    return;
  }

  const minutes = normalizeTaskMinutes(task.minutes);
  const pausedRemainingSeconds = getTaskPausedSeconds(task);
  const dailyPlan = ensureDailyPlan();
  const preferredAllocationIds = pausedRemainingSeconds
    ? [task.pausedAllocationId, allocationId]
    : [allocationId];
  const allocation = preferredAllocationIds
    .filter((id, index, ids) => id && ids.indexOf(id) === index)
    .map((id) => dailyPlan.allocations.find((item) => (
      item.id === id && item.workId === task.id && !item.completedAt
    )))
    .find(Boolean) || null;
  const segmentMinutes = pausedRemainingSeconds
    ? getTaskPausedSegmentMinutes(task)
    : Math.max(1, Number(allocation?.minutes) || getTaskRemainingMinutes(task) || minutes);
  const durationSeconds = pausedRemainingSeconds || allocation?.minutes * 60 || getTaskRemainingMinutes(task) * 60 || minutes * 60;
  const now = Date.now();
  state.activeSession = {
    type: "task",
    taskId: task.id,
    taskTitle: task.title,
    minutes: Math.max(1, Math.ceil(durationSeconds / 60)),
    segmentMinutes,
    durationSeconds,
    plannedSeconds: Math.max(1, segmentMinutes * 60),
    accumulatedSeconds: Math.max(0, Number(task.accumulatedSeconds) || 0),
    sourceGoalId: task.sourceGoalId || "",
    sourceGoalPlanKey: task.sourceGoalPlanKey || "",
    quadrant: task.quadrant,
    allocationId: allocation?.id || "",
    originMode: ui.todayMode || "execution",
    startedAt: now,
    endsAt: now + durationSeconds * 1000,
    departures: 0,
  };
  updateTask(task.id, () => ({
    lastStartedAt: new Date(now).toISOString(),
    pausedRemainingSeconds: null,
    pausedSegmentMinutes: null,
    pausedAt: null,
    pausedAllocationId: "",
  }));
  ui.sessionOpen = true;
  ui.finishDraft = null;
  ui.showAbortConfirm = false;
  requestNotificationPermission();
  requestWakeLock();
  scheduleFocusAlarm(state.activeSession);
  syncDeviceAppLock();
  saveState();
  startSessionTicker();
  showToast(pausedRemainingSeconds
    ? `残り ${formatTaskRemaining(durationSeconds)} から再開しました。`
    : `${Math.max(1, Math.ceil(durationSeconds / 60))}分Taskを開始しました。`);
}

function recordTaskExecution(task, session, elapsedSeconds) {
  const date = toISODate(new Date());
  const recordedAt = new Date().toISOString();
  const plannedSeconds = Math.max(1, Number(session.plannedSeconds || task.plannedSeconds || task.minutes * 60));

  if (task.sourceGoalId) {
    syncActiveGoalRecord();
    const goalIndex = state.goals.findIndex((goal) => goal.id === task.sourceGoalId);
    if (goalIndex >= 0) {
      const goal = state.goals[goalIndex];
      const outcome = ["A", "B", "C"].includes(task.sourceGoalPlanKey) ? task.sourceGoalPlanKey : "A";
      const entry = normalizeLogEntry({
        logId: createLogId(),
        date,
        outcome,
        reason: null,
        missionTitle: goal.today?.missionTitle || goal.setup?.goal || task.title,
        recordedAt,
        elapsedSeconds,
        plannedSeconds,
        itemKind: "goal",
        itemId: goal.id,
        itemTitle: goal.setup?.goal || task.title,
        goalId: goal.id,
        quadrant: normalizeGoalQuadrant(task.quadrant || goal.setup?.quadrant),
      });
      const logs = normalizeLogs([...(goal.logs || []), entry]);
      const today = {
        ...goal.today,
        lastOutcome: outcome,
        lastRecordedAt: recordedAt,
        lastElapsedSeconds: elapsedSeconds,
      };
      state.goals[goalIndex] = { ...goal, logs, today };
      if (state.meta.activeGoalId === goal.id) {
        state.logs = cloneData(logs);
        state.today = cloneData(today);
      }
      return;
    }
  }

  const entry = normalizeLogEntry({
    logId: createLogId(),
    date,
    outcome: "task",
    reason: null,
    recordedAt,
    elapsedSeconds,
    plannedSeconds,
    itemKind: "task",
    itemId: task.id,
    itemTitle: task.title,
    goalId: "",
    quadrant: normalizeTaskQuadrant(task.quadrant),
  });
  state.taskLogs = normalizeLogs([...(state.taskLogs || []), entry]);
}

function completeTaskSession() {
  const session = state.activeSession;
  if (!isTaskSession(session)) {
    return;
  }

  const task = getTaskById(session.taskId);
  const allocation = session.allocationId
    ? ensureDailyPlan().allocations.find((item) => item.id === session.allocationId)
    : null;
  const elapsedThisRun = Math.max(1, Math.round((Date.now() - Number(session.startedAt || Date.now())) / 1000));
  const elapsedSeconds = Math.max(1, Number(session.accumulatedSeconds || task?.accumulatedSeconds || 0) + elapsedThisRun);
  if (task) {
    recordTaskExecution(task, session, elapsedSeconds);
  }

  if (task?.sourceGoalId) {
    state.tasks = normalizeTasks(state.tasks).filter((item) => item.id !== session.taskId);
  } else if (task) {
    if (allocation) {
      markPlanAllocationCompleted(allocation.id);
    }
    const completedSegmentMinutes = Math.min(
      getTaskRemainingMinutes(task),
      Math.max(1, Number(session.segmentMinutes) || Number(allocation?.minutes) || getTaskRemainingMinutes(task)),
    );
    const nextCompletedMinutes = Math.min(
      task.minutes,
      Math.max(0, Number(task.completedMinutes) || 0) + completedSegmentMinutes,
    );
    const taskCompleted = nextCompletedMinutes >= task.minutes;
    updateTask(session.taskId, () => ({
      status: taskCompleted ? "done" : "active",
      completedMinutes: nextCompletedMinutes,
      completedAt: taskCompleted ? new Date().toISOString() : null,
      pausedRemainingSeconds: null,
      pausedSegmentMinutes: null,
      pausedAt: null,
      pausedAllocationId: "",
      accumulatedSeconds: 0,
    }));
  }
  state.activeSession = null;
  ui.sessionOpen = false;
  ui.finishDraft = null;
  ui.showAbortConfirm = false;
  releaseWakeLock();
  cancelFocusAlarm();
  syncDeviceAppLock();
  saveState();
  startSessionTicker();
  const updatedTask = getTaskById(session.taskId);
  return {
    taskCompleted: !updatedTask || updatedTask.status === "done",
    segmentCompleted: Boolean(allocation),
  };
}

function completeSession(planKey) {
  if (state.activeSession?.allocationId) {
    markPlanAllocationCompleted(state.activeSession.allocationId);
  }
  recordLog(planKey, null);
  state.activeSession = null;
  ui.sessionOpen = false;
  releaseWakeLock();
  cancelFocusAlarm();
  syncDeviceAppLock();
  saveState();
  startSessionTicker();
}

function recordLog(outcome, reason, details = {}) {
  const date = toISODate(new Date());
  const defaultPlannedSeconds = state.plans[outcome] ? state.plans[outcome].minutes * 60 : 0;
  const sessionElapsedSeconds = state.activeSession
    ? Math.max(1, Math.round((Date.now() - state.activeSession.startedAt) / 1000))
    : 0;
  const elapsedSeconds = Number(details.elapsedSeconds || sessionElapsedSeconds || defaultPlannedSeconds || 0);
  const plannedSeconds = Number(details.plannedSeconds || defaultPlannedSeconds || 0);
  const selectedMilestone = details.milestoneId
    ? normalizeRoadmapItems(state.roadmap, state.setup).find((item) => item.id === details.milestoneId)
    : null;
  const nextEntry = {
    logId: createLogId(),
    date,
    outcome,
    reason,
    missionTitle: state.today.missionTitle,
    recordedAt: new Date().toISOString(),
    elapsedSeconds,
    plannedSeconds,
    progressText: (details.progressText || "").trim(),
    reflection: (details.reflection || "").trim(),
    milestoneId: selectedMilestone ? selectedMilestone.id : "",
    milestoneLabel: selectedMilestone ? selectedMilestone.label : "",
    milestoneTarget: selectedMilestone ? selectedMilestone.target : null,
    milestoneStatus: selectedMilestone ? (details.milestoneStatus || "working") : "",
    itemKind: "goal",
    itemId: state.meta.activeGoalId,
    itemTitle: state.setup.goal,
    goalId: state.meta.activeGoalId,
    quadrant: normalizeGoalQuadrant(state.setup.quadrant),
  };

  state.logs.push(nextEntry);
  state.logs.sort((left, right) => new Date(left.recordedAt) - new Date(right.recordedAt));
  state.activeSession = null;
  syncTodayLastLogFields();
  saveState();
}

function openReviewLogDraft(logId) {
  const entry = getLogEntryById(logId);
  if (!entry || !isExecutionOutcome(entry.outcome)) {
    return null;
  }

  const totalMinutes = Math.max(1, Math.round(getLoggedSeconds(entry) / 60));
  ui.reviewLogDraft = {
    logId: entry.logId,
    date: entry.date,
    elapsedHours: String(Math.floor(totalMinutes / 60)),
    elapsedMinutes: String(totalMinutes % 60),
  };
  return entry;
}

function saveReviewLogDraft() {
  if (!ui.reviewLogDraft) {
    return false;
  }

  const date = normalizeOptionalDate(ui.reviewLogDraft.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsedHours = Number(ui.reviewLogDraft.elapsedHours || 0);
  const parsedMinutes = Number(ui.reviewLogDraft.elapsedMinutes || 0);
  const hours = Number.isFinite(parsedHours) ? Math.max(0, Math.floor(parsedHours)) : NaN;
  const minutes = Number.isFinite(parsedMinutes) ? Math.max(0, Math.floor(parsedMinutes)) : NaN;
  const elapsedSeconds = (hours * 60 * 60) + (minutes * 60);
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return false;
  }

  const logIndex = state.logs.findIndex((entry) => entry.logId === ui.reviewLogDraft.logId);
  if (logIndex === -1) {
    ui.reviewLogDraft = null;
    return false;
  }

  state.logs[logIndex] = {
    ...state.logs[logIndex],
    date,
    elapsedSeconds,
  };
  state.logs.sort((left, right) => new Date(left.recordedAt) - new Date(right.recordedAt));
  ui.reviewLogDraft = null;
  syncTodayLastLogFields();
  saveState();
  return true;
}

function computeRoadmap(currentState) {
  const deadlineDate = new Date(currentState.setup.deadline);
  const hasDeadline = Boolean(normalizeOptionalDate(currentState.setup.deadline)) && !Number.isNaN(deadlineDate.getTime());
  const today = startOfDay(new Date());
  const startDate = startOfDay(new Date(currentState.programStartDate));
  const totalDays = hasDeadline
    ? Math.max(1, diffInDays(deadlineDate, startDate))
    : Math.max(1, diffInDays(today, startDate) + 1);
  const elapsedDays = clamp(diffInDays(today, startDate), 0, totalDays);
  const deadlineProgress = hasDeadline ? Math.round((elapsedDays / totalDays) * 100) : 0;

  const baseProgress = 0;
  const normalSeconds = Math.max(600, (Number(currentState.setup.normalMinutes) || 30) * 60);
  const logBoost = currentState.logs.reduce((sum, entry) => {
    if (entry.outcome === "miss") {
      return sum;
    }

    const loggedSeconds = getLoggedSeconds(entry);
    if (!loggedSeconds) {
      return sum;
    }

    const durationFactor = Math.min(1.6, loggedSeconds / normalSeconds);
    const outcomeFactor = entry.outcome === "A" ? 1.4 : entry.outcome === "B" ? 0.95 : 0.55;
    return sum + (durationFactor * outcomeFactor);
  }, 0);
  const roadmapItems = normalizeRoadmapItems(currentState.roadmap, currentState.setup);
  const manualProgress = getManualMilestoneProgress(currentState.logs, roadmapItems);
  const learningProgress = clamp(Math.max(Math.round(baseProgress + logBoost), manualProgress), 0, 100);
  const paceGap = hasDeadline ? clamp(learningProgress - deadlineProgress, -100, 100) : 0;
  const daysRemaining = hasDeadline ? Math.max(0, diffInDays(deadlineDate, today)) : null;

  const stagedMilestones = roadmapItems.map((item) => ({
    ...item,
    isComplete: learningProgress >= item.target,
  }));
  const currentMilestone = stagedMilestones.filter((item) => !item.isComplete).slice(-1)[0] || null;
  const milestones = stagedMilestones.map((item) => ({
    ...item,
    isActive: Boolean(currentMilestone && item.id === currentMilestone.id),
    state: item.isComplete ? "到達済み" : currentMilestone && item.id === currentMilestone.id ? "いまここ" : "これから",
  }));

  return {
    deadlineProgress,
    learningProgress,
    paceGap,
    daysRemaining,
    currentMilestone,
    milestones,
  };
}
function computeReviewMetrics() {
  const recentWeek = getTrailingEntries(7);
  const executed = recentWeek.filter((entry) => entry.hasExecution).length;
  const planA = recentWeek.filter((entry) => entry.outcomes.includes("A")).length;
  const rescue = recentWeek.filter((entry) => entry.outcomes.includes("C")).length;

  const recoveryWindow = getTrailingEntries(14);
  let misses = 0;
  let recoveries = 0;
  for (let index = 0; index < recoveryWindow.length - 1; index += 1) {
    if (recoveryWindow[index].outcome === "miss") {
      misses += 1;
      if (recoveryWindow[index + 1].hasExecution) {
        recoveries += 1;
      }
    }
  }

  return {
    executionRate: Math.round((executed / recentWeek.length) * 100),
    planARate: executed ? Math.round((planA / executed) * 100) : 0,
    rescueRate: Math.round((rescue / recentWeek.length) * 100),
    recoveryRate: misses ? Math.round((recoveries / misses) * 100) : 100,
  };
}

function inferWindowState(currentState) {
  const primary = parseWindow(currentState.setup.primaryWindow);
  const now = new Date();
  const minute = now.getHours() * 60 + now.getMinutes();
  const baselinePlan = getBaselinePlan(currentState);

  if (minute < primary.start) {
    return {
      badge: "次は実施時間",
      windowLabel: `実施時間 ${currentState.setup.primaryWindow}`,
      actionLabel: `実施時間に ${PLAN_META[baselinePlan].label} から今日の1本を終えます`,
      copy: "まだ実施時間前です。時間になったら始めれば十分です。",
      tone: "accent",
      planCap: baselinePlan,
    };
  }

  if (minute <= primary.end) {
    return {
      badge: "いま実施時間",
      windowLabel: currentState.setup.primaryWindow,
      actionLabel: `いま始めるなら ${PLAN_META[baselinePlan].label} で今日の1本を終える`,
      copy: "今日の1本を進める時間帯です。",
      tone: "accent",
      planCap: baselinePlan,
    };
  }

  return {
    badge: "実施時間後",
    windowLabel: `実施時間 ${currentState.setup.primaryWindow}`,
    actionLabel: `ここから始めるなら ${PLAN_META.C.label} で記録を残せば十分です`,
    copy: "実施時間は終わりました。今日は最小単位でつなげれば十分です。",
    tone: "default",
    planCap: "C",
  };
}

function generateReviewSuggestions(metrics, currentState) {
  const reasons = topReasons(currentState.logs, 3).map((item) => item.reason);
  const suggestions = [];

  if (reasons.some((reason) => reason.includes("残業"))) {
    suggestions.push("火曜は分数を少し短くする");
  }

  if (metrics.rescueRate >= 20 || currentState.planTuning.rescuePrimaryDays.length > 0) {
    suggestions.push("金曜は救済枠を主枠扱いにする");
  }

  if (reasons.some((reason) => reason.includes("準備"))) {
    suggestions.push("開始前の準備は2分ウォームアップに分ける");
  } else if (reasons.some((reason) => reason.includes("タスク"))) {
    suggestions.push("夜は暗記系、朝は演習系に分ける");
  } else {
    suggestions.push("次の1本は“前半だけ”までに切っておく");
  }

  while (suggestions.length < 3) {
    suggestions.push("今週の到達点は1段だけ小さくする");
  }

  return suggestions.slice(0, 3);
}

function generateReplanPreview(mode, text, currentState) {
  const normalized = text || "";
  const roadmap = normalizeRoadmapItems(currentState.roadmap, currentState.setup);
  const weekItem = getWeekRoadmapItem(roadmap);
  const nextItem = getNextRoadmapItem(roadmap);
  const todayPlan = getRecommendedPlan(currentState);
  const nextPlan = nextPlanDown(todayPlan);
  const heavyReason = normalized.includes("残業") || normalized.includes("忙");
  const fatigueReason = normalized.includes("疲") || normalized.includes("眠");
  const prepReason = normalized.includes("準備") || normalized.includes("面倒");

  if (mode === "retarget_goal") {
    const retargeted = buildRetargetResult(currentState);
    const nextWeek = getWeekRoadmapItem(retargeted.roadmap);
    const nextRoadmapStep = getNextRoadmapItem(retargeted.roadmap);
    return [
      `目標を「${currentState.setup.goal}」 -> 「${retargeted.setup.goal}」に更新`,
      `今日のミッションを「${currentState.today.missionTitle}」 -> 「${retargeted.today.missionTitle}」に更新`,
      `今週の到達点を「${weekItem ? weekItem.label : "今週の到達点"}」 -> 「${nextWeek ? nextWeek.label : "今週の到達点"}」に更新`,
      `次の一歩を「${nextItem ? nextItem.label : "次の一歩"}」 -> 「${nextRoadmapStep ? nextRoadmapStep.label : "次の一歩"}」に更新`,
      "残りの計画は目標と現在地から自動で作り直します。",
    ];
  }

  if (mode === "lighten_today") {
    return [
      `今日の分数を ${currentState.plans[todayPlan].minutes}分 -> ${currentState.plans[nextPlan].minutes}分 に変更`,
      `今日のミッションを「${currentState.today.missionTitle}」 -> 「${shortenMission(currentState.today.missionTitle)}」に短縮`,
      heavyReason ? `今日は主枠を追わず、予備枠 ${currentState.setup.backupWindow} を優先表示` : `救済の定義を「${currentState.plans.C.description}」のまま固定`,
    ];
  }

  if (mode === "reset_week") {
    return [
      `${weekdayLabel("Tue")}の分数を少し短くする`,
      `${weekdayLabel("Fri")}は救済枠 ${currentState.setup.rescueWindow} を主枠扱いにする`,
      `今週の到達点を「${weekItem ? weekItem.label : "今週の到達点"}」 -> 「今週: ${lighterWeeklyFocus(weekItem ? weekItem.label : "今週: 前半")}」に修正`,
    ];
  }

  if (mode === "break_goal") {
    return [
      `次の一歩を「${nextItem ? nextItem.label : "次の一歩"}」 -> 「次: ${microStepFromMission(currentState.today.missionTitle)}」に変更`,
      `今週の到達点を「${weekItem ? weekItem.label : "今週の到達点"}」 -> 「今週: 前半だけ完了」に分解`,
      `最小学習例に「${warmupExample(currentState.setup.minimumExample)}」を追加`,
    ];
  }

  return [
    heavyReason ? `残業が続く前提で、${weekdayLabel("Tue")}と${weekdayLabel("Thu")}の分数を短くする` : "詰まりが出やすい曜日の分数を短くする",
    fatigueReason ? `通常学習時間を ${currentState.setup.normalMinutes}分 -> ${Math.max(10, currentState.setup.normalMinutes - 5)}分 に調整` : "開始ハードルを下げるため、最小単位を守ったまま主枠の負荷だけ下げる",
    prepReason ? `開始前2分のウォームアップ「${warmupExample(currentState.setup.minimumExample)}」を追加` : "今日のミッションの前に2分のウォームアップを追加",
  ];
}

function applyReplan(mode, preview) {
  if (!preview || !preview.length) {
    return;
  }

  if (mode === "retarget_goal") {
    const retargeted = buildRetargetResult(state);
    state.setup = retargeted.setup;
    state.roadmap = retargeted.roadmap;
    state.today = retargeted.today;
    state.plans = retargeted.plans;
    syncRetargetDraftFromState();
    return;
  }

  if (mode === "lighten_today") {
    state.today.recommendedPlan = nextPlanDown(getRecommendedPlan(state));
    state.today.missionTitle = shortenMission(state.today.missionTitle);
    state.today.missionNote = `今日は軽量版でつなぐ日です。${state.today.missionNote}`;
    state.plans = buildPlans(state.setup, state.today.missionTitle);
    return;
  }

  if (mode === "reset_week") {
    state.planTuning.defaultPlanByDay.Tue = "B";
    state.planTuning.rescuePrimaryDays = Array.from(new Set([...state.planTuning.rescuePrimaryDays, "Fri"]));
    state.roadmap = state.roadmap.map((item) =>
      item.id === "week" ? { ...item, label: `今週: ${lighterWeeklyFocus(item.label)}` } : item,
    );
    return;
  }

  if (mode === "break_goal") {
    state.roadmap = state.roadmap.map((item) => {
      if (item.id === "week") {
        return { ...item, label: "今週: 前半だけ完了" };
      }
      if (item.id === "next") {
        return { ...item, label: `次: ${microStepFromMission(state.today.missionTitle)}` };
      }
      return item;
    });
    state.today.missionTitle = microStepFromMission(state.today.missionTitle);
    state.setup.minimumExample = joinExamples(state.setup.minimumExample, warmupExample(state.setup.minimumExample));
    state.plans = buildPlans(state.setup, state.today.missionTitle);
    return;
  }

  if (mode === "consult_block") {
    state.planTuning.defaultPlanByDay.Tue = "B";
    state.planTuning.defaultPlanByDay.Thu = "B";
    state.setup.normalMinutes = Math.max(10, state.setup.normalMinutes - 5);
    state.setup.minimumExample = joinExamples(state.setup.minimumExample, warmupExample(state.setup.minimumExample));
    state.plans = buildPlans(state.setup, state.today.missionTitle);
  }
}

function getBaselinePlan(currentState) {
  const todayPlan = currentState.today.recommendedPlan || "A";
  const tunedPlan = currentState.planTuning.defaultPlanByDay[weekdayKeyFromDate(new Date())];

  if (!tunedPlan) {
    return todayPlan;
  }

  return downgradePlan(todayPlan, tunedPlan);
}

function getRecommendedPlan(currentState) {
  const baseline = getBaselinePlan(currentState);
  const window = inferWindowState(currentState);

  if (!window.planCap) {
    return baseline;
  }

  return downgradePlan(baseline, window.planCap);
}

function downgradePlan(planKey, ceilingPlan) {
  return PLAN_RANK[planKey] > PLAN_RANK[ceilingPlan] ? ceilingPlan : planKey;
}

function nextPlanDown(planKey) {
  if (planKey === "A") return "B";
  if (planKey === "B") return "C";
  return "C";
}

function buildPlans(setup, missionTitle) {
  const {
    normalMinutes,
    shortMinutes,
    minimumMinutes,
  } = resolvePlanMinuteValues(setup, setup);

  const baseMission = missionTitle || inferMissionTitle(setup);
  return {
    A: {
      minutes: normalMinutes,
      description: `${baseMission} + 1分だけ振り返る`,
    },
    B: {
      minutes: shortMinutes,
      description: `${shortenMission(baseMission)}だけ進める`,
    },
    C: {
      minutes: minimumMinutes,
      description: `${warmupExample(setup.minimumExample)}だけやる`,
    },
  };
}

function buildInitialRoadmap(setup) {
  const profile = getGoalProfile(setup);

  return orderRoadmapItems([
    { id: "goal", kind: "system", target: ROADMAP_TARGETS.goal, label: shortenGoal(setup.goal), deadline: setup.deadline, note: "" },
    { id: "checkpoint", kind: "system", target: ROADMAP_TARGETS.checkpoint, label: profile.checkpointLabel, deadline: "", note: "" },
    { id: "foundation", kind: "system", target: ROADMAP_TARGETS.foundation, label: profile.foundationLabel, deadline: "", note: "" },
    { id: "week", kind: "system", target: ROADMAP_TARGETS.week, label: `今週: ${profile.weeklyFocus}`, deadline: "", note: "" },
    { id: "next", kind: "system", target: ROADMAP_TARGETS.next, label: `次: ${profile.nextStepLabel}`, deadline: "", note: "" },
  ]);
}

function buildToday(setup, roadmap) {
  return {
    missionTrack: inferTrack(setup.goal, setup.currentLevel),
    missionTitle: inferMissionTitle(setup),
    missionNote: composeMissionNote(roadmap),
    recommendedPlan: "A",
    lastOutcome: null,
    lastRecordedAt: null,
  };
}

function buildSeedState() {
  const today = new Date();
  const deadline = addDays(today, 114);
  const setup = {
    goal: "3か月後に簿記2級に合格",
    deadline: toISODate(deadline),
    currentLevel: "商簿 60% / 工簿 10%",
    flowerType: "sunflower",
    studyMode: "night",
    primaryWindow: "21:30-22:00",
    backupWindow: "12:20-12:35",
    rescueWindow: "23:40-23:42",
    normalMinutes: 30,
    shortMinutes: 10,
    minimumMinutes: 2,
    minimumExample: "単語5個 / 1問だけ解く / 1ページだけ読む",
  };
  const goalId = createGoalId();
  const goalRecord = createGoalRecord({
    id: goalId,
    programStartDate: toISODate(addDays(today, -28)),
    setup,
    logs: buildSeedLogs(today),
    planTuning: buildInitialPlanTuning(),
    replan: buildInitialReplan(),
  });

  return {
    meta: {
      currentView: "today",
      demoMode: true,
      activeGoalId: goalId,
    },
    programStartDate: goalRecord.programStartDate,
    setup: goalRecord.setup,
    roadmap: goalRecord.roadmap,
    today: goalRecord.today,
    plans: goalRecord.plans,
    planTuning: goalRecord.planTuning,
    replan: goalRecord.replan,
    logs: goalRecord.logs,
    activeSession: goalRecord.activeSession,
    goals: [goalRecord],
    tasks: [],
    goalContinuations: {},
    taskLogs: [],
    dailyPlan: normalizeDailyPlan({ capacityMinutes: 60 }),
  };
}

function buildSeedLogs(today) {
  const patterns = [
    { outcome: "A", reason: null },
    { outcome: "miss", reason: "開始前の準備が面倒" },
    { outcome: "B", reason: "疲労" },
    { outcome: "A", reason: null },
    { outcome: "C", reason: "残業で開始が遅れた" },
    { outcome: "A", reason: null },
    { outcome: "miss", reason: "予定変更" },
    { outcome: "A", reason: null },
    { outcome: "miss", reason: "残業で開始が遅れた" },
    { outcome: "B", reason: "タスクが重すぎた" },
    { outcome: "A", reason: null },
    { outcome: "C", reason: "疲労" },
    { outcome: "A", reason: null },
    { outcome: "A", reason: null },
  ];

  return patterns.map((pattern, index) => ({
    date: toISODate(addDays(today, index - (patterns.length - 1))),
    outcome: pattern.outcome,
    reason: pattern.reason,
    missionTitle: "直接原価計算の例題を1セット解く",
    recordedAt: new Date().toISOString(),
  }));
}

function ensureSetupDraft() {
  if (!ui.setupDraft) {
    ui.setupDraft = expandSetup(state.setup);
  }
}

function orderRoadmapItems(items) {
  return items
    .map((item, index) => ({
      ...item,
      target: clamp(Math.round(Number(item.target) || 0), 0, 100),
      __index: index,
    }))
    .sort((left, right) => {
      if (right.target !== left.target) {
        return right.target - left.target;
      }

      const leftOrder = ROADMAP_ID_ORDER.indexOf(left.id);
      const rightOrder = ROADMAP_ID_ORDER.indexOf(right.id);
      if (leftOrder !== rightOrder && (leftOrder !== -1 || rightOrder !== -1)) {
        if (leftOrder === -1) {
          return 1;
        }
        if (rightOrder === -1) {
          return -1;
        }
        return leftOrder - rightOrder;
      }

      return left.__index - right.__index;
    })
    .map(({ __index, ...item }) => item);
}

function deriveRoadmapDeadline(item, setup) {
  const explicitDeadline = String(item.deadline || "").trim();
  if (explicitDeadline) {
    return explicitDeadline;
  }

  const noteMatch = String(item.note || "").match(/(\d{4}-\d{2}-\d{2})/);
  if (noteMatch) {
    return noteMatch[1];
  }

  return item.id === "goal" ? setup.deadline : "";
}

function normalizeRoadmapItems(items, setup) {
  if (Array.isArray(items)) {
    return orderRoadmapItems(items.map((item, index) => ({
      id: typeof item.id === "string" && item.id ? item.id : `custom-${index + 1}`,
      label: String(item.label || `マイルストーン ${index + 1}`),
      deadline: deriveRoadmapDeadline(item, setup),
      note: String(item.note || ""),
      target: Number.isFinite(Number(item.target)) ? Number(item.target) : (ROADMAP_TARGETS[item.id] ?? Math.max(0, 100 - (index * 12))),
      kind: item.kind || (ROADMAP_ID_ORDER.includes(item.id) ? "system" : "custom"),
    })));
  }

  return buildInitialRoadmap(setup);
}

function getWeekRoadmapItem(roadmap) {
  return roadmap.find((item) => item.id === "week")
    || roadmap.find((item) => String(item.label || "").startsWith("今週:"))
    || roadmap[roadmap.length - 2]
    || roadmap[0]
    || null;
}

function getNextRoadmapItem(roadmap) {
  return roadmap.find((item) => item.id === "next")
    || roadmap.find((item) => String(item.label || "").startsWith("次:"))
    || roadmap[roadmap.length - 1]
    || roadmap[0]
    || null;
}

function buildRoadmapDraft(itemId, insertAfterId = "") {
  const items = ui.setupMode === "new_goal"
    ? getSetupDraftRoadmapItems()
    : normalizeRoadmapItems(state.roadmap, state.setup);
  if (itemId) {
    const item = items.find((candidate) => candidate.id === itemId);
    if (item) {
      return {
        mode: "edit",
        id: item.id,
        label: item.label,
        deadline: item.deadline || "",
        note: item.note,
        target: item.target,
        kind: item.kind,
        insertAfterId: "",
      };
    }
  }

  const afterIndex = insertAfterId ? items.findIndex((item) => item.id === insertAfterId) : items.length - 1;
  const afterItem = afterIndex >= 0 ? items[afterIndex] : null;
  const beforeItem = afterIndex >= 0 ? (items[afterIndex + 1] || null) : (items[0] || null);
  const upperTarget = afterItem ? Number(afterItem.target) || 100 : 100;
  const lowerTarget = beforeItem ? Number(beforeItem.target) || 0 : 0;
  let target = clamp(Math.round((upperTarget + lowerTarget) / 2), 0, 100);

  if (afterItem && beforeItem) {
    target = Math.min(upperTarget - 1, Math.max(lowerTarget + 1, target));
  } else if (afterItem && !beforeItem) {
    target = clamp(Math.max(0, upperTarget - 12), 0, 100);
  } else if (!afterItem && beforeItem) {
    target = clamp(Math.min(100, lowerTarget + 12), 0, 100);
  }

  return {
    mode: "new",
    id: "",
    label: "",
    deadline: "",
    note: "",
    target,
    kind: "custom",
    insertAfterId: insertAfterId || (afterItem ? afterItem.id : ""),
  };
}

function commitRoadmapDraft() {
  if (!ui.roadmapDraft) {
    return false;
  }

  const label = (ui.roadmapDraft.label || "").trim();
  if (!label) {
    return false;
  }

  const setupSnapshot = ui.setupMode === "new_goal"
    ? buildSetupSnapshotFromDraft(ui.setupDraft)
    : state.setup;

  const nextItem = {
    id: ui.roadmapDraft.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label,
    deadline: ui.roadmapDraft.id === "goal" ? setupSnapshot.deadline : String(ui.roadmapDraft.deadline || "").trim(),
    note: (ui.roadmapDraft.note || "").trim(),
    target: clamp(Math.round(Number(ui.roadmapDraft.target) || 0), 0, 100),
    kind: ui.roadmapDraft.kind || "custom",
  };
  const items = ui.setupMode === "new_goal"
    ? getSetupDraftRoadmapItems()
    : normalizeRoadmapItems(state.roadmap, state.setup);
  const existingIndex = items.findIndex((item) => item.id === nextItem.id);
  const mergedRoadmap = existingIndex === -1
    ? [...items, nextItem]
    : items.map((item, index) => (index === existingIndex ? { ...item, ...nextItem } : item));
  const nextRoadmap = preserveRoadmapForSetupEdit(mergedRoadmap, setupSnapshot);

  if (ui.setupMode === "new_goal") {
    ensureSetupDraft();
    ui.setupDraft.roadmap = nextRoadmap;
  } else {
    state.roadmap = nextRoadmap;
    state.today.missionNote = composeMissionNote(state.roadmap);
    syncRetargetDraftFromState();
    saveState();
  }
  ui.roadmapDraft = null;
  return true;
}

function deleteRoadmapItem(itemId) {
  const setupSnapshot = ui.setupMode === "new_goal"
    ? buildSetupSnapshotFromDraft(ui.setupDraft)
    : state.setup;
  const nextRoadmap = preserveRoadmapForSetupEdit(
    (ui.setupMode === "new_goal"
      ? getSetupDraftRoadmapItems()
      : normalizeRoadmapItems(state.roadmap, state.setup)).filter((item) => item.id !== itemId),
    setupSnapshot,
  );

  if (ui.setupMode === "new_goal") {
    ensureSetupDraft();
    ui.setupDraft.roadmap = nextRoadmap;
  } else {
    state.roadmap = nextRoadmap;
    state.today.missionNote = composeMissionNote(state.roadmap);
    syncRetargetDraftFromState();
    saveState();
  }
  ui.roadmapDraft = ui.roadmapDraft && ui.roadmapDraft.id === itemId ? null : ui.roadmapDraft;
}

function preserveRoadmapForSetupEdit(currentRoadmap, nextSetup) {
  const items = normalizeRoadmapItems(currentRoadmap, nextSetup);
  const updated = items.length ? items.map((item) => {
    if (item.id === "goal") {
      return {
        ...item,
        kind: "system",
        target: ROADMAP_TARGETS.goal,
        label: shortenGoal(nextSetup.goal),
        deadline: nextSetup.deadline,
        note: "",
      };
    }
    return item;
  }) : buildInitialRoadmap(nextSetup);

  if (!updated.some((item) => item.id === "goal")) {
    updated.unshift({
      id: "goal",
      kind: "system",
      target: ROADMAP_TARGETS.goal,
      label: shortenGoal(nextSetup.goal),
      deadline: nextSetup.deadline,
      note: "",
    });
  }

  return orderRoadmapItems(updated);
}

function buildGoalLibraryDraft(goalId) {
  ensureGoalCollection();
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal) {
    return null;
  }

  return {
    goalId: goal.id,
    goal: goal.setup.goal || "",
    deadline: goal.setup.deadline || "",
    flowerType: normalizeFlowerType(goal.setup.flowerType, goal.setup),
    goalType: goal.setup.goalType === "habit" ? "habit" : "goal",
    bonsaiKey: BONSAI_LIBRARY[goal.setup.bonsaiKey] ? goal.setup.bonsaiKey : "pine",
  };
}

function commitGoalLibraryDraft() {
  if (!ui.goalLibraryDraft) {
    return false;
  }

  ensureGoalCollection();
  const goal = state.goals.find((item) => item.id === ui.goalLibraryDraft.goalId);
  const nextGoalName = String(ui.goalLibraryDraft.goal || "").trim();
  if (!goal || !nextGoalName) {
    return false;
  }

  const isHabitDraft = ui.goalLibraryDraft.goalType === "habit";
  const nextSetup = {
    ...cloneData(goal.setup),
    goal: nextGoalName,
    deadline: isHabitDraft ? "" : normalizeOptionalDate(ui.goalLibraryDraft.deadline),
    currentLevel: "",
    flowerType: normalizeFlowerType(ui.goalLibraryDraft.flowerType, goal.setup),
    goalType: ui.goalLibraryDraft.goalType,
    bonsaiKey: ui.goalLibraryDraft.bonsaiKey || "pine",
  };
  nextSetup.studyDays = normalizeStudyDays(nextSetup.studyDays);

  const nextRoadmap = isHabitDraft ? [] : preserveRoadmapForSetupEdit(goal.roadmap, nextSetup);
  const nextToday = isHabitDraft
    ? { missionTitle: nextSetup.goal, missionNote: "", recommendedPlan: "A", lastOutcome: null, lastRecordedAt: null }
    : { ...cloneData(goal.today || {}), ...buildToday(nextSetup, nextRoadmap) };
  const nextPlans = buildPlans(nextSetup, nextToday.missionTitle);
  const weekly = getWeekRoadmapItem(nextRoadmap);
  const nextStep = getNextRoadmapItem(nextRoadmap);
  const updatedGoal = createGoalRecord({
    id: goal.id,
    programStartDate: goal.programStartDate,
    setup: nextSetup,
    roadmap: nextRoadmap,
    today: nextToday,
    plans: nextPlans,
    planTuning: goal.planTuning,
    replan: {
      ...buildInitialReplan(),
      ...(goal.replan || {}),
      goalDraft: nextSetup.goal,
      currentLevelDraft: "",
      missionDraft: nextToday.missionTitle,
      weekDraft: stripRoadmapPrefix(weekly?.label || "", "今週:"),
      nextDraft: stripRoadmapPrefix(nextStep?.label || "", "次:"),
    },
    logs: goal.logs,
    activeSession: goal.activeSession,
  });

  state.goals = state.goals.map((item) => (item.id === goal.id ? updatedGoal : createGoalRecord(item)));
  if (goal.id === state.meta.activeGoalId) {
    applyGoalRecord(updatedGoal);
    ui.setupDraft = expandSetup(state.setup);
    syncSelectedSessionPlan(true);
  }

  ui.goalLibraryDraft = null;
  saveState();
  return true;
}

function buildNewGoalDraft(setup) {
  const base = expandSetup(setup);
  const draft = {
    ...base,
    goal: "",
    deadline: toISODate(addDays(new Date(), 90)),
    currentLevel: "",
    flowerType: base.flowerType || normalizeFlowerType("", base),
    goalType: "goal",
    bonsaiKey: "pine",
  };

  return {
    ...draft,
    roadmap: buildInitialRoadmap(draft),
  };
}

function expandSetup(setup) {
  const primary = splitWindow(setup.primaryWindow);
  const backup = splitWindow(setup.backupWindow);
  const rescue = splitWindow(setup.rescueWindow);

  return {
    goal: setup.goal,
    deadline: setup.deadline,
    currentLevel: setup.currentLevel,
    studyDays: normalizeStudyDays(setup.studyDays),
    flowerType: normalizeFlowerType(setup.flowerType, setup),
    goalType: setup.goalType === "habit" ? "habit" : "goal",
    quadrant: normalizeGoalQuadrant(setup.quadrant),
    priority: setup.priority,
    bonsaiKey: BONSAI_LIBRARY[setup.bonsaiKey] ? setup.bonsaiKey : "pine",
    studyMode: setup.studyMode,
    primaryStart: primary.start,
    primaryEnd: primary.end,
    backupStart: backup.start,
    backupEnd: backup.end,
    rescueStart: rescue.start,
    rescueEnd: rescue.end,
    normalMinutes: setup.normalMinutes,
    shortMinutes: resolvePlanMinuteValues(setup, setup).shortMinutes,
    minimumMinutes: setup.minimumMinutes,
    minimumExample: setup.minimumExample,
  };
}

function ensureRetargetDraft() {
  if (!state.replan.goalDraft && !state.replan.currentLevelDraft && !state.replan.missionDraft && !state.replan.weekDraft && !state.replan.nextDraft) {
    syncRetargetDraftFromState();
  }
}

function syncRetargetDraftFromState() {
  const roadmap = normalizeRoadmapItems(state.roadmap, state.setup);
  const weekly = getWeekRoadmapItem(roadmap);
  const nextStep = getNextRoadmapItem(roadmap);
  state.replan.goalDraft = state.setup.goal;
  state.replan.currentLevelDraft = "";
  state.replan.missionDraft = state.today.missionTitle;
  state.replan.weekDraft = stripRoadmapPrefix(weekly?.label || "", "今週:");
  state.replan.nextDraft = stripRoadmapPrefix(nextStep?.label || "", "次:");
}

function buildRetargetResult(currentState) {
  const nextSetup = {
    ...currentState.setup,
    goal: (currentState.replan.goalDraft || currentState.setup.goal).trim() || currentState.setup.goal,
    currentLevel: "",
  };
  const currentCustomMilestones = normalizeRoadmapItems(currentState.roadmap, currentState.setup)
    .filter((item) => item.kind === "custom");
  let nextRoadmap = orderRoadmapItems([...buildInitialRoadmap(nextSetup), ...currentCustomMilestones]);
  const weekDraft = stripRoadmapPrefix(currentState.replan.weekDraft || "", "今週:");
  const nextDraft = stripRoadmapPrefix(currentState.replan.nextDraft || "", "次:");

  if (weekDraft) {
    nextRoadmap = nextRoadmap.map((item) => (
      item.id === "week" ? { ...item, label: `今週: ${weekDraft}` } : item
    ));
  }

  if (nextDraft) {
    nextRoadmap = nextRoadmap.map((item) => (
      item.id === "next" ? { ...item, label: `次: ${nextDraft}` } : item
    ));
  }

  const nextToday = buildToday(nextSetup, nextRoadmap);
  const missionDraft = (currentState.replan.missionDraft || "").trim();
  if (missionDraft) {
    nextToday.missionTitle = missionDraft;
  }
  nextToday.missionNote = composeMissionNote(nextRoadmap);

  return {
    setup: nextSetup,
    roadmap: nextRoadmap,
    today: nextToday,
    plans: buildPlans(nextSetup, nextToday.missionTitle),
  };
}

function composeMissionNote(roadmap) {
  const items = Array.isArray(roadmap) ? roadmap : [];
  const weekly = getWeekRoadmapItem(items);
  const nextStep = getNextRoadmapItem(items);
  return `${weekly ? weekly.label : "今週の到達点"}から逆算した1本です。${nextStep ? nextStep.label : "次の一歩は設定から更新できます。"}`;
}

function stripRoadmapPrefix(value, prefix) {
  return String(value || "").replace(new RegExp(`^${prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s*`), "").trim();
}

function commitSetupDraft() {
  const draft = ui.setupDraft;
  const minutes = resolvePlanMinuteValues(draft, state.setup);
  const primaryStart = normalizeTimeValue(draft.primaryStart);
  const primaryEnd = normalizeTimeValue(draft.primaryEnd);

  if (!primaryStart || !primaryEnd) {
    showToast("実施時間は 05:30 のように入力してください。");
    return null;
  }

  if (parseWindow(`${primaryStart}-${primaryEnd}`).start >= parseWindow(`${primaryStart}-${primaryEnd}`).end) {
    showToast("実施時間の終了は開始より後にしてください。");
    return null;
  }

  draft.primaryStart = primaryStart;
  draft.primaryEnd = primaryEnd;
  const primaryWindow = `${primaryStart}-${primaryEnd}`;
  const nextSetup = {
    goal: draft.goal.trim() || state.setup.goal,
    deadline: normalizeOptionalDate(draft.deadline),
    currentLevel: "",
    studyDays: normalizeStudyDays(draft.studyDays),
    flowerType: normalizeFlowerType(draft.flowerType, draft),
    goalType: draft.goalType === "habit" ? "habit" : "goal",
    quadrant: normalizeGoalQuadrant(draft.quadrant),
    priority: draft.priority,
    bonsaiKey: BONSAI_LIBRARY[draft.bonsaiKey] ? draft.bonsaiKey : "pine",
    studyMode: draft.studyMode || "flex",
    primaryWindow,
    backupWindow: primaryWindow,
    rescueWindow: primaryWindow,
    normalMinutes: minutes.normalMinutes,
    shortMinutes: minutes.shortMinutes,
    minimumMinutes: minutes.minimumMinutes,
    minimumExample: (draft.minimumExample || "").trim() || state.setup.minimumExample,
  };

  if (ui.setupMode === "new_goal") {
    syncActiveGoalRecord();
    const isHabitSetup = nextSetup.goalType === "habit";
    const nextRoadmap = isHabitSetup
      ? []
      : preserveRoadmapForSetupEdit(
          Array.isArray(draft.roadmap) ? draft.roadmap : buildInitialRoadmap(nextSetup),
          nextSetup,
        );
    const newGoal = createGoalRecord({
      setup: nextSetup,
      roadmap: nextRoadmap,
      programStartDate: toISODate(new Date()),
      planTuning: buildInitialPlanTuning(),
      replan: buildInitialReplan(),
    });
    state.goals = [newGoal, ...state.goals];
    applyGoalRecord(newGoal);
    state.meta.demoMode = false;
    state.meta.currentView = "setup";
    ui.setupDraft = expandSetup(state.setup);
    ui.roadmapDraft = null;
    ui.setupMode = "edit";
    ui.setupSection = "home";
    saveState();
    return "created";
  }

  const isFreshStart = state.meta.demoMode;
  const isHabitEdit = nextSetup.goalType === "habit";
  state.setup = nextSetup;
  state.roadmap = isHabitEdit
    ? []
    : (isFreshStart ? buildInitialRoadmap(nextSetup) : preserveRoadmapForSetupEdit(state.roadmap, nextSetup));
  state.today = isHabitEdit
    ? { missionTitle: nextSetup.goal, missionNote: "", recommendedPlan: "A", lastOutcome: null, lastRecordedAt: null }
    : buildToday(nextSetup, state.roadmap);
  state.plans = buildPlans(nextSetup, state.today.missionTitle);
  state.meta.currentView = "setup";

  if (isFreshStart) {
    state.logs = [];
    state.programStartDate = toISODate(new Date());
    state.planTuning = buildInitialPlanTuning();
    state.replan = buildInitialReplan();
    state.meta.demoMode = false;
    state.activeSession = null;
    ui.sessionOpen = false;
    ui.finishDraft = null;
  }

  syncRetargetDraftFromState();
  ui.setupDraft = expandSetup(state.setup);
  ui.roadmapDraft = null;
  ui.setupMode = "edit";
  syncSelectedSessionPlan(true);
  saveState();
  return isFreshStart ? "reset" : "updated";
}

function getTrailingEntries(days) {
  return Array.from({ length: days }, (_, index) => {
    const date = toISODate(addDays(new Date(), index - (days - 1)));
    return getDailyLog(date);
  });
}

function getLogsByDate(date) {
  return state.logs
    .filter((entry) => entry.date === date)
    .sort((left, right) => new Date(left.recordedAt) - new Date(right.recordedAt));
}

function getLogEntryById(logId) {
  return state.logs.find((entry) => entry.logId === logId) || null;
}

function getRecentExecutionLogs(limit = 10) {
  return state.logs
    .filter((entry) => isExecutionOutcome(entry.outcome))
    .sort((left, right) => {
      if (left.date !== right.date) {
        return right.date.localeCompare(left.date);
      }
      return new Date(right.recordedAt) - new Date(left.recordedAt);
    })
    .slice(0, limit);
}

function syncTodayLastLogFields() {
  const latestToday = getLogByDate(toISODate(new Date()));
  state.today.lastOutcome = latestToday?.outcome || null;
  state.today.lastRecordedAt = latestToday?.recordedAt || null;
  state.today.lastElapsedSeconds = latestToday ? getLoggedSeconds(latestToday) : null;
}

function removeLatestLogByDate(date) {
  const entries = getLogsByDate(date);
  if (!entries.length) {
    return null;
  }

  const latestEntry = entries[entries.length - 1];
  const index = state.logs.indexOf(latestEntry);
  if (index === -1) {
    return null;
  }

  state.logs.splice(index, 1);
  syncTodayLastLogFields();
  saveState();
  return latestEntry;
}

function getDailyLog(date) {
  const entries = getLogsByDate(date);
  if (!entries.length) {
    return { date, outcome: "none", outcomes: [], logValue: "-", logNote: "", hasExecution: false, reason: null };
  }

  const outcomes = Array.from(new Set(entries.map((entry) => entry.outcome)));
  const hasExecution = outcomes.some((outcome) => ["A", "B", "C"].includes(outcome));
  const primaryOutcome = outcomes.includes("A")
    ? "A"
    : outcomes.includes("B")
      ? "B"
      : outcomes.includes("C")
        ? "C"
        : outcomes.includes("miss")
          ? "miss"
          : "none";

  return {
    date,
    outcome: primaryOutcome,
    outcomes,
    logValue: outcomes.map((outcome) => logSymbol(outcome)).join("+"),
    logNote: outcomes.map((outcome) => logSmallLabel(outcome)).filter(Boolean).join("+"),
    hasExecution,
    reason: entries.findLast((entry) => entry.reason)?.reason || null,
  };
}

function getLogByDate(date) {
  const entries = getLogsByDate(date);
  return entries.length ? entries[entries.length - 1] : null;
}

function topReasons(logs, limit) {
  const counts = logs.reduce((map, entry) => {
    if (!entry.reason) {
      return map;
    }

    map[entry.reason] = (map[entry.reason] || 0) + 1;
    return map;
  }, {});

  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([reason, count]) => ({ reason, count }));
}

function cleanReviewPhrase(value) {
  return String(value || "")
    .replace(/^\u4eca\u9031:\s*/, "")
    .replace(/^\u6b21:\s*/, "")
    .trim();
}

function extractReviewPhrases(value) {
  const cleaned = cleanReviewPhrase(value);
  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/[\u3001\u3002,.\n/\u30fb]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && part.length <= 24);
}

function buildReviewKeywordCloud(logs, limit = 16) {
  const counts = logs.reduce((map, entry) => {
    const phrases = [
      ...extractReviewPhrases(entry.reason),
      ...extractReviewPhrases(entry.progressText),
      ...extractReviewPhrases(entry.reflection),
      ...extractReviewPhrases(entry.milestoneLabel),
    ];

    phrases.forEach((phrase) => {
      map[phrase] = (map[phrase] || 0) + 1;
    });
    return map;
  }, {});

  const ranked = Object.entries(counts)
    .sort((left, right) => right[1] - left[1] || left[0].length - right[0].length)
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));

  const maxCount = ranked.length ? ranked[0].count : 1;
  return ranked.map((item) => ({
    ...item,
    level: maxCount <= 1 ? 1 : Math.max(1, Math.min(4, Math.round(((item.count - 1) / (maxCount - 1)) * 3) + 1)),
  }));
}

function loadState() {
  try {
    const raw = [CURRENT_STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
      .map((key) => localStorage.getItem(key))
      .find((value) => Boolean(value));
    if (!raw) {
      return buildSeedState();
    }

    const parsed = JSON.parse(raw);
    return mergeState(buildSeedState(), parsed);
  } catch (error) {
    return buildSeedState();
  }
}

function mergeState(base, saved) {
  const nextSetup = {
    ...base.setup,
    ...saved.setup,
  };
  nextSetup.studyDays = normalizeStudyDays(nextSetup.studyDays);
  nextSetup.flowerType = normalizeFlowerType(nextSetup.flowerType, nextSetup);
  const nextMinutes = resolvePlanMinuteValues(nextSetup, nextSetup);
  nextSetup.normalMinutes = nextMinutes.normalMinutes;
  nextSetup.shortMinutes = nextMinutes.shortMinutes;
  nextSetup.minimumMinutes = nextMinutes.minimumMinutes;
  const nextRoadmap = Array.isArray(saved.roadmap)
    ? normalizeRoadmapItems(saved.roadmap, nextSetup)
    : base.roadmap;
  const nextToday = {
    ...buildToday(nextSetup, nextRoadmap),
    ...saved.today,
  };
  const nextPlans = buildPlans(nextSetup, nextToday.missionTitle);
  const savedGoals = Array.isArray(saved.goals) ? saved.goals : [];
  const goalCandidates = savedGoals.length
    ? savedGoals
    : [{
        id: saved.meta?.activeGoalId || base.meta.activeGoalId,
        setup: nextSetup,
        plans: saved.plans || nextPlans,
      }];
  const migratedWork = migrateLegacyGoalContinuations(
    saved.tasks || base.tasks,
    goalCandidates,
    saved.goalContinuations || base.goalContinuations,
  );

  return {
    ...base,
    ...saved,
    meta: {
      ...base.meta,
      ...saved.meta,
      currentView: saved.meta?.currentView === "tasks" ? "today" : (saved.meta?.currentView || base.meta.currentView),
    },
    setup: nextSetup,
    roadmap: nextRoadmap,
    today: nextToday,
    plans: {
      A: mergePlanDefinition(nextPlans.A, saved.plans && saved.plans.A),
      B: mergePlanDefinition(nextPlans.B, saved.plans && saved.plans.B),
      C: mergePlanDefinition(nextPlans.C, saved.plans && saved.plans.C),
    },
    planTuning: {
      ...base.planTuning,
      ...(saved.planTuning || {}),
      defaultPlanByDay: {
        ...base.planTuning.defaultPlanByDay,
        ...(saved.planTuning && saved.planTuning.defaultPlanByDay ? saved.planTuning.defaultPlanByDay : {}),
      },
      rescuePrimaryDays: Array.isArray(saved.planTuning && saved.planTuning.rescuePrimaryDays)
        ? saved.planTuning.rescuePrimaryDays
        : base.planTuning.rescuePrimaryDays,
    },
    replan: { ...base.replan, ...(saved.replan || {}) },
    logs: Array.isArray(saved.logs) ? normalizeLogs(saved.logs) : base.logs,
    goals: savedGoals,
    tasks: migratedWork.tasks,
    goalContinuations: filterStaleContinuations(migratedWork.goalContinuations),
    taskLogs: Array.isArray(saved.taskLogs) ? normalizeLogs(saved.taskLogs) : [],
    dailyPlan: normalizeDailyPlan(saved.dailyPlan || base.dailyPlan),
  };
}

function saveState() {
  syncActiveGoalRecord();
  if (!state.meta) state.meta = {};
  state.meta.lastSavedAt = Date.now(); // 最終保存タイムスタンプ（デバイス間競合解決用）
  localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
  if (_supabaseLoadedSuccessfully) {
    scheduleSyncToSupabase(); // Supabase接続済みのときだけ同期（古いデータで上書きを防ぐ）
  }
}

// ナビゲーション状態のみ保存（タイムスタンプ更新・Supabase同期なし）
// タブ切り替えなどのUI操作でタイムスタンプが更新されてデータ競合が起きるのを防ぐ
function saveNavState() {
  localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
}

function exportData() {
  syncActiveGoalRecord();
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `streakbonsai-backup-${toISODate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("データをエクスポートしました。");
}

function importData(file) {
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      state = mergeState(parsed);
      ensureGoalCollection();
      saveState();
      render();
      showToast("データを復元しました。");
    } catch (_err) {
      showToast("ファイルの読み込みに失敗しました。");
    }
  };
  reader.readAsText(file);
}

function restartTickers() {
  startClock();
  startSessionTicker();
}

function startClock() {
  if (ui.clockTimer) {
    window.clearInterval(ui.clockTimer);
  }

  ui.clockTimer = window.setInterval(() => {
    const now = new Date();
    todayLabel.textContent = formatHeaderDate(now);
    const expiredContinuations = state.activeSession
      ? 0
      : expireStaleContinuations(now);
    if (expiredContinuations > 0) {
      ensureDailyPlan();
      saveState();
    }
    if (state.meta.currentView === "today" && !ui.sessionOpen && !state.activeSession && !ui.finishDraft) {
      render();
    }
  }, 60000);
}

function openTimerPiP() {
  if (!window.documentPictureInPicture) {
    alert('フローティングタイマーはChrome 116以上でサポートされています');
    return;
  }
  if (_pipWindow && !_pipWindow.closed) {
    _pipWindow.close();
    _pipWindow = null;
    return;
  }
  window.documentPictureInPicture.requestWindow({ width: 220, height: 130 }).then(function(pipWin) {
    _pipWindow = pipWin;
    var s = pipWin.document.createElement('style');
    s.textContent = '*{margin:0;padding:0;box-sizing:border-box}body{background:#f5f6f2;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:"BIZ UDPGothic","Hiragino Sans","Yu Gothic UI",sans-serif;color:#1f2a25;gap:5px;padding:12px}#pip-goal{font-size:0.68rem;color:#6f7871;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-weight:700}#pip-hourglass{width:38px;height:50px}#pip-hourglass path{fill:none;stroke:#1f2a25;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}#pip-hourglass .sand{fill:#b8994d;stroke:none}#pip-hourglass .stream{stroke:#b8994d;stroke-width:1.35;opacity:.76;animation:flow 1.3s ease-in-out infinite}#pip-hourglass .grain{fill:#b8994d;stroke:none;opacity:0;animation:grain 1.35s linear infinite}#pip-timer{font-size:1.25rem;font-weight:900;letter-spacing:0;line-height:1;color:#1f2a25}@keyframes flow{0%,100%{opacity:.58}45%{opacity:.88}}@keyframes grain{0%{opacity:0;transform:translateY(0)}18%{opacity:.32}82%{opacity:.24}100%{opacity:0;transform:translateY(20px)}}';
    pipWin.document.head.appendChild(s);
    pipWin.document.body.innerHTML = '<div id="pip-goal"></div><svg id="pip-hourglass" viewBox="0 0 64 84" aria-hidden="true"><path d="M20 8H44M20 76H44M24 8C24 26 29 32 32 42C29 52 24 58 24 76M40 8C40 26 35 32 32 42C35 52 40 58 40 76"/><path class="sand" d="M25 22c4 2 10 2 14 0l-4 14h-6l-4-14Z"/><path class="stream" d="M32 38V58"/><circle class="grain" cx="32" cy="38" r="1.4"/><path class="sand" d="M25 66c3-8 11-8 14 0H25Z"/></svg><div id="pip-timer">--:--</div>';
    updatePiP();
    // PiP window is always visible so its setInterval is never throttled
    pipWin.setInterval(function() { updatePiP(); }, 500);
  }).catch(function(e) { console.warn('PiP error:', e); });
}

function updatePiP() {
  if (!_pipWindow) return;
  try {
    if (_pipWindow.closed) { _pipWindow = null; return; }
    var pipDoc = _pipWindow.document;
    var timerEl = pipDoc.getElementById('pip-timer');
    if (!timerEl) return;
    if (state && state.activeSession && state.activeSession.endsAt) {
      var ms = state.activeSession.endsAt - Date.now();
      if (ms <= 0) {
        timerEl.textContent = '時間です';
      } else {
        var sec = Math.ceil(ms / 1000);
        timerEl.textContent = Math.floor(sec / 60) + ':' + (sec % 60 < 10 ? '0' : '') + (sec % 60);
      }
    }
    var goalEl = pipDoc.getElementById('pip-goal');
    if (goalEl && state) goalEl.textContent = isTaskSession() ? (state.activeSession.taskTitle || 'Task') : (state.setup?.goal || '');
  } catch(e) { console.warn('PiP update error:', e); _pipWindow = null; }
}

function closePiP() {
  if (_pipWindow) { try { _pipWindow.close(); } catch(e){} _pipWindow = null; }
}

function startSessionTicker() {
  // Already running correctly — don't reset the interval
  if (ui.sessionTimer && state.activeSession && !ui.finishDraft) {
    return;
  }

  if (ui.sessionTimer) {
    window.clearInterval(ui.sessionTimer);
    ui.sessionTimer = null;
  }

  if (!state.activeSession || ui.finishDraft) {
    return;
  }

  const updateTimerReadout = (remaining) => {
    const timerValue = sessionSheet.querySelector("#session-timer-value");
    if (!timerValue) {
      return false;
    }

    const timerLabel = sessionSheet.querySelector("#session-timer-label");
    const isOvertime = remaining <= 0;
    timerValue.textContent = isOvertime ? "00:00" : formatCountdown(remaining);
    if (timerLabel) {
      timerLabel.textContent = isOvertime ? "予定時間になりました" : "残り時間";
    }
    updateFocusTimerVisual(remaining);
    return true;
  };

  const updateTimerValue = () => {
    const remaining = getRemainingMs(state.activeSession.endsAt);
    updateTimerReadout(remaining);
  };

  updateTimerValue();
  updatePiP();

  ui.sessionTimer = window.setInterval(() => {
    if (!state.activeSession || ui.finishDraft) {
      window.clearInterval(ui.sessionTimer);
      ui.sessionTimer = null;
      return;
    }

    const remaining = getRemainingMs(state.activeSession.endsAt);
    updateTimerReadout(remaining);

    if (remaining <= 0) {
      window.clearInterval(ui.sessionTimer);
      ui.sessionTimer = null;
      triggerTimerHaptic();
      playTempleBell();
      sendTimerEndNotification();
      showToast(isTaskSession() ? "予定時間です。Taskを完了にできます。" : "予定時間です。完了か軽量着地を選べます。");
    }
  }, 1000);
}

function getLoggedSeconds(entry) {
  return Number(entry?.elapsedSeconds || entry?.plannedSeconds || 0);
}

function getManualMilestoneProgress(logs, roadmapItems) {
  return logs.reduce((maxProgress, entry) => {
    const target = Number(entry?.milestoneTarget);
    if (!Number.isFinite(target)) {
      return maxProgress;
    }

    const resolved = entry.milestoneStatus === "complete"
      ? clamp(Math.round(target), 0, 100)
      : resolveWorkingMilestoneProgress(target, roadmapItems);
    return Math.max(maxProgress, resolved);
  }, 0);
}

function resolveWorkingMilestoneProgress(target, roadmapItems) {
  const lowerTarget = roadmapItems
    .map((item) => Number(item.target) || 0)
    .filter((value) => value < target)
    .sort((left, right) => right - left)[0];

  if (Number.isFinite(lowerTarget)) {
    return clamp(Math.round(lowerTarget + Math.max(1, (target - lowerTarget) / 2)), 0, 100);
  }

  return clamp(Math.max(1, Math.round(target * 0.6)), 0, 100);
}

function formatElapsedForInput(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function parseElapsedInput(str) {
  const t = (str || "").trim();
  // "M:SS" format → minutes:seconds
  const colonMatch = t.match(/^(\d{1,3}):(\d{2})$/);
  if (colonMatch) {
    const m = parseInt(colonMatch[1], 10);
    const s = parseInt(colonMatch[2], 10);
    if (s < 60) return m * 60 + s;
  }
  // Plain number → treated as minutes
  const numMatch = t.match(/^(\d{1,4})$/);
  if (numMatch) {
    return parseInt(numMatch[1], 10) * 60;
  }
  return null;
}

function formatLoggedDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}時間${String(minutes).padStart(2, "0")}分`;
  }
  if (minutes > 0 && seconds === 0) {
    return `${minutes}分`;
  }
  if (minutes > 0) {
    return `${minutes}分${String(seconds).padStart(2, "0")}秒`;
  }
  return `${seconds}秒`;
}

function formatRemainingSpan(totalDays) {
  const safeDays = Math.max(0, Math.round(totalDays || 0));
  const months = Math.floor(safeDays / 30);
  const days = safeDays % 30;

  if (months <= 0) {
    return `${days}日`;
  }
  if (days === 0) {
    return `${months}か月`;
  }
  return `${months}か月${days}日`;
}
function buildLogSummary(entry) {
  const parts = [outcomeLabel(entry.outcome)];
  const loggedSeconds = getLoggedSeconds(entry);
  if (loggedSeconds > 0) {
    parts.push(`実行 ${formatLoggedDuration(loggedSeconds)}`);
  }
  if (entry.milestoneLabel) {
    parts.push(`節目 ${entry.milestoneLabel}${entry.milestoneStatus === "complete" ? " 完了" : " 途中"}`);
  }
  if (entry.progressText) {
    parts.push(`到達 ${entry.progressText}`);
  }
  if (entry.reflection) {
    parts.push(`メモ ${entry.reflection}`);
  }
  if (entry.reason) {
    parts.push(`理由 ${entry.reason}`);
  }
  return parts.join(" / ");
}

function formatReviewLogDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()} (${shortWeekday(dateString)})`;
}

function getLatestLoggedEntry() {
  const meaningfulLogs = state.logs.filter((entry) => entry.outcome && entry.outcome !== "none");
  return meaningfulLogs.length ? meaningfulLogs[meaningfulLogs.length - 1] : null;
}

function showToast(message) {
  toastEl.hidden = false;
  toastEl.textContent = message;

  if (ui.toastTimer) {
    window.clearTimeout(ui.toastTimer);
  }

  ui.toastTimer = window.setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}
function isBlankCurrentLevel(currentLevel) {
  const text = (currentLevel || "").trim();
  return !text || /^(何も(していない|してない|なし)|なし|未着手|未設定|ゼロ|0|0%)?[。.\s]*$/.test(text);
}

function getGoalProfile(setup) {
  const goal = (setup.goal || "").trim();
  const weakArea = detectWeakArea(setup.currentLevel);
  const blankLevel = isBlankCurrentLevel(setup.currentLevel);

  if (goal.includes("簿記")) {
    return {
      track: "簿記2級 / 工業簿記",
      missionTitle: "直接原価計算の例題を1セット解く",
      foundationLabel: `${weakArea}を一周`,
      weeklyFocus: weakArea.includes("工") ? "CVP理解" : `${weakArea}の基礎`,
      checkpointLabel: "模試で70%",
      nextStepLabel: "例題1セット",
    };
  }

  if (goal.includes("ITパスポート")) {
    return {
      track: "ITパスポート / 基礎",
      missionTitle: blankLevel ? "用語を10個だけ確認して過去問を3問だけ触る" : "過去問を5問だけ解いて、知らない用語を拾う",
      foundationLabel: blankLevel ? "3分野の全体像を一周" : `${weakArea}を一周`,
      weeklyFocus: blankLevel ? "ストラテジ系の基礎" : `${weakArea}の基礎`,
      checkpointLabel: "模試で700点",
      nextStepLabel: "過去問3問",
    };
  }

  if (goal.includes("英語")) {
    return {
      track: "英語 / 読解",
      missionTitle: "長文を1題だけ読み、要点を3行でまとめる",
      foundationLabel: blankLevel ? "基礎単語を一周" : `${weakArea}を一周`,
      weeklyFocus: blankLevel ? "長文の基礎" : `${weakArea}の基礎`,
      checkpointLabel: "模試で70%",
      nextStepLabel: "長文1題",
    };
  }

  const goalLabel = goal.replace(/に合格する|を達成する|合格|達成/g, "").trim() || "目標";
  return {
    track: blankLevel ? goalLabel : `${goalLabel} / ${weakArea}`,
    missionTitle: blankLevel ? `${goalLabel}に向けて最初の1ユニットに触る` : `${weakArea}の最初の1ユニットに触る`,
    foundationLabel: blankLevel ? "基礎を一周" : `${weakArea}を一周`,
    weeklyFocus: blankLevel ? "基礎に触る" : `${weakArea}の基礎`,
    checkpointLabel: goal.includes("合格") ? "中間チェックを通過" : "中間地点まで進める",
    nextStepLabel: "最初の1ユニット",
  };
}

function inferTrack(goal, currentLevel) {
  return getGoalProfile({ goal, currentLevel }).track;
}

function inferMissionTitle(setup) {
  return getGoalProfile(setup).missionTitle;
}

function detectWeakArea(currentLevel) {
  if (isBlankCurrentLevel(currentLevel)) {
    return "基礎";
  }

  const segments = currentLevel.split("/").map((item) => item.trim()).filter(Boolean);
  if (!segments.length) {
    return "基礎";
  }

  const scoredSegments = segments
    .map((segment) => {
      const match = segment.match(/(\d+)/);
      return match
        ? { label: segment.replace(/\d+%?/, "").trim() || "基礎", score: Number(match[1]) }
        : null;
    })
    .filter(Boolean);

  if (!scoredSegments.length) {
    return "基礎";
  }

  scoredSegments.sort((left, right) => left.score - right.score);
  return scoredSegments[0].label || "基礎";
}

function parseCurrentLevel(currentLevel) {
  if (isBlankCurrentLevel(currentLevel)) {
    return 0;
  }

  const matches = currentLevel.match(/\d+/g);
  if (!matches || !matches.length) {
    return 0;
  }
  const values = matches.map(Number);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
function shortReason(reason) {
  if (reason.includes("残業")) return "残業";
  if (reason.includes("タスク")) return "重い";
  if (reason.includes("準備")) return "準備";
  if (reason.includes("予定")) return "予定";
  if (reason.includes("疲")) return "疲労";
  return reason;
}

function shortenMission(mission) {
  if (mission.includes("1セット")) {
    return mission.replace("1セット", "前半");
  }
  if (mission.includes("解く")) {
    return mission.replace("解く", "前半だけ解く");
  }
  if (mission.includes("読む")) {
    return mission.replace("読む", "最初だけ読む");
  }
  return `${mission}の前半だけ`;
}

function lighterWeeklyFocus(label) {
  const clean = label.replace(/^今週:\s*/, "");
  if (clean.includes("理解")) {
    return clean.replace("理解", "前半");
  }
  return `${clean}の前半`;
}

function microStepFromMission(mission) {
  if (mission.includes("例題")) {
    return "例題1問だけ";
  }
  if (mission.includes("長文")) {
    return "最初の1段落だけ";
  }
  return `${mission}の最初だけ`;
}

function warmupExample(example) {
  if (!example) return "机を開いて2分だけ準備する";
  if (example.includes("1問")) {
    return "公式を1つだけ見返す";
  }
  return "机を開いて2分だけ準備する";
}

function joinExamples(current, addition) {
  return current.includes(addition) ? current : `${current} / ${addition}`;
}

function shortenGoal(goal, limit = 16) {
  const safeGoal = String(goal || "");
  return safeGoal.length > limit ? `${safeGoal.slice(0, limit)}…` : safeGoal;
}

function outcomeLabel(outcome) {
  if (outcome === "A") return "完了";
  if (outcome === "B") return "短く完了";
  if (outcome === "C") return "最小で完了";
  if (outcome === "miss") return "未実施";
  return "未記録";
}

function logSymbol(outcome) {
  if (outcome === "A") return "A";
  if (outcome === "B") return "B";
  if (outcome === "C") return "C";
  if (outcome === "miss") return "未";
  return "-";
}

function logSmallLabel(outcome) {
  if (outcome === "A") return "主";
  if (outcome === "B") return "予";
  if (outcome === "C") return "救";
  if (outcome === "miss") return "休";
  return "";
}

function weekdayLabel(key) {
  const map = {
    Mon: "月曜",
    Tue: "火曜",
    Wed: "水曜",
    Thu: "木曜",
    Fri: "金曜",
    Sat: "土曜",
    Sun: "日曜",
  };
  return map[key] || key;
}

function weekdayShortLabel(key) {
  const map = {
    Mon: "月",
    Tue: "火",
    Wed: "水",
    Thu: "木",
    Fri: "金",
    Sat: "土",
    Sun: "日",
  };
  return map[key] || key;
}

function shortWeekday(dateString) {
  const date = new Date(dateString);
  return ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
}

function weekdayKeyFromDate(date) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
}

function parseWindow(windowValue) {
  const [startText, endText] = windowValue.split("-");
  const [startHour, startMinute] = startText.split(":").map(Number);
  const [endHour, endMinute] = endText.split(":").map(Number);

  return {
    start: startHour * 60 + startMinute,
    end: endHour * 60 + endMinute,
  };
}

function splitWindow(windowValue) {
  if (!windowValue || !windowValue.includes("-")) return { start: "07:00", end: "08:00" };
  const [start, end] = windowValue.split("-");
  return { start, end };
}

function normalizeTimeValue(value) {
  const raw = String(value || "").trim().replace(/[：]/g, ":");
  if (!raw) {
    return "";
  }

  const colonMatch = raw.match(/^(\d{1,2}):(\d{1,2})$/);
  if (colonMatch) {
    const hours = Number(colonMatch[1]);
    const minutes = Number(colonMatch[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
    return "";
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 3 || digits.length === 4) {
    const hours = Number(digits.slice(0, digits.length - 2));
    const minutes = Number(digits.slice(-2));
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  return "";
}

function roundToFive(value) {
  return Math.max(5, Math.round(value / 5) * 5);
}

function diffInDays(target, source) {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(target) - startOfDay(source)) / dayMs);
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toISODate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatHeaderDate(date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]}`;
}

function getRemainingMs(endsAt) {
  return Math.max(0, endsAt - Date.now());
}

function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// =========================================================
// SUPABASE AUTH & SYNC
// =========================================================

let _appInitialized = false;
let _syncTimer = null;
let _realtimeChannel = null;
let _pipWindow = null;
let _supabaseLoadedSuccessfully = false;
let _wakeLock = null;

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    _wakeLock = await navigator.wakeLock.request("screen");
  } catch (e) {
    // 権限拒否やブラウザ非対応は無視
  }
}

function releaseWakeLock() {
  if (_wakeLock) {
    _wakeLock.release().catch(() => {});
    _wakeLock = null;
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendTimerEndNotification() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const goal = (state && state.setup && state.setup.goal) || '集中セッション';
  try {
    new Notification('砂時計', {
      body: goal + '\n予定時間です！',
      icon: '/icon-192.png',
      tag: 'session-end',
      renotify: true
    });
  } catch(e) {}
}

// タイマー終了時のバイブ通知。
// iOS: WKWebView は navigator.vibrate 非対応のため、ネイティブ側に橋渡しする。
// Web / Android: Vibration API をそのまま使う。
function triggerTimerHaptic() {
  try {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
      window.webkit.messageHandlers.haptic.postMessage({ pattern: "alarm" });
      return;
    }
  } catch (e) {}
  try {
    if (navigator.vibrate) {
      navigator.vibrate(500); // 1回だけ震わせる（以前は3連パターン）
    }
  } catch (e) {}
}

// ── 音声（お寺の鐘） ──────────────────────────────────────

let _audioCtx = null;

function _ensureAudioCtx() {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  if (_audioCtx && _audioCtx.state === "suspended") {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

function playTempleBell() {
  try {
    const ctx = _ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const decay = 4.5;

    // お寺の鐘：やや非調波な倍音構成（ブロンズ製鐘の特性）
    const partials = [
      { freq: 120,  amp: 0.55 },
      { freq: 240,  amp: 0.28 },
      { freq: 378,  amp: 0.16 },
      { freq: 510,  amp: 0.09 },
      { freq: 762,  amp: 0.04 },
      { freq: 1020, amp: 0.02 },
    ];

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(0.75, now + 0.015);
    master.gain.exponentialRampToValueAtTime(0.001, now + decay);
    master.connect(ctx.destination);

    partials.forEach(({ freq, amp }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = amp;
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + decay + 0.2);
    });
  } catch (e) {}
}

// ── Supabase ↔ ローカル同期 ──────────────────────────────

async function loadStateFromSupabase(userId, { force = false } = {}) {
  try {
    // モバイル回線対策: 7秒でタイムアウトしてローカルデータで起動
    const fetchPromise = sb
      .from("user_data")
      .select("state")
      .eq("user_id", userId)
      .single();
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ data: null, error: { code: "TIMEOUT" } }), 7000)
    );
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error?.code === "TIMEOUT") {
      console.warn("Supabase load timeout: using local state, will retry");
      // タイムアウトでもフラグを立てて、以降のsaveStateがSupabaseに届くようにする
      _supabaseLoadedSuccessfully = true;
      // 15秒後にバックグラウンドで再試行（他デバイスの最新データを取得する）
      setTimeout(() => _resyncFromSupabase(), 15000);
      return;
    }
    if (error && error.code !== "PGRST116") {
      console.warn("Supabase load error:", error);
      return;
    }

    _supabaseLoadedSuccessfully = true;

    if (data?.state && Object.keys(data.state).length > 0) {
      const supabaseTs = data.state.meta?.lastSavedAt || 0;
      const localTs = state.meta?.lastSavedAt || 0;
      // 実行中の端末を最優先する。SupabaseのSIGNED_INイベントは
      // アプリ復帰時にも届くため、ここで上書きするとタイマーが開始時点へ戻る。
      if (state.activeSession) {
        localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
        if (supabaseTs <= localTs) scheduleSyncToSupabase();
        return;
      }
      // force=true（ログイン時）: Supabaseを常に優先。タイムスタンプ比較はしない。
      // これにより「PCで少し前に操作→スマホで完了→PCでログイン」でも正しく同期される。
      if (force || supabaseTs >= localTs) {
        // Supabaseデータで上書き
        state = mergeState(buildSeedState(), data.state);
        localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
      } else {
        // バックグラウンド再同期時のみ: ローカルが新しければSupabaseに同期
        scheduleSyncToSupabase();
      }
    }
  } catch (err) {
    console.warn("Supabase load error:", err);
  }
}

// タブに戻ったとき・タイムアウト後の再同期
async function _resyncFromSupabase() {
  if (!_appInitialized || state.activeSession) return;
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const prevTs = state.meta?.lastSavedAt || 0;
    await loadStateFromSupabase(user.id);
    if ((state.meta?.lastSavedAt || 0) !== prevTs) {
      safeRender(); // データが更新されたら再描画
    }
  } catch (err) {
    console.warn("Resync error:", err);
  }
}

async function pushStateToSupabase() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  syncActiveGoalRecord();
  try {
    // プッシュ前に競合チェック: Supabaseが新しければローカルを更新してプッシュしない
    const { data: existing } = await sb
      .from("user_data")
      .select("state")
      .eq("user_id", user.id)
      .single();
    const supabaseTs = existing?.state?.meta?.lastSavedAt || 0;
    const localTs = state.meta?.lastSavedAt || 0;
    if (supabaseTs > localTs) {
      // Supabaseの方が新しい（他デバイスで更新あり）→ ローカルに取り込む
      state = mergeState(buildSeedState(), existing.state);
      localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
      safeRender();
      return;
    }
    await sb.from("user_data").upsert(
      { user_id: user.id, state: JSON.parse(JSON.stringify(state)) },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.warn("Supabase sync error:", err);
    // 失敗時は30秒後にリトライ
    setTimeout(() => pushStateToSupabase(), 30000);
  }
}

function scheduleSyncToSupabase() {
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(pushStateToSupabase, 500);
}

// デバイス間リアルタイム同期
function setupRealtimeSync(userId) {
  if (_realtimeChannel) {
    sb.removeChannel(_realtimeChannel);
    _realtimeChannel = null;
  }
  _realtimeChannel = sb.channel("user_data_realtime_" + userId)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "user_data", filter: "user_id=eq." + userId },
      (payload) => {
        if (!payload.new?.state) return;
        if (state.activeSession) return;
        const remoteTs = payload.new.state.meta?.lastSavedAt || 0;
        const localTs = state.meta?.lastSavedAt || 0;
        if (remoteTs > localTs) {
          state = mergeState(buildSeedState(), payload.new.state);
          localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
          safeRender();
        }
      }
    )
    .subscribe();
}

// ── Auth UI ──────────────────────────────────────────────

const _authOverlay = document.querySelector("#auth-overlay");
const _authForm = document.querySelector("#auth-form");
const _authEmailEl = document.querySelector("#auth-email");
const _authPasswordEl = document.querySelector("#auth-password");
const _authSubmitEl = document.querySelector("#auth-submit");
const _authErrorEl = document.querySelector("#auth-error");
const _authLoadingEl = document.querySelector("#auth-loading");
const _authHintEl = document.querySelector("#auth-hint");
const _authStatusEl = document.querySelector("#auth-status");
const _authTabBtns = Array.from(document.querySelectorAll(".auth-tab"));
let _authMode = "login";

const GUEST_MODE_KEY = 'sb-guest-v1';
const GUEST_BANNER_KEY = 'sb-guest-banner-last';
function isGuestMode() { return localStorage.getItem(GUEST_MODE_KEY) === '1'; }
function showAuthReady() {
  if (!_authOverlay) return;
  _authOverlay.dataset.authState = "ready";
  _authOverlay.hidden = false;
}
function hideAuthOverlay() {
  if (!_authOverlay) return;
  _authOverlay.hidden = true;
}
function startGuestApp() {
  _supabaseLoadedSuccessfully = false;
  hideAuthOverlay();
  if (!_appInitialized) {
    _appInitialized = true;
    init();
  } else {
    render();
  }
}
function enterGuestMode() {
  localStorage.setItem(GUEST_MODE_KEY, '1');
  localStorage.removeItem(GUEST_BANNER_KEY);
  startGuestApp();
}
function updateGuestBanner() {
  const banner = document.getElementById('guest-banner');
  if (!banner) return;
  if (!isGuestMode()) { banner.hidden = true; return; }
  const last = parseInt(localStorage.getItem(GUEST_BANNER_KEY) || '0');
  banner.hidden = (Date.now() - last) < 23 * 60 * 60 * 1000;
}
function dismissGuestBanner() {
  localStorage.setItem(GUEST_BANNER_KEY, String(Date.now()));
  const b = document.getElementById('guest-banner'); if (b) b.hidden = true;
}
function showAuthFromBanner() {
  dismissGuestBanner();
  showAuthReady();
}

function _authShowError(msg) {
  _authErrorEl.textContent = msg;
  _authErrorEl.hidden = false;
}

function _authClearError() {
  _authErrorEl.hidden = true;
  _authErrorEl.textContent = "";
}

function _authSetLoading(on) {
  _authLoadingEl.hidden = !on;
  _authSubmitEl.disabled = on;
}

function _rebindSwitchBtn() {
  const btn = document.querySelector("#auth-switch-btn");
  if (btn) {
    btn.addEventListener("click", () =>
      _switchAuthMode(_authMode === "login" ? "signup" : "login")
    );
  }
  const resetBtn = document.querySelector("#auth-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => _switchAuthMode("reset"));
  }
}

function _switchAuthMode(mode) {
  _authMode = mode;
  _authClearError();

  // パスワードリセットリンクを1回だけ作成
  if (!document.querySelector("#auth-reset-link")) {
    const p = document.createElement("p");
    p.className = "auth-hint";
    p.id = "auth-reset-link";
    p.innerHTML = `<button type="button" class="auth-switch" id="auth-reset-btn">パスワードをお忘れの方はこちら</button>`;
    _authHintEl.insertAdjacentElement("afterend", p);
  }
  const resetLink = document.querySelector("#auth-reset-link");

  if (mode === "login") {
    _authSubmitEl.textContent = "ログイン";
    _authTabBtns.forEach(b => b.classList.toggle("is-active", b.dataset.authTab === "login"));
    _authHintEl.innerHTML = `アカウントをお持ちでないですか？ <button type="button" class="auth-switch" id="auth-switch-btn">新規登録はこちら</button>`;
    resetLink.hidden = false;
  } else if (mode === "signup") {
    _authSubmitEl.textContent = "新規登録";
    _authTabBtns.forEach(b => b.classList.toggle("is-active", b.dataset.authTab === "signup"));
    _authHintEl.innerHTML = `すでにアカウントをお持ちの方は <button type="button" class="auth-switch" id="auth-switch-btn">ログインはこちら</button>`;
    resetLink.hidden = true;
  } else if (mode === "reset") {
    _authSubmitEl.textContent = "リセットメールを送る";
    _authTabBtns.forEach(b => b.classList.remove("is-active"));
    _authHintEl.innerHTML = `<button type="button" class="auth-switch" id="auth-switch-btn">← ログインに戻る</button>`;
    resetLink.hidden = true;
  }
  _rebindSwitchBtn();
}

// タブボタンのイベント
_authTabBtns.forEach(btn => {
  btn.addEventListener("click", () => _switchAuthMode(btn.dataset.authTab));
});

// フォーム送信
document.getElementById('auth-guest-btn')?.addEventListener('click', enterGuestMode);

_authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  _authClearError();
  const email = _authEmailEl.value.trim();
  const password = _authPasswordEl.value;
  _authSetLoading(true);
  try {
    if (_authMode === "login") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Credential Management API: Chromeにパスワード保存を促す
      if (window.PasswordCredential) {
        try {
          const cred = new PasswordCredential({ id: email, password });
          await navigator.credentials.store(cred);
        } catch (_) {}
      }
    } else if (_authMode === "signup") {
      const { error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      _authShowError("確認メールを送りました。メールをご確認のうえログインしてください。");
      return;
    } else if (_authMode === "reset") {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      _authShowError("パスワードリセットメールを送信しました。");
      return;
    }
  } catch (err) {
    _authShowError(err.message || "エラーが発生しました");
  } finally {
    _authSetLoading(false);
  }
});

// ── Auth state の監視 ─────────────────────────────────────

function resumeCachedAppImmediately() {
  if (_appInitialized) {
    return false;
  }

  const hasLocalState = [CURRENT_STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
    .some((key) => Boolean(localStorage.getItem(key)));
  const hasCachedSession = Boolean(localStorage.getItem("streakbonsai-auth-v1"));

  if (!hasLocalState || (!hasCachedSession && !isGuestMode())) {
    return false;
  }

  hideAuthOverlay();
  _appInitialized = true;
  init();
  return true;
}

resumeCachedAppImmediately();

sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    if (!_appInitialized) {
      // ログイン時は必ずSupabaseを優先（force=true）
      await loadStateFromSupabase(session.user.id, { force: true });
      localStorage.removeItem(GUEST_MODE_KEY);
      hideAuthOverlay();
      window.scrollTo(0, 0); // キーボード入力後のスクロールをリセット
      _appInitialized = true;
      init();
      setupRealtimeSync(session.user.id);
      if (screenFrame) screenFrame.scrollTop = 0;
      setTimeout(() => { if (screenFrame) screenFrame.scrollTop = 0; }, 100);
    } else if (event === "SIGNED_IN") {
      // SIGNED_INはアプリ復帰時にも発火する。初回起動後は新しい側だけを採用する。
      const beforeSync = state.meta?.lastSavedAt || 0;
      await loadStateFromSupabase(session.user.id);
      localStorage.removeItem(GUEST_MODE_KEY);
      hideAuthOverlay();
      window.scrollTo(0, 0); // キーボード入力後のスクロールをリセット
      if ((state.meta?.lastSavedAt || 0) !== beforeSync || state.activeSession) render();
      setupRealtimeSync(session.user.id);
      if (screenFrame) screenFrame.scrollTop = 0;
      setTimeout(() => { if (screenFrame) screenFrame.scrollTop = 0; }, 100);
    } else if (event === "INITIAL_SESSION") {
      // 再起動時は端末内の状態を先に表示済み。クラウド確認は操作を止めず背後で行う。
      localStorage.removeItem(GUEST_MODE_KEY);
      hideAuthOverlay();
      setupRealtimeSync(session.user.id);
      const beforeSync = state.meta?.lastSavedAt || 0;
      loadStateFromSupabase(session.user.id).then(() => {
        if ((state.meta?.lastSavedAt || 0) !== beforeSync && !state.activeSession) {
          safeRender();
        }
      });
    }
  } else {
    if (isGuestMode() || sb.__stub) {
      if (_realtimeChannel) { sb.removeChannel(_realtimeChannel); _realtimeChannel = null; }
      startGuestApp();
      return;
    }
    _appInitialized = false;
    if (_realtimeChannel) { sb.removeChannel(_realtimeChannel); _realtimeChannel = null; }
    showAuthReady();
  }
});

// ── ログアウト ────────────────────────────────────────────

let _accountDeletionInProgress = false;

async function deleteAccount() {
  if (_accountDeletionInProgress) return;

  const { data: { user }, error: userError } = await sb.auth.getUser();
  if (userError || !user) {
    showToast("ログイン中のアカウントがありません。");
    return;
  }

  const confirmed = window.confirm(
    "アカウントとクラウド上の記録を完全に削除します。端末内の記録も消去され、元に戻せません。"
  );
  if (!confirmed) return;

  const confirmationText = window.prompt("確認のため「削除」と入力してください。");
  if (confirmationText !== "削除") {
    if (confirmationText !== null) showToast("入力が一致しないため削除しませんでした。");
    return;
  }

  _accountDeletionInProgress = true;
  showToast("アカウントを削除しています…");

  try {
    const { error } = await sb.functions.invoke("delete-account", {
      body: { confirmation: "delete" },
    });
    if (error) throw error;

    clearTimeout(_syncTimer);
    if (_realtimeChannel) {
      sb.removeChannel(_realtimeChannel);
      _realtimeChannel = null;
    }
    try {
      await sb.auth.signOut({ scope: "local" });
    } catch (_) {}

    localStorage.removeItem("streakbonsai-auth-v1");
    localStorage.removeItem(CURRENT_STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(GUEST_MODE_KEY, "1");
    localStorage.removeItem(GUEST_BANNER_KEY);

    state = buildSeedState();
    state.meta.currentView = "today";
    localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
    _supabaseLoadedSuccessfully = false;
    _appInitialized = true;
    hideAuthOverlay();
    render();
    updateGuestBanner();
    showToast("アカウントとクラウド上の記録を削除しました。");
  } catch (err) {
    console.error("Account deletion failed:", err);
    showToast("削除できませんでした。通信を確認して、もう一度お試しください。");
  } finally {
    _accountDeletionInProgress = false;
  }
}

async function signOut() {
  clearTimeout(_syncTimer);
  await sb.auth.signOut();
  localStorage.removeItem(GUEST_MODE_KEY);
  localStorage.removeItem(CURRENT_STORAGE_KEY);
  state = buildSeedState();
  _appInitialized = false;
  showAuthReady();
}

const STORAGE_KEY = "tomosu-state-v1";
const CURRENT_STORAGE_KEY = "streakgarden-state-v1";
const LEGACY_STORAGE_KEYS = [STORAGE_KEY];
const PLAN_RANK = { C: 1, B: 2, A: 3 };
const PLAN_META = {
  A: { label: "Plan A", tag: "通常" },
  B: { label: "Plan B", tag: "短縮" },
  C: { label: "Plan C", tag: "救済" },
};
const REASONS = [
  "残業で開始が遅れた",
  "タスクが重すぎた",
  "開始前の準備が面倒",
  "疲労",
  "予定変更",
  "忘れた",
];
const REPLAN_MODES = {
  lighten_today: "今日を軽くする",
  reset_week: "今週を立て直す",
  break_goal: "目標を分解する",
  retarget_goal: "目標を更新する",
  consult_block: "詰まりを相談する",
};
const SETUP_SECTIONS = {
  goal: {
    label: "目標編集",
    hint: "登録済みを直す",
    title: "目標編集",
    copy: "登録済みの目標をここで編集します。",
  },
  roadmap: {
    label: "Roadmap",
    hint: "節目を整える",
    title: "Roadmap",
    copy: "マイルストーンの追加と調整は設定で行います。",
  },
  schedule: {
    label: "実施時間",
    hint: "いつ動くか",
    title: "実施時間",
    copy: "曜日ごとに、取りかかる時間だけをここで整えます。",
  },
  plan: {
    label: "プランの変更",
    hint: "どこまで軽くするか",
    title: "プラン",
    copy: "通常 / 短縮 / 救済の3段階だけ調整します。",
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
const FLOWER_STAGE_THRESHOLDS = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30];
const FLOWER_STAGE_LABELS = ["種", "芽", "双葉", "茎のび", "つぼみ", "色づき", "咲き始め", "七分咲き", "満開", "押し花"];
const FLOWER_LIBRARY = {
  tulip: {
    label: "チューリップ",
    trait: "短期習慣・毎日コツコツ",
    copy: "小さく始めて、毎日の積み上げで一気に花が開くタイプです。",
    bud: "#f28e7c",
    petal: "#f15b61",
    petalLight: "#ffd6cf",
    center: "#f8d671",
    stem: "#5f9462",
    leaf: "#89bf7d",
    soil: "#c38d68",
  },
  sunflower: {
    label: "ひまわり",
    trait: "大きな目標・長期継続",
    copy: "時間をかけて背が伸び、最後に大きく咲く長期戦向きの花です。",
    bud: "#d89a3e",
    petal: "#f5c94a",
    petalLight: "#fff0ad",
    center: "#7f532d",
    stem: "#5b9452",
    leaf: "#7cb85a",
    soil: "#b27b4b",
  },
  lavender: {
    label: "ラベンダー",
    trait: "整える習慣・心を落ち着ける習慣",
    copy: "静かに伸びて香りが立つように、整える習慣と相性がいい花です。",
    bud: "#8a78d9",
    petal: "#a88cff",
    petalLight: "#e2d7ff",
    center: "#6a54b1",
    stem: "#4f8b61",
    leaf: "#79b28a",
    soil: "#aa7f66",
  },
};

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
  setupDraft: null,
  setupMode: "edit",
  setupSection: "goal",
  goalLibraryDraft: null,
  roadmapDraft: null,
  reviewLogDraft: null,
  reviewLogExpanded: false,
  missPanelOpen: false,
  missReasonDraft: REASONS[0],
  sessionOpen: false,
  selectedSessionPlan: "A",
  finishDraft: null,
  toastTimer: null,
  clockTimer: null,
  sessionTimer: null,
};

init();

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

  if (/整|片付|睡眠|瞑想|呼吸|calm|reset|routine/.test(goalText)) {
    return "lavender";
  }
  if (/毎日|daily|news|英語|5分|習慣/.test(goalText)) {
    return "tulip";
  }
  return "sunflower";
}

function normalizeFlowerType(flowerType, setup = {}) {
  return FLOWER_LIBRARY[flowerType] ? flowerType : inferDefaultFlowerType(setup);
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

function getFlowerTypeMeta(flowerType, setup = {}) {
  const resolvedType = normalizeFlowerType(flowerType, setup);
  return {
    key: resolvedType,
    ...FLOWER_LIBRARY[resolvedType],
  };
}

function getExecutionDatesFromLogs(logs = []) {
  const executed = logs
    .filter((entry) => isExecutionOutcome(entry.outcome))
    .map((entry) => entry.date);
  return [...new Set(executed)].sort();
}

function getFlowerGrowth(logs = []) {
  const executedDays = getExecutionDatesFromLogs(logs).length;
  const stageIndex = FLOWER_STAGE_THRESHOLDS.reduce((currentIndex, threshold, index) => (
    executedDays >= threshold ? index : currentIndex
  ), 0);

  return {
    executedDays,
    stageIndex,
    stageLabel: FLOWER_STAGE_LABELS[stageIndex],
    nextThreshold: FLOWER_STAGE_THRESHOLDS[stageIndex + 1] || null,
  };
}

function getGoalFlowerState(goalRecord) {
  const flower = getFlowerTypeMeta(goalRecord?.setup?.flowerType, goalRecord?.setup);
  const growth = getFlowerGrowth(goalRecord?.logs || []);

  return {
    ...flower,
    ...growth,
  };
}

function createGoalId() {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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
  setup.flowerType = normalizeFlowerType(setup.flowerType, setup);
  const normalizedMinutes = resolvePlanMinuteValues(setup, setup);
  setup.normalMinutes = normalizedMinutes.normalMinutes;
  setup.shortMinutes = normalizedMinutes.shortMinutes;
  setup.minimumMinutes = normalizedMinutes.minimumMinutes;
  const roadmap = Array.isArray(config.roadmap)
    ? normalizeRoadmapItems(config.roadmap, setup)
    : buildInitialRoadmap(setup);
  const todayState = {
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
  return [...state.goals].sort((left, right) => {
    if (left.id === state.meta.activeGoalId) {
      return -1;
    }
    if (right.id === state.meta.activeGoalId) {
      return 1;
    }
    return 0;
  });
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
  return listGoals()
    .filter((goal) => isGoalScheduledForDate(goal, date))
    .filter((goal) => !getGoalMissionStateForDate(goal, date).isClosed);
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
  ui.missPanelOpen = false;
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
  if (state.meta.demoMode && state.meta.currentView === "setup") {
    state.meta.currentView = "today";
    saveState();
  }
  syncSelectedSessionPlan(true);
  startClock();
  startSessionTicker();
  bindEvents();
  render();
}

function bindEvents() {
  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
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
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const { action } = target.dataset;

  if (action === "navigate") {
    ui.missPanelOpen = false;
    if (target.dataset.view !== "review") {
      ui.reviewLogDraft = null;
      ui.reviewLogExpanded = false;
    }
    state.meta.currentView = target.dataset.view;
    saveState();
    render();
    return;
  }

  if (action === "open-setup") {
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

  if (action === "start-new-goal") {
    ui.setupMode = "new_goal";
    ui.setupDraft = buildNewGoalDraft(state.setup);
    ui.goalLibraryDraft = null;
    ui.roadmapDraft = null;
    ui.reviewLogDraft = null;
    ui.reviewLogExpanded = false;
    ui.setupSection = target.dataset.section || ui.setupSection || "goal";
    state.meta.currentView = "setup";
    render();
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

  if (action === "select-setup-section") {
    ui.setupSection = target.dataset.section || "goal";
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

  if (action === "select-setup-flower") {
    ensureSetupDraft();
    ui.setupDraft.flowerType = normalizeFlowerType(target.dataset.flowerType, ui.setupDraft);
    render();
    return;
  }

  if (action === "select-goal-library-flower") {
    if (!ui.goalLibraryDraft) {
      return;
    }
    ui.goalLibraryDraft.flowerType = normalizeFlowerType(target.dataset.flowerType, ui.goalLibraryDraft);
    render();
    return;
  }

  if (action === "save-setup") {
    if ((state.meta.demoMode || ui.setupMode === "new_goal") && !ui.setupDraft.goal.trim()) {
      showToast("新しい目標名を入れてください。");
      return;
    }
    const saveResult = commitSetupDraft();
    if (!saveResult) {
      return;
    }
    const conflicts = ui.setupMode === "new_goal" || ui.setupSection !== "schedule"
      ? []
      : getPrimaryWindowRoster(ui.setupDraft).filter((item) => item.overlaps);
    ui.goalLibraryDraft = null;
    render();
    if (saveResult === "created" && conflicts.length) {
      showToast(`目標を追加しました。実施時間は ${conflicts.map((item) => item.label).join(" / ")} と重なっています。`);
    } else if (saveResult === "created") {
      showToast("目標を追加しました。設定画面で確認できます。");
    } else if (saveResult === "reset" && conflicts.length) {
      showToast(`設定を保存しました。実施時間は ${conflicts.map((item) => item.label).join(" / ")} と重なっています。`);
    } else if (saveResult === "reset") {
      showToast("設定を保存してプランを作り直しました。");
    } else if (conflicts.length) {
      showToast(`設定を保存しました。実施時間は ${conflicts.map((item) => item.label).join(" / ")} と重なっています。`);
    } else {
      showToast("設定を保存しました。");
    }
    return;
  }
  if (action === "quick-start-session") {
    const launchPlanKey = syncSelectedSessionPlan();
    ui.selectedSessionPlan = launchPlanKey;
    ui.sessionOpen = true;
    render();
    showToast(`${PLAN_META[launchPlanKey].label}を選びました。開始ボタンで始められます。`);
    return;
  }

  if (action === "launch-session-plan") {
    const goalId = target.dataset.goalId || "";
    if (goalId && goalId !== state.meta.activeGoalId) {
      activateGoal(goalId);
    }

    const planKey = target.dataset.plan;
    if (!state.plans[planKey]) {
      return;
    }

    ui.selectedSessionPlan = planKey;
    ui.sessionOpen = true;
    if (state.activeSession) {
      if (state.activeSession.planKey !== planKey) {
        openFinishDraft(planKey);
      } else {
        ui.finishDraft = null;
      }
    }
    render();
    return;
  }

  if (action === "open-session") {
    const planKey = state.plans?.A ? "A" : getRecommendedPlan(state);
    ui.selectedSessionPlan = planKey;
    ui.sessionOpen = true;
    if (state.activeSession) {
      ui.selectedSessionPlan = state.activeSession.planKey;
    }
    render();
    return;
  }

  if (action === "close-session") {
    ui.sessionOpen = false;
    render();
    return;
  }

  if (action === "select-session-plan") {
    const planKey = target.dataset.plan;
    if (ui.finishDraft) {
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
    beginSession(ui.selectedSessionPlan);
    render();
    showToast(`${PLAN_META[ui.selectedSessionPlan].label}を開始しました。`);
    return;
  }

  if (action === "complete-session") {
    openFinishDraft(state.activeSession ? state.activeSession.planKey : ui.selectedSessionPlan);
    render();
    return;
  }

  if (action === "downgrade-session") {
    const basePlan = state.activeSession ? state.activeSession.planKey : ui.selectedSessionPlan;
    const lighterPlan = nextPlanDown(basePlan);
    openFinishDraft(lighterPlan);
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
    startSessionTicker();
    render();
    return;
  }

  if (action === "lighten-today") {
    state.today.recommendedPlan = nextPlanDown(getRecommendedPlan(state));
    syncSelectedSessionPlan(true);
    saveState();
    render();
    showToast(`今日は${PLAN_META[state.today.recommendedPlan].label}から始める設定にしました。`);
    return;
  }

  if (action === "toggle-miss-panel") {
    ui.missPanelOpen = !ui.missPanelOpen;
    render();
    return;
  }

  if (action === "select-miss-reason") {
    ui.missReasonDraft = target.dataset.reason;
    render();
    return;
  }

  if (action === "confirm-miss") {
    recordLog("miss", ui.missReasonDraft);
    ui.missPanelOpen = false;
    render();
    showToast("未実施として記録しました。明日の復帰を主役にします。");
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

    if (action === "manual-log") {
    recordLog(target.dataset.outcome, null);
    render();
    showToast("手動で記録しました。");
    return;
  }

  if (action === "undo-log-date") {
    const removed = removeLatestLogByDate(target.dataset.date || toISODate(new Date()));
    render();
    showToast(removed ? `取り消しました: ${buildLogSummary(removed)}` : "取り消せる記録がありません。");
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

  if (target.matches("[data-finish-field]")) {
    if (!ui.finishDraft) {
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

function render() {
  let currentView = state.meta.currentView || "today";
  if (currentView === "replan") {
    currentView = "setup";
    state.meta.currentView = "setup";
    ui.setupMode = ui.setupMode === "new_goal" ? "new_goal" : "edit";
    ui.setupSection = SETUP_SECTIONS[ui.setupSection] ? ui.setupSection : "goal";
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
    setupShortcut.dataset.section = "goal";
  }

  if (screenFrame) {
    screenFrame.classList.toggle("is-setup", currentView === "setup");
  }
  if (bottomNav) {
    bottomNav.hidden = currentView === "setup";
  }

  tabbarButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === currentView);
  });

  const screens = {
    setup: renderSetupView(),
    today: renderTodayView(),
    roadmap: renderRoadmapView(),
    review: renderReviewView(),
    garden: renderGardenView(),
  };

  screenRoot.innerHTML = screens[currentView] || screens.today;
  renderSessionSheet();
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
              <p class="goal-window-row__current">現在: ${escapeHtml(formatStudyDays(draft.studyDays))}</p>
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
    : "いまの実施時間は同じ実施曜日の目標と重なっていません。";

  if (!isNewGoal) {
    const rows = getEditableScheduleRows(draft);
    return `
      <div class="stack setup-schedule-roster">
        <div class="setup-section-intro">
          <h3 class="section-title">実施時間一覧</h3>
          <p class="section-copy">この一覧から編集したい目標を開いて、そのまま実施時間と曜日を編集できます。</p>
        </div>
        <div class="goal-window-list goal-window-list--editable">
          ${rows.map((item) => renderEditableScheduleRow(item, draft)).join("")}
        </div>
        <p class="setup-warning ${warningClass}">${escapeHtml(warningText)}</p>
      </div>
    `;
  }

  return `
    <div class="stack setup-schedule-roster">
      <div class="setup-section-intro">
        <h3 class="section-title">ほかの目標の実施時間</h3>
        <p class="section-copy">同じ実施時間を避けると、1日に抱える入口の多さが見えます。</p>
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
      <p class="setup-warning ${warningClass}">${escapeHtml(warningText)}</p>
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
          <p class="section-copy">Today には、今日の曜日に合う目標だけ表示します。</p>
          <div class="weekday-choice-row">
            ${WEEKDAY_KEYS.map((weekdayKey) => renderWeekdayChip(weekdayKey, draft.studyDays)).join("")}
          </div>
          <p class="section-copy">現在: ${escapeHtml(formatStudyDays(draft.studyDays))}</p>
        </div>
        ${renderWindowField("実施時間", "primaryStart", "primaryEnd", draft.primaryStart, draft.primaryEnd)}
      </div>
    `;
  }

  if (section === "roadmap") {
    return `
      <div class="stack">
        <div class="setup-section-intro">
          <h3 class="section-title">マイルストーン</h3>
          <p class="section-copy">Roadmap 画面は表示だけにして、編集はここでまとめます。</p>
        </div>
        ${renderRoadmapMilestoneList(buildEditableRoadmapPreview(), { editable: true })}
      </div>
    `;
  }

  if (section === "plan") {
    return `
      <div class="plan-list">
        ${renderEditablePlanCard("A", "normalMinutes", draft.normalMinutes, "いつもの標準プラン")}
        ${renderEditablePlanCard("B", "shortMinutes", draft.shortMinutes, "少し軽くする短縮プラン")}
        ${renderEditablePlanCard("C", "minimumMinutes", draft.minimumMinutes, "最低限だけ進める救済プラン")}
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

  return `
    <div class="stack">
      <p class="section-copy">保存すると、今の Today は変えずに新しい目標だけ追加します。</p>
      <label class="field">
        <span class="field__label">目標</span>
        <input class="field__control" data-setup-field="goal" type="text" value="${escapeHtml(draft.goal)}" />
      </label>
      <div class="field">
        <span class="field__label">期限（空欄で期限なし）</span>
        <input class="field__control" data-setup-field="deadline" type="date" value="${escapeHtml(draft.deadline)}" />
      </div>
      ${renderFlowerPicker(draft.flowerType, "select-setup-flower")}
      <p class="section-copy">下の設定メニューから Roadmap / 実施時間 / プランもこのまま決められます。</p>
    </div>
  `;
}

function getLaunchPlan(currentState) {
  return currentState.plans?.A ? "A" : Object.keys(currentState.plans || {})[0] || "A";
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
    roadmap: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18V6M5 7.5h9l2 2H19v8.5H8l-3 2"></path>
        <circle cx="5" cy="6" r="1.6"></circle>
        <circle cx="19" cy="18" r="1.6"></circle>
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
          <span class="setup-tab__hint">${escapeHtml(config.hint)}</span>
        </span>
      </span>
    </button>
  `;
}

function renderGoalLibrary() {
  const goals = listGoalsByPrimaryWindow();
  const editingGoalId = ui.goalLibraryDraft ? ui.goalLibraryDraft.goalId : "";
  const intro = ui.setupMode === "new_goal"
    ? "保存すると一覧に追加されます。Today は今の目標のままです。"
    : "登録済みの目標をここで編集します。表示する目標は設定メニュー下の選択タブで切り替えます。";

  return `
    <div class="stack">
      <div class="setup-section-intro goal-library__intro">
        <h3 class="section-title">登録済みの目標</h3>
        <p class="section-copy">${escapeHtml(intro)}</p>
      </div>
      <div class="goal-library">
        ${goals.map((goal) => {
          const isActive = goal.id === state.meta.activeGoalId;
          const isEditing = editingGoalId === goal.id;
          const deadlineText = normalizeOptionalDate(isEditing ? ui.goalLibraryDraft?.deadline : goal.setup.deadline);
          const flower = getGoalFlowerState(goal);
          const meta = `${formatDeadlineBadge(deadlineText)} / 花 ${flower.label}`;
          return `
            <article class="goal-library-card ${isActive ? "is-active" : ""}">
              <div class="goal-library-card__head">
                <strong>${escapeHtml(isEditing ? ui.goalLibraryDraft.goal : goal.setup.goal)}</strong>
                <span class="status-badge ${isActive ? "status-badge--done" : ""}">${isActive ? "表示中" : "保存済み"}</span>
              </div>
              ${isEditing
                ? `
                  <div class="goal-library-card__editor">
                    <label class="field">
                      <span class="field__label">目標</span>
                      <input class="field__control" data-goal-library-field="goal" type="text" value="${escapeHtml(ui.goalLibraryDraft.goal)}" />
                    </label>
                    <label class="field">
                      <span class="field__label">期限（空欄で期限なし）</span>
                      <input class="field__control" data-goal-library-field="deadline" type="date" value="${escapeHtml(ui.goalLibraryDraft.deadline)}" />
                    </label>
                    ${renderFlowerPicker(ui.goalLibraryDraft.flowerType, "select-goal-library-flower", { compact: true })}
                    <div class="goal-library-card__actions">
                      <button type="button" class="soft-button goal-library-card__action" data-action="save-goal-library-edit">保存</button>
                      <button type="button" class="soft-button goal-library-card__action" data-action="cancel-goal-library-edit">閉じる</button>
                    </div>
                  </div>
                `
                : `
                  <p class="goal-library-card__meta">${escapeHtml(meta)}</p>
                  ${isActive ? `<p class="goal-library-card__note">${escapeHtml(isGoalScheduledForDate(goal) ? "この目標は今日の Today に出ます。" : "今日は表示対象外です。")}</p>` : ""}
                  <div class="goal-library-card__actions">
                    <button type="button" class="soft-button goal-library-card__action" data-action="start-goal-library-edit" data-goal-id="${goal.id}">編集</button>
                  </div>
                `}
            </article>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderTodayGoalCard(goal, index) {
  const flower = getGoalFlowerState(goal);
  const missionState = getGoalMissionStateForDate(goal);
  const isActiveGoal = goal.id === state.meta.activeGoalId;
  const selectedPlanKey = isActiveGoal
    ? (goal.activeSession ? goal.activeSession.planKey : "A")
    : "";
  const cardClass = `${index === 0 ? "" : " focus-launch--stacked"} ${isActiveGoal ? "is-active-goal" : "is-inactive-goal"} ${missionState.isClosed ? "is-complete-goal" : "is-pending-goal"}`;

  return `
    <section class="focus-launch focus-launch--minimal${cardClass}" data-action="select-goal" data-goal-id="${goal.id}" role="button" tabindex="0" style="view-transition-name: goal-card-${goal.id}">
      <div class="focus-launch__halo" aria-hidden="true"></div>
      <div class="focus-launch__goal-meta">
        <div class="focus-launch__status-row">
          <span class="status-badge ${escapeHtml(missionState.badgeClass || "")}">${escapeHtml(missionState.isClosed ? "実施済み" : missionState.badge)}</span>
        </div>
        <div class="focus-launch__goal-timing">
          <span class="focus-launch__goal-deadline">${escapeHtml(formatDeadlineBadge(goal.setup.deadline))}</span>
          <span class="focus-launch__goal-slot">実施時間 ${escapeHtml(goal.setup.primaryWindow)}</span>
        </div>
      </div>
      <div class="focus-launch__title-row">
        <h1 class="focus-launch__goal focus-launch__goal--solo">${escapeHtml(goal.setup.goal)}</h1>
        <div class="focus-launch__flower-panel">
          ${renderFlowerArtwork(flower.key, flower.stageIndex, { size: "card" })}
        </div>
      </div>
      <div class="choice-row focus-plan-row focus-plan-row--minimal">
        ${Object.keys(goal.plans)
          .map(
            (planKey) => `
              <button type="button" class="pill-button focus-plan-button ${selectedPlanKey === planKey ? "is-active" : ""}" data-action="launch-session-plan" data-goal-id="${goal.id}" data-plan="${planKey}">
                <span class="focus-plan-button__label">${PLAN_META[planKey].label}</span>
                <span class="focus-plan-button__meta">${PLAN_META[planKey].tag} / ${goal.plans[planKey].minutes}分</span>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderActiveGoalContext(options = {}) {
  const goals = options.sortByPrimaryWindow ? listGoalsByPrimaryWindow() : listGoals();

  return `
    <details class="goal-selector">
      <summary>
        <span class="hero__context goal-selector__current">対象目標: ${escapeHtml(state.setup.goal)}</span>
        <span class="goal-selector__button">選択</span>
      </summary>
      <div class="goal-selector__body">
        ${goals.map((goal) => {
          const isActive = goal.id === state.meta.activeGoalId;
          return `
            <button
              type="button"
              class="goal-selector__option ${isActive ? "is-active" : ""}"
              data-action="activate-goal"
              data-goal-id="${goal.id}"
              ${isActive ? "disabled" : ""}
            >
              <span class="goal-selector__option-title">${escapeHtml(goal.setup.goal)}</span>
              <span class="goal-selector__option-state">${isActive ? "表示中" : "選ぶ"}</span>
            </button>
          `;
        }).join("")}
      </div>
    </details>
  `;
}

function renderSetupView() {
  ensureSetupDraft();
  const draft = ui.setupDraft;
  const isNewGoal = ui.setupMode === "new_goal";
  const activeSectionKey = SETUP_SECTIONS[ui.setupSection] ? ui.setupSection : "goal";
  const activeSection = SETUP_SECTIONS[activeSectionKey];
  const saveLabel = state.meta.demoMode || isNewGoal ? "この内容で始める" : "変更を保存する";
  const sectionTitle = activeSectionKey === "goal" ? (isNewGoal ? "目標追加" : "目標編集") : activeSection.title;
  const newGoalSectionCopy = {
    roadmap: "追加する目標のマイルストーンをここで決めます。",
    schedule: "追加する目標の実施曜日と実施時間をここで決めます。",
    plan: "追加する目標の Plan A / B / C をここで決めます。",
  };
  const sectionCopy = activeSectionKey === "goal"
    ? (isNewGoal ? "今の Today は変えずに、新しい目標を追加します。" : activeSection.copy)
    : (isNewGoal ? newGoalSectionCopy[activeSectionKey] || activeSection.copy : activeSection.copy);
  const showSaveAction = !(activeSectionKey === "goal" && !isNewGoal);
  const setupMenu = [
    renderSetupMenuItem({
      action: "start-new-goal",
      section: "goal",
      label: "目標追加",
      hint: "別の目標を増やす",
      iconKey: "add",
      active: isNewGoal && activeSectionKey === "goal",
    }),
    renderSetupMenuItem({
      action: "edit-current-goal",
      section: "goal",
      label: "目標編集",
      hint: "登録済みを直す",
      iconKey: "goal",
      active: !isNewGoal && activeSectionKey === "goal",
    }),
    renderSetupMenuItem({
      action: "select-setup-section",
      section: "roadmap",
      label: "Roadmap",
      hint: "節目を整える",
      iconKey: "roadmap",
      active: activeSectionKey === "roadmap",
    }),
    renderSetupMenuItem({
      action: "select-setup-section",
      section: "schedule",
      label: "実施時間",
      hint: "いつやるか",
      iconKey: "schedule",
      active: activeSectionKey === "schedule",
    }),
    renderSetupMenuItem({
      action: "select-setup-section",
      section: "plan",
      label: "プラン",
      hint: "A / B / C の幅",
      iconKey: "plan",
      active: activeSectionKey === "plan",
    }),
  ].join("");

  return `
    <section class="screen screen--setup">
      <section class="setup-layout setup-layout--menu">
        <aside class="setup-nav setup-nav--menu">
          <div class="setup-nav__lead">
            <p class="setup-nav__eyebrow">Settings</p>
            <strong>変えたいものを選ぶ</strong>
          </div>
          <div class="setup-nav__list">${setupMenu}</div>
        </aside>

        ${activeSectionKey === "schedule"
          ? ""
          : `
            <div class="setup-layout__selector">
              ${renderActiveGoalContext({ sortByPrimaryWindow: true })}
            </div>
          `}

        <section class="panel panel--warm stack setup-stage">
          <div class="setup-stage__header">
            ${renderSetupSectionIcon(activeSectionKey)}
            <div class="setup-stage__copy">
              ${isNewGoal ? '<span class="status-badge status-badge--accent">追加中</span>' : ""}
              <h2 class="panel__title">${escapeHtml(sectionTitle)}</h2>
            </div>
          </div>
          ${renderSetupSectionBody(activeSectionKey, draft)}
        </section>
      </section>

      ${showSaveAction
        ? `<div class="action-row">
            <button type="button" class="action-button action-button--primary" data-action="save-setup">${escapeHtml(saveLabel)}</button>
          </div>`
        : ""}
    </section>
  `;
}

function renderTodayView() {
  const goals = listGoalsForToday();
  const todayKey = weekdayKeyFromDate(new Date());

  return `
    <section class="screen screen--today screen--today-minimal">
      ${renderActiveGoalContext()}
      <div class="focus-goal-list">
        ${goals.length
          ? goals.map((goal, index) => renderTodayGoalCard(goal, index)).join("")
          : `
            <section class="panel panel--warm stack">
              <span class="status-badge">今日は${escapeHtml(weekdayLabel(todayKey))}</span>
              <h2 class="section-title">今日は表示する目標がありません</h2>
              <p class="section-copy">実施曜日が ${escapeHtml(weekdayLabel(todayKey))} の目標だけを Today に表示しています。設定の実施時間から曜日を変更できます。</p>
            </section>
          `}
      </div>
    </section>
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

function computeCatchUpRecommendation(currentState) {
  const activeDays = Math.min(7, Math.max(1, diffInDays(new Date(), new Date(currentState.programStartDate)) + 1));
  const normalSeconds = Math.max(600, (Number(currentState.setup.normalMinutes) || 30) * 60);
  const actualSeconds = getTrailingEntries(activeDays).reduce((sum, entry) => (
    isExecutionOutcome(entry.outcome) ? sum + getLoggedSeconds(entry) : sum
  ), 0);
  const targetSeconds = normalSeconds * activeDays;
  const shortfallSeconds = Math.max(0, targetSeconds - actualSeconds);

  if (shortfallSeconds < Math.max(currentState.plans.C.minutes * 60, 60)) {
    return null;
  }

  const candidatePlan = shortfallSeconds >= normalSeconds * 0.9
    ? "A"
    : shortfallSeconds >= currentState.plans.B.minutes * 60
      ? "B"
      : "C";
  const windowCap = inferWindowState(currentState).planCap || "A";
  const planKey = downgradePlan(candidatePlan, windowCap);

  return {
    planKey,
    shortfallSeconds,
    shortfallLabel: formatLoggedDuration(shortfallSeconds),
  };
}

function renderRoadmapMilestoneCard(milestone, index, options = {}) {
  const editable = Boolean(options.editable);
  const deadlineLabel = milestone.deadline ? `期限 ${milestone.deadline}` : "";
  const targetLabel = Number.isFinite(Number(milestone.target)) ? `全体目安 ${Math.round(Number(milestone.target))}%` : "";

  return `
    <article class="milestone ${milestone.isActive ? "is-active" : ""} ${milestone.isComplete ? "is-complete" : ""}" data-step="${index + 1}">
      <div class="panel milestone__panel">
        <div class="milestone__head">
          <span class="milestone__label">${escapeHtml(milestone.label)}</span>
          ${targetLabel ? `<span class="milestone__target">${escapeHtml(targetLabel)}</span>` : ""}
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

  return `
    <div class="milestone-list ${editable ? "milestone-list--editable" : ""}">
      ${roadmap.milestones.map((milestone, index) => {
        if (!editable) {
          return renderRoadmapMilestoneCard(milestone, index, options);
        }

        const isEditing = Boolean(ui.roadmapDraft && ui.roadmapDraft.mode === "edit" && ui.roadmapDraft.id === milestone.id);
        return `
          ${isEditing ? renderRoadmapEditor(index + 1) : renderRoadmapMilestoneCard(milestone, index, options)}
          ${renderRoadmapInsertSlot(milestone.id)}
        `;
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
          <p class="roadmap-focus-card__metric-label">全体進捗 ${overallProgress}%</p>
        </div>
        <div class="roadmap-focus-card__value-block">
          <strong class="roadmap-focus-card__value">${achievementRate}%</strong>
          <span class="roadmap-focus-card__value-label">節目進捗</span>
        </div>
      </div>

      <div class="bullet-list">
        <div class="bullet-row">
          <div class="bullet">
            <span class="bullet__fill bullet__fill--sage" style="--fill:${achievementRate}%"></span>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderRoadmapView() {
  const roadmap = computeRoadmap(state);

  return `
    <section class="screen">
      <div class="hero">
        <div class="hero__sticky">
          <div class="hero__accent"></div>
          ${renderActiveGoalContext()}
        </div>
      </div>

      <section class="panel panel--cool stack">
        <div class="status-strip">
          <span class="status-badge">${roadmap.daysRemaining == null ? "期限なし" : `残り ${formatRemainingSpan(roadmap.daysRemaining)}`}</span>
        </div>
        <div>
          <h2 class="section-title">現在の達成状況</h2>
        </div>
        ${renderRoadmapCurrentStatus(roadmap)}
        <div>
          <h2 class="section-title">全体のロードマップ</h2>
        </div>
        ${renderRoadmapMilestoneList(roadmap)}
      </section>
    </section>
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
  const metrics = computeReviewMetrics(state);
  const totalStudySeconds = state.logs.reduce((sum, entry) => (
    isExecutionOutcome(entry.outcome) ? sum + getLoggedSeconds(entry) : sum
  ), 0);
  const weekLog = getTrailingEntries(7);
  const activeGoal = getActiveGoalRecord();

  return `
    <section class="screen">
      <div class="hero">
        <div class="hero__sticky">
          <div class="hero__accent"></div>
          ${renderActiveGoalContext()}
        </div>
      </div>

      <section class="panel stack">
        <div class="metric-grid">
          ${renderMetricCard("7日実行率", metrics.executionRate)}
          ${renderMetricCard("トータル勉強時間", formatLoggedDuration(totalStudySeconds), "")}
        </div>
      </section>

      ${activeGoal ? renderReviewPotCard(activeGoal) : ""}

      <section class="panel stack">
        <div class="log-grid">
          ${renderReviewLogGrid(weekLog)}
        </div>
      </section>

      ${renderReviewLogEditPanel()}
    </section>
  `;
}

function getActiveGoalRecord() {
  const goals = listGoals();
  return goals.find((goal) => goal.id === state.meta.activeGoalId) || goals[0] || null;
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

function renderReviewPotCard(goal) {
  const flower = getGoalFlowerState(goal);
  const roadmap = computeRoadmap(goal);
  const todayLog = getGoalLogByDate(goal, toISODate(new Date()));
  const missionState = getGoalMissionStateForDate(goal);
  const statusCopy = missionState.isClosed && todayLog
    ? buildLogSummary(todayLog)
    : `${flower.label} / ${flower.stageLabel}`;

  return `
    <section class="panel panel--garden stack">
      <div class="review-pot-card">
        <div class="review-pot-card__copy">
          <div class="status-strip">
            <span class="status-badge status-badge--done">選択中</span>
            <span class="status-badge ${isGoalAchieved(goal) ? "status-badge--done" : "status-badge--accent"}">${isGoalAchieved(goal) ? "達成済み" : "育成中"}</span>
          </div>
          <div class="stack stack--tight">
            <h2 class="section-title">${escapeHtml(goal.setup.goal)}</h2>
            <p class="section-copy">${escapeHtml(statusCopy)}</p>
            ${todayLog && isExecutionOutcome(todayLog.outcome)
              ? `<div class="review-pot-card__actions">
                  <button type="button" class="ghost-button" data-action="open-review-log-editor" data-log-id="${escapeHtml(todayLog.logId)}">この記録を修正</button>
                </div>`
              : ""}
          </div>
        </div>
        <div class="review-pot-card__scene" aria-hidden="true">
          <div class="review-pot-card__glow"></div>
          <div class="review-pot-card__flower">
            ${renderFlowerArtwork(flower.key, flower.stageIndex, { size: "review-pot", showSoil: false })}
          </div>
          <div class="review-pot-card__pot"></div>
        </div>
        <div class="review-pot-card__facts">
          <div class="review-pot-card__fact">
            <span>咲き方</span>
            <strong>${escapeHtml(flower.stageLabel)}</strong>
          </div>
          <div class="review-pot-card__fact">
            <span>育成日数</span>
            <strong>${escapeHtml(`${flower.executedDays}日`)}</strong>
          </div>
          <div class="review-pot-card__fact">
            <span>全体進捗</span>
            <strong>${escapeHtml(`${roadmap.learningProgress}%`)}</strong>
          </div>
        </div>
      </div>
    </section>
  `;
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
          <p class="review-log-card__meta">${escapeHtml(`${outcomeLabel(entry.outcome)} / 実行 ${formatLoggedDuration(getLoggedSeconds(entry))}`)}</p>
        </div>
        <button type="button" class="ghost-button" data-action="open-review-log-editor" data-log-id="${escapeHtml(entry.logId)}">修正</button>
      </div>
      ${detailParts.length ? `<p class="review-log-card__detail">${escapeHtml(detailParts.join(" / "))}</p>` : ""}
    </article>
  `;
}

function renderGardenView() {
  const goals = listGoals();
  const growingGoals = goals.filter((goal) => !isGoalAchieved(goal));
  const archivedGoals = goals.filter((goal) => isGoalAchieved(goal));

  return `
    <section class="screen">
      <div class="hero">
        <div class="hero__sticky">
          <div class="hero__accent"></div>
          <div class="status-strip">
            <span class="status-badge">育成中 ${growingGoals.length}</span>
            <span class="status-badge status-badge--done">達成済み ${archivedGoals.length}</span>
          </div>
        </div>
      </div>

      ${renderGardenShelfSection("今育てている花", "進行中の目標だけをまとめています。選ぶと Today / Review の対象目標が切り替わります。", growingGoals, { emptyCopy: "まだ育成中の花はありません。" })}
      ${renderAchievementGardenSection("目標達成した花", "達成した花はこの庭に植えて、咲いた記録を残していきます。", archivedGoals, { emptyCopy: "まだ達成した花はありません。" })}
    </section>
  `;
}

function renderGardenShelfSection(title, copy, goals, options = {}) {
  if (!goals.length) {
    return `
      <section class="panel stack">
        <div>
          <h2 class="section-title">${escapeHtml(title)}</h2>
          <p class="section-copy">${escapeHtml(copy)}</p>
        </div>
        <p class="preview-empty">${escapeHtml(options.emptyCopy || "まだありません。")}</p>
      </section>
    `;
  }

  return `
    <section class="panel stack">
      <div>
        <h2 class="section-title">${escapeHtml(title)}</h2>
        <p class="section-copy">${escapeHtml(copy)}</p>
      </div>
      <div class="garden-shelf">
        ${goals.map((goal) => renderGardenShelfCard(goal, options)).join("")}
      </div>
    </section>
  `;
}

function renderGardenShelfCard(goal, options = {}) {
  const flower = getGoalFlowerState(goal);
  const roadmap = computeRoadmap(goal);
  const completed = options.completed === true || isGoalAchieved(goal);
  const isActive = goal.id === state.meta.activeGoalId;

  return `
    <button
      type="button"
      class="garden-card ${completed ? "is-complete" : ""} ${isActive ? "is-active" : ""}"
      data-action="activate-goal"
      data-goal-id="${escapeHtml(goal.id)}"
      ${isActive ? "disabled" : ""}
    >
      <div class="garden-card__art" aria-hidden="true">
        <div class="garden-card__glow"></div>
        <div class="garden-card__flower">
          ${renderFlowerArtwork(flower.key, flower.stageIndex, { size: "garden-card", showSoil: false })}
        </div>
        <div class="garden-card__pot"></div>
      </div>
      <div class="garden-card__body">
        <div class="garden-card__head">
          <strong class="garden-card__title">${escapeHtml(goal.setup.goal)}</strong>
          <span class="status-badge ${completed ? "status-badge--done" : isActive ? "status-badge--done" : ""}">${completed ? "達成済み" : isActive ? "選択中" : "育成中"}</span>
        </div>
        <p class="garden-card__meta">${escapeHtml(`${flower.label} / ${flower.stageLabel}`)}</p>
        <p class="garden-card__meta">${escapeHtml(`育成 ${flower.executedDays}日 / 進捗 ${roadmap.learningProgress}%`)}</p>
      </div>
    </button>
  `;
}

function renderAchievementGardenSection(title, copy, goals, options = {}) {
  if (!goals.length) {
    return `
      <section class="panel panel--garden stack">
        <div>
          <h2 class="section-title">${escapeHtml(title)}</h2>
          <p class="section-copy">${escapeHtml(copy)}</p>
        </div>
        <p class="preview-empty">${escapeHtml(options.emptyCopy || "まだありません。")}</p>
      </section>
    `;
  }

  const beds = Array.from({ length: Math.ceil(goals.length / 3) }, (_, index) => goals.slice(index * 3, index * 3 + 3));
  const sceneClass = beds.length > 1 ? "garden-scene garden-scene--stacked" : "garden-scene";

  return `
    <section class="panel panel--garden stack">
      <div>
        <h2 class="section-title">${escapeHtml(title)}</h2>
        <p class="section-copy">${escapeHtml(copy)}</p>
      </div>
      <div class="${sceneClass}">
        ${beds.map((bedGoals, bedIndex) => renderAchievementGardenPlanter(bedGoals, bedIndex, beds.length)).join("")}
      </div>
    </section>
  `;
}

function renderAchievementGardenPlanter(goals, bedIndex, totalBeds = 1) {
  const scenePosition = totalBeds === 1 ? 50 : Math.round(35 + ((bedIndex / Math.max(1, totalBeds - 1)) * 30));
  const sceneZoom = totalBeds > 1 ? 118 : 100;

  return `
    <section class="garden-planter ${totalBeds > 1 ? "garden-planter--stacked" : ""}" style="--plot-count:${goals.length}; --scene-position:${scenePosition}%; --scene-zoom:${sceneZoom}%;" aria-label="${escapeHtml(`達成花壇 ${bedIndex + 1}`)}">
      <div class="garden-planter__grid">
        ${goals.map((goal) => renderAchievementGardenPlot(goal)).join("")}
      </div>
    </section>
  `;
}

function renderAchievementGardenPlot(goal) {
  const flower = getGoalFlowerState(goal);
  const isActive = goal.id === state.meta.activeGoalId;
  const roadmap = computeRoadmap(goal);

  return `
    <article class="garden-plot ${isActive ? "is-active" : ""}">
      <details class="garden-plot__details">
        <summary class="garden-plot__touch" aria-label="${escapeHtml(`${goal.setup.goal} の詳細を表示`)}">
          <div class="garden-plot__flower">
            ${renderFlowerArtwork(flower.key, flower.stageIndex, { size: "garden", showSoil: false })}
          </div>
        </summary>
        <div class="garden-plot__tooltip" role="note">
          <div class="garden-plot__label">${escapeHtml(goal.setup.goal)}</div>
          <div class="garden-plot__meta">${escapeHtml(`${flower.label} / ${flower.stageLabel}`)}</div>
          <div class="garden-plot__meta">${escapeHtml(`育成 ${flower.executedDays}日 / 進捗 ${roadmap.learningProgress}%`)}</div>
        </div>
      </details>
    </article>
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
            <h2 class="panel__title">目標とRoadmapを更新</h2>
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
        <div>
          <div class="plan-card__label">${PLAN_META[planKey].label} (${PLAN_META[planKey].tag})</div>
          <div class="plan-card__meta">${escapeHtml(hint)}</div>
        </div>
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

function renderFlowerPicker(selectedType, actionName, options = {}) {
  const compact = Boolean(options.compact);
  const currentType = normalizeFlowerType(selectedType);
  const currentFlower = FLOWER_LIBRARY[currentType];

  return `
    <div class="field flower-picker ${compact ? "flower-picker--compact" : ""}">
      <div>
        <span class="field__label">育てる花</span>
        <p class="section-copy">見た目だけでなく、この目標の育て方に合う花を選びます。</p>
        <p class="flower-picker__current">選択中: ${escapeHtml(currentFlower.label)}</p>
      </div>
      <div class="flower-choice-grid ${compact ? "flower-choice-grid--compact" : ""}">
        ${Object.entries(FLOWER_LIBRARY)
          .map(([key, flower]) => `
            <button type="button" class="flower-choice ${currentType === key ? "is-active" : ""}" data-action="${actionName}" data-flower-type="${key}" aria-pressed="${currentType === key ? "true" : "false"}">
              <div class="flower-choice__art">
                ${renderFlowerArtwork(key, 8, { size: compact ? "picker-compact" : "picker" })}
              </div>
              <div class="flower-choice__body">
                <div class="flower-choice__head">
                  <strong class="flower-choice__label">${escapeHtml(flower.label)}</strong>
                  ${currentType === key ? `<span class="flower-choice__selected">選択中</span>` : ""}
                </div>
                <span class="flower-choice__trait">${escapeHtml(flower.trait)}</span>
                <span class="flower-choice__copy">${escapeHtml(flower.copy)}</span>
              </div>
            </button>
          `)
          .join("")}
      </div>
    </div>
  `;
}

function renderFlowerArtwork(flowerType, stageIndex, options = {}) {
  const flower = getFlowerTypeMeta(flowerType);
  const stage = Math.max(0, Math.min(9, Number(stageIndex) || 0));
  const size = options.size || "picker";
  const stageRatio = stage / 9;
  const soilColor = flower.soil;
  const showSoil = options.showSoil !== false;

  const renderers = {
    tulip: renderTulipFlowerSvg,
    sunflower: renderSunflowerFlowerSvg,
    lavender: renderLavenderFlowerSvg,
  };
  const body = (renderers[flower.key] || renderTulipFlowerSvg)(flower, stage, stageRatio);

  return `
    <figure class="flower-illustration flower-illustration--${escapeHtml(size)}" data-flower="${flower.key}">
      <svg viewBox="0 0 120 140" aria-hidden="true" focusable="false">
        ${showSoil ? `<ellipse cx="60" cy="126" rx="34" ry="8" fill="${soilColor}" opacity="0.18"></ellipse>` : ""}
        ${showSoil ? `<path d="M22 126C34 120 42 119 60 119C78 119 88 120 98 126" fill="none" stroke="${soilColor}" stroke-width="5.5" stroke-linecap="round" opacity="0.42"></path>` : ""}
        ${body}
      </svg>
    </figure>
  `;
}

function renderTulipFlowerSvg(flower, stage, stageRatio) {
  const stemTop = 114 - (stageRatio * 52);
  const blossomY = stemTop;
  const budColor = stage >= 5 ? flower.petal : flower.bud;
  const petalHeight = 11 + (stageRatio * 12);
  const openOffset = Math.max(0, stage - 4) * 1.6;
  const leaves = stage >= 2
    ? `
      <path d="M59 102C45 88 41 81 37 64C51 70 57 79 63 95" fill="${flower.leaf}" opacity="0.92"></path>
      <path d="M61 96C73 84 79 76 84 60C72 66 66 75 58 90" fill="${flower.leaf}" opacity="0.85"></path>
    `
    : "";
  const bud = stage >= 3
    ? `
      <ellipse cx="60" cy="${blossomY}" rx="${9 + openOffset * 0.2}" ry="${petalHeight}" fill="${flower.petalLight}" opacity="0.96"></ellipse>
      <ellipse cx="${49 - openOffset * 0.35}" cy="${blossomY + 3}" rx="${7 + openOffset * 0.25}" ry="${petalHeight - 2}" fill="${budColor}" transform="rotate(-16 ${49 - openOffset * 0.35} ${blossomY + 3})"></ellipse>
      <ellipse cx="${71 + openOffset * 0.35}" cy="${blossomY + 3}" rx="${7 + openOffset * 0.25}" ry="${petalHeight - 2}" fill="${budColor}" transform="rotate(16 ${71 + openOffset * 0.35} ${blossomY + 3})"></ellipse>
      <path d="M52 ${blossomY + 14}C56 ${blossomY + 9} 64 ${blossomY + 9} 68 ${blossomY + 14}" fill="${flower.center}" opacity="${stage >= 6 ? "0.95" : "0.38"}"></path>
    `
    : `<ellipse cx="60" cy="112" rx="6" ry="4" fill="${flower.center}" opacity="0.82"></ellipse>`;

  return `
    ${stage >= 1 ? `<path d="M60 120C61 108 60 89 60 ${stemTop + 12}" fill="none" stroke="${flower.stem}" stroke-width="5.2" stroke-linecap="round"></path>` : ""}
    ${leaves}
    ${bud}
  `;
}

function renderSunflowerFlowerSvg(flower, stage, stageRatio) {
  const stemTop = 116 - (stageRatio * 64);
  const blossomY = stemTop;
  const petals = stage >= 5
    ? Array.from({ length: 12 + stage }, (_, index) => {
      const angle = (360 / (12 + stage)) * index;
      return `<ellipse cx="60" cy="${blossomY - 20}" rx="${5 + stageRatio * 1.6}" ry="${12 + stageRatio * 3}" fill="${flower.petal}" transform="rotate(${angle} 60 ${blossomY})"></ellipse>`;
    }).join("")
    : "";

  return `
    ${stage >= 1 ? `<path d="M60 120C60 108 60 85 60 ${stemTop + 10}" fill="none" stroke="${flower.stem}" stroke-width="5.6" stroke-linecap="round"></path>` : ""}
    ${stage >= 2 ? `<path d="M60 96C47 86 43 78 40 63C51 69 57 77 61 90" fill="${flower.leaf}" opacity="0.9"></path>` : ""}
    ${stage >= 3 ? `<path d="M60 86C74 79 79 71 84 56C73 61 66 70 59 80" fill="${flower.leaf}" opacity="0.84"></path>` : ""}
    ${petals}
    <circle cx="60" cy="${stage >= 3 ? blossomY : 112}" r="${stage >= 3 ? 7 + stage * 1.45 : 5}" fill="${stage >= 5 ? flower.center : flower.bud}" stroke="${flower.petalLight}" stroke-width="${stage >= 6 ? "1.6" : "0.8"}"></circle>
  `;
}

function renderLavenderFlowerSvg(flower, stage, stageRatio) {
  const stemTop = 118 - (stageRatio * 58);
  const blossomStart = stemTop - 4;
  const blossomCount = Math.max(0, stage);
  const florets = Array.from({ length: blossomCount }, (_, index) => {
    const y = blossomStart + (index * 5.2);
    const offset = index % 2 === 0 ? -6 : 6;
    return `
      <ellipse cx="${60 + offset}" cy="${y}" rx="${4.4 - Math.min(index * 0.12, 1.6)}" ry="3.8" fill="${stage >= 5 ? flower.petal : flower.bud}" opacity="${0.56 + (index / blossomCount) * 0.4}"></ellipse>
      <ellipse cx="60" cy="${y + 1}" rx="${4.2 - Math.min(index * 0.14, 1.8)}" ry="3.6" fill="${flower.petalLight}" opacity="${stage >= 6 ? "0.72" : "0.38"}"></ellipse>
    `;
  }).join("");

  return `
    ${stage >= 1 ? `<path d="M60 120C60 110 60 86 60 ${stemTop + 18}" fill="none" stroke="${flower.stem}" stroke-width="4.6" stroke-linecap="round"></path>` : ""}
    ${stage >= 2 ? `<path d="M58 104C45 95 42 88 38 76C49 79 55 88 60 98" fill="${flower.leaf}" opacity="0.88"></path>` : ""}
    ${stage >= 3 ? `<path d="M62 96C75 89 79 82 82 70C72 74 67 81 61 90" fill="${flower.leaf}" opacity="0.8"></path>` : ""}
    ${florets}
    ${stage === 0 ? `<ellipse cx="60" cy="113" rx="5.2" ry="3.6" fill="${flower.center}" opacity="0.78"></ellipse>` : ""}
  `;
}

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

function renderSessionSheet() {
  if (!ui.sessionOpen) {
    sessionSheet.hidden = true;
    sessionSheet.innerHTML = "";
    return;
  }

  const livePlanKey = state.plans[ui.selectedSessionPlan] ? ui.selectedSessionPlan : (state.activeSession ? state.activeSession.planKey : "A");
  const displayPlanKey = ui.finishDraft ? ui.finishDraft.outcome : livePlanKey;
  const plan = state.plans[displayPlanKey];
  const remaining = state.activeSession ? getRemainingMs(state.activeSession.endsAt) : plan.minutes * 60 * 1000;
  const overtime = state.activeSession && remaining <= 0;
  const milestoneOptions = normalizeRoadmapItems(state.roadmap, state.setup)
    .map(
      (item) => `<option value="${escapeHtml(item.id)}" ${ui.finishDraft && ui.finishDraft.milestoneId === item.id ? "selected" : ""}>${escapeHtml(item.label)} / 目安 ${item.target}%</option>`,
    )
    .join("");

  sessionSheet.hidden = false;
  sessionSheet.innerHTML = `
    <div class="sheet__backdrop" data-action="close-session"></div>
    <section class="sheet__panel">
      <div class="sheet__grab"></div>
      <div class="stack">
        <div class="choice-row">
          ${Object.keys(state.plans)
            .map(
              (key) => `
                <button type="button" class="pill-button ${displayPlanKey === key ? "is-active" : ""}" data-action="select-session-plan" data-plan="${key}">
                  ${PLAN_META[key].label}<br /><span class="muted">${state.plans[key].minutes}分</span>
                </button>
              `,
            )
            .join("")}
        </div>

        ${
          ui.finishDraft
            ? `
              <div class="panel panel--cool stack">
                <p class="sheet__timer">${formatLoggedDuration(ui.finishDraft.elapsedSeconds)}</p>
                <p class="sheet__caption">実行時間 / 予定 ${formatLoggedDuration(ui.finishDraft.plannedSeconds)} / ${PLAN_META[ui.finishDraft.outcome].label}</p>
              </div>
              <div class="panel stack">
                <h3 class="panel__title">記録の仕上げ</h3>
                <div class="field-grid field-grid--two">
                  <label class="field">
                    <span class="field__label">進んだマイルストーン</span>
                    <select class="field__control" data-finish-field="milestoneId">
                      <option value="">今回は更新しない</option>
                      ${milestoneOptions}
                    </select>
                  </label>
                  <label class="field">
                    <span class="field__label">その節目の扱い</span>
                    <select class="field__control" data-finish-field="milestoneStatus">
                      <option value="working" ${ui.finishDraft.milestoneStatus === "working" ? "selected" : ""}>まだ途中</option>
                      <option value="complete" ${ui.finishDraft.milestoneStatus === "complete" ? "selected" : ""}>ここまで完了</option>
                    </select>
                  </label>
                </div>
                <label class="field">
                  <span class="field__label">ひとこと</span>
                  <textarea data-finish-field="reflection" placeholder="任意。気づきがあれば一言だけ">${escapeHtml(ui.finishDraft.reflection)}</textarea>
                </label>
              </div>
            `
            : `
              <div class="panel panel--cool">
                <p class="sheet__timer" id="session-timer-value">${overtime ? "時間です" : formatCountdown(remaining)}</p>
              </div>
            `
        }

        <div class="sheet__actions">
          ${
            ui.finishDraft
              ? `
                <button type="button" class="action-button action-button--primary" data-action="save-finish-log">記録して閉じる</button>
                <button type="button" class="soft-button" data-action="cancel-finish">タイマーに戻る</button>
              `
              : state.activeSession
                ? `
                  <button type="button" class="action-button action-button--primary" data-action="complete-session">完了を記録する</button>
                  <button type="button" class="action-button" data-action="downgrade-session">もっと軽くして着地する</button>
                  <button type="button" class="soft-button" data-action="close-session">閉じる</button>
                `
                : `
                  <button type="button" class="action-button action-button--primary" data-action="begin-session">このプランで始める</button>
                  <button type="button" class="soft-button" data-action="close-session">あとで</button>
                `
          }
        </div>
      </div>
    </section>
  `;
}

function openFinishDraft(planKey) {
  ui.selectedSessionPlan = planKey;
  const elapsedSeconds = state.activeSession
    ? Math.max(1, Math.round((Date.now() - state.activeSession.startedAt) / 1000))
    : state.plans[planKey].minutes * 60;
  const roadmap = computeRoadmap(state);

  ui.finishDraft = {
    outcome: planKey,
    elapsedSeconds,
    plannedSeconds: state.plans[planKey].minutes * 60,
    progressText: "",
    reflection: "",
    milestoneId: "",
    milestoneStatus: "working",
  };

  if (ui.sessionTimer) {
    window.clearInterval(ui.sessionTimer);
    ui.sessionTimer = null;
  }
}

function saveFinishDraft() {
  if (!ui.finishDraft) {
    return;
  }

  recordLog(ui.finishDraft.outcome, null, ui.finishDraft);
  ui.finishDraft = null;
  ui.sessionOpen = false;
  state.activeSession = null;
  saveState();
}

function beginSession(planKey) {
  const now = Date.now();
  state.activeSession = {
    planKey,
    startedAt: now,
    endsAt: now + state.plans[planKey].minutes * 60 * 1000,
  };
  ui.selectedSessionPlan = planKey;
  ui.finishDraft = null;
  ui.sessionOpen = true;
  saveState();
  startSessionTicker();
}
function completeSession(planKey) {
  recordLog(planKey, null);
  state.activeSession = null;
  ui.sessionOpen = false;
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
    suggestions.push("火曜は最初からPlan Bにする");
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
      "残りのRoadmapは目標と現在地から自動で作り直します。",
    ];
  }

  if (mode === "lighten_today") {
    return [
      `今日の開始プランを ${PLAN_META[todayPlan].label} -> ${PLAN_META[nextPlan].label} に変更`,
      `今日のミッションを「${currentState.today.missionTitle}」 -> 「${shortenMission(currentState.today.missionTitle)}」に短縮`,
      heavyReason ? `今日は主枠を追わず、予備枠 ${currentState.setup.backupWindow} を優先表示` : `救済の定義を「${currentState.plans.C.description}」のまま固定`,
    ];
  }

  if (mode === "reset_week") {
    return [
      `${weekdayLabel("Tue")}の開始プランを Plan A -> Plan B に変更`,
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
    heavyReason ? `残業が続く前提で、${weekdayLabel("Tue")}と${weekdayLabel("Thu")}を最初からPlan Bに変更` : "詰まりが出やすい曜日をPlan B始まりに変更",
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

  const nextSetup = {
    ...cloneData(goal.setup),
    goal: nextGoalName,
    deadline: normalizeOptionalDate(ui.goalLibraryDraft.deadline),
    currentLevel: "",
    flowerType: normalizeFlowerType(ui.goalLibraryDraft.flowerType, goal.setup),
  };
  nextSetup.studyDays = normalizeStudyDays(nextSetup.studyDays);

  const nextRoadmap = preserveRoadmapForSetupEdit(goal.roadmap, nextSetup);
  const nextToday = {
    ...cloneData(goal.today || {}),
    ...buildToday(nextSetup, nextRoadmap),
  };
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
  return `${weekly ? weekly.label : "今週の到達点"}から逆算した1本です。${nextStep ? nextStep.label : "次の一歩はRoadmapで追加できます。"}`;
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
    studyMode: draft.studyMode || "flex",
    primaryWindow,
    backupWindow: primaryWindow,
    rescueWindow: primaryWindow,
    normalMinutes: minutes.normalMinutes,
    shortMinutes: minutes.shortMinutes,
    minimumMinutes: minutes.minimumMinutes,
    minimumExample: draft.minimumExample.trim() || state.setup.minimumExample,
  };

  if (ui.setupMode === "new_goal") {
    syncActiveGoalRecord();
    const nextRoadmap = preserveRoadmapForSetupEdit(
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
    state.meta.demoMode = false;
    state.meta.currentView = "setup";
    ui.setupDraft = expandSetup(state.setup);
    ui.roadmapDraft = null;
    ui.setupMode = "edit";
    ui.setupSection = "goal";
    ui.missPanelOpen = false;
    saveState();
    return "created";
  }

  const isFreshStart = state.meta.demoMode;
  state.setup = nextSetup;
  state.roadmap = isFreshStart ? buildInitialRoadmap(nextSetup) : preserveRoadmapForSetupEdit(state.roadmap, nextSetup);
  state.today = buildToday(nextSetup, state.roadmap);
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
  ui.missPanelOpen = false;
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

  return {
    ...base,
    ...saved,
    meta: { ...base.meta, ...saved.meta },
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
    goals: Array.isArray(saved.goals) ? saved.goals : [],
  };
}

function saveState() {
  syncActiveGoalRecord();
  localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
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
    todayLabel.textContent = formatHeaderDate(new Date());
    if (state.meta.currentView === "today" && !ui.sessionOpen && !state.activeSession) {
      render();
    }
  }, 60000);
}

function startSessionTicker() {
  if (ui.sessionTimer) {
    window.clearInterval(ui.sessionTimer);
  }

  if (!state.activeSession || ui.finishDraft) {
    return;
  }

  const updateTimerValue = () => {
    const timerValue = sessionSheet.querySelector("#session-timer-value");
    if (!timerValue) {
      return;
    }

    const remaining = getRemainingMs(state.activeSession.endsAt);
    timerValue.textContent = remaining <= 0 ? "時間です" : formatCountdown(remaining);
  };

  updateTimerValue();

  ui.sessionTimer = window.setInterval(() => {
    if (!state.activeSession || ui.finishDraft) {
      window.clearInterval(ui.sessionTimer);
      ui.sessionTimer = null;
      return;
    }

    const remaining = getRemainingMs(state.activeSession.endsAt);
    const timerValue = sessionSheet.querySelector("#session-timer-value");
    if (timerValue) {
      timerValue.textContent = remaining <= 0 ? "時間です" : formatCountdown(remaining);
    }

    if (remaining <= 0) {
      window.clearInterval(ui.sessionTimer);
      ui.sessionTimer = null;
      showToast("予定時間です。完了か軽量着地を選べます。");
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
  if (outcome === "A") return "Plan Aで完了";
  if (outcome === "B") return "Plan Bで短縮";
  if (outcome === "C") return "Plan Cで救済";
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












































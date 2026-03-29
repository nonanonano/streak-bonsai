// =========================================================
// SUPABASE Ã¨Â¨Â­Ã¥Â®Â
// =========================================================
const SUPABASE_URL = "https://kyzyyciutnkhaxadwdlx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8BS-Guu8UUfb3sEHRfHGRg_vTvB0FyB";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Ã¯Â»Â¿const STORAGE_KEY = "tomosu-state-v1";
const CURRENT_STORAGE_KEY = "streakgarden-state-v1";
const LEGACY_STORAGE_KEYS = [STORAGE_KEY];
const PLAN_RANK = { C: 1, B: 2, A: 3 };
const PLAN_META = {
  A: { label: "Plan A", tag: "Ã©ÂÂÃ¥Â¸Â¸" },
  B: { label: "Plan B", tag: "Ã§ÂÂ­Ã§Â¸Â®" },
  C: { label: "Plan C", tag: "Ã¦ÂÂÃ¦Â¸Â" },
};
const REASONS = [
  "Ã¦Â®ÂÃ¦Â¥Â­Ã£ÂÂ§Ã©ÂÂÃ¥Â§ÂÃ£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ",
  "Ã£ÂÂ¿Ã£ÂÂ¹Ã£ÂÂ¯Ã£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ",
  "Ã©ÂÂÃ¥Â§ÂÃ¥ÂÂÃ£ÂÂ®Ã¦ÂºÂÃ¥ÂÂÃ£ÂÂÃ©ÂÂ¢Ã¥ÂÂ",
  "Ã§ÂÂ²Ã¥ÂÂ´",
  "Ã¤ÂºÂÃ¥Â®ÂÃ¥Â¤ÂÃ¦ÂÂ´",
  "Ã¥Â¿ÂÃ£ÂÂÃ£ÂÂ",
];
const REPLAN_MODES = {
  lighten_today: "Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂÃ¨Â»Â½Ã£ÂÂÃ£ÂÂÃ£ÂÂ",
  reset_week: "Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂÃ§Â«ÂÃ£ÂÂ¦Ã§ÂÂ´Ã£ÂÂ",
  break_goal: "Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¥ÂÂÃ¨Â§Â£Ã£ÂÂÃ£ÂÂ",
  retarget_goal: "Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¦ÂÂ´Ã¦ÂÂ°Ã£ÂÂÃ£ÂÂ",
  consult_block: "Ã¨Â©Â°Ã£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ§ÂÂ¸Ã¨Â«ÂÃ£ÂÂÃ£ÂÂ",
};
const SETUP_SECTIONS = {
  goal: {
    label: "Ã§ÂÂ®Ã¦Â¨ÂÃ§Â·Â¨Ã©ÂÂ",
    hint: "Ã§ÂÂ»Ã©ÂÂ²Ã¦Â¸ÂÃ£ÂÂ¿Ã£ÂÂÃ§ÂÂ´Ã£ÂÂ",
    title: "Ã§ÂÂ®Ã¦Â¨ÂÃ§Â·Â¨Ã©ÂÂ",
    copy: "Ã§ÂÂ»Ã©ÂÂ²Ã¦Â¸ÂÃ£ÂÂ¿Ã£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ§Ã§Â·Â¨Ã©ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
  },
  roadmap: {
    label: "Roadmap",
    hint: "Ã§Â¯ÂÃ§ÂÂ®Ã£ÂÂÃ¦ÂÂ´Ã£ÂÂÃ£ÂÂ",
    title: "Roadmap",
    copy: "Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂ®Ã¨Â¿Â½Ã¥ÂÂ Ã£ÂÂ¨Ã¨ÂªÂ¿Ã¦ÂÂ´Ã£ÂÂ¯Ã¨Â¨Â­Ã¥Â®ÂÃ£ÂÂ§Ã¨Â¡ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
  },
  schedule: {
    label: "Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ",
    hint: "Ã£ÂÂÃ£ÂÂ¤Ã¥ÂÂÃ£ÂÂÃ£ÂÂ",
    title: "Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ",
    copy: "Ã¦ÂÂÃ¦ÂÂ¥Ã£ÂÂÃ£ÂÂ¨Ã£ÂÂ«Ã£ÂÂÃ¥ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ¦ÂÂÃ©ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ§Ã¦ÂÂ´Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
  },
  plan: {
    label: "Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ³Ã£ÂÂ®Ã¥Â¤ÂÃ¦ÂÂ´",
    hint: "Ã£ÂÂ©Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂ§Ã¨Â»Â½Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ",
    title: "Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ³",
    copy: "Ã©ÂÂÃ¥Â¸Â¸ / Ã§ÂÂ­Ã§Â¸Â® / Ã¦ÂÂÃ¦Â¸ÂÃ£ÂÂ®3Ã¦Â®ÂµÃ©ÂÂÃ£ÂÂ Ã£ÂÂÃ¨ÂªÂ¿Ã¦ÂÂ´Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
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
const FLOWER_STAGE_LABELS = ["Ã§Â¨Â®", "Ã¨ÂÂ½", "Ã¥ÂÂÃ¨ÂÂ", "Ã¨ÂÂÃ£ÂÂ®Ã£ÂÂ³", "Ã£ÂÂ¤Ã£ÂÂ¼Ã£ÂÂ¿", "Ã¨ÂÂ²Ã£ÂÂ¥Ã£ÂÂ", "Ã¥ÂÂ²Ã£ÂÂÃ¥Â§ÂÃ£ÂÂ", "Ã¤Â¸ÂÃ¥ÂÂÃ¥ÂÂ²Ã£ÂÂ", "Ã¦ÂºÂÃ©ÂÂ", "Ã¦ÂÂ¼Ã£ÂÂÃ¨ÂÂ±"];
// Ã§ÂÂ®Ã¦Â¨ÂÃ¦Â¤ÂÃ§ÂÂ©Ã£ÂÂ©Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ©Ã£ÂÂªÃ¯Â¼ÂÃ¦Â¢ÂÃ£ÂÂ»Ã¦Â¡ÂÃ£ÂÂ»Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂÃ¯Â¼Â
const FLOWER_LIBRARY = {
  ume: {
    label: "Ã¦Â¢Â",
    trait: "Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ¦Ã¥ÂÂ²Ã£ÂÂÃ§ÂÂ®Ã¦Â¨Â",
    copy: "Ã§ÂÂ­Ã¦ÂÂÃ£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ«Ã£ÂÂÃ¥ÂÂ³Ã£ÂÂÃ£ÂÂÃ¦ÂÂÃ¦ÂÂÃ£ÂÂÃ¨Â¶ÂÃ£ÂÂÃ£ÂÂ¦Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ«Ã¥ÂÂ²Ã£ÂÂÃ£ÂÂÃ©ÂÂÃ¦ÂÂÃ£ÂÂ®Ã¥ÂÂÃ£ÂÂ³Ã£ÂÂÃ¦ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ¦Â¤ÂÃ§ÂÂ©Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ",
    trunk: "#6a5248", branch: "#5a4238",
    bud: "#e8b4c8", petal: "#f9f0f4", petalLight: "#fffbfe", center: "#d4526e",
    pot: "#8a7060", potRim: "#786050", soil: "#6a5040",
    stem: "#6a5248", leaf: "#4a3830",
  },
  sakura: {
    label: "Ã¦Â¡Â",
    trait: "Ã§Â¯ÂÃ§ÂÂ®Ã£ÂÂÃ§Â¥ÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨Â",
    copy: "Ã¥Â¤Â§Ã£ÂÂÃ£ÂÂªÃ§Â¯ÂÃ§ÂÂ®Ã£ÂÂÃ¦ÂÂ¬Ã§ÂÂªÃ£ÂÂ«Ã£ÂÂÃ¦ÂºÂÃ©ÂÂÃ£ÂÂ®Ã§ÂÂ¬Ã©ÂÂÃ£ÂÂÃ¦ÂÂÃ£ÂÂÃ§Â¾ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ©ÂÂÃ¦ÂÂÃ£ÂÂ®Ã¦ÂÂÃ¥ÂÂÃ£ÂÂÃ¥Â¤Â§Ã£ÂÂÃ£ÂÂÃ¦Â¤ÂÃ§ÂÂ©Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ",
    trunk: "#7a6258", branch: "#6a5248",
    bud: "#f4c0d8", petal: "#f9d8e8", petalLight: "#fff4f8", center: "#e87090",
    pot: "#907060", potRim: "#7e6050", soil: "#6e5040",
    stem: "#7a6258", leaf: "#6a5248",
  },
  satsuki: {
    label: "Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ",
    trait: "Ã©ÂÂ²Ã£ÂÂ¿Ã£ÂÂÃ¨Â¦ÂÃ£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨Â",
    copy: "Ã¦Â®ÂµÃ©ÂÂÃ§ÂÂÃ£ÂÂªÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ«Ã£ÂÂÃ©ÂÂ²Ã¦ÂÂÃ§ÂÂÃ£ÂÂ«Ã¥Â¿ÂÃ£ÂÂÃ£ÂÂ¦Ã¨ÂÂ±Ã£ÂÂÃ¥Â¢ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ®Ã£ÂÂ§Ã£ÂÂÃ©Â ÂÃ¥Â¼ÂµÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ®Ã£ÂÂ¾Ã£ÂÂ¾Ã¨Â¦ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
    trunk: "#6a5c48", branch: "#5a4c38",
    bud: "#d04880", petal: "#e8609a", petalLight: "#ffd8ec", center: "#a02860",
    pot: "#887060", potRim: "#766050", soil: "#665040",
    stem: "#6a5c48", leaf: "#5a4c38",
  },
};

const BONSAI_LIBRARY = {
  pine: {
    label: "Ã¦ÂÂ¾", trait: "Ã§Â©ÂÃ£ÂÂ¿Ã¤Â¸ÂÃ£ÂÂÃ£ÂÂÃ§Â¿ÂÃ¦ÂÂ£",
    trunk: "#5a4a3a", branch: "#4a3c2c",
    foliage: "#2e6644", foliageDark: "#1e4e32", foliageLight: "#4e8e5c",
    pot: "#8c6e58", potRim: "#7a5c48", soil: "#6a5040",
  },
  maple: {
    label: "Ã£ÂÂÃ£ÂÂ¿Ã£ÂÂ", trait: "Ã¥Â¤ÂÃ£ÂÂÃ£ÂÂÃ§Â¿ÂÃ¦ÂÂ£",
    trunk: "#7a5840", branch: "#6a4c36",
    foliage: "#c04020", foliageDark: "#8a2c14", foliageLight: "#f08040",
    pot: "#906858", potRim: "#7e5848", soil: "#6e5038",
  },
  moss: {
    label: "Ã¨ÂÂ", trait: "Ã¦ÂÂ´Ã£ÂÂÃ£ÂÂÃ§Â¿ÂÃ¦ÂÂ£",
    trunk: "#5a7040", branch: "#4a6030",
    foliage: "#5a9040", foliageDark: "#3a6828", foliageLight: "#8abf60",
    pot: "#7a8060", potRim: "#6a7050", soil: "#5a6040",
  },
};
const BONSAI_STAGE_LABELS = ["Ã©ÂÂ¢Ã£ÂÂ®Ã£ÂÂ¿","Ã¨ÂÂ½Ã§ÂÂÃ£ÂÂ","Ã¥Â¹Â¼Ã¦ÂÂ¨","Ã¦ÂÂÃ©ÂÂ·Ã¦ÂÂ","Ã¥Â½Â¢Ã¦ÂÂÃ¦ÂÂ","Ã¦Â¨Â¹Ã¥Â½Â¢Ã¦ÂÂ","Ã¦ÂÂ´Ã£ÂÂ","Ã¨ÂÂÃ¦ÂÂ","Ã©ÂÂÃ¦ÂÂ¨","Ã¥ÂÂÃ¤Â½Â"];

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
  deleteConfirmGoalId: null,
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
  focusPausedAt: null,
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
  if (/Ã¥Â§Â|Ã¦ÂÂÃ¥ÂÂ|Ã£ÂÂ¾Ã£ÂÂ|first|week|Ã©ÂÂ±|1Ã©ÂÂ±/.test(goalText)) {
    return "ume";
  }
  if (/Ã¨Â©Â¦Ã©Â¨Â|Ã¥ÂÂÃ©Â¨Â|Ã§ÂÂºÃ¨Â¡Â¨|Ã¦ÂÂ¬Ã§ÂÂª|Ã£ÂÂÃ£ÂÂ¬Ã£ÂÂ¼Ã£ÂÂ³|Ã©ÂÂ¢Ã¦ÂÂ¥|Ã¦ÂÂÃ¥ÂÂº|exam|test/.test(goalText)) {
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

function normalizeBonsaiKey(key) {
  // Migrate old bonsai keys
  const migrate = { bamboo: "maple", plum: "moss" };
  const resolved = migrate[key] || key;
  return BONSAI_LIBRARY[resolved] ? resolved : "pine";
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
    return "Ã¦ÂÂªÃ¨Â¨Â­Ã¥Â®Â";
  }
  if (days.length === WEEKDAY_KEYS.length) {
    return "Ã¦Â¯ÂÃ¦ÂÂ¥";
  }
  if (days.join(",") === "Mon,Tue,Wed,Thu,Fri") {
    return "Ã¥Â¹Â³Ã¦ÂÂ¥";
  }
  if (days.join(",") === "Sat,Sun") {
    return "Ã¥ÂÂÃ¦ÂÂ¥";
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
  return normalized ? `Ã¦ÂÂÃ©ÂÂ ${normalized}` : "Ã¦ÂÂÃ©ÂÂÃ£ÂÂªÃ£ÂÂ";
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

function getBonsaiTypeMeta(key) {
  const resolved = normalizeBonsaiKey(key);
  return { key: resolved, ...(BONSAI_LIBRARY[resolved] || BONSAI_LIBRARY.pine) };
}

function getBonsaiGrowth(logs) {
  const executedDays = (Array.isArray(logs) ? logs : []).filter(l => l.outcome !== "miss" && l.outcome !== "none").length;
  let stageIndex = 0;
  for (let i = FLOWER_STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (executedDays >= FLOWER_STAGE_THRESHOLDS[i]) { stageIndex = i; break; }
  }
  return { stageIndex, executedDays, stageLabel: BONSAI_STAGE_LABELS[stageIndex] };
}

function getBonsaiHealth(logs, studyDays) {
  const days = normalizeStudyDays(studyDays);
  const today = new Date();
  let scheduled = 0, completed = 0;
  for (let i = 0; i < 14 && scheduled < 7; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dayKey = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    if (!days.includes(dayKey)) continue;
    scheduled++;
    const ds = toISODate(d);
    const log = (Array.isArray(logs) ? logs : []).find(l => l.date === ds);
    if (log && log.outcome !== "miss" && log.outcome !== "none") completed++;
  }
  return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 100;
}

// Ã§ÂÂ´Ã¨Â¿Â7Ã¥ÂÂÃ£ÂÂ®Ã¥Â®ÂÃ¦ÂÂ½Ã¤ÂºÂÃ¥Â®ÂÃ¦ÂÂ¥Ã£ÂÂÃ¢ÂÂÃ¢ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ§Ã¨Â¿ÂÃ£ÂÂÃ¯Â¼ÂÃ¨ÂªÂ¬Ã¦ÂÂÃ¤Â¸ÂÃ¨Â¦ÂÃ£ÂÂ®Ã¤Â¸ÂÃ§ÂÂ®Ã§ÂÂ­Ã§ÂÂ¶UIÃ¯Â¼Â
function renderStreakDots(logs, studyDays) {
  const days = normalizeStudyDays(studyDays);
  const today = new Date();
  const slots = [];
  for (let i = 0; i < 14 && slots.length < 7; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dayKey = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    if (!days.includes(dayKey)) continue;
    const ds = toISODate(d);
    const log = (Array.isArray(logs) ? logs : []).find(l => l.date === ds);
    const done = Boolean(log && log.outcome !== "miss" && log.outcome !== "none");
    slots.unshift({ done, isToday: i === 0 });
  }
  // 7Ã¥ÂÂÃ¦ÂÂªÃ¦ÂºÂÃ£ÂÂªÃ£ÂÂÃ¥Â·Â¦Ã£ÂÂÃ¨ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ§Ã¥ÂÂÃ£ÂÂÃ£ÂÂ
  while (slots.length < 7) slots.unshift({ done: false, isToday: false, filler: true });
  return `<span class="streak-dots">${slots.map(s =>
    `<span class="streak-dot${s.done ? " is-done" : ""}${s.isToday ? " is-today" : ""}${s.filler ? " is-filler" : ""}"></span>`
  ).join("")}</span>`;
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
  setInterval(() => {
    if (!state.activeSession) _resyncFromSupabase();
  }, 3 * 60 * 1000);
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

  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseFocusSession();
    } else {
      if (state.activeSession && !ui.finishDraft) resumeFocusSession();
      _resyncFromSupabase();
    }
  });

  window.addEventListener("blur", () => {
    setTimeout(() => {
      if (!document.hidden) pauseFocusSession();
    }, 200);
  });

  window.addEventListener("focus", () => {
    if (!document.hidden && state.activeSession && !ui.finishDraft) {
      resumeFocusSession();
    }
  });
}

function handleKeydown(event) {
  if (event.target.matches("input, textarea, select")) {
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  const tabViews = ["today", "roadmap", "review", "garden"];
  const viewIndex = Number(event.key) - 1;
  if (viewIndex >= 0 && viewIndex < tabViews.length) {
    if (state.activeSession) {
      ui.sessionOpen = true;
      render();
      showToast("Ã£ÂÂ»Ã£ÂÂÃ£ÂÂ·Ã£ÂÂ§Ã£ÂÂ³Ã¤Â¸Â­Ã£ÂÂ¯Ã§ÂÂ»Ã©ÂÂ¢Ã£ÂÂÃ¥ÂÂÃ£ÂÂÃ¦ÂÂ¿Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ");
      return;
    }
    state.meta.currentView = tabViews[viewIndex];
    saveNavState();
    render();
    return;
  }

  if (event.key === "Escape") {
    if (state.meta.currentView === "setup") {
      ui.setupDraft = null;
      ui.goalLibraryDraft = null;
      ui.roadmapDraft = null;
      ui.setupMode = "edit";
      state.meta.currentView = "today";
      render();
    } else if (ui.sessionOpen || state.activeSession) {
      if (state.activeSession && !ui.finishDraft) {
        pauseFocusSession();
      }
      ui.sessionOpen = false;
      render();
    }
  }
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
    if (state.activeSession) {
      ui.sessionOpen = true;
      render();
      showToast("Ã£ÂÂ»Ã£ÂÂÃ£ÂÂ·Ã£ÂÂ§Ã£ÂÂ³Ã¤Â¸Â­Ã£ÂÂ¯Ã§ÂÂ»Ã©ÂÂ¢Ã£ÂÂÃ¥ÂÂÃ£ÂÂÃ¦ÂÂ¿Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ");
      return;
    }
    ui.missPanelOpen = false;
    if (target.dataset.view !== "review") {
      ui.reviewLogDraft = null;
      ui.reviewLogExpanded = false;
    }
    state.meta.currentView = target.dataset.view;
    saveNavState();
    render();
    return;
  }

  if (action === "open-setup") {
    if (state.activeSession) {
      ui.sessionOpen = true;
      render();
      showToast("Ã£ÂÂ»Ã£ÂÂÃ£ÂÂ·Ã£ÂÂ§Ã£ÂÂ³Ã¤Â¸Â­Ã£ÂÂ¯Ã¨Â¨Â­Ã¥Â®ÂÃ£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ");
      return;
    }
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
      showToast("Ã¨Â¡Â¨Ã§Â¤ÂºÃ£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¥ÂÂÃ£ÂÂÃ¦ÂÂ¿Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    }
    return;
  }

  // Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂÃ£ÂÂ Ã£ÂÂ¸Ã§Â§Â»Ã¥ÂÂÃ¯Â¼ÂÃ£ÂÂÃ£ÂÂ¼Ã£ÂÂ¿Ã¤Â¿ÂÃ¦ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂ¾Ã©ÂÂÃ¨Â¡Â¨Ã§Â¤ÂºÃ¯Â¼Â
  if (action === "archive-goal") {
    const goalId = target.dataset.goalId;
    ensureGoalCollection();
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    goal.archived = true;
    goal.archivedAt = toISODate(new Date());
    // Ã£ÂÂ¢Ã£ÂÂ¼Ã£ÂÂ«Ã£ÂÂ¤Ã£ÂÂÃ¥Â¯Â¾Ã¨Â±Â¡Ã£ÂÂÃ£ÂÂ¢Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂ£Ã£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂªÃ£ÂÂÃ¥ÂÂ¥Ã£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ¸Ã¥ÂÂÃ£ÂÂÃ¦ÂÂ¿Ã£ÂÂ
    if (goalId === state.meta.activeGoalId) {
      const next = state.goals.find(g => !g.archived && g.id !== goalId);
      if (next) { applyGoalRecord(next); state.meta.activeGoalId = next.id; }
    }
    ui.goalLibraryDraft = null;
    ui.deleteConfirmGoalId = null;
    saveState();
    render();
    showToast("Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂÃ£ÂÂ Ã£ÂÂ«Ã¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    return;
  }

  // Ã¥Â®ÂÃ¥ÂÂ¨Ã¦Â¶ÂÃ¥ÂÂ»Ã£ÂÂ®Ã§Â¢ÂºÃ¨ÂªÂÃ£ÂÂ¹Ã£ÂÂÃ£ÂÂÃ£ÂÂ
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

  // Ã¥Â®ÂÃ¥ÂÂ¨Ã¦Â¶ÂÃ¥ÂÂ»Ã¯Â¼ÂÃ§Â¢ÂºÃ¨ÂªÂÃ¥Â¾ÂÃ¯Â¼Â
  if (action === "delete-goal") {
    const goalId = target.dataset.goalId;
    ensureGoalCollection();
    if (goalId === state.meta.activeGoalId) {
      const next = state.goals.find(g => !g.archived && g.id !== goalId);
      if (next) { applyGoalRecord(next); state.meta.activeGoalId = next.id; }
    }
    state.goals = state.goals.filter(g => g.id !== goalId);
    ui.goalLibraryDraft = null;
    ui.deleteConfirmGoalId = null;
    saveState();
    render();
    showToast("Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¥Â®ÂÃ¥ÂÂ¨Ã£ÂÂ«Ã¥ÂÂÃ©ÂÂ¤Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    return;
  }

  // Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ¥Â®ÂÃ¥ÂÂ¨Ã¦Â¶ÂÃ¥ÂÂ»
  if (action === "purge-archived-goal") {
    const goalId = target.dataset.goalId;
    ensureGoalCollection();
    state.goals = state.goals.filter(g => g.id !== goalId);
    ui.deleteConfirmGoalId = null;
    saveState();
    render();
    showToast("Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ¥ÂÂÃ©ÂÂ¤Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
      showToast("Ã§ÂÂ®Ã¦Â¨ÂÃ¥ÂÂÃ£ÂÂÃ¥ÂÂ¥Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
      return;
    }
    render();
    showToast("Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¦ÂÂ´Ã¦ÂÂ°Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
      showToast("Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ¦ÂÂ¥Ã£ÂÂ1Ã£ÂÂ¤Ã¤Â»Â¥Ã¤Â¸ÂÃ©ÂÂ¸Ã£ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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

  if (action === "select-goal-library-type") {
    if (!ui.goalLibraryDraft) return;
    const t = target.dataset.goalType;
    if (t === "habit" || t === "goal") {
      ui.goalLibraryDraft.goalType = t;
      render();
    }
    return;
  }

  if (action === "select-goal-library-bonsai") {
    if (!ui.goalLibraryDraft) return;
    if (BONSAI_LIBRARY[target.dataset.bonsaiKey]) {
      ui.goalLibraryDraft.bonsaiKey = target.dataset.bonsaiKey;
      render();
    }
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
      showToast("Ã¦ÂÂ°Ã£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ¥ÂÂÃ£ÂÂÃ¥ÂÂ¥Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
      showToast(`Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ¯ ${conflicts.map((item) => item.label).join(" / ")} Ã£ÂÂ¨Ã©ÂÂÃ£ÂÂªÃ£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ`);
    } else if (saveResult === "created") {
      showToast("Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¨Â¨Â­Ã¥Â®ÂÃ§ÂÂ»Ã©ÂÂ¢Ã£ÂÂ§Ã§Â¢ÂºÃ¨ÂªÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ");
    } else if (saveResult === "reset" && conflicts.length) {
      showToast(`Ã¨Â¨Â­Ã¥Â®ÂÃ£ÂÂÃ¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ¯ ${conflicts.map((item) => item.label).join(" / ")} Ã£ÂÂ¨Ã©ÂÂÃ£ÂÂªÃ£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ`);
    } else if (saveResult === "reset") {
      showToast("Ã¨Â¨Â­Ã¥Â®ÂÃ£ÂÂÃ¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ³Ã£ÂÂÃ¤Â½ÂÃ£ÂÂÃ§ÂÂ´Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    } else if (conflicts.length) {
      showToast(`Ã¨Â¨Â­Ã¥Â®ÂÃ£ÂÂÃ¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ¯ ${conflicts.map((item) => item.label).join(" / ")} Ã£ÂÂ¨Ã©ÂÂÃ£ÂÂªÃ£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ`);
    } else {
      showToast("Ã¨Â¨Â­Ã¥Â®ÂÃ£ÂÂÃ¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    }
    return;
  }
  if (action === "quick-start-session") {
    const launchPlanKey = syncSelectedSessionPlan();
    ui.selectedSessionPlan = launchPlanKey;
    ui.sessionOpen = true;
    render();
    showToast(`${PLAN_META[launchPlanKey].label}Ã£ÂÂÃ©ÂÂ¸Ã£ÂÂ³Ã£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ©ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂ¿Ã£ÂÂ³Ã£ÂÂ§Ã¥Â§ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ`);
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
    if (state.activeSession && !ui.finishDraft) {
      pauseFocusSession();
    }
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
    showToast(`${PLAN_META[ui.selectedSessionPlan].label}Ã£ÂÂÃ©ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ`);
    return;
  }

  if (action === "complete-session") {
    openFinishDraft(state.activeSession ? state.activeSession.planKey : ui.selectedSessionPlan);
    render();
    return;
  }

  if (action === "downgrade-session") {
    const rawElapsed = state.activeSession
      ? Math.max(1, Math.round((Date.now() - state.activeSession.startedAt) / 1000))
      : 0;
    const elapsedMinutes = Math.max(1, Math.round(rawElapsed / 60));
    // Pick the heaviest plan whose minutes fit within elapsed time; fallback to lightest
    const plans = Object.entries(state.plans).sort((a, b) => b[1].minutes - a[1].minutes);
    const fit = plans.find(([, p]) => p.minutes <= elapsedMinutes);
    const appropriatePlan = fit ? fit[0] : plans[plans.length - 1][0];
    openFinishDraft(appropriatePlan);
    render();
    return;
  }

  if (action === "save-finish-log") {
    saveFinishDraft();
    render();
    showToast("Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¦Â®ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
    showToast(`Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ¯${PLAN_META[state.today.recommendedPlan].label}Ã£ÂÂÃ£ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂÃ¨Â¨Â­Ã¥Â®ÂÃ£ÂÂ«Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ`);
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
    showToast("Ã¦ÂÂªÃ¥Â®ÂÃ¦ÂÂ½Ã£ÂÂ¨Ã£ÂÂÃ£ÂÂ¦Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¦ÂÂÃ¦ÂÂ¥Ã£ÂÂ®Ã¥Â¾Â©Ã¥Â¸Â°Ã£ÂÂÃ¤Â¸Â»Ã¥Â½Â¹Ã£ÂÂ«Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ");
    return;
  }

  if (action === "habit-checkin") {
    const goalId = target.dataset.goalId;
    const todayStr = toISODate(new Date());
    // Find the goal to check for existing log
    const targetGoal = (state.goals || []).find(g => g.id === goalId);
    if (!targetGoal) return;
    const logsToCheck = goalId === state.meta.activeGoalId ? state.logs : (targetGoal.logs || []);
    const existingLog = logsToCheck.find(l => l.date === todayStr && l.outcome !== "miss");
    if (existingLog) return;
    // Activate goal if needed so state.logs points to this goal's logs
    if (goalId !== state.meta.activeGoalId) {
      activateGoal(goalId);
    }
    const missionTitle = state.today ? state.today.missionTitle : targetGoal.setup.goal;
    const nextEntry = {
      logId: createLogId(),
      date: todayStr,
      outcome: "A",
      reason: null,
      missionTitle,
      recordedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      plannedSeconds: 0,
      progressText: "",
      reflection: "",
      milestoneId: "",
      milestoneLabel: "",
      milestoneTarget: null,
      milestoneStatus: "",
    };
    state.logs.push(nextEntry);
    state.logs.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    syncTodayLastLogFields();
    saveState();
    render();
    showToast("Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã£ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ¯Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂÃ¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¯Â¼Â");
    return;
  }

  if (action === "habit-undo-checkin") {
    const goalId = target.dataset.goalId;
    const todayStr = toISODate(new Date());
    if (goalId !== state.meta.activeGoalId) {
      activateGoal(goalId);
    }
    const before = state.logs.length;
    state.logs = state.logs.filter(l => !(l.date === todayStr && l.outcome !== "miss"));
    if (state.logs.length < before) {
      saveState();
      render();
      showToast("Ã£ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ¯Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂÃ¥ÂÂÃ£ÂÂÃ¦Â¶ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    }
    return;
  }

  if (action === "select-setup-bonsai") {
    ensureSetupDraft();
    const key = target.dataset.bonsaiKey;
    if (BONSAI_LIBRARY[key]) {
      ui.setupDraft.bonsaiKey = key;
    }
    render();
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
      showToast("Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂÃ¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    } else {
      showToast("Ã£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ«Ã£ÂÂÃ¥ÂÂ¥Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    }
    return;
  }

  if (action === "delete-roadmap-item") {
    deleteRoadmapItem(target.dataset.roadmapId || "");
    render();
    showToast("Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂÃ¥ÂÂÃ©ÂÂ¤Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    return;
  }

    if (action === "manual-log") {
    recordLog(target.dataset.outcome, null);
    render();
    showToast("Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ§Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    return;
  }

  if (action === "undo-log-date") {
    const removed = removeLatestLogByDate(target.dataset.date || toISODate(new Date()));
    render();
    showToast(removed ? `Ã¥ÂÂÃ£ÂÂÃ¦Â¶ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ: ${buildLogSummary(removed)}` : "Ã¥ÂÂÃ£ÂÂÃ¦Â¶ÂÃ£ÂÂÃ£ÂÂÃ¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    return;
  }

  if (action === "open-review-log-editor") {
    const opened = openReviewLogDraft(target.dataset.logId || "");
    render();
    showToast(opened ? "Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¤Â¿Â®Ã¦Â­Â£Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ" : "Ã¤Â¿Â®Ã¦Â­Â£Ã£ÂÂ§Ã£ÂÂÃ£ÂÂÃ¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¨Â¦ÂÃ£ÂÂ¤Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
    showToast(saved ? "Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¦ÂÂ´Ã¦ÂÂ°Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ" : "Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂ¥Ã£ÂÂ¨Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂÃ§Â¢ÂºÃ¨ÂªÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
    showToast("Ã¥Â·Â®Ã¥ÂÂÃ£ÂÂÃ©ÂÂ©Ã§ÂÂ¨Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
  setupShortcut.textContent = currentView === "setup" ? "Ã©ÂÂÃ£ÂÂÃ£ÂÂ" : "Ã¨Â¨Â­Ã¥Â®Â";
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
    const isActive = button.dataset.view === currentView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  const renderMap = {
    setup: renderSetupView,
    today: renderTodayView,
    roadmap: renderRoadmapView,
    review: renderReviewView,
    garden: renderGardenView,
  };

  try {
    screenRoot.innerHTML = (renderMap[currentView] || renderMap.today)();
  } catch (err) {
    console.error("render error:", err);
    screenRoot.innerHTML = `<div class="screen" style="padding:32px 24px;text-align:center;"><p style="font-size:1.1rem;margin-bottom:8px;">Ã¨Â¡Â¨Ã§Â¤ÂºÃ£ÂÂ¨Ã£ÂÂ©Ã£ÂÂ¼Ã£ÂÂÃ§ÂÂºÃ§ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p><p style="font-size:0.82rem;color:var(--muted)">${escapeHtml(String(err.message || err))}</p></div>`;
  }
  renderSessionSheet();
  startSessionTicker();

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
    ? `<span class="status-badge status-badge--done">Ã¨Â¡Â¨Ã§Â¤ÂºÃ¤Â¸Â­</span>`
    : `<span class="status-badge ${item.overlaps ? "status-badge--danger" : ""}">${item.overlaps ? "Ã©ÂÂÃ£ÂÂªÃ£ÂÂ" : item.sharedDays.length ? "Ã¥ÂÂ¥Ã¦ÂÂÃ©ÂÂ" : "Ã¥ÂÂ¥Ã¦ÂÂÃ¦ÂÂ¥"}</span>`;

  return `
    <article class="goal-window-row ${item.isActive ? "is-active" : ""} ${item.overlaps ? "is-conflict" : ""}">
      <div class="goal-window-row__head">
        <div class="goal-window-row__body">
          <strong class="goal-window-row__name">${escapeHtml(item.label)}</strong>
          <div class="goal-window-row__meta">Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ ${escapeHtml(item.window)} / ${escapeHtml(formatStudyDays(item.studyDays))}</div>
        </div>
        <div class="goal-window-row__actions">
          ${statusBadge}
          ${item.isActive
            ? ""
            : `<button type="button" class="soft-button goal-window-row__pick" data-action="activate-goal" data-goal-id="${escapeHtml(item.id)}">Ã§Â·Â¨Ã©ÂÂÃ£ÂÂÃ£ÂÂ</button>`}
        </div>
      </div>
      ${item.isActive
        ? `
          <div class="goal-window-row__editor">
            ${renderWindowField("Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ", "primaryStart", "primaryEnd", draft.primaryStart, draft.primaryEnd)}
            <div class="field">
              <span class="field__label">Ã¦ÂÂÃ¦ÂÂ¥</span>
              <div class="weekday-choice-row goal-window-row__days">
                ${WEEKDAY_KEYS.map((weekdayKey) => renderWeekdayChip(weekdayKey, draft.studyDays)).join("")}
              </div>
              <p class="goal-window-row__current">Ã§ÂÂ¾Ã¥ÂÂ¨: ${escapeHtml(formatStudyDays(draft.studyDays))}</p>
            </div>
            <div class="goal-window-row__save">
              <button type="button" class="action-button action-button--primary" data-action="save-setup">Ã£ÂÂÃ£ÂÂ®Ã¥ÂÂÃ¥Â®Â¹Ã£ÂÂ§Ã¤Â¿ÂÃ¥Â­Â</button>
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
      ? "Ã¥ÂÂÃ£ÂÂÃ¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¨Â¿Â½Ã¥ÂÂ Ã¥Â¾ÂÃ£ÂÂ«Ã¨ÂªÂ¿Ã¦ÂÂ´Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ"
      : `Ã£ÂÂÃ£ÂÂ®Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ¯ ${conflicts.map((item) => item.label).join(" / ")} Ã£ÂÂ¨Ã©ÂÂÃ£ÂÂªÃ£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ`)
    : "Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂ®Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ¯Ã¥ÂÂÃ£ÂÂÃ¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ¦ÂÂ¥Ã£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ¨Ã©ÂÂÃ£ÂÂªÃ£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ";

  if (!isNewGoal) {
    const rows = getEditableScheduleRows(draft);
    return `
      <div class="stack setup-schedule-roster">
        <div class="setup-section-intro">
          <h3 class="section-title">Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ¤Â¸ÂÃ¨Â¦Â§</h3>
          <p class="section-copy">Ã£ÂÂÃ£ÂÂ®Ã¤Â¸ÂÃ¨Â¦Â§Ã£ÂÂÃ£ÂÂÃ§Â·Â¨Ã©ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ£ÂÂ®Ã£ÂÂ¾Ã£ÂÂ¾Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ¨Ã¦ÂÂÃ¦ÂÂ¥Ã£ÂÂÃ§Â·Â¨Ã©ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
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
        <h3 class="section-title">Ã£ÂÂ»Ã£ÂÂÃ£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ®Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ</h3>
        <p class="section-copy">Ã¥ÂÂÃ£ÂÂÃ¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂÃ©ÂÂ¿Ã£ÂÂÃ£ÂÂÃ£ÂÂ¨Ã£ÂÂ1Ã¦ÂÂ¥Ã£ÂÂ«Ã¦ÂÂ±Ã£ÂÂÃ£ÂÂÃ¥ÂÂ¥Ã¥ÂÂ£Ã£ÂÂ®Ã¥Â¤ÂÃ£ÂÂÃ£ÂÂÃ¨Â¦ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
      </div>
      ${roster.length
        ? `
          <div class="goal-window-list">
            ${roster.map((item) => `
              <div class="goal-window-row ${item.overlaps && !isNewGoal ? "is-conflict" : ""}">
                <div class="goal-window-row__head">
                  <div class="goal-window-row__body">
                    <strong class="goal-window-row__name">${escapeHtml(item.label)}</strong>
                    <div class="goal-window-row__meta">Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ ${escapeHtml(item.window)} / ${escapeHtml(formatStudyDays(item.studyDays))}</div>
                  </div>
                  <div class="goal-window-row__actions">
                    <span class="status-badge ${item.overlaps && !isNewGoal ? "status-badge--danger" : ""}">${item.overlaps ? (isNewGoal ? "Ã¥Â¾ÂÃ£ÂÂ§Ã¨ÂªÂ¿Ã¦ÂÂ´" : "Ã©ÂÂÃ£ÂÂªÃ£ÂÂ") : (item.sharedDays.length ? "Ã¥ÂÂ¥Ã¦ÂÂÃ©ÂÂ" : "Ã¥ÂÂ¥Ã¦ÂÂÃ¦ÂÂ¥")}</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `
        : `<p class="section-copy">Ã£ÂÂ¾Ã£ÂÂ Ã¤Â»ÂÃ£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ</p>`}
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
          <span class="field__label">Ã¦ÂÂÃ¦ÂÂ¥</span>
          <p class="section-copy">Today Ã£ÂÂ«Ã£ÂÂ¯Ã£ÂÂÃ¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã¦ÂÂÃ¦ÂÂ¥Ã£ÂÂ«Ã¥ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ Ã£ÂÂÃ¨Â¡Â¨Ã§Â¤ÂºÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
          <div class="weekday-choice-row">
            ${WEEKDAY_KEYS.map((weekdayKey) => renderWeekdayChip(weekdayKey, draft.studyDays)).join("")}
          </div>
          <p class="section-copy">Ã§ÂÂ¾Ã¥ÂÂ¨: ${escapeHtml(formatStudyDays(draft.studyDays))}</p>
        </div>
        ${renderWindowField("Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ", "primaryStart", "primaryEnd", draft.primaryStart, draft.primaryEnd)}
      </div>
    `;
  }

  if (section === "roadmap") {
    return `
      <div class="stack">
        <div class="setup-section-intro">
          <h3 class="section-title">Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³</h3>
          <p class="section-copy">Roadmap Ã§ÂÂ»Ã©ÂÂ¢Ã£ÂÂ¯Ã¨Â¡Â¨Ã§Â¤ÂºÃ£ÂÂ Ã£ÂÂÃ£ÂÂ«Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ§Â·Â¨Ã©ÂÂÃ£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ§Ã£ÂÂ¾Ã£ÂÂ¨Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
        </div>
        ${renderRoadmapMilestoneList(buildEditableRoadmapPreview(), { editable: true })}
      </div>
    `;
  }

  if (section === "plan") {
    return `
      <div class="plan-list">
        ${renderEditablePlanCard("A", "normalMinutes", draft.normalMinutes, "Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂÃ£ÂÂ®Ã¦Â¨ÂÃ¦ÂºÂÃ£ÂÂÃ£ÂÂ©Ã£ÂÂ³")}
        ${renderEditablePlanCard("B", "shortMinutes", draft.shortMinutes, "Ã¥Â°ÂÃ£ÂÂÃ¨Â»Â½Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ§ÂÂ­Ã§Â¸Â®Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ³")}
        ${renderEditablePlanCard("C", "minimumMinutes", draft.minimumMinutes, "Ã¦ÂÂÃ¤Â½ÂÃ©ÂÂÃ£ÂÂ Ã£ÂÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂÃ¦ÂÂÃ¦Â¸ÂÃ£ÂÂÃ£ÂÂ©Ã£ÂÂ³")}
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
      <p class="section-copy">Ã¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¨Ã£ÂÂÃ¤Â»ÂÃ£ÂÂ® Today Ã£ÂÂ¯Ã¥Â¤ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ«Ã¦ÂÂ°Ã£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ Ã£ÂÂÃ¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
      <div class="field">
        <span class="field__label">Ã§Â¨Â®Ã©Â¡Â</span>
        <div class="goal-type-toggle">
          <button type="button" class="goal-type-btn ${!isHabitDraft ? "is-active" : ""}" data-action="select-goal-type" data-goal-type="goal">
            <span class="goal-type-btn__icon">Ã°ÂÂÂ¯</span>
            <span class="goal-type-btn__label">Ã§ÂÂ®Ã¦Â¨ÂÃ©ÂÂÃ¦ÂÂ</span>
          </button>
          <button type="button" class="goal-type-btn ${isHabitDraft ? "is-active" : ""}" data-action="select-goal-type" data-goal-type="habit">
            <span class="goal-type-btn__icon">Ã°ÂÂÂ¿</span>
            <span class="goal-type-btn__label">Ã§Â¿ÂÃ¦ÂÂ£</span>
          </button>
        </div>
      </div>
      <label class="field">
        <span class="field__label">Ã§ÂÂ®Ã¦Â¨Â</span>
        <input class="field__control" data-setup-field="goal" type="text" value="${escapeHtml(draft.goal)}" />
      </label>
      ${!isHabitDraft ? `
        <div class="field">
          <span class="field__label">Ã¦ÂÂÃ©ÂÂÃ¯Â¼ÂÃ§Â©ÂºÃ¦Â¬ÂÃ£ÂÂ§Ã¦ÂÂÃ©ÂÂÃ£ÂÂªÃ£ÂÂÃ¯Â¼Â</span>
          <input class="field__control" data-setup-field="deadline" type="date" value="${escapeHtml(draft.deadline)}" />
        </div>
        ${renderFlowerPicker(draft.flowerType, "select-setup-flower")}
        <p class="section-copy">Ã¤Â¸ÂÃ£ÂÂ®Ã¨Â¨Â­Ã¥Â®ÂÃ£ÂÂ¡Ã£ÂÂÃ£ÂÂ¥Ã£ÂÂ¼Ã£ÂÂÃ£ÂÂ Roadmap / Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ / Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ³Ã£ÂÂÃ£ÂÂÃ£ÂÂ®Ã£ÂÂ¾Ã£ÂÂ¾Ã¦Â±ÂºÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
      ` : `
        ${renderBonsaiPicker(draft.bonsaiKey)}
        <p class="section-copy">Ã§Â¿ÂÃ¦ÂÂ£Ã£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ¯ Roadmap Ã£ÂÂÃ¤Â¸ÂÃ¨Â¦ÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂÃ¦Â¯ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã£ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ¯Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂ§Ã§ÂÂÃ¦Â Â½Ã£ÂÂÃ¨ÂÂ²Ã£ÂÂ¡Ã£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
      `}
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
    ? "Ã¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¨Ã¤Â¸ÂÃ¨Â¦Â§Ã£ÂÂ«Ã¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂToday Ã£ÂÂ¯Ã¤Â»ÂÃ£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ®Ã£ÂÂ¾Ã£ÂÂ¾Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ"
    : "Ã§ÂÂ»Ã©ÂÂ²Ã¦Â¸ÂÃ£ÂÂ¿Ã£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ§Ã§Â·Â¨Ã©ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¨Â¡Â¨Ã§Â¤ÂºÃ£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ¯Ã¨Â¨Â­Ã¥Â®ÂÃ£ÂÂ¡Ã£ÂÂÃ£ÂÂ¥Ã£ÂÂ¼Ã¤Â¸ÂÃ£ÂÂ®Ã©ÂÂ¸Ã¦ÂÂÃ£ÂÂ¿Ã£ÂÂÃ£ÂÂ§Ã¥ÂÂÃ£ÂÂÃ¦ÂÂ¿Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ";

  return `
    <div class="stack">
      <div class="setup-section-intro goal-library__intro">
        <h3 class="section-title">Ã§ÂÂ»Ã©ÂÂ²Ã¦Â¸ÂÃ£ÂÂ¿Ã£ÂÂ®Ã§ÂÂ®Ã¦Â¨Â</h3>
        <p class="section-copy">${escapeHtml(intro)}</p>
      </div>
      <div class="goal-library">
        ${goals.map((goal) => {
          const isActive = goal.id === state.meta.activeGoalId;
          const isEditing = editingGoalId === goal.id;
          const deadlineText = normalizeOptionalDate(isEditing ? ui.goalLibraryDraft?.deadline : goal.setup.deadline);
          const isHabitGoal = goal.setup && goal.setup.goalType === "habit";
          const flower = isHabitGoal ? null : getGoalFlowerState(goal);
          const bonsaiMeta = isHabitGoal ? getBonsaiTypeMeta(goal.setup.bonsaiKey) : null;
          const meta = isHabitGoal
            ? `Ã§Â¿ÂÃ¦ÂÂ£ / ${bonsaiMeta.label}`
            : `${formatDeadlineBadge(deadlineText)} / Ã¦Â¤ÂÃ§ÂÂ© ${flower.label}`;
          return `
            <article class="goal-library-card ${isActive ? "is-active" : ""}">
              <div class="goal-library-card__head">
                <strong>${escapeHtml(isEditing ? ui.goalLibraryDraft.goal : goal.setup.goal)}</strong>
                <span class="status-badge ${isActive ? "status-badge--done" : ""}">${isActive ? "Ã¨Â¡Â¨Ã§Â¤ÂºÃ¤Â¸Â­" : "Ã¤Â¿ÂÃ¥Â­ÂÃ¦Â¸ÂÃ£ÂÂ¿"}</span>
              </div>
              ${isEditing
                ? `
                  <div class="goal-library-card__editor">
                    <div class="field">
                      <span class="field__label">Ã§Â¨Â®Ã©Â¡Â</span>
                      <div class="goal-type-toggle goal-type-toggle--compact">
                        <button type="button" class="goal-type-btn ${ui.goalLibraryDraft.goalType !== "habit" ? "is-active" : ""}" data-action="select-goal-library-type" data-goal-type="goal">
                          <span class="goal-type-btn__icon">Ã°ÂÂÂ¯</span>
                          <span class="goal-type-btn__label">Ã§ÂÂ®Ã¦Â¨ÂÃ©ÂÂÃ¦ÂÂ</span>
                        </button>
                        <button type="button" class="goal-type-btn ${ui.goalLibraryDraft.goalType === "habit" ? "is-active" : ""}" data-action="select-goal-library-type" data-goal-type="habit">
                          <span class="goal-type-btn__icon">Ã°ÂÂÂ¿</span>
                          <span class="goal-type-btn__label">Ã§Â¿ÂÃ¦ÂÂ£</span>
                        </button>
                      </div>
                    </div>
                    <label class="field">
                      <span class="field__label">Ã§ÂÂ®Ã¦Â¨Â</span>
                      <input class="field__control" data-goal-library-field="goal" type="text" value="${escapeHtml(ui.goalLibraryDraft.goal)}" />
                    </label>
                    ${ui.goalLibraryDraft.goalType === "habit"
                      ? renderBonsaiPicker(ui.goalLibraryDraft.bonsaiKey, "select-goal-library-bonsai")
                      : `<label class="field">
                          <span class="field__label">Ã¦ÂÂÃ©ÂÂÃ¯Â¼ÂÃ§Â©ÂºÃ¦Â¬ÂÃ£ÂÂ§Ã¦ÂÂÃ©ÂÂÃ£ÂÂªÃ£ÂÂÃ¯Â¼Â</span>
                          <input class="field__control" data-goal-library-field="deadline" type="date" value="${escapeHtml(ui.goalLibraryDraft.deadline)}" />
                        </label>
                        ${renderFlowerPicker(ui.goalLibraryDraft.flowerType, "select-goal-library-flower", { compact: true })}`}
                    <div class="goal-library-card__actions">
                      <button type="button" class="soft-button goal-library-card__action" data-action="save-goal-library-edit">Ã¤Â¿ÂÃ¥Â­Â</button>
                      <button type="button" class="soft-button goal-library-card__action" data-action="cancel-goal-library-edit">Ã©ÂÂÃ£ÂÂÃ£ÂÂ</button>
                    </div>
                  </div>
                `
                : ui.deleteConfirmGoalId === goal.id
                  ? `
                    <p class="goal-library-card__delete-warn">Ã¢ÂÂ Ã¯Â¸Â Ã£ÂÂÃ£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¥Â®ÂÃ¥ÂÂ¨Ã¦Â¶ÂÃ¥ÂÂ»Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¯Â¼ÂÃ¥ÂÂÃ£ÂÂ«Ã¦ÂÂ»Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ</p>
                    <div class="goal-library-card__actions">
                      <button type="button" class="soft-button goal-library-card__action goal-library-card__action--danger" data-action="delete-goal" data-goal-id="${goal.id}">Ã¥Â®ÂÃ¥ÂÂ¨Ã¦Â¶ÂÃ¥ÂÂ»Ã£ÂÂÃ£ÂÂ</button>
                      <button type="button" class="soft-button goal-library-card__action" data-action="cancel-delete-goal">Ã£ÂÂÃ£ÂÂÃ£ÂÂ</button>
                    </div>
                  `
                  : `
                    <p class="goal-library-card__meta">${escapeHtml(meta)}</p>
                    ${isActive ? `<p class="goal-library-card__note">${escapeHtml(isGoalScheduledForDate(goal) ? "Ã£ÂÂÃ£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ¯Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ® Today Ã£ÂÂ«Ã¥ÂÂºÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ" : "Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ¯Ã¨Â¡Â¨Ã§Â¤ÂºÃ¥Â¯Â¾Ã¨Â±Â¡Ã¥Â¤ÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ")}</p>` : ""}
                    <div class="goal-library-card__actions">
                      <button type="button" class="soft-button goal-library-card__action" data-action="start-goal-library-edit" data-goal-id="${goal.id}">Ã§Â·Â¨Ã©ÂÂ</button>
                      <button type="button" class="soft-button goal-library-card__action" data-action="archive-goal" data-goal-id="${goal.id}">Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂÃ£ÂÂ Ã£ÂÂ¸</button>
                      <button type="button" class="soft-button goal-library-card__action goal-library-card__action--danger" data-action="confirm-delete-goal" data-goal-id="${goal.id}">Ã¥Â®ÂÃ¥ÂÂ¨Ã¦Â¶ÂÃ¥ÂÂ»</button>
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
  const isHabit = goal.setup && goal.setup.goalType === "habit";
  if (isHabit) {
    return renderTodayHabitCard(goal, index);
  }
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
          <span class="status-badge ${escapeHtml(missionState.badgeClass || "")}">${escapeHtml(missionState.isClosed ? "Ã¥Â®ÂÃ¦ÂÂ½Ã¦Â¸ÂÃ£ÂÂ¿" : missionState.badge)}</span>
        </div>
        <div class="focus-launch__goal-timing">
          <span class="focus-launch__goal-deadline">${escapeHtml(formatDeadlineBadge(goal.setup.deadline))}</span>
          <span class="focus-launch__goal-slot">Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ ${escapeHtml(goal.setup.primaryWindow)}</span>
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
                <span class="focus-plan-button__meta">${PLAN_META[planKey].tag} / ${goal.plans[planKey].minutes}Ã¥ÂÂ</span>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderTodayHabitCard(goal, index) {
  const today = toISODate(new Date());
  const todayLog = (goal.logs || []).find(l => l.date === today && l.outcome !== "miss");
  const isDone = Boolean(todayLog);
  const growth = getBonsaiGrowth(goal.logs || []);
  const health = getBonsaiHealth(goal.logs || [], goal.setup.studyDays);
  const bonsaiKey = goal.setup.bonsaiKey || "pine";
  const bonsaiMeta = getBonsaiTypeMeta(bonsaiKey);
  const isActiveGoal = goal.id === state.meta.activeGoalId;
  const selectedPlanKey = isActiveGoal
    ? (goal.activeSession ? goal.activeSession.planKey : "A")
    : "";
  const cardClass = `${index === 0 ? "" : " focus-launch--stacked"} ${isActiveGoal ? "is-active-goal" : "is-inactive-goal"} ${isDone ? "is-complete-goal" : "is-pending-goal"}`;

  return `
    <section class="focus-launch focus-launch--minimal focus-launch--habit${cardClass}" style="view-transition-name: goal-card-${goal.id}">
      <div class="focus-launch__halo" aria-hidden="true"></div>
      <div class="focus-launch__goal-meta">
        <div class="focus-launch__status-row">
          <span class="status-badge ${isDone ? "status-badge--done" : "status-badge--accent"}">${isDone ? "Ã¥Â®ÂÃ¤ÂºÂÃ¦Â¸ÂÃ£ÂÂ¿" : "Ã¦ÂÂªÃ¥Â®ÂÃ¤ÂºÂ"}</span>
          <span class="status-badge">Ã§Â¿ÂÃ¦ÂÂ£</span>
        </div>
        <div class="focus-launch__goal-timing">
          <span class="focus-launch__goal-slot">${escapeHtml(bonsaiMeta.label)} / ${escapeHtml(growth.stageLabel)}</span>
          ${(() => { const w = goal.setup.primaryWindow || (goal.setup.primaryStart && goal.setup.primaryEnd ? `${goal.setup.primaryStart}-${goal.setup.primaryEnd}` : ""); return w ? `<span class="focus-launch__goal-slot">Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ ${escapeHtml(w)}</span>` : ""; })()}
        </div>
      </div>
      <div class="focus-launch__title-row">
        <h1 class="focus-launch__goal focus-launch__goal--solo">${escapeHtml(goal.setup.goal)}</h1>
        <div class="focus-launch__flower-panel">
          ${renderBonsaiArtwork(bonsaiKey, growth.stageIndex, health, { size: "card" })}
        </div>
      </div>
      <div class="choice-row focus-plan-row focus-plan-row--minimal">
        ${Object.keys(goal.plans)
          .map(
            (planKey) => `
              <button type="button" class="pill-button focus-plan-button ${selectedPlanKey === planKey ? "is-active" : ""}" data-action="launch-session-plan" data-goal-id="${goal.id}" data-plan="${planKey}">
                <span class="focus-plan-button__label">${PLAN_META[planKey].label}</span>
                <span class="focus-plan-button__meta">${PLAN_META[planKey].tag} / ${goal.plans[planKey].minutes}Ã¥ÂÂ</span>
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="bonsai-health-row">
        ${renderStreakDots(goal.logs || [], goal.setup.studyDays)}
      </div>
    </section>
  `;
}

function renderActiveGoalContext(options = {}) {
  const goals = options.sortByPrimaryWindow ? listGoalsByPrimaryWindow() : listGoals();

  return `
    <details class="goal-selector">
      <summary>
        <span class="hero__context goal-selector__current">Ã¥Â¯Â¾Ã¨Â±Â¡Ã§ÂÂ®Ã¦Â¨Â: ${escapeHtml(state.setup.goal)}</span>
        <span class="goal-selector__button">Ã©ÂÂ¸Ã¦ÂÂ</span>
      </summary>
      <div class="goal-selector__body">
        ${goals.map((goal) => {
          const isActive = goal.id === state.meta.activeGoalId;
          const isHabit = goal.setup?.goalType === "habit";
          const typeClass = isHabit ? "goal-selector__option--habit" : "goal-selector__option--goal";
          return `
            <button
              type="button"
              class="goal-selector__option ${typeClass} ${isActive ? "is-active" : ""}"
              data-action="activate-goal"
              data-goal-id="${goal.id}"
              ${isActive ? "disabled" : ""}
            >
              <span class="goal-selector__option-title">${escapeHtml(goal.setup.goal)}</span>
              <span class="goal-selector__option-state">${isActive ? "Ã¨Â¡Â¨Ã§Â¤ÂºÃ¤Â¸Â­" : "Ã©ÂÂ¸Ã£ÂÂ¶"}</span>
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
  const saveLabel = state.meta.demoMode || isNewGoal ? "Ã£ÂÂÃ£ÂÂ®Ã¥ÂÂÃ¥Â®Â¹Ã£ÂÂ§Ã¥Â§ÂÃ£ÂÂÃ£ÂÂ" : "Ã¥Â¤ÂÃ¦ÂÂ´Ã£ÂÂÃ¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂ";
  const sectionTitle = activeSectionKey === "goal" ? (isNewGoal ? "Ã§ÂÂ®Ã¦Â¨ÂÃ¨Â¿Â½Ã¥ÂÂ " : "Ã§ÂÂ®Ã¦Â¨ÂÃ§Â·Â¨Ã©ÂÂ") : activeSection.title;
  const newGoalSectionCopy = {
    roadmap: "Ã¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ®Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ§Ã¦Â±ÂºÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
    schedule: "Ã¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ®Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ¦ÂÂ¥Ã£ÂÂ¨Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ§Ã¦Â±ÂºÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
    plan: "Ã¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ® Plan A / B / C Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ§Ã¦Â±ÂºÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
  };
  const sectionCopy = activeSectionKey === "goal"
    ? (isNewGoal ? "Ã¤Â»ÂÃ£ÂÂ® Today Ã£ÂÂ¯Ã¥Â¤ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ«Ã£ÂÂÃ¦ÂÂ°Ã£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ" : activeSection.copy)
    : (isNewGoal ? newGoalSectionCopy[activeSectionKey] || activeSection.copy : activeSection.copy);
  const showSaveAction = !(activeSectionKey === "goal" && !isNewGoal);
  const isHabitMode = isNewGoal ? draft.goalType === "habit" : state.setup.goalType === "habit";
  const setupMenu = [
    renderSetupMenuItem({
      action: "start-new-goal",
      section: "goal",
      label: "Ã§ÂÂ®Ã¦Â¨ÂÃ¨Â¿Â½Ã¥ÂÂ ",
      hint: "Ã¥ÂÂ¥Ã£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¥Â¢ÂÃ£ÂÂÃ£ÂÂ",
      iconKey: "add",
      active: isNewGoal && activeSectionKey === "goal",
    }),
    renderSetupMenuItem({
      action: "edit-current-goal",
      section: "goal",
      label: "Ã§ÂÂ®Ã¦Â¨ÂÃ§Â·Â¨Ã©ÂÂ",
      hint: "Ã§ÂÂ»Ã©ÂÂ²Ã¦Â¸ÂÃ£ÂÂ¿Ã£ÂÂÃ§ÂÂ´Ã£ÂÂ",
      iconKey: "goal",
      active: !isNewGoal && activeSectionKey === "goal",
    }),
    !isHabitMode && renderSetupMenuItem({
      action: "select-setup-section",
      section: "roadmap",
      label: "Roadmap",
      hint: "Ã§Â¯ÂÃ§ÂÂ®Ã£ÂÂÃ¦ÂÂ´Ã£ÂÂÃ£ÂÂ",
      iconKey: "roadmap",
      active: activeSectionKey === "roadmap",
    }),
    renderSetupMenuItem({
      action: "select-setup-section",
      section: "schedule",
      label: "Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ",
      hint: "Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂÃ£ÂÂÃ£ÂÂ",
      iconKey: "schedule",
      active: activeSectionKey === "schedule",
    }),
    renderSetupMenuItem({
      action: "select-setup-section",
      section: "plan",
      label: "Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ³",
      hint: "A / B / C Ã£ÂÂ®Ã¥Â¹Â",
      iconKey: "plan",
      active: activeSectionKey === "plan",
    }),
  ].filter(Boolean).join("");

  return `
    <section class="screen screen--setup">
      <section class="setup-layout setup-layout--menu">
        <aside class="setup-nav setup-nav--menu">
          <div class="setup-nav__lead">
            <p class="setup-nav__eyebrow">Settings</p>
            <strong>Ã¥Â¤ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ®Ã£ÂÂÃ©ÂÂ¸Ã£ÂÂ¶</strong>
          </div>
          <div class="setup-nav__list">${setupMenu}</div>
          <div class="setup-nav__data-actions">
            <button type="button" class="ghost-button setup-nav__data-btn" data-action="export-data">Ã£ÂÂ¨Ã£ÂÂ¯Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ</button>
            <button type="button" class="ghost-button setup-nav__data-btn" data-action="import-data">Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ</button>
          </div>
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
              ${isNewGoal ? '<span class="status-badge status-badge--accent">Ã¨Â¿Â½Ã¥ÂÂ Ã¤Â¸Â­</span>' : ""}
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
      <div class="focus-goal-list">
        ${goals.length
          ? goals.map((goal, index) => renderTodayGoalCard(goal, index)).join("")
          : `
            <section class="panel panel--warm stack">
              <span class="status-badge">Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ¯${escapeHtml(weekdayLabel(todayKey))}</span>
              <h2 class="section-title">Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ¯Ã¨Â¡Â¨Ã§Â¤ÂºÃ£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</h2>
              <p class="section-copy">Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ¦ÂÂ¥Ã£ÂÂ ${escapeHtml(weekdayLabel(todayKey))} Ã£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂ Today Ã£ÂÂ«Ã¨Â¡Â¨Ã§Â¤ÂºÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¨Â¨Â­Ã¥Â®ÂÃ£ÂÂ®Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂÃ¦ÂÂÃ¦ÂÂ¥Ã£ÂÂÃ¥Â¤ÂÃ¦ÂÂ´Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
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
      badge: "Ã¦ÂÂªÃ¥Â®ÂÃ¤ÂºÂ",
      title: "Ã£ÂÂ¾Ã£ÂÂ Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®1Ã¦ÂÂ¬Ã£ÂÂ¯Ã§ÂµÂÃ£ÂÂÃ£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ",
      detail: "Ã§ÂµÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂ§Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ®1Ã¦ÂÂ¬Ã£ÂÂ Ã£ÂÂÃ£ÂÂÃ¥ÂÂªÃ¥ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ°Ã¥ÂÂÃ¥ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ",
      showPendingCue: true,
      isClosed: false,
    };
  }

  if (!isSameMissionLog(currentState, todayLog)) {
    return {
      panelClass: "panel--focus",
      badgeClass: "status-badge--accent",
      badge: "Ã§ÂÂ®Ã¦Â¨ÂÃ¦ÂÂ´Ã¦ÂÂ°Ã¥Â¾Â",
      title: "Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ¦ÂÂ´Ã¦ÂÂ°Ã£ÂÂÃ£ÂÂÃ£ÂÂ®Ã£ÂÂ§Ã£ÂÂÃ¦ÂÂ°Ã£ÂÂÃ£ÂÂ1Ã¦ÂÂ¬Ã£ÂÂ¯Ã£ÂÂ¾Ã£ÂÂ Ã¦ÂÂªÃ§ÂÂÃ¦ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ",
      detail: `Ã¥ÂÂÃ£ÂÂ®Ã¨Â¨ÂÃ©ÂÂ²: ${buildLogSummary(todayLog)}`,
      showPendingCue: true,
      isClosed: false,
    };
  }

  if (todayLog.outcome === "miss") {
    return {
      panelClass: "panel--miss",
      badgeClass: "status-badge--danger",
      badge: "Ã¦ÂÂªÃ¥Â®ÂÃ¦ÂÂ½",
      title: "Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ¯Ã£ÂÂ¾Ã£ÂÂ Ã©ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ",
      detail: buildLogSummary(todayLog),
      showPendingCue: true,
      isClosed: false,
    };
  }

  return {
    panelClass: "panel--done",
    badgeClass: "status-badge--done",
    badge: "Ã¥Â®ÂÃ¤ÂºÂÃ¦Â¸ÂÃ£ÂÂ¿",
    title: "Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®1Ã¦ÂÂ¬Ã£ÂÂ¯Ã¨Â¨ÂÃ©ÂÂ²Ã¦Â¸ÂÃ£ÂÂ¿Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ",
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
  const isGoal = Boolean(options.isGoal);
  const deadlineLabel = milestone.deadline ? `Ã¦ÂÂÃ©ÂÂ ${milestone.deadline}` : "";
  const targetLabel = Number.isFinite(Number(milestone.target)) ? `Ã¥ÂÂ¨Ã¤Â½ÂÃ§ÂÂ®Ã¥Â®Â ${Math.round(Number(milestone.target))}%` : "";

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
            <button type="button" class="ghost-button" data-action="open-roadmap-editor" data-roadmap-id="${escapeHtml(milestone.id)}">Ã¤Â¿Â®Ã¦Â­Â£</button>
            <button type="button" class="ghost-button" data-action="delete-roadmap-item" data-roadmap-id="${escapeHtml(milestone.id)}">Ã¥ÂÂÃ©ÂÂ¤</button>
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
      <button type="button" class="milestone-add-button" data-action="open-roadmap-editor" aria-label="Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂÃ¨Â¿Â½Ã¥ÂÂ "${afterAttr}></button>
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
      : `<p class="preview-empty">Ã£ÂÂ¾Ã£ÂÂ Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ</p>`;
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

  // Ã©ÂÂ²Ã¨Â¦Â§Ã£ÂÂ¢Ã£ÂÂ¼Ã£ÂÂ: Ã£ÂÂ¹Ã£ÂÂ¿Ã£ÂÂ¼Ã£ÂÂÃ¢ÂÂÃ£ÂÂ´Ã£ÂÂ¼Ã£ÂÂ«Ã£ÂÂ®Ã©Â ÂÃ£ÂÂ§Ã¨Â¡Â¨Ã§Â¤ÂºÃ¯Â¼ÂÃ£ÂÂÃ£ÂÂ¼Ã£ÂÂ¿Ã£ÂÂ¯Ã©ÂÂÃ©Â ÂÃ¯Â¼Â
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
    return `<p class="preview-empty">Ã£ÂÂ¾Ã£ÂÂ Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ</p>`;
  }

  const overallProgress = clamp(Math.round(Number(roadmap.learningProgress) || 0), 0, 100);
  const target = Math.max(1, Number(milestone.target) || 1);
  const achievementRate = milestone.isComplete
    ? 100
    : clamp(Math.round((overallProgress / target) * 100), 0, 100);
  const statusLabel = milestone.isComplete ? "Ã¥ÂÂ°Ã©ÂÂÃ¦Â¸ÂÃ£ÂÂ¿" : "Ã©ÂÂ²Ã¨Â¡ÂÃ¤Â¸Â­";
  const deadlineLabel = milestone.deadline ? `Ã¦ÂÂÃ©ÂÂ ${milestone.deadline}` : "Ã¦ÂÂÃ©ÂÂÃ£ÂÂªÃ£ÂÂ";

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
          <span class="roadmap-focus-card__value-label">Ã¥ÂÂ¨Ã¤Â½ÂÃ©ÂÂ²Ã¦ÂÂ</span>
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

function renderRoadmapView() {
  if (state.setup.goalType === "habit") return renderHabitStreakRoadmap();
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
          <span class="status-badge">${roadmap.daysRemaining == null ? "Ã¦ÂÂÃ©ÂÂÃ£ÂÂªÃ£ÂÂ" : `Ã¦Â®ÂÃ£ÂÂ ${formatRemainingSpan(roadmap.daysRemaining)}`}</span>
        </div>
        <div>
          <h2 class="section-title">Ã§ÂÂ¾Ã¥ÂÂ¨Ã£ÂÂ®Ã©ÂÂÃ¦ÂÂÃ§ÂÂ¶Ã¦Â³Â</h2>
        </div>
        ${renderRoadmapCurrentStatus(roadmap)}
        <div>
          <h2 class="section-title">Ã¥ÂÂ¨Ã¤Â½ÂÃ£ÂÂ®Ã£ÂÂ­Ã£ÂÂ¼Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ</h2>
        </div>
        ${renderRoadmapMilestoneList(roadmap)}
      </section>
    </section>
  `;
}

function renderHabitStreakRoadmap() {
  const growth = getBonsaiGrowth(state.logs || []);
  const executedDays = growth.executedDays;
  const bonsaiMeta = getBonsaiTypeMeta(state.setup.bonsaiKey || "pine");
  const milestones = [
    { days: 7,   label: "7Ã¦ÂÂ¥",   desc: "Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ®Ã¥Â£ÂÃ£ÂÂÃ¨Â¶ÂÃ£ÂÂÃ£ÂÂ",       emoji: "Ã°ÂÂÂ±" },
    { days: 21,  label: "21Ã¦ÂÂ¥",  desc: "Ã£ÂÂªÃ£ÂÂºÃ£ÂÂ Ã£ÂÂÃ§ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ",   emoji: "Ã°ÂÂªÂ´" },
    { days: 66,  label: "66Ã¦ÂÂ¥",  desc: "Ã¨ÂÂªÃ¥ÂÂÃ¥ÂÂÃ£ÂÂ®Ã¥ÂÂ¥Ã£ÂÂÃ¥ÂÂ£",         emoji: "Ã°ÂÂÂ³" },
    { days: 100, label: "100Ã¦ÂÂ¥", desc: "Ã¦ÂÂ¬Ã§ÂÂ©Ã£ÂÂ®Ã§Â¿ÂÃ¦ÂÂ£Ã£ÂÂ¸",           emoji: "Ã°ÂÂÂ" },
    { days: 365, label: "1Ã¥Â¹Â´",   desc: "Ã¤ÂºÂºÃ§ÂÂÃ£ÂÂÃ¥Â¤ÂÃ£ÂÂÃ£ÂÂ£Ã£ÂÂ",         emoji: "Ã¢ÂÂ©Ã¯Â¸Â" },
  ];
  const nextMilestone = milestones.find(m => executedDays < m.days);
  const daysToNext = nextMilestone ? nextMilestone.days - executedDays : 0;
  return `
    <section class="screen">
      <div class="hero"><div class="hero__sticky"><div class="hero__accent"></div>${renderActiveGoalContext()}</div></div>
      <section class="panel panel--cool stack">
        <div class="status-strip"><span class="status-badge">${escapeHtml(bonsaiMeta.label)} / ${escapeHtml(growth.stageLabel)}</span></div>
        <div style="text-align:center;padding:8px 0 4px">
          <p style="font-size:3rem;margin:0;line-height:1.1">${executedDays}</p>
          <p style="font-size:0.85rem;color:var(--muted);margin:4px 0 0">Ã¥Â®ÂÃ¦ÂÂ½Ã£ÂÂÃ£ÂÂÃ¦ÂÂ¥Ã¦ÂÂ°</p>
        </div>
        ${nextMilestone ? `<div style="font-size:0.82rem;color:var(--muted);text-align:center">Ã¦Â¬Â¡Ã£ÂÂ®Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂ${escapeHtml(nextMilestone.label)}Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂ§ Ã£ÂÂÃ£ÂÂ¨ <strong style="color:var(--ink)">${daysToNext}Ã¦ÂÂ¥</strong></div>` : `<div style="font-size:0.88rem;text-align:center;color:var(--accent)">Ã°ÂÂÂ Ã£ÂÂÃ£ÂÂ¹Ã£ÂÂ¦Ã£ÂÂ®Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂÃ©ÂÂÃ¦ÂÂÃ¯Â¼Â</div>`}
      </section>
      <section class="panel stack">
        <h2 class="section-title">Ã§Â¿ÂÃ¦ÂÂ£Ã£ÂÂ®Ã©ÂÂÃ£ÂÂ®Ã£ÂÂ</h2>
        <div class="stack" style="gap:10px">
          ${milestones.map(m => {
            const done = executedDays >= m.days;
            const isCurrent = nextMilestone && nextMilestone.days === m.days;
            const pct = Math.min(100, Math.round(executedDays / m.days * 100));
            return `<div style="border-radius:14px;padding:14px 16px;background:${done ? "var(--panel-bg,rgba(255,253,246,0.9))" : "rgba(0,0,0,0.03)"};border:1.5px solid ${done ? "var(--accent,#c75e33)" : isCurrent ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.07)"};opacity:${done || isCurrent ? "1" : "0.55"}">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:${isCurrent ? "8px" : "0"}">
                <span style="font-size:1.4rem">${m.emoji}</span>
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;align-items:baseline">
                    <strong style="font-size:0.95rem">${escapeHtml(m.label)}</strong>
                    <span style="font-size:0.78rem;color:var(--muted)">${done ? "Ã¢ÂÂ Ã©ÂÂÃ¦ÂÂ" : `${executedDays}/${m.days}Ã¦ÂÂ¥`}</span>
                  </div>
                  <p style="font-size:0.8rem;color:var(--muted);margin:2px 0 0">${escapeHtml(m.desc)}</p>
                </div>
              </div>
              ${isCurrent ? `<div style="background:rgba(0,0,0,0.08);border-radius:99px;height:5px;overflow:hidden"><div style="height:100%;width:${pct}%;background:var(--accent,#c75e33);border-radius:99px"></div></div>` : ""}
            </div>`;
          }).join("")}
        </div>
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
          <h2 class="panel__title">${isEdit ? "Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂÃ¤Â¿Â®Ã¦Â­Â£" : "Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³Ã£ÂÂÃ¨Â¿Â½Ã¥ÂÂ "}</h2>
        </div>
        <label class="field">
          <span class="field__label">Ã£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ«</span>
          <input class="field__control" data-roadmap-field="label" type="text" value="${escapeHtml(draft.label || "")}" placeholder="Ã¦Â¨Â¡Ã¨Â©Â¦Ã£ÂÂ§70% / 3Ã¥ÂÂÃ©ÂÂÃ£ÂÂÃ¤Â¸ÂÃ¥ÂÂ¨ Ã£ÂÂªÃ£ÂÂ©" />
        </label>
        <div class="field-grid field-grid--two">
          <label class="field">
            <span class="field__label">Ã¦ÂÂÃ©ÂÂ</span>
            <input class="field__control" data-roadmap-field="deadline" type="date" value="${escapeHtml(draft.deadline || "")}" ${isGoalItem ? "disabled" : ""} />
          </label>
          <label class="field">
            <span class="field__label">Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ®Ã¥Â®Â (%)</span>
            <input class="field__control" data-roadmap-field="target" type="number" min="0" max="100" value="${escapeHtml(String(draft.target ?? 0))}" />
          </label>
        </div>
        ${isGoalItem ? '<p class="section-copy">Ã¦ÂÂÃ§ÂµÂÃ¦ÂÂÃ©ÂÂÃ£ÂÂ¯Ã§ÂÂ®Ã¦Â¨ÂÃ§Â·Â¨Ã©ÂÂÃ£ÂÂ§Ã¥Â¤ÂÃ¦ÂÂ´Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>' : ''}
        <div class="action-row milestone-editor__actions">
          <button type="button" class="action-button action-button--primary" data-action="save-roadmap-item">${isEdit ? "Ã¤Â¿Â®Ã¦Â­Â£Ã£ÂÂÃ¤Â¿ÂÃ¥Â­Â" : "Ã¨Â¿Â½Ã¥ÂÂ Ã£ÂÂÃ£ÂÂ"}</button>
          <button type="button" class="soft-button" data-action="cancel-roadmap-editor">Ã©ÂÂÃ£ÂÂÃ£ÂÂ</button>
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
          ${renderMetricCard("7Ã¦ÂÂ¥Ã¥Â®ÂÃ¨Â¡ÂÃ§ÂÂ", metrics.executionRate)}
          ${renderMetricCard("Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ¿Ã£ÂÂ«Ã¥ÂÂÃ¥Â¼Â·Ã¦ÂÂÃ©ÂÂ", formatLoggedDuration(totalStudySeconds), "")}
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
  const isHabit = goal.setup && goal.setup.goalType === "habit";
  const flower = isHabit ? null : getGoalFlowerState(goal);
  const bonsaiGrowth = isHabit ? getBonsaiGrowth(goal.logs || []) : null;
  const bonsaiHealth = isHabit ? getBonsaiHealth(goal.logs || [], goal.setup.studyDays) : null;
  const bonsaiMeta = isHabit ? getBonsaiTypeMeta(goal.setup.bonsaiKey) : null;
  const roadmap = isHabit ? { learningProgress: 0 } : computeRoadmap(goal);
  const todayLog = getGoalLogByDate(goal, toISODate(new Date()));
  const missionState = getGoalMissionStateForDate(goal);
  const statusCopy = isHabit
    ? `${bonsaiMeta.label} / ${bonsaiGrowth.stageLabel}`
    : (missionState.isClosed && todayLog
      ? buildLogSummary(todayLog)
      : `${flower.label} / ${flower.stageLabel}`);

  return `
    <section class="panel panel--garden stack">
      <div class="review-pot-card">
        <div class="review-pot-card__copy">
          <div class="status-strip">
            <span class="status-badge status-badge--done">Ã©ÂÂ¸Ã¦ÂÂÃ¤Â¸Â­</span>
            ${isHabit
              ? `<span class="status-badge">Ã§Â¿ÂÃ¦ÂÂ£</span>`
              : `<span class="status-badge ${isGoalAchieved(goal) ? "status-badge--done" : "status-badge--accent"}">${isGoalAchieved(goal) ? "Ã©ÂÂÃ¦ÂÂÃ¦Â¸ÂÃ£ÂÂ¿" : "Ã¨ÂÂ²Ã¦ÂÂÃ¤Â¸Â­"}</span>`}
          </div>
          <div class="stack stack--tight">
            <h2 class="section-title">${escapeHtml(goal.setup.goal)}</h2>
            <p class="section-copy">${escapeHtml(statusCopy)}</p>
            ${todayLog && isExecutionOutcome(todayLog.outcome)
              ? `<div class="review-pot-card__actions">
                  <button type="button" class="ghost-button" data-action="open-review-log-editor" data-log-id="${escapeHtml(todayLog.logId)}">Ã£ÂÂÃ£ÂÂ®Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¤Â¿Â®Ã¦Â­Â£</button>
                </div>`
              : ""}
          </div>
        </div>
        <div class="review-pot-card__scene" aria-hidden="true">
          <div class="review-pot-card__glow"></div>
          <div class="review-pot-card__flower">
            ${isHabit
              ? renderBonsaiArtwork(goal.setup.bonsaiKey, bonsaiGrowth.stageIndex, bonsaiHealth, { size: "review-pot" })
              : renderFlowerArtwork(flower.key, flower.stageIndex, { size: "review-pot", showSoil: false })}
          </div>
          <div class="review-pot-card__pot"></div>
        </div>
        <div class="review-pot-card__facts">
          <div class="review-pot-card__fact">
            <span>${isHabit ? "Ã¦ÂÂÃ©ÂÂ·Ã¦Â®ÂµÃ©ÂÂ" : "Ã¥ÂÂ²Ã£ÂÂÃ¦ÂÂ¹"}</span>
            <strong>${escapeHtml(isHabit ? bonsaiGrowth.stageLabel : flower.stageLabel)}</strong>
          </div>
          <div class="review-pot-card__fact">
            <span>${isHabit ? "Ã§Â¶ÂÃ§Â¶ÂÃ¦ÂÂ¥Ã¦ÂÂ°" : "Ã¨ÂÂ²Ã¦ÂÂÃ¦ÂÂ¥Ã¦ÂÂ°"}</span>
            <strong>${escapeHtml(`${isHabit ? bonsaiGrowth.executedDays : flower.executedDays}Ã¦ÂÂ¥`)}</strong>
          </div>
          <div class="review-pot-card__fact">
            <span>${isHabit ? "Ã§ÂÂ´Ã¨Â¿Â7Ã¥ÂÂ" : "Ã¥ÂÂ¨Ã¤Â½ÂÃ©ÂÂ²Ã¦ÂÂ"}</span>
            <strong>${isHabit ? renderStreakDots(goal.logs || [], goal.setup.studyDays) : escapeHtml(`${roadmap.learningProgress}%`)}</strong>
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
  const toggleLabel = ui.reviewLogExpanded ? "Ã¥ÂÂÃ£ÂÂ®Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ" : "Ã£ÂÂÃ£ÂÂÃ£ÂÂ«Ã¥ÂÂÃ£ÂÂ®Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¨Â¦ÂÃ£ÂÂ";

  const activeEntry = ui.reviewLogDraft ? getLogEntryById(ui.reviewLogDraft.logId) : null;
  if (ui.reviewLogDraft && !activeEntry) {
    ui.reviewLogDraft = null;
  }

  return `
    <section class="panel stack">
      <div>
        <h2 class="section-title">Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¤Â¿Â®Ã¦Â­Â£</h2>
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
        <span class="status-badge status-badge--accent">Ã¤Â¿Â®Ã¦Â­Â£Ã¤Â¸Â­</span>
        <span class="status-badge">${escapeHtml(outcomeLabel(entry.outcome))}</span>
      </div>
      <div class="field-grid field-grid--two">
        <label class="field">
          <span class="field__label">Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂ¥</span>
          <input class="field__control" data-review-log-field="date" type="date" value="${escapeHtml(draft.date)}" />
        </label>
        <div class="field">
          <span class="field__label">Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ</span>
          <div class="review-log-duration">
            <input class="field__control" data-review-log-field="elapsedHours" type="number" min="0" inputmode="numeric" value="${escapeHtml(draft.elapsedHours)}" />
            <span>Ã¦ÂÂÃ©ÂÂ</span>
            <input class="field__control" data-review-log-field="elapsedMinutes" type="number" min="0" inputmode="numeric" value="${escapeHtml(draft.elapsedMinutes)}" />
            <span>Ã¥ÂÂ</span>
          </div>
        </div>
      </div>
      <div class="review-log-editor__actions">
        <button type="button" class="action-button action-button--primary" data-action="save-review-log">Ã¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ£ÂÂ</button>
        <button type="button" class="soft-button" data-action="cancel-review-log-edit">Ã©ÂÂÃ£ÂÂÃ£ÂÂ</button>
      </div>
    </div>
  `;
}

function renderReviewLogCard(entry) {
  const isEditing = ui.reviewLogDraft && ui.reviewLogDraft.logId === entry.logId;
  const detailParts = [
    entry.milestoneLabel ? `Ã§Â¯ÂÃ§ÂÂ® ${entry.milestoneLabel}` : "",
    entry.progressText ? `Ã¥ÂÂ°Ã©ÂÂ ${entry.progressText}` : "",
    entry.reflection ? `Ã£ÂÂ¡Ã£ÂÂ¢ ${entry.reflection}` : "",
  ].filter(Boolean);

  return `
    <article class="review-log-card ${isEditing ? "is-active" : ""}">
      <div class="review-log-card__head">
        <div>
          <strong class="review-log-card__title">${escapeHtml(formatReviewLogDate(entry.date))}</strong>
          <p class="review-log-card__meta">${escapeHtml(`${outcomeLabel(entry.outcome)} / Ã¥Â®ÂÃ¨Â¡Â ${formatLoggedDuration(getLoggedSeconds(entry))}`)}</p>
        </div>
        <button type="button" class="ghost-button" data-action="open-review-log-editor" data-log-id="${escapeHtml(entry.logId)}">Ã¤Â¿Â®Ã¦Â­Â£</button>
      </div>
      ${detailParts.length ? `<p class="review-log-card__detail">${escapeHtml(detailParts.join(" / "))}</p>` : ""}
    </article>
  `;
}

function renderGardenView() {
  const goals = listGoals();
  const habitGoals = goals.filter((goal) => goal.setup && goal.setup.goalType === "habit");
  const regularGoals = goals.filter((goal) => !goal.setup || goal.setup.goalType !== "habit");
  const growingGoals = regularGoals.filter((goal) => !isGoalAchieved(goal));
  const archivedGoals = regularGoals.filter((goal) => isGoalAchieved(goal));

  return `
    <section class="screen">
      <div class="hero">
        <div class="hero__sticky">
          <div class="hero__accent"></div>
          <div class="status-strip">
            <span class="status-badge">Ã¨ÂÂ²Ã¦ÂÂÃ¤Â¸Â­ ${growingGoals.length}</span>
            <span class="status-badge status-badge--done">Ã©ÂÂÃ¦ÂÂÃ¦Â¸ÂÃ£ÂÂ¿ ${archivedGoals.length}</span>
          </div>
        </div>
      </div>

      ${habitGoals.length ? renderGardenShelfSection("Ã¨ÂÂ²Ã£ÂÂ¦Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ§ÂÂÃ¦Â Â½", "Ã§Â¿ÂÃ¦ÂÂ£Ã£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂÃ¦Â¯ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã£ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ¯Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂ§Ã¦ÂÂÃ©ÂÂ·Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ", habitGoals, { emptyCopy: "Ã£ÂÂ¾Ã£ÂÂ Ã§Â¿ÂÃ¦ÂÂ£Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ" }) : ""}
      ${renderGardenShelfSection("Ã¤Â»ÂÃ¨ÂÂ²Ã£ÂÂ¦Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ¨ÂÂ±", "Ã©ÂÂ²Ã¨Â¡ÂÃ¤Â¸Â­Ã£ÂÂ®Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂ¨Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ", growingGoals, { emptyCopy: "Ã£ÂÂ¾Ã£ÂÂ Ã¨ÂÂ²Ã¦ÂÂÃ¤Â¸Â­Ã£ÂÂ®Ã¨ÂÂ±Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ" })}
      ${renderAchievementGardenSection("Ã§ÂÂ®Ã¦Â¨ÂÃ©ÂÂÃ¦ÂÂÃ£ÂÂÃ£ÂÂÃ¨ÂÂ±", "Ã©ÂÂÃ¦ÂÂÃ£ÂÂÃ£ÂÂÃ¨ÂÂ±Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂ®Ã¥ÂºÂ­Ã£ÂÂ«Ã¦Â¤ÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ¥ÂÂ²Ã£ÂÂÃ£ÂÂÃ¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¦Â®ÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ", archivedGoals, { emptyCopy: "Ã£ÂÂ¾Ã£ÂÂ Ã©ÂÂÃ¦ÂÂÃ£ÂÂÃ£ÂÂÃ¨ÂÂ±Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ" })}
      ${renderAlbumSection()}
    </section>
  `;
}

function renderAlbumSection() {
  const goals = listArchivedGoals();
  if (!goals.length) return "";
  const cards = goals.map(goal => {
    const isHabit = goal.setup && goal.setup.goalType === "habit";
    const isConfirm = ui.deleteConfirmGoalId === goal.id;
    let artwork = "";
    let subtitle = "";
    if (isHabit) {
      const growth = getBonsaiGrowth(goal.logs || []);
      const health = getBonsaiHealth(goal.logs || [], goal.setup.studyDays);
      artwork = renderBonsaiArtwork(goal.setup.bonsaiKey || "pine", growth.stageIndex, health, { size: "card" });
      subtitle = `${getBonsaiTypeMeta(goal.setup.bonsaiKey).label} / ${growth.stageIndex}Ã¦Â®ÂµÃ©ÂÂ / ${growth.executedDays}Ã¦ÂÂ¥Ã©ÂÂ`;
    } else {
      const growth = getFlowerGrowth(goal.logs || []);
      const flower = getGoalFlowerState(goal);
      artwork = renderFlowerArtwork(flower.key, growth.stageIndex, { size: "card" });
      subtitle = `${flower.label} / ${growth.stageLabel} / ${growth.executedDays}Ã¦ÂÂ¥Ã©ÂÂ`;
    }
    const archivedDate = goal.archivedAt ? goal.archivedAt.replace(/-/g, ".") : "";
    return `
      <div class="album-card">
        <div class="album-card__art">${artwork}</div>
        <div class="album-card__body">
          <p class="album-card__name">${escapeHtml(goal.setup.goal)}</p>
          <p class="album-card__sub">${escapeHtml(subtitle)}</p>
          ${archivedDate ? `<p class="album-card__date">${archivedDate} Ã¤Â¿ÂÃ¥Â­Â</p>` : ""}
          ${isConfirm
            ? `<p class="album-card__warn">Ã¢ÂÂ Ã¯Â¸Â Ã¥Â®ÂÃ¥ÂÂ¨Ã¦Â¶ÂÃ¥ÂÂ»Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¯Â¼ÂÃ¥ÂÂÃ£ÂÂ«Ã¦ÂÂ»Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ</p>
               <div class="album-card__actions">
                 <button class="soft-button" data-action="purge-archived-goal" data-goal-id="${goal.id}">Ã¦Â¶ÂÃ¥ÂÂ»Ã£ÂÂÃ£ÂÂ</button>
                 <button class="soft-button" data-action="cancel-delete-goal">Ã£ÂÂÃ£ÂÂÃ£ÂÂ</button>
               </div>`
            : `<div class="album-card__actions">
                 <button class="soft-button album-card__delete" data-action="confirm-delete-goal" data-goal-id="${goal.id}">Ã¥Â®ÂÃ¥ÂÂ¨Ã¦Â¶ÂÃ¥ÂÂ»</button>
               </div>`}
        </div>
      </div>
    `;
  }).join("");
  return `
    <section class="panel stack garden-album">
      <div>
        <h2 class="section-title">Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂÃ£ÂÂ </h2>
        <p class="section-copy">Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂÃ£ÂÂ Ã£ÂÂ¸Ã§Â§Â»Ã¥ÂÂÃ£ÂÂÃ£ÂÂÃ§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂÃ¨Â¨ÂÃ©ÂÂ²Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂÃ£ÂÂ§Ã¨Â¦ÂÃ¨Â¿ÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
      </div>
      <div class="album-list">${cards}</div>
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
        <p class="preview-empty">${escapeHtml(options.emptyCopy || "Ã£ÂÂ¾Ã£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ")}</p>
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
  const isHabit = goal.setup && goal.setup.goalType === "habit";

  if (isHabit) {
    const growth = getBonsaiGrowth(goal.logs || []);
    const health = getBonsaiHealth(goal.logs || [], goal.setup.studyDays);
    const bonsaiKey = goal.setup.bonsaiKey || "pine";
    const bonsaiMeta = getBonsaiTypeMeta(bonsaiKey);
    return `
      <div class="garden-card garden-card--bonsai">
        <div class="garden-card__art" aria-hidden="true">
          <div class="garden-card__glow"></div>
          <div class="garden-card__flower">
            ${renderBonsaiArtwork(bonsaiKey, growth.stageIndex, health, { size: "garden-card" })}
          </div>
        </div>
        <div class="garden-card__body">
          <div class="garden-card__head">
            <strong class="garden-card__title">${escapeHtml(goal.setup.goal)}</strong>
            <span class="status-badge">Ã§Â¿ÂÃ¦ÂÂ£</span>
          </div>
          <p class="garden-card__meta">${escapeHtml(`${bonsaiMeta.label} / ${growth.stageLabel}`)}</p>
          <div class="garden-card__streak">${escapeHtml(`Ã§Â¶ÂÃ§Â¶Â ${growth.executedDays}Ã¦ÂÂ¥`)}&ensp;${renderStreakDots(goal.logs || [], goal.setup.studyDays)}</div>
        </div>
      </div>
    `;
  }

  const flower = getGoalFlowerState(goal);
  const roadmap = computeRoadmap(goal);
  const completed = options.completed === true || isGoalAchieved(goal);

  return `
    <div class="garden-card ${completed ? "is-complete" : ""}">
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
          <span class="status-badge ${completed ? "status-badge--done" : ""}">${completed ? "Ã©ÂÂÃ¦ÂÂÃ¦Â¸ÂÃ£ÂÂ¿" : "Ã¨ÂÂ²Ã¦ÂÂÃ¤Â¸Â­"}</span>
        </div>
        <p class="garden-card__meta">${escapeHtml(`${flower.label} / ${flower.stageLabel}`)}</p>
        <p class="garden-card__meta">${escapeHtml(`Ã¨ÂÂ²Ã¦ÂÂ ${flower.executedDays}Ã¦ÂÂ¥ / Ã©ÂÂ²Ã¦ÂÂ ${roadmap.learningProgress}%`)}</p>
      </div>
    </div>
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
        <p class="preview-empty">${escapeHtml(options.emptyCopy || "Ã£ÂÂ¾Ã£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ")}</p>
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
    <section class="garden-planter ${totalBeds > 1 ? "garden-planter--stacked" : ""}" style="--plot-count:${goals.length}; --scene-position:${scenePosition}%; --scene-zoom:${sceneZoom}%;" aria-label="${escapeHtml(`Ã©ÂÂÃ¦ÂÂÃ¨ÂÂ±Ã¥Â£Â ${bedIndex + 1}`)}">
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
        <summary class="garden-plot__touch" aria-label="${escapeHtml(`${goal.setup.goal} Ã£ÂÂ®Ã¨Â©Â³Ã§Â´Â°Ã£ÂÂÃ¨Â¡Â¨Ã§Â¤Âº`)}">
          <div class="garden-plot__flower">
            ${renderFlowerArtwork(flower.key, flower.stageIndex, { size: "garden", showSoil: false })}
          </div>
        </summary>
        <div class="garden-plot__tooltip" role="note">
          <div class="garden-plot__label">${escapeHtml(goal.setup.goal)}</div>
          <div class="garden-plot__meta">${escapeHtml(`${flower.label} / ${flower.stageLabel}`)}</div>
          <div class="garden-plot__meta">${escapeHtml(`Ã¨ÂÂ²Ã¦ÂÂ ${flower.executedDays}Ã¦ÂÂ¥ / Ã©ÂÂ²Ã¦ÂÂ ${roadmap.learningProgress}%`)}</div>
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
        <h1 class="hero__title">Ã¨ÂÂªÃ§ÂÂ±Ã©ÂÂÃ¨Â«ÂÃ£ÂÂ§Ã£ÂÂ¯Ã£ÂÂªÃ£ÂÂÃ£ÂÂÃ§Â«ÂÃ£ÂÂ¦Ã§ÂÂ´Ã£ÂÂÃ£ÂÂ«Ã©ÂÂÃ¤Â¸Â­Ã£ÂÂÃ£ÂÂ</h1>
      </div>

      <section class="stack">
        <div>
          <h2 class="section-title">Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ¤Â¿Â®Ã¦Â­Â£</h2>
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
            <h2 class="panel__title">Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ¨RoadmapÃ£ÂÂÃ¦ÂÂ´Ã¦ÂÂ°</h2>
          </div>
          <label class="field">
            <span class="field__label">Ã§ÂÂ®Ã¦Â¨Â</span>
            <input class="field__control" data-replan-field="goalDraft" type="text" value="${escapeHtml(state.replan.goalDraft || "")}" />
          </label>
          <label class="field">
            <span class="field__label">Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã£ÂÂÃ£ÂÂÃ£ÂÂ·Ã£ÂÂ§Ã£ÂÂ³</span>
            <input class="field__control" data-replan-field="missionDraft" type="text" value="${escapeHtml(state.replan.missionDraft || "")}" />
          </label>
          <div class="field-grid field-grid--two">
            <label class="field">
              <span class="field__label">Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹</span>
              <input class="field__control" data-replan-field="weekDraft" type="text" value="${escapeHtml(state.replan.weekDraft || "")}" />
            </label>
            <label class="field">
              <span class="field__label">Ã¦Â¬Â¡Ã£ÂÂ®Ã¤Â¸ÂÃ¦Â­Â©</span>
              <input class="field__control" data-replan-field="nextDraft" type="text" value="${escapeHtml(state.replan.nextDraft || "")}" />
            </label>
          </div>
        </section>
      ` : ""}

      <section class="panel stack">
        <div>
          <h2 class="panel__title">Ã§ÂÂ¸Ã¨Â«ÂÃ¥ÂÂÃ¥Â®Â¹</h2>
        </div>
        <label class="field">
          <textarea data-replan-field="text" placeholder="${isRetargetMode ? "Ã¤Â¾Â: ChatGPTÃ£ÂÂ¨Ã¥ÂÂÃ©Â¡ÂÃ£ÂÂÃ¥ÂÂºÃ£ÂÂÃ¥ÂÂÃ£ÂÂÃ¥ÂÂÃ¥Â¼Â·Ã£ÂÂ«Ã¥Â¯ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ" : "Ã¥ÂÂ°Ã£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¨Ã£ÂÂÃ§ÂÂ­Ã£ÂÂÃ¦ÂÂ¸Ã£ÂÂ"}">${escapeHtml(state.replan.text || "")}</textarea>
        </label>
        <button type="button" class="action-button" data-action="generate-replan">Ã¥Â·Â®Ã¥ÂÂÃ£ÂÂÃ¤Â½ÂÃ£ÂÂ</button>
      </section>

      <section class="panel stack">
        <div>
          <h2 class="panel__title">Ã¥Â·Â®Ã¥ÂÂÃ£ÂÂÃ£ÂÂ¬Ã£ÂÂÃ£ÂÂ¥Ã£ÂÂ¼</h2>
        </div>
        ${
          preview.length
            ? `<ul class="preview-list">${preview.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p class="preview-empty">Ã£ÂÂ¢Ã£ÂÂ¼Ã£ÂÂÃ£ÂÂÃ©ÂÂ¸Ã£ÂÂÃ£ÂÂ§Ã£ÂÂÃ¥Â·Â®Ã¥ÂÂÃ£ÂÂÃ¤Â½ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ¦ÂÂ¼Ã£ÂÂÃ£ÂÂ¨Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ«Ã¥Â¤ÂÃ¦ÂÂ´Ã¦Â¡ÂÃ£ÂÂÃ¥ÂÂºÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>`
        }
      </section>

      <div class="action-row">
        <button type="button" class="soft-button" data-action="navigate" data-view="today">Ã¦ÂÂ»Ã£ÂÂ</button>
        <button type="button" class="action-button action-button--primary" data-action="apply-replan">Ã£ÂÂÃ£ÂÂ®Ã¥Â¤ÂÃ¦ÂÂ´Ã£ÂÂÃ©ÂÂ©Ã§ÂÂ¨</button>
      </div>
    </section>
  `;
}

function renderPlanCard(planKey, plan, recommendedPlan, recommendedLabel = "Ã¦ÂÂ¨Ã¥Â¥Â¨") {
  return `
    <article class="plan-card ${recommendedPlan === planKey ? "is-recommended" : ""}">
      <div class="plan-card__head">
        <div>
          <div class="plan-card__label">${PLAN_META[planKey].label} (${PLAN_META[planKey].tag})</div>
          <div class="plan-card__meta">${plan.minutes}Ã¥ÂÂ</div>
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
        <span class="plan-card__unit">Ã¥ÂÂ</span>
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

function renderBonsaiPicker(selectedKey, actionName = "select-setup-bonsai") {
  const currentKey = BONSAI_LIBRARY[selectedKey] ? selectedKey : "pine";
  return `
    <div class="field">
      <span class="field__label">Ã¨ÂÂ²Ã£ÂÂ¦Ã£ÂÂÃ§ÂÂÃ¦Â Â½</span>
      <p class="section-copy">Ã§ÂÂÃ¦Â Â½Ã£ÂÂ®Ã§Â¨Â®Ã©Â¡ÂÃ£ÂÂÃ©ÂÂ¸Ã£ÂÂ³Ã£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¦ÂÂ¥Ã£ÂÂÃ£ÂÂ®Ã£ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ¯Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂ§Ã¨ÂÂ²Ã£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
      <div class="bonsai-picker">
        ${Object.entries(BONSAI_LIBRARY).map(([key, bonsai]) => `
          <button type="button" class="bonsai-picker-item ${currentKey === key ? "is-active" : ""}" data-action="${actionName}" data-bonsai-key="${key}" aria-pressed="${currentKey === key ? "true" : "false"}">
            ${renderBonsaiArtwork(key, 5, 100, { size: "picker" })}
            <span class="bonsai-picker-item__label">${escapeHtml(bonsai.label)}</span>
            <span class="bonsai-picker-item__trait">${escapeHtml(bonsai.trait)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderFlowerPicker(selectedType, actionName, options = {}) {
  const currentType = normalizeFlowerType(selectedType);

  return `
    <div class="field">
      <span class="field__label">Ã¨ÂÂ²Ã£ÂÂ¦Ã£ÂÂÃ¦Â¤ÂÃ§ÂÂ©</span>
      <p class="section-copy">Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ®Ã§Â¨Â®Ã©Â¡ÂÃ£ÂÂ«Ã¥ÂÂÃ£ÂÂ£Ã£ÂÂÃ¦Â¤ÂÃ§ÂÂ©Ã£ÂÂÃ©ÂÂ¸Ã£ÂÂ³Ã£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¥ÂÂ²Ã£ÂÂÃ¦ÂÂ¨Ã£ÂÂ¨Ã£ÂÂÃ£ÂÂ¦Ã¦ÂÂÃ©ÂÂ·Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ</p>
      <div class="flower-choice-grid">
        ${Object.entries(FLOWER_LIBRARY)
          .map(([key, flower]) => `
            <button type="button" class="flower-choice ${currentType === key ? "is-active" : ""}" data-action="${actionName}" data-flower-type="${key}" aria-pressed="${currentType === key ? "true" : "false"}">
              ${renderFlowerArtwork(key, 8, { size: "picker" })}
              <span class="flower-choice__label">${escapeHtml(flower.label)}</span>
              <span class="flower-choice__trait">${escapeHtml(flower.trait)}</span>
            </button>
          `)
          .join("")}
      </div>
    </div>
  `;
}

function renderPineBonsaiSvg(b, stage, stageRatio, health) {
  const hp = Math.max(0.3, health / 100);
  const fop = (0.7 + hp * 0.3).toFixed(2);
  const fc = hp < 0.4 ? b.foliageDark : b.foliage;

  const pot = `
    <rect x="30" y="113" width="60" height="17" rx="4" fill="${b.pot}"/>
    <rect x="27" y="109" width="66" height="7" rx="3.5" fill="${b.potRim}"/>
    <ellipse cx="60" cy="112" rx="27" ry="4.5" fill="${b.soil}" opacity="0.9"/>
  `;

  if (stage === 0) return pot + `<ellipse cx="60" cy="109" rx="3" ry="2.5" fill="${b.foliage}" opacity="0.6"/>`;

  const trunkHeight = 20 + stageRatio * 65;
  const trunkTop = 112 - trunkHeight;

  const trunk = `<path d="M60 112 C59 ${112-trunkHeight*0.3} 61 ${112-trunkHeight*0.6} 60 ${trunkTop}" stroke="${b.trunk}" stroke-width="${4 + stageRatio*2}" stroke-linecap="round" fill="none"/>`;

  if (stage <= 1) {
    return pot + trunk + `<ellipse cx="60" cy="${trunkTop-3}" rx="5" ry="4" fill="${fc}" opacity="${fop}"/>`;
  }

  const bY1 = trunkTop + trunkHeight * 0.6;
  const bY2 = trunkTop + trunkHeight * 0.35;
  const bSpread = 15 + stageRatio * 18;

  const branches = stage >= 3 ? `
    <path d="M60 ${bY1} C52 ${bY1-4} 44 ${bY1-8} ${60-bSpread} ${bY1-6}" stroke="${b.branch}" stroke-width="${3+stageRatio}" stroke-linecap="round" fill="none"/>
    <path d="M60 ${bY1} C68 ${bY1-4} 76 ${bY1-8} ${60+bSpread} ${bY1-6}" stroke="${b.branch}" stroke-width="${2.5+stageRatio*0.5}" stroke-linecap="round" fill="none"/>
    ${stage >= 5 ? `<path d="M60 ${bY2} C52 ${bY2-3} 44 ${bY2-6} ${60-bSpread*0.8} ${bY2-5}" stroke="${b.branch}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M60 ${bY2} C68 ${bY2-3} 76 ${bY2-6} ${60+bSpread*0.8} ${bY2-5}" stroke="${b.branch}" stroke-width="2" stroke-linecap="round" fill="none"/>` : ""}
  ` : `<path d="M60 ${bY1} C52 ${bY1-3} 44 ${bY1-5} ${60-bSpread*0.5} ${bY1-4}" stroke="${b.branch}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;

  const foliageR = 8 + stageRatio * 6;
  const foliage = stage >= 2 ? `
    ${stage >= 3 ? `
      <circle cx="${60-bSpread}" cy="${bY1-10}" r="${foliageR}" fill="${fc}" opacity="${fop}"/>
      <circle cx="${60-bSpread+8}" cy="${bY1-15}" r="${foliageR*0.8}" fill="${b.foliageDark}" opacity="${(Number(fop)*0.85).toFixed(2)}"/>
    ` : ""}
    ${stage >= 3 ? `
      <circle cx="${60+bSpread}" cy="${bY1-10}" r="${foliageR*0.9}" fill="${fc}" opacity="${fop}"/>
    ` : ""}
    ${stage >= 5 ? `
      <circle cx="${60-bSpread*0.8}" cy="${bY2-8}" r="${foliageR*0.85}" fill="${fc}" opacity="${fop}"/>
      <circle cx="${60+bSpread*0.8}" cy="${bY2-8}" r="${foliageR*0.8}" fill="${b.foliageDark}" opacity="${(Number(fop)*0.88).toFixed(2)}"/>
    ` : ""}
    <circle cx="60" cy="${trunkTop-foliageR*0.6}" r="${foliageR*1.1}" fill="${b.foliageDark}" opacity="${fop}"/>
    <circle cx="${60-foliageR*0.5}" cy="${trunkTop-foliageR*0.9}" r="${foliageR*0.85}" fill="${fc}" opacity="${(Number(fop)*0.92).toFixed(2)}"/>
    ${stage >= 6 ? `<circle cx="${60}" cy="${trunkTop-foliageR*1.5}" r="${foliageR*0.7}" fill="${b.foliageLight}" opacity="${(Number(fop)*0.45).toFixed(2)}"/>` : ""}
  ` : `<circle cx="60" cy="${trunkTop-6}" r="8" fill="${fc}" opacity="${fop}"/>`;

  return pot + trunk + branches + foliage;
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

function renderPlumBonsaiSvg(b, stage, stageRatio, health) {
  const hp = Math.max(0.3, health / 100);
  const fop = (0.65 + hp * 0.35).toFixed(2);

  const pot = `
    <rect x="30" y="113" width="60" height="17" rx="4" fill="${b.pot}"/>
    <rect x="27" y="109" width="66" height="7" rx="3.5" fill="${b.potRim}"/>
    <ellipse cx="60" cy="112" rx="27" ry="4.5" fill="${b.soil}" opacity="0.9"/>
  `;

  if (stage === 0) return pot + `<ellipse cx="60" cy="109" rx="3" ry="2.5" fill="${b.trunk}" opacity="0.6"/>`;

  const trunkH = 22 + stageRatio * 60;
  const trunkTop = 112 - trunkH;

  const trunk = `<path d="M60 112 C56 ${112-trunkH*0.3} 64 ${112-trunkH*0.65} 60 ${trunkTop}" stroke="${b.trunk}" stroke-width="${4.5 + stageRatio*1.5}" stroke-linecap="round" fill="none"/>`;

  if (stage <= 1) return pot + trunk;

  const bSpread = 12 + stageRatio * 22;
  const bY1 = trunkTop + trunkH * 0.5;
  const bY2 = trunkTop + trunkH * 0.25;

  const branches = `
    <path d="M60 ${bY1} C50 ${bY1-6} ${60-bSpread} ${bY1-10} ${60-bSpread-8} ${bY1-18}" stroke="${b.branch}" stroke-width="${2.5+stageRatio}" stroke-linecap="round" fill="none"/>
    ${stage >= 3 ? `<path d="M60 ${bY1} C70 ${bY1-5} ${60+bSpread} ${bY1-8} ${60+bSpread+6} ${bY1-15}" stroke="${b.branch}" stroke-width="${2+stageRatio*0.5}" stroke-linecap="round" fill="none"/>` : ""}
    ${stage >= 5 ? `
      <path d="M60 ${bY2} C52 ${bY2-4} ${60-bSpread*0.7} ${bY2-8} ${60-bSpread*0.8-6} ${bY2-16}" stroke="${b.branch}" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M60 ${bY2} C68 ${bY2-3} ${60+bSpread*0.6} ${bY2-7} ${60+bSpread*0.7+5} ${bY2-14}" stroke="${b.branch}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    ` : ""}
    ${stage >= 7 ? `<path d="M60 ${trunkTop} C56 ${trunkTop-8} 52 ${trunkTop-14} 48 ${trunkTop-18}" stroke="${b.branch}" stroke-width="1.5" stroke-linecap="round" fill="none"/>` : ""}
  `;

  let blossoms = "";
  if (stage >= 5) {
    const blossomPositions = [
      [60-bSpread-8, bY1-20], [60+bSpread+6, bY1-17],
      [60-bSpread*0.8-8, bY2-18], [60+bSpread*0.7+7, bY2-16],
      [60, trunkTop-8],
    ].slice(0, Math.min(stage - 3, 5));

    blossomPositions.forEach(([bx, by]) => {
      const r = 5 + stageRatio * 3;
      blossoms += `
        <circle cx="${bx}" cy="${by}" r="${r}" fill="${b.foliage}" opacity="${(Number(fop)*0.88).toFixed(2)}"/>
        <circle cx="${bx}" cy="${by}" r="${r*0.5}" fill="${b.foliageLight}" opacity="${(Number(fop)*0.6).toFixed(2)}"/>
      `;
    });
  }

  return pot + trunk + branches + blossoms;
}

function renderBonsaiArtwork(bonsaiType, stageIndex, health, options = {}) {
  const b = getBonsaiTypeMeta(bonsaiType);
  const stage = Math.max(0, Math.min(9, Number(stageIndex) || 0));
  const stageRatio = stage / 9;
  const size = options.size || "picker";
  const h = typeof health === "number" ? health : 100;

  const renderers = {
    pine: renderPineBonsaiSvg,
    maple: renderMapleBonsaiSvg,
    moss: renderMossSvg,
  };
  const body = (renderers[b.key] || renderPineBonsaiSvg)(b, stage, stageRatio, h);

  return `
    <figure class="flower-illustration flower-illustration--${escapeHtml(size)}" data-bonsai="${b.key}">
      <svg viewBox="0 0 120 140" aria-hidden="true" focusable="false">
        ${body}
      </svg>
    </figure>
  `;
}

function renderFlowerArtwork(flowerType, stageIndex, options = {}) {
  const flower = getFlowerTypeMeta(flowerType);
  const stage = Math.max(0, Math.min(9, Number(stageIndex) || 0));
  const size = options.size || "picker";
  const stageRatio = stage / 9;

  const renderers = {
    ume: renderUmeBonsaiSvg,
    sakura: renderSakuraBonsaiSvg,
    satsuki: renderSatsukiSvg,
  };
  const body = (renderers[flower.key] || renderUmeBonsaiSvg)(flower, stage, stageRatio);

  return `
    <figure class="flower-illustration flower-illustration--${escapeHtml(size)}" data-flower="${flower.key}">
      <svg viewBox="0 0 120 140" aria-hidden="true" focusable="false">
        ${body}
      </svg>
    </figure>
  `;
}

// ============================================================
// Ã§ÂÂ®Ã¦Â¨ÂÃ¦Â¤ÂÃ§ÂÂ© SVGÃ£ÂÂ¬Ã£ÂÂ³Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ¼Ã¯Â¼ÂÃ¦Â¢ÂÃ£ÂÂ»Ã¦Â¡ÂÃ£ÂÂ»Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂÃ¯Â¼Â
// ============================================================

function renderUmeBonsaiSvg(flower, stage, stageRatio) {
  const pot = `
    <rect x="30" y="113" width="60" height="17" rx="4" fill="${flower.pot}"/>
    <rect x="27" y="109" width="66" height="7" rx="3.5" fill="${flower.potRim}"/>
    <ellipse cx="60" cy="112" rx="27" ry="4.5" fill="${flower.soil}" opacity="0.9"/>
  `;
  if (stage === 0) return pot + `<ellipse cx="60" cy="109" rx="3" ry="2.5" fill="${flower.trunk}" opacity="0.6"/>`;

  const trunkH = 20 + stageRatio * 62;
  const trunkTop = 112 - trunkH;
  const trunk = `<path d="M60 112 C56 ${112-trunkH*0.3} 65 ${112-trunkH*0.65} 60 ${trunkTop}" stroke="${flower.trunk}" stroke-width="${4 + stageRatio*1.5}" stroke-linecap="round" fill="none"/>`;

  if (stage <= 1) return pot + trunk;

  const bSpread = 10 + stageRatio * 24;
  const bY1 = trunkTop + trunkH * 0.52;
  const bY2 = trunkTop + trunkH * 0.26;
  const branches = `
    <path d="M60 ${bY1} C50 ${bY1-5} ${60-bSpread} ${bY1-9} ${60-bSpread-8} ${bY1-20}" stroke="${flower.branch}" stroke-width="${2.5+stageRatio}" stroke-linecap="round" fill="none"/>
    ${stage >= 3 ? `<path d="M60 ${bY1} C70 ${bY1-4} ${60+bSpread} ${bY1-8} ${60+bSpread+6} ${bY1-18}" stroke="${flower.branch}" stroke-width="${2+stageRatio*0.5}" stroke-linecap="round" fill="none"/>` : ""}
    ${stage >= 5 ? `<path d="M60 ${bY2} C51 ${bY2-4} ${60-bSpread*0.75} ${bY2-9} ${60-bSpread*0.85-5} ${bY2-18}" stroke="${flower.branch}" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M60 ${bY2} C69 ${bY2-3} ${60+bSpread*0.65} ${bY2-7} ${60+bSpread*0.75+4} ${bY2-15}" stroke="${flower.branch}" stroke-width="1.8" stroke-linecap="round" fill="none"/>` : ""}
    ${stage >= 7 ? `<path d="M60 ${trunkTop} C56 ${trunkTop-8} 51 ${trunkTop-15} 48 ${trunkTop-20}" stroke="${flower.branch}" stroke-width="1.5" stroke-linecap="round" fill="none"/>` : ""}
  `;

  let blossoms = "";
  const blossomPositions = [
    [60-bSpread-6, bY1-22], [60+bSpread+4, bY1-20],
    [60-bSpread*0.85-4, bY2-20], [60+bSpread*0.75+3, bY2-17],
    [60, trunkTop-9], [60-5, trunkTop-17], [60+4, trunkTop-13],
  ];
  if (stage >= 4) {
    blossomPositions.slice(0, Math.min(stage - 2, 7)).forEach(([bx, by]) => {
      const r = 4.5 + stageRatio * 2;
      for (let p = 0; p < 5; p++) {
        const a = (p * 72 - 90) * Math.PI / 180;
        blossoms += `<circle cx="${(bx+Math.cos(a)*r*0.5).toFixed(1)}" cy="${(by+Math.sin(a)*r*0.5).toFixed(1)}" r="${(r*0.45).toFixed(1)}" fill="${flower.petal}" opacity="0.88"/>`;
      }
      blossoms += `<circle cx="${bx}" cy="${by}" r="${(r*0.25).toFixed(1)}" fill="${flower.center}" opacity="0.9"/>`;
    });
  } else if (stage >= 2) {
    blossomPositions.slice(0, stage - 1).forEach(([bx, by]) => {
      blossoms += `<circle cx="${bx}" cy="${by}" r="3" fill="${flower.bud}" opacity="0.72"/>`;
    });
  }
  return pot + trunk + branches + blossoms;
}

function renderSakuraBonsaiSvg(flower, stage, stageRatio) {
  const pot = `
    <rect x="30" y="113" width="60" height="17" rx="4" fill="${flower.pot}"/>
    <rect x="27" y="109" width="66" height="7" rx="3.5" fill="${flower.potRim}"/>
    <ellipse cx="60" cy="112" rx="27" ry="4.5" fill="${flower.soil}" opacity="0.9"/>
  `;
  if (stage === 0) return pot + `<ellipse cx="60" cy="109" rx="3" ry="2.5" fill="${flower.trunk}" opacity="0.5"/>`;

  const trunkH = 22 + stageRatio * 58;
  const trunkTop = 112 - trunkH;
  const trunk = `<path d="M60 112 C58 ${112-trunkH*0.32} 62 ${112-trunkH*0.62} 60 ${trunkTop}" stroke="${flower.trunk}" stroke-width="${4.5+stageRatio*1.5}" stroke-linecap="round" fill="none"/>`;

  const bSpread = 16 + stageRatio * 22;
  const bY = trunkTop + trunkH * 0.45;
  const branches = stage >= 2 ? `
    <path d="M60 ${bY} C48 ${bY-5} ${60-bSpread} ${bY-6} ${60-bSpread-10} ${bY-14}" stroke="${flower.branch}" stroke-width="${2.5+stageRatio}" stroke-linecap="round" fill="none"/>
    <path d="M60 ${bY} C72 ${bY-4} ${60+bSpread} ${bY-5} ${60+bSpread+8} ${bY-13}" stroke="${flower.branch}" stroke-width="${2.5+stageRatio*0.8}" stroke-linecap="round" fill="none"/>
    ${stage >= 4 ? `<path d="M60 ${trunkTop+trunkH*0.2} C50 ${trunkTop+trunkH*0.15} ${60-bSpread*0.7} ${trunkTop} ${60-bSpread*0.8-4} ${trunkTop-10}" stroke="${flower.branch}" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M60 ${trunkTop+trunkH*0.2} C70 ${trunkTop+trunkH*0.14} ${60+bSpread*0.7} ${trunkTop-2} ${60+bSpread*0.8+3} ${trunkTop-9}" stroke="${flower.branch}" stroke-width="1.8" stroke-linecap="round" fill="none"/>` : ""}
  ` : "";

  let blossoms = "";
  if (stage >= 2 && stage <= 3) {
    const gr = 6 + stageRatio * 4;
    blossoms = `
      <circle cx="${60-bSpread-8}" cy="${bY-18}" r="${gr}" fill="#6a9060" opacity="0.7"/>
      <circle cx="${60+bSpread+6}" cy="${bY-16}" r="${gr*0.9}" fill="#5a8050" opacity="0.7"/>
      <circle cx="60" cy="${trunkTop-8}" r="${gr*1.1}" fill="#5a8050" opacity="0.65"/>
    `;
  } else if (stage >= 4) {
    const clusters = [
      [60-bSpread-8, bY-18, 1.0], [60+bSpread+6, bY-16, 0.95],
      [60-bSpread*0.8-2, trunkTop-2, 0.9], [60+bSpread*0.75+2, trunkTop-1, 0.88],
      [60, trunkTop-10, 1.0], [60-8, trunkTop-18, 0.85], [60+7, trunkTop-16, 0.88],
      [60-bSpread*0.4, bY-10, 0.8], [60+bSpread*0.4, bY-9, 0.8],
    ].slice(0, 3 + Math.floor(stageRatio * 6));
    clusters.forEach(([cx, cy, op]) => {
      const r = 4 + stageRatio * 3;
      for (let p = 0; p < 5; p++) {
        const a = (p * 72 - 90) * Math.PI / 180;
        blossoms += `<circle cx="${(cx+Math.cos(a)*r*0.55).toFixed(1)}" cy="${(cy+Math.sin(a)*r*0.55).toFixed(1)}" r="${(r*0.48).toFixed(1)}" fill="${flower.petal}" opacity="${(op*0.85).toFixed(2)}"/>`;
      }
      blossoms += `<circle cx="${cx}" cy="${cy}" r="${(r*0.52).toFixed(1)}" fill="${flower.petalLight}" opacity="${(op*0.7).toFixed(2)}"/>`;
      blossoms += `<circle cx="${cx}" cy="${cy}" r="${(r*0.2).toFixed(1)}" fill="${flower.center}" opacity="${(op*0.9).toFixed(2)}"/>`;
      if (stage >= 7) {
        blossoms += `<ellipse cx="${cx+r*1.2}" cy="${cy+r*0.8}" rx="2" ry="1.2" fill="${flower.petal}" opacity="0.45" transform="rotate(-20 ${cx+r*1.2} ${cy+r*0.8})"/>`;
        blossoms += `<ellipse cx="${cx-r*0.8}" cy="${cy+r*1.4}" rx="1.8" ry="1" fill="${flower.bud}" opacity="0.35" transform="rotate(15 ${cx-r*0.8} ${cy+r*1.4})"/>`;
      }
    });
  }
  return pot + trunk + branches + blossoms;
}

function renderSatsukiSvg(flower, stage, stageRatio) {
  const pot = `
    <rect x="30" y="113" width="60" height="17" rx="4" fill="${flower.pot}"/>
    <rect x="27" y="109" width="66" height="7" rx="3.5" fill="${flower.potRim}"/>
    <ellipse cx="60" cy="112" rx="27" ry="4.5" fill="${flower.soil}" opacity="0.9"/>
  `;
  if (stage === 0) return pot + `<ellipse cx="60" cy="109" rx="3" ry="2.5" fill="${flower.trunk}" opacity="0.5"/>`;

  const trunkH = 15 + stageRatio * 45;
  const trunkTop = 112 - trunkH;
  const trunk = `<path d="M60 112 C58 ${112-trunkH*0.4} 62 ${112-trunkH*0.7} 60 ${trunkTop}" stroke="${flower.trunk}" stroke-width="${3.5+stageRatio*1.5}" stroke-linecap="round" fill="none"/>`;

  const fr = 10 + stageRatio * 14;
  const cx = 60, cy = trunkTop - fr * 0.5;
  const foliage = stage >= 1 ? `
    <ellipse cx="${cx}" cy="${cy}" rx="${fr}" ry="${fr*0.72}" fill="#5a8848" opacity="0.78"/>
    ${stage >= 3 ? `<ellipse cx="${cx-fr*0.55}" cy="${cy+fr*0.15}" rx="${fr*0.65}" ry="${fr*0.52}" fill="#4e7a3c" opacity="0.72"/>
    <ellipse cx="${cx+fr*0.52}" cy="${cy+fr*0.12}" rx="${fr*0.62}" ry="${fr*0.5}" fill="#568040" opacity="0.7"/>` : ""}
  ` : "";

  const flowerCount = stage >= 3 ? Math.round((stage - 2) / 7 * 16) : 0;
  let flowers = "";
  for (let i = 0; i < flowerCount; i++) {
    const t = i / 16;
    const angle = t * Math.PI * 2 * 1.618 + 0.7;
    const r = (0.3 + t * 0.65) * fr;
    const fx = cx + Math.cos(angle) * r * 0.9;
    const fy = cy + Math.sin(angle) * r * 0.6;
    const pr = 3.2 + stageRatio * 1.5;
    for (let p = 0; p < 5; p++) {
      const pa = (p * 72) * Math.PI / 180;
      flowers += `<circle cx="${(fx+Math.cos(pa)*pr*0.52).toFixed(1)}" cy="${(fy+Math.sin(pa)*pr*0.52).toFixed(1)}" r="${(pr*0.42).toFixed(1)}" fill="${flower.petal}" opacity="0.85"/>`;
    }
    flowers += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${(pr*0.22).toFixed(1)}" fill="${flower.center}" opacity="0.9"/>`;
  }
  return pot + trunk + foliage + flowers;
}

// ============================================================
// Ã§Â¿ÂÃ¦ÂÂ£Ã¦Â¤ÂÃ§ÂÂ© SVGÃ£ÂÂ¬Ã£ÂÂ³Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ¼Ã¯Â¼ÂÃ£ÂÂÃ£ÂÂ¿Ã£ÂÂÃ£ÂÂ»Ã¨ÂÂÃ¯Â¼Â
// ============================================================

function renderMapleBonsaiSvg(b, stage, stageRatio, health) {
  const hp = Math.max(0.3, health / 100);
  const fop = (0.7 + hp * 0.3).toFixed(2);
  const fc = hp < 0.4 ? b.foliageDark : b.foliage;

  const pot = `
    <rect x="30" y="113" width="60" height="17" rx="4" fill="${b.pot}"/>
    <rect x="27" y="109" width="66" height="7" rx="3.5" fill="${b.potRim}"/>
    <ellipse cx="60" cy="112" rx="27" ry="4.5" fill="${b.soil}" opacity="0.9"/>
  `;
  if (stage === 0) return pot + `<ellipse cx="60" cy="109" rx="3" ry="3" fill="${b.foliage}" opacity="0.5"/>`;

  const trunkH = 18 + stageRatio * 60;
  const trunkTop = 112 - trunkH;
  const trunk = `<path d="M60 112 C58 ${112-trunkH*0.35} 63 ${112-trunkH*0.65} 60 ${trunkTop}" stroke="${b.trunk}" stroke-width="${3.5+stageRatio*2}" stroke-linecap="round" fill="none"/>`;

  if (stage <= 1) return pot + trunk + `<circle cx="60" cy="${trunkTop-4}" r="5" fill="${fc}" opacity="${fop}"/>`;

  const bSpread = 12 + stageRatio * 20;
  const bY1 = trunkTop + trunkH * 0.55;
  const bY2 = trunkTop + trunkH * 0.28;
  const branches = `
    <path d="M60 ${bY1} C50 ${bY1-5} ${60-bSpread} ${bY1-10} ${60-bSpread-6} ${bY1-20}" stroke="${b.branch}" stroke-width="${2.5+stageRatio}" stroke-linecap="round" fill="none"/>
    ${stage >= 3 ? `<path d="M60 ${bY1} C70 ${bY1-4} ${60+bSpread} ${bY1-8} ${60+bSpread+5} ${bY1-18}" stroke="${b.branch}" stroke-width="${2+stageRatio*0.5}" stroke-linecap="round" fill="none"/>` : ""}
    ${stage >= 5 ? `<path d="M60 ${bY2} C51 ${bY2-4} ${60-bSpread*0.8} ${bY2-9} ${60-bSpread*0.9-4} ${bY2-18}" stroke="${b.branch}" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M60 ${bY2} C69 ${bY2-3} ${60+bSpread*0.7} ${bY2-7} ${60+bSpread*0.8+4} ${bY2-16}" stroke="${b.branch}" stroke-width="1.8" stroke-linecap="round" fill="none"/>` : ""}
  `;

  const lr = 7 + stageRatio * 5;
  const leafCluster = (x, y, r, op) => `
    <circle cx="${x}" cy="${y}" r="${r}" fill="${fc}" opacity="${op}"/>
    <circle cx="${x}" cy="${y}" r="${(r*0.55).toFixed(1)}" fill="${b.foliageDark}" opacity="${(Number(op)*0.55).toFixed(2)}"/>
  `;
  const foliage = `
    ${stage >= 2 ? leafCluster(60-bSpread-4, bY1-24, lr, fop) : ""}
    ${stage >= 3 ? leafCluster(60+bSpread+3, bY1-21, lr*0.9, fop) : ""}
    ${stage >= 5 ? leafCluster(60-bSpread*0.9-2, bY2-20, lr*0.85, fop) : ""}
    ${stage >= 5 ? leafCluster(60+bSpread*0.8+2, bY2-18, lr*0.8, fop) : ""}
    ${leafCluster(60, trunkTop-lr*0.7, lr*1.1, fop)}
    ${stage >= 4 ? leafCluster(60-lr*0.6, trunkTop-lr*1.6, lr*0.75, (Number(fop)*0.9).toFixed(2)) : ""}
    ${stage >= 6 ? leafCluster(60+lr*0.5, trunkTop-lr*1.4, lr*0.7, (Number(fop)*0.85).toFixed(2)) : ""}
  `;
  return pot + trunk + branches + foliage;
}

function renderMossSvg(b, stage, stageRatio, health) {
  const hp = Math.max(0.3, health / 100);
  const fop = (0.65 + hp * 0.35).toFixed(2);

  const pot = `
    <rect x="30" y="113" width="60" height="17" rx="4" fill="${b.pot}"/>
    <rect x="27" y="109" width="66" height="7" rx="3.5" fill="${b.potRim}"/>
    <ellipse cx="60" cy="112" rx="27" ry="4.5" fill="${b.soil}" opacity="0.9"/>
  `;
  if (stage === 0) return pot + `<ellipse cx="60" cy="110" rx="4" ry="2" fill="${b.foliage}" opacity="0.4"/>`;

  const spread = 8 + stageRatio * 18;
  const height = 3 + stageRatio * 12;
  const density = 3 + Math.floor(stageRatio * 9);

  let mossPatches = `<ellipse cx="60" cy="${(112-height*0.3).toFixed(1)}" rx="${spread.toFixed(1)}" ry="${(height*0.6).toFixed(1)}" fill="${b.foliage}" opacity="${(Number(fop)*0.65).toFixed(2)}"/>`;

  const positions = [
    [60, 112-height], [60-spread*0.5, 112-height*0.7], [60+spread*0.5, 112-height*0.7],
    [60-spread*0.8, 112-height*0.4], [60+spread*0.8, 112-height*0.4],
    [60-spread*0.3, 112-height*1.1], [60+spread*0.3, 112-height*1.0],
    [60-spread*0.65, 112-height*0.85], [60+spread*0.65, 112-height*0.8],
    [60, 112-height*1.3], [60-spread*0.15, 112-height*0.5], [60+spread*0.15, 112-height*0.45],
  ].slice(0, density);

  positions.forEach(([px, py], i) => {
    const r = (2.5 + stageRatio * 2.5 - i * 0.08).toFixed(1);
    const localOp = (Number(fop) * (0.88 - i * 0.02)).toFixed(2);
    const tfc = i % 3 === 0 ? b.foliageLight : (i % 3 === 1 ? b.foliage : b.foliageDark);
    mossPatches += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${r}" ry="${(Number(r)*0.65).toFixed(1)}" fill="${tfc}" opacity="${localOp}"/>`;
  });

  if (health > 60 && stage >= 5) {
    mossPatches += `
      <circle cx="${(60-spread*0.2).toFixed(1)}" cy="${(112-height*1.05).toFixed(1)}" r="1.5" fill="#c8eaf8" opacity="0.65"/>
      <circle cx="${(60+spread*0.4).toFixed(1)}" cy="${(112-height*0.9).toFixed(1)}" r="1.2" fill="#c8eaf8" opacity="0.55"/>
    `;
  }
  return pot + mossPatches;
}

// ============================================================
// Ã¦ÂÂ§Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ¯Ã£ÂÂ¼ SVGÃ£ÂÂ¬Ã£ÂÂ³Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ¼Ã¯Â¼ÂÃ¤ÂºÂÃ¦ÂÂÃ¦ÂÂ§Ã£ÂÂ®Ã£ÂÂÃ£ÂÂÃ¤Â¿ÂÃ¦ÂÂÃ¯Â¼Â
// ============================================================

function renderTulipFlowerSvg(flower, stage, stageRatio) {
  const G = 122;
  const tip = G - 6 - stageRatio * 60;
  const h = G - tip;
  const lY = tip + h * 0.56;
  const lS = 0.32 + stageRatio * 0.68;
  const L = 22 * lS;
  const open = Math.max(0, Math.min(1, (stage - 3.5) / 4.5));
  const sp = open * 18;
  const pc = stage >= 5 ? flower.petal : flower.bud;
  const lc = stage >= 5 ? flower.petalLight : flower.bud;
  const bY = tip;
  const bBase = bY + 16;

  if (stage === 0) {
    return `<ellipse cx="60" cy="${G - 3}" rx="8" ry="5.5" fill="${flower.bud}" opacity="0.62"/>`;
  }

  const stem = `<path d="M60 ${G} C59.5 ${G - 16} 60.5 ${G - 36} 60 ${tip + 9}" stroke="${flower.stem}" stroke-width="5" stroke-linecap="round" fill="none"/>`;

  const ll = stage >= 2
    ? `<path d="M56 ${lY} C${(56 - L).toFixed(1)} ${(lY - L * 0.36).toFixed(1)} ${(56 - L * 1.2).toFixed(1)} ${(lY - L).toFixed(1)} ${(56 - L * 0.85).toFixed(1)} ${(lY - L * 1.72).toFixed(1)} C${(56 - L * 0.28).toFixed(1)} ${(lY - L * 1.28).toFixed(1)} ${(56 + L * 0.1).toFixed(1)} ${(lY - L * 0.58).toFixed(1)} 56 ${lY.toFixed(1)}Z" fill="${flower.leaf}" opacity="0.92"/>`
    : "";
  const rl = stage >= 2
    ? `<path d="M64 ${(lY - L * 0.24).toFixed(1)} C${(64 + L).toFixed(1)} ${(lY - L * 0.6).toFixed(1)} ${(64 + L * 1.2).toFixed(1)} ${(lY - L * 1.2).toFixed(1)} ${(64 + L * 0.85).toFixed(1)} ${(lY - L * 1.96).toFixed(1)} C${(64 + L * 0.24).toFixed(1)} ${(lY - L * 1.52).toFixed(1)} ${(64 - L * 0.1).toFixed(1)} ${(lY - L * 0.82).toFixed(1)} 64 ${(lY - L * 0.24).toFixed(1)}Z" fill="${flower.leaf}" opacity="0.86"/>`
    : "";

  let bl = "";
  if (stage < 3) {
    bl = `<ellipse cx="60" cy="${bY + 5}" rx="3.5" ry="${4 + stage}" fill="${flower.bud}" opacity="0.74"/>`;
  } else if (open < 0.05) {
    bl = `
      <path d="M52 ${bBase} C50 ${bBase - 10} 50 ${bY - 1} 60 ${bY - 17} C70 ${bY - 1} 70 ${bBase - 10} 68 ${bBase} C64 ${bBase + 4} 56 ${bBase + 4} 52 ${bBase}Z" fill="${pc}" opacity="0.92"/>
      <path d="M56 ${bBase} C55 ${bBase - 8} 55 ${bY + 2} 60 ${bY - 13}" stroke="${lc}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.5"/>
      <path d="M64 ${bBase} C65 ${bBase - 8} 65 ${bY + 2} 60 ${bY - 13}" stroke="${lc}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.5"/>
    `;
  } else if (stage === 9) {
    bl = `
      <path d="M52 ${bBase + 4} C36 ${bBase - 2} 32 ${bY + 4} 42 ${bY - 10} C52 ${bY - 22} 58 ${bY - 8} 56 ${bBase}Z" fill="${pc}" opacity="0.66"/>
      <path d="M68 ${bBase + 4} C84 ${bBase - 2} 88 ${bY + 4} 78 ${bY - 10} C68 ${bY - 22} 62 ${bY - 8} 64 ${bBase}Z" fill="${pc}" opacity="0.66"/>
      <path d="M54 ${bBase + 6} C51 ${bBase - 4} 52 ${bY} 60 ${bY - 24} C68 ${bY} 69 ${bBase - 4} 66 ${bBase + 6} C62 ${bBase + 10} 58 ${bBase + 10} 54 ${bBase + 6}Z" fill="${lc}" opacity="0.74"/>
      <ellipse cx="60" cy="${bBase + 1}" rx="${4 + sp * 0.15}" ry="4" fill="${flower.center}" opacity="0.58"/>
    `;
  } else {
    bl = `
      <path d="M58 ${bBase} C51 ${bBase - 5} 44 ${bY + 8} 47 ${(bY - 9 - sp).toFixed(1)} C52 ${(bY - 20 - sp * 0.7).toFixed(1)} 59 ${bY - 16} 57 ${bY - 5} C57 ${bBase - 3} 57.5 ${bBase - 1} 58 ${bBase}Z" fill="${pc}" opacity="0.76"/>
      <path d="M62 ${bBase} C69 ${bBase - 5} 76 ${bY + 8} 73 ${(bY - 9 - sp).toFixed(1)} C68 ${(bY - 20 - sp * 0.7).toFixed(1)} 61 ${bY - 16} 63 ${bY - 5} C63 ${bBase - 3} 62.5 ${bBase - 1} 62 ${bBase}Z" fill="${pc}" opacity="0.76"/>
      <path d="M52 ${bBase + 3} C49 ${bBase - 7} 51 ${bY + 2} 60 ${(bY - 18 - sp * 0.55).toFixed(1)} C69 ${bY + 2} 71 ${bBase - 7} 68 ${bBase + 3} C64 ${bBase + 7} 56 ${bBase + 7} 52 ${bBase + 3}Z" fill="${lc}" opacity="0.97"/>
      <ellipse cx="60" cy="${bBase - 1}" rx="${(2.8 + sp * 0.22).toFixed(1)}" ry="3.8" fill="${flower.center}" opacity="0.8"/>
    `;
  }

  return `${stem}${ll}${rl}${bl}`;
}

function renderSunflowerFlowerSvg(flower, stage, stageRatio) {
  const G = 122;
  const tip = G - 4 - stageRatio * 70;
  const bY = tip;
  const h = G - tip;
  const lY = tip + h * 0.52;
  const lS = 0.35 + stageRatio * 0.65;
  const L = 24 * lS;

  if (stage === 0) {
    return `<ellipse cx="60" cy="${G - 3}" rx="8" ry="5.5" fill="${flower.bud}" opacity="0.65"/>`;
  }

  const stem = `<path d="M60 ${G} C60 ${G - 20} 59.5 ${G - 42} 60 ${tip + 10}" stroke="${flower.stem}" stroke-width="5.4" stroke-linecap="round" fill="none"/>`;

  const ll = stage >= 2
    ? `<path d="M58 ${lY} C${(58 - L).toFixed(1)} ${(lY - L * 0.4).toFixed(1)} ${(58 - L * 1.3).toFixed(1)} ${(lY - L * 0.9).toFixed(1)} ${(58 - L).toFixed(1)} ${(lY - L * 1.8).toFixed(1)} C${(58 - L * 0.3).toFixed(1)} ${(lY - L * 1.4).toFixed(1)} ${(58 + L * 0.1).toFixed(1)} ${(lY - L * 0.7).toFixed(1)} 58 ${lY.toFixed(1)}Z" fill="${flower.leaf}" opacity="0.9"/>`
    : "";
  const rl = stage >= 3
    ? `<path d="M62 ${(lY - L * 0.3).toFixed(1)} C${(62 + L).toFixed(1)} ${(lY - L * 0.7).toFixed(1)} ${(62 + L * 1.3).toFixed(1)} ${(lY - L * 1.2).toFixed(1)} ${(62 + L).toFixed(1)} ${(lY - L * 2.1).toFixed(1)} C${(62 + L * 0.2).toFixed(1)} ${(lY - L * 1.6).toFixed(1)} ${(62 - L * 0.1).toFixed(1)} ${(lY - L * 0.8).toFixed(1)} 62 ${(lY - L * 0.3).toFixed(1)}Z" fill="${flower.leaf}" opacity="0.84"/>`
    : "";

  let blossom = "";
  if (stage < 3) {
    // Ã§Â¨Â®Ã£ÂÂÃ¨ÂÂÃ£ÂÂ®Ã£ÂÂ³: Ã¥ÂÂÃ£ÂÂ®Ã¤Â¸ÂÃ£ÂÂ«Ã¥Â°ÂÃ£ÂÂÃ£ÂÂªÃ¤Â¸Â¸Ã£ÂÂÃ¨ÂÂ½/Ã¨ÂÂ¾
    const r = 3.5 + stage * 1.5;
    blossom = `<circle cx="60" cy="${bY + 5}" r="${r}" fill="${flower.bud}" opacity="0.82"/>`;
  } else if (stage < 6) {
    // Ã£ÂÂ¤Ã£ÂÂ¼Ã£ÂÂ¿Ã£ÂÂÃ¨ÂÂ²Ã£ÂÂ¥Ã£ÂÂ: Ã¨ÂÂ±Ã¥Â¼ÂÃ£ÂÂªÃ£ÂÂÃ£ÂÂÃ¨ÂÂ¨Ã£ÂÂÃ£ÂÂÃ£ÂÂ Ã¤Â¸Â¸Ã£ÂÂÃ¨ÂÂ¾Ã£ÂÂ Ã£ÂÂ
    const r = 5 + (stage - 3) * 3.5;
    blossom = `
      <circle cx="60" cy="${bY.toFixed(1)}" r="${(r + 2).toFixed(1)}" fill="${flower.center}" opacity="0.22"/>
      <circle cx="60" cy="${bY.toFixed(1)}" r="${r.toFixed(1)}" fill="${flower.bud}" opacity="0.9"/>
    `;
  } else {
    // Ã¥ÂÂ²Ã£ÂÂÃ¥Â§ÂÃ£ÂÂÃ¤Â»Â¥Ã©ÂÂ: Ã¨ÂÂ±Ã¥Â¼ÂÃ£ÂÂÃ©ÂÂÃ£ÂÂ
    const petalCount = Math.round(10 + (stage - 6) * 1.5);
    const centerR = 7 + (stage - 6) * 2.2;
    const petalL = 12 + (stage - 6) * 4 + stageRatio * 4;
    const petalW = 4 + (stage - 6) * 0.8 + stageRatio * 0.6;
    const innerR = centerR + 2;

    const petals = Array.from({ length: petalCount }, (_, i) => {
      const angle = (360 / petalCount) * i + (i % 2 === 0 ? 0 : 180 / petalCount);
      const op = 0.82 + (i % 3 === 0 ? 0.1 : 0);
      return `<ellipse cx="60" cy="${(bY - innerR - petalL * 0.5).toFixed(1)}" rx="${petalW.toFixed(1)}" ry="${petalL.toFixed(1)}" fill="${flower.petal}" transform="rotate(${angle.toFixed(1)} 60 ${bY.toFixed(1)})" opacity="${op}"/>`;
    }).join("");

    const lightR = centerR * 0.38;
    blossom = `
      ${petals}
      <circle cx="60" cy="${bY.toFixed(1)}" r="${(centerR + 1.5).toFixed(1)}" fill="${flower.center}" opacity="0.28"/>
      <circle cx="60" cy="${bY.toFixed(1)}" r="${centerR.toFixed(1)}" fill="${flower.center}"/>
      <circle cx="${(60 - centerR * 0.28).toFixed(1)}" cy="${(bY - centerR * 0.22).toFixed(1)}" r="${lightR.toFixed(1)}" fill="${flower.petalLight}" opacity="0.28"/>
      <circle cx="${(60 + centerR * 0.32).toFixed(1)}" cy="${(bY + centerR * 0.18).toFixed(1)}" r="${(lightR * 0.72).toFixed(1)}" fill="${flower.petalLight}" opacity="0.2"/>
    `;
  }

  return `${stem}${ll}${rl}${blossom}`;
}

function renderLavenderFlowerSvg(flower, stage, stageRatio) {
  const G = 122;
  const tip = G - 6 - stageRatio * 62;
  const bY = tip;
  const h = G - tip;
  const lY = tip + h * 0.58;
  const lS = 0.3 + stageRatio * 0.7;
  const L = 20 * lS;

  if (stage === 0) {
    return `<ellipse cx="60" cy="${G - 3}" rx="7" ry="5" fill="${flower.bud}" opacity="0.62"/>`;
  }

  const stem = `<path d="M60 ${G} C60 ${G - 16} 60 ${G - 38} 60 ${tip + 8}" stroke="${flower.stem}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;

  const ll = stage >= 2
    ? `<path d="M59 ${lY} C${(59 - L).toFixed(1)} ${(lY - L * 0.5).toFixed(1)} ${(59 - L * 1.2).toFixed(1)} ${(lY - L * 1.1).toFixed(1)} ${(59 - L * 0.8).toFixed(1)} ${(lY - L * 1.8).toFixed(1)} C${(59 - L * 0.2).toFixed(1)} ${(lY - L * 1.3).toFixed(1)} ${(59 + L * 0.15).toFixed(1)} ${(lY - L * 0.6).toFixed(1)} 59 ${lY.toFixed(1)}Z" fill="${flower.leaf}" opacity="0.88"/>`
    : "";
  const rl = stage >= 2
    ? `<path d="M61 ${(lY - L * 0.2).toFixed(1)} C${(61 + L).toFixed(1)} ${(lY - L * 0.7).toFixed(1)} ${(61 + L * 1.2).toFixed(1)} ${(lY - L * 1.3).toFixed(1)} ${(61 + L * 0.8).toFixed(1)} ${(lY - L * 2.0).toFixed(1)} C${(61 + L * 0.1).toFixed(1)} ${(lY - L * 1.5).toFixed(1)} ${(61 - L * 0.1).toFixed(1)} ${(lY - L * 0.8).toFixed(1)} 61 ${(lY - L * 0.2).toFixed(1)}Z" fill="${flower.leaf}" opacity="0.82"/>`
    : "";

  let spike = "";
  if (stage >= 1) {
    const floretCount = Math.min(stage + 1, 10);
    const spikeBottom = bY + 14;
    const spikeTop = bY - 6;
    const spikeH = spikeBottom - spikeTop;
    const color = stage >= 5 ? flower.petal : flower.bud;

    spike = Array.from({ length: floretCount }, (_, i) => {
      const t = i / Math.max(floretCount - 1, 1);
      const fy = (spikeBottom - t * spikeH).toFixed(1);
      const fw = (4.4 - t * 1.6).toFixed(1);
      const fh = (3.8 - t * 1.1).toFixed(1);
      const offsetX = (i % 2 === 0 ? -5.8 : 5.8) * (1 - t * 0.28);
      const op = (0.52 + (1 - t) * 0.44).toFixed(2);
      const lop = stage >= 6 ? (0.5 - t * 0.28).toFixed(2) : "0";

      return `
        <ellipse cx="${(60 + offsetX).toFixed(1)}" cy="${fy}" rx="${fw}" ry="${fh}" fill="${color}" opacity="${op}"/>
        ${stage >= 5 ? `<ellipse cx="60" cy="${(Number(fy) - 1.5).toFixed(1)}" rx="${(Number(fw) * 0.72).toFixed(1)}" ry="${(Number(fh) * 0.62).toFixed(1)}" fill="${flower.petalLight}" opacity="${lop}"/>` : ""}
      `;
    }).join("");
  }

  return `${stem}${ll}${rl}${spike}`;
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
        <span>Ã£ÂÂ</span>
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
      (item) => `<option value="${escapeHtml(item.id)}" ${ui.finishDraft && ui.finishDraft.milestoneId === item.id ? "selected" : ""}>${escapeHtml(item.label)} / Ã§ÂÂ®Ã¥Â®Â ${item.target}%</option>`,
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
                  ${PLAN_META[key].label}<br /><span class="muted">${state.plans[key].minutes}Ã¥ÂÂ</span>
                </button>
              `,
            )
            .join("")}
        </div>

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
                    placeholder="Ã¥ÂÂ"
                    value="${escapeHtml(formatElapsedForInput(ui.finishDraft.elapsedSeconds))}"
                  />
                  <span class="elapsed-timer-unit">${ui.finishDraft.elapsedSeconds !== ui.finishDraft._originalElapsed ? formatLoggedDuration(ui.finishDraft.elapsedSeconds) : "Ã¥ÂÂ:Ã§Â§Â"}</span>
                </div>
                <p class="sheet__caption">Ã¥Â®ÂÃ¨Â¡ÂÃ¦ÂÂÃ©ÂÂ / Ã¤ÂºÂÃ¥Â®Â ${formatLoggedDuration(ui.finishDraft.plannedSeconds)} / ${PLAN_META[ui.finishDraft.outcome].label}<br><span style="opacity:0.6;font-size:0.78em">Ã¢ÂÂ± Ã£ÂÂ¿Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¦Ã¤Â¿Â®Ã¦Â­Â£Ã¯Â¼ÂÃ¤Â¾Â: 10 Ã£ÂÂ¾Ã£ÂÂÃ£ÂÂ¯ 1:30Ã¯Â¼Â</span></p>
              </div>
              <div class="panel stack">
                <h3 class="panel__title">Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂ®Ã¤Â»ÂÃ¤Â¸ÂÃ£ÂÂ</h3>
                ${state.setup.goalType !== "habit" ? `
                <div class="field-grid field-grid--two">
                  <label class="field">
                    <span class="field__label">Ã©ÂÂ²Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³</span>
                    <select class="field__control" data-finish-field="milestoneId">
                      <option value="">Ã¤Â»ÂÃ¥ÂÂÃ£ÂÂ¯Ã¦ÂÂ´Ã¦ÂÂ°Ã£ÂÂÃ£ÂÂªÃ£ÂÂ</option>
                      ${milestoneOptions}
                    </select>
                  </label>
                  <label class="field">
                    <span class="field__label">Ã£ÂÂÃ£ÂÂ®Ã§Â¯ÂÃ§ÂÂ®Ã£ÂÂ®Ã¦ÂÂ±Ã£ÂÂ</span>
                    <select class="field__control" data-finish-field="milestoneStatus">
                      <option value="working" ${ui.finishDraft.milestoneStatus === "working" ? "selected" : ""}>Ã£ÂÂ¾Ã£ÂÂ Ã©ÂÂÃ¤Â¸Â­</option>
                      <option value="complete" ${ui.finishDraft.milestoneStatus === "complete" ? "selected" : ""}>Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂ§Ã¥Â®ÂÃ¤ÂºÂ</option>
                    </select>
                  </label>
                </div>` : ""}
                <label class="field">
                  <span class="field__label">Ã£ÂÂ²Ã£ÂÂ¨Ã£ÂÂÃ£ÂÂ¨</span>
                  <textarea data-finish-field="reflection" placeholder="Ã¤Â»Â»Ã¦ÂÂÃ£ÂÂÃ¦Â°ÂÃ£ÂÂ¥Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ°Ã¤Â¸ÂÃ¨Â¨ÂÃ£ÂÂ Ã£ÂÂ">${escapeHtml(ui.finishDraft.reflection)}</textarea>
                </label>
              </div>
            `
            : `
              <div class="panel panel--cool">
                ${state.setup.goal ? `<p style="font-size:0.8rem;font-weight:600;opacity:0.6;text-align:center;margin:0 0 2px;letter-spacing:0.02em">${escapeHtml(state.setup.goal)}</p>` : ""}
                <p class="sheet__timer" id="session-timer-value">${overtime ? "Ã¦ÂÂÃ©ÂÂÃ£ÂÂ§Ã£ÂÂ" : (ui.focusPausedAt ? "Ã¢ÂÂ¸" : formatCountdown(remaining))}</p>
                ${(state.activeSession?.departures > 0) ? `<p style="font-size:0.78rem;opacity:0.55;text-align:center;margin:4px 0 0">Ã©ÂÂ¢Ã¨ÂÂ± ${state.activeSession.departures}Ã¥ÂÂ<\/p>` : ""}
              </div>
            `
        }

        <div class="sheet__actions">
          ${
            ui.finishDraft
              ? `
                <button type="button" class="action-button action-button--primary" data-action="save-finish-log">Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂ¦Ã©ÂÂÃ£ÂÂÃ£ÂÂ</button>
                <button type="button" class="soft-button" data-action="cancel-finish">Ã£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ«Ã¦ÂÂ»Ã£ÂÂ</button>
              `
              : state.activeSession
                ? `
                  <button type="button" class="action-button action-button--primary" data-action="complete-session">Ã¥Â®ÂÃ¤ÂºÂÃ£ÂÂÃ¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂ</button>
                  <button type="button" class="action-button" data-action="downgrade-session">Ã£ÂÂÃ£ÂÂ£Ã£ÂÂ¨Ã¨Â»Â½Ã£ÂÂÃ£ÂÂÃ£ÂÂ¦Ã§ÂÂÃ¥ÂÂ°Ã£ÂÂÃ£ÂÂ</button>
                  <button type="button" class="soft-button" data-action="close-session">Ã©ÂÂÃ£ÂÂÃ£ÂÂ</button>
                `
                : `
                  <button type="button" class="action-button action-button--primary" data-action="begin-session">Ã£ÂÂÃ£ÂÂ®Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ³Ã£ÂÂ§Ã¥Â§ÂÃ£ÂÂÃ£ÂÂ</button>
                  <button type="button" class="soft-button" data-action="close-session">Ã£ÂÂÃ£ÂÂ¨Ã£ÂÂ§</button>
                `
          }
        </div>
      </div>
    </section>
  `;
}

function openFinishDraft(planKey) {
  ui.selectedSessionPlan = planKey;
  const rawElapsed = state.activeSession
    ? Math.max(1, Math.round((Date.now() - state.activeSession.startedAt - (state.activeSession.totalPausedMs || 0)) / 1000))
    : state.plans[planKey].minutes * 60;
  const elapsedSeconds = Math.max(1, rawElapsed);
  const roadmap = computeRoadmap(state);

  ui.finishDraft = {
    outcome: planKey,
    elapsedSeconds,
    _originalElapsed: elapsedSeconds,
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

function pauseFocusSession() {
  if (!state.activeSession || ui.finishDraft || ui.focusPausedAt) return;
  ui.focusPausedAt = Date.now();
  state.activeSession.departures = (state.activeSession.departures || 0) + 1;
  if (ui.sessionTimer) { window.clearInterval(ui.sessionTimer); ui.sessionTimer = null; }
  showFocusLostOverlay();
  sendFocusNotification();
  saveState();
  render();
}

function sendFocusNotification() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification("Ã¢ÂÂ¸ Ã¤Â½ÂÃ¦Â¥Â­Ã¤Â¸Â­Ã£ÂÂ§Ã£ÂÂÃ¯Â¼Â", { body: "StreakBonsaiÃ£ÂÂ«Ã¦ÂÂ»Ã£ÂÂ£Ã£ÂÂ¦Ã£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂÃ¥ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂ", icon: "./bonsai-favicon.svg" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(p => {
      if (p === "granted") new Notification("Ã¢ÂÂ¸ Ã¤Â½ÂÃ¦Â¥Â­Ã¤Â¸Â­Ã£ÂÂ§Ã£ÂÂÃ¯Â¼Â", { body: "StreakBonsaiÃ£ÂÂ«Ã¦ÂÂ»Ã£ÂÂ£Ã£ÂÂ¦Ã£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂÃ¥ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂ", icon: "./bonsai-favicon.svg" });
    });
  }
}

function resumeFocusSession() {
  if (!state.activeSession || ui.finishDraft || !ui.focusPausedAt) return;
  const pauseDuration = Date.now() - ui.focusPausedAt;
  state.activeSession.endsAt += pauseDuration;
  state.activeSession.totalPausedMs = (state.activeSession.totalPausedMs || 0) + pauseDuration;
  ui.focusPausedAt = null;
  hideFocusLostOverlay();
  const d = state.activeSession.departures || 0;
  showToast(`Ã¤Â½ÂÃ¦Â¥Â­Ã¥ÂÂÃ©ÂÂÃ¯Â¼Â Ã©ÂÂ¢Ã¨ÂÂ±: ${d}Ã¥ÂÂ`);
  startSessionTicker();
  saveState();
  render();
}

function showFocusLostOverlay() {
  let overlay = document.getElementById("focus-lost-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "focus-lost-overlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(20,16,10,0.82);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;gap:14px";
    overlay.innerHTML = '<div style="font-size:2.8rem">Ã¢ÂÂ¸<\/div><p style="font-size:1.1rem;font-weight:700;margin:0">Ã£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂÃ¤Â¸ÂÃ¦ÂÂÃ¥ÂÂÃ¦Â­Â¢Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ<\/p><p style="font-size:0.88rem;opacity:0.75;margin:0">Ã£ÂÂÃ£ÂÂ®Ã£ÂÂ¿Ã£ÂÂÃ£ÂÂ«Ã¦ÂÂ»Ã£ÂÂÃ£ÂÂ¨Ã¥ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂ<\/p>';
    document.body.appendChild(overlay);
  }
  overlay.hidden = false;
}

function hideFocusLostOverlay() {
  const overlay = document.getElementById("focus-lost-overlay");
  if (overlay) overlay.hidden = true;
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function beginSession(planKey) {
  const now = Date.now();
  state.activeSession = {
    planKey,
    startedAt: now,
    endsAt: now + state.plans[planKey].minutes * 60 * 1000,
    departures: 0,
    totalPausedMs: 0,
  };
  ui.selectedSessionPlan = planKey;
  ui.finishDraft = null;
  ui.sessionOpen = true;
  requestNotificationPermission();
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
    ? Math.max(1, Math.round((Date.now() - state.activeSession.startedAt - (state.activeSession.totalPausedMs || 0)) / 1000))
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
    state: item.isComplete ? "Ã¥ÂÂ°Ã©ÂÂÃ¦Â¸ÂÃ£ÂÂ¿" : currentMilestone && item.id === currentMilestone.id ? "Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ" : "Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ",
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
      badge: "Ã¦Â¬Â¡Ã£ÂÂ¯Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ",
      windowLabel: `Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ ${currentState.setup.primaryWindow}`,
      actionLabel: `Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ« ${PLAN_META[baselinePlan].label} Ã£ÂÂÃ£ÂÂÃ¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®1Ã¦ÂÂ¬Ã£ÂÂÃ§ÂµÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂ`,
      copy: "Ã£ÂÂ¾Ã£ÂÂ Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ¥ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂÃ¦ÂÂÃ©ÂÂÃ£ÂÂ«Ã£ÂÂªÃ£ÂÂ£Ã£ÂÂÃ£ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ°Ã¥ÂÂÃ¥ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ",
      tone: "accent",
      planCap: baselinePlan,
    };
  }

  if (minute <= primary.end) {
    return {
      badge: "Ã£ÂÂÃ£ÂÂ¾Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ",
      windowLabel: currentState.setup.primaryWindow,
      actionLabel: `Ã£ÂÂÃ£ÂÂ¾Ã¥Â§ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂªÃ£ÂÂ ${PLAN_META[baselinePlan].label} Ã£ÂÂ§Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®1Ã¦ÂÂ¬Ã£ÂÂÃ§ÂµÂÃ£ÂÂÃ£ÂÂ`,
      copy: "Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®1Ã¦ÂÂ¬Ã£ÂÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂÃ¦ÂÂÃ©ÂÂÃ¥Â¸Â¯Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ",
      tone: "accent",
      planCap: baselinePlan,
    };
  }

  return {
    badge: "Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ¥Â¾Â",
    windowLabel: `Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂ ${currentState.setup.primaryWindow}`,
    actionLabel: `Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂªÃ£ÂÂ ${PLAN_META.C.label} Ã£ÂÂ§Ã¨Â¨ÂÃ©ÂÂ²Ã£ÂÂÃ¦Â®ÂÃ£ÂÂÃ£ÂÂ°Ã¥ÂÂÃ¥ÂÂÃ£ÂÂ§Ã£ÂÂ`,
    copy: "Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ¯Ã§ÂµÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ¯Ã¦ÂÂÃ¥Â°ÂÃ¥ÂÂÃ¤Â½ÂÃ£ÂÂ§Ã£ÂÂ¤Ã£ÂÂªÃ£ÂÂÃ£ÂÂÃ£ÂÂ°Ã¥ÂÂÃ¥ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ",
    tone: "default",
    planCap: "C",
  };
}

function generateReviewSuggestions(metrics, currentState) {
  const reasons = topReasons(currentState.logs, 3).map((item) => item.reason);
  const suggestions = [];

  if (reasons.some((reason) => reason.includes("Ã¦Â®ÂÃ¦Â¥Â­"))) {
    suggestions.push("Ã§ÂÂ«Ã¦ÂÂÃ£ÂÂ¯Ã¦ÂÂÃ¥ÂÂÃ£ÂÂÃ£ÂÂPlan BÃ£ÂÂ«Ã£ÂÂÃ£ÂÂ");
  }

  if (metrics.rescueRate >= 20 || currentState.planTuning.rescuePrimaryDays.length > 0) {
    suggestions.push("Ã©ÂÂÃ¦ÂÂÃ£ÂÂ¯Ã¦ÂÂÃ¦Â¸ÂÃ¦ÂÂ Ã£ÂÂÃ¤Â¸Â»Ã¦ÂÂ Ã¦ÂÂ±Ã£ÂÂÃ£ÂÂ«Ã£ÂÂÃ£ÂÂ");
  }

  if (reasons.some((reason) => reason.includes("Ã¦ÂºÂÃ¥ÂÂ"))) {
    suggestions.push("Ã©ÂÂÃ¥Â§ÂÃ¥ÂÂÃ£ÂÂ®Ã¦ÂºÂÃ¥ÂÂÃ£ÂÂ¯2Ã¥ÂÂÃ£ÂÂ¦Ã£ÂÂ©Ã£ÂÂ¼Ã£ÂÂ Ã£ÂÂ¢Ã£ÂÂÃ£ÂÂÃ£ÂÂ«Ã¥ÂÂÃ£ÂÂÃ£ÂÂ");
  } else if (reasons.some((reason) => reason.includes("Ã£ÂÂ¿Ã£ÂÂ¹Ã£ÂÂ¯"))) {
    suggestions.push("Ã¥Â¤ÂÃ£ÂÂ¯Ã¦ÂÂÃ¨Â¨ÂÃ§Â³Â»Ã£ÂÂÃ¦ÂÂÃ£ÂÂ¯Ã¦Â¼ÂÃ§Â¿ÂÃ§Â³Â»Ã£ÂÂ«Ã¥ÂÂÃ£ÂÂÃ£ÂÂ");
  } else {
    suggestions.push("Ã¦Â¬Â¡Ã£ÂÂ®1Ã¦ÂÂ¬Ã£ÂÂ¯Ã¢ÂÂÃ¥ÂÂÃ¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¢ÂÂÃ£ÂÂ¾Ã£ÂÂ§Ã£ÂÂ«Ã¥ÂÂÃ£ÂÂ£Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂ");
  }

  while (suggestions.length < 3) {
    suggestions.push("Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹Ã£ÂÂ¯1Ã¦Â®ÂµÃ£ÂÂ Ã£ÂÂÃ¥Â°ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ");
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
  const heavyReason = normalized.includes("Ã¦Â®ÂÃ¦Â¥Â­") || normalized.includes("Ã¥Â¿Â");
  const fatigueReason = normalized.includes("Ã§ÂÂ²") || normalized.includes("Ã§ÂÂ ");
  const prepReason = normalized.includes("Ã¦ÂºÂÃ¥ÂÂ") || normalized.includes("Ã©ÂÂ¢Ã¥ÂÂ");

  if (mode === "retarget_goal") {
    const retargeted = buildRetargetResult(currentState);
    const nextWeek = getWeekRoadmapItem(retargeted.roadmap);
    const nextRoadmapStep = getNextRoadmapItem(retargeted.roadmap);
    return [
      `Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂÃ£ÂÂ${currentState.setup.goal}Ã£ÂÂ -> Ã£ÂÂ${retargeted.setup.goal}Ã£ÂÂÃ£ÂÂ«Ã¦ÂÂ´Ã¦ÂÂ°`,
      `Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã£ÂÂÃ£ÂÂÃ£ÂÂ·Ã£ÂÂ§Ã£ÂÂ³Ã£ÂÂÃ£ÂÂ${currentState.today.missionTitle}Ã£ÂÂ -> Ã£ÂÂ${retargeted.today.missionTitle}Ã£ÂÂÃ£ÂÂ«Ã¦ÂÂ´Ã¦ÂÂ°`,
      `Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹Ã£ÂÂÃ£ÂÂ${weekItem ? weekItem.label : "Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹"}Ã£ÂÂ -> Ã£ÂÂ${nextWeek ? nextWeek.label : "Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹"}Ã£ÂÂÃ£ÂÂ«Ã¦ÂÂ´Ã¦ÂÂ°`,
      `Ã¦Â¬Â¡Ã£ÂÂ®Ã¤Â¸ÂÃ¦Â­Â©Ã£ÂÂÃ£ÂÂ${nextItem ? nextItem.label : "Ã¦Â¬Â¡Ã£ÂÂ®Ã¤Â¸ÂÃ¦Â­Â©"}Ã£ÂÂ -> Ã£ÂÂ${nextRoadmapStep ? nextRoadmapStep.label : "Ã¦Â¬Â¡Ã£ÂÂ®Ã¤Â¸ÂÃ¦Â­Â©"}Ã£ÂÂÃ£ÂÂ«Ã¦ÂÂ´Ã¦ÂÂ°`,
      "Ã¦Â®ÂÃ£ÂÂÃ£ÂÂ®RoadmapÃ£ÂÂ¯Ã§ÂÂ®Ã¦Â¨ÂÃ£ÂÂ¨Ã§ÂÂ¾Ã¥ÂÂ¨Ã¥ÂÂ°Ã£ÂÂÃ£ÂÂÃ¨ÂÂªÃ¥ÂÂÃ£ÂÂ§Ã¤Â½ÂÃ£ÂÂÃ§ÂÂ´Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ",
    ];
  }

  if (mode === "lighten_today") {
    return [
      `Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã©ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂ©Ã£ÂÂ³Ã£ÂÂ ${PLAN_META[todayPlan].label} -> ${PLAN_META[nextPlan].label} Ã£ÂÂ«Ã¥Â¤ÂÃ¦ÂÂ´`,
      `Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã£ÂÂÃ£ÂÂÃ£ÂÂ·Ã£ÂÂ§Ã£ÂÂ³Ã£ÂÂÃ£ÂÂ${currentState.today.missionTitle}Ã£ÂÂ -> Ã£ÂÂ${shortenMission(currentState.today.missionTitle)}Ã£ÂÂÃ£ÂÂ«Ã§ÂÂ­Ã§Â¸Â®`,
      heavyReason ? `Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ¯Ã¤Â¸Â»Ã¦ÂÂ Ã£ÂÂÃ¨Â¿Â½Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¤ÂºÂÃ¥ÂÂÃ¦ÂÂ  ${currentState.setup.backupWindow} Ã£ÂÂÃ¥ÂÂªÃ¥ÂÂÃ¨Â¡Â¨Ã§Â¤Âº` : `Ã¦ÂÂÃ¦Â¸ÂÃ£ÂÂ®Ã¥Â®ÂÃ§Â¾Â©Ã£ÂÂÃ£ÂÂ${currentState.plans.C.description}Ã£ÂÂÃ£ÂÂ®Ã£ÂÂ¾Ã£ÂÂ¾Ã¥ÂÂºÃ¥Â®Â`,
    ];
  }

  if (mode === "reset_week") {
    return [
      `${weekdayLabel("Tue")}Ã£ÂÂ®Ã©ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂ©Ã£ÂÂ³Ã£ÂÂ Plan A -> Plan B Ã£ÂÂ«Ã¥Â¤ÂÃ¦ÂÂ´`,
      `${weekdayLabel("Fri")}Ã£ÂÂ¯Ã¦ÂÂÃ¦Â¸ÂÃ¦ÂÂ  ${currentState.setup.rescueWindow} Ã£ÂÂÃ¤Â¸Â»Ã¦ÂÂ Ã¦ÂÂ±Ã£ÂÂÃ£ÂÂ«Ã£ÂÂÃ£ÂÂ`,
      `Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹Ã£ÂÂÃ£ÂÂ${weekItem ? weekItem.label : "Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹"}Ã£ÂÂ -> Ã£ÂÂÃ¤Â»ÂÃ©ÂÂ±: ${lighterWeeklyFocus(weekItem ? weekItem.label : "Ã¤Â»ÂÃ©ÂÂ±: Ã¥ÂÂÃ¥ÂÂ")}Ã£ÂÂÃ£ÂÂ«Ã¤Â¿Â®Ã¦Â­Â£`,
    ];
  }

  if (mode === "break_goal") {
    return [
      `Ã¦Â¬Â¡Ã£ÂÂ®Ã¤Â¸ÂÃ¦Â­Â©Ã£ÂÂÃ£ÂÂ${nextItem ? nextItem.label : "Ã¦Â¬Â¡Ã£ÂÂ®Ã¤Â¸ÂÃ¦Â­Â©"}Ã£ÂÂ -> Ã£ÂÂÃ¦Â¬Â¡: ${microStepFromMission(currentState.today.missionTitle)}Ã£ÂÂÃ£ÂÂ«Ã¥Â¤ÂÃ¦ÂÂ´`,
      `Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹Ã£ÂÂÃ£ÂÂ${weekItem ? weekItem.label : "Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹"}Ã£ÂÂ -> Ã£ÂÂÃ¤Â»ÂÃ©ÂÂ±: Ã¥ÂÂÃ¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¥Â®ÂÃ¤ÂºÂÃ£ÂÂÃ£ÂÂ«Ã¥ÂÂÃ¨Â§Â£`,
      `Ã¦ÂÂÃ¥Â°ÂÃ¥Â­Â¦Ã§Â¿ÂÃ¤Â¾ÂÃ£ÂÂ«Ã£ÂÂ${warmupExample(currentState.setup.minimumExample)}Ã£ÂÂÃ£ÂÂÃ¨Â¿Â½Ã¥ÂÂ `,
    ];
  }

  return [
    heavyReason ? `Ã¦Â®ÂÃ¦Â¥Â­Ã£ÂÂÃ§Â¶ÂÃ£ÂÂÃ¥ÂÂÃ¦ÂÂÃ£ÂÂ§Ã£ÂÂ${weekdayLabel("Tue")}Ã£ÂÂ¨${weekdayLabel("Thu")}Ã£ÂÂÃ¦ÂÂÃ¥ÂÂÃ£ÂÂÃ£ÂÂPlan BÃ£ÂÂ«Ã¥Â¤ÂÃ¦ÂÂ´` : "Ã¨Â©Â°Ã£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ¥ÂÂºÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ¦ÂÂÃ¦ÂÂ¥Ã£ÂÂPlan BÃ¥Â§ÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ«Ã¥Â¤ÂÃ¦ÂÂ´",
    fatigueReason ? `Ã©ÂÂÃ¥Â¸Â¸Ã¥Â­Â¦Ã§Â¿ÂÃ¦ÂÂÃ©ÂÂÃ£ÂÂ ${currentState.setup.normalMinutes}Ã¥ÂÂ -> ${Math.max(10, currentState.setup.normalMinutes - 5)}Ã¥ÂÂ Ã£ÂÂ«Ã¨ÂªÂ¿Ã¦ÂÂ´` : "Ã©ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂ¼Ã£ÂÂÃ£ÂÂ«Ã£ÂÂÃ¤Â¸ÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ¦ÂÂÃ¥Â°ÂÃ¥ÂÂÃ¤Â½ÂÃ£ÂÂÃ¥Â®ÂÃ£ÂÂ£Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂ¾Ã¤Â¸Â»Ã¦ÂÂ Ã£ÂÂ®Ã¨Â²Â Ã¨ÂÂ·Ã£ÂÂ Ã£ÂÂÃ¤Â¸ÂÃ£ÂÂÃ£ÂÂ",
    prepReason ? `Ã©ÂÂÃ¥Â§ÂÃ¥ÂÂ2Ã¥ÂÂÃ£ÂÂ®Ã£ÂÂ¦Ã£ÂÂ©Ã£ÂÂ¼Ã£ÂÂ Ã£ÂÂ¢Ã£ÂÂÃ£ÂÂÃ£ÂÂ${warmupExample(currentState.setup.minimumExample)}Ã£ÂÂÃ£ÂÂÃ¨Â¿Â½Ã¥ÂÂ ` : "Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ®Ã£ÂÂÃ£ÂÂÃ£ÂÂ·Ã£ÂÂ§Ã£ÂÂ³Ã£ÂÂ®Ã¥ÂÂÃ£ÂÂ«2Ã¥ÂÂÃ£ÂÂ®Ã£ÂÂ¦Ã£ÂÂ©Ã£ÂÂ¼Ã£ÂÂ Ã£ÂÂ¢Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¨Â¿Â½Ã¥ÂÂ ",
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
    state.today.missionNote = `Ã¤Â»ÂÃ¦ÂÂ¥Ã£ÂÂ¯Ã¨Â»Â½Ã©ÂÂÃ§ÂÂÃ£ÂÂ§Ã£ÂÂ¤Ã£ÂÂªÃ£ÂÂÃ¦ÂÂ¥Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ${state.today.missionNote}`;
    state.plans = buildPlans(state.setup, state.today.missionTitle);
    return;
  }

  if (mode === "reset_week") {
    state.planTuning.defaultPlanByDay.Tue = "B";
    state.planTuning.rescuePrimaryDays = Array.from(new Set([...state.planTuning.rescuePrimaryDays, "Fri"]));
    state.roadmap = state.roadmap.map((item) =>
      item.id === "week" ? { ...item, label: `Ã¤Â»ÂÃ©ÂÂ±: ${lighterWeeklyFocus(item.label)}` } : item,
    );
    return;
  }

  if (mode === "break_goal") {
    state.roadmap = state.roadmap.map((item) => {
      if (item.id === "week") {
        return { ...item, label: "Ã¤Â»ÂÃ©ÂÂ±: Ã¥ÂÂÃ¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¥Â®ÂÃ¤ÂºÂ" };
      }
      if (item.id === "next") {
        return { ...item, label: `Ã¦Â¬Â¡: ${microStepFromMission(state.today.missionTitle)}` };
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
      description: `${baseMission} + 1Ã¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¦ÂÂ¯Ã£ÂÂÃ¨Â¿ÂÃ£ÂÂ`,
    },
    B: {
      minutes: shortMinutes,
      description: `${shortenMission(baseMission)}Ã£ÂÂ Ã£ÂÂÃ©ÂÂ²Ã£ÂÂÃ£ÂÂ`,
    },
    C: {
      minutes: minimumMinutes,
      description: `${warmupExample(setup.minimumExample)}Ã£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ`,
    },
  };
}

function buildInitialRoadmap(setup) {
  const profile = getGoalProfile(setup);

  return orderRoadmapItems([
    { id: "goal", kind: "system", target: ROADMAP_TARGETS.goal, label: shortenGoal(setup.goal), deadline: setup.deadline, note: "" },
    { id: "checkpoint", kind: "system", target: ROADMAP_TARGETS.checkpoint, label: profile.checkpointLabel, deadline: "", note: "" },
    { id: "foundation", kind: "system", target: ROADMAP_TARGETS.foundation, label: profile.foundationLabel, deadline: "", note: "" },
    { id: "week", kind: "system", target: ROADMAP_TARGETS.week, label: `Ã¤Â»ÂÃ©ÂÂ±: ${profile.weeklyFocus}`, deadline: "", note: "" },
    { id: "next", kind: "system", target: ROADMAP_TARGETS.next, label: `Ã¦Â¬Â¡: ${profile.nextStepLabel}`, deadline: "", note: "" },
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
    goal: "3Ã£ÂÂÃ¦ÂÂÃ¥Â¾ÂÃ£ÂÂ«Ã§Â°Â¿Ã¨Â¨Â2Ã§Â´ÂÃ£ÂÂ«Ã¥ÂÂÃ¦Â Â¼",
    deadline: toISODate(deadline),
    currentLevel: "Ã¥ÂÂÃ§Â°Â¿ 60% / Ã¥Â·Â¥Ã§Â°Â¿ 10%",
    flowerType: "sunflower",
    studyMode: "night",
    primaryWindow: "21:30-22:00",
    backupWindow: "12:20-12:35",
    rescueWindow: "23:40-23:42",
    normalMinutes: 30,
    shortMinutes: 10,
    minimumMinutes: 2,
    minimumExample: "Ã¥ÂÂÃ¨ÂªÂ5Ã¥ÂÂ / 1Ã¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¨Â§Â£Ã£ÂÂ / 1Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ¸Ã£ÂÂ Ã£ÂÂÃ¨ÂªÂ­Ã£ÂÂ",
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
    { outcome: "miss", reason: "Ã©ÂÂÃ¥Â§ÂÃ¥ÂÂÃ£ÂÂ®Ã¦ÂºÂÃ¥ÂÂÃ£ÂÂÃ©ÂÂ¢Ã¥ÂÂ" },
    { outcome: "B", reason: "Ã§ÂÂ²Ã¥ÂÂ´" },
    { outcome: "A", reason: null },
    { outcome: "C", reason: "Ã¦Â®ÂÃ¦Â¥Â­Ã£ÂÂ§Ã©ÂÂÃ¥Â§ÂÃ£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ" },
    { outcome: "A", reason: null },
    { outcome: "miss", reason: "Ã¤ÂºÂÃ¥Â®ÂÃ¥Â¤ÂÃ¦ÂÂ´" },
    { outcome: "A", reason: null },
    { outcome: "miss", reason: "Ã¦Â®ÂÃ¦Â¥Â­Ã£ÂÂ§Ã©ÂÂÃ¥Â§ÂÃ£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ" },
    { outcome: "B", reason: "Ã£ÂÂ¿Ã£ÂÂ¹Ã£ÂÂ¯Ã£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ" },
    { outcome: "A", reason: null },
    { outcome: "C", reason: "Ã§ÂÂ²Ã¥ÂÂ´" },
    { outcome: "A", reason: null },
    { outcome: "A", reason: null },
  ];

  return patterns.map((pattern, index) => ({
    date: toISODate(addDays(today, index - (patterns.length - 1))),
    outcome: pattern.outcome,
    reason: pattern.reason,
    missionTitle: "Ã§ÂÂ´Ã¦ÂÂ¥Ã¥ÂÂÃ¤Â¾Â¡Ã¨Â¨ÂÃ§Â®ÂÃ£ÂÂ®Ã¤Â¾ÂÃ©Â¡ÂÃ£ÂÂ1Ã£ÂÂ»Ã£ÂÂÃ£ÂÂÃ¨Â§Â£Ã£ÂÂ",
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
      label: String(item.label || `Ã£ÂÂÃ£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ³ ${index + 1}`),
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
    || roadmap.find((item) => String(item.label || "").startsWith("Ã¤Â»ÂÃ©ÂÂ±:"))
    || roadmap[roadmap.length - 2]
    || roadmap[0]
    || null;
}

function getNextRoadmapItem(roadmap) {
  return roadmap.find((item) => item.id === "next")
    || roadmap.find((item) => String(item.label || "").startsWith("Ã¦Â¬Â¡:"))
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
      weekDraft: stripRoadmapPrefix(weekly?.label || "", "Ã¤Â»ÂÃ©ÂÂ±:"),
      nextDraft: stripRoadmapPrefix(nextStep?.label || "", "Ã¦Â¬Â¡:"),
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
  state.replan.weekDraft = stripRoadmapPrefix(weekly?.label || "", "Ã¤Â»ÂÃ©ÂÂ±:");
  state.replan.nextDraft = stripRoadmapPrefix(nextStep?.label || "", "Ã¦Â¬Â¡:");
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
  const weekDraft = stripRoadmapPrefix(currentState.replan.weekDraft || "", "Ã¤Â»ÂÃ©ÂÂ±:");
  const nextDraft = stripRoadmapPrefix(currentState.replan.nextDraft || "", "Ã¦Â¬Â¡:");

  if (weekDraft) {
    nextRoadmap = nextRoadmap.map((item) => (
      item.id === "week" ? { ...item, label: `Ã¤Â»ÂÃ©ÂÂ±: ${weekDraft}` } : item
    ));
  }

  if (nextDraft) {
    nextRoadmap = nextRoadmap.map((item) => (
      item.id === "next" ? { ...item, label: `Ã¦Â¬Â¡: ${nextDraft}` } : item
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
  return `${weekly ? weekly.label : "Ã¤Â»ÂÃ©ÂÂ±Ã£ÂÂ®Ã¥ÂÂ°Ã©ÂÂÃ§ÂÂ¹"}Ã£ÂÂÃ£ÂÂÃ©ÂÂÃ§Â®ÂÃ£ÂÂÃ£ÂÂ1Ã¦ÂÂ¬Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ${nextStep ? nextStep.label : "Ã¦Â¬Â¡Ã£ÂÂ®Ã¤Â¸ÂÃ¦Â­Â©Ã£ÂÂ¯RoadmapÃ£ÂÂ§Ã¨Â¿Â½Ã¥ÂÂ Ã£ÂÂ§Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ"}`;
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
    showToast("Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ¯ 05:30 Ã£ÂÂ®Ã£ÂÂÃ£ÂÂÃ£ÂÂ«Ã¥ÂÂ¥Ã¥ÂÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    return null;
  }

  if (parseWindow(`${primaryStart}-${primaryEnd}`).start >= parseWindow(`${primaryStart}-${primaryEnd}`).end) {
    showToast("Ã¥Â®ÂÃ¦ÂÂ½Ã¦ÂÂÃ©ÂÂÃ£ÂÂ®Ã§ÂµÂÃ¤ÂºÂÃ£ÂÂ¯Ã©ÂÂÃ¥Â§ÂÃ£ÂÂÃ£ÂÂÃ¥Â¾ÂÃ£ÂÂ«Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
  if (!state.meta) state.meta = {};
  state.meta.lastSavedAt = Date.now();
  localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
  if (_supabaseLoadedSuccessfully) scheduleSyncToSupabase();
}

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
  showToast("Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ¿Ã£ÂÂÃ£ÂÂ¨Ã£ÂÂ¯Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
      showToast("Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ¿Ã£ÂÂÃ¥Â¾Â©Ã¥ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
    } catch (_err) {
      showToast("Ã£ÂÂÃ£ÂÂ¡Ã£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ®Ã¨ÂªÂ­Ã£ÂÂ¿Ã¨Â¾Â¼Ã£ÂÂ¿Ã£ÂÂ«Ã¥Â¤Â±Ã¦ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
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
    todayLabel.textContent = formatHeaderDate(new Date());
    if (state.meta.currentView === "today" && !ui.sessionOpen && !state.activeSession) {
      render();
    }
  }, 60000);
}

function startSessionTicker() {
  if (ui.focusPausedAt) return;
  // Already running correctly Ã¢ÂÂ don't reset the interval
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

  const updateTimerValue = () => {
    const timerValue = sessionSheet.querySelector("#session-timer-value");
    if (!timerValue) {
      return;
    }

    const remaining = getRemainingMs(state.activeSession.endsAt);
    timerValue.textContent = remaining <= 0 ? "Ã¦ÂÂÃ©ÂÂÃ£ÂÂ§Ã£ÂÂ" : formatCountdown(remaining);
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
      timerValue.textContent = remaining <= 0 ? "Ã¦ÂÂÃ©ÂÂÃ£ÂÂ§Ã£ÂÂ" : formatCountdown(remaining);
    }

    if (remaining <= 0) {
      window.clearInterval(ui.sessionTimer);
      ui.sessionTimer = null;
      showToast("Ã¤ÂºÂÃ¥Â®ÂÃ¦ÂÂÃ©ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂÃ¥Â®ÂÃ¤ÂºÂÃ£ÂÂÃ¨Â»Â½Ã©ÂÂÃ§ÂÂÃ¥ÂÂ°Ã£ÂÂÃ©ÂÂ¸Ã£ÂÂ¹Ã£ÂÂ¾Ã£ÂÂÃ£ÂÂ");
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
  // "M:SS" format Ã¢ÂÂ minutes:seconds
  const colonMatch = t.match(/^(\d{1,3}):(\d{2})$/);
  if (colonMatch) {
    const m = parseInt(colonMatch[1], 10);
    const s = parseInt(colonMatch[2], 10);
    if (s < 60) return m * 60 + s;
  }
  // Plain number Ã¢ÂÂ treated as minutes
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
    return `${hours}Ã¦ÂÂÃ©ÂÂ${String(minutes).padStart(2, "0")}Ã¥ÂÂ`;
  }
  if (minutes > 0 && seconds === 0) {
    return `${minutes}Ã¥ÂÂ`;
  }
  if (minutes > 0) {
    return `${minutes}Ã¥ÂÂ${String(seconds).padStart(2, "0")}Ã§Â§Â`;
  }
  return `${seconds}Ã§Â§Â`;
}

function formatRemainingSpan(totalDays) {
  const safeDays = Math.max(0, Math.round(totalDays || 0));
  const months = Math.floor(safeDays / 30);
  const days = safeDays % 30;

  if (months <= 0) {
    return `${days}Ã¦ÂÂ¥`;
  }
  if (days === 0) {
    return `${months}Ã£ÂÂÃ¦ÂÂ`;
  }
  return `${months}Ã£ÂÂÃ¦ÂÂ${days}Ã¦ÂÂ¥`;
}
function buildLogSummary(entry) {
  const parts = [outcomeLabel(entry.outcome)];
  const loggedSeconds = getLoggedSeconds(entry);
  if (loggedSeconds > 0) {
    parts.push(`Ã¥Â®ÂÃ¨Â¡Â ${formatLoggedDuration(loggedSeconds)}`);
  }
  if (entry.milestoneLabel) {
    parts.push(`Ã§Â¯ÂÃ§ÂÂ® ${entry.milestoneLabel}${entry.milestoneStatus === "complete" ? " Ã¥Â®ÂÃ¤ÂºÂ" : " Ã©ÂÂÃ¤Â¸Â­"}`);
  }
  if (entry.progressText) {
    parts.push(`Ã¥ÂÂ°Ã©ÂÂ ${entry.progressText}`);
  }
  if (entry.reflection) {
    parts.push(`Ã£ÂÂ¡Ã£ÂÂ¢ ${entry.reflection}`);
  }
  if (entry.reason) {
    parts.push(`Ã§ÂÂÃ§ÂÂ± ${entry.reason}`);
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
  return !text || /^(Ã¤Â½ÂÃ£ÂÂ(Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂªÃ£ÂÂ|Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂªÃ£ÂÂ|Ã£ÂÂªÃ£ÂÂ)|Ã£ÂÂªÃ£ÂÂ|Ã¦ÂÂªÃ§ÂÂÃ¦ÂÂ|Ã¦ÂÂªÃ¨Â¨Â­Ã¥Â®Â|Ã£ÂÂ¼Ã£ÂÂ­|0|0%)?[Ã£ÂÂ.\s]*$/.test(text);
}

function getGoalProfile(setup) {
  const goal = (setup.goal || "").trim();
  const weakArea = detectWeakArea(setup.currentLevel);
  const blankLevel = isBlankCurrentLevel(setup.currentLevel);

  if (goal.includes("Ã§Â°Â¿Ã¨Â¨Â")) {
    return {
      track: "Ã§Â°Â¿Ã¨Â¨Â2Ã§Â´Â / Ã¥Â·Â¥Ã¦Â¥Â­Ã§Â°Â¿Ã¨Â¨Â",
      missionTitle: "Ã§ÂÂ´Ã¦ÂÂ¥Ã¥ÂÂÃ¤Â¾Â¡Ã¨Â¨ÂÃ§Â®ÂÃ£ÂÂ®Ã¤Â¾ÂÃ©Â¡ÂÃ£ÂÂ1Ã£ÂÂ»Ã£ÂÂÃ£ÂÂÃ¨Â§Â£Ã£ÂÂ",
      foundationLabel: `${weakArea}Ã£ÂÂÃ¤Â¸ÂÃ¥ÂÂ¨`,
      weeklyFocus: weakArea.includes("Ã¥Â·Â¥") ? "CVPÃ§ÂÂÃ¨Â§Â£" : `${weakArea}Ã£ÂÂ®Ã¥ÂÂºÃ§Â¤Â`,
      checkpointLabel: "Ã¦Â¨Â¡Ã¨Â©Â¦Ã£ÂÂ§70%",
      nextStepLabel: "Ã¤Â¾ÂÃ©Â¡Â1Ã£ÂÂ»Ã£ÂÂÃ£ÂÂ",
    };
  }

  if (goal.includes("ITÃ£ÂÂÃ£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ")) {
    return {
      track: "ITÃ£ÂÂÃ£ÂÂ¹Ã£ÂÂÃ£ÂÂ¼Ã£ÂÂ / Ã¥ÂÂºÃ§Â¤Â",
      missionTitle: blankLevel ? "Ã§ÂÂ¨Ã¨ÂªÂÃ£ÂÂ10Ã¥ÂÂÃ£ÂÂ Ã£ÂÂÃ§Â¢ÂºÃ¨ÂªÂÃ£ÂÂÃ£ÂÂ¦Ã©ÂÂÃ¥ÂÂ»Ã¥ÂÂÃ£ÂÂ3Ã¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¨Â§Â¦Ã£ÂÂ" : "Ã©ÂÂÃ¥ÂÂ»Ã¥ÂÂÃ£ÂÂ5Ã¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¨Â§Â£Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ§ÂÂ¥Ã£ÂÂÃ£ÂÂªÃ£ÂÂÃ§ÂÂ¨Ã¨ÂªÂÃ£ÂÂÃ¦ÂÂ¾Ã£ÂÂ",
      foundationLabel: blankLevel ? "3Ã¥ÂÂÃ©ÂÂÃ£ÂÂ®Ã¥ÂÂ¨Ã¤Â½ÂÃ¥ÂÂÃ£ÂÂÃ¤Â¸ÂÃ¥ÂÂ¨" : `${weakArea}Ã£ÂÂÃ¤Â¸ÂÃ¥ÂÂ¨`,
      weeklyFocus: blankLevel ? "Ã£ÂÂ¹Ã£ÂÂÃ£ÂÂ©Ã£ÂÂÃ£ÂÂ¸Ã§Â³Â»Ã£ÂÂ®Ã¥ÂÂºÃ§Â¤Â" : `${weakArea}Ã£ÂÂ®Ã¥ÂÂºÃ§Â¤Â`,
      checkpointLabel: "Ã¦Â¨Â¡Ã¨Â©Â¦Ã£ÂÂ§700Ã§ÂÂ¹",
      nextStepLabel: "Ã©ÂÂÃ¥ÂÂ»Ã¥ÂÂ3Ã¥ÂÂ",
    };
  }

  if (goal.includes("Ã¨ÂÂ±Ã¨ÂªÂ")) {
    return {
      track: "Ã¨ÂÂ±Ã¨ÂªÂ / Ã¨ÂªÂ­Ã¨Â§Â£",
      missionTitle: "Ã©ÂÂ·Ã¦ÂÂÃ£ÂÂ1Ã©Â¡ÂÃ£ÂÂ Ã£ÂÂÃ¨ÂªÂ­Ã£ÂÂ¿Ã£ÂÂÃ¨Â¦ÂÃ§ÂÂ¹Ã£ÂÂ3Ã¨Â¡ÂÃ£ÂÂ§Ã£ÂÂ¾Ã£ÂÂ¨Ã£ÂÂÃ£ÂÂ",
      foundationLabel: blankLevel ? "Ã¥ÂÂºÃ§Â¤ÂÃ¥ÂÂÃ¨ÂªÂÃ£ÂÂÃ¤Â¸ÂÃ¥ÂÂ¨" : `${weakArea}Ã£ÂÂÃ¤Â¸ÂÃ¥ÂÂ¨`,
      weeklyFocus: blankLevel ? "Ã©ÂÂ·Ã¦ÂÂÃ£ÂÂ®Ã¥ÂÂºÃ§Â¤Â" : `${weakArea}Ã£ÂÂ®Ã¥ÂÂºÃ§Â¤Â`,
      checkpointLabel: "Ã¦Â¨Â¡Ã¨Â©Â¦Ã£ÂÂ§70%",
      nextStepLabel: "Ã©ÂÂ·Ã¦ÂÂ1Ã©Â¡Â",
    };
  }

  const goalLabel = goal.replace(/Ã£ÂÂ«Ã¥ÂÂÃ¦Â Â¼Ã£ÂÂÃ£ÂÂ|Ã£ÂÂÃ©ÂÂÃ¦ÂÂÃ£ÂÂÃ£ÂÂ|Ã¥ÂÂÃ¦Â Â¼|Ã©ÂÂÃ¦ÂÂ/g, "").trim() || "Ã§ÂÂ®Ã¦Â¨Â";
  return {
    track: blankLevel ? goalLabel : `${goalLabel} / ${weakArea}`,
    missionTitle: blankLevel ? `${goalLabel}Ã£ÂÂ«Ã¥ÂÂÃ£ÂÂÃ£ÂÂ¦Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ®1Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ«Ã¨Â§Â¦Ã£ÂÂ` : `${weakArea}Ã£ÂÂ®Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ®1Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ«Ã¨Â§Â¦Ã£ÂÂ`,
    foundationLabel: blankLevel ? "Ã¥ÂÂºÃ§Â¤ÂÃ£ÂÂÃ¤Â¸ÂÃ¥ÂÂ¨" : `${weakArea}Ã£ÂÂÃ¤Â¸ÂÃ¥ÂÂ¨`,
    weeklyFocus: blankLevel ? "Ã¥ÂÂºÃ§Â¤ÂÃ£ÂÂ«Ã¨Â§Â¦Ã£ÂÂ" : `${weakArea}Ã£ÂÂ®Ã¥ÂÂºÃ§Â¤Â`,
    checkpointLabel: goal.includes("Ã¥ÂÂÃ¦Â Â¼") ? "Ã¤Â¸Â­Ã©ÂÂÃ£ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂ¯Ã£ÂÂÃ©ÂÂÃ©ÂÂ" : "Ã¤Â¸Â­Ã©ÂÂÃ¥ÂÂ°Ã§ÂÂ¹Ã£ÂÂ¾Ã£ÂÂ§Ã©ÂÂ²Ã£ÂÂÃ£ÂÂ",
    nextStepLabel: "Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ®1Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ£ÂÂ",
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
    return "Ã¥ÂÂºÃ§Â¤Â";
  }

  const segments = currentLevel.split("/").map((item) => item.trim()).filter(Boolean);
  if (!segments.length) {
    return "Ã¥ÂÂºÃ§Â¤Â";
  }

  const scoredSegments = segments
    .map((segment) => {
      const match = segment.match(/(\d+)/);
      return match
        ? { label: segment.replace(/\d+%?/, "").trim() || "Ã¥ÂÂºÃ§Â¤Â", score: Number(match[1]) }
        : null;
    })
    .filter(Boolean);

  if (!scoredSegments.length) {
    return "Ã¥ÂÂºÃ§Â¤Â";
  }

  scoredSegments.sort((left, right) => left.score - right.score);
  return scoredSegments[0].label || "Ã¥ÂÂºÃ§Â¤Â";
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
  if (reason.includes("Ã¦Â®ÂÃ¦Â¥Â­")) return "Ã¦Â®ÂÃ¦Â¥Â­";
  if (reason.includes("Ã£ÂÂ¿Ã£ÂÂ¹Ã£ÂÂ¯")) return "Ã©ÂÂÃ£ÂÂ";
  if (reason.includes("Ã¦ÂºÂÃ¥ÂÂ")) return "Ã¦ÂºÂÃ¥ÂÂ";
  if (reason.includes("Ã¤ÂºÂÃ¥Â®Â")) return "Ã¤ÂºÂÃ¥Â®Â";
  if (reason.includes("Ã§ÂÂ²")) return "Ã§ÂÂ²Ã¥ÂÂ´";
  return reason;
}

function shortenMission(mission) {
  if (mission.includes("1Ã£ÂÂ»Ã£ÂÂÃ£ÂÂ")) {
    return mission.replace("1Ã£ÂÂ»Ã£ÂÂÃ£ÂÂ", "Ã¥ÂÂÃ¥ÂÂ");
  }
  if (mission.includes("Ã¨Â§Â£Ã£ÂÂ")) {
    return mission.replace("Ã¨Â§Â£Ã£ÂÂ", "Ã¥ÂÂÃ¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¨Â§Â£Ã£ÂÂ");
  }
  if (mission.includes("Ã¨ÂªÂ­Ã£ÂÂ")) {
    return mission.replace("Ã¨ÂªÂ­Ã£ÂÂ", "Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¨ÂªÂ­Ã£ÂÂ");
  }
  return `${mission}Ã£ÂÂ®Ã¥ÂÂÃ¥ÂÂÃ£ÂÂ Ã£ÂÂ`;
}

function lighterWeeklyFocus(label) {
  const clean = label.replace(/^Ã¤Â»ÂÃ©ÂÂ±:\s*/, "");
  if (clean.includes("Ã§ÂÂÃ¨Â§Â£")) {
    return clean.replace("Ã§ÂÂÃ¨Â§Â£", "Ã¥ÂÂÃ¥ÂÂ");
  }
  return `${clean}Ã£ÂÂ®Ã¥ÂÂÃ¥ÂÂ`;
}

function microStepFromMission(mission) {
  if (mission.includes("Ã¤Â¾ÂÃ©Â¡Â")) {
    return "Ã¤Â¾ÂÃ©Â¡Â1Ã¥ÂÂÃ£ÂÂ Ã£ÂÂ";
  }
  if (mission.includes("Ã©ÂÂ·Ã¦ÂÂ")) {
    return "Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ®1Ã¦Â®ÂµÃ¨ÂÂ½Ã£ÂÂ Ã£ÂÂ";
  }
  return `${mission}Ã£ÂÂ®Ã¦ÂÂÃ¥ÂÂÃ£ÂÂ Ã£ÂÂ`;
}

function warmupExample(example) {
  if (!example) return "Ã¦ÂÂºÃ£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ¦2Ã¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¦ÂºÂÃ¥ÂÂÃ£ÂÂÃ£ÂÂ";
  if (example.includes("1Ã¥ÂÂ")) {
    return "Ã¥ÂÂ¬Ã¥Â¼ÂÃ£ÂÂ1Ã£ÂÂ¤Ã£ÂÂ Ã£ÂÂÃ¨Â¦ÂÃ¨Â¿ÂÃ£ÂÂ";
  }
  return "Ã¦ÂÂºÃ£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ¦2Ã¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¦ÂºÂÃ¥ÂÂÃ£ÂÂÃ£ÂÂ";
}

function joinExamples(current, addition) {
  return current.includes(addition) ? current : `${current} / ${addition}`;
}

function shortenGoal(goal, limit = 16) {
  const safeGoal = String(goal || "");
  return safeGoal.length > limit ? `${safeGoal.slice(0, limit)}Ã¢ÂÂ¦` : safeGoal;
}

function outcomeLabel(outcome) {
  if (outcome === "A") return "Plan AÃ£ÂÂ§Ã¥Â®ÂÃ¤ÂºÂ";
  if (outcome === "B") return "Plan BÃ£ÂÂ§Ã§ÂÂ­Ã§Â¸Â®";
  if (outcome === "C") return "Plan CÃ£ÂÂ§Ã¦ÂÂÃ¦Â¸Â";
  if (outcome === "miss") return "Ã¦ÂÂªÃ¥Â®ÂÃ¦ÂÂ½";
  return "Ã¦ÂÂªÃ¨Â¨ÂÃ©ÂÂ²";
}

function logSymbol(outcome) {
  if (outcome === "A") return "A";
  if (outcome === "B") return "B";
  if (outcome === "C") return "C";
  if (outcome === "miss") return "Ã¦ÂÂª";
  return "-";
}

function logSmallLabel(outcome) {
  if (outcome === "A") return "Ã¤Â¸Â»";
  if (outcome === "B") return "Ã¤ÂºÂ";
  if (outcome === "C") return "Ã¦ÂÂ";
  if (outcome === "miss") return "Ã¤Â¼Â";
  return "";
}

function weekdayLabel(key) {
  const map = {
    Mon: "Ã¦ÂÂÃ¦ÂÂ",
    Tue: "Ã§ÂÂ«Ã¦ÂÂ",
    Wed: "Ã¦Â°Â´Ã¦ÂÂ",
    Thu: "Ã¦ÂÂ¨Ã¦ÂÂ",
    Fri: "Ã©ÂÂÃ¦ÂÂ",
    Sat: "Ã¥ÂÂÃ¦ÂÂ",
    Sun: "Ã¦ÂÂ¥Ã¦ÂÂ",
  };
  return map[key] || key;
}

function weekdayShortLabel(key) {
  const map = {
    Mon: "Ã¦ÂÂ",
    Tue: "Ã§ÂÂ«",
    Wed: "Ã¦Â°Â´",
    Thu: "Ã¦ÂÂ¨",
    Fri: "Ã©ÂÂ",
    Sat: "Ã¥ÂÂ",
    Sun: "Ã¦ÂÂ¥",
  };
  return map[key] || key;
}

function shortWeekday(dateString) {
  const date = new Date(dateString);
  return ["Ã¦ÂÂ¥", "Ã¦ÂÂ", "Ã§ÂÂ«", "Ã¦Â°Â´", "Ã¦ÂÂ¨", "Ã©ÂÂ", "Ã¥ÂÂ"][date.getDay()];
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
  const raw = String(value || "").trim().replace(/[Ã¯Â¼Â]/g, ":");
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
let _supabaseLoadedSuccessfully = false;

// Ã¢ÂÂÃ¢ÂÂ Supabase Ã¢ÂÂ Ã£ÂÂ­Ã£ÂÂ¼Ã£ÂÂ«Ã£ÂÂ«Ã¥ÂÂÃ¦ÂÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

async function loadStateFromSupabase(userId) {
  try {
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
      console.warn("Supabase load timeout: will retry in 15s");
      _supabaseLoadedSuccessfully = true;
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
      if (supabaseTs >= localTs) {
        state = mergeState(buildSeedState(), data.state);
        localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
      } else {
        scheduleSyncToSupabase();
      }
    }
  } catch (err) {
    console.warn("Supabase load error:", err);
  }
}

async function _resyncFromSupabase() {
  if (!_appInitialized || state.activeSession) return;
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const prevTs = state.meta?.lastSavedAt || 0;
    await loadStateFromSupabase(user.id);
    if ((state.meta?.lastSavedAt || 0) !== prevTs) render();
  } catch (err) {
    console.warn("Resync error:", err);
  }
}

async function pushStateToSupabase() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  syncActiveGoalRecord();
  try {
    const { data: existing } = await sb.from("user_data").select("state").eq("user_id", user.id).single();
    const supabaseTs = existing?.state?.meta?.lastSavedAt || 0;
    const localTs = state.meta?.lastSavedAt || 0;
    if (supabaseTs > localTs) {
      state = mergeState(buildSeedState(), existing.state);
      localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(state));
      render();
      return;
    }
    await sb.from("user_data").upsert(
      { user_id: user.id, state: JSON.parse(JSON.stringify(state)) },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.warn("Supabase sync error:", err);
    setTimeout(() => pushStateToSupabase(), 30000);
  }
}

function scheduleSyncToSupabase() {
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(pushStateToSupabase, 2000);
}
// Ã¢ÂÂÃ¢ÂÂ Auth UI Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

const _authOverlay = document.querySelector("#auth-overlay");
const _authForm = document.querySelector("#auth-form");
const _authEmailEl = document.querySelector("#auth-email");
const _authPasswordEl = document.querySelector("#auth-password");
const _authSubmitEl = document.querySelector("#auth-submit");
const _authErrorEl = document.querySelector("#auth-error");
const _authLoadingEl = document.querySelector("#auth-loading");
const _authHintEl = document.querySelector("#auth-hint");
const _authTabBtns = Array.from(document.querySelectorAll(".auth-tab"));
let _authMode = "login";

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

  // Ã£ÂÂÃ£ÂÂ¹Ã£ÂÂ¯Ã£ÂÂ¼Ã£ÂÂÃ£ÂÂªÃ£ÂÂ»Ã£ÂÂÃ£ÂÂÃ£ÂÂªÃ£ÂÂ³Ã£ÂÂ¯Ã£ÂÂ1Ã¥ÂÂÃ£ÂÂ Ã£ÂÂÃ¤Â½ÂÃ¦ÂÂ
  if (!document.querySelector("#auth-reset-link")) {
    const p = document.createElement("p");
    p.className = "auth-hint";
    p.id = "auth-reset-link";
    p.innerHTML = `<button type="button" class="auth-switch" id="auth-reset-btn">Ã£ÂÂÃ£ÂÂ¹Ã£ÂÂ¯Ã£ÂÂ¼Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¥Â¿ÂÃ£ÂÂÃ£ÂÂ®Ã¦ÂÂ¹Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂ¡Ã£ÂÂ</button>`;
    _authHintEl.insertAdjacentElement("afterend", p);
  }
  const resetLink = document.querySelector("#auth-reset-link");

  if (mode === "login") {
    _authSubmitEl.textContent = "Ã£ÂÂ­Ã£ÂÂ°Ã£ÂÂ¤Ã£ÂÂ³";
    _authTabBtns.forEach(b => b.classList.toggle("is-active", b.dataset.authTab === "login"));
    _authHintEl.innerHTML = `Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂ¦Ã£ÂÂ³Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¦ÂÂÃ£ÂÂ¡Ã£ÂÂ§Ã£ÂÂªÃ£ÂÂÃ£ÂÂ§Ã£ÂÂÃ£ÂÂÃ¯Â¼Â <button type="button" class="auth-switch" id="auth-switch-btn">Ã¦ÂÂ°Ã¨Â¦ÂÃ§ÂÂ»Ã©ÂÂ²Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂ¡Ã£ÂÂ</button>`;
    resetLink.hidden = false;
  } else if (mode === "signup") {
    _authSubmitEl.textContent = "Ã¦ÂÂ°Ã¨Â¦ÂÃ§ÂÂ»Ã©ÂÂ²";
    _authTabBtns.forEach(b => b.classList.toggle("is-active", b.dataset.authTab === "signup"));
    _authHintEl.innerHTML = `Ã£ÂÂÃ£ÂÂ§Ã£ÂÂ«Ã£ÂÂ¢Ã£ÂÂ«Ã£ÂÂ¦Ã£ÂÂ³Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ¦ÂÂÃ£ÂÂ¡Ã£ÂÂ®Ã¦ÂÂ¹Ã£ÂÂ¯ <button type="button" class="auth-switch" id="auth-switch-btn">Ã£ÂÂ­Ã£ÂÂ°Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂ¯Ã£ÂÂÃ£ÂÂ¡Ã£ÂÂ</button>`;
    resetLink.hidden = true;
  } else if (mode === "reset") {
    _authSubmitEl.textContent = "Ã£ÂÂªÃ£ÂÂ»Ã£ÂÂÃ£ÂÂÃ£ÂÂ¡Ã£ÂÂ¼Ã£ÂÂ«Ã£ÂÂÃ©ÂÂÃ£ÂÂ";
    _authTabBtns.forEach(b => b.classList.remove("is-active"));
    _authHintEl.innerHTML = `<button type="button" class="auth-switch" id="auth-switch-btn">Ã¢ÂÂ Ã£ÂÂ­Ã£ÂÂ°Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂ«Ã¦ÂÂ»Ã£ÂÂ</button>`;
    resetLink.hidden = true;
  }
  _rebindSwitchBtn();
}

// Ã£ÂÂ¿Ã£ÂÂÃ£ÂÂÃ£ÂÂ¿Ã£ÂÂ³Ã£ÂÂ®Ã£ÂÂ¤Ã£ÂÂÃ£ÂÂ³Ã£ÂÂ
_authTabBtns.forEach(btn => {
  btn.addEventListener("click", () => _switchAuthMode(btn.dataset.authTab));
});

// Ã£ÂÂÃ£ÂÂ©Ã£ÂÂ¼Ã£ÂÂ Ã©ÂÂÃ¤Â¿Â¡
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
      // Credential Management API: ChromeÃ£ÂÂ«Ã£ÂÂÃ£ÂÂ¹Ã£ÂÂ¯Ã£ÂÂ¼Ã£ÂÂÃ¤Â¿ÂÃ¥Â­ÂÃ£ÂÂÃ¤Â¿ÂÃ£ÂÂ
      if (window.PasswordCredential) {
        try {
          const cred = new PasswordCredential({ id: email, password });
          await navigator.credentials.store(cred);
        } catch (_) {}
      }
    } else if (_authMode === "signup") {
      const { error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      _authShowError("Ã§Â¢ÂºÃ¨ÂªÂÃ£ÂÂ¡Ã£ÂÂ¼Ã£ÂÂ«Ã£ÂÂÃ©ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂ¡Ã£ÂÂ¼Ã£ÂÂ«Ã£ÂÂÃ£ÂÂÃ§Â¢ÂºÃ¨ÂªÂÃ£ÂÂ®Ã£ÂÂÃ£ÂÂÃ£ÂÂ­Ã£ÂÂ°Ã£ÂÂ¤Ã£ÂÂ³Ã£ÂÂÃ£ÂÂ¦Ã£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
      return;
    } else if (_authMode === "reset") {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      _authShowError("Ã£ÂÂÃ£ÂÂ¹Ã£ÂÂ¯Ã£ÂÂ¼Ã£ÂÂÃ£ÂÂªÃ£ÂÂ»Ã£ÂÂÃ£ÂÂÃ£ÂÂ¡Ã£ÂÂ¼Ã£ÂÂ«Ã£ÂÂÃ©ÂÂÃ¤Â¿Â¡Ã£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
      return;
    }
  } catch (err) {
    _authShowError(err.message || "Ã£ÂÂ¨Ã£ÂÂ©Ã£ÂÂ¼Ã£ÂÂÃ§ÂÂºÃ§ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ");
  } finally {
    _authSetLoading(false);
  }
});

// Ã¢ÂÂÃ¢ÂÂ Auth state Ã£ÂÂ®Ã§ÂÂ£Ã¨Â¦Â Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    if (!_appInitialized) {
      await loadStateFromSupabase(session.user.id);
      _authOverlay.hidden = true;
      window.scrollTo(0, 0);
      _appInitialized = true;
      init();
    } else if (event === "SIGNED_IN") {
      await loadStateFromSupabase(session.user.id);
      _authOverlay.hidden = true;
      window.scrollTo(0, 0);
      render();
    }
  } else {
    _appInitialized = false;
    _authOverlay.removeAttribute("hidden");
  }
});

// Ã¢ÂÂÃ¢ÂÂ Ã£ÂÂ­Ã£ÂÂ°Ã£ÂÂ¢Ã£ÂÂ¦Ã£ÂÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

async function signOut() {
  clearTimeout(_syncTimer);
  await sb.auth.signOut();
  localStorage.removeItem(CURRENT_STORAGE_KEY);
  state = buildSeedState();
}












































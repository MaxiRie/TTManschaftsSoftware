const seed = {
  players: [
    { id: "p1", name: "Lukas Meyer", qttr: 1684, status: "aktiv", teamId: "t1" },
    { id: "p2", name: "Jonas Krüger", qttr: 1621, status: "aktiv", teamId: "t1" },
    { id: "p3", name: "Nina Hartmann", qttr: 1598, status: "aktiv", teamId: "t1" },
    { id: "p4", name: "Ben Schneider", qttr: 1510, status: "Ersatz", teamId: "t2" },
    { id: "p5", name: "Marie Vogt", qttr: 1487, status: "aktiv", teamId: "t2" },
    { id: "p6", name: "Tom Becker", qttr: 1422, status: "aktiv", teamId: "t2" },
    { id: "p7", name: "Sven Hoffmann", qttr: 1366, status: "aktiv", teamId: "t3" },
    { id: "p8", name: "Clara Neumann", qttr: 1328, status: "Jugend", teamId: "t3" },
    { id: "p9", name: "Guido Walter", qttr: 1544, status: "aktiv", teamId: "t1" },
    { id: "p10", name: "Marcel Klein", qttr: 1398, status: "aktiv", teamId: "t2" },
    { id: "p11", name: "Dirk Lange", qttr: 1304, status: "aktiv", teamId: "t3" },
    { id: "p12", name: "Robert Koch", qttr: 1271, status: "Ersatz", teamId: "t3" }
  ],
  teams: [
    { id: "t1", name: "1. Herren", league: "Bezirksliga", targetSize: 6, playerOrder: ["p1", "p2", "p3", "p9"] },
    { id: "t2", name: "2. Herren", league: "Kreisliga", targetSize: 6, playerOrder: ["p4", "p5", "p6", "p10"] },
    { id: "t3", name: "3. Herren", league: "2. Kreisklasse", targetSize: 4, playerOrder: ["p7", "p8", "p11", "p12"] }
  ],
  fixtures: [
    {
      id: "f1",
      teamId: "t1",
      opponent: "TSV Nordstadt",
      venue: "Heim",
      status: "offen",
      preferredDates: ["2026-09-18", "2026-09-20", "2026-09-25"]
    },
    {
      id: "f2",
      teamId: "t2",
      opponent: "SC West",
      venue: "Auswaerts",
      status: "geplant",
      preferredDates: ["2026-09-19", "2026-09-26"]
    },
    {
      id: "f3",
      teamId: "t3",
      opponent: "SV Grün-Weiß",
      venue: "Heim",
      status: "bestaetigt",
      preferredDates: ["2026-10-02"]
    }
  ],
  blocks: [
    { id: "b1", playerId: "p1", date: "2026-09-18", reason: "Urlaub" },
    { id: "b2", playerId: "p3", date: "2026-09-20", reason: "Dienst" },
    { id: "b3", playerId: "p4", date: "2026-09-26", reason: "Privat" },
    { id: "b4", playerId: "p6", date: "2026-10-02", reason: "Turnier" }
  ],
  calendarAvailability: {},
  calendarSubstitutes: {},
  dismissedSpv: {},
  dismissedSeasonChecks: {},
  dismissedAssistantSteps: {},
  dismissedPlanningTasks: {},
  activityLog: [],
  ui: {
    seasonAssistantMinimized: false,
    calendarColumns: { substitute: true, break: true, fixture: true, hints: true }
  },
  settings: {
    season: { label: "Rückrunde 25/26", start: "2026-01-10", end: "2026-04-19" },
    requiredPlayers: 4,
    excludeHolidays: true,
    excludeSchoolBreaks: false,
    hallSlots: [
      { id: "h1", weekday: 1, hall: "Bredingsfeld", court: "2", time: "19:30" },
      { id: "h2", weekday: 2, hall: "Havelse", court: "1", time: "19:30" },
      { id: "h3", weekday: 5, hall: "Havelse", court: "1", time: "19:30" },
      { id: "h4", weekday: 5, hall: "Robert Koch", court: "3", time: "19:30" },
      { id: "h5", weekday: 6, hall: "Robert Koch", court: "3", time: "19:30" }
    ]
  }
};

const storageKey = "tt-spartenplaner-v1";
const portableApiEnabled = location.protocol === "http:" && (location.hostname === "127.0.0.1" || location.hostname === "localhost");
const requiredPlayers = 4;
const ttvnInternalTolerance = 35;
const ttvnOverallTolerance = 50;
const ttvnLeagues = [
  "Niedersachsenliga",
  "Landesliga",
  "Bezirksoberliga",
  "Bezirksliga",
  "1. Bezirksklasse",
  "2. Bezirksklasse",
  "Kreisliga",
  "1. Kreisklasse",
  "2. Kreisklasse",
  "3. Kreisklasse",
  "4. Kreisklasse",
  "5. Kreisklasse"
];
const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const awaySlots = [
  { weekday: 1, label: "Montag" },
  { weekday: 2, label: "Dienstag" },
  { weekday: 3, label: "Mittwoch" },
  { weekday: 4, label: "Donnerstag" },
  { weekday: 5, label: "Freitag" },
  { weekday: 6, label: "Samstag" },
  { weekday: 0, label: "Sonntag" }
];
const lowerSaxonySchoolBreaks = [
  { name: "Halbjahresferien", start: "2025-02-03", end: "2025-02-04" },
  { name: "Osterferien", start: "2025-04-07", end: "2025-04-19" },
  { name: "Kirchentag", start: "2025-04-30", end: "2025-04-30" },
  { name: "Tag nach dem 1. Mai", start: "2025-05-02", end: "2025-05-02" },
  { name: "Tag nach Himmelfahrt", start: "2025-05-30", end: "2025-05-30" },
  { name: "Pfingstferien", start: "2025-06-10", end: "2025-06-10" },
  { name: "Sommerferien", start: "2025-07-03", end: "2025-08-13" },
  { name: "Herbstferien", start: "2025-10-13", end: "2025-10-25" },
  { name: "Weihnachtsferien", start: "2025-12-22", end: "2026-01-05" },
  { name: "Halbjahresferien", start: "2026-02-02", end: "2026-02-03" },
  { name: "Osterferien", start: "2026-03-23", end: "2026-04-07" },
  { name: "Tag nach Himmelfahrt", start: "2026-05-15", end: "2026-05-15" },
  { name: "Pfingstferien", start: "2026-05-26", end: "2026-05-26" },
  { name: "Sommerferien", start: "2026-07-02", end: "2026-08-12" },
  { name: "Herbstferien", start: "2026-10-12", end: "2026-10-24" },
  { name: "Weihnachtsferien", start: "2026-12-23", end: "2027-01-09" }
];
let state = loadState();
let editingPlayerId = null;
let editingTeamId = null;
let editingFixtureId = null;
let editingBlockId = null;
let pendingPlayerImport = [];
let pendingFixtureImport = [];
let selectedPlayerIds = new Set();
let portableSaveQueue = Promise.resolve();

const views = {
  dashboard: "Übersicht",
  players: "Spieler",
  "season-planning": "Saisonplanung",
  teams: "Mannschaften",
  calendar: "Kalender",
  fixtures: "Punktspiele",
  blocks: "Sperrtermine",
  settings: "Einstellungen"
};

const $ = (selector) => document.querySelector(selector);

function showToast(message, type = "ok") {
  const region = $("#toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => toast.classList.add("is-visible"), 20);
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3200);
}

function emptyState(title, text, actionLabel, action) {
  const button = actionLabel && action ? `<button class="small-button empty-action" data-empty-action="${action}" type="button">${actionLabel}</button>` : "";
  return `<div class="empty-state">
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(text)}</span>
    ${button}
  </div>`;
}

function settingBoolean(value, fallback) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function loadState() {
  const stored = portableApiEnabled ? loadPortableState() : localStorage.getItem(storageKey);
  const parsed = stored ? JSON.parse(stored) : structuredClone(seed);
  parsed.fixtures = parsed.fixtures.map((fixture) => {
    const mergedFixture = { availability: {}, confirmedDate: "", lineup: [], hall: "", awayHallNumber: "", startTime: "", ...fixture };
    const normalizedDates = normalizeFixtureDates(mergedFixture.preferredDates || [], mergedFixture.confirmedDate, mergedFixture.status);
    return { ...mergedFixture, ...normalizedDates };
  });
  parsed.calendarAvailability = parsed.calendarAvailability || {};
  parsed.calendarSubstitutes = parsed.calendarSubstitutes || {};
  parsed.dismissedSpv = parsed.dismissedSpv || {};
  parsed.dismissedSeasonChecks = parsed.dismissedSeasonChecks || {};
  parsed.dismissedAssistantSteps = parsed.dismissedAssistantSteps || {};
  parsed.dismissedPlanningTasks = parsed.dismissedPlanningTasks || {};
  parsed.activityLog = Array.isArray(parsed.activityLog) ? parsed.activityLog.slice(0, 20) : [];
  parsed.ui = {
    seasonAssistantMinimized: false,
    calendarColumns: { substitute: true, break: true, fixture: true, hints: true },
    ...(parsed.ui || {}),
    calendarColumns: { substitute: true, break: true, fixture: true, hints: true, ...(parsed.ui?.calendarColumns || {}) }
  };
  parsed.settings = {
    ...structuredClone(seed.settings),
    ...(parsed.settings || {}),
    season: { ...seed.settings.season, ...(parsed.settings?.season || {}) },
    excludeHolidays: settingBoolean(parsed.settings?.excludeHolidays, seed.settings.excludeHolidays),
    excludeSchoolBreaks: settingBoolean(parsed.settings?.excludeSchoolBreaks, seed.settings.excludeSchoolBreaks),
    hallSlots: parsed.settings?.hallSlots?.length ? parsed.settings.hallSlots : structuredClone(seed.settings.hallSlots)
  };
  parsed.teams = parsed.teams.map((team) => ({ ...team, league: team.league === "Bezirksklasse" ? "1. Bezirksklasse" : team.league }));
  parsed.teams = parsed.teams.map((team) => ({ ...team, playerOrder: team.playerOrder || [] }));
  parsed.players = parsed.players.map((player) => ({ manualSpv: false, seasonNote: "", qttrDate: "", preferWithIds: [], avoidWithIds: [], ...player }));
  normalizeStoredPlayerRelationships(parsed.players);
  return parsed;
}

function normalizeStoredPlayerRelationships(players) {
  const validIds = new Set(players.map((player) => player.id));
  players.forEach((player) => {
    player.preferWithIds = [...new Set((player.preferWithIds || []).filter((id) => validIds.has(id) && id !== player.id))];
    player.avoidWithIds = [...new Set((player.avoidWithIds || []).filter((id) => validIds.has(id) && id !== player.id))];
  });

  players.forEach((player) => {
    player.preferWithIds.forEach((partnerId) => {
      const partner = players.find((item) => item.id === partnerId);
      if (partner && !partner.preferWithIds.includes(player.id)) partner.preferWithIds.push(player.id);
    });
    player.avoidWithIds.forEach((partnerId) => {
      const partner = players.find((item) => item.id === partnerId);
      if (partner && !partner.avoidWithIds.includes(player.id)) partner.avoidWithIds.push(player.id);
    });
  });

  players.forEach((player) => {
    const preferSet = new Set(player.preferWithIds || []);
    player.avoidWithIds = (player.avoidWithIds || []).filter((id) => !preferSet.has(id));
  });
}

function saveState() {
  const serialized = serializeState(state);
  if (portableApiEnabled) {
    savePortableState(serialized);
    return;
  }
  localStorage.setItem(storageKey, serialized);
}

function serializeState(value) {
  return JSON.stringify(value).replace(/[^\x00-\x7F]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

function loadPortableState() {
  if (!portableApiEnabled) return "";
  try {
    const request = new XMLHttpRequest();
    request.open("GET", "/api/state", false);
    request.send();
    if (request.status === 200 && request.responseText.trim()) return request.responseText;
  } catch (error) {
    console.warn("USB-Speicher konnte nicht gelesen werden.", error);
  }
  return "";
}

function savePortableState(serialized) {
  if (!portableApiEnabled) return false;
  portableSaveQueue = portableSaveQueue
    .catch(() => {})
    .then(() =>
      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: serialized,
        cache: "no-store"
      })
    )
    .then((response) => {
      if (!response.ok) throw new Error(`USB-Speicher meldet ${response.status}`);
    })
    .catch((error) => {
      console.warn("USB-Speicher konnte nicht geschrieben werden.", error);
      showToast("USB-Speicher konnte nicht geschrieben werden.", "warn");
    });
  return true;
}

function addActivity(type, text, detail = "") {
  state.activityLog = [
    { id: `a${Date.now()}${Math.random().toString(16).slice(2)}`, type, text, detail, timestamp: new Date().toISOString() },
    ...(state.activityLog || [])
  ].slice(0, 20);
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if ((char === "," || char === ";") && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(value) {
  return String(value || "").toLowerCase().replaceAll("-", "").replaceAll("_", "").replaceAll(" ", "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function teamName(id) {
  return state.teams.find((team) => team.id === id)?.name ?? "Ohne Mannschaft";
}

function playerName(id) {
  return state.players.find((player) => player.id === id)?.name ?? "Unbekannt";
}

function venueLabel(value) {
  if (value === "Auswaerts") return "Auswärts";
  return value || "";
}

function fixtureStatusLabel(value) {
  if (value === "bestaetigt") return "bestätigt";
  return value || "";
}

function normalizeFixtureVenue(value, fallback = "Heim") {
  const text = String(value || "").trim().toLowerCase();
  if (["auswaerts", "auswärts", "auswart", "a"].includes(text)) return "Auswaerts";
  if (["heim", "h"].includes(text)) return "Heim";
  return value || fallback;
}

function normalizeFixtureStatus(value, fallback = "offen") {
  const text = String(value || "").trim().toLowerCase();
  if (["bestaetigt", "bestätigt"].includes(text)) return "bestaetigt";
  if (["offen", "geplant"].includes(text)) return text;
  return value || fallback;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  return toIsoDate(parseIsoDate(value)) === value;
}

function parseIsoDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateRange(start, end) {
  const dates = [];
  const cursor = parseIsoDate(start);
  const last = parseIsoDate(end);
  while (cursor <= last) {
    dates.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function inclusiveDateRange(start, end) {
  if (!start) return [];
  const normalizedEnd = end || start;
  const from = start <= normalizedEnd ? start : normalizedEnd;
  const to = start <= normalizedEnd ? normalizedEnd : start;
  return dateRange(from, to);
}

function offsetIsoDate(value, days) {
  const date = parseIsoDate(value);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toIsoDate(new Date(year, month - 1, day));
}

function lowerSaxonyHolidays(year) {
  const easter = easterSunday(year);
  return [
    { date: `${year}-01-01`, name: "Neujahr" },
    { date: offsetIsoDate(easter, -2), name: "Karfreitag" },
    { date: offsetIsoDate(easter, 1), name: "Ostermontag" },
    { date: `${year}-05-01`, name: "Tag der Arbeit" },
    { date: offsetIsoDate(easter, 39), name: "Himmelfahrt" },
    { date: offsetIsoDate(easter, 50), name: "Pfingstmontag" },
    { date: `${year}-10-03`, name: "Tag der Deutschen Einheit" },
    { date: `${year}-10-31`, name: "Reformationstag" },
    { date: `${year}-12-25`, name: "1. Weihnachtstag" },
    { date: `${year}-12-26`, name: "2. Weihnachtstag" }
  ];
}

function schoolBreakName(date) {
  return lowerSaxonySchoolBreaks.find((item) => date >= item.start && date <= item.end)?.name || "";
}

function holidayName(date) {
  const year = Number(date.slice(0, 4));
  return lowerSaxonyHolidays(year).find((item) => item.date === date)?.name || "";
}

function schoolBreakInfo(date) {
  const schoolBreak = schoolBreakName(date);
  const holiday = holidayName(date);
  return [
    schoolBreak ? `Ferien: ${schoolBreak}` : "",
    holiday ? `Feiertag: ${holiday}` : ""
  ].filter(Boolean).join(", ");
}

function isDateExcludedByCalendarRules(date) {
  return Boolean((state.settings.excludeSchoolBreaks && schoolBreakName(date)) || (state.settings.excludeHolidays && holidayName(date)));
}

function isoWeek(value) {
  const date = parseIsoDate(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function blockCountForPlayer(playerId) {
  return state.blocks.filter((block) => block.playerId === playerId).length;
}

function blockedPlayersForDate(teamId, date) {
  const teamPlayerIds = state.players.filter((player) => player.teamId === teamId).map((player) => player.id);
  return state.blocks.filter((block) => block.date === date && teamPlayerIds.includes(block.playerId));
}

function calendarValue(teamId, date, playerId) {
  const player = state.players.find((item) => item.id === playerId);
  if (player?.status === "passiv") return "no";
  const stored = state.calendarAvailability?.[teamId]?.[date]?.[playerId];
  if (stored) return stored;
  return state.blocks.some((block) => block.playerId === playerId && block.date === date) ? "no" : "yes";
}

function setCalendarValue(teamId, date, playerId, value) {
  state.calendarAvailability[teamId] = state.calendarAvailability[teamId] || {};
  state.calendarAvailability[teamId][date] = state.calendarAvailability[teamId][date] || {};
  state.calendarAvailability[teamId][date][playerId] = value;

  const existingBlockIndex = state.blocks.findIndex((block) => block.playerId === playerId && block.date === date);
  if (value === "no" && existingBlockIndex === -1) {
    state.blocks.push({ id: `b${Date.now()}`, playerId, date, reason: "Sperrtermin" });
  }
  if (value === "yes" && existingBlockIndex !== -1) {
    state.blocks.splice(existingBlockIndex, 1);
  }

  saveState();
  render();
}

function calendarSubstituteValue(teamId, date) {
  return state.calendarSubstitutes?.[teamId]?.[date] || "";
}

function calendarSubstituteCount(teamId, date) {
  return calendarSubstituteValue(teamId, date)
    .split(/[,;\n]+/)
    .map((name) => name.trim())
    .filter(Boolean).length;
}

function setCalendarSubstitute(teamId, date, value) {
  state.calendarSubstitutes[teamId] = state.calendarSubstitutes[teamId] || {};
  const cleanValue = value.trim();
  if (cleanValue) {
    state.calendarSubstitutes[teamId][date] = cleanValue;
  } else {
    delete state.calendarSubstitutes[teamId][date];
  }
  saveState();
}

function calendarRowState(teamId, date) {
  const players = calendarPlayers(teamId);
  const available = players.filter((player) => calendarValue(teamId, date, player.id) === "yes").length + calendarSubstituteCount(teamId, date);
  const required = neededPlayers();
  const missing = Math.max(0, required - available);
  const className = available >= required ? "calendar-green" : available === required - 1 ? "calendar-yellow" : "calendar-red";
  return { available, missing, className };
}

function calendarAvailabilityTooltip(teamId, date) {
  const players = calendarPlayers(teamId);
  const available = players.filter((player) => calendarValue(teamId, date, player.id) === "yes").map((player) => player.name);
  const missing = players.filter((player) => calendarValue(teamId, date, player.id) !== "yes").map((player) => player.name);
  const substitutes = calendarSubstituteValue(teamId, date)
    .split(/[,;\n]+/)
    .map((name) => name.trim())
    .filter(Boolean);
  return [
    `Verfügbar: ${available.length ? available.join(", ") : "-"}`,
    `Fehlt: ${missing.length ? missing.join(", ") : "-"}`,
    `Ersatz: ${substitutes.length ? substitutes.join(", ") : "-"}`
  ].join("\n");
}

function optionScore(fixture, date) {
  const blocked = blockedPlayersForDate(fixture.teamId, date).length;
  const teamSize = state.players.filter((player) => player.teamId === fixture.teamId).length;
  if (blocked === 0) return { label: "passt", className: "ok" };
  if (blocked < Math.max(2, Math.ceil(teamSize / 3))) return { label: `${blocked} Konflikt`, className: "warn" };
  return { label: `${blocked} Konflikte`, className: "danger" };
}

function teamPlayers(teamId) {
  const team = state.teams.find((item) => item.id === teamId);
  const players = state.players.filter((player) => player.teamId === teamId);
  const orderedIds = team?.playerOrder || [];
  return players.sort((a, b) => {
    const aIndex = orderedIds.indexOf(a.id);
    const bIndex = orderedIds.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return b.qttr - a.qttr;
  });
}

function teamSortNumber(team) {
  const match = team.name.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function orderedTeams() {
  return state.teams
    .map((team, index) => ({ team, index }))
    .sort((a, b) => {
      const numberDiff = teamSortNumber(a.team) - teamSortNumber(b.team);
      if (numberDiff !== 0) return numberDiff;
      const nameDiff = a.team.name.localeCompare(b.team.name, "de", { numeric: true, sensitivity: "base" });
      if (nameDiff !== 0) return nameDiff;
      return a.index - b.index;
    })
    .map((item) => item.team);
}

function spvInfo(teamId, playerId) {
  const teams = orderedTeams();
  const teamIndex = teams.findIndex((team) => team.id === teamId);
  if (teamIndex <= 0) return null;

  const previousTeam = teams[teamIndex - 1];
  const previousPlayers = teamPlayers(previousTeam.id);
  const currentPlayer = state.players.find((player) => player.id === playerId);
  const previousLast = previousPlayers[previousPlayers.length - 1];
  if (!currentPlayer || !previousLast) return null;

  const difference = currentPlayer.qttr - previousLast.qttr;
  if (difference <= ttvnOverallTolerance) return null;

  return { difference, previousTeam, previousLast };
}

function spvKey(teamId, playerId, info = null) {
  const currentInfo = info || spvInfo(teamId, playerId);
  if (!currentInfo) return `${teamId}:${playerId}`;
  return `${teamId}:${playerId}:${currentInfo.previousTeam.id}:${currentInfo.previousLast.id}:${currentInfo.difference}`;
}

function hasActiveSpv(teamId, playerId) {
  const player = state.players.find((item) => item.id === playerId);
  if (player?.manualSpv) return true;
  const info = spvInfo(teamId, playerId);
  return Boolean(info) && !state.dismissedSpv?.[spvKey(teamId, playerId, info)];
}

function dismissSpv(teamId, playerId) {
  const player = state.players.find((item) => item.id === playerId);
  const wasManualSpv = Boolean(player?.manualSpv);
  if (wasManualSpv) {
    player.manualSpv = false;
    addActivity("SPV", `${player.name} SPV entfernt`, teamName(teamId));
    showToast("Manueller SPV wurde entfernt.", "warn");
  }
  state.dismissedSpv[spvKey(teamId, playerId)] = true;
  if (!wasManualSpv) addActivity("SPV", `${playerName(playerId)} SPV ausgeblendet`, teamName(teamId));
  saveState();
  render();
}

function syncTeamOrder(teamId) {
  const team = state.teams.find((item) => item.id === teamId);
  if (!team) return;
  const currentIds = state.players.filter((player) => player.teamId === teamId).map((player) => player.id);
  const ordered = (team.playerOrder || []).filter((playerId) => currentIds.includes(playerId));
  const missing = currentIds.filter((playerId) => !ordered.includes(playerId)).sort((a, b) => playerName(a).localeCompare(playerName(b), "de"));
  team.playerOrder = [...ordered, ...missing];
}

function fixtureAvailabilitySummary(fixture) {
  const players = teamPlayers(fixture.teamId);
  const yes = players.filter((player) => fixture.availability?.[player.id] === "yes").length;
  const maybe = players.filter((player) => fixture.availability?.[player.id] === "maybe").length;
  const no = players.filter((player) => fixture.availability?.[player.id] === "no").length;
  const open = Math.max(0, players.length - yes - maybe - no);
  const className = yes >= 4 ? "ok" : yes + maybe >= 4 ? "warn" : "danger";
  return { yes, maybe, no, open, className };
}

function fixturePlanningDate(fixture) {
  return fixture.confirmedDate || fixture.preferredDates[0] || "";
}

function compareFixturesChronologically(a, b) {
  const aDate = fixturePlanningDate(a);
  const bDate = fixturePlanningDate(b);
  if (aDate && bDate && aDate !== bDate) return aDate.localeCompare(bDate);
  if (aDate && !bDate) return -1;
  if (!aDate && bDate) return 1;
  const teamCompare = teamName(a.teamId).localeCompare(teamName(b.teamId), "de", { numeric: true });
  if (teamCompare) return teamCompare;
  return a.opponent.localeCompare(b.opponent, "de", { numeric: true });
}

function fixtureDates(fixture) {
  return [...new Set([fixture.confirmedDate, ...(fixture.preferredDates || [])].filter(Boolean))];
}

function normalizeFixtureDates(preferredDates, confirmedDate, status) {
  const dates = [...new Set((preferredDates || []).map((date) => date.trim()).filter(Boolean))];
  let nextConfirmedDate = status === "bestaetigt" ? confirmedDate || "" : "";
  if (status === "bestaetigt" && !nextConfirmedDate && dates.length) {
    nextConfirmedDate = dates[0];
  }
  if (nextConfirmedDate && !dates.includes(nextConfirmedDate)) {
    nextConfirmedDate = dates[0] || "";
  }
  return { preferredDates: dates, confirmedDate: nextConfirmedDate };
}

function teamHasFixtureOnDate(teamId, date) {
  return state.fixtures.some((fixture) => fixture.teamId === teamId && fixtureDates(fixture).includes(date));
}

function teamHasOtherFixtureOnDate(teamId, date, ignoredFixtureId = "") {
  return state.fixtures.some((fixture) => fixture.id !== ignoredFixtureId && fixture.teamId === teamId && fixtureDates(fixture).includes(date));
}

function isPlayerAvailableForFixture(player, fixture) {
  const date = fixturePlanningDate(fixture);
  if (!date) return true;
  if (player.status === "passiv") return false;
  if (fixture.availability?.[player.id] === "no") return false;
  if (state.blocks.some((block) => block.playerId === player.id && block.date === date)) return false;
  return true;
}

function lineupPlayerConflicts(player, fixture) {
  const date = fixturePlanningDate(fixture);
  const conflicts = [];
  if (!date) return conflicts;

  const hasBlock = state.blocks.some((block) => block.playerId === player.id && block.date === date);
  const calendarStatus = state.calendarAvailability?.[fixture.teamId]?.[date]?.[player.id];
  const otherFixture = state.fixtures.find((item) =>
    item.id !== fixture.id &&
    fixturePlanningDate(item) === date &&
    selectedLineupIds(item).includes(player.id)
  );

  if (player.status === "passiv") conflicts.push({ label: "passiv", severity: "danger" });
  if (hasBlock) conflicts.push({ label: "Sperrtermin", severity: "danger" });
  if (calendarStatus === "no" && !hasBlock) conflicts.push({ label: "fehlt laut Kalender", severity: "danger" });
  if (fixture.availability?.[player.id] === "no") conflicts.push({ label: "Absage", severity: "danger" });
  if (otherFixture) conflicts.push({ label: `spielt schon: ${teamName(otherFixture.teamId)}`, severity: "danger" });
  if (player.status === "Ersatz" || player.status === "RES") conflicts.push({ label: "Ersatzspieler", severity: "warn" });

  return conflicts;
}

function lineupConflictSummary(fixture) {
  const selectedPlayers = lineupPlayers(fixture);
  const warnings = selectedPlayers.flatMap((player) =>
    lineupPlayerConflicts(player, fixture)
      .filter((conflict) => conflict.severity === "danger")
      .map((conflict) => `${player.name}: ${conflict.label}`)
  );
  const selectedCount = selectedPlayers.length;
  if (selectedCount < requiredPlayers) warnings.unshift(`Nur ${selectedCount}/${requiredPlayers} Spieler ausgewählt.`);
  return warnings;
}

function suggestedLineup(fixture) {
  return teamPlayers(fixture.teamId).filter((player) => isPlayerAvailableForFixture(player, fixture)).slice(0, requiredPlayers);
}

function selectedLineupIds(fixture) {
  return fixture.lineup?.length ? fixture.lineup : suggestedLineup(fixture).map((player) => player.id);
}

function lineupPlayers(fixture) {
  const selectedIds = selectedLineupIds(fixture);
  return selectedIds.map((playerId) => state.players.find((player) => player.id === playerId)).filter(Boolean);
}

function lineupShareText(fixture) {
  const date = fixturePlanningDate(fixture);
  const players = lineupPlayers(fixture);
  const lines = [
    `${teamName(fixture.teamId)} gegen ${fixture.opponent}`,
    `${venueLabel(fixture.venue)}${date ? ` am ${formatShortDate(date)}` : ""}`,
    fixture.hall ? `Halle: ${fixture.hall}` : "",
    fixture.startTime ? `Beginn: ${fixture.startTime} Uhr` : "",
    `Status: ${fixtureStatusLabel(fixture.status)}`,
    "",
    "Aufstellung:",
    ...players.map((player, index) => `${index + 1}. ${player.name} (${player.qttr})`)
  ].filter((line) => line !== "");

  if (players.length < requiredPlayers) {
    lines.push("", `Warnung: Nur ${players.length}/${requiredPlayers} Spieler ausgewählt.`);
  }

  return lines.join("\n");
}

function availabilityForTeam(availability, teamId) {
  const allowedPlayerIds = new Set(teamPlayers(teamId).map((player) => player.id));
  return Object.fromEntries(Object.entries(availability || {}).filter(([playerId]) => allowedPlayerIds.has(playerId)));
}

function relationshipWarningsForTeam(teamId, selectedIds = null) {
  const playerIds = selectedIds || state.players.filter((player) => player.teamId === teamId).map((player) => player.id);
  const selected = new Set(playerIds);
  const warnings = [];

  playerIds.forEach((playerId) => {
    const player = state.players.find((item) => item.id === playerId);
    if (!player) return;

    (player.preferWithIds || []).forEach((partnerId) => {
      const partner = state.players.find((item) => item.id === partnerId);
      if (!partner) return;
      if (!selected.has(partnerId)) {
        warnings.push(`${player.name} möchte mit ${partner.name} in einer Mannschaft spielen.`);
      }
    });

    (player.avoidWithIds || []).forEach((partnerId) => {
      if (playerId > partnerId) return;
      const partner = state.players.find((item) => item.id === partnerId);
      if (!partner) return;
      if (selected.has(partnerId)) {
        warnings.push(`${player.name} und ${partner.name} sollen nicht in derselben Mannschaft spielen.`);
      }
    });
  });

  return warnings;
}

function allRelationshipWarnings() {
  return state.teams.flatMap((team) => relationshipWarningsForTeam(team.id).map((warning) => `${team.name}: ${warning}`));
}

function ttvnTeamCheck(teamId, selectedIds = null) {
  const playerIds = selectedIds || state.players.filter((player) => player.teamId === teamId).map((player) => player.id);
  const team = state.teams.find((item) => item.id === teamId);
  const teamOrder = team?.playerOrder || [];
  const players = state.players
    .filter((player) => playerIds.includes(player.id))
    .sort((a, b) => {
      const aIndex = teamOrder.indexOf(a.id);
      const bIndex = teamOrder.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return b.qttr - a.qttr;
    });
  const warnings = [];

  for (let upperIndex = 0; upperIndex < players.length; upperIndex += 1) {
    for (let lowerIndex = upperIndex + 1; lowerIndex < players.length; lowerIndex += 1) {
      const upper = players[upperIndex];
      const lower = players[lowerIndex];
      if (upper.manualSpv || lower.manualSpv) continue;
      if (lower.qttr - upper.qttr > ttvnInternalTolerance) {
        warnings.push(`${lower.name} (${lower.qttr}) steht unter ${upper.name} (${upper.qttr}) trotz ${lower.qttr - upper.qttr} Punkten Differenz.`);
      }
    }
  }

  if (players.length < requiredPlayers) {
    warnings.push(`Nur ${players.length}/${requiredPlayers} Mindestspieler eingeteilt.`);
  }

  warnings.push(...relationshipWarningsForTeam(teamId, playerIds));

  return { players, warnings };
}

function ttvnOverallCheck() {
  const teams = orderedTeams();
  const assigned = teams.flatMap((team, teamIndex) =>
    teamPlayers(team.id).map((player) => ({ ...player, teamIndex, teamName: team.name }))
  );
  const warnings = [];

  assigned.forEach((upper) => {
    assigned.forEach((lower) => {
      if (lower.teamIndex <= upper.teamIndex) return;
      if (hasActiveSpv(teams[lower.teamIndex]?.id, lower.id)) return;
      if (lower.qttr - upper.qttr > ttvnOverallTolerance) {
        warnings.push(`${lower.name} (${lower.qttr}, ${lower.teamName}) steht unter ${upper.name} (${upper.qttr}, ${upper.teamName}) trotz ${lower.qttr - upper.qttr} Punkten Differenz.`);
      }
    });
  });

  return warnings;
}

function calendarPlayers(teamId) {
  return teamPlayers(teamId);
}

function neededPlayers() {
  return state.settings?.requiredPlayers || requiredPlayers;
}

function seasonSettings() {
  return state.settings?.season || seed.settings.season;
}

function homeSlots() {
  const grouped = new Map();
  (state.settings?.hallSlots || []).forEach((slot) => {
    const current = grouped.get(Number(slot.weekday)) || [];
    current.push(`${slot.hall}${slot.court ? ` (${slot.court})` : ""}${slot.time ? ` ${slot.time}` : ""}`);
    grouped.set(Number(slot.weekday), current);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
    .map(([weekday, halls]) => ({ weekday, label: weekdays[weekday], hall: halls.join(" / ") }));
}

function hallSlotLabel(slot) {
  return `${slot.hall}${slot.court ? ` (${slot.court})` : ""}${slot.time ? ` ${slot.time}` : ""}`;
}

function availableHallOptions() {
  const seen = new Set();
  return (state.settings?.hallSlots || [])
    .map((slot) => ({ value: hallSlotLabel(slot), time: slot.time || "" }))
    .filter((option) => {
      if (seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
}

function defaultHallForDate(date) {
  const day = date ? parseIsoDate(date).getDay() : null;
  const slot = (state.settings?.hallSlots || []).find((item) => item.weekday === day) || (state.settings?.hallSlots || [])[0];
  return slot ? hallSlotLabel(slot) : "";
}

function defaultTimeForHall(hallValue) {
  const option = availableHallOptions().find((item) => item.value === hallValue);
  return option?.time || "";
}

function render() {
  renderFilters();
  renderDashboard();
  renderPlayers();
  renderSeasonPlanning();
  renderTeams();
  renderCalendar();
  renderFixtures();
  renderBlocks();
  renderSettings();
}

function renderFilters() {
  const playerTeamValue = $("#player-team-filter").value || "all";
  const fixtureTeamValue = $("#fixture-team-filter").value || "all";
  const calendarTeamValue = $("#calendar-team-filter").value || "all";
  const teamOptions = [
    `<option value="all">Alle Mannschaften</option>`,
    `<option value="">Ohne Mannschaft</option>`,
    ...state.teams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`)
  ].join("");
  const calendarOptions = [`<option value="all">Alle Mannschaften</option>`, ...state.teams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`)].join("");
  $("#player-team-filter").innerHTML = teamOptions;
  $("#player-team-filter").value = [...$("#player-team-filter").options].some((option) => option.value === playerTeamValue) ? playerTeamValue : "all";
  $("#fixture-team-filter").innerHTML = teamOptions;
  $("#fixture-team-filter").value = [...$("#fixture-team-filter").options].some((option) => option.value === fixtureTeamValue) ? fixtureTeamValue : "all";
  $("#calendar-team-filter").innerHTML = calendarOptions;
  $("#calendar-team-filter").value = [...$("#calendar-team-filter").options].some((option) => option.value === calendarTeamValue) ? calendarTeamValue : "all";
}

function renderDashboard() {
  $("#metric-players").textContent = state.players.length;
  $("#metric-teams").textContent = state.teams.length;
  $("#metric-fixtures").textContent = state.fixtures.filter((fixture) => fixture.status !== "bestaetigt").length;
  $("#metric-blocks").textContent = state.blocks.length;
  $("#fixture-count-label").textContent = `${state.fixtures.length} Spiele`;

  $("#upcoming-fixtures").innerHTML = state.fixtures
    .map((fixture) => {
      const firstDate = fixture.preferredDates[0];
      const score = optionScore(fixture, firstDate);
      return `<div class="list-row">
        <div>
          <strong>${teamName(fixture.teamId)} gegen ${fixture.opponent}</strong>
          <div class="meta">${venueLabel(fixture.venue)} - erster Vorschlag ${formatDate(firstDate)}</div>
        </div>
        <span class="badge ${score.className}">${score.label}</span>
      </div>`;
    })
    .join("");

  $("#top-players").innerHTML = [...state.players]
    .sort((a, b) => b.qttr - a.qttr)
    .slice(0, 5)
    .map((player) => `<div class="list-row"><span>${player.name}</span><strong>${player.qttr}</strong></div>`)
    .join("");

  const risks = state.fixtures.flatMap((fixture) =>
    fixture.preferredDates
      .map((date) => ({ fixture, date, blocked: blockedPlayersForDate(fixture.teamId, date) }))
      .filter((item) => item.blocked.length > 0)
  );

  $("#risk-list").innerHTML = risks.length
    ? risks
        .slice(0, 5)
        .map((risk) => `<div class="list-row">
          <div>
            <strong>${teamName(risk.fixture.teamId)}</strong>
            <div class="meta">${formatDate(risk.date)} - ${risk.blocked.map((block) => playerName(block.playerId)).join(", ")}</div>
          </div>
          <span class="badge warn">prüfen</span>
        </div>`)
        .join("")
    : `<div class="list-row"><span>Keine Konflikte in den Terminvorschlägen</span><span class="badge ok">gut</span></div>`;

  $("#activity-list").innerHTML = state.activityLog?.length
    ? state.activityLog
        .slice(0, 6)
        .map((entry) => `<div class="list-row">
          <div>
            <strong>${escapeHtml(entry.text)}</strong>
            <div class="meta">${escapeHtml(entry.detail || entry.type)} - ${formatActivityTime(entry.timestamp)}</div>
          </div>
          <span class="badge">${escapeHtml(entry.type)}</span>
        </div>`)
        .join("")
    : `<div class="list-row"><span>Noch keine Änderungen erfasst.</span><span class="badge">neu</span></div>`;
}

function formatActivityTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

function renderPlayers() {
  const query = $("#player-search").value.toLowerCase();
  const teamFilter = $("#player-team-filter").value;
  const statusFilter = $("#player-status-filter").value;
  const sortValue = $("#player-sort").value;
  const players = state.players
    .filter((player) => player.name.toLowerCase().includes(query))
    .filter((player) => teamFilter === "all" || player.teamId === teamFilter)
    .filter((player) => statusFilter === "all" || player.status === statusFilter)
    .sort((a, b) => sortPlayers(a, b, sortValue));

  selectedPlayerIds = new Set([...selectedPlayerIds].filter((playerId) => state.players.some((player) => player.id === playerId)));
  updatePlayerBulkBar(players);

  if (!players.length) {
    $("#players-table").innerHTML = `<tr><td colspan="9">${emptyState("Keine Spieler gefunden", "Ändere die Filter oder lege direkt einen neuen Spieler an.", "Spieler erstellen", "player")}</td></tr>`;
    return;
  }

  $("#players-table").innerHTML = players
    .map((player, index) => `<tr>
      <td><input class="player-select" data-player-id="${player.id}" type="checkbox" aria-label="${escapeHtml(player.name)} markieren" ${selectedPlayerIds.has(player.id) ? "checked" : ""}></td>
      <td>${index + 1}</td>
      <td><strong>${player.name}</strong></td>
      <td>${player.qttr}</td>
      <td><span class="badge">${player.status}</span>${player.manualSpv ? ` <span class="badge warn">SPV</span>` : ""}</td>
      <td>${playerNoteSummary(player)}</td>
      <td>${player.teamId ? escapeHtml(teamName(player.teamId)) : `<span class="badge warn">ohne Mannschaft</span>`}</td>
      <td>${blockCountForPlayer(player.id)}</td>
      <td><button class="small-button edit-player" data-player-id="${player.id}" type="button">Bearbeiten</button></td>
    </tr>`)
    .join("");

  $("#select-all-players").checked = players.length > 0 && players.every((player) => selectedPlayerIds.has(player.id));
  $("#select-all-players").indeterminate = players.some((player) => selectedPlayerIds.has(player.id)) && !$("#select-all-players").checked;
}

function playerNoteSummary(player) {
  const notes = [];
  if (player.seasonNote) notes.push(player.seasonNote);
  if (player.qttrDate) notes.push(`QTTR ${formatShortDate(player.qttrDate)}`);
  if (player.preferWithIds?.length) notes.push(`mit ${player.preferWithIds.map(playerName).join(", ")}`);
  if (player.avoidWithIds?.length) notes.push(`nicht mit ${player.avoidWithIds.map(playerName).join(", ")}`);
  return notes.length ? escapeHtml(notes.join(" | ")) : `<span class="meta"></span>`;
}

function updatePlayerBulkBar(visiblePlayers = []) {
  const selectedCount = selectedPlayerIds.size;
  $("#player-bulk-bar").hidden = selectedCount === 0;
  $("#player-selection-count").textContent = `${selectedCount} markiert`;
  const selectAll = $("#select-all-players");
  if (selectAll) {
    selectAll.checked = visiblePlayers.length > 0 && visiblePlayers.every((player) => selectedPlayerIds.has(player.id));
    selectAll.indeterminate = visiblePlayers.some((player) => selectedPlayerIds.has(player.id)) && !selectAll.checked;
  }
}

function sortPlayers(a, b, sortValue) {
  if (sortValue === "qttr-asc") return a.qttr - b.qttr;
  if (sortValue === "name-asc") return a.name.localeCompare(b.name, "de");
  if (sortValue === "name-desc") return b.name.localeCompare(a.name, "de");
  if (sortValue === "status-asc") return a.status.localeCompare(b.status, "de") || b.qttr - a.qttr;
  if (sortValue === "team-asc") return teamName(a.teamId).localeCompare(teamName(b.teamId), "de") || b.qttr - a.qttr;
  return b.qttr - a.qttr;
}

function duplicatePlayerNameGroups() {
  const groups = new Map();
  state.players.forEach((player) => {
    const key = player.name.trim().toLowerCase();
    if (!key) return;
    groups.set(key, [...(groups.get(key) || []), player]);
  });
  return [...groups.values()].filter((players) => players.length > 1);
}

function firstSeasonCheckTarget(action) {
  if (action === "players-missing-qttr") return state.players.find((player) => !Number(player.qttr));
  if (action === "players-duplicate-names") return duplicatePlayerNameGroups()[0]?.[0];
  if (action === "players-missing-status") return state.players.find((player) => !player.status);
  if (action === "teams-small") return state.teams.find((team) => teamPlayers(team.id).length < requiredPlayers);
  if (action === "teams-missing-league") return state.teams.find((team) => !team.league);
  if (action === "fixtures-without-date") return state.fixtures.find((fixture) => !fixturePlanningDate(fixture));
  if (action === "fixtures-missing-hall") return state.fixtures.find((fixture) => fixture.venue === "Heim" && !fixture.hall);
  if (action === "fixtures-missing-start") return state.fixtures.find((fixture) => !fixture.startTime);
  if (action === "fixture-low-availability") {
    return state.fixtures.find((fixture) => {
      const date = fixturePlanningDate(fixture);
      return date && teamPlayers(fixture.teamId).filter((player) => isPlayerAvailableForFixture(player, fixture)).length < requiredPlayers;
    });
  }
  if (action === "blocks-missing-reason") return state.blocks.find((block) => !block.reason?.trim());
  return null;
}

function renderSeasonPlanning() {
  renderSeasonAssistant();
  renderSeasonChecklist();
  renderPlanningTeams();
  renderPlanningTasks();
  renderPlanningUnassigned();
  renderPlanningCalendarRisks();
  renderPlanningFixtureChecks();
  renderPlanningWeeklyFixtures();
}

function seasonAssistantSteps() {
  const activePlayers = state.players.filter((player) => player.status !== "passiv");
  const unassigned = activePlayers.filter((player) => !player.teamId);
  const smallTeams = state.teams.filter((team) => teamPlayers(team.id).length < requiredPlayers);
  const spvCount = state.teams.flatMap((team) => teamPlayers(team.id).filter((player) => hasActiveSpv(team.id, player.id))).length;
  const ttvnWarnings = ttvnOverallCheck().length + state.teams.flatMap((team) => ttvnTeamCheck(team.id).warnings).length;
  const fixtureWarnings = allFixtureWarnings();
  const calendarRisks = fixtureWarnings.filter((warning) => warning.action === "calendar-date").length;
  const lineupWarnings = state.fixtures.filter((fixture) => selectedLineupIds(fixture).length < requiredPlayers).length;

  return [
    {
      number: 1,
      key: `players:${state.players.length}:${unassigned.length}`,
      title: "Spieler prüfen",
      detail: state.players.length ? `${state.players.length} Spieler angelegt, ${unassigned.length} aktive ohne Mannschaft.` : "Noch keine Spieler angelegt.",
      done: state.players.length > 0 && unassigned.length === 0,
      action: unassigned.length ? "players-unassigned" : "players",
      actionLabel: state.players.length ? "Spieler prüfen" : "Spieler anlegen"
    },
    {
      number: 2,
      key: `teams:${state.teams.length}:${smallTeams.length}`,
      title: "Mannschaften zusammenstellen",
      detail: state.teams.length ? `${state.teams.length} Mannschaften, ${smallTeams.length} unter ${requiredPlayers} Spielern.` : "Noch keine Mannschaft erstellt.",
      done: state.teams.length > 0 && smallTeams.length === 0,
      action: smallTeams.length ? "teams-small" : "teams",
      actionLabel: "Mannschaften öffnen"
    },
    {
      number: 3,
      key: `rules:${spvCount}:${ttvnWarnings}`,
      title: "SPV/TTVN prüfen",
      detail: `${spvCount} SPV-Markierungen, ${ttvnWarnings} TTVN-Hinweise.`,
      done: spvCount === 0 && ttvnWarnings === 0,
      action: spvCount ? "spv" : "ttvn",
      actionLabel: "Prüfung öffnen"
    },
    {
      number: 4,
      key: `blocks:${state.blocks.length}:${calendarRisks}`,
      title: "Sperrtermine erfassen",
      detail: state.blocks.length ? `${state.blocks.length} Sperrtermine eingetragen, ${calendarRisks} kritische Spieltermine.` : "Noch keine Sperrtermine eingetragen.",
      done: state.blocks.length > 0 && calendarRisks === 0,
      action: calendarRisks ? "calendar" : "blocks",
      actionLabel: state.blocks.length ? "Sperrtermine prüfen" : "Sperrtermine erfassen"
    },
    {
      number: 5,
      key: `fixtures:${state.fixtures.length}:${fixtureWarnings.length}`,
      title: "Punktspiele terminieren",
      detail: state.fixtures.length ? `${state.fixtures.length} Punktspiele, ${fixtureWarnings.length} Hinweise offen.` : "Noch keine Punktspiele angelegt.",
      done: state.fixtures.length > 0 && fixtureWarnings.length === 0,
      action: fixtureWarnings.length ? "fixtures" : "fixtures",
      actionLabel: "Punktspiele öffnen"
    },
    {
      number: 6,
      key: `lineups:${state.fixtures.length}:${lineupWarnings}`,
      title: "Aufstellungen prüfen",
      detail: state.fixtures.length ? `${lineupWarnings} Aufstellungen unter ${requiredPlayers} Spielern.` : "Noch keine Punktspiele für Aufstellungen vorhanden.",
      done: state.fixtures.length > 0 && lineupWarnings === 0,
      action: "fixtures",
      actionLabel: "Aufstellungen öffnen"
    }
  ];
}

function isAssistantStepDismissed(step) {
  return !step.done && state.dismissedAssistantSteps?.[step.key];
}

function renderSeasonAssistant() {
  const steps = seasonAssistantSteps();
  const visibleSteps = steps.filter((step) => !isAssistantStepDismissed(step));
  const doneCount = visibleSteps.filter((step) => step.done).length;
  const isMinimized = Boolean(state.ui?.seasonAssistantMinimized);
  $(".season-assistant-panel").classList.toggle("is-minimized", isMinimized);
  $("#toggle-season-assistant").textContent = isMinimized ? "Anzeigen" : "Minimieren";
  $("#season-assistant-summary").textContent = `${doneCount}/${visibleSteps.length || steps.length} fertig`;
  $("#season-assistant-summary").className = `badge ${visibleSteps.every((step) => step.done) ? "ok" : "warn"}`;
  $("#season-assistant-steps").innerHTML = visibleSteps.length
    ? visibleSteps
    .map((step) => {
      const badgeClass = step.done ? "ok" : "warn";
      return `<div class="assistant-step ${step.done ? "is-done" : ""}">
        <span class="assistant-step-number">${step.number}</span>
        <div>
          <strong>${escapeHtml(step.title)}</strong>
          <div class="meta">${escapeHtml(step.detail)}</div>
        </div>
        <span class="assistant-step-actions">
          <span class="badge ${badgeClass}">${step.done ? "fertig" : "offen"}</span>
          <button class="small-button action-row" data-action="${step.action}" type="button">${escapeHtml(step.actionLabel)}</button>
          ${step.done ? "" : `<button class="small-button assistant-step-dismiss" data-step-key="${escapeHtml(step.key)}" type="button">Abhaken</button>`}
        </span>
      </div>`;
    })
    .join("")
    : `<div class="list-row"><span>Alle sichtbaren Assistenten-Schritte sind abgehakt.</span><span class="badge ok">ok</span></div>`;
}

function dismissAssistantStep(key) {
  state.dismissedAssistantSteps = state.dismissedAssistantSteps || {};
  state.dismissedAssistantSteps[key] = true;
  saveState();
  renderSeasonPlanning();
  showToast("Assistenten-Schritt wurde abgehakt.");
}

function planningChecklistItems() {
  const unassigned = state.players.filter((player) => !player.teamId && player.status !== "passiv");
  const playersWithoutQttr = state.players.filter((player) => !Number(player.qttr));
  const playersWithoutStatus = state.players.filter((player) => !player.status);
  const duplicateNames = duplicatePlayerNameGroups();
  const smallTeams = state.teams.filter((team) => teamPlayers(team.id).length < requiredPlayers);
  const teamsWithoutLeague = state.teams.filter((team) => !team.league);
  const spvCount = state.teams.flatMap((team) => teamPlayers(team.id).filter((player) => hasActiveSpv(team.id, player.id))).length;
  const ttvnWarnings = [
    ...ttvnOverallCheck(),
    ...state.teams.flatMap((team) => ttvnTeamCheck(team.id).warnings)
  ];
  const fixturesWithoutDate = state.fixtures.filter((fixture) => !fixturePlanningDate(fixture));
  const homeFixturesWithoutHall = state.fixtures.filter((fixture) => fixture.venue === "Heim" && !fixture.hall);
  const fixturesWithoutStartTime = state.fixtures.filter((fixture) => !fixture.startTime);
  const blocksWithoutReason = state.blocks.filter((block) => !block.reason?.trim());
  const lowAvailabilityFixtures = state.fixtures.filter((fixture) => {
    const date = fixturePlanningDate(fixture);
    if (!date) return false;
    return teamPlayers(fixture.teamId).filter((player) => isPlayerAvailableForFixture(player, fixture)).length < requiredPlayers;
  });
  const statusReview = state.players.filter((player) => player.status === "RES" || player.status === "passiv");

  return [
    {
      label: "Spieler ohne Mannschaft",
      detail: unassigned.length ? `${unassigned.length} aktive Spieler brauchen eine Zuordnung.` : "Alle aktiven Spieler sind zugeordnet.",
      count: unassigned.length,
      action: "players-unassigned",
      severity: "warn"
    },
    {
      label: "Spieler ohne QTTR-Wert",
      detail: playersWithoutQttr.length ? `${playersWithoutQttr.length} Spieler haben keinen gültigen QTTR-Wert.` : "Alle Spieler haben einen QTTR-Wert.",
      count: playersWithoutQttr.length,
      action: "players-missing-qttr",
      severity: "warn"
    },
    {
      label: "Doppelte Spielernamen",
      detail: duplicateNames.length ? `${duplicateNames.length} Namen kommen mehrfach vor.` : "Keine doppelten Spielernamen gefunden.",
      count: duplicateNames.length,
      action: "players-duplicate-names",
      severity: "warn"
    },
    {
      label: "Spieler ohne Status",
      detail: playersWithoutStatus.length ? `${playersWithoutStatus.length} Spieler haben keinen Status.` : "Alle Spieler haben einen Status.",
      count: playersWithoutStatus.length,
      action: "players-missing-status",
      severity: "warn"
    },
    {
      label: "Mannschaften unter 4 Spielern",
      detail: smallTeams.length ? `${smallTeams.length} Mannschaften sind noch zu klein.` : "Alle Mannschaften erreichen die Mindestgröße.",
      count: smallTeams.length,
      action: "teams-small",
      severity: "danger"
    },
    {
      label: "Mannschaften ohne Liga",
      detail: teamsWithoutLeague.length ? `${teamsWithoutLeague.length} Mannschaften brauchen noch eine Liga.` : "Alle Mannschaften haben eine Liga.",
      count: teamsWithoutLeague.length,
      action: "teams-missing-league",
      severity: "warn"
    },
    {
      label: "SPV-Markierungen offen",
      detail: spvCount ? `${spvCount} Sperrvermerk-Markierungen prüfen oder entfernen.` : "Keine offenen SPV-Markierungen.",
      count: spvCount,
      action: "spv",
      severity: "warn"
    },
    {
      label: "TTVN-Warnungen",
      detail: ttvnWarnings.length ? `${ttvnWarnings.length} Hinweise in der Mannschaftsaufstellung.` : "TTVN-Prüfung ist unauffällig.",
      count: ttvnWarnings.length,
      action: "ttvn",
      severity: "warn"
    },
    {
      label: "Punktspiele ohne Termin",
      detail: fixturesWithoutDate.length ? `${fixturesWithoutDate.length} Punktspiele haben noch keinen Termin.` : "Alle Punktspiele haben mindestens einen Termin.",
      count: fixturesWithoutDate.length,
      action: "fixtures-without-date",
      severity: "warn"
    },
    {
      label: "Heimspiele ohne Halle",
      detail: homeFixturesWithoutHall.length ? `${homeFixturesWithoutHall.length} Heimspiele haben noch keine Halle.` : "Alle Heimspiele haben eine Halle.",
      count: homeFixturesWithoutHall.length,
      action: "fixtures-missing-hall",
      severity: "danger"
    },
    {
      label: "Punktspiele ohne Spielbeginn",
      detail: fixturesWithoutStartTime.length ? `${fixturesWithoutStartTime.length} Punktspiele haben noch keinen Spielbeginn.` : "Alle Punktspiele haben einen Spielbeginn.",
      count: fixturesWithoutStartTime.length,
      action: "fixtures-missing-start",
      severity: "warn"
    },
    {
      label: "Punktspiele mit zu wenig Spielern",
      detail: lowAvailabilityFixtures.length ? `${lowAvailabilityFixtures.length} Spiele haben weniger als ${requiredPlayers} verfügbare Spieler.` : "Alle terminierten Spiele haben genug verfügbare Spieler.",
      count: lowAvailabilityFixtures.length,
      action: "fixture-low-availability",
      severity: "danger"
    },
    {
      label: "Sperrtermine ohne Grund",
      detail: blocksWithoutReason.length ? `${blocksWithoutReason.length} Sperrtermine haben keinen Grund.` : "Alle Sperrtermine haben einen Grund.",
      count: blocksWithoutReason.length,
      action: "blocks-missing-reason",
      severity: "warn"
    },
    {
      label: "RES/passiv kontrollieren",
      detail: statusReview.length ? `${statusReview.length} Spieler mit Status RES oder passiv prüfen.` : "Keine RES/passiv-Spieler zur Kontrolle.",
      count: statusReview.length,
      action: "player-status-review",
      severity: "warn"
    }
  ];
}

function seasonCheckKey(item) {
  return `${item.action}:${item.count}`;
}

function isSeasonCheckDismissed(item) {
  return item.count > 0 && state.dismissedSeasonChecks?.[seasonCheckKey(item)];
}

function renderSeasonChecklist() {
  const items = planningChecklistItems();
  const visibleItems = items.filter((item) => !isSeasonCheckDismissed(item));
  const openCount = visibleItems.filter((item) => item.count > 0).length;
  const panel = $("#season-check-list").closest(".season-check-panel");
  panel.classList.toggle("is-minimized", openCount === 0);
  $("#season-check-summary").textContent = openCount ? `${openCount} offen` : "alles ok";
  $("#season-check-summary").className = `badge ${openCount ? "warn" : "ok"}`;
  $("#season-check-list").innerHTML = visibleItems.length
    ? visibleItems
    .map((item) => {
      const isOpen = item.count > 0;
      const badgeClass = isOpen ? item.severity : "ok";
      const badgeText = isOpen ? `${item.count} offen` : "ok";
      return `<div class="season-check-row action-row" data-action="${item.action}" role="button" tabindex="0">
        <span class="check-dot ${badgeClass}">${isOpen ? "!" : "ok"}</span>
        <div>
          <strong>${escapeHtml(item.label)}</strong>
          <div class="meta">${escapeHtml(item.detail)}</div>
        </div>
        <span class="season-check-actions">
          <span class="badge ${badgeClass}">${badgeText}</span>
          ${isOpen ? `<button class="small-button season-check-dismiss" data-check-key="${seasonCheckKey(item)}" type="button">Abhaken</button>` : ""}
        </span>
      </div>`;
    })
    .join("")
    : `<div class="list-row"><span>Keine offenen Punkte in der Saisonstart-Prüfung.</span><span class="badge ok">ok</span></div>`;
}

function dismissSeasonCheck(key) {
  state.dismissedSeasonChecks = state.dismissedSeasonChecks || {};
  state.dismissedSeasonChecks[key] = true;
  saveState();
  renderSeasonPlanning();
  showToast("Punkt wurde abgehakt.");
}

function renderPlanningTeams() {
  $("#planning-teams").innerHTML = orderedTeams()
    .map((team) => {
      const players = teamPlayers(team.id);
      const warnings = ttvnTeamCheck(team.id).warnings.length;
      const spvCount = players.filter((player) => hasActiveSpv(team.id, player.id)).length;
      const className = players.length < requiredPlayers || warnings ? "warn" : "ok";
      return `<button class="list-row action-row" data-action="team" data-team-id="${team.id}" type="button">
        <div>
          <strong>${escapeHtml(team.name)}</strong>
          <div class="meta">${escapeHtml(team.league)} - ${players.length}/${requiredPlayers} Spieler - ${spvCount} SPV</div>
        </div>
        <span class="badge ${className}">${players.length < requiredPlayers ? "zu klein" : warnings ? "prüfen" : "ok"}</span>
      </button>`;
    })
    .join("");
}

function renderPlanningTasks() {
  const tasks = [];
  const unassigned = state.players.filter((player) => !player.teamId && player.status !== "passiv");
  const passive = state.players.filter((player) => player.status === "passiv");
  const openFixtures = state.fixtures.filter((fixture) => fixture.status !== "bestaetigt");
  const ttvnWarnings = ttvnOverallCheck();
  const spvCount = state.teams.flatMap((team) => teamPlayers(team.id).filter((player) => hasActiveSpv(team.id, player.id))).length;
  const fixtureWarnings = allFixtureWarnings();

  if (unassigned.length) tasks.push({ key: `unassigned:${unassigned.length}`, label: `${unassigned.length} aktive Spieler ohne Mannschaft zuordnen`, action: "players" });
  if (openFixtures.length) tasks.push({ key: `open-fixtures:${openFixtures.length}`, label: `${openFixtures.length} offene Punktspiele terminieren`, action: "fixtures" });
  if (ttvnWarnings.length) tasks.push({ key: `ttvn:${ttvnWarnings.length}`, label: `${ttvnWarnings.length} TTVN-Hinweise prüfen`, action: "teams" });
  if (fixtureWarnings.length) tasks.push({ key: `fixture-warnings:${fixtureWarnings.length}`, label: `${fixtureWarnings.length} Terminprobleme prüfen`, action: "fixtures" });
  if (spvCount) tasks.push({ key: `spv:${spvCount}`, label: `${spvCount} SPV-Markierungen prüfen`, action: "teams" });
  if (passive.length) tasks.push({ key: `passive:${passive.length}`, label: `${passive.length} passive Spieler im Kalender gesperrt`, action: "calendar" });

  const visibleTasks = tasks.filter((task) => !state.dismissedPlanningTasks?.[task.key]);
  $("#planning-tasks").innerHTML = visibleTasks.length
    ? visibleTasks.map((task) => `<div class="list-row task-row">
      <button class="task-main action-row" data-action="${task.action}" type="button"><span>${escapeHtml(task.label)}</span><span class="badge warn">offen</span></button>
      <button class="small-button planning-task-dismiss" data-task-key="${escapeHtml(task.key)}" type="button">Abhaken</button>
    </div>`).join("")
    : `<div class="list-row"><span>Keine offenen Planungsaufgaben.</span><span class="badge ok">fertig</span></div>`;
}

function dismissPlanningTask(key) {
  state.dismissedPlanningTasks = state.dismissedPlanningTasks || {};
  state.dismissedPlanningTasks[key] = true;
  saveState();
  renderSeasonPlanning();
  showToast("Aufgabe wurde abgehakt.");
}

function renderPlanningFixtureChecks() {
  const warnings = allFixtureWarnings();
  $("#planning-fixture-checks").innerHTML = warnings.length
    ? warnings
        .slice(0, 12)
        .map(({ fixture, message, action, date }) => `<button class="list-row action-row" data-action="${action}" data-fixture-id="${fixture.id}" data-team-id="${fixture.teamId}" data-date="${date || fixturePlanningDate(fixture)}" type="button">
          <div>
            <strong>${escapeHtml(teamName(fixture.teamId))} - ${escapeHtml(fixture.opponent)}</strong>
            <div class="meta">${escapeHtml(message)}</div>
          </div>
          <span class="badge danger">beheben</span>
        </button>`)
        .join("")
    : `<div class="list-row"><span>Keine Terminprobleme gefunden.</span><span class="badge ok">ok</span></div>`;
}

function weeklyFixtureGroups() {
  const groups = new Map();
  state.fixtures
    .map((fixture) => ({ fixture, date: fixturePlanningDate(fixture) }))
    .filter((item) => item.date)
    .sort((a, b) => a.date.localeCompare(b.date) || teamName(a.fixture.teamId).localeCompare(teamName(b.fixture.teamId), "de", { numeric: true }))
    .forEach((item) => {
      const week = isoWeek(item.date);
      const key = `${item.date.slice(0, 4)}-${String(week).padStart(2, "0")}`;
      const group = groups.get(key) || { key, week, year: item.date.slice(0, 4), items: [] };
      group.items.push(item);
      groups.set(key, group);
    });
  return [...groups.values()];
}

function weeklyFixtureWarnings(items) {
  const warnings = [];
  const byTeam = new Map();
  const homeByHall = new Map();

  items.forEach(({ fixture }) => {
    byTeam.set(fixture.teamId, [...(byTeam.get(fixture.teamId) || []), fixture]);
    if (fixture.venue === "Heim") {
      const hall = fixture.hall || "keine Halle";
      homeByHall.set(hall, [...(homeByHall.get(hall) || []), fixture]);
    }
  });

  byTeam.forEach((fixtures, teamId) => {
    if (fixtures.length > 1) warnings.push(`${teamName(teamId)} hat ${fixtures.length} Spiele in dieser Woche.`);
  });
  homeByHall.forEach((fixtures, hall) => {
    if (fixtures.length > 1) warnings.push(`${fixtures.length} Heimspiele ${hall}.`);
  });

  return warnings;
}

function renderPlanningWeeklyFixtures() {
  const groups = weeklyFixtureGroups();
  if (!groups.length) {
    $("#planning-weekly-fixtures").innerHTML = `<div class="list-row"><span>Noch keine terminierten Punktspiele.</span><span class="badge">leer</span></div>`;
    return;
  }

  $("#planning-weekly-fixtures").innerHTML = groups
    .slice(0, 12)
    .map((group) => {
      const warnings = weeklyFixtureWarnings(group.items);
      const badgeClass = warnings.length ? "warn" : "ok";
      return `<details class="week-card" ${warnings.length ? "open" : ""}>
        <summary class="list-row">
          <div>
            <strong>KW ${group.week} / ${group.year}</strong>
            <div class="meta">${group.items.length} Punktspiele${warnings.length ? ` - ${warnings.join(" ")}` : ""}</div>
          </div>
          <span class="badge ${badgeClass}">${warnings.length ? "prüfen" : "ok"}</span>
        </summary>
        <div class="weekly-fixture-list">
          ${group.items.map(({ fixture, date }) => {
            const hall = fixture.venue === "Heim" ? fixture.hall || "keine Halle" : fixture.awayHallNumber ? `Halle ${fixture.awayHallNumber}` : "auswärts";
            return `<button class="list-row action-row" data-action="fixture" data-fixture-id="${fixture.id}" type="button">
              <div>
                <strong>${escapeHtml(formatShortDate(date))} - ${escapeHtml(teamName(fixture.teamId))}</strong>
                <div class="meta">${escapeHtml(venueLabel(fixture.venue))}: ${escapeHtml(fixture.opponent)} - ${escapeHtml(hall)}${fixture.startTime ? ` - ${escapeHtml(fixture.startTime)} Uhr` : ""}</div>
              </div>
              <span class="badge">${escapeHtml(fixtureStatusLabel(fixture.status))}</span>
            </button>`;
          }).join("")}
        </div>
      </details>`;
    })
    .join("");
}

function renderPlanningUnassigned() {
  const players = state.players.filter((player) => !player.teamId).sort((a, b) => b.qttr - a.qttr);
  $("#planning-unassigned").innerHTML = players.length
    ? players
        .map((player) => `<button class="list-row action-row" data-action="player" data-player-id="${player.id}" type="button"><span>${escapeHtml(player.name)}</span><strong>${player.qttr}</strong></button>`)
        .join("")
    : `<div class="list-row"><span>Alle Spieler sind Mannschaften zugeordnet.</span><span class="badge ok">ok</span></div>`;
}

function renderPlanningCalendarRisks() {
  const season = seasonSettings();
  const dates = dateRange(season.start, season.end);
  const risks = state.teams.flatMap((team) =>
    dates
      .map((date) => ({ team, date, ...calendarRowState(team.id, date) }))
      .filter((item) => item.available < neededPlayers())
      .slice(0, 4)
  );

  $("#planning-calendar-risks").innerHTML = risks.length
    ? risks
        .slice(0, 8)
        .map((risk) => `<button class="list-row action-row" data-action="calendar-date" data-team-id="${risk.team.id}" data-date="${risk.date}" type="button">
          <div>
            <strong>${escapeHtml(risk.team.name)}</strong>
            <div class="meta">${formatShortDate(risk.date)} - ${risk.available}/${neededPlayers()} verfügbar</div>
          </div>
          <span class="badge danger">kritisch</span>
        </button>`)
        .join("")
    : `<div class="list-row"><span>Keine kritischen Kalendertage im Zeitraum.</span><span class="badge ok">ok</span></div>`;
}

function renderTeams() {
  if (!state.teams.length) {
    $("#teams-list").innerHTML = emptyState("Noch keine Mannschaften", "Erstelle die erste Mannschaft und ordne dort die Spieler zu.", "Mannschaft erstellen", "team");
    return;
  }

  $("#teams-list").innerHTML = orderedTeams()
    .map((team) => {
      const players = state.players.filter((player) => player.teamId === team.id).sort((a, b) => b.qttr - a.qttr);
      syncTeamOrder(team.id);
      const orderedPlayers = teamPlayers(team.id);
      const avg = Math.round(orderedPlayers.reduce((sum, player) => sum + player.qttr, 0) / Math.max(1, orderedPlayers.length));
      const sizeClass = orderedPlayers.length < requiredPlayers ? "danger" : "ok";
      const sizeLabel = orderedPlayers.length < 4 ? "zu klein" : `${orderedPlayers.length} Spieler`;
      return `<article class="team-card">
        <div class="card-head">
          <div>
            <h2>${escapeHtml(team.name)}</h2>
            <p class="meta">${escapeHtml(team.league)} - ${orderedPlayers.length}/${requiredPlayers} Mindestspieler - QTTR Schnitt ${avg}</p>
          </div>
          <div class="team-card-actions">
            <span class="badge ${sizeClass}">${sizeLabel}</span>
            <button class="small-button edit-team" data-team-id="${team.id}">Bearbeiten</button>
          </div>
        </div>
        <div class="line-list">
          ${orderedPlayers
            .map((player, index) => `<div class="line-item"><span>${index + 1}. ${escapeHtml(player.name)}</span>${renderSpvBadge(team.id, player)}<strong>${player.qttr}</strong></div>`)
            .join("")}
        </div>
      </article>`;
    })
    .join("");
}

function renderSpvBadge(teamId, player) {
  if (!hasActiveSpv(teamId, player.id)) return "";
  const info = spvInfo(teamId, player.id);
  const title = player.manualSpv
    ? "Manuell gesetzter Sperrvermerk"
    : `${info.difference} Punkte über ${info.previousLast.name} aus ${info.previousTeam.name}`;
  return `<button class="spv-badge" data-team-id="${teamId}" data-player-id="${player.id}" title="${escapeHtml(title)}" type="button">SPV <span>x</span></button>`;
}

function renderTtvnChecks() {
  const overallWarnings = ttvnOverallCheck();
  const teamWarnings = state.teams.flatMap((team) => ttvnTeamCheck(team.id).warnings.map((warning) => `${team.name}: ${warning}`));
  const warnings = [...overallWarnings, ...teamWarnings];

  $("#ttvn-check-list").innerHTML = warnings.length
    ? warnings.map((warning) => `<div class="list-row"><span>${escapeHtml(warning)}</span><span class="badge warn">prüfen</span></div>`).join("")
    : `<div class="list-row"><span>Keine Auffälligkeiten nach aktueller Q-TTR-Toleranzprüfung.</span><span class="badge ok">ok</span></div>`;
}

function calendarColumns() {
  return state.ui?.calendarColumns || { substitute: true, break: true, fixture: true, hints: true };
}

function syncCalendarColumnToggles() {
  const columns = calendarColumns();
  document.querySelectorAll(".calendar-column-toggle").forEach((input) => {
    input.checked = columns[input.dataset.column] !== false;
  });
}

function optionalCalendarColspan(base, players = 0) {
  const columns = calendarColumns();
  return base + players + ["substitute", "break", "fixture", "hints"].filter((column) => columns[column] !== false).length;
}

function renderCalendar() {
  const teamId = $("#calendar-team-filter").value || "all";
  syncCalendarColumnToggles();
  if (teamId === "all") {
    renderAllTeamsCalendar();
    return;
  }
  const players = calendarPlayers(teamId);
  const columns = calendarColumns();
  const season = seasonSettings();
  const dates = dateRange(season.start, season.end);
  const hintFilter = $("#calendar-hint-filter")?.value || "all";
  const visibleDates = dates.filter((date) => {
    const rowState = calendarRowState(teamId, date);
    const fixtures = state.fixtures.filter((fixture) => fixture.teamId === teamId && fixtureDates(fixture).includes(date));
    return calendarMatchesHintFilter(hintFilter, date, rowState, fixtures);
  });
  $("#calendar-period-label").textContent = season.label;

  $("#calendar-head").innerHTML = `<tr>
    <th class="calendar-col-index">#</th>
    <th class="calendar-col-week">KW</th>
    <th class="calendar-col-date">Datum</th>
    <th class="calendar-col-day">Tag</th>
    ${players.map((player) => `<th class="calendar-col-player">${escapeHtml(player.name)}</th>`).join("")}
    ${columns.substitute ? `<th class="calendar-col-substitute">Ersatz</th>` : ""}
    ${columns.break ? `<th class="calendar-col-break">Ferien/Feiertag</th>` : ""}
    ${columns.fixture ? `<th class="calendar-col-fixture">Spiel</th>` : ""}
    ${columns.hints ? `<th class="calendar-col-hints">Hinweise</th>` : ""}
  </tr>`;

  $("#calendar-body").innerHTML = visibleDates.length
    ? visibleDates.map((date, index) => {
      const day = parseIsoDate(date);
      const rowState = calendarRowState(teamId, date);
      const fixtures = state.fixtures.filter((fixture) => fixture.teamId === teamId && fixtureDates(fixture).includes(date));
      const fixtureLabel = fixtures.length ? fixtures.map((fixture) => calendarFixtureLabel(fixture, date)).join("<br>") : "";
      const breakInfo = calendarBreakPills(date);
      const hintInfo = calendarHintPills(teamId, date, rowState, fixtures);
      return `<tr class="${rowState.className}" data-calendar-date="${date}">
        <td class="calendar-col-index">${index + 1}</td>
        <td class="calendar-col-week">${isoWeek(date)}</td>
        <td class="calendar-col-date">${formatShortDate(date)}</td>
        <td class="calendar-col-day"><span class="day-pill">${weekdays[day.getDay()]}</span></td>
        ${players
          .map((player) => {
            const value = calendarValue(teamId, date, player.id);
            return `<td class="calendar-col-player">
              <button class="calendar-toggle ${value === "yes" ? "is-yes" : "is-no"}" data-team-id="${teamId}" data-date="${date}" data-player-id="${player.id}" title="${escapeHtml(player.name)} ${formatShortDate(date)}" ${player.status === "passiv" ? "disabled" : ""}>
                ${value === "yes" ? "v" : "x"}
              </button>
            </td>`;
          })
          .join("")}
        ${columns.substitute ? `<td class="calendar-col-substitute">
          <input class="calendar-substitute-input" data-team-id="${teamId}" data-date="${date}" value="${escapeHtml(calendarSubstituteValue(teamId, date))}" placeholder="Ersatz" aria-label="Ersatzspieler am ${formatShortDate(date)}">
        </td>` : ""}
        ${columns.break ? `<td class="calendar-col-break">${breakInfo}</td>` : ""}
        ${columns.fixture ? `<td class="calendar-col-fixture calendar-fixture-cell">${fixtureLabel}</td>` : ""}
        ${columns.hints ? `<td class="calendar-col-hints">${hintInfo}</td>` : ""}
      </tr>`;
    }).join("")
    : `<tr><td class="calendar-empty-row" colspan="${optionalCalendarColspan(4, players.length)}">Keine Tage für diesen Filter.</td></tr>`;

  renderCalendarOptions(teamId, dates);
}

function renderAllTeamsCalendar() {
  const season = seasonSettings();
  const hintFilter = $("#calendar-hint-filter")?.value || "all";
  const columns = calendarColumns();
  $("#calendar-period-label").textContent = `${season.label} - alle Mannschaften`;

  const rows = state.fixtures
    .flatMap((fixture) => fixtureDates(fixture).map((date) => ({ fixture, date })))
    .filter(({ date }) => seasonContainsDate(date))
    .filter(({ fixture, date }) => {
      const rowState = calendarRowState(fixture.teamId, date);
      return calendarMatchesHintFilter(hintFilter, date, rowState, [fixture]);
    })
    .sort((a, b) => a.date.localeCompare(b.date) || teamName(a.fixture.teamId).localeCompare(teamName(b.fixture.teamId), "de", { numeric: true }));

  $("#calendar-head").innerHTML = `<tr>
    <th class="calendar-col-week">KW</th>
    <th class="calendar-col-date">Datum</th>
    <th class="calendar-col-day">Tag</th>
    <th>Mannschaft</th>
    ${columns.fixture ? `<th>Spiel</th>` : ""}
    <th>Halle / Beginn</th>
    ${columns.substitute ? `<th>Ersatz</th>` : ""}
    ${columns.hints ? `<th class="calendar-col-hints">Hinweise</th>` : ""}
  </tr>`;

  $("#calendar-body").innerHTML = rows.length
    ? rows.map(({ fixture, date }) => {
      const rowState = calendarRowState(fixture.teamId, date);
      const day = parseIsoDate(date);
      const hall = fixture.venue === "Heim" ? fixture.hall || "keine Halle" : fixture.awayHallNumber ? `Halle ${fixture.awayHallNumber}` : "";
      const time = fixture.startTime ? `${fixture.startTime} Uhr` : "";
      const hallMeta = [hall, time].filter(Boolean).join(" - ") || "-";
      const hintInfo = calendarHintPills(fixture.teamId, date, rowState, [fixture]);
      return `<tr class="${rowState.className}" data-calendar-date="${date}">
        <td class="calendar-col-week">${isoWeek(date)}</td>
        <td class="calendar-col-date">${formatShortDate(date)}</td>
        <td class="calendar-col-day"><span class="day-pill">${weekdays[day.getDay()]}</span></td>
        <td><button class="team-jump-button team-tooltip-target" data-team-id="${fixture.teamId}" data-date="${date}" data-tooltip="${escapeHtml(calendarAvailabilityTooltip(fixture.teamId, date))}" type="button">${escapeHtml(teamName(fixture.teamId))}</button></td>
        ${columns.fixture ? `<td>${calendarFixtureLabel(fixture, date)}</td>` : ""}
        <td>${escapeHtml(hallMeta)}</td>
        ${columns.substitute ? `<td>${escapeHtml(calendarSubstituteValue(fixture.teamId, date) || "-")}</td>` : ""}
        ${columns.hints ? `<td class="calendar-col-hints">${hintInfo}</td>` : ""}
      </tr>`;
    }).join("")
    : `<tr><td class="calendar-empty-row" colspan="${optionalCalendarColspan(5)}">Keine Punktspiele für diesen Filter.</td></tr>`;

  $("#home-options").innerHTML = emptyState("Mannschaft auswählen", "Mögliche Termine werden für einzelne Mannschaften berechnet.", "", "");
  $("#away-options").innerHTML = emptyState("Mannschaft auswählen", "Wähle links eine Mannschaft statt Alle Mannschaften.", "", "");
}

function calendarMatchesHintFilter(filter, date, rowState, fixtures) {
  const hasAvailabilityProblem = rowState.available < neededPlayers();
  const hasMissingHomeHall = fixtures.some((fixture) => fixture.venue === "Heim" && !hasHomeHallOnDate(date));
  const hasBreak = Boolean(schoolBreakName(date) || holidayName(date));
  const hasFixture = fixtures.length > 0;
  const hasProblem = hasAvailabilityProblem || hasMissingHomeHall || holidayName(date) || fixtures.length > 1;

  if (filter === "problems") return hasProblem;
  if (filter === "too-few") return hasAvailabilityProblem;
  if (filter === "no-hall") return hasMissingHomeHall;
  if (filter === "breaks") return hasBreak;
  if (filter === "fixtures") return hasFixture;
  return true;
}

function calendarBreakPills(date) {
  const schoolBreak = schoolBreakName(date);
  const holiday = holidayName(date);
  return [
    schoolBreak ? `<span class="break-pill break-school" data-tooltip="${escapeHtml(schoolBreak)}">Ferien</span>` : "",
    holiday ? `<span class="break-pill break-holiday" data-tooltip="${escapeHtml(holiday)}">Feiertag</span>` : ""
  ].filter(Boolean).join(" ");
}

function calendarHintPills(teamId, date, rowState, fixtures) {
  const hints = [];
  const schoolBreak = schoolBreakName(date);
  const holiday = holidayName(date);
  const missingHomeHall = fixtures.some((fixture) => fixture.venue === "Heim" && !hasHomeHallOnDate(date));

  if (rowState.available >= neededPlayers()) {
    hints.push({ label: "komplett", className: "ok", tooltip: `${rowState.available}/${neededPlayers()} Spieler verfügbar` });
  } else if (rowState.missing === 1) {
    hints.push({ label: "1 fehlt", className: "warn", tooltip: `${rowState.available}/${neededPlayers()} Spieler verfügbar` });
  } else {
    hints.push({ label: "zu wenig", className: "danger", tooltip: `${rowState.available}/${neededPlayers()} Spieler verfügbar` });
  }

  if (holiday) hints.push({ label: "Feiertag", className: "danger", tooltip: holiday });
  if (schoolBreak) hints.push({ label: "Ferien", className: "info", tooltip: schoolBreak });
  if (missingHomeHall) hints.push({ label: "keine Halle", className: "warn", tooltip: "Heimspiel ohne eingetragene Hallenzeit" });
  if (fixtures.length === 1) hints.push({ label: "Spiel", className: "fixture", tooltip: fixtures[0].opponent });
  if (fixtures.length > 1) hints.push({ label: `${fixtures.length} Spiele`, className: "danger", tooltip: "Mehrere Punktspiele dieser Mannschaft an diesem Tag" });

  return hints
    .map((hint) => `<span class="hint-pill hint-${hint.className}" data-tooltip="${escapeHtml(hint.tooltip)}">${escapeHtml(hint.label)}</span>`)
    .join("");
}

function calendarTooltip() {
  let tooltip = $("#calendar-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "calendar-tooltip";
    tooltip.className = "calendar-tooltip";
    document.body.append(tooltip);
  }
  return tooltip;
}

function showCalendarTooltip(target, event) {
  const tooltip = calendarTooltip();
  tooltip.textContent = target.dataset.tooltip;
  tooltip.hidden = false;
  moveCalendarTooltip(event);
}

function moveCalendarTooltip(event) {
  const tooltip = $("#calendar-tooltip");
  if (!tooltip || tooltip.hidden) return;
  tooltip.style.left = `${event.clientX + 12}px`;
  tooltip.style.top = `${event.clientY - 34}px`;
}

function hideCalendarTooltip() {
  const tooltip = $("#calendar-tooltip");
  if (tooltip) tooltip.hidden = true;
}

function calendarFixtureLabel(fixture, date) {
  const dateIndex = fixture.preferredDates.indexOf(date);
  const dateLabel = fixture.confirmedDate === date ? "" : `V${dateIndex + 1}`;
  const hallLabel = fixtureHallNumberLabel(fixture);
  const missingHomeHall = fixture.venue === "Heim" && !hasHomeHallOnDate(date);
  const venueShort = fixture.venue === "Heim" ? "H" : "A";
  const tooltip = [
    `Ort: ${venueLabel(fixture.venue)}`,
    `Gegner: ${fixture.opponent}`,
    hallLabel ? `Halle: ${hallLabel}` : "",
    fixture.startTime ? `Beginn: ${fixture.startTime} Uhr` : "",
    missingHomeHall ? "Warnung: Keine Heim-Hallenzeit" : ""
  ].filter(Boolean).join("\n");
  return `<button class="fixture-chip fixture-${fixture.status} ${missingHomeHall ? "fixture-missing-hall" : ""}" data-fixture-id="${fixture.id}" data-tooltip="${escapeHtml(tooltip)}" type="button">
    <span>${venueShort}: ${escapeHtml(fixture.opponent)}</span>
    ${missingHomeHall ? `<strong aria-label="Keine Heim-Hallenzeit">H</strong>` : ""}
    ${dateLabel ? `<small>${dateLabel}</small>` : ""}
  </button>`;
}

function fixtureHallNumberLabel(fixture) {
  if (fixture.venue === "Auswaerts" && fixture.awayHallNumber) return `Halle ${fixture.awayHallNumber}`;
  if (fixture.venue !== "Heim" || !fixture.hall) return "";
  const match = fixture.hall.match(/\((\d+)\)/);
  return match ? `Halle ${match[1]}` : "";
}

function renderCalendarOptions(teamId, dates) {
  const rows = dates.map((date) => ({ date, day: parseIsoDate(date).getDay(), ...calendarRowState(teamId, date) }));
  const freeRows = rows.filter((row) => row.available >= neededPlayers() && !teamHasFixtureOnDate(teamId, row.date) && !isDateExcludedByCalendarRules(row.date));
  renderOptionGrid("#home-options", homeSlots(), freeRows, true);
  renderOptionGrid("#away-options", awaySlots, freeRows, false);
}

function renderOptionGrid(selector, slots, rows, includeHall) {
  const byWeekday = Object.fromEntries(slots.map((slot) => [slot.weekday, rows.filter((row) => row.day === slot.weekday).slice(0, 8)]));
  const maxRows = Math.max(1, ...Object.values(byWeekday).map((items) => items.length));

  $(selector).innerHTML = `
    ${slots.map((slot) => `<div class="option-head">${slot.label}</div>`).join("")}
    ${includeHall ? slots.map((slot) => `<div class="option-subhead">${slot.hall}</div>`).join("") : ""}
    ${Array.from({ length: maxRows })
      .map((_, rowIndex) =>
        slots
          .map((slot) => {
            const item = byWeekday[slot.weekday][rowIndex];
            if (!item) return `<div class="option-cell muted-cell"></div>`;
            const venue = includeHall ? "Heim" : "Auswaerts";
            return `<button class="option-cell ${item.className} create-fixture-from-date" data-date="${item.date}" data-venue="${venue}" type="button">${formatShortDate(item.date)}</button>`;
          })
          .join("")
      )
      .join("")}`;
}

function createFixtureFromDate(date, venue) {
  const teamId = $("#calendar-team-filter").value === "all" ? state.teams[0]?.id : $("#calendar-team-filter").value || state.teams[0]?.id;
  const hall = venue === "Heim" ? defaultHallForDate(date) : "";
  const fixture = {
    id: `f${Date.now()}`,
    teamId,
    opponent: "Gegner offen",
    venue,
    hall,
    awayHallNumber: "",
    startTime: hall ? defaultTimeForHall(hall) : "",
    status: "offen",
    preferredDates: [date],
    availability: {}
  };
  state.fixtures.push(fixture);
  addActivity("Punktspiel", `${teamName(teamId)} am ${formatShortDate(date)} angelegt`, venueLabel(venue));
  saveState();
  render();
  switchView("fixtures");
  showToast("Punktspiel aus Kalendervorschlag erstellt.");
}

function renderFixtures() {
  const teamFilter = $("#fixture-team-filter").value;
  const statusFilter = $("#fixture-status-filter").value;
  const fixtures = state.fixtures
    .filter((fixture) => teamFilter === "all" || fixture.teamId === teamFilter)
    .filter((fixture) => statusFilter === "all" || fixture.status === statusFilter)
    .sort(compareFixturesChronologically);

  if (!fixtures.length) {
    $("#fixture-board").innerHTML = emptyState("Keine Punktspiele gefunden", "Lege ein neues Punktspiel an oder passe die Filter an.", "Punktspiel erstellen", "fixture");
    return;
  }

  $("#fixture-board").innerHTML = renderFixtureGroups(fixtures);
}

function renderFixtureGroups(fixtures) {
  const groups = new Map();
  fixtures.forEach((fixture) => {
    const date = fixturePlanningDate(fixture);
    const key = date ? `${date.slice(0, 4)}-KW${String(isoWeek(date)).padStart(2, "0")}` : "ohne-termin";
    const label = date ? `KW ${isoWeek(date)} / ${date.slice(0, 4)}` : "Ohne Termin";
    if (!groups.has(key)) groups.set(key, { label, fixtures: [] });
    groups.get(key).fixtures.push(fixture);
  });

  return [...groups.values()]
    .map((group) => `<section class="fixture-week-group">
      <div class="fixture-week-head">
        <h2>${escapeHtml(group.label)}</h2>
        <span class="badge">${group.fixtures.length} Spiele</span>
      </div>
      ${group.fixtures.map(renderFixtureCard).join("")}
    </section>`)
    .join("");
}

function renderFixtureCard(fixture) {
  return `<details class="fixture-card" ${fixture.status === "bestaetigt" ? "" : "open"}>
    <summary class="fixture-summary">
      <div>
        <h2>${escapeHtml(teamName(fixture.teamId))} - ${escapeHtml(fixture.opponent)}</h2>
        <p class="meta">${fixtureHeaderMeta(fixture)}</p>
      </div>
      <div class="fixture-summary-actions">
        ${fixtureLineupBadge(fixture)}
        <span class="badge">${escapeHtml(fixtureStatusLabel(fixture.status))}</span>
        <button class="small-button edit-fixture" data-fixture-id="${fixture.id}" type="button">Bearbeiten</button>
      </div>
    </summary>
    ${renderFixtureWarnings(fixture)}
    ${renderAvailabilitySummary(fixture)}
    <div class="date-options">
      ${fixture.preferredDates
        .map((date) => {
          const score = optionScore(fixture, date);
          const blocked = blockedPlayersForDate(fixture.teamId, date);
          const isConfirmed = fixture.confirmedDate === date;
          return `<div class="option">
            <div>
              <strong>${formatDate(date)}</strong>
              <div class="small">${blocked.length ? blocked.map((block) => escapeHtml(playerName(block.playerId))).join(", ") : "alle Stammspieler verfügbar"}</div>
            </div>
            <div class="option-actions">
              <button class="small-button jump-calendar-date" data-team-id="${fixture.teamId}" data-date="${date}" type="button">Im Kalender</button>
              <span class="badge ${isConfirmed ? "ok" : score.className}">${isConfirmed ? "fix" : score.label}</span>
              ${isConfirmed ? "" : `<button class="small-button confirm-date" data-fixture-id="${fixture.id}" data-date="${date}" type="button">Termin bestätigen</button>`}
            </div>
          </div>`;
        })
        .join("")}
    </div>
    ${renderLineupControls(fixture)}
    ${renderAvailabilityControls(fixture)}
  </details>`;
}

function fixtureHeaderMeta(fixture) {
  const date = fixturePlanningDate(fixture);
  const dateText = date ? formatShortDate(date) : "kein Termin";
  const hallText = fixture.hall ? ` - ${fixture.hall}` : "";
  const awayHallText = fixture.venue === "Auswaerts" && fixture.awayHallNumber ? ` - Halle ${fixture.awayHallNumber}` : "";
  const timeText = fixture.startTime ? ` - ${fixture.startTime} Uhr` : "";
  return `${venueLabel(fixture.venue)} - ${dateText}${hallText}${awayHallText}${timeText}`;
}

function fixtureLineupBadge(fixture) {
  const count = selectedLineupIds(fixture).length;
  return `<span class="badge ${count >= requiredPlayers ? "ok" : "danger"}">${count}/${requiredPlayers}</span>`;
}

function renderLineupControls(fixture) {
  const players = teamPlayers(fixture.teamId);
  const selectedIds = new Set(selectedLineupIds(fixture));
  const availableIds = new Set(players.filter((player) => isPlayerAvailableForFixture(player, fixture)).map((player) => player.id));
  const selectedCount = [...selectedIds].filter((playerId) => players.some((player) => player.id === playerId)).length;
  const lineupWarnings = lineupConflictSummary(fixture);
  const className = selectedCount >= requiredPlayers ? "ok" : "danger";

  if (!players.length) return "";

  return `<section class="lineup-panel">
    <div class="panel-head">
      <h2>Aufstellung</h2>
      <div class="option-actions">
        <span class="badge ${className}">${selectedCount}/${requiredPlayers}</span>
        <button class="small-button copy-lineup" data-fixture-id="${fixture.id}" type="button">Aufstellung kopieren</button>
      </div>
    </div>
    ${lineupWarnings.length ? `<div class="rule-warning">${lineupWarnings.map((warning) => escapeHtml(warning)).join("<br>")}</div>` : ""}
    <div class="lineup-list">
      ${players
        .map((player) => {
          const available = availableIds.has(player.id);
          const conflicts = lineupPlayerConflicts(player, fixture);
          const hasHardConflict = conflicts.some((conflict) => conflict.severity === "danger");
          return `<label class="lineup-row ${available ? "" : "is-disabled"}">
            <input type="checkbox" class="lineup-player" data-fixture-id="${fixture.id}" data-player-id="${player.id}" ${selectedIds.has(player.id) ? "checked" : ""}>
            <span class="lineup-player-main">
              <strong>${escapeHtml(player.name)}</strong>
              ${conflicts.length ? `<span class="lineup-conflicts">${conflicts.map((conflict) => `<span class="badge ${conflict.severity}">${escapeHtml(conflict.label)}</span>`).join("")}</span>` : ""}
            </span>
            <strong>${hasHardConflict ? "prüfen" : player.qttr}</strong>
          </label>`;
        })
        .join("")}
    </div>
  </section>`;
}

function renderAvailabilitySummary(fixture) {
  const summary = fixtureAvailabilitySummary(fixture);
  return `<div class="availability-summary">
    <span class="badge ${summary.className}">${summary.yes} Zusagen</span>
    <span>${summary.maybe} vielleicht</span>
    <span>${summary.no} Absagen</span>
    <span>${summary.open} offen</span>
  </div>`;
}

function renderFixtureWarnings(fixture) {
  const warnings = fixtureCheck(fixture);
  if (!warnings.length) return "";
  return `<div class="rule-warning">${warnings.map((warning) => escapeHtml(warning.message)).join("<br>")}</div>`;
}

function renderAvailabilityControls(fixture) {
  const players = teamPlayers(fixture.teamId);
  if (!players.length) {
    return `<p class="form-note">Dieser Mannschaft sind noch keine Spieler zugeordnet.</p>`;
  }

  return `<div class="availability-list">
    ${players
      .map((player) => {
        const value = fixture.availability?.[player.id] || "open";
        return `<label class="availability-row">
          <span>${escapeHtml(player.name)}</span>
          <select data-fixture-id="${fixture.id}" data-player-id="${player.id}" aria-label="Verfügbarkeit ${escapeHtml(player.name)}">
            <option value="open" ${value === "open" ? "selected" : ""}>offen</option>
            <option value="yes" ${value === "yes" ? "selected" : ""}>Zusage</option>
            <option value="maybe" ${value === "maybe" ? "selected" : ""}>vielleicht</option>
            <option value="no" ${value === "no" ? "selected" : ""}>Absage</option>
          </select>
        </label>`;
      })
      .join("")}
  </div>`;
}

function renderBlocks() {
  if (!state.blocks.length) {
    $("#blocks-list").innerHTML = emptyState("Keine Sperrtermine eingetragen", "Erfasse Sperrtermine, damit Kalender und Terminvorschläge automatisch mitrechnen.", "Sperrtermin erstellen", "block");
    return;
  }

  const grouped = state.blocks.reduce((result, block) => {
    result[block.playerId] = result[block.playerId] || [];
    result[block.playerId].push(block);
    return result;
  }, {});

  $("#blocks-list").innerHTML = Object.entries(grouped)
    .sort(([a], [b]) => playerName(a).localeCompare(playerName(b), "de"))
    .map(([playerId, blocks]) => `<details class="block-card">
      <summary>
        <h2>${escapeHtml(playerName(playerId))}</h2>
        <span class="badge">${blocks.length} Termine</span>
      </summary>
      <div class="line-list">
        ${blocks
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((block) => `<div class="line-item block-line">
            <span>${formatDate(block.date)}</span>
            <strong>${escapeHtml(block.reason)}</strong>
            <button class="small-button edit-block" data-block-id="${block.id}" type="button">Bearbeiten</button>
          </div>`)
          .join("")}
      </div>
    </details>`)
    .join("");
}

function renderSettings() {
  const season = seasonSettings();
  $("#season-form input[name='label']").value = season.label;
  $("#season-form input[name='start']").value = season.start;
  $("#season-form input[name='end']").value = season.end;
  $("#season-form input[name='excludeHolidays']").checked = Boolean(state.settings.excludeHolidays);
  $("#season-form input[name='excludeSchoolBreaks']").checked = Boolean(state.settings.excludeSchoolBreaks);

  $("#hall-slots-list").innerHTML = (state.settings?.hallSlots || [])
    .map((slot) => `<div class="hall-slot-row" data-slot-id="${slot.id}">
      <select name="weekday" aria-label="Wochentag">
        ${weekdays
          .map((day, index) => `<option value="${index}" ${Number(slot.weekday) === index ? "selected" : ""}>${day}</option>`)
          .join("")}
      </select>
      <input name="hall" value="${escapeHtml(slot.hall)}" placeholder="Halle" aria-label="Halle" />
      <input name="court" value="${escapeHtml(slot.court || "")}" placeholder="Feld" aria-label="Feld" />
      <input name="time" value="${escapeHtml(slot.time || "")}" placeholder="Uhrzeit" aria-label="Uhrzeit" />
      <button class="icon-button remove-hall-slot" type="button" aria-label="Hallenzeit entfernen">&times;</button>
    </div>`)
    .join("");
}

function updateHallSlot(row) {
  const slot = state.settings.hallSlots.find((item) => item.id === row.dataset.slotId);
  if (!slot) return;
  slot.weekday = Number(row.querySelector("[name='weekday']").value);
  slot.hall = row.querySelector("[name='hall']").value.trim();
  slot.court = row.querySelector("[name='court']").value.trim();
  slot.time = row.querySelector("[name='time']").value.trim();
  saveState();
  renderCalendar();
}

function exportAllData() {
  downloadText(`tischtennis-spartenplaner-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), "application/json");
}

async function importAllData(file) {
  if (!file) return;
  let imported;
  try {
    const text = await readFileAsText(file);
    imported = JSON.parse(text);
  } catch (error) {
    showToast("Die Datensicherung konnte nicht gelesen werden.", "warn");
    return;
  }
  if (!imported.players || !imported.teams || !imported.fixtures || !imported.blocks) {
    showToast("Diese Datei sieht nicht wie eine Spartenplaner-Datensicherung aus.", "warn");
    return;
  }
  state = imported;
  saveState();
  state = loadState();
  render();
  showToast("Datensicherung wurde importiert.");
}

function exportPlayersCsv() {
  const rows = [["Name", "QTTR", "QTTR-Stichtag", "Status", "SPV", "Saisonnotiz"], ...state.players.map((player) => [player.name, player.qttr, player.qttrDate || "", player.status, player.manualSpv ? "ja" : "nein", player.seasonNote || ""])];
  downloadText("spieler.csv", rows.map((row) => row.map(csvEscape).join(";")).join("\n"), "text/csv");
}

function exportFixturesCsv() {
  const rows = [
    ["Mannschaft", "Gegner", "Ort", "Halle", "Hallennummer", "Spielbeginn", "Status", "Fixer Termin", "Terminvorschläge", "Aufstellung"],
    ...state.fixtures.map((fixture) => [
      teamName(fixture.teamId),
      fixture.opponent,
      venueLabel(fixture.venue),
      fixture.hall || "",
      fixture.awayHallNumber || "",
      fixture.startTime || "",
      fixtureStatusLabel(fixture.status),
      fixture.confirmedDate || "",
      fixture.preferredDates.join(", "),
      lineupPlayers(fixture).map((player) => player.name).join(", ")
    ])
  ];
  downloadText("punktspiele.csv", rows.map((row) => row.map(csvEscape).join(";")).join("\n"), "text/csv");
}

function icsDate(value) {
  return value.replaceAll("-", "");
}

function icsEscape(value) {
  return String(value || "").replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
}

function exportConfirmedFixturesCalendar() {
  const events = state.fixtures.filter((fixture) => fixture.status === "bestaetigt" && fixture.confirmedDate);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TT Spartenplaner//DE"
  ];

  events.forEach((fixture) => {
    const summary = `${teamName(fixture.teamId)} - ${fixture.opponent}`;
    const description = lineupShareText(fixture);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${fixture.id}@tt-spartenplaner`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${icsDate(fixture.confirmedDate)}`,
      `SUMMARY:${icsEscape(summary)}`,
      `DESCRIPTION:${icsEscape(description)}`,
      `LOCATION:${icsEscape(fixture.hall || (fixture.awayHallNumber ? `Halle ${fixture.awayHallNumber}` : venueLabel(fixture.venue)))}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  downloadText("bestätigte-punktspiele.ics", lines.join("\r\n"), "text/calendar");
}

function renderPrintTable(headers, rows) {
  if (!rows.length) return `<p>Keine Einträge.</p>`;
  return `<table>
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>
      ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
    </tbody>
  </table>`;
}

function calendarHintLabels(teamId, date, rowState, fixtures) {
  const schoolBreak = schoolBreakName(date);
  const holiday = holidayName(date);
  const labels = [];
  if (rowState.available >= neededPlayers()) labels.push("komplett");
  else if (rowState.missing === 1) labels.push("1 fehlt");
  else labels.push("zu wenig");
  if (holiday) labels.push(`Feiertag: ${holiday}`);
  if (schoolBreak) labels.push(`Ferien: ${schoolBreak}`);
  if (fixtures.some((fixture) => fixture.venue === "Heim" && !hasHomeHallOnDate(date))) labels.push("keine Halle");
  if (fixtures.length === 1) labels.push("Spiel");
  if (fixtures.length > 1) labels.push(`${fixtures.length} Spiele`);
  return labels.join(", ");
}

function currentCalendarPrintRows() {
  const selectedTeam = $("#calendar-team-filter").value || "all";
  const hintFilter = $("#calendar-hint-filter")?.value || "all";
  const season = seasonSettings();

  if (selectedTeam === "all") {
    return state.fixtures
      .flatMap((fixture) => fixtureDates(fixture).map((date) => ({ fixture, date })))
      .filter(({ date }) => seasonContainsDate(date))
      .filter(({ fixture, date }) => calendarMatchesHintFilter(hintFilter, date, calendarRowState(fixture.teamId, date), [fixture]))
      .sort((a, b) => a.date.localeCompare(b.date) || teamName(a.fixture.teamId).localeCompare(teamName(b.fixture.teamId), "de", { numeric: true }))
      .map(({ fixture, date }) => {
        const rowState = calendarRowState(fixture.teamId, date);
        const hall = fixture.venue === "Heim" ? fixture.hall || "keine Halle" : fixture.awayHallNumber ? `Halle ${fixture.awayHallNumber}` : "";
        return [
          String(isoWeek(date)),
          formatShortDate(date),
          teamName(fixture.teamId),
          `${venueLabel(fixture.venue)}: ${fixture.opponent}`,
          [hall, fixture.startTime ? `${fixture.startTime} Uhr` : ""].filter(Boolean).join(" - "),
          `${rowState.available}/${neededPlayers()}`,
          calendarSubstituteValue(fixture.teamId, date) || ""
        ];
      });
  }

  const dates = dateRange(season.start, season.end);
  return dates
    .filter((date) => {
      const rowState = calendarRowState(selectedTeam, date);
      const fixtures = state.fixtures.filter((fixture) => fixture.teamId === selectedTeam && fixtureDates(fixture).includes(date));
      return calendarMatchesHintFilter(hintFilter, date, rowState, fixtures);
    })
    .map((date) => {
      const rowState = calendarRowState(selectedTeam, date);
      const fixtures = state.fixtures.filter((fixture) => fixture.teamId === selectedTeam && fixtureDates(fixture).includes(date));
      return [
        String(isoWeek(date)),
        formatShortDate(date),
        teamName(selectedTeam),
        fixtures.map((fixture) => `${venueLabel(fixture.venue)}: ${fixture.opponent}`).join(", "),
        fixtures.map((fixture) => [fixture.hall || (fixture.awayHallNumber ? `Halle ${fixture.awayHallNumber}` : ""), fixture.startTime ? `${fixture.startTime} Uhr` : ""].filter(Boolean).join(" - ")).filter(Boolean).join(", "),
        `${rowState.available}/${neededPlayers()}`,
        calendarSubstituteValue(selectedTeam, date) || ""
      ];
    });
}

function printCalendarPlan() {
  const selectedTeam = $("#calendar-team-filter").value || "all";
  const hintLabel = $("#calendar-hint-filter")?.selectedOptions?.[0]?.textContent || "Alle Tage";
  const season = seasonSettings();
  const title = selectedTeam === "all" ? "Punktspiel-Planung alle Mannschaften" : `Punktspiel-Planung ${teamName(selectedTeam)}`;
  $("#print-report").innerHTML = `<div class="print-page">
    <header class="print-header">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(season.label)} - ${formatShortDate(season.start)} bis ${formatShortDate(season.end)}</p>
      <p>Filter: ${escapeHtml(hintLabel)} - Stand: ${new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}</p>
    </header>
    ${renderPrintTable(["KW", "Datum", "Mannschaft", "Spiel", "Halle / Beginn", "Verfügbar", "Ersatz"], currentCalendarPrintRows())}
  </div>`;
  window.print();
}

function buildSeasonPrintReport() {
  const season = seasonSettings();
  const checklist = planningChecklistItems().filter((item) => item.count > 0 && !isSeasonCheckDismissed(item));
  const spvRows = state.teams.flatMap((team) =>
    teamPlayers(team.id)
      .filter((player) => hasActiveSpv(team.id, player.id))
      .map((player) => [team.name, player.name, String(player.qttr), player.manualSpv ? "manuell" : "automatisch"])
  );
  const fixtureRows = state.fixtures.map((fixture) => [
    teamName(fixture.teamId),
    fixture.opponent,
    venueLabel(fixture.venue),
    fixture.hall || "",
    fixture.awayHallNumber || "",
    fixture.startTime || "",
    fixtureStatusLabel(fixture.status),
    fixturePlanningDate(fixture) ? formatShortDate(fixturePlanningDate(fixture)) : "kein Termin",
    lineupPlayers(fixture).map((player) => player.name).join(", ") || "keine Aufstellung"
  ]);

  $("#print-report").innerHTML = `<div class="print-page">
    <header class="print-header">
      <h1>Tischtennis Saisonplanung</h1>
      <p>${escapeHtml(season.label)} - ${formatShortDate(season.start)} bis ${formatShortDate(season.end)}</p>
      <p>Stand: ${new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}</p>
    </header>

    <section>
      <h2>Mannschaften</h2>
      ${state.teams
        .map((team) => {
          const players = teamPlayers(team.id);
          return `<article class="print-block">
            <h3>${escapeHtml(team.name)} - ${escapeHtml(team.league)} (${players.length}/${requiredPlayers})</h3>
            ${renderPrintTable(["#", "Name", "QTTR", "Status", "SPV"], players.map((player, index) => [
              String(index + 1),
              player.name,
              String(player.qttr),
              player.status,
              hasActiveSpv(team.id, player.id) ? "SPV" : ""
            ]))}
          </article>`;
        })
        .join("") || "<p>Keine Mannschaften angelegt.</p>"}
    </section>

    <section>
      <h2>Offene Saisonstart-Prüfungen</h2>
      ${renderPrintTable(["Prüfung", "Hinweis"], checklist.map((item) => [item.label, item.detail]))}
    </section>

    <section>
      <h2>Punktspiele</h2>
      ${renderPrintTable(["Mannschaft", "Gegner", "Ort", "Halle", "Hallennr.", "Beginn", "Status", "Termin", "Aufstellung"], fixtureRows)}
    </section>

    <section>
      <h2>SPV-Hinweise</h2>
      ${renderPrintTable(["Art", "Hinweis"], [
        ...spvRows.map((row) => ["SPV", `${row[1]} (${row[2]}) in ${row[0]} - ${row[3]}`])
      ])}
    </section>
  </div>`;
}

function printSeasonPlan() {
  buildSeasonPrintReport();
  window.print();
}

function seasonContainsDate(date) {
  const season = seasonSettings();
  return date >= season.start && date <= season.end;
}

function hasHomeHallOnDate(date) {
  const day = parseIsoDate(date).getDay();
  return homeSlots().some((slot) => slot.weekday === day);
}

function fixtureCheck(fixture) {
  const warnings = [];
  const dates = fixture.preferredDates || [];
  const mainDate = fixturePlanningDate(fixture);

  if (fixture.status === "bestaetigt" && !fixture.confirmedDate) {
    warnings.push({ message: "Bestätigtes Spiel ohne fixen Termin.", action: "fixture" });
  }

  dates.forEach((date) => {
    if (!seasonContainsDate(date)) warnings.push({ message: `Terminvorschlag ${formatShortDate(date)} liegt außerhalb des Saisonzeitraums.`, action: "settings-season" });
    const holiday = holidayName(date);
    const schoolBreak = schoolBreakName(date);
    if (holiday) {
      warnings.push({ message: `Terminvorschlag ${formatShortDate(date)} liegt auf einem Feiertag (${holiday}).`, action: "calendar-date", date });
    } else if (schoolBreak) {
      warnings.push({ message: `Terminvorschlag ${formatShortDate(date)} liegt in den Ferien (${schoolBreak}).`, action: "calendar-date", date });
    }
  });

  if (fixture.venue === "Heim" && mainDate && !hasHomeHallOnDate(mainDate)) {
    warnings.push({ message: `Heimspiel am ${formatShortDate(mainDate)} ohne eingetragene Hallenzeit.`, action: "settings-halls" });
  }

  if (mainDate) {
    const sameDay = state.fixtures.filter((item) => item.id !== fixture.id && item.teamId === fixture.teamId && fixturePlanningDate(item) === mainDate);
    if (sameDay.length) warnings.push({ message: `Weiteres Punktspiel dieser Mannschaft am ${formatShortDate(mainDate)}.`, action: "fixture" });

    const available = teamPlayers(fixture.teamId).filter((player) => isPlayerAvailableForFixture(player, fixture)).length;
    if (available < requiredPlayers) warnings.push({ message: `Nur ${available}/${requiredPlayers} Spieler am Spieltermin verfügbar.`, action: "calendar-date", date: mainDate });
  }

  const lineupCount = selectedLineupIds(fixture).length;
  if (lineupCount < requiredPlayers) warnings.push({ message: `Aufstellung nur mit ${lineupCount}/${requiredPlayers} Spielern.`, action: "fixture" });

  return warnings;
}

function allFixtureWarnings() {
  return state.fixtures.flatMap((fixture) => fixtureCheck(fixture).map((warning) => ({ fixture, ...warning })));
}

function splitPlayerImportLine(line) {
  if (line.includes(";") || line.includes(",") || line.includes("\t")) return parseCsvLine(line.replaceAll("\t", ";"));
  const match = line.trim().match(/^(.*?)\s+(\d{3,4})(?:\s+(.*))?$/);
  if (!match) return [line.trim()];
  return [match[1].trim(), match[2], ...(match[3] ? match[3].trim().split(/\s+/) : [])];
}

function normalizePlayerStatus(value, fallback = "aktiv") {
  const lower = String(value || "").toLowerCase();
  if (lower === "res") return "RES";
  if (lower === "ersatz") return "Ersatz";
  if (lower === "jugend") return "Jugend";
  if (lower === "passiv") return "passiv";
  if (lower === "aktiv") return "aktiv";
  return fallback;
}

function parsePlayerImportText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const first = splitPlayerImportLine(lines[0]).map(normalizeHeader);
  const hasHeader = first.some((value) => ["name", "spieler", "qtr", "qttr", "status", "spv", "saisonnotiz", "qttrstichtag"].includes(value));
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const indexes = {
    name: hasHeader ? first.findIndex((value) => ["name", "spieler"].includes(value)) : 0,
    qttr: hasHeader ? first.findIndex((value) => ["qttr", "qttrwert", "qtr"].includes(value)) : 1,
    qttrDate: hasHeader ? first.findIndex((value) => value === "qttrstichtag" || value === "stichtag") : -1,
    status: hasHeader ? first.findIndex((value) => value === "status") : 2,
    spv: hasHeader ? first.findIndex((value) => value === "spv" || value === "sperrvermerk") : 3,
    seasonNote: hasHeader ? first.findIndex((value) => value === "saisonnotiz" || value === "notiz") : -1
  };

  return dataLines
    .map(splitPlayerImportLine)
    .map((values) => {
      const name = values[indexes.name] || "";
      const existing = state.players.find((player) => player.name.toLowerCase() === name.toLowerCase());
      const statusValue = values[indexes.status] || existing?.status || "aktiv";
      return {
        id: existing?.id || `p${Date.now()}${Math.random().toString(16).slice(2)}`,
        action: existing ? "update" : "create",
        name,
        qttr: Number(values[indexes.qttr]) || existing?.qttr || 0,
        qttrDate: indexes.qttrDate >= 0 ? values[indexes.qttrDate] || "" : existing?.qttrDate || "",
        status: normalizePlayerStatus(statusValue, existing?.status || "aktiv"),
        manualSpv: indexes.spv >= 0 ? ["ja", "true", "1", "spv", "x"].includes(String(values[indexes.spv] || "").toLowerCase()) : Boolean(existing?.manualSpv),
        seasonNote: indexes.seasonNote >= 0 ? values[indexes.seasonNote] || "" : existing?.seasonNote || "",
        teamId: existing?.teamId || ""
      };
    })
    .filter((player) => player.name && player.qttr);
}

function previewPlayersText(text) {
  pendingPlayerImport = parsePlayerImportText(text);
  switchView("players");
  renderPlayerImportPreview();
  if (!pendingPlayerImport.length) {
    showToast("Keine gültigen Spieler in der eingefügten Liste gefunden.", "warn");
  } else {
    showToast("Import-Vorschau wurde erstellt.");
  }
}

async function previewPlayersCsv(file) {
  if (!file) return;
  const text = await readFileAsText(file);
  previewPlayersText(text);
}

function renderPlayerImportPreview() {
  const container = $("#player-import-preview");
  if (!pendingPlayerImport.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;
  container.innerHTML = `<div class="panel-head">
    <h2>Import-Vorschau</h2>
    <span class="badge">${pendingPlayerImport.length} Spieler</span>
  </div>
  <div class="table-wrap import-table-wrap">
    <table>
      <thead><tr><th>Aktion</th><th>Name</th><th>QTTR</th><th>Stichtag</th><th>Status</th><th>SPV</th><th>Notiz</th></tr></thead>
      <tbody>
        ${pendingPlayerImport
          .map((player) => `<tr>
            <td><span class="badge ${player.action === "update" ? "warn" : "ok"}">${player.action === "update" ? "aktualisieren" : "neu"}</span></td>
            <td>${escapeHtml(player.name)}</td>
            <td>${player.qttr}</td>
            <td>${escapeHtml(player.qttrDate || "")}</td>
            <td>${escapeHtml(player.status)}</td>
            <td>${player.manualSpv ? `<span class="badge warn">SPV</span>` : ""}</td>
            <td>${escapeHtml(player.seasonNote || "")}</td>
          </tr>`)
          .join("")}
      </tbody>
    </table>
  </div>
  <div class="data-actions">
    <button class="primary-button" id="apply-player-import" type="button">Import übernehmen</button>
    <button class="small-button" id="cancel-player-import" type="button">Verwerfen</button>
  </div>`;
}

function applyPlayerImport() {
  const importCount = pendingPlayerImport.length;
  const updateCount = pendingPlayerImport.filter((player) => player.action === "update").length;
  pendingPlayerImport.forEach((imported) => {
    const existing = state.players.find((player) => player.id === imported.id);
    if (existing) {
      existing.name = imported.name;
      existing.qttr = imported.qttr;
      existing.qttrDate = imported.qttrDate;
      existing.status = imported.status;
      existing.manualSpv = imported.manualSpv;
      existing.seasonNote = imported.seasonNote;
    } else {
      state.players.push(imported);
    }
  });
  addActivity("Import", `${importCount} Spieler importiert`, `${updateCount} aktualisiert, ${importCount - updateCount} neu`);
  pendingPlayerImport = [];
  saveState();
  render();
  renderPlayerImportPreview();
  showToast("Spieler-Import wurde übernommen.");
}

async function previewFixturesCsv(file) {
  if (!file) return;
  const text = await readFileAsText(file);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return;

  const first = parseCsvLine(lines[0]).map(normalizeHeader);
  const hasHeader = first.some((value) => ["mannschaft", "gegner", "ort", "status"].includes(value));
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const indexes = {
    team: hasHeader ? first.findIndex((value) => value === "mannschaft" || value === "team") : 0,
    opponent: hasHeader ? first.findIndex((value) => value === "gegner") : 1,
    venue: hasHeader ? first.findIndex((value) => value === "ort" || value === "heimauwaerts" || value === "heimauswaerts") : 2,
    hall: hasHeader ? first.findIndex((value) => value === "halle") : -1,
    awayHallNumber: hasHeader ? first.findIndex((value) => value === "hallennummer" || value === "hallennr" || value === "auswaertshallennummer") : -1,
    startTime: hasHeader ? first.findIndex((value) => value === "spielbeginn" || value === "beginn" || value === "uhrzeit") : -1,
    status: hasHeader ? first.findIndex((value) => value === "status") : 3,
    confirmedDate: hasHeader ? first.findIndex((value) => value === "fixertermin" || value === "termin") : 4,
    preferredDates: hasHeader ? first.findIndex((value) => value === "terminvorschlaege" || value === "vorschlaege") : 5
  };

  pendingFixtureImport = dataLines
    .map(parseCsvLine)
    .map((values) => {
      const teamNameValue = values[indexes.team] || "";
      const team = state.teams.find((item) => item.name.toLowerCase() === teamNameValue.toLowerCase());
      const opponent = values[indexes.opponent] || "";
      const existing = state.fixtures.find((fixture) => fixture.teamId === team?.id && fixture.opponent.toLowerCase() === opponent.toLowerCase());
      const confirmedDate = values[indexes.confirmedDate] || "";
      const preferredRaw = values[indexes.preferredDates] || "";
      const preferredDates = preferredRaw ? preferredRaw.split(",").map((date) => date.trim()).filter(Boolean) : confirmedDate ? [confirmedDate] : [];
      return {
        id: existing?.id || `f${Date.now()}${Math.random().toString(16).slice(2)}`,
        action: existing ? "update" : "create",
        teamId: team?.id || "",
        teamName: teamNameValue,
        opponent,
        venue: normalizeFixtureVenue(values[indexes.venue] || existing?.venue || "Heim"),
        hall: indexes.hall >= 0 ? values[indexes.hall] || "" : existing?.hall || "",
        awayHallNumber: indexes.awayHallNumber >= 0 ? values[indexes.awayHallNumber] || "" : existing?.awayHallNumber || "",
        startTime: indexes.startTime >= 0 ? values[indexes.startTime] || "" : existing?.startTime || "",
        status: normalizeFixtureStatus(values[indexes.status] || existing?.status || (confirmedDate ? "bestaetigt" : "offen")),
        confirmedDate,
        preferredDates,
        valid: Boolean(team?.id && opponent)
      };
    })
    .filter((fixture) => fixture.teamName || fixture.opponent);

  renderFixtureImportPreview();
}

function renderFixtureImportPreview() {
  const container = $("#fixture-import-preview");
  if (!pendingFixtureImport.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;
  container.innerHTML = `<div class="panel-head">
    <h2>Punktspiel-Import</h2>
    <span class="badge">${pendingFixtureImport.length} Spiele</span>
  </div>
  <div class="table-wrap import-table-wrap">
    <table>
      <thead><tr><th>Aktion</th><th>Mannschaft</th><th>Gegner</th><th>Ort</th><th>Halle</th><th>Hallennr.</th><th>Beginn</th><th>Status</th><th>Termine</th></tr></thead>
      <tbody>
        ${pendingFixtureImport
          .map((fixture) => `<tr>
            <td><span class="badge ${fixture.valid ? (fixture.action === "update" ? "warn" : "ok") : "danger"}">${fixture.valid ? (fixture.action === "update" ? "aktualisieren" : "neu") : "ungültig"}</span></td>
            <td>${escapeHtml(fixture.teamName)}</td>
            <td>${escapeHtml(fixture.opponent)}</td>
            <td>${escapeHtml(venueLabel(fixture.venue))}</td>
            <td>${escapeHtml(fixture.hall || "")}</td>
            <td>${escapeHtml(fixture.awayHallNumber || "")}</td>
            <td>${escapeHtml(fixture.startTime || "")}</td>
            <td>${escapeHtml(fixtureStatusLabel(fixture.status))}</td>
            <td>${escapeHtml(fixture.preferredDates.join(", "))}</td>
          </tr>`)
          .join("")}
      </tbody>
    </table>
  </div>
  <div class="data-actions">
    <button class="primary-button" id="apply-fixture-import" type="button">Import übernehmen</button>
    <button class="small-button" id="cancel-fixture-import" type="button">Verwerfen</button>
  </div>`;
}

function applyFixtureImport() {
  const validFixtures = pendingFixtureImport.filter((fixture) => fixture.valid);
  const updateCount = validFixtures.filter((fixture) => fixture.action === "update").length;
  validFixtures.forEach((imported) => {
    const existing = state.fixtures.find((fixture) => fixture.id === imported.id);
    const normalizedDates = normalizeFixtureDates(imported.preferredDates, imported.confirmedDate, imported.status);
    const fixtureData = {
      id: imported.id,
      teamId: imported.teamId,
      opponent: imported.opponent,
      venue: imported.venue,
      hall: imported.hall || "",
      awayHallNumber: imported.awayHallNumber || "",
      startTime: imported.startTime || "",
      status: imported.status,
      confirmedDate: normalizedDates.confirmedDate,
      preferredDates: normalizedDates.preferredDates,
      availability: existing?.availability || {},
      lineup: existing?.lineup || []
    };
    if (existing) {
      Object.assign(existing, fixtureData);
    } else {
      state.fixtures.push(fixtureData);
    }
  });
  addActivity("Import", `${validFixtures.length} Punktspiele importiert`, `${updateCount} aktualisiert, ${validFixtures.length - updateCount} neu`);
  pendingFixtureImport = [];
  saveState();
  render();
  renderFixtureImportPreview();
  showToast("Punktspiel-Import wurde übernommen.");
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  $("#view-title").textContent = views[viewId];
}

function handlePlanningAction(button) {
  const action = button.dataset.action;
  if (action === "players-missing-qttr") {
    const target = firstSeasonCheckTarget(action);
    if (target) {
      switchView("players");
      renderPlayers();
      openPlayerDialog(target.id);
      showToast("Erster Spieler ohne QTTR wurde geöffnet.", "warn");
      return;
    }
    switchView("players");
    $("#player-search").value = "";
    $("#player-team-filter").value = "all";
    $("#player-status-filter").value = "all";
    $("#player-sort").value = "qttr-asc";
    renderPlayers();
    showToast("Spieler mit fehlendem QTTR stehen oben.", "warn");
    return;
  }
  if (action === "players-duplicate-names") {
    const target = firstSeasonCheckTarget(action);
    if (target) {
      switchView("players");
      renderPlayers();
      openPlayerDialog(target.id);
      showToast(`Doppelter Name wurde geöffnet: ${target.name}`, "warn");
      return;
    }
    const duplicateName = duplicatePlayerNameGroups()[0]?.[0]?.name || "";
    switchView("players");
    $("#player-search").value = duplicateName;
    $("#player-team-filter").value = "all";
    $("#player-status-filter").value = "all";
    $("#player-sort").value = "name-asc";
    renderPlayers();
    showToast(duplicateName ? `Doppelter Name wird angezeigt: ${duplicateName}` : "Spielerliste geöffnet.", "warn");
    return;
  }
  if (action === "players-missing-status") {
    const target = firstSeasonCheckTarget(action);
    if (target) {
      switchView("players");
      renderPlayers();
      openPlayerDialog(target.id);
      showToast("Erster Spieler ohne Status wurde geöffnet.", "warn");
      return;
    }
    switchView("players");
    $("#player-search").value = "";
    $("#player-team-filter").value = "all";
    $("#player-status-filter").value = "all";
    $("#player-sort").value = "status-asc";
    renderPlayers();
    showToast("Spieler ohne Status stehen oben.", "warn");
    return;
  }
  if (action === "players-unassigned") {
    switchView("players");
    $("#player-search").value = "";
    $("#player-team-filter").value = "";
    $("#player-status-filter").value = "all";
    $("#player-sort").value = "qttr-desc";
    renderPlayers();
    showToast("Spieler ohne Mannschaft werden angezeigt.", "warn");
    return;
  }
  if (action === "player-status-review") {
    switchView("players");
    $("#player-team-filter").value = "all";
    $("#player-status-filter").value = "all";
    $("#player-sort").value = "status-asc";
    renderPlayers();
    showToast("Spielerliste nach Status sortiert.", "warn");
    return;
  }
  if (action === "teams-small" || action === "teams-missing-league") {
    const target = firstSeasonCheckTarget(action);
    if (target) {
      switchView("teams");
      renderTeams();
      openTeamDialog(target.id);
      showToast(action === "teams-small" ? "Erste zu kleine Mannschaft wurde geöffnet." : "Erste Mannschaft ohne Liga wurde geöffnet.", "warn");
      return;
    }
  }
  if (action === "spv" || action === "ttvn") {
    switchView("teams");
    showToast("Mannschaften und TTVN-Prüfung geöffnet.", "ok");
    return;
  }
  if (action === "fixtures-without-date" || action === "fixtures-missing-hall" || action === "fixtures-missing-start" || action === "fixture-low-availability") {
    const target = firstSeasonCheckTarget(action);
    if (target) {
      switchView("fixtures");
      $("#fixture-team-filter").value = "all";
      $("#fixture-status-filter").value = "all";
      renderFixtures();
      openFixtureDialog(target.id);
      showToast("Erstes betroffenes Punktspiel wurde geöffnet.", "warn");
      return;
    }
    switchView("fixtures");
    $("#fixture-team-filter").value = "all";
    $("#fixture-status-filter").value = "all";
    renderFixtures();
    showToast("Punktspiele zur Prüfung geöffnet.", "warn");
    return;
  }
  if (action === "blocks-missing-reason") {
    const target = firstSeasonCheckTarget(action);
    if (target) {
      switchView("blocks");
      renderBlocks();
      openBlockDialog(target.id);
      showToast("Erster Sperrtermin ohne Grund wurde geöffnet.", "warn");
      return;
    }
    switchView("blocks");
    showToast("Sperrtermine zur Prüfung geöffnet.", "warn");
    return;
  }
  if (action === "team") {
    openTeamDialog(button.dataset.teamId);
    return;
  }
  if (action === "player") {
    openPlayerDialog(button.dataset.playerId);
    return;
  }
  if (action === "players") {
    switchView("players");
    $("#player-team-filter").value = "all";
    $("#player-status-filter").value = "all";
    renderPlayers();
    return;
  }
  if (action === "fixtures") {
    switchView("fixtures");
    $("#fixture-team-filter").value = "all";
    $("#fixture-status-filter").value = "all";
    renderFixtures();
    return;
  }
  if (action === "blocks") {
    switchView("blocks");
    return;
  }
  if (action === "fixture") {
    switchView("fixtures");
    $("#fixture-status-filter").value = "all";
    renderFixtures();
    openFixtureDialog(button.dataset.fixtureId);
    return;
  }
  if (action === "settings-season") {
    switchView("settings");
    $("#season-form").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "settings-halls") {
    switchView("settings");
    $("#hall-slots-list").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "teams") {
    switchView("teams");
    return;
  }
  if (action === "calendar" || action === "calendar-date") {
    switchView("calendar");
    if (button.dataset.teamId) $("#calendar-team-filter").value = button.dataset.teamId;
    renderCalendar();
    if (button.dataset.date) {
      const target = document.querySelector(`[data-calendar-date="${button.dataset.date}"]`);
      if (target) {
        target.classList.add("focus-row");
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => target.classList.remove("focus-row"), 1800);
      }
    }
  }
}

function renderPlayerRelationshipPicker(player, fieldName, selectedIds, emptyText) {
  if (!player) return `<p class="form-note">${emptyText}</p>`;
  const otherPlayers = state.players.filter((item) => item.id !== player.id).sort((a, b) => a.name.localeCompare(b.name, "de"));
  if (!otherPlayers.length) return `<p class="form-note">Noch keine weiteren Spieler vorhanden.</p>`;
  return otherPlayers
    .map((otherPlayer) => `<label class="check-row">
      <input type="checkbox" name="${fieldName}" value="${otherPlayer.id}" ${selectedIds.includes(otherPlayer.id) ? "checked" : ""}>
      <span>${escapeHtml(otherPlayer.name)}</span>
      <strong>${otherPlayer.qttr}</strong>
    </label>`)
    .join("");
}

function renderDynamicFields() {
  const type = $("#entry-type").value;
  const teamOptions = state.teams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join("");
  const playerOptions = state.players.map((player) => `<option value="${player.id}">${escapeHtml(player.name)}</option>`).join("");
  const player = editingPlayerId ? state.players.find((item) => item.id === editingPlayerId) : null;
  const team = editingTeamId ? state.teams.find((item) => item.id === editingTeamId) : null;
  const fixture = editingFixtureId ? state.fixtures.find((item) => item.id === editingFixtureId) : null;
  const block = editingBlockId ? state.blocks.find((item) => item.id === editingBlockId) : null;
  if (editingTeamId) syncTeamOrder(editingTeamId);
  const selectedPlayerIds = new Set(state.players.filter((player) => player.teamId === editingTeamId).map((player) => player.id));
  const leagues = team?.league && !ttvnLeagues.includes(team.league) ? [...ttvnLeagues, team.league] : ttvnLeagues;
  const leagueOptions = leagues.map((league) => `<option ${team?.league === league ? "selected" : ""}>${escapeHtml(league)}</option>`).join("");
  const fixtureHall = fixture?.hall || "";
  const awayHallNumberOptions = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    .map((number) => `<option value="${number}" ${fixture?.awayHallNumber === number ? "selected" : ""}>${number || "Keine Nummer"}</option>`)
    .join("");
  const hallOptions = [
    `<option value="">Keine Halle</option>`,
    ...availableHallOptions().map((option) => `<option value="${escapeHtml(option.value)}" ${fixtureHall === option.value ? "selected" : ""}>${escapeHtml(option.value)}</option>`)
  ].join("");

  const templates = {
    player: `<label>Name<input required name="name" value="${player ? escapeHtml(player.name) : ""}" placeholder="Vorname Nachname"></label>
      <label>QTTR<input required name="qttr" type="number" min="0" max="3000" value="${player ? player.qttr : 1400}"></label>
      <label>QTTR-Stichtag<input name="qttrDate" type="date" value="${player?.qttrDate || ""}"></label>
      <label>Status<select name="status"><option ${player?.status === "aktiv" ? "selected" : ""}>aktiv</option><option ${player?.status === "RES" ? "selected" : ""}>RES</option><option ${player?.status === "Ersatz" ? "selected" : ""}>Ersatz</option><option ${player?.status === "Jugend" ? "selected" : ""}>Jugend</option><option ${player?.status === "passiv" ? "selected" : ""}>passiv</option></select></label>
      <label>Saisonnotiz<input name="seasonNote" value="${player ? escapeHtml(player.seasonNote || "") : ""}" placeholder="z. B. Rückrunde, Verletzung, nur Ersatz"></label>
      <label class="inline-toggle form-toggle"><input name="manualSpv" type="checkbox" ${player?.manualSpv ? "checked" : ""}>SPV für diesen Spieler setzen</label>
      <fieldset class="player-picker relationship-picker">
        <legend>Zusammen mit</legend>
        ${renderPlayerRelationshipPicker(player, "preferWithIds", player?.preferWithIds || [], "Beziehungen sind nach dem ersten Speichern verfügbar.")}
      </fieldset>
      <fieldset class="player-picker relationship-picker">
        <legend>Nicht zusammen mit</legend>
        ${renderPlayerRelationshipPicker(player, "avoidWithIds", player?.avoidWithIds || [], "Beziehungen sind nach dem ersten Speichern verfügbar.")}
      </fieldset>
      <p class="form-note">Die Mannschaftszuordnung erfolgt ausschliesslich unter Mannschaften.</p>`,
    team: `<label>Name<input required name="name" value="${team ? escapeHtml(team.name) : escapeHtml(nextTeamName())}" placeholder="z. B. 4. Herren"></label>
      <label>Liga<select required name="league">${leagueOptions}</select></label>
      <fieldset class="player-picker">
        <legend>Spieler auswählen</legend>
        ${state.players
          .slice()
          .sort((a, b) => b.qttr - a.qttr)
          .map((player) => {
            const lockedByOtherTeam = player.teamId && player.teamId !== editingTeamId;
            return `<label class="check-row ${lockedByOtherTeam ? "is-disabled" : ""}">
            <input type="checkbox" name="playerIds" value="${player.id}" ${selectedPlayerIds.has(player.id) ? "checked" : ""} ${lockedByOtherTeam ? "disabled" : ""}>
            <span>${escapeHtml(player.name)}</span>
            <strong>${lockedByOtherTeam ? escapeHtml(teamName(player.teamId)) : player.qttr}</strong>
          </label>`;
          })
          .join("")}
      </fieldset>
      <div class="order-editor">
        <strong>Reihenfolge</strong>
        <div id="team-order-list">${renderTeamOrderEditor(editingTeamId)}</div>
      </div>
      <div id="team-rule-preview" class="rule-preview"></div>
      <p class="form-note">Eine Mannschaft braucht mindestens 4 Spieler. Mehr sind möglich.</p>`,
    fixture: `<label>Mannschaft<select name="teamId">${teamOptions}</select></label>
      <label>Gegner<input required name="opponent" value="${fixture ? escapeHtml(fixture.opponent) : ""}" placeholder="Verein / Mannschaft"></label>
      <label>Ort<select name="venue">
        <option value="Heim" ${fixture?.venue === "Heim" ? "selected" : ""}>Heim</option>
        <option value="Auswaerts" ${fixture?.venue === "Auswaerts" ? "selected" : ""}>Auswärts</option>
      </select></label>
      <label data-fixture-field="home-hall">Halle<select name="hall">${hallOptions}</select></label>
      <label data-fixture-field="away-hall-number">Hallennummer Auswärts<select name="awayHallNumber">${awayHallNumberOptions}</select></label>
      <label>Spielbeginn<input name="startTime" type="time" value="${fixture?.startTime || defaultTimeForHall(fixtureHall)}"></label>
      <label>Status<select name="status">
        <option value="offen" ${fixture?.status === "offen" ? "selected" : ""}>Offen</option>
        <option value="geplant" ${fixture?.status === "geplant" ? "selected" : ""}>Geplant</option>
        <option value="bestaetigt" ${fixture?.status === "bestaetigt" ? "selected" : ""}>Bestätigt</option>
      </select></label>
      <label>Terminvorschläge<input required name="preferredDates" value="${fixture ? escapeHtml(fixture.preferredDates.join(", ")) : ""}" placeholder="2026-09-18, 2026-09-20"></label>
      <div class="date-picker-row">
        <label>Datum auswählen<input name="fixtureDatePicker" type="date" min="${seasonSettings().start}" max="${seasonSettings().end}"></label>
        <button class="small-button add-fixture-date" type="button">Datum hinzufügen</button>
      </div>
      <input name="fixtureCalendarMonth" type="hidden" value="${escapeHtml((fixture?.preferredDates?.[0] || seasonSettings().start).slice(0, 7))}">
      <div id="fixture-mini-calendar" class="fixture-mini-calendar"></div>
      <div id="fixture-date-preview" class="fixture-date-preview"></div>
      <div id="fixture-date-chips" class="fixture-date-chips"></div>`,
    block: `<label>Spieler<select name="playerId">${playerOptions}</select></label>
      <label>Von<input required name="dateStart" type="date" value="${block ? block.date : ""}"></label>
      <label>Bis<input required name="dateEnd" type="date" value="${block ? block.date : ""}"></label>
      <label>Grund<input required name="reason" value="${block ? escapeHtml(block.reason) : ""}" placeholder="Urlaub, Dienst, Turnier"></label>`
  };

  $("#dynamic-fields").innerHTML = templates[type];
  if (type === "fixture" && fixture) {
    $("#dynamic-fields select[name='teamId']").value = fixture.teamId;
  }
  if (type === "fixture") {
    updateFixtureVenueFields();
    renderFixtureDateChips();
  }
  if (type === "block" && block) {
    $("#dynamic-fields select[name='playerId']").value = block.playerId;
  }
  if (type === "team") {
    renderTeamRulePreview();
  }
}

function updateFixtureVenueFields() {
  const venueSelect = $("#dynamic-fields select[name='venue']");
  const homeHallField = $("#dynamic-fields [data-fixture-field='home-hall']");
  const awayHallField = $("#dynamic-fields [data-fixture-field='away-hall-number']");
  if (!venueSelect || !homeHallField || !awayHallField) return;
  const isAway = venueSelect.value === "Auswaerts";
  homeHallField.hidden = isAway;
  awayHallField.hidden = !isAway;
}

function fixtureDateInput() {
  return $("#dynamic-fields input[name='preferredDates']");
}

function fixtureDateValues() {
  const input = fixtureDateInput();
  if (!input) return [];
  return [...new Set(input.value.split(",").map((date) => date.trim()).filter(Boolean))].sort();
}

function setFixtureDateValues(dates) {
  const input = fixtureDateInput();
  if (!input) return;
  input.value = [...new Set(dates.filter(Boolean))].sort().join(", ");
  renderFixtureDateChips();
}

function renderFixtureDateChips() {
  const container = $("#fixture-date-chips");
  if (!container) return;
  const dates = fixtureDateValues();
  container.innerHTML = dates.length
    ? dates.map((date) => `<button class="date-chip remove-fixture-date" data-date="${date}" type="button">${formatShortDate(date)} <span>x</span></button>`).join("")
    : `<span class="form-note">Noch keine Terminvorschläge ausgewählt.</span>`;
  renderFixtureDatePreview();
  renderFixtureMiniCalendar();
}

function addFixtureDateFromPicker() {
  const picker = $("#dynamic-fields input[name='fixtureDatePicker']");
  if (!picker?.value) return;
  setFixtureDateValues([...fixtureDateValues(), picker.value]);
  picker.value = "";
  renderFixtureDatePreview();
  renderFixtureMiniCalendar();
}

function fixtureCalendarMonthInput() {
  return $("#dynamic-fields input[name='fixtureCalendarMonth']");
}

function fixtureCalendarMonthValue() {
  const input = fixtureCalendarMonthInput();
  const pickerDate = $("#dynamic-fields input[name='fixtureDatePicker']")?.value || "";
  const fallback = pickerDate || fixtureDateValues()[0] || seasonSettings().start;
  return input?.value || fallback.slice(0, 7);
}

function setFixtureCalendarMonth(value) {
  const input = fixtureCalendarMonthInput();
  if (input) input.value = value;
  renderFixtureMiniCalendar();
}

function shiftFixtureCalendarMonth(direction) {
  const [year, month] = fixtureCalendarMonthValue().split("-").map(Number);
  const date = new Date(year, month - 1 + direction, 1);
  setFixtureCalendarMonth(toIsoDate(date).slice(0, 7));
}

function fixtureDialogTeamId() {
  return $("#dynamic-fields select[name='teamId']")?.value || "";
}

function fixtureDialogVenue() {
  return $("#dynamic-fields select[name='venue']")?.value || "Heim";
}

function fixtureDatePreviewItems() {
  const dates = fixtureDateValues().map((date) => ({ date, pending: false }));
  const pickerDate = $("#dynamic-fields input[name='fixtureDatePicker']")?.value || "";
  if (pickerDate && !dates.some((item) => item.date === pickerDate)) dates.unshift({ date: pickerDate, pending: true });
  return dates;
}

function fixtureDateAssessment(teamId, date) {
  const stateForDate = calendarRowState(teamId, date);
  let className = stateForDate.available >= neededPlayers() ? "ok" : stateForDate.missing === 1 ? "warn" : "danger";
  const notes = [];
  const holiday = holidayName(date);
  const schoolBreak = schoolBreakName(date);
  const missingHomeHall = fixtureDialogVenue() === "Heim" && !hasHomeHallOnDate(date);
  if (holiday) notes.push(`Feiertag: ${holiday}`);
  if (schoolBreak) notes.push(`Ferien: ${schoolBreak}`);
  if (teamHasOtherFixtureOnDate(teamId, date, editingFixtureId || "")) notes.push("bereits Punktspiel an diesem Tag");
  if (missingHomeHall) notes.push("keine Heim-Hallenzeit");
  if (!seasonContainsDate(date)) notes.push("außerhalb des Saisonzeitraums");
  if (missingHomeHall && className === "ok") className = "warn";
  return { ...stateForDate, className, notes };
}

function renderFixtureMiniCalendar() {
  const container = $("#fixture-mini-calendar");
  if (!container) return;
  const teamId = fixtureDialogTeamId();
  const [year, month] = fixtureCalendarMonthValue().split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = (first.getDay() + 6) % 7;
  const selectedDates = new Set(fixtureDateValues());
  const pickedDate = $("#dynamic-fields input[name='fixtureDatePicker']")?.value || "";
  const cells = [];

  for (let index = 0; index < leadingBlanks; index += 1) {
    cells.push(`<span class="mini-calendar-empty"></span>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const assessment = teamId ? fixtureDateAssessment(teamId, date) : { className: "warn", notes: [] };
    const holiday = holidayName(date);
    const schoolBreak = schoolBreakName(date);
    const hasFixture = teamId ? teamHasOtherFixtureOnDate(teamId, date, editingFixtureId || "") : false;
    const missingHomeHall = fixtureDialogVenue() === "Heim" && !hasHomeHallOnDate(date);
    const titleParts = [
      `${formatShortDate(date)}: ${assessment.available ?? 0}/${neededPlayers()} Spieler`,
      ...(assessment.notes || [])
    ];
    const classes = [
      "mini-calendar-day",
      `mini-calendar-${assessment.className}`,
      selectedDates.has(date) ? "is-selected" : "",
      pickedDate === date ? "is-picked" : "",
      holiday ? "has-holiday" : "",
      schoolBreak ? "has-school-break" : "",
      hasFixture ? "has-fixture" : "",
      missingHomeHall ? "has-no-hall" : ""
    ].filter(Boolean).join(" ");
    cells.push(`<button class="${classes}" data-date="${date}" title="${escapeHtml(titleParts.join(" | "))}" type="button"><span>${day}</span>${hasFixture ? `<strong aria-label="Punktspiel eingetragen">!</strong>` : ""}${missingHomeHall ? `<em aria-label="Keine Heim-Hallenzeit">H</em>` : ""}</button>`);
  }

  container.innerHTML = `<div class="mini-calendar-head">
    <button class="icon-button mini-calendar-prev" type="button" aria-label="Vorheriger Monat">&lt;</button>
    <strong>${new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(first)}</strong>
    <button class="icon-button mini-calendar-next" type="button" aria-label="Nächster Monat">&gt;</button>
  </div>
  <div class="mini-calendar-weekdays">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => `<span>${day}</span>`).join("")}</div>
  <div class="mini-calendar-grid">${cells.join("")}</div>
  <div class="mini-calendar-legend">
    <span class="legend-dot mini-calendar-ok"></span>komplett
    <span class="legend-dot mini-calendar-warn"></span>1 fehlt
    <span class="legend-dot mini-calendar-danger"></span>zu wenig
    <span class="legend-fixture">!</span>Punktspiel
    <span class="legend-no-hall">H</span>keine Halle
  </div>`;
}

function renderFixtureDatePreview() {
  const container = $("#fixture-date-preview");
  if (!container) return;
  const teamId = fixtureDialogTeamId();
  const items = fixtureDatePreviewItems();
  if (!teamId || !items.length) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = items
    .map((item) => {
      if (!isValidIsoDate(item.date)) {
        return `<div class="date-assessment date-assessment-danger">
          <strong>${escapeHtml(item.date)}</strong>
          <span>Bitte Datum im Format JJJJ-MM-TT eintragen.</span>
        </div>`;
      }
      const assessment = fixtureDateAssessment(teamId, item.date);
      return `<div class="date-assessment date-assessment-${assessment.className}">
        <strong>${item.pending ? "Auswahl" : "Vorschlag"}: ${formatShortDate(item.date)}</strong>
        <span>${assessment.available}/${neededPlayers()} Spieler verfügbar${assessment.missing ? `, ${assessment.missing} fehlen` : ""}</span>
        ${assessment.notes.length ? `<small>${assessment.notes.map(escapeHtml).join(" | ")}</small>` : `<small>keine Zusatzhinweise</small>`}
      </div>`;
    })
    .join("");
}

function renderTeamOrderEditor(teamId) {
  if (!teamId) return `<p class="form-note">Reihenfolge ist nach dem ersten Speichern verfügbar.</p>`;
  const players = teamPlayers(teamId);
  if (!players.length) return `<p class="form-note">Noch keine Spieler in dieser Mannschaft.</p>`;
  return players
    .map((player, index) => `<div class="order-row" data-player-id="${player.id}">
      <span>${index + 1}. ${escapeHtml(player.name)}</span>
      <strong>${player.qttr}</strong>
      <button class="icon-button move-player-up" type="button" aria-label="${escapeHtml(player.name)} nach oben" ${index === 0 ? "disabled" : ""}>^</button>
      <button class="icon-button move-player-down" type="button" aria-label="${escapeHtml(player.name)} nach unten" ${index === players.length - 1 ? "disabled" : ""}>v</button>
    </div>`)
    .join("");
}

function moveTeamPlayer(playerId, direction) {
  if (!editingTeamId) return;
  const team = state.teams.find((item) => item.id === editingTeamId);
  if (!team) return;
  syncTeamOrder(editingTeamId);
  const index = team.playerOrder.indexOf(playerId);
  const nextIndex = index + direction;
  if (index === -1 || nextIndex < 0 || nextIndex >= team.playerOrder.length) return;
  [team.playerOrder[index], team.playerOrder[nextIndex]] = [team.playerOrder[nextIndex], team.playerOrder[index]];
  saveState();
  $("#team-order-list").innerHTML = renderTeamOrderEditor(editingTeamId);
  renderTeamRulePreview();
}

function renderTeamRulePreview() {
  const preview = $("#team-rule-preview");
  if (!preview) return;
  const selectedIds = [...document.querySelectorAll("#dynamic-fields input[name='playerIds']:checked")].map((input) => input.value);
  const check = ttvnTeamCheck(editingTeamId || "", selectedIds);
  preview.innerHTML = check.warnings.length
    ? `<strong>TTVN-Hinweise</strong><span>${check.warnings.map(escapeHtml).join("<br>")}</span>`
    : `<strong>TTVN-Hinweise</strong><span>Auswahl intern unauffällig.</span>`;
}

function confirmFixtureCalendarExceptions(dates) {
  const uniqueDates = [...new Set(dates.filter(Boolean))];
  const holidayDates = uniqueDates
    .map((date) => ({ date, name: holidayName(date) }))
    .filter((item) => item.name);
  if (holidayDates.length) {
    const text = holidayDates.map((item) => `${formatShortDate(item.date)} (${item.name})`).join("\n");
    if (!confirm(`Mindestens ein Terminvorschlag liegt auf einem Feiertag:\n\n${text}\n\nTrotzdem speichern?`)) return false;
  }

  const schoolBreakDates = uniqueDates
    .map((date) => ({ date, name: schoolBreakName(date) }))
    .filter((item) => item.name && !holidayName(item.date));
  if (schoolBreakDates.length) {
    const text = schoolBreakDates.map((item) => `${formatShortDate(item.date)} (${item.name})`).join("\n");
    if (!confirm(`Mindestens ein Terminvorschlag liegt in den Ferien:\n\n${text}\n\nTrotzdem speichern?`)) return false;
  }

  return true;
}

function nextTeamName() {
  const numbers = state.teams
    .map((team) => team.name.match(/^\s*(\d+)\./))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  const nextNumber = numbers.length ? Math.max(...numbers) + 1 : state.teams.length + 1;
  return `${nextNumber}. Mannschaft`;
}

function setPlayerRelation(listName, playerId, partnerId, enabled) {
  const player = state.players.find((item) => item.id === playerId);
  if (!player || playerId === partnerId) return;
  player[listName] = player[listName] || [];
  if (enabled && !player[listName].includes(partnerId)) {
    player[listName].push(partnerId);
  }
  if (!enabled) {
    player[listName] = player[listName].filter((id) => id !== partnerId);
  }
}

function syncPlayerRelationships(playerId, preferIds, avoidIds) {
  const player = state.players.find((item) => item.id === playerId);
  if (!player) return;
  const validIds = new Set(state.players.filter((item) => item.id !== playerId).map((item) => item.id));
  const preferSet = new Set(preferIds.filter((id) => validIds.has(id)));
  const avoidSet = new Set(avoidIds.filter((id) => validIds.has(id) && !preferSet.has(id)));
  const oldPrefer = new Set(player.preferWithIds || []);
  const oldAvoid = new Set(player.avoidWithIds || []);

  oldPrefer.forEach((partnerId) => setPlayerRelation("preferWithIds", partnerId, playerId, false));
  oldAvoid.forEach((partnerId) => setPlayerRelation("avoidWithIds", partnerId, playerId, false));

  player.preferWithIds = [...preferSet];
  player.avoidWithIds = [...avoidSet];

  preferSet.forEach((partnerId) => {
    setPlayerRelation("preferWithIds", partnerId, playerId, true);
    setPlayerRelation("avoidWithIds", partnerId, playerId, false);
    setPlayerRelation("avoidWithIds", playerId, partnerId, false);
  });

  avoidSet.forEach((partnerId) => {
    setPlayerRelation("avoidWithIds", partnerId, playerId, true);
    setPlayerRelation("preferWithIds", partnerId, playerId, false);
    setPlayerRelation("preferWithIds", playerId, partnerId, false);
  });
}

function addEntry(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  const type = $("#entry-type").value;
  const id = `${type[0]}${Date.now()}`;

  if (type === "player") {
    const playerId = editingPlayerId || id;
    const existingPlayer = state.players.find((playerItem) => playerItem.id === playerId);
    const playerData = { id: playerId, name: data.name, qttr: Number(data.qttr), qttrDate: data.qttrDate || "", status: data.status, seasonNote: data.seasonNote || "", manualSpv: formData.has("manualSpv"), preferWithIds: existingPlayer?.preferWithIds || [], avoidWithIds: existingPlayer?.avoidWithIds || [], teamId: existingPlayer?.teamId || "" };
    if (existingPlayer) {
      Object.assign(existingPlayer, playerData);
      addActivity("Spieler", `${playerData.name} geändert`, `Status ${playerData.status}, QTTR ${playerData.qttr}`);
    } else {
      state.players.push(playerData);
      addActivity("Spieler", `${playerData.name} angelegt`, `Status ${playerData.status}, QTTR ${playerData.qttr}`);
    }
    syncPlayerRelationships(playerId, formData.getAll("preferWithIds"), formData.getAll("avoidWithIds"));
  }

  if (type === "team") {
    const playerIds = formData.getAll("playerIds");
    const teamId = editingTeamId || id;
    const targetSize = requiredPlayers;
    const existingTeam = state.teams.find((teamItem) => teamItem.id === teamId);

    if (existingTeam) {
      existingTeam.name = data.name;
      existingTeam.league = data.league;
      existingTeam.targetSize = targetSize;
      existingTeam.playerOrder = [...(existingTeam.playerOrder || []).filter((playerId) => playerIds.includes(playerId)), ...playerIds.filter((playerId) => !(existingTeam.playerOrder || []).includes(playerId))];
      addActivity("Mannschaft", `${data.name} geändert`, `${data.league}, ${playerIds.length}/${requiredPlayers} Spieler`);
    } else {
      state.teams.push({ id: teamId, name: data.name, league: data.league, targetSize, playerOrder: playerIds });
      addActivity("Mannschaft", `${data.name} angelegt`, `${data.league}, ${playerIds.length}/${requiredPlayers} Spieler`);
    }

    state.players.forEach((player) => {
      if (playerIds.includes(player.id)) {
        player.teamId = teamId;
      } else if (player.teamId === teamId) {
        player.teamId = "";
      }
    });
  }

  if (type === "fixture") {
    const fixtureId = editingFixtureId || id;
    const existingFixture = state.fixtures.find((fixtureItem) => fixtureItem.id === fixtureId);
    const status = data.status || "offen";
    const normalizedDates = normalizeFixtureDates(data.preferredDates.split(","), existingFixture?.confirmedDate || "", status);
    if (!confirmFixtureCalendarExceptions(normalizedDates.preferredDates)) return false;
    const fixtureData = {
      id: fixtureId,
      teamId: data.teamId,
      opponent: data.opponent,
      venue: data.venue,
      hall: data.venue === "Heim" ? data.hall || "" : "",
      awayHallNumber: data.venue === "Auswaerts" ? data.awayHallNumber || "" : "",
      startTime: data.startTime || "",
      status,
      preferredDates: normalizedDates.preferredDates,
      confirmedDate: normalizedDates.confirmedDate,
      lineup: existingFixture?.lineup || [],
      availability: availabilityForTeam(existingFixture?.availability, data.teamId)
    };

    if (existingFixture) {
      Object.assign(existingFixture, fixtureData);
      addActivity("Punktspiel", `${teamName(fixtureData.teamId)} gegen ${fixtureData.opponent} geändert`, `${venueLabel(fixtureData.venue)}, ${fixturePlanningDate(fixtureData) ? formatShortDate(fixturePlanningDate(fixtureData)) : "ohne Termin"}`);
    } else {
      state.fixtures.push(fixtureData);
      addActivity("Punktspiel", `${teamName(fixtureData.teamId)} gegen ${fixtureData.opponent} angelegt`, `${venueLabel(fixtureData.venue)}, ${fixturePlanningDate(fixtureData) ? formatShortDate(fixturePlanningDate(fixtureData)) : "ohne Termin"}`);
    }
  }

  if (type === "block") {
    const blockId = editingBlockId || id;
    const existingBlock = state.blocks.find((blockItem) => blockItem.id === blockId);
    const blockDates = inclusiveDateRange(data.dateStart || data.date, data.dateEnd);
    const blockData = { id: blockId, playerId: data.playerId, date: blockDates[0], reason: data.reason };
    if (existingBlock) {
      Object.assign(existingBlock, blockData);
      blockDates.slice(1).forEach((date, index) => state.blocks.push({ id: `b${Date.now()}${index}`, playerId: data.playerId, date, reason: data.reason }));
      addActivity("Sperrtermin", `${playerName(blockData.playerId)} geändert`, `${blockDates.length} Termin${blockDates.length === 1 ? "" : "e"} - ${blockData.reason || "ohne Grund"}`);
    } else {
      blockDates.forEach((date, index) => state.blocks.push({ id: `b${Date.now()}${index}`, playerId: data.playerId, date, reason: data.reason }));
      addActivity("Sperrtermin", `${playerName(blockData.playerId)} angelegt`, `${blockDates.length} Termin${blockDates.length === 1 ? "" : "e"} - ${blockData.reason || "ohne Grund"}`);
    }
  }

  saveState();
  render();
  return true;
}

function handleEmptyAction(action) {
  if (action === "player") openPlayerDialog();
  if (action === "team") openTeamDialog();
  if (action === "fixture") openFixtureDialog();
  if (action === "block") openBlockDialog();
}

function cleanupPlayerReferences(playerIds) {
  state.players.forEach((player) => {
    player.preferWithIds = (player.preferWithIds || []).filter((playerId) => !playerIds.has(playerId));
    player.avoidWithIds = (player.avoidWithIds || []).filter((playerId) => !playerIds.has(playerId));
  });
  state.blocks = state.blocks.filter((block) => !playerIds.has(block.playerId));
  state.fixtures.forEach((fixture) => {
    fixture.lineup = (fixture.lineup || []).filter((playerId) => !playerIds.has(playerId));
    playerIds.forEach((playerId) => {
      if (fixture.availability) delete fixture.availability[playerId];
    });
  });
  Object.values(state.calendarAvailability || {}).forEach((teamDays) => {
    Object.values(teamDays).forEach((dayValues) => {
      playerIds.forEach((playerId) => delete dayValues[playerId]);
    });
  });
  Object.keys(state.dismissedSpv || {}).forEach((key) => {
    const parts = key.split(":");
    if (parts.some((part) => playerIds.has(part))) delete state.dismissedSpv[key];
  });
}

function deletePlayersByIds(playerIds) {
  state.players = state.players.filter((item) => !playerIds.has(item.id));
  cleanupPlayerReferences(playerIds);
  selectedPlayerIds = new Set([...selectedPlayerIds].filter((playerId) => !playerIds.has(playerId)));
}

function applyPlayerBulkEdit() {
  const playerIds = new Set(selectedPlayerIds);
  if (!playerIds.size) return;
  const status = $("#bulk-player-status").value;
  const qttrDate = $("#bulk-player-qttr-date").value;
  const note = $("#bulk-player-note").value.trim();
  if (!status && !qttrDate && !note) {
    showToast("Wähle erst Status, QTTR-Stichtag oder Notiz aus.", "warn");
    return;
  }

  state.players.forEach((player) => {
    if (!playerIds.has(player.id)) return;
    if (status) player.status = status;
    if (qttrDate) player.qttrDate = qttrDate;
    if (note) player.seasonNote = note;
  });

  addActivity("Spieler", `${playerIds.size} Spieler aktualisiert`, [status ? `Status ${status}` : "", qttrDate ? `QTTR-Stichtag ${formatShortDate(qttrDate)}` : "", note ? "Notiz gesetzt" : ""].filter(Boolean).join(", "));
  $("#bulk-player-status").value = "";
  $("#bulk-player-qttr-date").value = "";
  $("#bulk-player-note").value = "";
  saveState();
  render();
  showToast(`${playerIds.size} Spieler wurden aktualisiert.`);
}

function deleteSelectedPlayers() {
  const playerIds = new Set(selectedPlayerIds);
  if (!playerIds.size) return;
  if (!confirm(`${playerIds.size} markierte Spieler wirklich löschen? Mannschaftszuordnungen, Sperrtermine und Aufstellungen werden entfernt.`)) return;
  deletePlayersByIds(playerIds);
  addActivity("Spieler", `${playerIds.size} Spieler gelöscht`, "Markierte Spieler entfernt");
  saveState();
  render();
  showToast(`${playerIds.size} Spieler wurden gelöscht.`, "warn");
}

function openTeamDialog(teamId = null) {
  editingPlayerId = null;
  editingTeamId = teamId;
  editingFixtureId = null;
  editingBlockId = null;
  $("#delete-entry").hidden = !teamId;
  $("#entry-type").value = "team";
  $("#entry-dialog h2").textContent = teamId ? "Mannschaft bearbeiten" : "Mannschaft erstellen";
  renderDynamicFields();
  $("#entry-dialog").showModal();
}

function openFixtureDialog(fixtureId = null) {
  editingPlayerId = null;
  editingFixtureId = fixtureId;
  editingTeamId = null;
  editingBlockId = null;
  $("#delete-entry").hidden = !fixtureId;
  $("#entry-type").value = "fixture";
  $("#entry-dialog h2").textContent = fixtureId ? "Punktspiel bearbeiten" : "Punktspiel erstellen";
  renderDynamicFields();
  $("#entry-dialog").showModal();
}

function openPlayerDialog(playerId = null) {
  editingPlayerId = playerId;
  editingTeamId = null;
  editingFixtureId = null;
  editingBlockId = null;
  $("#delete-entry").hidden = !playerId;
  $("#entry-type").value = "player";
  $("#entry-dialog h2").textContent = playerId ? "Spieler bearbeiten" : "Spieler erstellen";
  renderDynamicFields();
  $("#entry-dialog").showModal();
}

function openBlockDialog(blockId = null) {
  editingPlayerId = null;
  editingTeamId = null;
  editingFixtureId = null;
  editingBlockId = blockId;
  $("#delete-entry").hidden = !blockId;
  $("#entry-type").value = "block";
  $("#entry-dialog h2").textContent = blockId ? "Sperrtermin bearbeiten" : "Sperrtermin erstellen";
  renderDynamicFields();
  $("#entry-dialog").showModal();
}

function deleteEditingFixture() {
  if (!editingFixtureId) return;
  const fixture = state.fixtures.find((item) => item.id === editingFixtureId);
  const label = fixture ? `${teamName(fixture.teamId)} gegen ${fixture.opponent}` : "dieses Punktspiel";
  if (!confirm(`${label} wirklich löschen?`)) return;
  state.fixtures = state.fixtures.filter((item) => item.id !== editingFixtureId);
  addActivity("Punktspiel", `${label} gelöscht`, "Punktspiel entfernt");
  editingFixtureId = null;
  saveState();
  render();
  $("#entry-dialog").close();
  showToast("Punktspiel wurde gelöscht.");
}

function deleteEditingPlayer() {
  if (!editingPlayerId) return;
  const player = state.players.find((item) => item.id === editingPlayerId);
  const label = player ? player.name : "diesen Spieler";
  if (!confirm(`${label} wirklich löschen?`)) return;

  deletePlayersByIds(new Set([editingPlayerId]));
  addActivity("Spieler", `${label} gelöscht`, "Spieler entfernt");

  editingPlayerId = null;
  saveState();
  render();
  $("#entry-dialog").close();
  showToast("Spieler wurde gelöscht.");
}

function deleteEditingTeam() {
  if (!editingTeamId) return;
  const team = state.teams.find((item) => item.id === editingTeamId);
  const label = team ? team.name : "diese Mannschaft";
  if (!confirm(`${label} wirklich löschen? Spieler bleiben erhalten, Punktspiele dieser Mannschaft werden entfernt.`)) return;

  state.teams = state.teams.filter((item) => item.id !== editingTeamId);
  state.players.forEach((player) => {
    if (player.teamId === editingTeamId) player.teamId = "";
  });
  state.fixtures = state.fixtures.filter((fixture) => fixture.teamId !== editingTeamId);
  if (state.calendarAvailability) delete state.calendarAvailability[editingTeamId];
  if (state.calendarSubstitutes) delete state.calendarSubstitutes[editingTeamId];
  Object.keys(state.dismissedSpv || {}).forEach((key) => {
    const parts = key.split(":");
    if (parts.includes(editingTeamId)) delete state.dismissedSpv[key];
  });

  addActivity("Mannschaft", `${label} gelöscht`, "Mannschaft entfernt");
  editingTeamId = null;
  saveState();
  render();
  $("#entry-dialog").close();
  showToast("Mannschaft wurde gelöscht.");
}

function deleteEditingBlock() {
  if (!editingBlockId) return;
  const block = state.blocks.find((item) => item.id === editingBlockId);
  const label = block ? `${playerName(block.playerId)} am ${formatShortDate(block.date)}` : "diesen Sperrtermin";
  if (!confirm(`${label} wirklich löschen?`)) return;
  state.blocks = state.blocks.filter((item) => item.id !== editingBlockId);
  addActivity("Sperrtermin", `${label} gelöscht`, "Sperrtermin entfernt");
  editingBlockId = null;
  saveState();
  render();
  $("#entry-dialog").close();
  showToast("Sperrtermin wurde gelöscht.");
}

function deleteCurrentEntry() {
  if (editingFixtureId) {
    deleteEditingFixture();
    return;
  }
  if (editingTeamId) {
    deleteEditingTeam();
    return;
  }
  if (editingPlayerId) {
    deleteEditingPlayer();
    return;
  }
  if (editingBlockId) {
    deleteEditingBlock();
  }
}

function updateAvailability(fixtureId, playerId, value) {
  const fixture = state.fixtures.find((item) => item.id === fixtureId);
  if (!fixture) return;
  fixture.availability = fixture.availability || {};
  if (value === "open") {
    delete fixture.availability[playerId];
  } else {
    fixture.availability[playerId] = value;
  }
  saveState();
  render();
}

function updateFixtureLineup(fixtureId, playerId, checked) {
  const fixture = state.fixtures.find((item) => item.id === fixtureId);
  if (!fixture) return;
  const current = new Set(selectedLineupIds(fixture));
  if (checked) {
    current.add(playerId);
  } else {
    current.delete(playerId);
  }
  fixture.lineup = [...current].filter((id) => teamPlayers(fixture.teamId).some((player) => player.id === id));
  addActivity("Aufstellung", `${teamName(fixture.teamId)} gegen ${fixture.opponent} geändert`, `${fixture.lineup.length}/${requiredPlayers} Spieler`);
  saveState();
  render();
}

async function copyLineup(fixtureId) {
  const fixture = state.fixtures.find((item) => item.id === fixtureId);
  if (!fixture) return;
  const text = lineupShareText(fixture);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast("Aufstellung wurde kopiert.");
}

function confirmFixtureDate(fixtureId, date) {
  const fixture = state.fixtures.find((item) => item.id === fixtureId);
  if (!fixture) return;
  const keepOnlyConfirmed = confirm("Diesen Termin bestätigen und alle anderen Terminvorschläge entfernen?");
  fixture.confirmedDate = date;
  fixture.status = "bestaetigt";
  if (keepOnlyConfirmed) {
    fixture.preferredDates = [date];
  } else if (!fixture.preferredDates.includes(date)) {
    fixture.preferredDates.push(date);
  }
  addActivity("Punktspiel", `${teamName(fixture.teamId)} gegen ${fixture.opponent} bestätigt`, formatShortDate(date));
  saveState();
  render();
  showToast("Termin wurde bestätigt.");
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

["player-search", "player-team-filter", "player-status-filter", "player-sort", "fixture-team-filter", "fixture-status-filter", "calendar-team-filter", "calendar-hint-filter"].forEach((id) => {
  $(`#${id}`).addEventListener("input", render);
});

document.querySelectorAll(".calendar-column-toggle").forEach((input) => {
  input.addEventListener("change", () => {
    state.ui = state.ui || {};
    state.ui.calendarColumns = { ...calendarColumns(), [input.dataset.column]: input.checked };
    saveState();
    renderCalendar();
  });
});

$("#open-dialog").addEventListener("click", () => {
  editingPlayerId = null;
  editingTeamId = null;
  editingFixtureId = null;
  editingBlockId = null;
  $("#delete-entry").hidden = true;
  $("#entry-dialog h2").textContent = "Neuer Eintrag";
  const activeView = document.querySelector(".view.active")?.id;
  if (activeView === "fixtures") {
    openFixtureDialog();
    return;
  }
  if (activeView === "teams") {
    openTeamDialog();
    return;
  }
  if (activeView === "players") {
    openPlayerDialog();
    return;
  }
  if (activeView === "blocks") {
    openBlockDialog();
    return;
  }
  renderDynamicFields();
  $("#entry-dialog").showModal();
});

$("#players-table").addEventListener("click", (event) => {
  if (event.target.closest(".player-select")) return;
  const button = event.target.closest(".edit-player");
  if (!button) return;
  openPlayerDialog(button.dataset.playerId);
});

$("#players-table").addEventListener("change", (event) => {
  const checkbox = event.target.closest(".player-select");
  if (!checkbox) return;
  if (checkbox.checked) {
    selectedPlayerIds.add(checkbox.dataset.playerId);
  } else {
    selectedPlayerIds.delete(checkbox.dataset.playerId);
  }
  renderPlayers();
});

$("#select-all-players").addEventListener("change", (event) => {
  const visibleIds = [...document.querySelectorAll(".player-select")].map((checkbox) => checkbox.dataset.playerId);
  visibleIds.forEach((playerId) => {
    if (event.target.checked) {
      selectedPlayerIds.add(playerId);
    } else {
      selectedPlayerIds.delete(playerId);
    }
  });
  renderPlayers();
});

$("#apply-player-bulk").addEventListener("click", applyPlayerBulkEdit);
$("#delete-selected-players").addEventListener("click", deleteSelectedPlayers);
$("#clear-player-selection").addEventListener("click", () => {
  selectedPlayerIds.clear();
  renderPlayers();
});

$("#open-player-paste").addEventListener("click", () => {
  $("#player-paste-text").value = "";
  $("#player-paste-dialog").showModal();
});

$("#close-player-paste").addEventListener("click", () => {
  $("#player-paste-dialog").close();
});

$("#cancel-player-paste").addEventListener("click", () => {
  $("#player-paste-dialog").close();
});

$("#player-paste-form").addEventListener("submit", (event) => {
  event.preventDefault();
  previewPlayersText($("#player-paste-text").value);
  $("#player-paste-dialog").close();
});

$("#season-planning").addEventListener("click", (event) => {
  const assistantToggle = event.target.closest("#toggle-season-assistant");
  if (assistantToggle) {
    state.ui = state.ui || {};
    state.ui.seasonAssistantMinimized = !state.ui.seasonAssistantMinimized;
    saveState();
    renderSeasonAssistant();
    return;
  }

  const assistantDismiss = event.target.closest(".assistant-step-dismiss");
  if (assistantDismiss) {
    event.preventDefault();
    event.stopPropagation();
    dismissAssistantStep(assistantDismiss.dataset.stepKey);
    return;
  }

  const taskDismiss = event.target.closest(".planning-task-dismiss");
  if (taskDismiss) {
    event.preventDefault();
    event.stopPropagation();
    dismissPlanningTask(taskDismiss.dataset.taskKey);
    return;
  }

  const dismissButton = event.target.closest(".season-check-dismiss");
  if (dismissButton) {
    event.preventDefault();
    event.stopPropagation();
    dismissSeasonCheck(dismissButton.dataset.checkKey);
    return;
  }

  const button = event.target.closest(".action-row");
  if (!button) return;
  handlePlanningAction(button);
});

$("#season-planning").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const assistantDismiss = event.target.closest(".assistant-step-dismiss");
  if (assistantDismiss) {
    event.preventDefault();
    dismissAssistantStep(assistantDismiss.dataset.stepKey);
    return;
  }

  const taskDismiss = event.target.closest(".planning-task-dismiss");
  if (taskDismiss) {
    event.preventDefault();
    dismissPlanningTask(taskDismiss.dataset.taskKey);
    return;
  }

  const dismissButton = event.target.closest(".season-check-dismiss");
  if (dismissButton) {
    event.preventDefault();
    dismissSeasonCheck(dismissButton.dataset.checkKey);
    return;
  }

  const actionRow = event.target.closest(".season-check-row.action-row");
  if (!actionRow) return;
  event.preventDefault();
  handlePlanningAction(actionRow);
});

$("#new-team").addEventListener("click", () => openTeamDialog());
$("#new-fixture").addEventListener("click", () => openFixtureDialog());

$("#teams-list").addEventListener("click", (event) => {
  const spvButton = event.target.closest(".spv-badge");
  if (spvButton) {
    dismissSpv(spvButton.dataset.teamId, spvButton.dataset.playerId);
    return;
  }

  const button = event.target.closest(".edit-team");
  if (!button) return;
  openTeamDialog(button.dataset.teamId);
});

$("#fixture-board").addEventListener("click", (event) => {
  const copyButton = event.target.closest(".copy-lineup");
  if (copyButton) {
    event.preventDefault();
    copyLineup(copyButton.dataset.fixtureId);
    return;
  }

  const confirmButton = event.target.closest(".confirm-date");
  if (confirmButton) {
    event.preventDefault();
    confirmFixtureDate(confirmButton.dataset.fixtureId, confirmButton.dataset.date);
    return;
  }

  const jumpButton = event.target.closest(".jump-calendar-date");
  if (jumpButton) {
    event.preventDefault();
    handlePlanningAction({ dataset: { ...jumpButton.dataset, action: "calendar-date" } });
    return;
  }

  const button = event.target.closest(".edit-fixture");
  if (!button) return;
  event.preventDefault();
  openFixtureDialog(button.dataset.fixtureId);
});

$("#blocks-list").addEventListener("click", (event) => {
  const button = event.target.closest(".edit-block");
  if (!button) return;
  openBlockDialog(button.dataset.blockId);
});

$("#fixture-board").addEventListener("input", (event) => {
  const lineupInput = event.target.closest(".lineup-player");
  if (lineupInput) {
    updateFixtureLineup(lineupInput.dataset.fixtureId, lineupInput.dataset.playerId, lineupInput.checked);
    return;
  }

  const select = event.target.closest(".availability-row select");
  if (!select) return;
  updateAvailability(select.dataset.fixtureId, select.dataset.playerId, select.value);
});

$("#calendar-body").addEventListener("click", (event) => {
  const teamJumpButton = event.target.closest(".team-jump-button");
  if (teamJumpButton) {
    $("#calendar-team-filter").value = teamJumpButton.dataset.teamId;
    renderCalendar();
    const target = document.querySelector(`[data-calendar-date="${teamJumpButton.dataset.date}"]`);
    if (target) {
      target.classList.add("focus-row");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => target.classList.remove("focus-row"), 1800);
    }
    return;
  }

  const fixtureButton = event.target.closest(".fixture-chip");
  if (fixtureButton) {
    openFixtureDialog(fixtureButton.dataset.fixtureId);
    return;
  }

  const button = event.target.closest(".calendar-toggle");
  if (!button) return;
  const nextValue = button.classList.contains("is-yes") ? "no" : "yes";
  setCalendarValue(button.dataset.teamId, button.dataset.date, button.dataset.playerId, nextValue);
});

$("#calendar-body").addEventListener("change", (event) => {
  const input = event.target.closest(".calendar-substitute-input");
  if (!input) return;
  setCalendarSubstitute(input.dataset.teamId, input.dataset.date, input.value);
  renderCalendar();
});

$("#calendar-body").addEventListener("mouseover", (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target) return;
  showCalendarTooltip(target, event);
});

$("#calendar-body").addEventListener("mousemove", (event) => {
  if (!event.target.closest("[data-tooltip]")) return;
  moveCalendarTooltip(event);
});

$("#calendar-body").addEventListener("mouseout", (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target || target.contains(event.relatedTarget)) return;
  hideCalendarTooltip();
});

$("#home-options").addEventListener("click", (event) => {
  const button = event.target.closest(".create-fixture-from-date");
  if (!button) return;
  createFixtureFromDate(button.dataset.date, button.dataset.venue);
});

$("#away-options").addEventListener("click", (event) => {
  const button = event.target.closest(".create-fixture-from-date");
  if (!button) return;
  createFixtureFromDate(button.dataset.date, button.dataset.venue);
});

$("#season-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.settings.season = { label: data.label, start: data.start, end: data.end };
  state.settings.excludeHolidays = Boolean(data.excludeHolidays);
  state.settings.excludeSchoolBreaks = Boolean(data.excludeSchoolBreaks);
  saveState();
  render();
  showToast("Saisonzeitraum wurde gespeichert.");
});

$("#season-form").addEventListener("change", (event) => {
  if (!event.target.matches("input[name='excludeHolidays'], input[name='excludeSchoolBreaks']")) return;
  state.settings.excludeHolidays = $("#season-form input[name='excludeHolidays']").checked;
  state.settings.excludeSchoolBreaks = $("#season-form input[name='excludeSchoolBreaks']").checked;
  saveState();
  renderCalendar();
});

$("#add-hall-slot").addEventListener("click", () => {
  state.settings.hallSlots.push({ id: `h${Date.now()}`, weekday: 1, hall: "Neue Halle", court: "", time: "19:30" });
  saveState();
  render();
  showToast("Hallenzeit wurde hinzugefügt.");
});

$("#hall-slots-list").addEventListener("input", (event) => {
  const row = event.target.closest(".hall-slot-row");
  if (!row) return;
  updateHallSlot(row);
});

$("#hall-slots-list").addEventListener("click", (event) => {
  const button = event.target.closest(".remove-hall-slot");
  if (!button) return;
  const row = button.closest(".hall-slot-row");
  state.settings.hallSlots = state.settings.hallSlots.filter((slot) => slot.id !== row.dataset.slotId);
  saveState();
  render();
  showToast("Hallenzeit wurde entfernt.");
});

$("#export-data").addEventListener("click", exportAllData);

$("#import-data").addEventListener("change", async (event) => {
  await importAllData(event.target.files[0]);
  event.target.value = "";
});

$("#export-players").addEventListener("click", exportPlayersCsv);

$("#export-fixtures").addEventListener("click", exportFixturesCsv);

$("#export-fixtures-calendar").addEventListener("click", exportConfirmedFixturesCalendar);

$("#print-season-plan").addEventListener("click", printSeasonPlan);
$("#print-calendar-plan").addEventListener("click", printCalendarPlan);

$("#import-players").addEventListener("change", async (event) => {
  await previewPlayersCsv(event.target.files[0]);
  event.target.value = "";
});

$("#player-import-preview").addEventListener("click", (event) => {
  if (event.target.closest("#apply-player-import")) {
    applyPlayerImport();
  }
  if (event.target.closest("#cancel-player-import")) {
    pendingPlayerImport = [];
    renderPlayerImportPreview();
    showToast("Spieler-Import wurde verworfen.", "warn");
  }
});

$("#import-fixtures").addEventListener("change", async (event) => {
  await previewFixturesCsv(event.target.files[0]);
  event.target.value = "";
});

$("#fixture-import-preview").addEventListener("click", (event) => {
  if (event.target.closest("#apply-fixture-import")) {
    applyFixtureImport();
  }
  if (event.target.closest("#cancel-fixture-import")) {
    pendingFixtureImport = [];
    renderFixtureImportPreview();
    showToast("Punktspiel-Import wurde verworfen.", "warn");
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".empty-action");
  if (!button) return;
  handleEmptyAction(button.dataset.emptyAction);
});

$("#close-dialog").addEventListener("click", () => {
  editingPlayerId = null;
  editingTeamId = null;
  editingFixtureId = null;
  editingBlockId = null;
  $("#delete-entry").hidden = true;
  $("#entry-dialog").close();
});

$("#cancel-dialog").addEventListener("click", () => {
  editingPlayerId = null;
  editingTeamId = null;
  editingFixtureId = null;
  editingBlockId = null;
  $("#delete-entry").hidden = true;
  $("#entry-dialog").close();
});

$("#delete-entry").addEventListener("click", deleteCurrentEntry);

$("#entry-type").addEventListener("change", () => {
  editingPlayerId = null;
  editingTeamId = null;
  editingFixtureId = null;
  editingBlockId = null;
  $("#delete-entry").hidden = true;
  $("#entry-dialog h2").textContent = "Neuer Eintrag";
  renderDynamicFields();
});

$("#dynamic-fields").addEventListener("input", (event) => {
  if (event.target.matches("input[name='playerIds']")) {
    renderTeamRulePreview();
    return;
  }
  if (event.target.matches("input[name='preferredDates']")) {
    renderFixtureDateChips();
  }
});

$("#dynamic-fields").addEventListener("change", (event) => {
  if (event.target.matches("select[name='venue']")) {
    updateFixtureVenueFields();
    renderFixtureDatePreview();
    renderFixtureMiniCalendar();
    return;
  }
  if (event.target.matches("select[name='teamId'], input[name='fixtureDatePicker']")) {
    renderFixtureDatePreview();
    renderFixtureMiniCalendar();
    return;
  }
  if (event.target.matches("select[name='hall']")) {
    const timeInput = $("#dynamic-fields input[name='startTime']");
    if (timeInput && !timeInput.value) timeInput.value = defaultTimeForHall(event.target.value);
  }
});

$("#dynamic-fields").addEventListener("click", (event) => {
  const previousMonthButton = event.target.closest(".mini-calendar-prev");
  if (previousMonthButton) {
    shiftFixtureCalendarMonth(-1);
    return;
  }

  const nextMonthButton = event.target.closest(".mini-calendar-next");
  if (nextMonthButton) {
    shiftFixtureCalendarMonth(1);
    return;
  }

  const miniCalendarDay = event.target.closest(".mini-calendar-day");
  if (miniCalendarDay) {
    const picker = $("#dynamic-fields input[name='fixtureDatePicker']");
    if (picker) picker.value = miniCalendarDay.dataset.date;
    setFixtureDateValues([...fixtureDateValues(), miniCalendarDay.dataset.date]);
    return;
  }

  const addDateButton = event.target.closest(".add-fixture-date");
  if (addDateButton) {
    addFixtureDateFromPicker();
    return;
  }

  const removeDateButton = event.target.closest(".remove-fixture-date");
  if (removeDateButton) {
    setFixtureDateValues(fixtureDateValues().filter((date) => date !== removeDateButton.dataset.date));
    return;
  }

  const upButton = event.target.closest(".move-player-up");
  const downButton = event.target.closest(".move-player-down");
  if (!upButton && !downButton) return;
  const row = event.target.closest(".order-row");
  if (!row) return;
  moveTeamPlayer(row.dataset.playerId, upButton ? -1 : 1);
});

$("#entry-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (addEntry(event.currentTarget)) {
    showToast("Eintrag wurde gespeichert.");
    event.currentTarget.reset();
    editingPlayerId = null;
    editingTeamId = null;
    editingFixtureId = null;
    editingBlockId = null;
    $("#delete-entry").hidden = true;
    $("#entry-dialog").close();
  }
});

$("#reset-data").addEventListener("click", () => {
  state = structuredClone(seed);
  addActivity("Daten", "Beispieldaten wiederhergestellt", "Alle Daten wurden zurückgesetzt");
  editingPlayerId = null;
  editingTeamId = null;
  editingFixtureId = null;
  editingBlockId = null;
  $("#delete-entry").hidden = true;
  saveState();
  render();
  showToast("Beispieldaten wurden wiederhergestellt.", "warn");
});

renderDynamicFields();
render();



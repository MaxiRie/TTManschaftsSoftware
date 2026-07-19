import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type ViewKey = "dashboard" | "players" | "season" | "teams" | "calendar" | "fixtures" | "blocks" | "tournaments" | "accounts" | "settings" | "profile";

type Player = {
  id: string;
  name: string;
  qttr: number;
  qttrDate?: string;
  status: string;
  seasonNote?: string | null;
  isSpvMarked?: boolean;
  teamId?: string | null;
};

type Team = {
  id: string;
  name: string;
  league: string;
  targetSize: number;
  seasonId?: string | null;
  players: Player[];
};

type Fixture = {
  id: string;
  teamId: string;
  opponent: string;
  venue: string;
  status: string;
  confirmedDate?: string | null;
  hall?: string | null;
  preferredDates: string[];
  lineup: LineupEntry[];
};

type LineupEntry = {
  playerId: string;
  playerName: string;
  position: number;
  isSubstitute: boolean;
};

type Block = {
  id: string;
  playerId: string;
  date: string;
  reason?: string | null;
  player?: Player;
};

type Season = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  excludeHolidays: boolean;
  excludeSchoolBreaks: boolean;
};

type Tournament = {
  id: string;
  name: string;
  mode: string;
  startDate: string;
  endDate?: string | null;
  status: string;
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
};

type TournamentParticipant = {
  id: string;
  playerId: string;
  playerName: string;
  seed: number;
  groupName?: string | null;
};

type TournamentMatch = {
  id: string;
  player1Id?: string | null;
  player1Name?: string | null;
  player2Id?: string | null;
  player2Name?: string | null;
  winnerPlayerId?: string | null;
  round: number;
  matchNumber: number;
  status: string;
  score?: string | null;
  scheduledAt?: string | null;
};

type HallSlot = {
  id: string;
  weekday: number;
  hall: string;
  court: string;
  time: string;
};

type Settings = {
  requiredPlayers: number;
  hallSlots: HallSlot[];
  seasonStart: string;
  seasonEnd: string;
  excludeHolidays: boolean;
  excludeSchoolBreaks: boolean;
};

type AuthUser = {
  id: string;
  userName: string;
  email: string;
  playerId?: string | null;
  isActive: boolean;
  roles: string[];
};

type AuthResult = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

type AppRole = {
  name: string;
  description: string;
};

type DialogKind = "player" | "team" | "fixture" | "block" | "season" | "tournament" | "user";

type DialogState = {
  kind: DialogKind;
  id?: string;
} | null;

const statusOptions = ["aktiv", "RES", "Ersatz", "Jugend", "passiv"];
const fixtureStatuses = ["offen", "geplant", "bestaetigt"];
const leagues = [
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
const calendarWeekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const ttvnInternalTolerance = 35;
const ttvnOverallTolerance = 50;
const settingsKey = "ttm-react-settings-v1";
const authKey = "ttm-auth-v1";
let authToken = localStorage.getItem(authKey) || "";
const requiredDefaultSettings: Settings = {
  requiredPlayers: 4,
  seasonStart: "2026-08-29",
  seasonEnd: "2026-12-10",
  excludeHolidays: true,
  excludeSchoolBreaks: false,
  hallSlots: [
    { id: "h1", weekday: 1, hall: "Bredingsfeld", court: "2", time: "19:30" },
    { id: "h2", weekday: 2, hall: "Planetenring", court: "1", time: "19:30" },
    { id: "h3", weekday: 5, hall: "Planetenring", court: "1", time: "19:30" },
    { id: "h4", weekday: 5, hall: "Robert Koch", court: "3", time: "19:30" }
  ]
};

const api = {
  setToken(token: string) {
    authToken = token;
    if (token) localStorage.setItem(authKey, token);
    else localStorage.removeItem(authKey);
  },
  async get<T>(path: string): Promise<T> {
    const response = await fetch(path, { headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json() as Promise<T>;
  },
  async send<T>(path: string, method: string, body?: unknown): Promise<T> {
    const response = await fetch(path, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
};

function isoDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toApiDate(value: string) {
  return value ? `${value}T00:00:00.000Z` : null;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function normalizeVenue(value: string) {
  return value === "Auswärts" || value === "Auswaerts" ? "Auswaerts" : "Heim";
}

function displayVenue(value: string) {
  return value === "Auswaerts" || value === "Auswärts" ? "Auswärts" : "Heim";
}

function normalizeStatus(value: string) {
  return value === "bestätigt" ? "bestaetigt" : value;
}

function displayStatus(value: string) {
  return value === "bestaetigt" ? "bestätigt" : value;
}

function dateRange(start: string, end: string) {
  const result: string[] = [];
  const cursor = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (cursor <= last) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

function inclusiveDateRange(start: string, end: string) {
  if (!start) return [];
  const normalizedEnd = end || start;
  const [from, to] = start <= normalizedEnd ? [start, normalizedEnd] : [normalizedEnd, start];
  return dateRange(from, to);
}

function monthRange(start: string, end: string) {
  const result: string[] = [];
  const cursor = new Date(`${start.slice(0, 7)}-01T00:00:00`);
  const last = new Date(`${end.slice(0, 7)}-01T00:00:00`);
  while (cursor <= last) {
    result.push(cursor.toISOString().slice(0, 7));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

function monthCalendarDays(month: string) {
  const first = new Date(`${month}-01T00:00:00`);
  const start = new Date(first);
  const mondayOffset = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function fixtureDate(fixture: Fixture) {
  return isoDate(fixture.confirmedDate) || isoDate(fixture.preferredDates[0]);
}

function loadLocalSettings() {
  try {
    const stored = localStorage.getItem(settingsKey);
    if (!stored) return requiredDefaultSettings;
    return { ...requiredDefaultSettings, ...JSON.parse(stored) } as Settings;
  } catch {
    return requiredDefaultSettings;
  }
}

function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csv(value: unknown) {
  const text = String(value ?? "");
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function teamLabel(teams: Team[], id?: string | null) {
  return teams.find((team) => team.id === id)?.name ?? "Ohne Mannschaft";
}

function playerLabel(players: Player[], id?: string | null) {
  return players.find((player) => player.id === id)?.name ?? "Unbekannt";
}

function teamNumber(team: Team) {
  const match = team.name.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function compareTeamsByNumber(a: Team, b: Team) {
  const numberDiff = teamNumber(a) - teamNumber(b);
  if (numberDiff !== 0) return numberDiff;
  return a.name.localeCompare(b.name, "de", { numeric: true, sensitivity: "base" });
}

function hasRole(user: AuthUser | null, role: string) {
  return Boolean(user?.roles.includes(role));
}

function isAdmin(user: AuthUser | null) {
  return hasRole(user, "Admin");
}

function isClubManager(user: AuthUser | null) {
  return isAdmin(user) || hasRole(user, "Vereinsleiter");
}

function isTournamentManager(user: AuthUser | null) {
  return isAdmin(user) || hasRole(user, "Turnierleiter");
}

function managedTeamId(user: AuthUser | null, players: Player[]) {
  if (!user || !hasRole(user, "Mannschaftsfuehrer")) return null;
  return players.find((player) => player.id === user.playerId)?.teamId || null;
}

function canManageFixture(user: AuthUser | null, players: Player[], fixture?: Fixture | null, teamId?: string | null) {
  if (isAdmin(user)) return true;
  const ownTeamId = managedTeamId(user, players);
  const targetTeamId = fixture?.teamId || teamId;
  return Boolean(ownTeamId && targetTeamId && ownTeamId === targetTeamId);
}

function canCreateForAnyFixtureTeam(user: AuthUser | null, players: Player[]) {
  return isAdmin(user) || Boolean(managedTeamId(user, players));
}

function teamPlayers(players: Player[], teamId: string) {
  return players.filter((player) => player.teamId === teamId).sort((a, b) => b.qttr - a.qttr);
}

function availablePlayers(players: Player[], blocks: Block[], teamId: string, date: string) {
  const blocked = new Set(blocks.filter((block) => isoDate(block.date) === date).map((block) => block.playerId));
  return teamPlayers(players, teamId).filter((player) => player.status !== "passiv" && !blocked.has(player.id));
}

function spvWarnings(teams: Team[], players: Player[]) {
  const orderedTeams = [...teams].sort((a, b) => leagues.indexOf(a.league) - leagues.indexOf(b.league));
  const warnings: string[] = [];

  orderedTeams.forEach((team) => {
    const sorted = teamPlayers(players, team.id);
    if (sorted.length < team.targetSize) warnings.push(`${team.name}: ${sorted.length}/${team.targetSize} Spieler`);
    if (sorted.length >= 2 && sorted[0].qttr - sorted[sorted.length - 1].qttr > ttvnInternalTolerance) {
      warnings.push(`${team.name}: interne QTTR-Spanne ${sorted[0].qttr - sorted[sorted.length - 1].qttr}`);
    }
  });

  for (let index = 0; index < orderedTeams.length - 1; index += 1) {
    const upper = teamPlayers(players, orderedTeams[index].id);
    const lower = teamPlayers(players, orderedTeams[index + 1].id);
    if (!upper.length || !lower.length) continue;
    const diff = lower[0].qttr - upper[upper.length - 1].qttr;
    if (diff > ttvnOverallTolerance) {
      warnings.push(`${lower[0].name} liegt ${diff} Punkte ueber ${upper[upper.length - 1].name}`);
    }
  }

  return warnings;
}

function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [view, setView] = useState<ViewKey>("calendar");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [settings, setSettings] = useState<Settings>(() => loadLocalSettings());
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerTeamFilter, setPlayerTeamFilter] = useState("all");
  const [playerStatusFilter, setPlayerStatusFilter] = useState("all");
  const [fixtureStatusFilter, setFixtureStatusFilter] = useState("all");
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => new Set());

  async function refresh() {
    const [playersResult, teamsResult, fixturesResult, blocksResult, seasonsResult, tournamentsResult] = await Promise.all([
      api.get<Player[]>("/api/players"),
      api.get<Team[]>("/api/teams"),
      api.get<Fixture[]>("/api/fixtures"),
      api.get<Block[]>("/api/blocks"),
      api.get<Season[]>("/api/seasons"),
      api.get<Tournament[]>("/api/tournaments")
    ]);
    setPlayers(playersResult);
    setTeams(teamsResult);
    setFixtures(fixturesResult);
    setBlocks(blocksResult);
    setSeasons(seasonsResult);
    setTournaments(tournamentsResult);
    if (isAdmin(currentUser)) {
      const [usersResult, rolesResult] = await Promise.all([
        api.get<AuthUser[]>("/api/auth/users"),
        api.get<AppRole[]>("/api/auth/roles")
      ]);
      setUsers(usersResult);
      setRoles(rolesResult);
    }
  }

  useEffect(() => {
    if (!authToken) {
      setAuthReady(true);
      return;
    }

    api.get<AuthUser>("/api/auth/me")
      .then((user) => setCurrentUser(user))
      .catch(() => api.setToken(""))
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    refresh().catch((loadError: Error) => setError(loadError.message));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function login(data: FormData, bootstrap = false) {
    const payload = {
      userName: String(data.get("userName") || "").trim(),
      userNameOrEmail: String(data.get("userName") || "").trim(),
      email: String(data.get("email") || "").trim() || undefined,
      password: String(data.get("password") || "")
    };
    if (bootstrap) {
      await api.send<AuthUser>("/api/auth/bootstrap-admin", "POST", payload);
    }
    const result = await api.send<AuthResult>("/api/auth/login", "POST", payload);
    api.setToken(result.token);
    setCurrentUser(result.user);
    setView(defaultViewForUser(result.user));
  }

  function logout() {
    api.setToken("");
    setCurrentUser(null);
    setUsers([]);
    setRoles([]);
    setView("calendar");
  }

  async function savePlayer(data: FormData) {
    const id = String(data.get("id") || "");
    const payload = {
      name: String(data.get("name") || "").trim(),
      qttr: Number(data.get("qttr") || 0),
      qttrDate: toApiDate(String(data.get("qttrDate") || new Date().toISOString().slice(0, 10))),
      status: String(data.get("status") || "aktiv"),
      seasonNote: String(data.get("seasonNote") || ""),
      teamId: String(data.get("teamId") || "") || null
    };
    if (id) await api.send<Player>(`/api/players/${id}`, "PUT", payload);
    else {
      const created = await api.send<Player>("/api/players", "POST", payload);
      if (payload.teamId) await api.send(`/api/teams/${payload.teamId}/players/${created.id}`, "POST");
    }
    await refresh();
    showToast("Spieler gespeichert");
  }

  async function saveTeam(data: FormData) {
    const id = String(data.get("id") || "");
    const payload = {
      name: String(data.get("name") || "").trim(),
      league: String(data.get("league") || ""),
      targetSize: Number(data.get("targetSize") || 4),
      seasonId: String(data.get("seasonId") || "") || null
    };
    if (id) await api.send<Team>(`/api/teams/${id}`, "PUT", payload);
    else await api.send<Team>("/api/teams", "POST", payload);
    await refresh();
    showToast("Mannschaft gespeichert");
  }

  async function saveFixture(data: FormData) {
    const id = String(data.get("id") || "");
    const preferredDates = String(data.get("preferredDates") || "")
      .split(/[,;\n]+/)
      .map((date) => date.trim())
      .filter(Boolean)
      .map(toApiDate);
    const payload = {
      teamId: String(data.get("teamId") || ""),
      opponent: String(data.get("opponent") || "").trim(),
      venue: normalizeVenue(String(data.get("venue") || "Heim")),
      status: normalizeStatus(String(data.get("status") || "offen")),
      confirmedDate: toApiDate(String(data.get("confirmedDate") || "")),
      hall: String(data.get("hall") || ""),
      preferredDates
    };
    if (id) await api.send<Fixture>(`/api/fixtures/${id}`, "PUT", payload);
    else await api.send<Fixture>("/api/fixtures", "POST", payload);
    await refresh();
    showToast("Punktspiel gespeichert");
  }

  async function saveBlock(data: FormData) {
    const playerId = String(data.get("playerId") || "");
    const reason = String(data.get("reason") || "Sperrtermin");
    const dates = inclusiveDateRange(String(data.get("dateStart") || data.get("date") || ""), String(data.get("dateEnd") || ""));
    await Promise.all(dates.map((date) => api.send<Block>("/api/blocks", "POST", {
      playerId,
      date: toApiDate(date),
      reason
    })));
    await refresh();
    showToast(dates.length === 1 ? "Sperrtermin gespeichert" : `${dates.length} Sperrtermine gespeichert`);
  }

  async function saveSeason(data: FormData) {
    const id = String(data.get("id") || "");
    const payload = {
      label: String(data.get("label") || ""),
      startDate: toApiDate(String(data.get("startDate") || "")),
      endDate: toApiDate(String(data.get("endDate") || "")),
      excludeHolidays: data.get("excludeHolidays") === "on",
      excludeSchoolBreaks: data.get("excludeSchoolBreaks") === "on"
    };
    if (id) await api.send<Season>(`/api/seasons/${id}`, "PUT", payload);
    else await api.send<Season>("/api/seasons", "POST", payload);
    setSettings((current) => ({
      ...current,
      seasonStart: String(data.get("startDate") || current.seasonStart),
      seasonEnd: String(data.get("endDate") || current.seasonEnd),
      excludeHolidays: payload.excludeHolidays,
      excludeSchoolBreaks: payload.excludeSchoolBreaks
    }));
    await refresh();
    showToast("Saison gespeichert");
  }

  async function saveTournament(data: FormData) {
    const payload = {
      name: String(data.get("name") || ""),
      mode: String(data.get("mode") || "Gruppenphase"),
      startDate: toApiDate(String(data.get("startDate") || "")),
      endDate: toApiDate(String(data.get("endDate") || "")),
      seasonId: String(data.get("seasonId") || "") || null
    };
    await api.send<Tournament>("/api/tournaments", "POST", payload);
    await refresh();
    showToast("Turnier gespeichert");
  }

  async function saveUser(data: FormData) {
    const id = String(data.get("id") || "");
    const roles = data.getAll("roles").map(String);
    const password = String(data.get("password") || "");
    const payload = {
      userName: String(data.get("userName") || "").trim(),
      email: String(data.get("email") || "").trim() || undefined,
      password,
      playerId: String(data.get("playerId") || "") || null,
      isActive: data.get("isActive") === "on",
      roles
    };

    if (id) {
      await api.send<AuthUser>(`/api/auth/users/${id}`, "PUT", payload);
      if (password) await api.send(`/api/auth/users/${id}/password`, "PUT", { password });
    } else {
      await api.send<AuthUser>("/api/auth/users", "POST", payload);
    }
    const [usersResult, rolesResult] = await Promise.all([
      api.get<AuthUser[]>("/api/auth/users"),
      api.get<AppRole[]>("/api/auth/roles")
    ]);
    setUsers(usersResult);
    setRoles(rolesResult);
    showToast("Account gespeichert");
  }

  async function changePassword(data: FormData) {
    const currentPassword = String(data.get("currentPassword") || "");
    const newPassword = String(data.get("newPassword") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");
    if (newPassword !== confirmPassword) {
      throw new Error("Die neuen Passwoerter stimmen nicht ueberein.");
    }
    await api.send("/api/auth/me/password", "PUT", { currentPassword, newPassword });
    showToast("Passwort geaendert");
  }

  async function handleDialogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialog) return;
    const data = new FormData(event.currentTarget);
    try {
      if (dialog.kind === "player") await savePlayer(data);
      if (dialog.kind === "team") await saveTeam(data);
      if (dialog.kind === "fixture") await saveFixture(data);
      if (dialog.kind === "block") await saveBlock(data);
      if (dialog.kind === "season") await saveSeason(data);
      if (dialog.kind === "tournament") await saveTournament(data);
      if (dialog.kind === "user") await saveUser(data);
      setDialog(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen");
    }
  }

  async function remove(kind: DialogKind, id: string) {
    try {
      if (kind === "player") await api.send(`/api/players/${id}`, "DELETE");
      if (kind === "team") await api.send(`/api/teams/${id}`, "DELETE");
      if (kind === "fixture") await api.send(`/api/fixtures/${id}`, "DELETE");
      if (kind === "block") await api.send(`/api/blocks/${id}`, "DELETE");
      if (kind === "season") await api.send(`/api/seasons/${id}`, "DELETE");
      if (kind === "tournament") await api.send(`/api/tournaments/${id}`, "DELETE");
      await refresh();
      showToast("Eintrag geloescht");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Loeschen fehlgeschlagen");
    }
  }

  async function bulkStatus(status: string) {
    await Promise.all([...selectedPlayers].map((id) => api.send(`/api/players/${id}`, "PUT", { status })));
    setSelectedPlayers(new Set());
    await refresh();
    showToast("Status aktualisiert");
  }

  function suggestLineup(fixture: Fixture) {
    const date = isoDate(fixture.confirmedDate) || isoDate(fixture.preferredDates[0]);
    return availablePlayers(players, blocks, fixture.teamId, date).slice(0, settings.requiredPlayers);
  }

  function exportJson() {
    download("tt-mannschaftssoftware-export.json", JSON.stringify({ players, teams, fixtures, blocks, seasons, tournaments, settings }, null, 2), "application/json");
  }

  function exportPlayersCsv() {
    const lines = ["Name;QTTR;Status;Mannschaft;Notiz", ...players.map((player) => [player.name, player.qttr, player.status, teamLabel(teams, player.teamId), player.seasonNote].map(csv).join(";"))];
    download("spieler.csv", lines.join("\n"), "text/csv");
  }

  function exportFixturesCsv() {
    const lines = ["Mannschaft;Gegner;Ort;Status;Termin;Halle", ...fixtures.map((fixture) => [teamLabel(teams, fixture.teamId), fixture.opponent, displayVenue(fixture.venue), displayStatus(fixture.status), formatDate(fixture.confirmedDate), fixture.hall].map(csv).join(";"))];
    download("punktspiele.csv", lines.join("\n"), "text/csv");
  }

  function printCurrentView() {
    window.print();
  }

  const filteredPlayers = useMemo(() => {
    return players
      .filter((player) => player.name.toLowerCase().includes(playerSearch.toLowerCase()))
      .filter((player) => playerTeamFilter === "all" || player.teamId === playerTeamFilter)
      .filter((player) => playerStatusFilter === "all" || player.status === playerStatusFilter)
      .sort((a, b) => b.qttr - a.qttr);
  }, [players, playerSearch, playerTeamFilter, playerStatusFilter]);

  const warnings = useMemo(() => spvWarnings(teams, players), [teams, players]);
  const activePlayers = players.filter((player) => player.status === "aktiv").length;

  const nav: { key: ViewKey; label: string }[] = [
    { key: "dashboard", label: "Uebersicht" },
    { key: "players", label: "Spieler" },
    { key: "season", label: "Saisonplanung" },
    { key: "teams", label: "Mannschaften" },
    { key: "calendar", label: "Kalender" },
    { key: "fixtures", label: "Meine Punktspiele" },
    { key: "blocks", label: "Sperrtermine" },
    { key: "tournaments", label: "Turniere" },
    { key: "accounts", label: "Accounts" },
    { key: "settings", label: "Einstellungen" }
  ];
  const profileNav = { key: "profile" as ViewKey, label: "Nutzer-Einstellungen" };
  const visibleNav = nav.filter((item) => canView(currentUser, item.key));
  const currentPlayer = players.find((player) => player.id === currentUser?.playerId) || null;

  useEffect(() => {
    if (currentUser && !canView(currentUser, view)) {
      setView(defaultViewForUser(currentUser));
    }
  }, [currentUser, view]);

  if (!authReady) {
    return <main className="login-shell"><div className="empty-state">Anmeldung wird geprueft...</div></main>;
  }

  if (!currentUser) {
    return <LoginPage submit={login} error={error} setError={setError} />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">TT</div>
          <div>
            <strong>Spartenplaner</strong>
            <span>{settings.seasonStart.slice(0, 4)}/{settings.seasonEnd.slice(2, 4)}</span>
          </div>
        </div>
        <div className="sidebar-nav">
          <nav className="nav">
            {visibleNav.map((item) => (
              <button className={view === item.key ? "active" : ""} key={item.key} onClick={() => setView(item.key)}>
                {item.label}
              </button>
            ))}
          </nav>
          <button className={`nav-item profile-nav-item ${view === profileNav.key ? "active" : ""}`} onClick={() => setView(profileNav.key)}>
            {profileNav.label}
          </button>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Tischtennissparte</p>
            <h1>{[...nav, profileNav].find((item) => item.key === view)?.label}</h1>
          </div>
          <div className="top-actions">
            <span className="muted-note">{currentUser.userName}</span>
            <button className="icon-button" onClick={() => refresh().then(() => showToast("Daten aktualisiert"))} title="Aktualisieren">
              ↻
            </button>
            {canCreateInView(currentUser, view, players) && (
            <button className="primary-button" onClick={() => setDialog(defaultDialogForView(view))}>
              Neuer Eintrag
            </button>
            )}
            <button onClick={logout}>Abmelden</button>
          </div>
        </header>

        {error && (
          <div className="notice error">
            <span>{error}</span>
            <button onClick={() => setError("")}>Schliessen</button>
          </div>
        )}
        {toast && <div className="toast">{toast}</div>}

        {view === "dashboard" && (
          <Dashboard
            activePlayers={activePlayers}
            teams={teams}
            fixtures={fixtures}
            blocks={blocks}
            players={players}
            warnings={warnings}
            setView={setView}
          />
        )}
        {view === "players" && (
          <PlayersPage
            players={filteredPlayers}
            allPlayers={players}
            teams={teams}
            selectedPlayers={selectedPlayers}
            setSelectedPlayers={setSelectedPlayers}
            playerSearch={playerSearch}
            setPlayerSearch={setPlayerSearch}
            playerTeamFilter={playerTeamFilter}
            setPlayerTeamFilter={setPlayerTeamFilter}
            playerStatusFilter={playerStatusFilter}
            setPlayerStatusFilter={setPlayerStatusFilter}
            openDialog={(id) => setDialog({ kind: "player", id })}
            remove={(id) => remove("player", id)}
            bulkStatus={bulkStatus}
          />
        )}
        {view === "season" && <SeasonPage teams={teams} players={players} fixtures={fixtures} blocks={blocks} warnings={warnings} settings={settings} setView={setView} />}
        {view === "teams" && <TeamsPage teams={teams} players={players} canManage={isClubManager(currentUser)} openDialog={(id) => setDialog({ kind: "team", id })} remove={(id) => remove("team", id)} />}
        {view === "calendar" && (
          <CalendarPage
            teams={teams}
            players={players}
            blocks={blocks}
            fixtures={fixtures}
            settings={settings}
            canEditFixture={(fixture) => canManageFixture(currentUser, players, fixture)}
            openFixture={(id) => setDialog({ kind: "fixture", id })}
            openBlock={() => setDialog({ kind: "block" })}
          />
        )}
        {view === "fixtures" && (
          <FixturesPage
            fixtures={fixtures}
            teams={teams}
            currentUser={currentUser}
            players={players}
            settings={settings}
            statusFilter={fixtureStatusFilter}
            setStatusFilter={setFixtureStatusFilter}
            canCreate={canCreateForAnyFixtureTeam(currentUser, players)}
            canEditFixture={(fixture) => canManageFixture(currentUser, players, fixture)}
            openDialog={(id) => setDialog({ kind: "fixture", id })}
            remove={(id) => remove("fixture", id)}
          />
        )}
        {view === "blocks" && <BlocksPage blocks={blocks} players={players} currentPlayer={currentPlayer} canManageAll={isClubManager(currentUser)} remove={(id) => remove("block", id)} openDialog={() => setDialog({ kind: "block" })} />}
        {view === "tournaments" && <TournamentsPage tournaments={visibleTournaments(tournaments, currentUser)} canManage={isTournamentManager(currentUser)} openDialog={() => setDialog({ kind: "tournament" })} />}
        {view === "accounts" && <AccountsPage users={users} players={players} roles={roles} openDialog={(id) => setDialog({ kind: "user", id })} />}
        {view === "profile" && <ProfileSettingsPage currentUser={currentUser} currentPlayer={currentPlayer} changePassword={changePassword} />}
        {view === "settings" && (
          <SettingsPage
            settings={settings}
            setSettings={setSettings}
            seasons={seasons}
            openSeason={(id) => setDialog({ kind: "season", id })}
            exportJson={exportJson}
            exportPlayersCsv={exportPlayersCsv}
            exportFixturesCsv={exportFixturesCsv}
            printCurrentView={printCurrentView}
          />
        )}
      </section>

      {dialog && (
        <EntryDialog
          dialog={dialog}
          players={players}
          teams={teams}
          fixtures={fixtures}
          blocks={blocks}
          seasons={seasons}
          settings={settings}
          currentUser={currentUser}
          users={users}
          roles={roles}
          close={() => setDialog(null)}
          submit={handleDialogSubmit}
          remove={remove}
        />
      )}
    </main>
  );
}

function defaultDialogForView(view: ViewKey): DialogState {
  if (view === "players") return { kind: "player" };
  if (view === "teams") return { kind: "team" };
  if (view === "fixtures" || view === "calendar") return { kind: "fixture" };
  if (view === "blocks") return { kind: "block" };
  if (view === "season" || view === "settings") return { kind: "season" };
  if (view === "tournaments") return { kind: "tournament" };
  if (view === "accounts") return { kind: "user" };
  return { kind: "player" };
}

function canView(user: AuthUser | null, view: ViewKey) {
  if (!user) return false;
  if (view === "profile") return true;
  if (isAdmin(user)) return true;
  if (["teams", "calendar", "fixtures", "blocks", "tournaments"].includes(view)) return true;
  if (["dashboard", "players", "season"].includes(view)) return hasRole(user, "Vereinsleiter");
  return false;
}

function defaultViewForUser(user: AuthUser) {
  if (isAdmin(user) || hasRole(user, "Vereinsleiter")) return "dashboard";
  return "calendar";
}

function canCreateInView(user: AuthUser | null, view: ViewKey, players: Player[]) {
  if (isAdmin(user)) return true;
  if (view === "blocks") return true;
  if (view === "fixtures") return canCreateForAnyFixtureTeam(user, players);
  if (view === "teams" || view === "players" || view === "season") return isClubManager(user);
  if (view === "tournaments") return isTournamentManager(user);
  return false;
}

function ProfileSettingsPage(props: { currentUser: AuthUser; currentPlayer: Player | null; changePassword: (data: FormData) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await props.changePassword(new FormData(event.currentTarget));
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Passwort konnte nicht geaendert werden.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-layout">
      <Panel title="Account">
        <div className="list-row"><span>Benutzername</span><strong>{props.currentUser.userName}</strong></div>
        <div className="list-row"><span>E-Mail</span><strong>{props.currentUser.email || "-"}</strong></div>
        <div className="list-row"><span>Spieler</span><strong>{props.currentPlayer?.name || "-"}</strong></div>
        <div className="lineup">{props.currentUser.roles.map((role) => <span className="chip" key={role}>{displayRole(role)}</span>)}</div>
      </Panel>
      <Panel title="Passwort">
        <form className="settings-form" onSubmit={submit}>
          {message && <div className="inline-error">{message}</div>}
          <label>Aktuelles Passwort<input required name="currentPassword" type="password" autoComplete="current-password" /></label>
          <label>Neues Passwort<input required name="newPassword" type="password" autoComplete="new-password" minLength={6} /></label>
          <label>Neues Passwort wiederholen<input required name="confirmPassword" type="password" autoComplete="new-password" minLength={6} /></label>
          <button className="primary-button" disabled={saving}>{saving ? "Speichern..." : "Passwort aendern"}</button>
        </form>
      </Panel>
    </section>
  );
}

function visibleTournaments(tournaments: Tournament[], user: AuthUser | null) {
  if (isAdmin(user) || isTournamentManager(user)) return tournaments;
  return tournaments.filter((tournament) => tournament.participants.some((participant) => participant.playerId === user?.playerId));
}

function LoginPage(props: { submit: (data: FormData, bootstrap?: boolean) => Promise<void>; error: string; setError: (value: string) => void }) {
  const [mode, setMode] = useState<"login" | "bootstrap">("login");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.setError("");
    try {
      await props.submit(new FormData(event.currentTarget), mode === "bootstrap");
    } catch (error) {
      props.setError(error instanceof Error ? error.message : "Anmeldung fehlgeschlagen");
    }
  }

  return (
    <main className="login-shell">
      <form className="login-panel" onSubmit={submit}>
        <div>
          <p className="eyebrow">Tischtennissparte</p>
          <h1>Spartenplaner Login</h1>
        </div>
        <div className="segmented">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button type="button" className={mode === "bootstrap" ? "active" : ""} onClick={() => setMode("bootstrap")}>Erster Admin</button>
        </div>
        {props.error && <div className="notice error">{props.error}</div>}
        <label>Benutzername<input required name="userName" autoComplete="username" /></label>
        {mode === "bootstrap" && <label>E-Mail<input name="email" type="email" autoComplete="email" /></label>}
        <label>Passwort<input required name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        <button className="primary-button">{mode === "login" ? "Einloggen" : "Admin anlegen"}</button>
      </form>
    </main>
  );
}

function Dashboard(props: {
  activePlayers: number;
  teams: Team[];
  fixtures: Fixture[];
  blocks: Block[];
  players: Player[];
  warnings: string[];
  setView: (view: ViewKey) => void;
}) {
  const upcoming = props.fixtures.slice(0, 6);
  const topPlayers = [...props.players].sort((a, b) => b.qttr - a.qttr).slice(0, 6);

  return (
    <>
      <section className="metrics">
        <article onClick={() => props.setView("players")}>
          <span>Aktive Spieler</span>
          <strong>{props.activePlayers}</strong>
        </article>
        <article onClick={() => props.setView("teams")}>
          <span>Mannschaften</span>
          <strong>{props.teams.length}</strong>
        </article>
        <article onClick={() => props.setView("fixtures")}>
          <span>Meine Punktspiele</span>
          <strong>{props.fixtures.length}</strong>
        </article>
        <article onClick={() => props.setView("blocks")}>
          <span>Sperrtermine</span>
          <strong>{props.blocks.length}</strong>
        </article>
      </section>
      <section className="dashboard-grid">
        <Panel title="Naechste Punktspiele">
          {upcoming.map((fixture) => (
            <div className="list-row" key={fixture.id}>
              <span>{fixture.opponent}</span>
              <strong>{formatDate(fixture.confirmedDate || fixture.preferredDates[0])}</strong>
            </div>
          ))}
        </Panel>
        <Panel title="QTTR Spitze">
          {topPlayers.map((player) => (
            <div className="list-row" key={player.id}>
              <span>{player.name}</span>
              <strong>{player.qttr}</strong>
            </div>
          ))}
        </Panel>
        <Panel title="Planungsrisiken">
          {props.warnings.length ? props.warnings.slice(0, 8).map((warning) => <div className="risk-row" key={warning}>{warning}</div>) : <Empty text="Keine akuten Risiken" />}
        </Panel>
      </section>
    </>
  );
}

function PlayersPage(props: {
  players: Player[];
  allPlayers: Player[];
  teams: Team[];
  selectedPlayers: Set<string>;
  setSelectedPlayers: (value: Set<string>) => void;
  playerSearch: string;
  setPlayerSearch: (value: string) => void;
  playerTeamFilter: string;
  setPlayerTeamFilter: (value: string) => void;
  playerStatusFilter: string;
  setPlayerStatusFilter: (value: string) => void;
  openDialog: (id?: string) => void;
  remove: (id: string) => void;
  bulkStatus: (status: string) => void;
}) {
  function toggle(id: string) {
    const next = new Set(props.selectedPlayers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    props.setSelectedPlayers(next);
  }

  return (
    <>
      <div className="toolbar">
        <input placeholder="Spieler suchen" value={props.playerSearch} onChange={(event) => props.setPlayerSearch(event.target.value)} />
        <select value={props.playerTeamFilter} onChange={(event) => props.setPlayerTeamFilter(event.target.value)}>
          <option value="all">Alle Mannschaften</option>
          {props.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
        <select value={props.playerStatusFilter} onChange={(event) => props.setPlayerStatusFilter(event.target.value)}>
          <option value="all">Alle Status</option>
          {statusOptions.map((status) => <option key={status}>{status}</option>)}
        </select>
        <button onClick={() => props.openDialog()}>Spieler anlegen</button>
      </div>
      {props.selectedPlayers.size > 0 && (
        <div className="bulk-bar">
          <span>{props.selectedPlayers.size} markiert</span>
          {statusOptions.map((status) => <button key={status} onClick={() => props.bulkStatus(status)}>{status}</button>)}
          <button onClick={() => props.setSelectedPlayers(new Set())}>Auswahl aufheben</button>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>QTTR</th>
              <th>Status</th>
              <th>Mannschaft</th>
              <th>Notiz</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {props.players.map((player) => (
              <tr key={player.id}>
                <td><input checked={props.selectedPlayers.has(player.id)} type="checkbox" onChange={() => toggle(player.id)} /></td>
                <td>{player.name}</td>
                <td>{player.qttr}</td>
                <td><span className={`status status-${player.status.toLowerCase()}`}>{player.status}</span></td>
                <td>{teamLabel(props.teams, player.teamId)}</td>
                <td>{player.seasonNote}</td>
                <td className="row-actions">
                  <button onClick={() => props.openDialog(player.id)}>Bearbeiten</button>
                  <button className="danger" onClick={() => props.remove(player.id)}>Loeschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TeamsPage(props: { teams: Team[]; players: Player[]; canManage: boolean; openDialog: (id?: string) => void; remove: (id: string) => void }) {
  const teams = [...props.teams].sort(compareTeamsByNumber);

  return (
    <>
      {props.canManage && <div className="toolbar">
        <button onClick={() => props.openDialog()}>Mannschaft erstellen</button>
      </div>}
      <section className="team-grid">
        {teams.map((team) => {
          const roster = teamPlayers(props.players, team.id);
          return (
            <article className="team-card" key={team.id}>
              <div className="panel-head">
                <div>
                  <h2>{team.name}</h2>
                  <span>{team.league} · Ziel {team.targetSize}</span>
                </div>
                {props.canManage && <div className="row-actions">
                  <button onClick={() => props.openDialog(team.id)}>Bearbeiten</button>
                  <button className="danger" onClick={() => props.remove(team.id)}>Loeschen</button>
                </div>}
              </div>
              {roster.map((player, index) => (
                <div className="list-row" key={player.id}>
                  <span>{index + 1}. {player.name}</span>
                  <strong>{player.qttr}</strong>
                </div>
              ))}
            </article>
          );
        })}
      </section>
    </>
  );
}

function FixturesPage(props: {
  fixtures: Fixture[];
  teams: Team[];
  currentUser: AuthUser;
  players: Player[];
  settings: Settings;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  canCreate: boolean;
  canEditFixture: (fixture: Fixture) => boolean;
  openDialog: (id?: string) => void;
  remove: (id: string) => void;
}) {
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const player = props.players.find((item) => item.id === props.currentUser.playerId) || null;
  const teamId = player?.teamId || null;
  const teamFixtures = teamId ? props.fixtures.filter((fixture) => fixture.teamId === teamId) : [];
  const filteredFixtures = teamFixtures
    .filter((fixture) => props.statusFilter === "all" || normalizeStatus(fixture.status) === props.statusFilter)
    .sort((a, b) => fixtureDate(a).localeCompare(fixtureDate(b)));
  const months = monthRange(props.settings.seasonStart, props.settings.seasonEnd);
  const [selectedMonth, setSelectedMonth] = useState(months[0] || new Date().toISOString().slice(0, 7));
  const visibleMonth = months.includes(selectedMonth) ? selectedMonth : months[0] || new Date().toISOString().slice(0, 7);
  const selectedFixture = filteredFixtures.find((fixture) => fixture.id === selectedFixtureId) || null;

  if (!props.currentUser.playerId || !player) {
    return <Panel title="Keine Spielerzuordnung"><Empty text="Dieser Account ist keinem Spieler zugeordnet. Deshalb koennen hier keine Punktspiele angezeigt werden." /></Panel>;
  }

  if (!teamId) {
    return <Panel title="Keine Mannschaft"><Empty text="Der zugeordnete Spieler ist keiner Mannschaft zugeordnet. Deshalb koennen hier keine Punktspiele angezeigt werden." /></Panel>;
  }

  return (
    <>
      <div className="toolbar">
        {props.canCreate && <button onClick={() => props.openDialog()}>Punktspiel erstellen</button>}
        <select value={visibleMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
          {months.map((month) => <option key={month} value={month}>{formatMonth(`${month}-01`)}</option>)}
        </select>
        <select value={props.statusFilter} onChange={(event) => props.setStatusFilter(event.target.value)}>
          <option value="all">Alle Status</option>
          {fixtureStatuses.map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}
        </select>
      </div>
      <FixtureCalendar
        fixtures={filteredFixtures}
        teams={props.teams}
        startDate={props.settings.seasonStart}
        endDate={props.settings.seasonEnd}
        month={visibleMonth}
        onSelectFixture={setSelectedFixtureId}
      />
      {selectedFixture && (
        <FixtureDetailDialog
          fixture={selectedFixture}
          teams={props.teams}
          close={() => setSelectedFixtureId(null)}
          canEdit={props.canEditFixture(selectedFixture)}
          edit={() => {
            setSelectedFixtureId(null);
            props.openDialog(selectedFixture.id);
          }}
          remove={props.canEditFixture(selectedFixture) ? () => {
            setSelectedFixtureId(null);
            props.remove(selectedFixture.id);
          } : undefined}
        />
      )}
    </>
  );
}

function CalendarPage(props: {
  teams: Team[];
  players: Player[];
  blocks: Block[];
  fixtures: Fixture[];
  settings: Settings;
  canEditFixture: (fixture: Fixture) => boolean;
  openFixture: (id: string) => void;
  openBlock: () => void;
}) {
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const selectedFixture = props.fixtures.find((fixture) => fixture.id === selectedFixtureId) || null;
  const months = monthRange(props.settings.seasonStart, props.settings.seasonEnd);
  const [selectedMonth, setSelectedMonth] = useState(months[0] || new Date().toISOString().slice(0, 7));
  const visibleMonth = months.includes(selectedMonth) ? selectedMonth : months[0] || new Date().toISOString().slice(0, 7);

  return (
    <>
      <div className="toolbar">
        <select value={visibleMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
          {months.map((month) => <option key={month} value={month}>{formatMonth(`${month}-01`)}</option>)}
        </select>
        <button onClick={props.openBlock}>Sperrtermin eintragen</button>
      </div>
      <FixtureCalendar
        fixtures={props.fixtures}
        teams={props.teams}
        startDate={props.settings.seasonStart}
        endDate={props.settings.seasonEnd}
        month={visibleMonth}
        onSelectFixture={setSelectedFixtureId}
      />
      {selectedFixture && (
        <FixtureDetailDialog
          fixture={selectedFixture}
          teams={props.teams}
          close={() => setSelectedFixtureId(null)}
          canEdit={props.canEditFixture(selectedFixture)}
          edit={() => {
            setSelectedFixtureId(null);
            props.openFixture(selectedFixture.id);
          }}
        />
      )}
    </>
  );
}

function FixtureCalendar(props: {
  fixtures: Fixture[];
  teams: Team[];
  startDate: string;
  endDate: string;
  month?: string;
  onSelectFixture: (id: string) => void;
}) {
  const fixturesByDate = useMemo(() => {
    return props.fixtures.reduce<Record<string, Fixture[]>>((result, fixture) => {
      const date = fixtureDate(fixture);
      if (!date) return result;
      result[date] = [...(result[date] || []), fixture];
      return result;
    }, {});
  }, [props.fixtures]);
  const months = props.month ? [props.month] : monthRange(props.startDate, props.endDate);

  return (
    <section className="month-calendar-list">
      {months.map((month) => (
        <article className="month-calendar" key={month}>
          <div className="month-title">{formatMonth(`${month}-01`)}</div>
          <div className="month-weekdays">
            {calendarWeekdays.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="month-grid">
            {monthCalendarDays(month).map((date) => {
              const isOutsideMonth = !date.startsWith(month);
              const dayFixtures = isOutsideMonth ? [] : fixturesByDate[date] || [];
              return (
                <div className={`month-day ${isOutsideMonth ? "outside-month" : ""}`} key={date}>
                  <span className="day-number">{new Date(`${date}T00:00:00`).getDate()}</span>
                  <div className="day-fixtures">
                    {dayFixtures.map((fixture) => (
                      <button className="calendar-fixture-button" key={fixture.id} onClick={() => props.onSelectFixture(fixture.id)}>
                        {teamLabel(props.teams, fixture.teamId)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      ))}
      {!props.fixtures.length && <Panel title="Keine Spiele"><Empty text="Fuer den aktuellen Filter sind keine Punktspiele eingetragen" /></Panel>}
    </section>
  );
}

function FixtureDetailDialog(props: {
  fixture: Fixture;
  teams: Team[];
  close: () => void;
  canEdit: boolean;
  edit: () => void;
  remove?: () => void;
}) {
  return (
    <div className="dialog-backdrop">
      <section className="dialog fixture-detail-dialog">
        <div className="dialog-head">
          <h2>{teamLabel(props.teams, props.fixture.teamId)} gegen {props.fixture.opponent}</h2>
          <button type="button" onClick={props.close}>x</button>
        </div>
        <div className="detail-grid">
          <div><span>Mannschaft</span><strong>{teamLabel(props.teams, props.fixture.teamId)}</strong></div>
          <div><span>Gegner</span><strong>{props.fixture.opponent}</strong></div>
          <div><span>Termin</span><strong>{formatDateTime(props.fixture.confirmedDate || props.fixture.preferredDates[0])}</strong></div>
          <div><span>Ort</span><strong>{displayVenue(props.fixture.venue)}</strong></div>
          <div><span>Status</span><strong>{displayStatus(props.fixture.status)}</strong></div>
          <div><span>Halle</span><strong>{props.fixture.hall || "-"}</strong></div>
        </div>
        <menu>
          {props.remove && <button className="danger" type="button" onClick={props.remove}>Loeschen</button>}
          <span></span>
          <button type="button" onClick={props.close}>Schliessen</button>
          {props.canEdit && <button className="primary-button" type="button" onClick={props.edit}>Bearbeiten</button>}
        </menu>
      </section>
    </div>
  );
}

function SeasonPage(props: { teams: Team[]; players: Player[]; fixtures: Fixture[]; blocks: Block[]; warnings: string[]; settings: Settings; setView: (view: ViewKey) => void }) {
  const unassigned = props.players.filter((player) => !player.teamId);
  const openFixtures = props.fixtures.filter((fixture) => normalizeStatus(fixture.status) !== "bestaetigt");

  return (
    <section className="planning-grid">
      <Panel title="Saison-Assistent">
        <ActionRow done={props.teams.length > 0} text="Mannschaften angelegt" onClick={() => props.setView("teams")} />
        <ActionRow done={unassigned.length === 0} text={`${unassigned.length} Spieler ohne Mannschaft`} onClick={() => props.setView("players")} />
        <ActionRow done={openFixtures.length === 0} text={`${openFixtures.length} offene Punktspiele`} onClick={() => props.setView("fixtures")} />
        <ActionRow done={props.warnings.length === 0} text={`${props.warnings.length} TTVN-Hinweise`} onClick={() => props.setView("teams")} />
      </Panel>
      <Panel title="Planungsrisiken">
        {props.warnings.length ? props.warnings.map((warning) => <div className="risk-row" key={warning}>{warning}</div>) : <Empty text="Keine Risiken" />}
      </Panel>
      <Panel title="Spieler ohne Mannschaft">
        {unassigned.map((player) => <div className="list-row" key={player.id}><span>{player.name}</span><strong>{player.qttr}</strong></div>)}
      </Panel>
      <Panel title="Zeitraum">
        <div className="list-row"><span>Start</span><strong>{formatDate(props.settings.seasonStart)}</strong></div>
        <div className="list-row"><span>Ende</span><strong>{formatDate(props.settings.seasonEnd)}</strong></div>
      </Panel>
    </section>
  );
}

function BlocksPage(props: { blocks: Block[]; players: Player[]; currentPlayer: Player | null; canManageAll: boolean; remove: (id: string) => void; openDialog: () => void }) {
  const blocks = props.canManageAll ? props.blocks : props.blocks.filter((block) => block.playerId === props.currentPlayer?.id);
  return (
    <>
      <div className="toolbar"><button onClick={props.openDialog}>Sperrtermin erstellen</button></div>
      <section className="block-grid">
        {blocks.sort((a, b) => isoDate(a.date).localeCompare(isoDate(b.date))).map((block) => (
          <article className="panel" key={block.id}>
            <h2>{playerLabel(props.players, block.playerId)}</h2>
            <p>{formatDate(block.date)}</p>
            <span>{block.reason}</span>
            <button className="danger" onClick={() => props.remove(block.id)}>Loeschen</button>
          </article>
        ))}
      </section>
    </>
  );
}

function TournamentsPage(props: { tournaments: Tournament[]; canManage: boolean; openDialog: () => void }) {
  return (
    <>
      <div className="toolbar">
        {props.canManage ? <button onClick={props.openDialog}>Turnier erstellen</button> : <span className="muted-note">Nur Turniere mit eigener Teilnahme werden angezeigt.</span>}
      </div>
      <section className="dashboard-grid">
        {props.tournaments.map((tournament) => (
          <Panel title={tournament.name} key={tournament.id}>
            <div className="list-row"><span>Modus</span><strong>{tournament.mode}</strong></div>
            <div className="list-row"><span>Status</span><strong>{tournament.status}</strong></div>
            <div className="list-row"><span>Start</span><strong>{formatDate(tournament.startDate)}</strong></div>
          </Panel>
        ))}
        {!props.tournaments.length && <Panel title="Keine Turniere"><Empty text="Noch keine Turniere vorhanden" /></Panel>}
      </section>
    </>
  );
}

function AccountsPage(props: { users: AuthUser[]; players: Player[]; roles: AppRole[]; openDialog: (id?: string) => void }) {
  return (
    <>
      <div className="toolbar">
        <button onClick={() => props.openDialog()}>Account anlegen</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Benutzername</th>
              <th>E-Mail</th>
              <th>Spieler</th>
              <th>Rollen</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {props.users.map((user) => (
              <tr key={user.id}>
                <td>{user.userName}</td>
                <td>{user.email || "-"}</td>
                <td>{playerLabel(props.players, user.playerId)}</td>
                <td><div className="lineup">{user.roles.map((role) => <span className="chip" key={role}>{displayRole(role)}</span>)}</div></td>
                <td>{user.isActive ? "aktiv" : "gesperrt"}</td>
                <td><button onClick={() => props.openDialog(user.id)}>Bearbeiten</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!props.roles.length && <Empty text="Keine Rollen geladen" />}
    </>
  );
}

function displayRole(role: string) {
  if (role === "Mannschaftsfuehrer") return "Mannschaftsfuehrer";
  return role;
}

function SettingsPage(props: {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  seasons: Season[];
  openSeason: (id?: string) => void;
  exportJson: () => void;
  exportPlayersCsv: () => void;
  exportFixturesCsv: () => void;
  printCurrentView: () => void;
}) {
  function updateSlot(id: string, patch: Partial<HallSlot>) {
    props.setSettings({ ...props.settings, hallSlots: props.settings.hallSlots.map((slot) => slot.id === id ? { ...slot, ...patch } : slot) });
  }

  return (
    <section className="settings-layout">
      <Panel title="Saison">
        {props.seasons.map((season) => (
          <div className="list-row" key={season.id}>
            <span>{season.label}</span>
            <button onClick={() => props.openSeason(season.id)}>Bearbeiten</button>
          </div>
        ))}
        <button onClick={() => props.openSeason()}>Saison anlegen</button>
      </Panel>
      <Panel title="Hallenzeiten">
        {props.settings.hallSlots.map((slot) => (
          <div className="hall-slot-row" key={slot.id}>
            <select value={slot.weekday} onChange={(event) => updateSlot(slot.id, { weekday: Number(event.target.value) })}>
              {weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}
            </select>
            <input value={slot.hall} onChange={(event) => updateSlot(slot.id, { hall: event.target.value })} />
            <input value={slot.court} onChange={(event) => updateSlot(slot.id, { court: event.target.value })} />
            <input value={slot.time} onChange={(event) => updateSlot(slot.id, { time: event.target.value })} />
            <button className="danger" onClick={() => props.setSettings({ ...props.settings, hallSlots: props.settings.hallSlots.filter((item) => item.id !== slot.id) })}>Loeschen</button>
          </div>
        ))}
        <button onClick={() => props.setSettings({ ...props.settings, hallSlots: [...props.settings.hallSlots, { id: crypto.randomUUID(), weekday: 1, hall: "", court: "", time: "19:30" }] })}>Hallenzeit hinzufuegen</button>
      </Panel>
      <Panel title="Daten">
        <div className="data-actions">
          <button onClick={props.exportJson}>JSON exportieren</button>
          <button onClick={props.exportPlayersCsv}>Spieler CSV</button>
          <button onClick={props.exportFixturesCsv}>Punktspiele CSV</button>
          <button onClick={props.printCurrentView}>Drucken</button>
        </div>
      </Panel>
    </section>
  );
}

function EntryDialog(props: {
  dialog: DialogState;
  players: Player[];
  teams: Team[];
  fixtures: Fixture[];
  blocks: Block[];
  seasons: Season[];
  settings: Settings;
  currentUser: AuthUser;
  users: AuthUser[];
  roles: AppRole[];
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  remove: (kind: DialogKind, id: string) => void;
}) {
  if (!props.dialog) return null;
  const { kind, id } = props.dialog;
  const player = props.players.find((item) => item.id === id);
  const team = props.teams.find((item) => item.id === id);
  const fixture = props.fixtures.find((item) => item.id === id);
  const season = props.seasons.find((item) => item.id === id);
  const user = props.users.find((item) => item.id === id);
  const title = `${id ? "Bearbeiten" : "Neu"}: ${kind}`;
  const blockPlayers = isClubManager(props.currentUser) ? props.players : props.players.filter((item) => item.id === props.currentUser.playerId);
  const fixtureTeams = isAdmin(props.currentUser)
    ? props.teams
    : props.teams.filter((team) => team.id === managedTeamId(props.currentUser, props.players));

  return (
    <div className="dialog-backdrop">
      <form className="dialog" onSubmit={props.submit}>
        <div className="dialog-head">
          <h2>{title}</h2>
          <button type="button" onClick={props.close}>×</button>
        </div>
        <input type="hidden" name="id" value={id || ""} />
        {kind === "player" && (
          <>
            <label>Name<input required name="name" defaultValue={player?.name || ""} /></label>
            <label>QTTR<input required name="qttr" type="number" defaultValue={player?.qttr || 0} /></label>
            <label>QTTR-Stichtag<input name="qttrDate" type="date" defaultValue={isoDate(player?.qttrDate) || new Date().toISOString().slice(0, 10)} /></label>
            <label>Status<select name="status" defaultValue={player?.status || "aktiv"}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label>Mannschaft<select name="teamId" defaultValue={player?.teamId || ""}><option value="">Ohne Mannschaft</option>{props.teams.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Notiz<input name="seasonNote" defaultValue={player?.seasonNote || ""} /></label>
          </>
        )}
        {kind === "team" && (
          <>
            <label>Name<input required name="name" defaultValue={team?.name || ""} /></label>
            <label>Liga<select name="league" defaultValue={team?.league || "Kreisliga"}>{leagues.map((league) => <option key={league}>{league}</option>)}</select></label>
            <label>Zielgroesse<input name="targetSize" type="number" defaultValue={team?.targetSize || 4} /></label>
            <label>Saison<select name="seasonId" defaultValue={team?.seasonId || ""}><option value="">Keine</option>{props.seasons.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          </>
        )}
        {kind === "fixture" && (
          <>
            <label>Mannschaft<select required name="teamId" defaultValue={fixture?.teamId || fixtureTeams[0]?.id || ""}>{fixtureTeams.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Gegner<input required name="opponent" defaultValue={fixture?.opponent || ""} /></label>
            <label>Ort<select name="venue" defaultValue={displayVenue(fixture?.venue || "Heim")}><option>Heim</option><option>Auswärts</option></select></label>
            <label>Status<select name="status" defaultValue={normalizeStatus(fixture?.status || "offen")}>{fixtureStatuses.map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}</select></label>
            <label>Bestaetigter Termin<input name="confirmedDate" type="date" defaultValue={isoDate(fixture?.confirmedDate)} /></label>
            <label>Terminvorschlaege<textarea name="preferredDates" defaultValue={(fixture?.preferredDates || []).map(isoDate).join("\n")} /></label>
            <label>Halle<input name="hall" defaultValue={fixture?.hall || ""} /></label>
          </>
        )}
        {kind === "block" && (
          <>
            <label>Spieler<select required name="playerId" defaultValue={props.currentUser.playerId || ""}>{blockPlayers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Von<input required name="dateStart" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
            <label>Bis<input required name="dateEnd" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
            <label>Grund<input name="reason" defaultValue="Sperrtermin" /></label>
          </>
        )}
        {kind === "season" && (
          <>
            <label>Name<input required name="label" defaultValue={season?.label || "Hinrunde 26/27"} /></label>
            <label>Start<input required name="startDate" type="date" defaultValue={isoDate(season?.startDate) || props.settings.seasonStart} /></label>
            <label>Ende<input required name="endDate" type="date" defaultValue={isoDate(season?.endDate) || props.settings.seasonEnd} /></label>
            <label className="check"><input name="excludeHolidays" type="checkbox" defaultChecked={season?.excludeHolidays ?? props.settings.excludeHolidays} /> Feiertage ausschliessen</label>
            <label className="check"><input name="excludeSchoolBreaks" type="checkbox" defaultChecked={season?.excludeSchoolBreaks ?? props.settings.excludeSchoolBreaks} /> Ferien ausschliessen</label>
          </>
        )}
        {kind === "tournament" && (
          <>
            <label>Name<input required name="name" /></label>
            <label>Modus<select name="mode"><option>Gruppenphase</option><option>K.o.-System</option><option>Schweizer System</option></select></label>
            <label>Start<input required name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
            <label>Ende<input name="endDate" type="date" /></label>
            <label>Saison<select name="seasonId"><option value="">Keine</option>{props.seasons.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          </>
        )}
        {kind === "user" && (
          <>
            <label>Benutzername<input required name="userName" defaultValue={user?.userName || ""} /></label>
            <label>E-Mail<input name="email" type="email" defaultValue={user?.email || ""} /></label>
            <label>Passwort<input name="password" type="password" required={!id} placeholder={id ? "Leer lassen, wenn unveraendert" : ""} /></label>
            <label>Verknuepfter Spieler<select name="playerId" defaultValue={user?.playerId || ""}><option value="">Kein Spieler</option>{props.players.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="check"><input name="isActive" type="checkbox" defaultChecked={user?.isActive ?? true} /> Aktiv</label>
            <div className="role-checks">
              {props.roles.map((role) => (
                <label className="check" key={role.name}>
                  <input name="roles" type="checkbox" value={role.name} defaultChecked={user?.roles.includes(role.name) || (!id && role.name === "Spieler")} />
                  {displayRole(role.name)}
                </label>
              ))}
            </div>
          </>
        )}
        <menu>
          {id && kind !== "user" && <button className="danger" type="button" onClick={() => props.remove(kind, id)}>Loeschen</button>}
          <span></span>
          <button type="button" onClick={props.close}>Abbrechen</button>
          <button className="primary-button">Speichern</button>
        </menu>
      </form>
    </div>
  );
}

function Panel(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-head"><h2>{props.title}</h2></div>
      {props.children}
    </section>
  );
}

function Empty(props: { text: string }) {
  return <div className="empty-state">{props.text}</div>;
}

function ActionRow(props: { done: boolean; text: string; onClick: () => void }) {
  return (
    <button className={`action-row ${props.done ? "done" : ""}`} onClick={props.onClick}>
      <span>{props.done ? "OK" : "!"}</span>
      <strong>{props.text}</strong>
    </button>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

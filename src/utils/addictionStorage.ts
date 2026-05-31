import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@ayna/addiction_sessions';

// One resistance attempt: from "I'm quitting" to relapse (or still active)
export interface AddictionSession {
  id: string;
  goalId: string;
  startTime: number;        // ms timestamp — when the user started resisting
  endTime: number | null;   // null = session is currently active
  durationMs: number | null; // null if still active, calculated on relapse
}

export interface AddictionStats {
  totalSessions: number;
  // Current active session
  currentSessionStart: number | null; // null if no active session
  // Personal records (based on completed sessions)
  personalBestMs: number | null; // longest completed session, null if none
  // All-time
  allDurationsMs: number[]; // sorted descending — top sessions for history view
}

// Utility: format a duration in ms to a human-readable Turkish string
// e.g. 90061000 → "1 gün 1 sa 1 dk"
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} gün`);
  if (hours > 0) parts.push(`${hours} sa`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} dk`);

  return parts.join(' ');
}

const addictionStorage = {
  async getAll(): Promise<AddictionSession[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  },

  // Begin a new resistance session. Ends any previously active session for this goal first.
  async startSession(goalId: string): Promise<AddictionSession> {
    const all = await this.getAll();

    // Close any orphaned active session (edge case)
    const now = Date.now();
    let changed = false;
    for (const s of all) {
      if (s.goalId === goalId && s.endTime === null) {
        s.endTime = now;
        s.durationMs = now - s.startTime;
        changed = true;
      }
    }

    const session: AddictionSession = {
      id: `addiction_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      goalId,
      startTime: now,
      endTime: null,
      durationMs: null,
    };
    all.push(session);
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
    return session;
  },

  // Get the currently active (ongoing) session for a goal, if any
  async getActiveSession(goalId: string): Promise<AddictionSession | null> {
    const all = await this.getAll();
    return all.find(s => s.goalId === goalId && s.endTime === null) ?? null;
  },

  // Record a relapse — ends the active session and logs the duration
  async relapse(goalId: string): Promise<AddictionSession | null> {
    const all = await this.getAll();
    const idx = all.findIndex(s => s.goalId === goalId && s.endTime === null);
    if (idx === -1) return null;

    const now = Date.now();
    all[idx] = {
      ...all[idx],
      endTime: now,
      durationMs: now - all[idx].startTime,
    };
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },

  // Update the start time of the currently active session (backdating)
  async updateSessionStart(goalId: string, newStartTime: number): Promise<void> {
    const all = await this.getAll();
    const idx = all.findIndex(s => s.goalId === goalId && s.endTime === null);
    if (idx === -1) return;
    all[idx] = { ...all[idx], startTime: newStartTime };
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  },

  // Record a relapse at a specific past time (backdating)
  async relapseAt(goalId: string, relapseTime: number): Promise<AddictionSession | null> {
    const all = await this.getAll();
    const idx = all.findIndex(s => s.goalId === goalId && s.endTime === null);
    if (idx === -1) return null;
    const durationMs = relapseTime - all[idx].startTime;
    all[idx] = {
      ...all[idx],
      endTime: relapseTime,
      durationMs: durationMs > 0 ? durationMs : 0,
    };
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },

  // Start a new session at a specific past time (backdating)
  async startSessionAt(goalId: string, startTime: number): Promise<AddictionSession> {
    const all = await this.getAll();
    // Close any lingering active session for this goal
    for (const s of all) {
      if (s.goalId === goalId && s.endTime === null) {
        s.endTime = startTime;
        s.durationMs = Math.max(0, startTime - s.startTime);
      }
    }
    const session: AddictionSession = {
      id: `addiction_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      goalId,
      startTime,
      endTime: null,
      durationMs: null,
    };
    all.push(session);
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
    return session;
  },

  async getByGoal(goalId: string): Promise<AddictionSession[]> {
    const all = await this.getAll();
    return all
      .filter(s => s.goalId === goalId)
      .sort((a, b) => b.startTime - a.startTime);
  },

  async getStats(goalId: string): Promise<AddictionStats> {
    const sessions = await this.getByGoal(goalId);
    const totalSessions = sessions.length;

    const active = sessions.find(s => s.endTime === null);
    const currentSessionStart = active?.startTime ?? null;

    const completed = sessions.filter(s => s.durationMs !== null);
    const personalBestMs =
      completed.length > 0 ? Math.max(...completed.map(s => s.durationMs!)) : null;

    const allDurationsMs = completed
      .map(s => s.durationMs!)
      .sort((a, b) => b - a);

    return { totalSessions, currentSessionStart, personalBestMs, allDurationsMs };
  },
};

export default addictionStorage;

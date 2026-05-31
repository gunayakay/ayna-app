import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HabitFrequency } from './goalStorage';

const KEY = '@ayna/battles';

// One check-in event for a habit goal
export interface HabitBattle {
  id: string;
  goalId: string;
  timestamp: number; // ms — exact moment of check-in
  value: number;     // how much the user recorded
  maxValue: number;  // target at time of recording
  won: boolean;      // value >= maxValue
}

export interface HabitStats {
  totalCheckIns: number;
  // Period-aware metrics (period = day | week | interval window)
  totalWonPeriods: number;     // how many periods were "won"
  winRate: number;             // 0-100
  personalBestConsecutive: number; // best ever consecutive won periods
  thisMonthWins: number;           // won periods in the current calendar month
}

// ─── Period key helpers ───────────────────────────────────────────────────────

function getDayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekKey(ts: number): string {
  const d = new Date(ts);
  // ISO week: Monday as first day
  const day = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon … 7=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  return `${monday.getFullYear()}-W${String(Math.ceil(
    ((monday.getTime() - new Date(monday.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
  )).padStart(2, '0')}`;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const battleStorage = {
  async getAll(): Promise<HabitBattle[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async save(battle: Omit<HabitBattle, 'id'>): Promise<HabitBattle> {
    const all = await this.getAll();
    const newBattle: HabitBattle = {
      ...battle,
      id: `battle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    all.push(newBattle);
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
    return newBattle;
  },

  async getByGoal(goalId: string): Promise<HabitBattle[]> {
    const all = await this.getAll();
    return all
      .filter(b => b.goalId === goalId)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  async getStats(goalId: string, frequency: HabitFrequency): Promise<HabitStats> {
    const battles = await this.getByGoal(goalId);
    const totalCheckIns = battles.length;

    if (totalCheckIns === 0) {
      return { totalCheckIns: 0, totalWonPeriods: 0, winRate: 0, personalBestConsecutive: 0, thisMonthWins: 0 };
    }

    const sorted = [...battles].sort((a, b) => a.timestamp - b.timestamp);

    let wonPeriodKeys: string[] = [];

    if (frequency.type === 'daily') {
      // One battle per day; won if any check-in on that day has won = true
      const byDay = groupBy(sorted, b => getDayKey(b.timestamp));
      wonPeriodKeys = Object.entries(byDay)
        .filter(([, entries]) => entries.some(b => b.won))
        .map(([key]) => key);

    } else if (frequency.type === 'weekly') {
      // Multiple battles per week; week won if won check-ins >= timesPerWeek
      const { timesPerWeek } = frequency;
      const byWeek = groupBy(sorted, b => getWeekKey(b.timestamp));
      wonPeriodKeys = Object.entries(byWeek)
        .filter(([, entries]) => entries.filter(b => b.won).length >= timesPerWeek)
        .map(([key]) => key);

    } else {
      // interval: won if the check-in itself was won (value >= maxValue)
      // Each check-in is its own "period"
      wonPeriodKeys = sorted.filter(b => b.won).map(b => String(b.timestamp));
    }

    const totalWonPeriods = wonPeriodKeys.length;

    // Total periods (denominator for win rate)
    let totalPeriods: number;
    if (frequency.type === 'daily') {
      const allKeys = new Set(sorted.map(b => getDayKey(b.timestamp)));
      totalPeriods = allKeys.size;
    } else if (frequency.type === 'weekly') {
      const allKeys = new Set(sorted.map(b => getWeekKey(b.timestamp)));
      totalPeriods = allKeys.size;
    } else {
      totalPeriods = totalCheckIns;
    }

    const winRate = totalPeriods > 0 ? Math.round((totalWonPeriods / totalPeriods) * 100) : 0;

    // Personal best consecutive won periods
    const sortedWonKeys = [...wonPeriodKeys].sort();
    const personalBestConsecutive = longestConsecutiveRun(sortedWonKeys, frequency);

    // This month's won periods
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthWins = wonPeriodKeys.filter(k => k.startsWith(monthPrefix)).length;

    return { totalCheckIns, totalWonPeriods, winRate, personalBestConsecutive, thisMonthWins };
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// For daily/weekly keys (lexicographically sortable), count the longest run
// of consecutive periods where all were won.
function longestConsecutiveRun(sortedKeys: string[], frequency: HabitFrequency): number {
  if (sortedKeys.length === 0) return 0;
  if (frequency.type === 'interval') return sortedKeys.length; // every won session is consecutive

  let best = 1;
  let current = 1;

  for (let i = 1; i < sortedKeys.length; i++) {
    const prev = sortedKeys[i - 1];
    const curr = sortedKeys[i];

    const isNext = frequency.type === 'daily'
      ? isDayAfter(prev, curr)
      : isWeekAfter(prev, curr);

    if (isNext) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }

  return best;
}

function isDayAfter(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  da.setDate(da.getDate() + 1);
  return da.toISOString().slice(0, 10) === b;
}

function isWeekAfter(a: string, b: string): boolean {
  // Keys look like "2026-W08" — just check numeric increment
  const [yearA, weekA] = a.split('-W').map(Number);
  const [yearB, weekB] = b.split('-W').map(Number);
  if (yearB === yearA && weekB === weekA + 1) return true;
  if (yearB === yearA + 1 && weekA >= 52 && weekB === 1) return true;
  return false;
}

export default battleStorage;

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACTIVE_GOALS: '@ayna/active_goals',
  CONFRONTATION_LOGS: '@ayna/confrontation_logs',
  GOAL_SETTINGS: '@ayna/goal_settings',
  GOAL_CATEGORIES: '@ayna/goal_categories',
  ADDICTION_CONFIG: '@ayna/addiction_config',
} as const;

export type GoalCategory = 'habit' | 'addiction';

// How a bağımlılık goal is approached:
// - abstinence: tamamen bırak (direnç turu + kişisel rekor)
// - limit: sınırla (periyot başına izin, kademeli azaltma)
export type AddictionMode = 'abstinence' | 'limit';

// Sınırlama periyodu: yüksek-sıklıklı için günlük, seyrek için haftalık
export type LimitPeriod = 'daily' | 'weekly';

export interface AddictionConfig {
  mode: AddictionMode;
  limitPeriod?: LimitPeriod; // yalnızca 'limit' modunda
  limit?: number;            // periyot başına izin sayısı
}

// How often a habit is expected to be done
export type HabitFrequency =
  | { type: 'daily' }                        // Her gün
  | { type: 'weekly'; timesPerWeek: number } // Haftada X kez
  | { type: 'interval'; hours: number };     // Her X saatte bir

export interface GoalSettings {
  targetValue: number;
  frequency: HabitFrequency;
}

export interface ConfrontationLog {
  goalId: string;
  reasons: string[];
  notes: string;
  date: string;
}

export const goalStorage = {
  async getActiveGoals(): Promise<string[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_GOALS);
    return raw ? JSON.parse(raw) : [];
  },

  async addGoal(goalId: string): Promise<void> {
    const goals = await this.getActiveGoals();
    if (!goals.includes(goalId)) {
      goals.push(goalId);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_GOALS, JSON.stringify(goals));
    }
  },

  async removeGoal(goalId: string): Promise<void> {
    const goals = await this.getActiveGoals();
    const filtered = goals.filter(id => id !== goalId);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_GOALS, JSON.stringify(filtered));
  },

  async saveConfrontationLog(log: ConfrontationLog): Promise<void> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONFRONTATION_LOGS);
    const logs: ConfrontationLog[] = raw ? JSON.parse(raw) : [];
    logs.push(log);
    await AsyncStorage.setItem(STORAGE_KEYS.CONFRONTATION_LOGS, JSON.stringify(logs));
  },

  async getConfrontationLogs(goalId?: string): Promise<ConfrontationLog[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONFRONTATION_LOGS);
    const logs: ConfrontationLog[] = raw ? JSON.parse(raw) : [];
    return goalId ? logs.filter(l => l.goalId === goalId) : logs;
  },

  async saveGoalSettings(goalId: string, settings: GoalSettings): Promise<void> {
    const all = await this.getAllGoalSettings();
    all[goalId] = settings;
    await AsyncStorage.setItem(STORAGE_KEYS.GOAL_SETTINGS, JSON.stringify(all));
  },

  async getGoalSettings(goalId: string): Promise<GoalSettings | null> {
    const all = await this.getAllGoalSettings();
    return all[goalId] || null;
  },

  async getAllGoalSettings(): Promise<Record<string, GoalSettings>> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GOAL_SETTINGS);
    return raw ? JSON.parse(raw) : {};
  },

  async setGoalCategory(goalId: string, category: GoalCategory): Promise<void> {
    const all = await this.getAllGoalCategories();
    all[goalId] = category;
    await AsyncStorage.setItem(STORAGE_KEYS.GOAL_CATEGORIES, JSON.stringify(all));
  },

  async getGoalCategory(goalId: string): Promise<GoalCategory> {
    const all = await this.getAllGoalCategories();
    return all[goalId] ?? 'habit';
  },

  async getAllGoalCategories(): Promise<Record<string, GoalCategory>> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GOAL_CATEGORIES);
    return raw ? JSON.parse(raw) : {};
  },

  async setAddictionConfig(goalId: string, config: AddictionConfig): Promise<void> {
    const all = await this.getAllAddictionConfigs();
    all[goalId] = config;
    await AsyncStorage.setItem(STORAGE_KEYS.ADDICTION_CONFIG, JSON.stringify(all));
  },

  async getAddictionConfig(goalId: string): Promise<AddictionConfig> {
    const all = await this.getAllAddictionConfigs();
    return all[goalId] ?? { mode: 'abstinence' };
  },

  async getAllAddictionConfigs(): Promise<Record<string, AddictionConfig>> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ADDICTION_CONFIG);
    return raw ? JSON.parse(raw) : {};
  },
};

export default goalStorage;

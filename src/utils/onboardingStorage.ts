import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@ayna/onboarding_completed',
  SELECTED_CATEGORIES: '@ayna/selected_categories',
  SELECTED_ACTIONS: '@ayna/selected_actions',
  SELECTED_BLOCKERS: '@ayna/selected_blockers',
  DISCIPLINE_LEVEL: '@ayna/discipline_level',
  USER_NAME: '@ayna/user_name',
} as const;

export interface OnboardingData {
  categories: string[];
  actions: string[];
  blockers: string[];
  disciplineLevel: number;
  userName: string;
}

export const onboardingStorage = {
  async saveCategories(categories: string[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORIES, JSON.stringify(categories));
  },

  async saveActions(actions: string[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ACTIONS, JSON.stringify(actions));
  },

  async saveBlockers(blockers: string[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_BLOCKERS, JSON.stringify(blockers));
  },

  async saveDisciplineLevel(level: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DISCIPLINE_LEVEL, level.toString());
  },

  async saveUserName(name: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  },

  async markOnboardingCompleted(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  },

  async isOnboardingCompleted(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  },

  async getOnboardingData(): Promise<OnboardingData | null> {
    try {
      const [categories, actions, blockers, disciplineLevel, userName] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_BLOCKERS),
        AsyncStorage.getItem(STORAGE_KEYS.DISCIPLINE_LEVEL),
        AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
      ]);

      if (!categories || !actions || !userName) {
        return null;
      }

      return {
        categories: JSON.parse(categories),
        actions: JSON.parse(actions),
        blockers: blockers ? JSON.parse(blockers) : [],
        disciplineLevel: disciplineLevel ? parseInt(disciplineLevel, 10) : 50,
        userName,
      };
    } catch {
      return null;
    }
  },

  async clearOnboardingData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      STORAGE_KEYS.SELECTED_CATEGORIES,
      STORAGE_KEYS.SELECTED_ACTIONS,
      STORAGE_KEYS.SELECTED_BLOCKERS,
      STORAGE_KEYS.DISCIPLINE_LEVEL,
      STORAGE_KEYS.USER_NAME,
    ]);
  },
};

export default onboardingStorage;

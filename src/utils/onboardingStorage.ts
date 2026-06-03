import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@ayna/onboarding_completed',
  SELECTED_CATEGORIES: '@ayna/selected_categories',
  SELECTED_ACTIONS: '@ayna/selected_actions',
  SELECTED_BLOCKERS: '@ayna/selected_blockers',
  DISCIPLINE_LEVEL: '@ayna/discipline_level',
  USER_NAME: '@ayna/user_name',
  AVATAR_URI: '@ayna/avatar_uri',
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

  async getUserName(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
  },

  async saveAvatarUri(uri: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AVATAR_URI, uri);
  },

  async getAvatarUri(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.AVATAR_URI);
  },

  async clearAvatarUri(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AVATAR_URI);
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

      // v1 onboarding yalnızca ismi toplar; categories/actions adımları kaldırıldı.
      // Bu yüzden tek zorunlu alan userName — yoksa onboarding yapılmamış sayılır.
      if (!userName) {
        return null;
      }

      return {
        categories: categories ? JSON.parse(categories) : [],
        actions: actions ? JSON.parse(actions) : [],
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
      STORAGE_KEYS.AVATAR_URI,
    ]);
  },
};

export default onboardingStorage;

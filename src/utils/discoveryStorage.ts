import AsyncStorage from '@react-native-async-storage/async-storage';

import { getThemeDef, RepeatValue } from './discoveryThemes';

const KEY_THEMES = '@ayna/discovery_themes';
const KEY_EXP = '@ayna/discovery_experiences';
// eski (v1) anahtarlar — sadece migrasyon için okunur
const LEGACY_ITEMS = '@ayna/discovery_items';
const LEGACY_ENTRIES = '@ayna/discovery_entries';

// ── Yeni model: tema + deneyim ────────────────────────────────────────────────
export interface DiscoveryTheme {
  id: string;
  themeKey: string; // katalog anahtarı (food, place, ...) — emoji/alanlar buradan
  title?: string; // override; yoksa katalog başlığı
  emoji?: string; // override (legacy/migrasyon); yoksa katalog emojisi
  createdAt: number;
}

export interface DiscoveryExperience {
  id: string;
  themeId: string;
  title: string;
  note?: string;
  rating?: number; // 1-5
  location?: string;
  repeat?: RepeatValue;
  link?: string;
  tags?: string[];
  photoUri?: string;
  createdAt: number;
}

export type NewExperience = Omit<DiscoveryExperience, 'id' | 'themeId' | 'createdAt'>;

export interface ThemeSummary {
  count: number;
  last?: DiscoveryExperience;
  recent: DiscoveryExperience[]; // en yeni 3
}

// ── Geçiş için eski (v1) tipler — Faz 7'de kaldırılacak ───────────────────────
export interface DiscoveryItem {
  id: string;
  emoji: string;
  title: string;
  createdAt: number;
}
export interface DiscoveryEntry {
  id: string;
  itemId: string;
  time: number;
  text: string;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function startOfWeek(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Pazartesi = 0
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export function resolveThemeEmoji(t: DiscoveryTheme): string {
  return t.emoji ?? getThemeDef(t.themeKey).emoji;
}
export function resolveThemeTitle(t: DiscoveryTheme): string {
  return t.title ?? getThemeDef(t.themeKey).title;
}

// v1 → v2 migrasyon (bir kez): item→other teması, entry→başlık-only deneyim
async function migrate(): Promise<void> {
  const existing = await AsyncStorage.getItem(KEY_THEMES);
  if (existing !== null) return; // zaten yapılmış
  const pairs = await AsyncStorage.multiGet([LEGACY_ITEMS, LEGACY_ENTRIES]);
  const rawItems = pairs.find(p => p[0] === LEGACY_ITEMS)?.[1];
  const rawEntries = pairs.find(p => p[0] === LEGACY_ENTRIES)?.[1];
  const oldItems: DiscoveryItem[] = rawItems ? JSON.parse(rawItems) : [];
  const oldEntries: DiscoveryEntry[] = rawEntries ? JSON.parse(rawEntries) : [];
  const themes: DiscoveryTheme[] = oldItems.map(it => ({
    id: it.id,
    themeKey: 'other',
    title: it.title,
    emoji: it.emoji,
    createdAt: it.createdAt,
  }));
  const exps: DiscoveryExperience[] = oldEntries.map(e => ({
    id: e.id,
    themeId: e.itemId,
    title: e.text,
    createdAt: e.time,
  }));
  await AsyncStorage.multiSet([
    [KEY_THEMES, JSON.stringify(themes)],
    [KEY_EXP, JSON.stringify(exps)],
  ]);
}

const discoveryStorage = {
  // ── Temalar ────────────────────────────────────────────────────────────────
  async getThemes(): Promise<DiscoveryTheme[]> {
    await migrate();
    const raw = await AsyncStorage.getItem(KEY_THEMES);
    return raw ? (JSON.parse(raw) as DiscoveryTheme[]) : [];
  },

  async getTheme(id: string): Promise<DiscoveryTheme | null> {
    const themes = await this.getThemes();
    return themes.find(t => t.id === id) ?? null;
  },

  async addTheme(themeKey: string, title?: string): Promise<DiscoveryTheme> {
    const themes = await this.getThemes();
    const theme: DiscoveryTheme = { id: uid(), themeKey, createdAt: Date.now() };
    if (title && title.trim()) theme.title = title.trim();
    themes.push(theme);
    await AsyncStorage.setItem(KEY_THEMES, JSON.stringify(themes));
    return theme;
  },

  async updateTheme(id: string, patch: { title?: string; emoji?: string }): Promise<void> {
    const themes = await this.getThemes();
    const idx = themes.findIndex(t => t.id === id);
    if (idx === -1) return;
    const next = { ...themes[idx] };
    if (patch.title !== undefined) next.title = patch.title.trim() || undefined;
    if (patch.emoji !== undefined) next.emoji = patch.emoji;
    themes[idx] = next;
    await AsyncStorage.setItem(KEY_THEMES, JSON.stringify(themes));
  },

  async removeTheme(id: string): Promise<void> {
    const themes = (await this.getThemes()).filter(t => t.id !== id);
    await AsyncStorage.setItem(KEY_THEMES, JSON.stringify(themes));
    const exps = (await this.getAllExperiences()).filter(e => e.themeId !== id);
    await AsyncStorage.setItem(KEY_EXP, JSON.stringify(exps));
  },

  // ── Deneyimler ───────────────────────────────────────────────────────────────
  async getAllExperiences(): Promise<DiscoveryExperience[]> {
    await migrate();
    const raw = await AsyncStorage.getItem(KEY_EXP);
    return raw ? (JSON.parse(raw) as DiscoveryExperience[]) : [];
  },

  async getExperiences(themeId: string): Promise<DiscoveryExperience[]> {
    const all = await this.getAllExperiences();
    return all.filter(e => e.themeId === themeId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async getExperience(id: string): Promise<DiscoveryExperience | null> {
    const all = await this.getAllExperiences();
    return all.find(e => e.id === id) ?? null;
  },

  async addExperience(themeId: string, data: NewExperience): Promise<DiscoveryExperience> {
    const all = await this.getAllExperiences();
    const exp: DiscoveryExperience = {
      id: uid(),
      themeId,
      createdAt: Date.now(),
      ...data,
      title: data.title.trim(),
    };
    all.push(exp);
    await AsyncStorage.setItem(KEY_EXP, JSON.stringify(all));
    return exp;
  },

  async updateExperience(id: string, patch: Partial<NewExperience>): Promise<void> {
    const all = await this.getAllExperiences();
    const idx = all.findIndex(e => e.id === id);
    if (idx === -1) return;
    all[idx] = { ...all[idx], ...patch };
    if (patch.title !== undefined) all[idx].title = patch.title.trim();
    await AsyncStorage.setItem(KEY_EXP, JSON.stringify(all));
  },

  async removeExperience(id: string): Promise<void> {
    const all = (await this.getAllExperiences()).filter(e => e.id !== id);
    await AsyncStorage.setItem(KEY_EXP, JSON.stringify(all));
  },

  // Anasayfa: tema başına sayı + son + en yeni 3
  async getSummaryByTheme(): Promise<Record<string, ThemeSummary>> {
    const all = await this.getAllExperiences();
    const byTheme: Record<string, DiscoveryExperience[]> = {};
    for (const e of all) (byTheme[e.themeId] ??= []).push(e);
    const out: Record<string, ThemeSummary> = {};
    for (const [themeId, list] of Object.entries(byTheme)) {
      list.sort((a, b) => b.createdAt - a.createdAt);
      out[themeId] = { count: list.length, last: list[0], recent: list.slice(0, 3) };
    }
    return out;
  },

  // ── Geçiş shim'leri (eski API) — Faz 7'de kaldırılacak ──────────────────────
  async getItems(): Promise<DiscoveryItem[]> {
    const themes = await this.getThemes();
    return themes.map(t => ({
      id: t.id,
      emoji: resolveThemeEmoji(t),
      title: resolveThemeTitle(t),
      createdAt: t.createdAt,
    }));
  },
  async addItem(emoji: string, title: string): Promise<DiscoveryItem> {
    const theme = await this.addTheme('other', title);
    await this.updateTheme(theme.id, { emoji });
    return { id: theme.id, emoji, title: title.trim(), createdAt: theme.createdAt };
  },
  async updateItem(id: string, emoji: string, title: string): Promise<void> {
    await this.updateTheme(id, { title, emoji });
  },
  async removeItem(id: string): Promise<void> {
    await this.removeTheme(id);
  },
  async getEntries(itemId: string): Promise<DiscoveryEntry[]> {
    const exps = await this.getExperiences(itemId);
    return exps.map(e => ({ id: e.id, itemId: e.themeId, time: e.createdAt, text: e.title }));
  },
  async addEntry(itemId: string, text: string): Promise<DiscoveryEntry> {
    const exp = await this.addExperience(itemId, { title: text });
    return { id: exp.id, itemId: exp.themeId, time: exp.createdAt, text: exp.title };
  },
  async removeEntry(entryId: string): Promise<void> {
    await this.removeExperience(entryId);
  },
  async getThisWeekByItem(): Promise<Record<string, DiscoveryEntry | undefined>> {
    const all = await this.getAllExperiences();
    const weekStart = startOfWeek(Date.now());
    const map: Record<string, DiscoveryEntry | undefined> = {};
    for (const e of all) {
      if (e.createdAt >= weekStart) {
        const prev = map[e.themeId];
        if (!prev || e.createdAt > prev.time) {
          map[e.themeId] = { id: e.id, itemId: e.themeId, time: e.createdAt, text: e.title };
        }
      }
    }
    return map;
  },
};

export default discoveryStorage;

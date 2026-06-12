import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_ITEMS = '@ayna/discovery_items';
const KEY_ENTRIES = '@ayna/discovery_entries';

// İçerikli alışkanlık: "haftada 1 yeni X dene" + arşiv (denedikçe biriken kayıtlar)
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

const discoveryStorage = {
  async getItems(): Promise<DiscoveryItem[]> {
    const raw = await AsyncStorage.getItem(KEY_ITEMS);
    return raw ? (JSON.parse(raw) as DiscoveryItem[]) : [];
  },

  async addItem(emoji: string, title: string): Promise<DiscoveryItem> {
    const items = await this.getItems();
    const item: DiscoveryItem = { id: uid(), emoji, title, createdAt: Date.now() };
    items.push(item);
    await AsyncStorage.setItem(KEY_ITEMS, JSON.stringify(items));
    return item;
  },

  async updateItem(id: string, emoji: string, title: string): Promise<void> {
    const items = await this.getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], emoji, title: title.trim() };
    await AsyncStorage.setItem(KEY_ITEMS, JSON.stringify(items));
  },

  async removeItem(id: string): Promise<void> {
    const items = (await this.getItems()).filter(i => i.id !== id);
    await AsyncStorage.setItem(KEY_ITEMS, JSON.stringify(items));
    const entries = (await this.getAllEntries()).filter(e => e.itemId !== id);
    await AsyncStorage.setItem(KEY_ENTRIES, JSON.stringify(entries));
  },

  async getAllEntries(): Promise<DiscoveryEntry[]> {
    const raw = await AsyncStorage.getItem(KEY_ENTRIES);
    return raw ? (JSON.parse(raw) as DiscoveryEntry[]) : [];
  },

  async getEntries(itemId: string): Promise<DiscoveryEntry[]> {
    const all = await this.getAllEntries();
    return all.filter(e => e.itemId === itemId).sort((a, b) => b.time - a.time);
  },

  async addEntry(itemId: string, text: string): Promise<DiscoveryEntry> {
    const all = await this.getAllEntries();
    const entry: DiscoveryEntry = { id: uid(), itemId, time: Date.now(), text: text.trim() };
    all.push(entry);
    await AsyncStorage.setItem(KEY_ENTRIES, JSON.stringify(all));
    return entry;
  },

  async removeEntry(entryId: string): Promise<void> {
    const all = (await this.getAllEntries()).filter(e => e.id !== entryId);
    await AsyncStorage.setItem(KEY_ENTRIES, JSON.stringify(all));
  },

  // Bu hafta için item başına son kayıt (varsa)
  async getThisWeekByItem(): Promise<Record<string, DiscoveryEntry | undefined>> {
    const all = await this.getAllEntries();
    const weekStart = startOfWeek(Date.now());
    const map: Record<string, DiscoveryEntry | undefined> = {};
    for (const e of all) {
      if (e.time >= weekStart) {
        const prev = map[e.itemId];
        if (!prev || e.time > prev.time) map[e.itemId] = e;
      }
    }
    return map;
  },
};

export default discoveryStorage;

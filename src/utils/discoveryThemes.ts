// Keşfet = deneyim defteri. Her tema, ortak iskeleti (başlık + not) korur ama
// kendine uygun alan setini taşır. "Aynı olmayanı aynı değerlendirme" hatasından kaçınır.

export type FieldKey = 'note' | 'rating' | 'location' | 'repeat' | 'link' | 'tags' | 'photo';

export interface ThemeDef {
  emoji: string;
  title: string;
  subtitle: string; // katalog/anasayfa ipucu
  titlePrompt: string; // "Ne yaptın?" / "Neresi?"
  titlePlaceholder: string;
  noteLabel: string; // "Tarif / not"
  notePlaceholder: string;
  archiveLabel: string; // "Gittiğin yerler"
  logPrompt: string; // "Yeni bir yere mi gittin?"
  fields: FieldKey[];
}

export type RepeatValue = 'yes' | 'maybe' | 'no';

export const REPEAT_OPTIONS: { key: RepeatValue; label: string }[] = [
  { key: 'yes', label: 'Evet' },
  { key: 'maybe', label: 'Belki' },
  { key: 'no', label: 'Hayır' },
];

export const THEME_CATALOG: Record<string, ThemeDef> = {
  food: {
    emoji: '🍳',
    title: 'Yeni bir yemek',
    subtitle: 'denediğin tarifleri sakla',
    titlePrompt: 'Ne yaptın?',
    titlePlaceholder: 'Örn. Mantı',
    noteLabel: 'Tarif / not',
    notePlaceholder: 'Malzemeler, püf noktası...',
    archiveLabel: 'Denediklerin',
    logPrompt: 'Yeni bir şey mi pişirdin?',
    fields: ['photo', 'note', 'tags', 'rating', 'link'],
  },
  place: {
    emoji: '🌍',
    title: 'Gittiğin yeni yer',
    subtitle: 'keşfettiğin mekanlar',
    titlePrompt: 'Neresi?',
    titlePlaceholder: 'Örn. Kapadokya',
    noteLabel: 'Not',
    notePlaceholder: 'Nasıldı, ne yaptın...',
    archiveLabel: 'Gittiğin yerler',
    logPrompt: 'Yeni bir yere mi gittin?',
    fields: ['photo', 'location', 'rating', 'note', 'tags'],
  },
  sport: {
    emoji: '🧗',
    title: 'Yeni bir spor',
    subtitle: 'denediğin sporlar',
    titlePrompt: 'Hangi spor?',
    titlePlaceholder: 'Örn. Kaya tırmanışı',
    noteLabel: 'Not',
    notePlaceholder: 'Nasıl geçti...',
    archiveLabel: 'Denediğin sporlar',
    logPrompt: 'Yeni bir spor mu denedin?',
    fields: ['photo', 'repeat', 'rating', 'note', 'tags'],
  },
  instrument: {
    emoji: '🎸',
    title: 'Bir enstrüman',
    subtitle: 'öğrendiğin parçalar',
    titlePrompt: 'Ne çalıştın?',
    titlePlaceholder: 'Örn. Wonderwall akorları',
    noteLabel: 'Not',
    notePlaceholder: 'Parça, akor, nasıl gitti...',
    archiveLabel: 'Çalıştıkların',
    logPrompt: 'Yeni bir şey mi çalıştın?',
    fields: ['photo', 'link', 'note', 'tags'],
  },
  book: {
    emoji: '📖',
    title: 'Farklı tür kitap',
    subtitle: 'okuduğun yeni türler',
    titlePrompt: 'Hangi kitap?',
    titlePlaceholder: 'Örn. Dune',
    noteLabel: 'Yazar + alıntı / yorum',
    notePlaceholder: 'Yazar, sevdiğin bir alıntı...',
    archiveLabel: 'Okuduakların',
    logPrompt: 'Yeni bir kitap mı?',
    fields: ['photo', 'rating', 'note', 'tags'],
  },
  language: {
    emoji: '🗣️',
    title: 'Yeni bir dil',
    subtitle: 'öğrendiğin kelimeler',
    titlePrompt: 'Ne öğrendin?',
    titlePlaceholder: 'Örn. Selamlaşma kalıpları',
    noteLabel: 'Kelimeler / ifadeler',
    notePlaceholder: 'Öğrendiğin kelimeler...',
    archiveLabel: 'Öğrendiklerin',
    logPrompt: 'Yeni bir şey mi öğrendin?',
    fields: ['note', 'tags'],
  },
  other: {
    emoji: '🌱',
    title: 'Başka bir şey',
    subtitle: 'aklındaki başka deneyimler',
    titlePrompt: 'Ne denedin?',
    titlePlaceholder: 'Örn. Seramik',
    noteLabel: 'Not',
    notePlaceholder: 'Nasıldı...',
    archiveLabel: 'Denediklerin',
    logPrompt: 'Yeni bir şey mi denedin?',
    fields: ['photo', 'note', 'rating', 'tags'],
  },
};

// Katalogda kullanıcıya gösterilecek sıra
export const THEME_ORDER: string[] = [
  'food',
  'place',
  'sport',
  'instrument',
  'book',
  'language',
  'other',
];

export function getThemeDef(themeKey: string): ThemeDef {
  return THEME_CATALOG[themeKey] ?? THEME_CATALOG.other;
}

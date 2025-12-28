const colors = {
  // Temel Renkler
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',

  // 🟠 BRAND: Senin Ana Turuncu Rengin (#FF9F43)
  // 500: Ana Renk | 50: Çok açık zeminler için | 600+: Hover durumları için
  brand: {
    DEFAULT: '#FF9F43',
    50: '#FFF6E9', // Çok açık turuncu (Arka plan vurgusu)
    100: '#FFECCF',
    200: '#FED89C',
    300: '#FDC469',
    400: '#FEB156',
    500: '#FF9F43', // ⭐️ ANA RENK (Butonlar, Progress Bar)
    600: '#E68228', // Buton Tıklama (Active) rengi
    700: '#BF6217',
    800: '#99460D',
    900: '#733107',
    950: '#401901',
  },

  // ⚫️ NEUTRAL: Metinler, Kart Zeminleri ve Çizgiler
  // iOS standartlarına uygun griler
  neutral: {
    DEFAULT: '#8E8E93', // Secondary Text (Tarihler, alt yazılar)
    50: '#F9F9F7', // ⭐️ APP BACKGROUND (O konuştuğumuz kırık beyaz)
    100: '#F2F2F7', // Kart İçi Dolgular / Input Zeminleri (Tertiary)
    200: '#E5E5EA', // Çizgiler / Borderlar
    300: '#D1D1D6',
    400: '#C7C7CC', // Pasif İkonlar
    500: '#8E8E93', // İkincil Metin Rengi
    600: '#636366',
    700: '#3A3A3C',
    800: '#2C2C2E',
    900: '#1A1A1A', // ⭐️ ANA METİN RENGİ (Başlıklar)
    950: '#000000',
  },

  // 🔴 DANGER: "İmdat" / Panic Butonu ve Hata Mesajları için
  // Action Sheet'teki o tatlı kırmızı buton için 50 ve 500'ü kullanacağız.
  danger: {
    DEFAULT: '#FF3B30', // iOS Standart Kırmızı (Yazılar, İkonlar)
    50: '#FFF5F5', // ⭐️ PANIC BUTON ARKAPLANI (O tatlı açık kırmızı)
    100: '#FFE1E1',
    200: '#FFBDBD',
    300: '#FF9595',
    400: '#FF6D6D',
    500: '#FF3B30', // Ana Kırmızı
    600: '#D62F26',
    700: '#AD221B',
    800: '#851712',
    900: '#3D0806',
  },

  // 🟢 SUCCESS: Tamamlanan Hedefler / Tik İşaretleri için
  success: {
    DEFAULT: '#34C759', // iOS Yeşil
    50: '#F0FDF4',
    500: '#34C759',
    700: '#15803d',
  },
};

export default colors;

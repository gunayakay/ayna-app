# Ayna — Test Günlüğü

Cihaz test turlarının kaydı. Her tur: app'teki Test Senaryoları sayfasından rapor → buraya.

---

## Tur 3 — 2026-06-03 (gerçek cihaz, TestFlight build #4)

**Özet: 25 ✅ · 0 ❌** — tüm senaryolar gerçek cihazda geçti.

İlk uçtan uca cihaz doğrulaması: onboarding, kalıcılık (kapat-aç), bağımlılık (Tamamen
Bırak + Sınırla), avatar, istatistikler, profil, tab bar — hepsi sağlam.

**Checklist dışı bulgu (feature, bug değil):**
- Sosyal medya "günde X kez" (sayı) ile ölçülüyor; ekran bağımlılıkları **süre** ile
  ölçülmeli. → BACKLOG "Süre-bazlı limit". (a) birim=dakika manuel: OTA'lanabilir JS.
  (b) iOS Screen Time otomatik: v2.

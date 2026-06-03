# Ayna — Backlog (Park / v2+)

> Buradaki her şey **bilinçli olarak ertelendi.** Silinmedi — sırası değil.
> Bir fikir aklına düşerse v1'e sokma, buraya yaz. Tek odak: [`AYNA.md`](./AYNA.md) v1.

---

## Kullanımdan gelen (cihaz testi)

- **Esnek alışkanlık girişi** — hedefi aşan / serbest miktar girilebilmeli. (Örn. günlük 5
  hedefiyken o gün 15 sayfa okudum → şu an giremiyorum.) Tüm sayı-bazlı alışkanlıklar için.
  JS — OTA'lanabilir.
- **Süre-bazlı limit (ekran süresi)** — sosyal medya gibi ekran bağımlılıkları "kaç kez açtın"
  yerine **süre** ile ölçülmeli:
  - (a) Manuel dakika girişi — yakın, JS.
  - (b) iOS Screen Time'dan otomatik çekme (Family Controls / DeviceActivity) — ağır:
    Apple entitlement + gizlilik incelemesi + native. v2+ araştırma.
- **Ölçüm tipi genelleştirme** — sayı / süre / miktar gibi farklı ölçüm tipleri
  (mevcut model çoğunlukla "kaç kez" tek tipi varsayıyor).

## v2 — yakın

- **Pozitif alışkanlık loop'u** — "yaptım / yapamadım" + "Seni ne durdurdu?" yüzleşme.
  (`goalStorage` + `confrontation` zaten kodda var, v1'de kapalı.)
- **Bütçe / cüzdan modülü** — gelir-gider takibi; uzun vadede Ayna içinde tek yerden
  yönetme hedefi. (En kötü mevcut DB'den veri taşınır.)
- **Dynamic Mirror Widget** — ana ekran widget'ı; kirlenen ayna = ihmal metaforu
  (suçluluk/loss-aversion değil — bkz. AYNA.md felsefe). Native iş.

## v2 / v3 — vizyon (Fikir Havuzu)

- **RPG İrade kartları** — İrade / Fitness / Zihin / Sosyal puanları (1–100).
- **Sosyal Yüzleşme Ağı** — iyileşme/başarı videoları, ortak challenge.
  ⚠️ "bu aramızda kalacak" mahremiyetiyle **çelişir**; eklenirse Ayna'nın özü yeniden
  değerlendirilmeli.
- **Akademik katman** — yüzleşme verisiyle tez/araştırma + anonim export.
  (Akademi hayalini ürünle birleştirme yolu — ama v1'i şişirmeden, sonra.)

## Altyapı — gerektiğinde

- Login (misafir / Google), Firebase / cloud senkron, gelişmiş analitik & grafikler.
- Partner mode, bağış (donation) modeli, push bildirim.
- Kilo / maaş gibi metrikler (yargısız-veri ilkesiyle: delta, tamamen opsiyonel).

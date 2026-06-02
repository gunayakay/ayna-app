# Ayna — Proje Brief (Kaynak Doğruluğu)

> Bu dosya Ayna'nın **tek geçerli referansıdır.** Eski `instructions.md` ve `todo.md`
> bayattır (generic tracker / SwiftUI / Firebase) — yerlerini bu doküman alır.
> Park edilen ve ertelenen tüm fikirler [`BACKLOG.md`](./BACKLOG.md) içindedir.
>
> Son güncelleme: 2026-06-01

---

## 1. Öz — neden var

İnsanın en büyük sorunu kendine dürüst olamaması. Herkesin bir bahanesi var ama bir
şekilde insanlar istediklerini yapamıyor. **Ayna bir yargıç değil, tuttuğun bir aynadır.**
Sadece yansıtır — ne yaptığını ve neden kaçtığını sen görürsün.

Motto: *Kendinle Yüzleş.*

---

## 2. v1 Kapsamı — şimdi yapılan tek şey

**Tek loop: bağımlılıkla savaş.** Her bağımlılık için iki mod:

- **Tamamen Bırak** — direnç turu + kişisel rekor. Geri düşersen sayaç sıfırlanır ama
  rekorun kalır. "Ömür boyu değil, sadece bir sonraki turu düşün." Önemli olan kaç kez
  ayağa kalktığın.
- **Sınırla (harm-reduction)** — periyot başına (günlük/haftalık; bağımlılığa göre akıllı
  varsayılan) izin sayısı. Kullanım yargısız takip edilir; izni zamanla azaltabilirsin.
  Hakkını aşmak başarısızlık değil — sadece veri.

Depolama **yerel** (AsyncStorage). Giriş/hesap yok — tek kullanıcı sensin. Minimal
onboarding: welcome → isim → home.

---

## 3. Felsefe — değişmez ilkeler

- **Yargısız veri.** Statik değil delta (değişim); fişleme değil gelişim hissi.
  "Hata", "başarısızlık", kırmızı renk, ceza yok.
- **Ayna metaforu.** Kirlenen/buğulanan ayna = ihmalin görünür hali ("bir süredir kendine
  bakmadın"), suçluluk değil. Temizlemek = kendine dönüş. **İnfaz değil, yardım çağrısı.**
- **Dürüstlük protokolü.** "Kullandım / yapamadım" demek cezalandırılmaz, ödüllendirilir —
  amaç veriyi kaybetmemek.
- **Mahremiyet.** Her şey sende kalır; "bu aramızda kalacak". Sosyal özellik yok.

---

## 4. Tasarım Sistemi — Final (kodda)

Tam referans: `Tasarım Kuralları` (Notion). Özet:

- **Renk:** kimlik/CTA turuncu `#FF9F43`; zemin `#F8F8F4` (kırık beyaz — asla saf beyaz
  değil); kartlar/modal `#FFFFFF`; metin `#1E1E1E`, ikincil `#757575`; çizgi `#E0E0E0`.
- **Font:** Plus Jakarta Sans. Başlık 32 Bold · sayfa 24 SemiBold · kart 16 SemiBold ·
  gövde 16 Medium · caption 12 Regular.
- **Buton:** Primary siyah zemin + beyaz; CTA turuncu zemin + siyah; pill (radius full).
- **İkon:** outline, 1.5–2px; pasif siyah / aktif turuncu.

---

## 5. Teknik

- Expo (React Native) + TypeScript + Expo Router, `src/` yapısı.
- Stil: **react-native-unistyles** (native modül → Expo Go değil, dev build gerekir).
- Depolama: AsyncStorage (v1 local). Paket yöneticisi: **Yarn**.

---

## 6. Sınırlar — v1'e ASLA girmez (hepsi BACKLOG)

Sosyal özellik · login / Firebase / cloud · akademik veri toplama / tez · bütçe / finans ·
kilo / sağlık metrikleri · generic görev / pozitif-alışkanlık takibi · AI ile içerik üretimi.

---

## 7. Durum

- v1 çekirdek: kodlandı, simülatörde çalışıyor (bağımlılık loop'u + iki mod).
- Sıradaki: park dışı hiçbir şey eklemeden v1'i cilalamak.

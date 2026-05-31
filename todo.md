# ROL VE AMAÇ

Sen Kıdemli bir iOS Ürün Yöneticisi ve Lead Developer'sın. Amacımız "İrade ve Farkındalık" odaklı,
Native iOS (SwiftUI) bir alışkanlık takip uygulaması geliştirmek.

Senden istediğim kod yazman değil; aşağıda vereceğim detaylı speklere (PRD) göre projeyi
yönetilebilir **FAZLARA (PHASES)** bölmen ve adım adım uygulanacak teknik bir **TO-DO LIST
(Yapılacaklar Listesi)** hazırlaman.

---

## 1. PROJE AKIŞI VE UX (Kullanıcı Deneyimi)

### A. Onboarding (Karşılama)

Kullanıcı uygulamayı ilk açtığında şu sırayı takip eder:

1.  **Tanıtım Slaytları (3 Ekran):** Uygulamanın değer önerisini anlatan 3 adet geçişli ekran
    (Carousel).
2.  **Kimlik (Input):** Son ekranda veya hemen ardından "Sana nasıl hitap edelim?" diye soran sade
    bir ekran. Sadece isim alınır.
3.  **Yönlendirme:** İsim girildiği an kullanıcı Ana Sayfa'ya düşer. (Kategori/Hedef seçimi burada
    YOK).

### B. Ana Sayfa (Home) & Zero State

Kullanıcı ana sayfaya düştüğünde ekran boş kalmamalı.

- **Active Empty State:** Widget'ların geleceği alanda "Ghost UI" (silik, kesikli çizgilerle
  kutular) olmalı.
- **Mesaj:** "Henüz bir hedefin yok. Başlamak için (+) butonuna dokun."
- **Aksiyon:** Alttaki Tab Bar'ın ortasında büyük, turuncu bir (+) butonu (Floating Action Button)
  bulunur. Buna basınca "Ekleme Menüsü" (Action Sheet) açılır.

### C. Core Loop (Döngü ve Veri Girişi)

1.  **Setup:** Kullanıcı (+) butonundan bir hedef (Örn: Spor, Su) seçer ve widget ana sayfaya
    yerleşir.
2.  **Check-in:** Widget'a tıklandığında detay (Action Sheet) açılır.
3.  **Success Path:** "Yaptım" derse zincir artar.
4.  **Failure Path (KRİTİK):** Kullanıcı "Yapamadım" derse, bir "Yüzleşme Modalı" açılır.

### D. Yüzleşme ve Blocker Mantığı (ÖNEMLİ)

Kullanıcı başarısız olduğunda sistem **"Neden?"** sorusunu sorar. Burası HİBRİT bir yapıdır:

1.  **Structured Data (Zorunlu):** Kullanıcı önceden tanımlı 5 kategoriden birini seçer (Örn:
    Enerjim Yoktu, Zamanım Yoktu, Unuttum vb.). Bu istatistik içindir.
2.  **Unstructured Data (Opsiyonel):** Hemen altında bir "Input Alanı" vardır. Kullanıcı buraya
    serbest metin girebilir (Örn: "Dün gece uyuyamadım"). Bu da günlük (Journal) içindir.

---

## 2. TASARIM DİLİ (UI GUIDELINES)

- **Vibe:** Premium, Minimalist, "Glassmorphism" dokunuşlu. Apple Health sadeliği + Headspace
  samimiyeti.
- **Renkler:** Zemin `#F8F8F4` (Kırık Beyaz), Aksan `#FF9F43` (Turuncu), Metin `#1E1E1E`.
- **Şekiller:** Kartlar `32px` radius, Butonlar `100px` (Pill Shape).
- **Navigasyon:** Ana işlemler için Modal yerine "Bottom Action Sheet" kullanımı tercih edilir.

---

## 3. İSTENEN ÇIKTI

Lütfen bu projeyi **MVP (Minimum Viable Product)** mantığıyla, kodlama sırasına göre **Step-by-Step
Task List** haline getir.

Örnek Format:

- [ ] **Faz 1: Altyapı:** Renkler, Fontlar, Temel Navigasyon...
- [ ] **Faz 2: Onboarding:** ...
- [ ] **Faz 3: Core Data Modeli:** (Goal, Log, Blocker entity'leri)...

Bu listeyi hazırla, onayladığımda kodlamaya başlayacağız.

# İthalatPro — Tedarik Otomasyon Sistemi (Demo)

Çin'den mal ithal etmek isteyen müşteriler için **aday eleme + Google Meet/Zoom satış + tedarik (RFQ) otomasyon** sisteminin **çalışan demo**'su. Tamamen statik: **HTML + CSS + JS**, sunucu yok. GitHub Pages'e doğrudan yüklenebilir.

Fotoğraftaki 14 adımın tamamı uygulanmıştır. Veriler tarayıcıda **localStorage** ile saklanır; adımlar arasında gerçekten akar (landing'den gelen başvuru admin panelde görünür vb.).

> ⚠️ **Demo notu:** Mail gönderme, AI analizi ve WhatsApp gibi işlemler **görsel demodur** — gerçekten dışarı bir şey göndermez. Gerçek entegrasyon için aşağıdaki "Gerçek backend" bölümüne bakın.

## Dosya Yapısı

```
.
├── index.html        # Halka açık taraf: landing + başvuru formu + randevu (Adım 1-3)
├── panel.html        # Admin paneli: tüm adımlar (Adım 4-14)
└── assets/
    ├── css/style.css # Ortak koyu tema
    └── js/
        ├── store.js  # localStorage veri katmanı + örnek veri + yardımcılar
        ├── public.js # index.html mantığı
        └── panel.js  # panel.html mantığı (14 adım)
```

## 14 Adım — Nerede?

**Faz 1 (index.html):** 1) Reklam & Landing · 2) Lead Form & AI Ön Eleme · 3) Randevu (Meet/Zoom)
**Faz 1 (panel.html):** 4) Dashboard & Lead Listesi · 5) Müşteri Kartı & İş Başlat · 6) RFQ Mail · 7) Maliyet · 8) Rapor
**Faz 2 (panel.html):** 9) AI Ürün Analizi · 10) AI Tedarikçi Bulma · 11) Mail Okuma · 12) Follow-up · 13) Süreç Takip · 14) WhatsApp

## Lokal Çalıştırma

Dosyaları çift tıklayıp tarayıcıda açmanız yeterli (`index.html`). Tam doğru çalışması için basit bir sunucu da kullanabilirsiniz:

```bash
# Python varsa
python -m http.server 8000
# sonra: http://localhost:8000
```

## Uçtan Uca Test Akışı

1. `index.html` → formu doldur, **Gönder** → "Kaliteli/Uygun Değil" sonucu.
2. Kaliteli ise → **Randevu Oluştur** → gün/saat/platform seç → onayla.
3. `panel.html` → **Lead Listesi**'nde yeni başvuruyu gör.
4. Lead'i aç → **İş Başlat** → **RFQ** (üretici seç, mailleri gönder) → **Maliyet** (hesapla, kaydet) → **Rapor** (PDF indir / müşteriye gönder).
5. Faz 2 sekmeleri: AI analiz, tedarikçi bulma, mail okuma, follow-up, süreç takip, WhatsApp.
6. Sayfayı yenile → veriler korunur. Sol menüden **"Demo verisini sıfırla"** ile baştan başla.

## GitHub Pages ile Yayınlama

1. Yeni bir GitHub reposu oluştur, bu klasördeki dosyaları yükle (push et).
2. Repo → **Settings → Pages**.
3. **Source: Deploy from a branch**, Branch: `main` (veya `master`), klasör: `/ (root)`. Kaydet.
4. Birkaç dakika sonra `https://<kullanıcı-adı>.github.io/<repo-adı>/` adresinde yayında olur.

Harici CDN/bağımlılık yoktur; ilk yüklemede çalışır.

## Supabase'e Bağlama (veriyi buluta taşı)

Site **çift modlu** çalışır: `assets/js/config.js` boş bırakılırsa tarayıcı `localStorage`'ı (demo) kullanır; gerçek bilgiler girilince **Supabase** (bulut veritabanı) kullanılır ve veriler tüm cihazlar/ziyaretçiler arasında paylaşılır.

### Adımlar
1. **Proje aç:** [supabase.com](https://supabase.com) → ücretsiz hesap → **New project** (bölge: Frankfurt önerilir).
2. **Tabloları kur:** Supabase Panel → **SQL Editor** → **New query** → [`supabase/schema.sql`](supabase/schema.sql) dosyasının tamamını yapıştır → **Run**. Bu, `leads / jobs / followups / messages` tablolarını ve güvenlik (RLS) kurallarını oluşturur.
3. **Anahtarları al:** Panel → **Project Settings → API**:
   - **Project URL**
   - **anon public** anahtarı (bu anahtar tarayıcıda görünür — bu normaldir, güvenlik RLS ile sağlanır).
4. **`config.js`'i doldur:**
   ```js
   window.SUPA = {
     url: "https://xxxx.supabase.co",   // Project URL
     key: "eyJhbGciOi..."               // anon public anahtarı
   };
   ```
5. **Yayınla:** `git add -A && git commit -m "supabase baglandi" && git push`. Panelde sağ üstte **"● Supabase bağlı"** yazarsa bağlantı tamamdır.

### ⚠️ Güvenlik notu (önemli)
Şu anki `schema.sql` **demo modundadır**: admin paneli login'siz olduğu için anon anahtarı bilen herkes verileri okuyabilir/yazabilir. **Gerçek müşteri verisiyle** yayına geçerken `schema.sql` içindeki **"ÜRETİM (PRODUCTION)"** bölümünü uygula ve panele Supabase Auth ile giriş ekle (bu özellik istenirse eklenebilir).

## Diğer Backend Seçenekleri (opsiyonel)

- **Form/e-posta gönderimi:** [Formspree](https://formspree.io) / [EmailJS](https://www.emailjs.com).
- **WhatsApp:** WhatsApp Cloud API veya Twilio.
- **AI analiz:** Claude API (sunucu tarafı bir fonksiyon üzerinden).

Demo "gönderim/AI" işlevleri `store.js`/panel kodundaki `fakeAsync` çağrılarının gerçek API çağrılarıyla değiştirilmesiyle canlıya alınır.

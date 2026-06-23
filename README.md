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

## Supabase'e Bağlama (gerçek sistem + kayıt/giriş)

`assets/js/config.js` doldurulunca site **Supabase** kullanır: veriler bulutta saklanır, **her bilgisayardan** erişilir ve admin paneli **kayıt/giriş (Supabase Auth)** arkasındadır. (Doldurulmazsa yerel mod / fallback çalışır.)

Model: **ekip ortak panel** → giriş yapan herkes tüm veriyi görür. Başvuru formu herkese açıktır (anonim lead ekler).

### Adımlar
1. **Proje aç:** [supabase.com](https://supabase.com) → **New project** (bölge: Frankfurt; bir veritabanı şifresi belirle).
2. **Tabloları + güvenliği kur:** Supabase → **SQL Editor → New query** → [`supabase/schema.sql`](supabase/schema.sql) dosyasının tamamını yapıştır → **Run**.
3. **Kayıt/giriş ayarı:** Supabase → **Authentication → Providers → Email** açık olsun. Kayıt sonrası onay maili beklemeden hemen giriş için **"Confirm email" KAPALI** yap (test için pratik).
4. **Anahtarları al:** Supabase → **Project Settings → API**:
   - **Project URL** (örn. `https://abcd.supabase.co`)
   - **Project API keys → `anon` `public`** (uzun `eyJ...` anahtarı; tarayıcıda görünmesi normaldir, güvenlik RLS ile sağlanır).
5. **`config.js`'i doldur:**
   ```js
   window.SUPA = {
     url: "https://abcd.supabase.co",   // Project URL
     key: "eyJhbGciOi..."               // anon public anahtarı
   };
   ```
6. **Yayınla:** `git add -A && git commit -m "supabase baglandi" && git push`. Panelde giriş ekranı çıkar; sağ üstte **"● Supabase bağlı"** görünür.

### ⚠️ Güvenlik notu
"Açık kayıt + ekip ortak panel" seçili olduğu için **kayıt olan herkes tüm verileri görür**. Daha sıkı istersen Supabase → Authentication → "Allow new signups" kapat (kullanıcıları sen eklersin) ya da kişi-bazlı veri izolasyonu eklenebilir.

## Diğer Backend Seçenekleri (opsiyonel)

- **Form/e-posta gönderimi:** [Formspree](https://formspree.io) / [EmailJS](https://www.emailjs.com).
- **WhatsApp:** WhatsApp Cloud API veya Twilio.
- **AI analiz:** Claude API (sunucu tarafı bir fonksiyon üzerinden).

Demo "gönderim/AI" işlevleri `store.js`/panel kodundaki `fakeAsync` çağrılarının gerçek API çağrılarıyla değiştirilmesiyle canlıya alınır.

# İthalatPro — Proje Notları (Claude için)

Çin'den mal ithal etmek isteyen müşteriler için **tedarik/aracılık funnel + admin panel**.
Statik site (HTML/CSS/JS) + **Supabase** (veritabanı & giriş). GitHub Pages'te yayında.
İçerik dili **Türkçe**.

## Canlı / Depo
- Canlı uygulama: https://adnanparlas.github.io/ithalatpro/
- Admin panel: https://adnanparlas.github.io/ithalatpro/panel.html
- Repo: `AdnanParlas/ithalatpro` (branch `main`)
- **Yayınlama:** `git add -A && git commit -m "..." && git push` → Pages ~1 dk'da otomatik günceller.

## Dosya yapısı
- `index.html` — Halka açık landing: hero + **çok adımlı başvuru funnel'ı** + footer.
- `randevu.html` — Randevu onay sayfası (query param'dan tarih/saat/platform gösterir, "Takvime Ekle" linki, opsiyonel toplantı linki).
- `panel.html` — Admin panel; **giriş (Supabase Auth) arkasında**.
- `assets/css/style.css` — Tüm stiller (koyu tema; funnel `.wizard/.opt`, auth, panel).
- `assets/js/config.js` — Ayarlar: `window.SUPA` (Supabase, **dolu/canlı**), `window.NOTIFY` (e-posta/WhatsApp bildirimi), `window.MEET` (sabit toplantı linki, boş).
- `assets/js/store.js` — Veri katmanı + auth + yardımcılar.
- `assets/js/public.js` — Funnel (index) mantığı + `notifyOwner` (sahibe e-posta).
- `assets/js/panel.js` — Admin panel mantığı (giriş + görünümler).
- `supabase/schema.sql` — Supabase tablo + güvenlik (RLS) kuralları.
- `.claude/serve.ps1` + `.claude/launch.json` — Yerel önizleme sunucusu (bu makinede `python`/`node` YOK; preview için PowerShell HTTP sunucusu kullanılıyor). `.gitignore`'da, repoya gitmez.

## Mimari (önemli)
**store.js çift modlu:** `config.js`'teki `SUPA` gerçek değer içeriyorsa → Supabase; placeholder ise → localStorage (demo). Şu an **Supabase modunda** (canlı).
- Açılışta bir kez `Store.load()` → veriler bellek-içi `cache`'e yüklenir.
- Getter'lar (`getLeads/getJobs/...`) cache'ten **senkron** okur; yazma fonksiyonları cache'i güncelleyip arka planda backend'e yazar (**write-through**).
- `Store.flush()` → bekleyen yazmanın bitmesini bekler (sayfa yönlendirmeden önce kullanılır).

### ⚠️ Kritik kurallar (bozma)
- **Anon (halka açık form) sadece INSERT yapabilir** (RLS). Bu yüzden `persist` yeni kayıt için `insert`, mevcut için `update` kullanır — **`upsert` KULLANMA** (anon'da RLS hatası verir, 42501).
- Funnel lead'i **tek seferde** (randevu onayında) insert edilir; ara update yok.
- Yönlendirmeden önce `Store.flush()` beklenir, yoksa Supabase yazımı iptal olur.
- `config.js`'teki `SUPA.key` **publishable** anahtardır (tarayıcıda görünmesi normal). **service_role anahtarını ASLA koyma.**

## Funnel akışı (index.html / public.js)
1. **Bütçe:** 5.000$ / 10.000$ / 20.000$ / 20.000$+ → **20.000 altı seçerse elenir** (devam edemez).
2. **Konteyner:** 1 / 2-5 / 5-10 / 10+
3. **Taşıma:** Denizyolu / Havayolu / Karayolu
4. **İletişim:** ad, telefon, e-posta
5. **Randevu:** takvim + saat + platform (Google Meet / Zoom) → `randevu.html`'e yönlenir + `notifyOwner` çalışır.

## Admin panel (panel.html / panel.js)
- **Giriş/kayıt:** Supabase Auth (e-posta/şifre). **Açık kayıt** + **ekip ortak panel** (giriş yapan herkes tüm veriyi görür). E-posta doğrulama Supabase'de KAPALI.
- Menü (sade): **Özet · Başvurular · Müşteri & İş · Teklif (RFQ) · Maliyet · Rapor**.
- Faz 2 görünümleri (AI analiz, AI tedarikçi, mail okuma, follow-up, süreç, WhatsApp) **kodda var ama menüden gizli** (`VIEWS` içinde duruyor, sidebar linki yok).
- Test için: panele girip **kayıt ol** (açık kayıt).

## Veri modeli (Supabase tabloları: `id text, data jsonb, created_at`)
- `leads`: `{ad, telefon, email, butce, konteyner, tasima, urun, durum, kaliteSkoru, randevu:{tarih,saat,platform}}`
- `jobs`: `{leadId, urun, adet, ureticiler, rfqGonderildi, teklifler, maliyet, rapor, durum}`
- `followups`, `messages`: Faz 2 demo verisi.
- `durum` değerleri: `kaliteli`, `uygun-degil`, `randevu`, `is-basladi`, `rapor-hazir`.

## Bildirim (config.js → window.NOTIFY)
- **E-posta:** FormSubmit (`ownerEmail: adnanparlas35@hotmail.com`) — **aktif** (form aktive edildi). Randevuda sahibe mail gider.
- **WhatsApp:** CallMeBot (`callmebotApikey` placeholder — pasif). `ownerPhone: +905326534005`.
- Kanal yapılandırılmadıysa sessizce atlanır.

## Gerçek Google Meet linki (kodlandı — kurulum bekliyor)
- **Edge Function:** `supabase/functions/create-meet/index.ts` — Google Calendar API ile her randevuya gerçek Meet linki üretir; `attendees=[sahip,müşteri]` + `sendUpdates=all` → Google daveti ikisine de yollar, takvime ekler.
- **Site bağlantısı:** `public.js > createMeet()` onayda function'ı çağırır; link `notifyOwner` mailine, `randevu.html`'e (`?meet=`) ve lead'e (`randevu.meetLink`) gider.
- **Açma:** `config.js > window.MEET.useGoogleApi=true`. Şu an **false** (kapalı) → site sabit `MEET.link` veya "Takvime Ekle" ile çalışır.
- **Kurulum adımları:** `supabase/functions/create-meet/SETUP.md` (Google OAuth refresh token + Supabase secrets + `functions deploy create-meet --no-verify-jwt`).
- Secret'lar (function env): `GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN`, `OWNER_EMAIL`. **Tarayıcıda DEĞİL.**

## Yerel önizleme/test
- Bu makinede `python`/`node` yok. Preview için `.claude/serve.ps1` (PowerShell `HttpListener`) port 8765'te servis eder; `launch.json` `static` adıyla tanımlı.
- Supabase modunda test ederken oluşan deneme kayıtlarını sonra temizle (panelden "Verileri sıfırla" veya authenticated client ile sil).

## Stil/ton
- Token'ı idareli kullan: değişiklikleri **küçük ve net** tut, gereksiz tam-tarama ve uzun test döngülerinden kaçın. Kullanıcı **Claude Pro** (düşük limit).

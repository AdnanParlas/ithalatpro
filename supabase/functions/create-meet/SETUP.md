# create-meet — Gerçek Google Meet linki kurulumu

Bu function, her randevuda **gerçek bir Google Meet linki** üretir ve Google'ın
daveti **hem sana hem müşteriye** e-postayla göndermesini, ikinizin de takvimine
eklemesini sağlar. Bir kez kurarsın, sonra otomatik çalışır.

Toplam ~15 dk. 3 aşama: **A) Google yetkisi → B) Supabase'e secret + deploy → C) siteyi aç.**

---

## A) Google'dan yetki al (Client ID + Secret + Refresh Token)

1. **Google Cloud Console** → https://console.cloud.google.com/ (görüşmeleri yapacağın
   Google hesabıyla gir).
2. Üstten **yeni proje** oluştur (örn. "İthalatPro"). Projeyi seç.
3. **APIs & Services → Library** → "Google Calendar API" ara → **Enable**.
4. **APIs & Services → OAuth consent screen:**
   - User Type: **External** → Create.
   - App name, support email, developer email yaz → kaydet.
   - **Audience / Test users** kısmına **kendi Google e-postanı** ekle.
   - (Yayınlama "Testing" kalabilir; sadece sen kullandığın için yeterli.)
5. **APIs & Services → Credentials → Create Credentials → OAuth client ID:**
   - Application type: **Web application**.
   - **Authorized redirect URIs** → ekle: `https://developers.google.com/oauthplayground`
   - Create → çıkan **Client ID** ve **Client Secret**'i bir yere kopyala.
6. **Refresh token al** (OAuth Playground ile):
   - https://developers.google.com/oauthplayground aç.
   - Sağ üstteki **dişli (⚙)** → **"Use your own OAuth credentials"** işaretle →
     Client ID + Client Secret'i yapıştır.
   - Sol kutuya şu scope'u **elle** yaz ve ekle:
     `https://www.googleapis.com/auth/calendar.events`
   - **Authorize APIs** → kendi hesabınla giriş yap, izin ver (uyarı çıkarsa
     "Advanced → devam et").
   - **Exchange authorization code for tokens** → çıkan **Refresh token**'ı kopyala.

> Elinde 4 değer olmalı: **Client ID, Client Secret, Refresh Token, ve kendi e-postan (OWNER_EMAIL).**

---

## B) Supabase'e secret ekle + function'ı deploy et

Bilgisayarında **Supabase CLI** gerekiyor (https://supabase.com/docs/guides/cli).

```bash
# proje kökünde (login bir kez):
supabase login
supabase link --project-ref bnzcomfnvjrlqtrzddge

# secret'ları ekle (kendi değerlerinle):
supabase secrets set GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
supabase secrets set GOOGLE_CLIENT_SECRET="..."
supabase secrets set GOOGLE_REFRESH_TOKEN="1//0..."
supabase secrets set OWNER_EMAIL="adnanparlas35@hotmail.com"

# function'ı deploy et (herkese açık form çağıracağı için jwt doğrulaması kapalı):
supabase functions deploy create-meet --no-verify-jwt
```

> CLI kuramıyorsan: Supabase Panel → **Edge Functions** üzerinden de
> `create-meet` oluşturup `index.ts` içeriğini yapıştırabilir, **Secrets**
> sekmesinden 4 değeri ekleyebilirsin.

---

## C) Siteyi aç

`assets/js/config.js` içinde:

```js
window.MEET = {
  useGoogleApi: true,   // ← false'tan true'ya çevir
  functionName: "create-meet",
  link: ""
};
```

Sonra: `git add -A && git commit -m "Google Meet API aktif" && git push`

Bitti. Artık her form gönderiminde:
- Gerçek bir Google Meet linki üretilir,
- Google daveti **sana ve müşteriye** e-postayla yollar (Meet linkiyle),
- Etkinlik **ikinizin de takvimine** eklenir,
- Onay sayfasında "Görüşmeye Katıl" butonu çıkar.

---

## Test / sorun giderme
- Bir test başvurusu yap; mail gelmezse function loglarına bak:
  Supabase Panel → Edge Functions → create-meet → **Logs**.
- `token_error` → Client ID/Secret/Refresh Token yanlış veya scope eksik (A6'yı tekrar yap).
- `calendar_error` → Calendar API enable edilmemiş (A3) ya da consent screen'e
  kendi e-postan test user olarak eklenmemiş (A4).
- Müşteriye davet gitmiyorsa: function `sendUpdates=all` kullanır; müşteri e-postası
  formda doğru girilmiş olmalı.

/* ============================================================
   config.js — Supabase bağlantı ayarları
   ------------------------------------------------------------
   Aşağıdaki url ve key'i kendi Supabase projenden al ve doldur:
     Supabase Panel → Project Settings → API
       • Project URL   → url
       • anon public   → key   (Bu anahtar tarayıcıda görünür; NORMALDİR.
                                 Güvenlik RLS kurallarıyla sağlanır.)

   ⚠️ Bu alanları doldurana kadar site otomatik olarak tarayıcı
      localStorage moduyla (demo) çalışır — hiçbir şey bozulmaz.
   ============================================================ */
window.SUPA = {
  url: "https://bnzcomfnvjrlqtrzddge.supabase.co",
  key: "sb_publishable_uKXkdpHy9aN-f4tx0vnAFQ_DXsZQ2am"
};

/* ============================================================
   BİLDİRİM — randevu alınınca SANA haber gelsin (e-posta + WhatsApp).

   • E-POSTA (FormSubmit — anahtar GEREKMEZ, sadece e-posta):
       ownerEmail'e adresini yaz. İlk randevuda FormSubmit sana bir
       "Activate" maili yollar; ondaki linke BİR KEZ tıklarsın, biter.
       Sonraki tüm randevular o adrese düşer. (Boş bırakılırsa atlanır.)

   • WHATSAPP (CallMeBot — kendi numarana ücretsiz bildirim):
       1) +34 644 51 95 23 numarasını rehbere ekle
       2) WhatsApp'tan ona yaz: "I allow callmebot to send me messages"
       3) Dönen "apikey" değerini callmebotApikey'e yapıştır
       (ownerPhone numaran zaten yazılı; apikey gelince doldururuz)
   ============================================================ */
window.NOTIFY = {
  ownerEmail: "adnanparlas35@hotmail.com",
  ownerPhone: "+905326534005",
  callmebotApikey: "8969213"
};

/* ============================================================
   GÖRÜŞME LİNKİ — iki mod:

   1) OTOMATİK (GERÇEK Google Meet — her randevuya AYRI link):
      useGoogleApi: true yap. Site, randevu onayında Supabase Edge
      Function'ı (create-meet) çağırır; Google Calendar API gerçek bir
      Meet linki üretir ve daveti HEM sana HEM müşteriye e-postayla yollar,
      ikinizin de takvimine ekler. Kurulum: supabase/functions/create-meet/SETUP.md

   2) SABİT ODA (yedek): link alanına kalıcı bir Meet/Zoom oda linki yaz.
      useGoogleApi kapalıysa (false) bu link kullanılır. Boşsa sadece
      "Takvime Ekle" çıkar.
   ============================================================ */
window.MEET = {
  useGoogleApi: false,             // SETUP.md tamamlanınca true yap
  functionName: "create-meet",     // Supabase Edge Function adı
  link: ""                         // yedek sabit oda linki (örn. https://meet.google.com/abc-defg-hij)
};

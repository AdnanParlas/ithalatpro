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
  callmebotApikey: "CALLMEBOT_APIKEY"
};

/* ============================================================
   GÖRÜŞME ODASI — randevu sayfasında ve mailde gösterilecek link.
   Sabit kişisel Meet/Zoom oda linkini yaz (herkes o saatte oradan katılır).
   Boş kalırsa link gösterilmez, sadece "Takvime Ekle" çıkar.
   ============================================================ */
window.MEET = {
  link: ""   // örn: https://meet.google.com/abc-defg-hij  veya Zoom oda linkin
};

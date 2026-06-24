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
   Anahtarları alınca doldur; boş/placeholder kalan kanal sessizce atlanır.

   • E-POSTA (Web3Forms — ücretsiz, hesap gerektirmez):
       1) https://web3forms.com → "Create your Access Key" → e-postanı yaz
       2) E-postana gelen Access Key'i web3formsKey'e yapıştır
       → Randevu maili o e-postaya düşer.

   • WHATSAPP (CallMeBot — kendi numarana ücretsiz bildirim):
       1) +34 644 51 95 23 numarasını telefon rehberine ekle
       2) Bu numaraya WhatsApp'tan yaz: "I allow callmebot to send me messages"
       3) Dönen "apikey" değerini callmebotApikey'e yapıştır
       (ownerPhone numaran zaten aşağıda yazılı)
   ============================================================ */
window.NOTIFY = {
  ownerPhone: "+905326534005",
  callmebotApikey: "CALLMEBOT_APIKEY",
  web3formsKey: "WEB3FORMS_ACCESS_KEY"
};

/* ============================================================
   GÖRÜŞME ODASI — randevu sayfasında ve mailde gösterilecek link.
   Sabit kişisel Meet/Zoom oda linkini yaz (herkes o saatte oradan katılır).
   Boş kalırsa link gösterilmez, sadece "Takvime Ekle" çıkar.
   ============================================================ */
window.MEET = {
  link: ""   // örn: https://meet.google.com/abc-defg-hij  veya Zoom oda linkin
};

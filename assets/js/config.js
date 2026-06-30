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
   GÖRÜŞME LİNKİ — Google Meet otomasyonu (Google Apps Script):

   • appsScriptUrl (AKTİF): Apps Script Web App'inin "/exec" URL'si.
     Her randevuda senin Google hesabında bir takvim etkinliği +
     randevuya ÖZEL Meet linki oluşur; müşteriye Google'dan otomatik
     davet/Meet linkli mail gider, etkinlik senin takvimine düşer.
     Kurulum: apps-script/KURULUM.md

   • link (YEDEK): appsScriptUrl boşsa/erişilemezse kullanılacak sabit
     oda linki. Boşsa sadece "Takvime Ekle" çıkar.
   ============================================================ */
window.MEET = {
  appsScriptUrl: "https://script.google.com/macros/s/AKfycby9-8mvjamawRY7WMP5NCwQ4tsO4NO7dlIvk6b3zgmugKuAGhogyghErm4EuJeZ1m-HnA/exec",
  link: ""                         // yedek sabit oda linki (örn. https://meet.google.com/abc-defg-hij)
};

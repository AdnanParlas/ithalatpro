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
   E-POSTA BİLDİRİMİ (EmailJS) — randevu alınınca SANA mail gelsin.
   ------------------------------------------------------------
   emailjs.com → ücretsiz hesap → Email Services + Email Templates.
   Aşağıyı doldur. Boş/placeholder kalırsa mail gönderilmez (site çalışır).
     • publicKey  : EmailJS → Account → General → Public Key
     • serviceId  : EmailJS → Email Services → Service ID
     • templateId : EmailJS → Email Templates → Template ID
     • to         : bildirimlerin geleceği e-posta adresin
   ============================================================ */
window.MAIL = {
  publicKey: "EMAILJS_PUBLIC_KEY",
  serviceId: "EMAILJS_SERVICE_ID",
  templateId: "EMAILJS_TEMPLATE_ID",
  to: "senin@eposta.com"
};

/* ============================================================
   GÖRÜŞME ODASI — randevu sayfasında ve mailde gösterilecek link.
   Sabit kişisel Meet/Zoom oda linkini yaz (herkes o saatte oradan katılır).
   Boş kalırsa link gösterilmez, sadece "Takvime Ekle" çıkar.
   ============================================================ */
window.MEET = {
  link: ""   // örn: https://meet.google.com/abc-defg-hij  veya Zoom oda linkin
};

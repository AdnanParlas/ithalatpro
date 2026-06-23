/* ============================================================
   public.js — index.html mantığı
   Adım 1 (landing) · Adım 2 (form + AI ön eleme) · Adım 3 (randevu)
   ============================================================ */
(function () {
  "use strict";
  var S = window.Store;

  /* ---------- Akış / sistem adımları (statik içerik) ---------- */
  var FLOW = [
    { n: 1, t: "Başvuru & Eleme", d: "Reklamdan gelen lead form doldurur, AI ön eler." },
    { n: 2, t: "Meet / Zoom", d: "Uygun lead'le canlı satış görüşmesi yapılır." },
    { n: 3, t: "RFQ Toplama", d: "Seçilen üreticilere teklif maili gönderilir." },
    { n: 4, t: "Maliyet & Rapor", d: "Teklifler karşılaştırılır, net maliyet çıkar." },
    { n: 5, t: "Teslim & Para", d: "Rapor müşteriye sunulur, satış tamamlanır." }
  ];

  var SYSTEM = [
    { n: 1, t: "Reklam & Landing", d: "Hedef kitle reklamı landing'e gelir.", faz: 1 },
    { n: 2, t: "Lead Form & Ön Eleme", d: "Form dolar, AI kaliteli lead ayırır.", faz: 1 },
    { n: 3, t: "Randevu Oluştur", d: "Google Meet / Zoom randevusu kurulur.", faz: 1 },
    { n: 4, t: "Admin Panel", d: "Tüm lead'ler tek panelde takip edilir.", faz: 1 },
    { n: 5, t: "Görüşme & İş Başlat", d: "Müşteri kartı açılır, iş başlatılır.", faz: 1 },
    { n: 6, t: "RFQ Mail Gönderimi", d: "Seçilen üreticilere teklif maili.", faz: 1 },
    { n: 7, t: "Maliyet Hesaplama", d: "FOB + navlun + vergi = toplam maliyet.", faz: 1 },
    { n: 8, t: "Rapor Teslim", d: "3 tedarikçi karşılaştırma raporu.", faz: 1 },
    { n: 9, t: "AI Ürün Analizi", d: "Üründen teknik brief üretilir.", faz: 2 },
    { n: 10, t: "AI Tedarikçi Bulma", d: "3-5 üretici otomatik bulunur.", faz: 2 },
    { n: 11, t: "Mail Okuma (Otomatik)", d: "Gelen mailden fiyat/MOQ çekilir.", faz: 2 },
    { n: 12, t: "Follow-up Otomasyonu", d: "Aralıklı otomatik takip mesajı.", faz: 2 },
    { n: 13, t: "Gelişmiş Panel", d: "Tüm süreç adım adım izlenir.", faz: 2 },
    { n: 14, t: "WhatsApp Entegrasyonu", d: "Müşteriye otomatik WhatsApp.", faz: 2 }
  ];

  function renderSteps() {
    var fs = document.getElementById("flow-steps");
    if (fs) fs.innerHTML = FLOW.map(function (s, i) {
      return '<div class="step" style="animation-delay:' + (i * 60) + 'ms">' +
        '<div class="num">' + s.n + '</div><h4>' + s.t + '</h4><p>' + s.d + '</p></div>';
    }).join("");

    var ss = document.getElementById("system-steps");
    if (ss) ss.innerHTML = SYSTEM.map(function (s, i) {
      return '<div class="step' + (s.faz === 2 ? ' is-faz2' : '') + '" style="animation-delay:' + (i * 40) + 'ms">' +
        '<div class="num">' + s.n + '</div><h4>' + S.esc(s.t) + '</h4><p>' + S.esc(s.d) + '</p></div>';
    }).join("");
  }

  /* ---------- AI ön eleme (kural tabanlı skor) ---------- */
  function scoreLead(d) {
    var score = 30, reasons = [];
    var budgetPts = { "<5K": 0, "5K-20K": 18, "20K+": 38, "50K+": 45 };
    score += budgetPts[d.butce] || 0;
    if (d.butce === "20K+" || d.butce === "50K+") reasons.push("Bütçe hedef aralığında (20K+)");
    else reasons.push("Bütçe hedefin altında");

    if (d.ithalatGecmisi === "Evet") { score += 18; reasons.push("Daha önce ithalat deneyimi var"); }
    else reasons.push("İlk kez ithalat yapacak");

    if (d.aciliyet === "Yüksek") { score += 14; reasons.push("Aciliyet yüksek — sıcak lead"); }
    else if (d.aciliyet === "Orta") score += 7;

    if ((d.urun || "").trim().length > 3) score += 4;
    score = Math.max(0, Math.min(100, score));
    return { score: score, kaliteli: score >= 60, reasons: reasons };
  }

  /* ---------- Form gönderimi ---------- */
  var currentLead = null;

  function handleSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) data[el.name] = el.value.trim(); });

    // basit doğrulama
    var missing = ["ad", "telefon", "email", "butce", "sektor", "urun", "ithalatGecmisi", "aciliyet"].filter(function (k) { return !data[k]; });
    if (missing.length) { S.toast("Eksik alan", "Lütfen tüm zorunlu alanları doldurun.", "red"); return; }

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Değerlendiriliyor…";

    S.fakeAsync(1100).then(function () {
      var res = scoreLead(data);
      data.durum = res.kaliteli ? "kaliteli" : "uygun-degil";
      data.kaliteSkoru = res.score;
      data.randevu = null;
      currentLead = S.saveLead(data);
      renderResult(res);
      btn.disabled = false; btn.textContent = "Gönder →";
      document.getElementById("side-panel").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function renderResult(res) {
    var panel = document.getElementById("side-panel");
    if (res.kaliteli) {
      panel.innerHTML =
        '<div class="card result-box result-quality">' +
          '<div class="flex-between"><span class="badge badge--green">✓ Kaliteli Lead</span><span class="mono muted">Skor: ' + res.score + '/100</span></div>' +
          '<h3 style="margin-top:12px">🎉 Tebrikler, başvurunuz uygun!</h3>' +
          '<p class="muted">Sizi bir satış görüşmesine (Google Meet / Zoom) almak istiyoruz. Aşağıdan uygun zamanı seçin.</p>' +
          '<ul style="margin:14px 0 16px; padding-left:18px; font-size:.88rem; color:var(--text-dim)">' +
            res.reasons.map(function (r) { return "<li>" + S.esc(r) + "</li>"; }).join("") +
          '</ul>' +
          '<button class="btn btn--block" id="open-cal">📅 Randevu Oluştur</button>' +
        '</div>';
      document.getElementById("open-cal").addEventListener("click", openAppointment);
    } else {
      panel.innerHTML =
        '<div class="card result-box result-reject">' +
          '<div class="flex-between"><span class="badge badge--red">Uygun Değil</span><span class="mono muted">Skor: ' + res.score + '/100</span></div>' +
          '<h3 style="margin-top:12px">Başvurunuz şu an için uygun değil</h3>' +
          '<p class="muted">Sistemimiz şu an minimum kriterleri karşılamayan başvuruları görüşmeye almıyor. Aşağıdaki noktalar puanı düşürdü:</p>' +
          '<ul style="margin:14px 0 16px; padding-left:18px; font-size:.88rem; color:var(--text-dim)">' +
            res.reasons.map(function (r) { return "<li>" + S.esc(r) + "</li>"; }).join("") +
          '</ul>' +
          '<p class="mute2" style="font-size:.84rem">Bütçeniz 20.000$+ seviyesine geldiğinde tekrar başvurabilirsiniz.</p>' +
        '</div>';
    }
  }

  /* ---------- Adım 3: Randevu ---------- */
  var appt = { tarih: null, saat: null, platform: null };

  function openAppointment() {
    appt = { tarih: null, saat: null, platform: null };
    var panel = document.getElementById("side-panel");
    panel.innerHTML =
      '<div class="card result-box">' +
        '<div class="flex-between"><h3>📅 Randevu Oluştur</h3><span class="badge badge--green">Adım 3</span></div>' +
        '<p class="muted" style="margin:6px 0 16px">Uygun bir gün, saat ve görüşme platformu seçin.</p>' +
        '<div id="cal-wrap"></div>' +
        '<div id="slot-wrap" style="margin-top:18px"></div>' +
        '<div id="plat-wrap" style="margin-top:18px"></div>' +
        '<button class="btn btn--block btn--lg" id="confirm-appt" style="margin-top:18px" disabled>Randevuyu Onayla</button>' +
      '</div>';
    renderCalendar();
    renderSlots();
    renderPlatforms();
    document.getElementById("confirm-appt").addEventListener("click", confirmAppointment);
  }

  function renderCalendar() {
    var dows = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    var today = new Date();
    var year = today.getFullYear(), month = today.getMonth();
    var monthName = today.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
    var first = new Date(year, month, 1);
    var startDow = (first.getDay() + 6) % 7; // Pazartesi=0
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var html = '<div class="flex-between" style="margin-bottom:10px"><strong>' + monthName + '</strong></div><div class="cal">';
    dows.forEach(function (d) { html += '<div class="dow">' + d + '</div>'; });
    for (var i = 0; i < startDow; i++) html += '<button class="day is-empty" disabled></button>';
    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(year, month, day);
      var dow = date.getDay();
      var past = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var weekend = (dow === 0 || dow === 6);
      var disabled = past || weekend;
      var iso = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
      html += '<button class="day" data-date="' + iso + '"' + (disabled ? " disabled" : "") + '>' + day + '</button>';
    }
    html += '</div>';
    document.getElementById("cal-wrap").innerHTML = html;
    Array.prototype.forEach.call(document.querySelectorAll(".cal .day[data-date]"), function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".cal .day").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        appt.tarih = b.getAttribute("data-date");
        checkApptReady();
      });
    });
  }

  function renderSlots() {
    var times = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    var html = '<span class="muted" style="font-size:.85rem; font-weight:600">Uygun Saatler</span><div class="slots" style="margin-top:8px">';
    times.forEach(function (t) { html += '<button data-time="' + t + '">' + t + '</button>'; });
    html += '</div>';
    document.getElementById("slot-wrap").innerHTML = html;
    Array.prototype.forEach.call(document.querySelectorAll(".slots button"), function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".slots button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); appt.saat = b.getAttribute("data-time"); checkApptReady();
      });
    });
  }

  function renderPlatforms() {
    document.getElementById("plat-wrap").innerHTML =
      '<span class="muted" style="font-size:.85rem; font-weight:600">Toplantı Platformu</span>' +
      '<div class="platforms" style="margin-top:8px">' +
        '<div class="platform" data-p="Google Meet"><span class="ico">📹</span><div><b>Google Meet</b><br><span class="mute2" style="font-size:.8rem">Tarayıcıdan katıl</span></div></div>' +
        '<div class="platform" data-p="Zoom"><span class="ico">🎥</span><div><b>Zoom</b><br><span class="mute2" style="font-size:.8rem">Uygulama / link</span></div></div>' +
      '</div>';
    Array.prototype.forEach.call(document.querySelectorAll(".platform"), function (p) {
      p.addEventListener("click", function () {
        document.querySelectorAll(".platform").forEach(function (x) { x.classList.remove("is-active"); });
        p.classList.add("is-active"); appt.platform = p.getAttribute("data-p"); checkApptReady();
      });
    });
  }

  function checkApptReady() {
    document.getElementById("confirm-appt").disabled = !(appt.tarih && appt.saat && appt.platform);
  }

  function confirmAppointment() {
    var btn = document.getElementById("confirm-appt");
    btn.disabled = true; btn.textContent = "Oluşturuluyor…";
    if (currentLead) S.updateLead(currentLead.id, { durum: "randevu", randevu: { tarih: appt.tarih, saat: appt.saat, platform: appt.platform } });

    S.fakeAsync(1000).then(function () {
      var d = new Date(appt.tarih + "T00:00:00");
      var pretty = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
      document.getElementById("side-panel").innerHTML =
        '<div class="card result-box result-quality center">' +
          '<div class="big-icon">✅</div>' +
          '<h3>Randevunuz oluşturuldu!</h3>' +
          '<p class="muted">' + S.esc(pretty) + " · " + S.esc(appt.saat) + '</p>' +
          '<div class="pill-list center" style="justify-content:center; margin:14px 0">' +
            '<span class="badge badge--green">' + S.esc(appt.platform) + '</span>' +
            '<span class="badge badge--blue">📧 E-posta gönderildi</span>' +
            '<span class="badge badge--green">💬 WhatsApp bildirimi</span>' +
          '</div>' +
          '<p class="mute2" style="font-size:.85rem">Görüşme linki e-posta ve WhatsApp ile size iletildi. Görüşmede üreticileri ve maliyeti birlikte değerlendireceğiz.</p>' +
        '</div>';
      S.toast("Randevu oluşturuldu", "E-posta + WhatsApp bildirimi gönderildi (demo).");
      S.toast("Görüşme planlandı", appt.platform + " · " + appt.saat, "orange");
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderSteps();
    document.getElementById("lead-form").addEventListener("submit", handleSubmit);
    // Veri katmanını yükle (Supabase veya localStorage). Form yazımı için cache hazır olsun.
    S.load().catch(function (e) { console.warn("Store.load hatası:", e); });
  });
})();

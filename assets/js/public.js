/* ============================================================
   public.js — index.html çok adımlı başvuru funnel'ı
   Soru 1: Bütçe (20.000$ altı → elenir) → Soru 2: Konteyner →
   Soru 3: Taşıma → İletişim → Randevu → bildirim + onay sayfası
   ============================================================ */
(function () {
  "use strict";
  var S = window.Store;
  var esc = S.esc;

  /* ---------- seçenekler ---------- */
  var BUDGETS = [
    { key: "5000",   label: "5.000$",    ico: "💵", ok: false },
    { key: "10000",  label: "10.000$",   ico: "💵", ok: false },
    { key: "20000",  label: "20.000$",   ico: "💰", ok: true },
    { key: "20000+", label: "20.000$+",  ico: "💎", ok: true }
  ];
  var KONTEYNERS = [
    { ico: "📦", label: "1 konteyner" },
    { ico: "📦", label: "2-5 konteyner" },
    { ico: "🗃️", label: "5-10 konteyner" },
    { ico: "🏭", label: "10+ konteyner" }
  ];
  var TASIMA = [
    { ico: "🚢", label: "Denizyolu" },
    { ico: "✈️", label: "Havayolu" },
    { ico: "🚚", label: "Karayolu" }
  ];
  var STEP_TOTAL = 3; // soru sayısı (ilerleme çubuğu için)

  /* ---------- durum ---------- */
  var wiz = {
    step: 0, blocked: false,
    data: { butce: "", butceOk: false, konteyner: "", tasima: "", ad: "", telefon: "", email: "" },
    appt: { tarih: null, saat: null, platform: null }
  };

  function body() { return document.getElementById("wiz-body"); }
  function setBar(pct) { var b = document.getElementById("wiz-bar"); if (b) b.style.width = pct + "%"; }
  function go(step) { wiz.step = step; render(); window.scrollTo({ top: document.getElementById("basvuru").offsetTop - 70, behavior: "smooth" }); }

  /* ---------- ortak: seçenekli adım ---------- */
  function choiceStep(opts) {
    setBar(opts.bar);
    var html = '<div class="wiz-step">' +
      '<span class="badge badge--green">' + esc(opts.tag) + '</span>' +
      '<h3>' + esc(opts.title) + '</h3>' +
      (opts.sub ? '<p class="muted">' + esc(opts.sub) + '</p>' : '') +
      '<div class="opts">' +
      opts.items.map(function (it, i) {
        var on = opts.selected === it.label;
        return '<button class="opt' + (on ? " is-on" : "") + '" data-i="' + i + '">' +
          '<span class="opt-ico">' + it.ico + '</span>' + esc(it.label) +
          '<span class="opt-arrow">›</span></button>';
      }).join("") +
      '</div>' +
      (opts.back !== undefined ?
        '<div class="wiz-nav"><button class="btn wiz-back" id="w-back">← Geri</button><span></span></div>' : '') +
      '</div>';
    body().innerHTML = html;
    body().querySelectorAll("[data-i]").forEach(function (el) {
      el.addEventListener("click", function () { opts.onPick(opts.items[+el.getAttribute("data-i")]); });
    });
    if (opts.back !== undefined) {
      var b = body().querySelector("#w-back"); if (b) b.addEventListener("click", function () { go(opts.back); });
    }
  }

  /* ---------- adım 0: bütçe (eleme) ---------- */
  function renderBudget() {
    choiceStep({
      bar: 5, tag: "Soru 1 / 3", title: "Aylık ithalat bütçeniz nedir?",
      sub: "Size en uygun tedarik planını sunabilmemiz için.",
      items: BUDGETS, selected: wiz.data.butce,
      onPick: function (b) {
        wiz.data.butce = b.label; wiz.data.butceOk = b.ok;
        if (!b.ok) { wiz.blocked = true; render(); }
        else go(1);
      }
    });
  }

  function renderBlocked() {
    setBar(100);
    body().innerHTML =
      '<div class="wiz-step" style="text-align:center">' +
        '<div class="big-icon" style="font-size:2.8rem">🚫</div>' +
        '<h3>Şu an için uygun değil</h3>' +
        '<p class="muted" style="max-width:420px; margin:8px auto 0">Hizmetimiz aylık <strong>20.000$ ve üzeri</strong> ithalat bütçesi olan işletmelere yöneliktir. Bütçeniz bu seviyeye geldiğinde sizi tekrar bekleriz.</p>' +
        '<button class="btn btn--ghost" id="w-restart" style="margin-top:20px">← Baştan başla</button>' +
      '</div>';
    body().querySelector("#w-restart").addEventListener("click", function () {
      wiz.blocked = false; wiz.data.butce = ""; wiz.data.butceOk = false; go(0);
    });
  }

  /* ---------- adım 1: konteyner ---------- */
  function renderKonteyner() {
    choiceStep({
      bar: 35, tag: "Soru 2 / 3", title: "Kaç konteyner mal düşünüyorsunuz?",
      sub: "Yaklaşık bir aralık seçmeniz yeterli.",
      items: KONTEYNERS, selected: wiz.data.konteyner, back: 0,
      onPick: function (it) { wiz.data.konteyner = it.label; go(2); }
    });
  }

  /* ---------- adım 2: taşıma ---------- */
  function renderTasima() {
    choiceStep({
      bar: 65, tag: "Soru 3 / 3", title: "Nasıl taşımak istersiniz?",
      sub: "Taşıma türünü seçin.",
      items: TASIMA, selected: wiz.data.tasima, back: 1,
      onPick: function (it) { wiz.data.tasima = it.label; go(3); }
    });
  }

  /* ---------- adım 3: iletişim ---------- */
  function renderContact() {
    setBar(85);
    body().innerHTML =
      '<div class="wiz-step">' +
        '<span class="badge badge--green">İletişim</span>' +
        '<h3>Size nasıl ulaşalım?</h3>' +
        '<p class="muted">Görüşme detaylarını bu bilgilerle paylaşacağız.</p>' +
        '<label class="field" style="margin-top:14px"><span>Ad Soyad *</span><input id="w-ad" value="' + esc(wiz.data.ad) + '" placeholder="Adınız Soyadınız" /></label>' +
        '<label class="field"><span>Telefon *</span><input id="w-tel" value="' + esc(wiz.data.telefon) + '" placeholder="+90 5xx xxx xx xx" /></label>' +
        '<label class="field"><span>E-posta *</span><input id="w-email" type="email" value="' + esc(wiz.data.email) + '" placeholder="ornek@firma.com" /></label>' +
        '<div class="wiz-nav"><button class="btn wiz-back" id="w-back">← Geri</button><button class="btn" id="w-next">Devam → Randevu</button></div>' +
      '</div>';
    body().querySelector("#w-back").addEventListener("click", function () { saveContact(); go(2); });
    body().querySelector("#w-next").addEventListener("click", function () {
      saveContact();
      if (!wiz.data.ad || !wiz.data.telefon || !wiz.data.email) { S.toast("Eksik bilgi", "Lütfen tüm alanları doldurun.", "red"); return; }
      if (wiz.data.email.indexOf("@") < 0) { S.toast("E-posta hatalı", "Geçerli bir e-posta girin.", "red"); return; }
      go(4);
    });
  }
  function saveContact() {
    wiz.data.ad = (document.getElementById("w-ad") || {}).value || wiz.data.ad;
    wiz.data.telefon = (document.getElementById("w-tel") || {}).value || wiz.data.telefon;
    wiz.data.email = (document.getElementById("w-email") || {}).value || wiz.data.email;
  }

  /* ---------- adım 4: randevu ---------- */
  function renderAppointment() {
    setBar(95);
    body().innerHTML =
      '<div class="wiz-step">' +
        '<span class="badge badge--green">Randevu</span>' +
        '<h3>Görüşme zamanı seçin</h3>' +
        '<p class="muted">Görüşme <strong>bizim ekibimizle</strong> (Google Meet / Zoom) yapılacak.</p>' +
        '<div id="cal-wrap" style="margin-top:14px"></div>' +
        '<div id="slot-wrap" style="margin-top:18px"></div>' +
        '<div id="plat-wrap" style="margin-top:18px"></div>' +
        '<div class="wiz-nav"><button class="btn wiz-back" id="w-back">← Geri</button><button class="btn btn--lg" id="w-confirm" disabled>Randevuyu Onayla</button></div>' +
      '</div>';
    renderCalendar(); renderSlots(); renderPlatforms();
    body().querySelector("#w-back").addEventListener("click", function () { go(3); });
    body().querySelector("#w-confirm").addEventListener("click", confirmAppointment);
  }

  function renderCalendar() {
    var dows = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    var today = new Date();
    var year = today.getFullYear(), month = today.getMonth();
    var monthName = today.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
    var startDow = (new Date(year, month, 1).getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var html = '<div class="flex-between" style="margin-bottom:10px"><strong>' + monthName + '</strong></div><div class="cal">';
    dows.forEach(function (d) { html += '<div class="dow">' + d + '</div>'; });
    for (var i = 0; i < startDow; i++) html += '<button class="day is-empty" disabled></button>';
    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(year, month, day), dow = date.getDay();
      var past = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var disabled = past || dow === 0 || dow === 6;
      var iso = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
      html += '<button class="day" data-date="' + iso + '"' + (disabled ? " disabled" : "") + '>' + day + '</button>';
    }
    html += '</div>';
    document.getElementById("cal-wrap").innerHTML = html;
    body().querySelectorAll(".cal .day[data-date]").forEach(function (b) {
      b.addEventListener("click", function () {
        body().querySelectorAll(".cal .day").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); wiz.appt.tarih = b.getAttribute("data-date"); checkReady();
      });
    });
  }
  function renderSlots() {
    var times = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    document.getElementById("slot-wrap").innerHTML =
      '<span class="muted" style="font-size:.85rem; font-weight:600">Uygun Saatler</span><div class="slots" style="margin-top:8px">' +
      times.map(function (t) { return '<button data-time="' + t + '">' + t + '</button>'; }).join("") + '</div>';
    body().querySelectorAll(".slots button").forEach(function (b) {
      b.addEventListener("click", function () {
        body().querySelectorAll(".slots button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); wiz.appt.saat = b.getAttribute("data-time"); checkReady();
      });
    });
  }
  function renderPlatforms() {
    document.getElementById("plat-wrap").innerHTML =
      '<span class="muted" style="font-size:.85rem; font-weight:600">Toplantı Platformu</span>' +
      '<div class="platforms" style="margin-top:8px">' +
        '<div class="platform" data-p="Google Meet"><span class="ico">📹</span><div><b>Google Meet</b></div></div>' +
        '<div class="platform" data-p="Zoom"><span class="ico">🎥</span><div><b>Zoom</b></div></div>' +
      '</div>';
    body().querySelectorAll(".platform").forEach(function (p) {
      p.addEventListener("click", function () {
        body().querySelectorAll(".platform").forEach(function (x) { x.classList.remove("is-active"); });
        p.classList.add("is-active"); wiz.appt.platform = p.getAttribute("data-p"); checkReady();
      });
    });
  }
  function checkReady() {
    var c = document.getElementById("w-confirm");
    if (c) c.disabled = !(wiz.appt.tarih && wiz.appt.saat && wiz.appt.platform);
  }

  /* ---------- onay: kaydet + bildir + yönlendir ---------- */
  function confirmAppointment() {
    var btn = document.getElementById("w-confirm");
    btn.disabled = true; btn.textContent = "Oluşturuluyor…";
    var d = wiz.data, a = wiz.appt;
    var lead = {
      ad: d.ad, telefon: d.telefon, email: d.email,
      butce: d.butce, konteyner: d.konteyner, tasima: d.tasima,
      urun: (d.konteyner || "") + (d.tasima ? " · " + d.tasima : ""),
      durum: "randevu", kaliteSkoru: 100,
      randevu: { tarih: a.tarih, saat: a.saat, platform: a.platform }
    };
    var saved = S.saveLead(lead);
    // S.flush(): kaydın Supabase'e yazılmasını garanti et (yönlendirme iptal etmesin)
    Promise.race([
      Promise.all([S.flush(), notifyOwner(saved, a), S.fakeAsync(700)]),
      S.fakeAsync(6000)
    ]).then(function () {
      var params = new URLSearchParams({ ad: saved.ad || "", tarih: a.tarih, saat: a.saat, platform: a.platform });
      window.location.href = "randevu.html?" + params.toString();
    });
  }

  /* ---------- Google Takvim linki ---------- */
  function gcalLink(tarih, saat, platform) {
    if (!tarih || !saat) return "";
    var d = tarih.replace(/-/g, ""); var hm = saat.split(":");
    var sh = parseInt(hm[0], 10), sm = parseInt(hm[1], 10);
    var eh = sh, em = sm + 30; if (em >= 60) { eh += 1; em -= 60; }
    var p = function (n) { return String(n).padStart(2, "0"); };
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent("İthalatPro Görüşmesi") +
      "&dates=" + d + "T" + p(sh) + p(sm) + "00/" + d + "T" + p(eh) + p(em) + "00" +
      "&ctz=Europe/Istanbul" +
      "&details=" + encodeURIComponent("Tedarik görüşmesi (" + (platform || "") + ").");
  }

  /* ---------- sahibe bildirim (e-posta: FormSubmit) ---------- */
  function notifyOwner(lead, appt) {
    lead = lead || {}; var N = window.NOTIFY || {};
    var msg = [
      "🔔 Yeni Randevu — İthalatPro",
      "Müşteri: " + (lead.ad || "-"),
      "Telefon: " + (lead.telefon || "-"),
      "E-posta: " + (lead.email || "-"),
      "Bütçe: " + (lead.butce || "-"),
      "Konteyner: " + (lead.konteyner || "-"),
      "Taşıma: " + (lead.tasima || "-"),
      "Tarih/Saat: " + appt.tarih + " " + appt.saat,
      "Platform: " + appt.platform,
      "Toplantı oluştur: " + gcalLink(appt.tarih, appt.saat, appt.platform)
    ].join("\n");
    var jobs = [];
    if (N.ownerEmail && /@/.test(N.ownerEmail)) {
      jobs.push(fetch("https://formsubmit.co/ajax/" + encodeURIComponent(N.ownerEmail), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "🔔 Yeni Randevu: " + (lead.ad || ""),
          _template: "table",
          Musteri: lead.ad || "-", Telefon: lead.telefon || "-", Eposta: lead.email || "-",
          Butce: lead.butce || "-", Konteyner: lead.konteyner || "-", Tasima: lead.tasima || "-",
          Randevu: appt.tarih + " " + appt.saat, Platform: appt.platform,
          ToplantiOlustur: gcalLink(appt.tarih, appt.saat, appt.platform)
        })
      }).then(function () {}, function (e) { console.warn("E-posta gönderilemedi:", e); }));
    }
    if (N.callmebotApikey && N.ownerPhone && !/CALLMEBOT_/.test(N.callmebotApikey)) {
      var phone = String(N.ownerPhone).replace(/[^0-9]/g, "");
      var url = "https://api.callmebot.com/whatsapp.php?phone=" + phone +
        "&text=" + encodeURIComponent(msg) + "&apikey=" + encodeURIComponent(N.callmebotApikey);
      try { (new Image()).src = url; } catch (e) {}
      jobs.push(S.fakeAsync(600));
    }
    return Promise.all(jobs);
  }

  /* ---------- router ---------- */
  function render() {
    if (wiz.blocked) return renderBlocked();
    switch (wiz.step) {
      case 0: return renderBudget();
      case 1: return renderKonteyner();
      case 2: return renderTasima();
      case 3: return renderContact();
      case 4: return renderAppointment();
    }
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    render();
    S.load().catch(function (e) { console.warn("Store.load:", e); });
  });
})();

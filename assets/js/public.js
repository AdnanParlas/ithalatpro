/* ============================================================
   public.js — index.html başvuru formu
   Tek ekran form: Ad, E-posta, Telefon, Ürün, Sektör, Tahmini kg
   + Google Meet randevu (takvim + saat) → bildirim + onay sayfası
   ============================================================ */
(function () {
  "use strict";
  var S = window.Store;
  var esc = S.esc;

  /* ---------- durum ---------- */
  var form = {
    data: { ad: "", email: "", telefon: "", urun: "", sektor: "", miktarKg: "" },
    appt: { tarih: null, saat: null, platform: "Google Meet" }
  };

  function body() { return document.getElementById("form-body"); }

  /* ---------- formu çiz ---------- */
  function render() {
    body().innerHTML =
      '<div class="form-step">' +
        '<span class="badge badge--green">İletişim Bilgileri</span>' +
        '<div class="form-cols" style="margin-top:14px">' +
          '<label class="field"><span>Ad Soyad *</span><input id="f-ad" value="' + esc(form.data.ad) + '" placeholder="Adınız Soyadınız" /></label>' +
          '<label class="field"><span>Telefon *</span><input id="f-tel" value="' + esc(form.data.telefon) + '" placeholder="+90 5xx xxx xx xx" /></label>' +
        '</div>' +
        '<label class="field"><span>E-posta *</span><input id="f-email" type="email" value="' + esc(form.data.email) + '" placeholder="ornek@firma.com" /></label>' +

        '<span class="badge badge--green" style="margin-top:18px; display:inline-block">Ürün Bilgileri</span>' +
        '<label class="field" style="margin-top:14px"><span>Düşündüğünüz ürün *</span><input id="f-urun" value="' + esc(form.data.urun) + '" placeholder="Örn: Plastik saklama kutusu, LED aydınlatma…" /></label>' +
        '<div class="form-cols">' +
          '<label class="field"><span>Sektör *</span><input id="f-sektor" value="' + esc(form.data.sektor) + '" placeholder="Örn: Ev & Yaşam, Elektronik…" /></label>' +
          '<label class="field"><span>Tahmini miktar (kg) *</span><input id="f-kg" type="number" min="0" value="' + esc(form.data.miktarKg) + '" placeholder="Örn: 500" /></label>' +
        '</div>' +

        '<span class="badge badge--green" style="margin-top:18px; display:inline-block">📅 Google Meet Görüşmesi</span>' +
        '<p class="muted" style="margin-top:8px">Size uygun bir gün ve saat seçin. Görüşme <strong>Google Meet</strong> üzerinden yapılacaktır.</p>' +
        '<div id="cal-wrap" style="margin-top:14px"></div>' +
        '<div id="slot-wrap" style="margin-top:18px"></div>' +

        '<button class="btn btn--lg btn--block" id="f-confirm" style="margin-top:22px" disabled>📅 Google Meet Randevusu Oluştur</button>' +
      '</div>';

    renderCalendar(); renderSlots();
    body().querySelector("#f-confirm").addEventListener("click", confirmForm);
  }

  /* ---------- takvim ---------- */
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
        b.classList.add("is-active"); form.appt.tarih = b.getAttribute("data-date"); checkReady();
      });
    });
  }

  /* ---------- saatler ---------- */
  function renderSlots() {
    var times = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    document.getElementById("slot-wrap").innerHTML =
      '<span class="muted" style="font-size:.85rem; font-weight:600">Uygun Saatler</span><div class="slots" style="margin-top:8px">' +
      times.map(function (t) { return '<button data-time="' + t + '">' + t + '</button>'; }).join("") + '</div>';
    body().querySelectorAll(".slots button").forEach(function (b) {
      b.addEventListener("click", function () {
        body().querySelectorAll(".slots button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); form.appt.saat = b.getAttribute("data-time"); checkReady();
      });
    });
  }

  function saveFields() {
    var v = function (id) { return (document.getElementById(id) || {}).value || ""; };
    form.data.ad = v("f-ad").trim();
    form.data.telefon = v("f-tel").trim();
    form.data.email = v("f-email").trim();
    form.data.urun = v("f-urun").trim();
    form.data.sektor = v("f-sektor").trim();
    form.data.miktarKg = v("f-kg").trim();
  }

  function checkReady() {
    var c = document.getElementById("f-confirm");
    if (c) c.disabled = !(form.appt.tarih && form.appt.saat);
  }

  /* ---------- onay: doğrula + kaydet + bildir + yönlendir ---------- */
  function confirmForm() {
    saveFields();
    var d = form.data, a = form.appt;
    if (!d.ad || !d.telefon || !d.email || !d.urun || !d.sektor || !d.miktarKg) {
      S.toast("Eksik bilgi", "Lütfen tüm alanları doldurun.", "red"); return;
    }
    if (d.email.indexOf("@") < 0) { S.toast("E-posta hatalı", "Geçerli bir e-posta girin.", "red"); return; }
    if (!a.tarih || !a.saat) { S.toast("Randevu seçin", "Lütfen bir gün ve saat seçin.", "red"); return; }

    var btn = document.getElementById("f-confirm");
    btn.disabled = true; btn.textContent = "Oluşturuluyor…";

    var lead = {
      ad: d.ad, telefon: d.telefon, email: d.email,
      urun: d.urun, sektor: d.sektor, miktarKg: d.miktarKg,
      durum: "randevu", kaliteSkoru: 100,
      randevu: { tarih: a.tarih, saat: a.saat, platform: a.platform }
    };
    var saved = S.saveLead(lead);
    // Önce gerçek Meet linkini üret (varsa), sonra bildir + yönlendir.
    Promise.race([createMeet(saved, a), S.fakeAsync(8000).then(function () { return ""; })])
      .then(function (meetLink) {
        if (meetLink) { saved.randevu.meetLink = meetLink; S.saveLead(saved); }
        // S.flush(): kaydın Supabase'e yazılmasını garanti et (yönlendirme iptal etmesin)
        return Promise.race([
          Promise.all([S.flush(), notifyOwner(saved, a, meetLink), S.fakeAsync(500)]),
          S.fakeAsync(6000)
        ]).then(function () {
          var params = new URLSearchParams({
            ad: saved.ad || "", tarih: a.tarih, saat: a.saat,
            platform: a.platform, urun: saved.urun || ""
          });
          if (meetLink) params.set("meet", meetLink);
          window.location.href = "randevu.html?" + params.toString();
        });
      });
  }

  /* ---------- gerçek Google Meet linki (Supabase Edge Function) ---------- */
  function createMeet(lead, appt) {
    var M = window.MEET || {}, SUPA = window.SUPA || {};
    if (!M.useGoogleApi || !SUPA.url || !SUPA.key) return Promise.resolve("");
    var url = SUPA.url.replace(/\/+$/, "") + "/functions/v1/" + (M.functionName || "create-meet");
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SUPA.key, "apikey": SUPA.key },
      body: JSON.stringify({
        ad: lead.ad, email: lead.email, tarih: appt.tarih, saat: appt.saat,
        urun: lead.urun, sektor: lead.sektor, miktarKg: lead.miktarKg
      })
    }).then(function (r) { return r.json(); })
      .then(function (d) { return (d && d.meetLink) ? d.meetLink : ""; })
      .catch(function (e) { console.warn("create-meet hatası:", e); return ""; });
  }

  /* ---------- Google Takvim linki ---------- */
  function gcalLink(tarih, saat, platform) {
    if (!tarih || !saat) return "";
    var d = tarih.replace(/-/g, ""); var hm = saat.split(":");
    var sh = parseInt(hm[0], 10), sm = parseInt(hm[1], 10);
    var eh = sh, em = sm + 30; if (em >= 60) { eh += 1; em -= 60; }
    var p = function (n) { return String(n).padStart(2, "0"); };
    var meet = (window.MEET && window.MEET.link) ? String(window.MEET.link).trim() : "";
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent("İthalatPro Görüşmesi") +
      "&dates=" + d + "T" + p(sh) + p(sm) + "00/" + d + "T" + p(eh) + p(em) + "00" +
      "&ctz=Europe/Istanbul" +
      "&details=" + encodeURIComponent("Tedarik görüşmesi (" + (platform || "") + ")." + (meet ? " Katılım linki: " + meet : ""));
  }

  /* ---------- sahibe bildirim (e-posta: FormSubmit) ---------- */
  function notifyOwner(lead, appt, meetLink) {
    lead = lead || {}; var N = window.NOTIFY || {};
    var meet = (meetLink || (window.MEET && window.MEET.link) || "").toString().trim();
    var msg = [
      "🔔 Yeni Görüşme Talebi — İthalatPro",
      "Müşteri: " + (lead.ad || "-"),
      "Telefon: " + (lead.telefon || "-"),
      "E-posta: " + (lead.email || "-"),
      "Ürün: " + (lead.urun || "-"),
      "Sektör: " + (lead.sektor || "-"),
      "Tahmini miktar: " + (lead.miktarKg || "-") + " kg",
      "Tarih/Saat: " + appt.tarih + " " + appt.saat,
      "Platform: " + appt.platform,
      (meet ? "Google Meet linki: " + meet : "Toplantı oluştur: " + gcalLink(appt.tarih, appt.saat, appt.platform))
    ].join("\n");
    var jobs = [];
    if (N.ownerEmail && /@/.test(N.ownerEmail)) {
      jobs.push(fetch("https://formsubmit.co/ajax/" + encodeURIComponent(N.ownerEmail), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "🔔 Yeni Görüşme: " + (lead.ad || ""),
          _template: "table",
          Musteri: lead.ad || "-", Telefon: lead.telefon || "-", Eposta: lead.email || "-",
          Urun: lead.urun || "-", Sektor: lead.sektor || "-", MiktarKg: (lead.miktarKg || "-") + " kg",
          Randevu: appt.tarih + " " + appt.saat, Platform: appt.platform,
          GoogleMeet: meet || "-",
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

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    render();
    S.load().catch(function (e) { console.warn("Store.load:", e); });
  });
})();

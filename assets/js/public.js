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
    data: { ad: "", email: "", telefon: "", urun: "", sektor: "", konteyner: "" },
    appt: { tarih: null, saat: null, platform: "Google Meet" }
  };

  function body() { return document.getElementById("form-body"); }

  /* ---------- konteyner görseli (gerçek konteyner SVG) ---------- */
  function containerSVG(bodyW) {
    var lines = "";
    for (var x = 12; x < bodyW - 4; x += 7) {
      lines += '<line x1="' + x + '" y1="13" x2="' + x + '" y2="35"/>';
    }
    var iconW = bodyW > 70 ? 64 : 46;
    return '<svg viewBox="0 0 ' + (bodyW + 10) + ' 48" width="' + iconW + '" height="30" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="5" y="10" width="' + bodyW + '" height="28" rx="2" fill="#c45a3a" stroke="#6f3120" stroke-width="2"/>' +
      '<g stroke="#9a4127" stroke-width="1.6">' + lines + '</g>' +
      '<rect x="5" y="10" width="' + bodyW + '" height="4" fill="#6f3120"/>' +
      '<rect x="5" y="34" width="' + bodyW + '" height="4" fill="#6f3120"/>' +
      '<rect x="3" y="9" width="5" height="30" rx="1" fill="#5c2819"/>' +
      '<rect x="' + (bodyW + 2) + '" y="9" width="5" height="30" rx="1" fill="#5c2819"/>' +
      '</svg>';
  }
  // "Full konteyner değil" (parsiyel) ikonu — palet üstünde koliler
  function parcelSVG() {
    return '<svg viewBox="0 0 48 48" width="34" height="30" xmlns="http://www.w3.org/2000/svg">' +
      // alttaki iki koli
      '<rect x="6" y="20" width="16" height="13" rx="1.5" fill="#c9a24a" stroke="#8a6b25" stroke-width="2"/>' +
      '<rect x="24" y="20" width="16" height="13" rx="1.5" fill="#c9a24a" stroke="#8a6b25" stroke-width="2"/>' +
      // üstteki koli (ortalı)
      '<rect x="15" y="8" width="16" height="13" rx="1.5" fill="#d8b35c" stroke="#8a6b25" stroke-width="2"/>' +
      '<path d="M23 8 V21" stroke="#8a6b25" stroke-width="1.6"/>' +
      // palet
      '<rect x="3" y="34" width="42" height="4" fill="#7a5b2a"/>' +
      '<rect x="5" y="38" width="5" height="5" fill="#6b4f24"/>' +
      '<rect x="21" y="38" width="5" height="5" fill="#6b4f24"/>' +
      '<rect x="38" y="38" width="5" height="5" fill="#6b4f24"/>' +
      '</svg>';
  }
  var KONTEYNERLER = [
    { k: "Full konteyner değil", ico: parcelSVG() },
    { k: "20'lik", ico: containerSVG(54) },
    { k: "40'lık", ico: containerSVG(78) }
  ];

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
        '<label class="field"><span>Sektör *</span><input id="f-sektor" value="' + esc(form.data.sektor) + '" placeholder="Örn: Ev & Yaşam, Elektronik…" /></label>' +
        '<span class="muted" style="font-size:.85rem; font-weight:600">Konteyner</span>' +
        '<div class="platforms" id="kont-wrap" style="margin-top:8px">' +
          KONTEYNERLER.map(function (it) {
            return '<div class="platform' + (form.data.konteyner === it.k ? " is-active" : "") + '" data-k="' + esc(it.k) + '">' +
              '<span class="ico">' + it.ico + '</span><div><b>' + esc(it.k) + '</b></div></div>';
          }).join("") +
        '</div>' +

        '<span class="badge badge--green" style="margin-top:18px; display:inline-block">📅 Google Meet Görüşmesi</span>' +
        '<p class="muted" style="margin-top:8px">Size uygun bir gün ve saat seçin. Görüşme <strong>Google Meet</strong> üzerinden yapılacaktır.</p>' +
        '<div id="cal-wrap" style="margin-top:14px"></div>' +
        '<div id="slot-wrap" style="margin-top:18px"></div>' +

        '<button class="btn btn--lg btn--block" id="f-confirm" style="margin-top:22px" disabled>📅 Randevu Oluştur</button>' +
      '</div>';

    renderCalendar(); renderSlots();
    body().querySelectorAll("#kont-wrap .platform").forEach(function (p) {
      p.addEventListener("click", function () {
        body().querySelectorAll("#kont-wrap .platform").forEach(function (x) { x.classList.remove("is-active"); });
        p.classList.add("is-active"); form.data.konteyner = p.getAttribute("data-k");
      });
    });
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
  }

  function checkReady() {
    var c = document.getElementById("f-confirm");
    if (c) c.disabled = !(form.appt.tarih && form.appt.saat);
  }

  /* ---------- onay: doğrula + kaydet + bildir + yönlendir ---------- */
  function confirmForm() {
    saveFields();
    var d = form.data, a = form.appt;
    if (!d.ad || !d.telefon || !d.email || !d.urun || !d.sektor) {
      S.toast("Eksik bilgi", "Lütfen tüm alanları doldurun.", "red"); return;
    }
    if (!d.konteyner) { S.toast("Konteyner seçin", "Lütfen bir konteyner seçeneği seçin.", "red"); return; }
    if (d.email.indexOf("@") < 0) { S.toast("E-posta hatalı", "Geçerli bir e-posta girin.", "red"); return; }
    if (!a.tarih || !a.saat) { S.toast("Randevu seçin", "Lütfen bir gün ve saat seçin.", "red"); return; }

    var btn = document.getElementById("f-confirm");
    btn.disabled = true; btn.textContent = "Oluşturuluyor…";

    var lead = {
      ad: d.ad, telefon: d.telefon, email: d.email,
      urun: d.urun, sektor: d.sektor, konteyner: d.konteyner,
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
            platform: a.platform, urun: saved.urun || "",
            sektor: saved.sektor || "", konteyner: saved.konteyner || "",
            telefon: saved.telefon || ""
          });
          if (meetLink) params.set("meet", meetLink);
          window.location.href = "randevu.html?" + params.toString();
        });
      });
  }

  /* ---------- gerçek Google Meet linki (Google Apps Script web app) ----------
     config.js → window.MEET.appsScriptUrl'e POST eder. Apps Script senin Google
     hesabında bir takvim etkinliği + randevuya ÖZEL Meet linki oluşturur,
     müşteriyi davetli ekleyip Google'ın davet/Meet linkli mailini gönderir ve
     linki geri döner. text/plain gövde "basit istek"tir → CORS preflight olmaz
     (Apps Script OPTIONS isteklerini yanıtlayamaz). */
  function createMeet(lead, appt) {
    var M = window.MEET || {};
    var url = (M.appsScriptUrl || "").trim();
    if (!url || !/^https?:\/\//.test(url)) return Promise.resolve("");
    return fetch(url, {
      method: "POST",
      body: JSON.stringify({
        ad: lead.ad, email: lead.email, telefon: lead.telefon,
        urun: lead.urun, sektor: lead.sektor, konteyner: lead.konteyner,
        startISO: appt.tarih + "T" + appt.saat + ":00+03:00"
      })
    }).then(function (r) { return r.json(); })
      .then(function (d) { return (d && d.meetLink) ? d.meetLink : ""; })
      .catch(function (e) { console.warn("create-meet (Apps Script) hatası:", e); return ""; });
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
      "Konteyner: " + (lead.konteyner || "-"),
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
          Urun: lead.urun || "-", Sektor: lead.sektor || "-", Konteyner: lead.konteyner || "-",
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
      // keepalive: yönlendirme (randevu.html) olsa bile istek iptal olmaz → mesaj garanti gider.
      jobs.push(
        fetch(url, { mode: "no-cors", keepalive: true }).then(function () {}, function () {
          try { (new Image()).src = url; } catch (e) {} // yedek
        })
      );
    }
    return Promise.all(jobs);
  }

  /* ---------- #basvuru linkleri: header'ı hesaba katan güvenli kaydırma ----------
     (iOS Safari hash + scroll-margin'i smooth scroll'da bazen yok sayıyor;
      JS ile sabit header yüksekliği + küçük pay bırakıp net konuma indiriyoruz.) */
  function wireSmoothAnchors() {
    document.querySelectorAll('a[href="#basvuru"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var sec = document.getElementById("basvuru");
        if (!sec) return;
        e.preventDefault();
        var nav = document.querySelector(".nav");
        var navH = nav ? nav.getBoundingClientRect().height : 64;
        var y = sec.getBoundingClientRect().top + window.pageYOffset - navH - 14;
        window.scrollTo({ top: y, behavior: "smooth" });
        if (history.replaceState) history.replaceState(null, "", "#basvuru");
      });
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    render();
    wireSmoothAnchors();
    S.load().catch(function (e) { console.warn("Store.load:", e); });
  });
})();

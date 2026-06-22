/* ============================================================
   panel.js — Admin Panel (Adım 4-14)
   Tek sayfa, sekmeli (router yok; view değiştirme).
   Veriler Store (localStorage) üzerinden okunur/yazılır.
   ============================================================ */
(function () {
  "use strict";
  var S = window.Store;
  S.seedIfEmpty();

  var DURUM = {
    "yeni": { t: "Yeni", c: "mute" },
    "kaliteli": { t: "Kaliteli Lead", c: "green" },
    "uygun-degil": { t: "Uygun Değil", c: "red" },
    "randevu": { t: "Randevu", c: "blue" },
    "is-basladi": { t: "İş Başladı", c: "orange" },
    "rapor-hazir": { t: "Rapor Hazır", c: "green" }
  };

  var TITLES = {
    dashboard: ["Dashboard", "Faz 1 · Genel Bakış"],
    leads: ["Lead Listesi", "Faz 1 · Adım 4"],
    customer: ["Müşteri Kartı & İş Başlat", "Faz 1 · Adım 5"],
    rfq: ["RFQ Mail Gönderimi", "Faz 1 · Adım 6"],
    cost: ["Maliyet Hesaplama", "Faz 1 · Adım 7"],
    report: ["Rapor Teslim", "Faz 1 · Adım 8"],
    "ai-analiz": ["AI Ürün Analizi", "Faz 2 · Adım 9"],
    "ai-tedarik": ["AI Tedarikçi Bulma", "Faz 2 · Adım 10"],
    "mail-oku": ["Mail Okuma (Otomatik)", "Faz 2 · Adım 11"],
    followup: ["Follow-up Otomasyonu", "Faz 2 · Adım 12"],
    surec: ["Gelişmiş Panel & Süreç Takip", "Faz 2 · Adım 13"],
    whatsapp: ["WhatsApp Entegrasyonu", "Faz 2 · Adım 14"]
  };

  var state = { view: "dashboard", selectedLead: null, selectedJob: null };

  /* ---------- yardımcı ---------- */
  function el(id) { return document.getElementById(id); }
  function badge(durum) { var d = DURUM[durum] || DURUM.yeni; return '<span class="badge badge--' + d.c + '">' + d.t + "</span>"; }
  function root() { return el("view-root"); }

  /* =========================================================
     ROUTER
     ========================================================= */
  function go(view) {
    state.view = view;
    document.querySelectorAll(".side-link").forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("data-view") === view);
    });
    var t = TITLES[view] || ["", ""];
    el("view-title").textContent = t[0];
    el("crumb").textContent = t[1];
    (VIEWS[view] || VIEWS.dashboard)();
  }

  /* =========================================================
     ADIM 4 — DASHBOARD
     ========================================================= */
  function viewDashboard() {
    var leads = S.getLeads(), jobs = S.getJobs();
    var kaliteli = leads.filter(function (l) { return l.durum === "kaliteli" || l.durum === "randevu" || l.durum === "is-basladi"; }).length;
    var randevulu = leads.filter(function (l) { return l.randevu; }).length;
    var isBaslayan = jobs.length;

    var rows = leads.slice(0, 6).map(function (l) {
      return "<tr><td><strong>" + S.esc(l.ad) + "</strong><br><span class='mute2' style='font-size:.8rem'>" + S.esc(l.urun) + "</span></td>" +
        "<td>" + S.esc(l.sektor) + "</td><td class='mono'>" + S.esc(l.butce) + "</td>" +
        "<td>" + badge(l.durum) + "</td><td class='mute2'>" + S.timeAgo(l.createdAt) + "</td></tr>";
    }).join("") || "<tr><td colspan='5' class='center mute2' style='padding:30px'>Henüz lead yok.</td></tr>";

    root().innerHTML =
      '<div class="view">' +
      '<div class="stat-grid">' +
        statCard("👥", "Toplam Lead", leads.length, "Tüm başvurular", "green") +
        statCard("⭐", "Kaliteli Lead", kaliteli, "Ön elemeyi geçen", "green") +
        statCard("📅", "Randevu", randevulu, "Görüşme planlanan", "blue") +
        statCard("🚀", "İş Başlayan", isBaslayan, "Aktif tedarik süreci", "orange") +
      '</div>' +
      '<div class="card"><div class="flex-between" style="margin-bottom:14px"><h3>Son Lead\'ler</h3>' +
        '<button class="btn btn--sm btn--ghost" data-goto="leads">Tümünü gör →</button></div>' +
        '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Lead</th><th>Sektör</th><th>Bütçe</th><th>Durum</th><th>Tarih</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>' +
      '<div class="row" style="margin-top:16px">' +
        '<div class="card" style="flex:1; min-width:260px"><h3>⚡ Faz 1 — Çalışan Çekirdek</h3><p class="muted" style="font-size:.9rem; margin-top:6px">Lead → Meet → RFQ → Rapor → Para. Hemen satışa hazır.</p>' +
          '<div class="pill-list" style="margin-top:12px"><span class="badge badge--green">2-3 hafta kurulum</span><span class="badge badge--green">Düşük maliyet</span></div></div>' +
        '<div class="card" style="flex:1; min-width:260px"><h3>📈 Faz 2 — Otomasyon</h3><p class="muted" style="font-size:.9rem; margin-top:6px">%70+ otomatik süreç. AI tedarikçi bulma, mail okuma, follow-up, WhatsApp.</p>' +
          '<div class="pill-list" style="margin-top:12px"><span class="badge badge--orange">Daha yüksek kapasite</span><span class="badge badge--orange">Zaman tasarrufu</span></div></div>' +
      '</div></div>';

    root().querySelectorAll("[data-goto]").forEach(function (b) { b.addEventListener("click", function () { go(b.getAttribute("data-goto")); }); });
  }

  function statCard(ico, k, v, d, color) {
    return '<div class="stat"><div class="k">' + ico + " " + k + '</div><div class="v">' + v + '</div><div class="d badge badge--' + color + '" style="display:inline-block">' + d + '</div></div>';
  }

  /* =========================================================
     ADIM 4 — LEAD LİSTESİ
     ========================================================= */
  function viewLeads() {
    root().innerHTML =
      '<div class="view"><div class="toolbar">' +
        '<input id="lead-search" placeholder="🔍 İsim / ürün ara…" />' +
        '<select id="lead-filter"><option value="">Tüm durumlar</option>' +
          Object.keys(DURUM).map(function (k) { return '<option value="' + k + '">' + DURUM[k].t + '</option>'; }).join("") +
        '</select><div class="spacer"></div>' +
        '<span class="muted" id="lead-count" style="font-size:.85rem"></span></div>' +
      '<div class="card" style="padding:0; overflow-x:auto"><table class="tbl"><thead><tr>' +
        '<th>Ad Soyad</th><th>Ürün</th><th>Sektör</th><th>Bütçe</th><th>Skor</th><th>Durum</th><th>İşlem</th>' +
      '</tr></thead><tbody id="lead-rows"></tbody></table></div></div>';

    function paint() {
      var q = (el("lead-search").value || "").toLowerCase();
      var f = el("lead-filter").value;
      var leads = S.getLeads().filter(function (l) {
        var okQ = !q || (l.ad + " " + l.urun).toLowerCase().indexOf(q) >= 0;
        var okF = !f || l.durum === f;
        return okQ && okF;
      });
      el("lead-count").textContent = leads.length + " kayıt";
      el("lead-rows").innerHTML = leads.map(function (l) {
        return "<tr><td><strong>" + S.esc(l.ad) + "</strong><br><span class='mute2' style='font-size:.78rem'>" + S.esc(l.telefon) + "</span></td>" +
          "<td>" + S.esc(l.urun) + "</td><td>" + S.esc(l.sektor) + "</td><td class='mono'>" + S.esc(l.butce) + "</td>" +
          "<td><span class='mono'>" + (l.kaliteSkoru || 0) + "</span></td><td>" + badge(l.durum) + "</td>" +
          "<td><button class='btn btn--sm' data-lead='" + l.id + "'>Aç →</button></td></tr>";
      }).join("") || "<tr><td colspan='7' class='center mute2' style='padding:30px'>Kayıt bulunamadı.</td></tr>";
      el("lead-rows").querySelectorAll("[data-lead]").forEach(function (b) {
        b.addEventListener("click", function () { state.selectedLead = b.getAttribute("data-lead"); go("customer"); });
      });
    }
    el("lead-search").addEventListener("input", paint);
    el("lead-filter").addEventListener("change", paint);
    paint();
  }

  /* =========================================================
     ADIM 5 — MÜŞTERİ KARTI & İŞ BAŞLAT
     ========================================================= */
  function viewCustomer() {
    var lead = state.selectedLead ? S.getLead(state.selectedLead) : null;
    if (!lead) {
      var leads = S.getLeads();
      root().innerHTML = '<div class="view"><div class="card"><h3>Müşteri seçin</h3><p class="muted" style="margin:6px 0 14px">İş başlatmak için bir lead seçin.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">' +
        leads.map(function (l) {
          return '<div class="card" style="cursor:pointer; padding:16px" data-pick="' + l.id + '"><div class="flex-between"><strong>' + S.esc(l.ad) + '</strong>' + badge(l.durum) + '</div><p class="muted" style="font-size:.85rem; margin-top:6px">' + S.esc(l.urun) + '</p></div>';
        }).join("") + '</div></div></div>';
      root().querySelectorAll("[data-pick]").forEach(function (c) { c.addEventListener("click", function () { state.selectedLead = c.getAttribute("data-pick"); viewCustomer(); }); });
      return;
    }

    var job = S.getJobByLead(lead.id);
    var randevuHtml = lead.randevu
      ? '<span class="badge badge--blue">' + S.esc(lead.randevu.platform) + " · " + S.esc(lead.randevu.tarih) + " " + S.esc(lead.randevu.saat) + '</span>'
      : '<span class="mute2">Randevu yok</span>';

    root().innerHTML =
      '<div class="view"><div class="row" style="align-items:stretch">' +
      '<div class="card cust-card" style="flex:1; min-width:300px">' +
        '<div class="flex-between"><div><h3>' + S.esc(lead.ad) + '</h3><span class="mute2">' + S.esc(lead.sektor) + '</span></div>' + badge(lead.durum) + '</div>' +
        '<div class="kv">' +
          '<div class="k">📞 Telefon</div><div>' + S.esc(lead.telefon) + '</div>' +
          '<div class="k">📧 E-posta</div><div>' + S.esc(lead.email) + '</div>' +
          '<div class="k">📦 Ürün</div><div>' + S.esc(lead.urun) + '</div>' +
          '<div class="k">💰 Bütçe</div><div class="mono">' + S.esc(lead.butce) + '</div>' +
          '<div class="k">🔁 İthalat</div><div>' + S.esc(lead.ithalatGecmisi || "-") + '</div>' +
          '<div class="k">⚡ Aciliyet</div><div>' + S.esc(lead.aciliyet || "-") + '</div>' +
          '<div class="k">⭐ Kalite Skoru</div><div class="mono">' + (lead.kaliteSkoru || 0) + '/100</div>' +
          '<div class="k">📅 Görüşme</div><div>' + randevuHtml + '</div>' +
        '</div>' +
        (job
          ? '<div class="badge badge--green" style="margin-top:8px">✓ İş başlatıldı (' + (job.adet || 0) + ' adet)</div>' +
            '<button class="btn btn--block" id="go-rfq" style="margin-top:14px">RFQ adımına git →</button>'
          : '<label class="field" style="margin-top:8px"><span>Tahmini Adet</span><input id="job-adet" type="number" value="5000" min="1" /></label>' +
            '<button class="btn btn--block btn--lg" id="start-job">🚀 İş Başlat</button>') +
      '</div>' +
      '<div class="card" style="flex:1; min-width:280px"><h3>📋 Görüşme Notu</h3><p class="muted" style="font-size:.88rem; margin:6px 0 12px">Meet/Zoom görüşmesi sonrası müşteri ihtiyacı.</p>' +
        '<textarea id="note" placeholder="Örn: 5.000 adet plastik saklama kutusu, gıda uyumlu, hızlı teslim isteniyor…">' + (job ? "Görüşme tamamlandı, tedarik süreci başlatıldı." : "") + '</textarea>' +
        '<div class="brief" style="margin-top:14px"><h5>Sonraki adım</h5><p class="muted" style="font-size:.88rem">İş başlatıldığında otomatik olarak RFQ (teklif toplama) adımına geçilir; seçilen üreticilere standart teklif maili hazırlanır.</p></div>' +
      '</div></div></div>';

    if (job) {
      el("go-rfq").addEventListener("click", function () { state.selectedJob = job.id; go("rfq"); });
    } else {
      el("start-job").addEventListener("click", function () {
        var adet = parseInt(el("job-adet").value, 10) || 5000;
        var newJob = S.saveJob({ leadId: lead.id, urun: lead.urun, adet: adet, ureticiler: [], rfqGonderildi: false, teklifler: [], maliyet: null, rapor: null, durum: "is-basladi" });
        S.updateLead(lead.id, { durum: "is-basladi" });
        state.selectedJob = newJob.id;
        S.toast("İş başlatıldı", lead.ad + " · " + adet + " adet " + lead.urun);
        go("rfq");
      });
    }
  }

  /* =========================================================
     ADIM 6 — RFQ MAIL GÖNDERİMİ
     ========================================================= */
  function currentJob() {
    if (state.selectedJob) return S.getJob(state.selectedJob);
    var jobs = S.getJobs();
    return jobs[0] || null;
  }

  function viewRFQ() {
    var job = currentJob();
    if (!job) { emptyState("Önce bir iş başlatın", "Müşteri & İş sekmesinden bir lead seçip 'İş Başlat' deyin.", "customer"); return; }
    var lead = S.getLead(job.leadId);

    var mfrHtml = S.MANUFACTURERS.map(function (m) {
      var on = job.ureticiler.indexOf(m.id) >= 0;
      return '<label class="mfr' + (on ? " is-on" : "") + '" data-mfr="' + m.id + '">' +
        '<input type="checkbox"' + (on ? " checked" : "") + ' />' +
        '<span class="flag">🇨🇳</span><div class="meta"><b>' + S.esc(m.name) + '</b>' +
        '<span>' + S.esc(m.city) + ' · <span class="stars">' + S.stars(m.rating) + '</span> ' + m.rating + ' · FOB $' + m.fob + ' · MOQ ' + m.moq + '</span></div></label>';
    }).join("");

    root().innerHTML =
      '<div class="view"><div class="cost-grid">' +
      '<div class="card"><div class="flex-between"><h3>Üretici Seç</h3><span class="badge badge--green">' + S.esc(job.urun) + ' · ' + job.adet + ' adet</span></div>' +
        '<p class="muted" style="font-size:.88rem; margin:6px 0 14px">RFQ (teklif talebi) göndermek istediğiniz üreticileri işaretleyin.</p>' +
        '<div class="grid" id="mfr-list">' + mfrHtml + '</div>' +
        '<button class="btn btn--block btn--lg" id="send-rfq" style="margin-top:16px">✉️ Mailleri Gönder</button>' +
      '</div>' +
      '<div><div class="mail-preview"><div class="mhead"><strong>📧 RFQ Mail Önizleme</strong><br><span style="font-size:.82rem">Kime: Seçili üreticiler · Konu: Quotation Request – ' + S.esc(job.urun) + '</span></div>' +
        '<pre id="mail-body">' + rfqMailText(job, lead) + '</pre></div>' +
        '<div class="card" style="margin-top:14px"><h3 style="font-size:.95rem">Durum</h3><div id="rfq-status" class="pill-list" style="margin-top:10px">' +
          (job.rfqGonderildi ? '<span class="badge badge--green">✓ ' + job.ureticiler.length + ' üreticiye gönderildi</span>' : '<span class="badge badge--mute">Henüz gönderilmedi</span>') +
        '</div>' + (job.rfqGonderildi ? '<button class="btn btn--ghost btn--block" id="to-cost" style="margin-top:12px">Maliyet adımına geç →</button>' : '') + '</div>' +
      '</div></div></div>';

    function refreshSel() {
      var ids = [];
      root().querySelectorAll(".mfr").forEach(function (m) { if (m.querySelector("input").checked) ids.push(m.getAttribute("data-mfr")); });
      job.ureticiler = ids; S.saveJob(job);
      el("mail-body").textContent = rfqMailText(job, lead);
    }
    root().querySelectorAll(".mfr").forEach(function (m) {
      // .mfr bir <label>; checkbox'ı sarar, tıklama native olarak toggle eder.
      var cb = m.querySelector("input");
      cb.addEventListener("change", function () {
        m.classList.toggle("is-on", cb.checked);
        refreshSel();
      });
    });

    el("send-rfq").addEventListener("click", function () {
      if (!job.ureticiler.length) { S.toast("Üretici seçin", "En az bir üretici işaretleyin.", "red"); return; }
      var btn = el("send-rfq"); btn.disabled = true; btn.textContent = "Gönderiliyor…";
      S.fakeAsync(1200).then(function () {
        // teklifleri demo olarak üret
        job.rfqGonderildi = true;
        job.teklifler = job.ureticiler.map(function (id) {
          var m = S.MANUFACTURERS.filter(function (x) { return x.id === id; })[0];
          return { uretici: m.name, fob: m.fob, moq: m.moq, leadTime: (18 + Math.floor(Math.random() * 14)) + " gün", sertifika: m.certs };
        });
        job.durum = "rfq-gonderildi"; S.saveJob(job);
        S.toast("RFQ gönderildi", job.ureticiler.length + " üreticiye teklif maili iletildi (demo).");
        viewRFQ();
      });
    });
    if (el("to-cost")) el("to-cost").addEventListener("click", function () { go("cost"); });
  }

  function rfqMailText(job, lead) {
    return "Dear Supplier,\n\nWe are sourcing the following product for our client" +
      (lead ? " (" + lead.sektor + ")" : "") + ". Please send your best quotation:\n\n" +
      "• Product: " + job.urun + "\n" +
      "• Estimated Qty: " + job.adet + " pcs\n" +
      "• Terms: FOB\n" +
      "• Required: Unit price, MOQ, lead time, certificates (ISO/CE/FDA)\n\n" +
      "Looking forward to your offer.\n\nBest regards,\nİthalatPro Sourcing Team";
  }

  /* =========================================================
     ADIM 7 — MALİYET HESAPLAMA
     ========================================================= */
  function viewCost() {
    var job = currentJob();
    if (!job) { emptyState("Önce bir iş başlatın", "Maliyet hesaplamak için aktif bir iş gerekli.", "customer"); return; }
    var m = job.maliyet || { fob: 0, navlun: 0, sigorta: 0, kdv: 0, gumruk: 0, diger: 0 };
    // fob otomatik: en uygun teklif * adet
    if (!job.maliyet && job.teklifler.length) {
      var best = job.teklifler.slice().sort(function (a, b) { return a.fob - b.fob; })[0];
      m.fob = Math.round(best.fob * job.adet);
      m.navlun = Math.round(m.fob * 0.12);
      m.sigorta = Math.round(m.fob * 0.016);
      m.gumruk = Math.round(m.fob * 0.05);
      m.kdv = Math.round((m.fob + m.gumruk) * 0.0); // demo: dahil değil
      m.diger = 120;
    }

    function fields() {
      return [["fob", "FOB Bedeli (ürün)"], ["navlun", "Navlun (taşıma)"], ["sigorta", "Sigorta"], ["gumruk", "Gümrük Vergisi"], ["kdv", "KDV"], ["diger", "Diğer Masraflar"]]
        .map(function (f) {
          return '<label class="field"><span>' + f[1] + ' (USD)</span><input type="number" min="0" data-cost="' + f[0] + '" value="' + (m[f[0]] || 0) + '" /></label>';
        }).join("");
    }

    root().innerHTML =
      '<div class="view"><div class="cost-grid">' +
      '<div class="card"><h3>Maliyet Kalemleri</h3><p class="muted" style="font-size:.88rem; margin:6px 0 14px">' + S.esc(job.urun) + ' · ' + job.adet + ' adet. Değerleri düzenleyin, toplam anında güncellenir.</p>' +
        '<div class="form-cols">' + fields() + '</div></div>' +
      '<div><div class="cost-total"><div class="lbl">TOPLAM MALİYET</div><div class="amt" id="cost-amt">—</div>' +
        '<div id="cost-lines" style="margin-top:14px"></div>' +
        '<div class="flex-between" style="margin-top:14px; border-top:1px solid rgba(255,255,255,.25); padding-top:12px"><span>Birim Maliyet</span><strong id="cost-unit" class="mono"></strong></div></div>' +
        '<button class="btn btn--block btn--lg" id="save-cost" style="margin-top:14px">💾 Maliyeti Kaydet & Rapora Geç</button></div>' +
      '</div></div>';

    function recalc() {
      var data = {};
      root().querySelectorAll("[data-cost]").forEach(function (i) { data[i.getAttribute("data-cost")] = parseFloat(i.value) || 0; });
      var toplam = data.fob + data.navlun + data.sigorta + data.gumruk + data.kdv + data.diger;
      data.toplam = toplam;
      el("cost-amt").textContent = S.fmtMoney(toplam);
      el("cost-unit").textContent = S.fmtMoney(job.adet ? (toplam / job.adet).toFixed(2) : 0);
      el("cost-lines").innerHTML = [["FOB", data.fob], ["Navlun", data.navlun], ["Sigorta", data.sigorta], ["Gümrük", data.gumruk], ["KDV", data.kdv], ["Diğer", data.diger]]
        .map(function (l) { return '<div class="cost-line"><span>' + l[0] + '</span><span class="mono">' + S.fmtMoney(l[1]) + '</span></div>'; }).join("");
      return data;
    }
    root().querySelectorAll("[data-cost]").forEach(function (i) { i.addEventListener("input", recalc); });
    recalc();

    el("save-cost").addEventListener("click", function () {
      job.maliyet = recalc(); job.durum = "maliyet-hazir"; S.saveJob(job);
      S.toast("Maliyet kaydedildi", "Toplam: " + S.fmtMoney(job.maliyet.toplam));
      go("report");
    });
  }

  /* =========================================================
     ADIM 8 — RAPOR TESLİM
     ========================================================= */
  function viewReport() {
    var job = currentJob();
    if (!job) { emptyState("Önce bir iş başlatın", "Rapor için aktif bir iş gerekli.", "customer"); return; }
    if (!job.teklifler.length) { emptyState("Önce RFQ gönderin", "Karşılaştırma raporu için teklif gerekli.", "rfq"); return; }
    var lead = S.getLead(job.leadId);

    var sorted = job.teklifler.slice().sort(function (a, b) { return a.fob - b.fob; });
    var best = sorted[0];
    if (!job.rapor) { job.rapor = { enUygun: best.uretici }; S.saveJob(job); }

    var rows = sorted.map(function (t) {
      var isBest = t.uretici === best.uretici;
      var birim = job.maliyet ? (job.maliyet.toplam / job.adet) : t.fob;
      return "<tr style='" + (isBest ? "background:var(--green-soft)" : "") + "'><td><strong>" + S.esc(t.uretici) + "</strong> " + (isBest ? '<span class="badge badge--green">En Uygun</span>' : "") + "</td>" +
        "<td class='mono'>$" + t.fob + "</td><td class='mono'>" + t.moq + "</td><td>" + S.esc(t.leadTime) + "</td><td>" + S.esc(t.sertifika) + "</td>" +
        "<td class='mono'>" + S.fmtMoney(t.fob * job.adet) + "</td></tr>";
    }).join("");

    root().innerHTML =
      '<div class="view"><div class="card" id="report-card">' +
        '<div class="flex-between no-print"><div><h3>Tedarikçi Karşılaştırma Raporu</h3><span class="mute2">' + S.esc(lead ? lead.ad : "") + ' · ' + S.esc(job.urun) + ' · ' + job.adet + ' adet</span></div>' +
          '<div class="row"><button class="btn btn--ghost btn--sm" id="print-pdf">📄 PDF İndir</button><button class="btn btn--sm" id="send-cust">📤 Müşteriye Gönder</button></div></div>' +
        '<div style="overflow-x:auto; margin-top:16px"><table class="tbl"><thead><tr><th>Üretici</th><th>FOB (birim)</th><th>MOQ</th><th>Lead Time</th><th>Sertifika</th><th>Toplam (' + job.adet + ' adet)</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="grid" style="grid-template-columns:1fr 1fr; margin-top:18px">' +
          '<div class="brief"><h5>✅ Önerilen Tedarikçi</h5><p style="font-size:1.05rem; font-weight:700; color:var(--green)">' + S.esc(best.uretici) + '</p><p class="muted" style="font-size:.86rem">En düşük FOB, uygun sertifikalar ve makul lead time kombinasyonu.</p></div>' +
          '<div class="brief"><h5>💰 Tahmini Toplam Maliyet</h5><p style="font-size:1.4rem; font-weight:800">' + (job.maliyet ? S.fmtMoney(job.maliyet.toplam) : "Maliyet hesaplanmadı") + '</p>' +
            (job.maliyet ? '<p class="muted" style="font-size:.86rem">Birim: ' + S.fmtMoney((job.maliyet.toplam / job.adet).toFixed(2)) + ' (FOB + navlun + vergi dahil)</p>' : '<button class="btn btn--sm btn--ghost no-print" id="go-cost2" style="margin-top:6px">Maliyet hesapla →</button>') +
          '</div>' +
        '</div>' +
      '</div></div>';

    el("print-pdf").addEventListener("click", function () { window.print(); });
    if (el("go-cost2")) el("go-cost2").addEventListener("click", function () { go("cost"); });
    el("send-cust").addEventListener("click", function () {
      var btn = el("send-cust"); btn.disabled = true; btn.textContent = "Gönderiliyor…";
      job.durum = "rapor-hazir"; S.saveJob(job);
      if (lead) S.updateLead(lead.id, { durum: "rapor-hazir" });
      // whatsapp mesajı kuyruğa ekle
      var msgs = S.getMessages();
      msgs.push({ id: S.uid("wa"), yon: "out", text: "Merhaba " + (lead ? lead.ad : "") + ", tedarikçi karşılaştırma raporunuz hazır. En uygun seçenek: " + best.uretici + ". 📑", t: nowHM() });
      S.saveMessages(msgs);
      S.fakeAsync(1000).then(function () {
        S.toast("Rapor gönderildi", "PDF + WhatsApp ile müşteriye iletildi (demo).");
        S.toast("Süreç tamamlandı", "Lead → Rapor akışı bitti. 🎉", "orange");
        btn.disabled = false; btn.textContent = "✓ Gönderildi";
      });
    });
  }

  /* =========================================================
     ADIM 9 — AI ÜRÜN ANALİZİ
     ========================================================= */
  function viewAIAnaliz() {
    root().innerHTML =
      '<div class="view"><div class="cost-grid">' +
      '<div class="card"><h3>🧠 Ürün → Teknik Brief</h3><p class="muted" style="font-size:.88rem; margin:6px 0 12px">Ürün açıklamasını yazın, AI teknik brief üretsin (demo).</p>' +
        '<label class="field"><span>Ürün Açıklaması</span><textarea id="ai-input" placeholder="Örn: Mutfak için 1.5L plastik saklama kutusu, gıdayla temas eden, kapaklı, BPA içermeyen…">Mutfak için 1.5L plastik saklama kutusu, gıdayla temas eden, kapaklı, istiflenebilir</textarea></label>' +
        '<button class="btn btn--block btn--orange" id="ai-run">⚡ Teknik Brief Oluştur</button></div>' +
      '<div class="card"><h3>Teknik Brief</h3><div id="ai-out" style="margin-top:10px"><p class="mute2">Henüz oluşturulmadı.</p></div></div>' +
      '</div></div>';

    el("ai-run").addEventListener("click", function () {
      var txt = (el("ai-input").value || "").trim();
      if (!txt) { S.toast("Açıklama girin", "Önce ürün açıklaması yazın.", "red"); return; }
      var out = el("ai-out"); out.innerHTML = '<p class="muted">AI analiz ediyor <span class="typing"><i></i><i></i><i></i></span></p>';
      S.fakeAsync(1400).then(function () { out.innerHTML = buildBrief(txt); });
    });
  }

  function buildBrief(txt) {
    var lower = txt.toLowerCase();
    var malzeme = /plastik|polipropilen|pp|pet/.test(lower) ? "Gıda sınıfı PP (Polipropilen), BPA-free" : /metal|çelik|alüm/.test(lower) ? "Paslanmaz çelik 304 / alüminyum" : "Üretici ile teyit edilecek";
    var sertifikalar = /gıda|food|mutfak/.test(lower) ? "LFGB, FDA, ISO 9001" : "ISO 9001, CE";
    var olcu = (txt.match(/\d+([.,]\d+)?\s?(l|lt|litre|ml|cm|mm|inch|")/i) || ["belirtilmemiş"])[0];
    return '<div class="brief">' +
      '<h5>Ürün Tanımı</h5><p class="muted" style="font-size:.9rem">' + S.esc(txt) + '</p>' +
      '<h5>Teknik Özellikler</h5><ul>' +
        '<li>Ölçü/Hacim: ' + S.esc(olcu) + '</li>' +
        '<li>Kullanım: ' + (/gıda|mutfak/.test(lower) ? "Gıda saklama, mutfak" : "Genel kullanım") + '</li>' +
        '<li>Özellik: ' + (/kapak/.test(lower) ? "Kapaklı, sızdırmaz" : "Standart") + (/istif/.test(lower) ? ", istiflenebilir" : "") + '</li>' +
      '</ul>' +
      '<h5>Malzeme</h5><ul><li>' + S.esc(malzeme) + '</li></ul>' +
      '<h5>Gerekli Sertifikalar</h5><ul><li>' + S.esc(sertifikalar) + '</li></ul>' +
      '<h5>RFQ İçin Sorulacaklar</h5><ul><li>Birim fiyat (FOB)</li><li>MOQ</li><li>Lead time</li><li>Numune ücreti</li></ul>' +
      '</div>';
  }

  /* =========================================================
     ADIM 10 — AI TEDARİKÇİ BULMA
     ========================================================= */
  function viewAITedarik() {
    root().innerHTML =
      '<div class="view"><div class="card"><div class="flex-between"><div><h3>🔎 AI Tedarikçi Bulma</h3><span class="muted" style="font-size:.88rem">Ürün için 3-5 üretici otomatik önerilir (demo).</span></div></div>' +
        '<div class="row" style="margin-top:14px"><input id="ai-prod" placeholder="Ürün adı (örn: LED panel)" value="Plastik saklama kutusu" style="max-width:300px" />' +
        '<button class="btn btn--orange" id="ai-find">⚡ Üretici Bul</button></div>' +
        '<div id="ai-mfr-out" style="margin-top:18px"></div></div></div>';

    el("ai-find").addEventListener("click", function () {
      var out = el("ai-mfr-out");
      out.innerHTML = '<p class="muted">Üreticiler taranıyor <span class="typing"><i></i><i></i><i></i></span></p>';
      S.fakeAsync(1500).then(function () {
        var list = S.MANUFACTURERS.slice().sort(function (a, b) { return b.rating - a.rating; }).slice(0, 4);
        out.innerHTML = '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">' +
          list.map(function (m) {
            return '<div class="card" style="padding:16px"><div class="flex-between"><strong>🇨🇳 ' + S.esc(m.name) + '</strong></div>' +
              '<p class="stars" style="margin:6px 0">' + S.stars(m.rating) + ' <span class="muted">' + m.rating + '</span></p>' +
              '<p class="muted" style="font-size:.84rem">' + S.esc(m.city) + ' · FOB $' + m.fob + ' · MOQ ' + m.moq + '<br>Sertifika: ' + S.esc(m.certs) + '</p>' +
              '<span class="badge badge--green" style="margin-top:8px">Eşleşme %' + (80 + Math.floor(m.rating)) + '</span></div>';
          }).join("") + '</div>';
        S.toast("Tedarikçi bulundu", list.length + " üretici eşleştirildi (demo).", "orange");
      });
    });
    el("ai-find").click();
  }

  /* =========================================================
     ADIM 11 — MAIL OKUMA (OTOMATİK)
     ========================================================= */
  function viewMailOku() {
    var sample = "Hello,\n\nThank you for your inquiry. Please find our quotation below:\n\nUnit price (FOB Shenzhen): USD 0.79 / pcs\nMOQ: 3000 pcs\nLead time: 25 days after deposit\nCertificates: ISO9001, CE\nPayment: 30% deposit, 70% before shipment\n\nBest regards,\nLinda — Shenzhen Top Plastics Co.";
    root().innerHTML =
      '<div class="view"><div class="cost-grid">' +
      '<div class="card"><h3>📥 Gelen Mail</h3><p class="muted" style="font-size:.88rem; margin:6px 0 12px">Üreticiden gelen teklif mailini yapıştırın; sistem fiyat, MOQ, lead time ve sertifikayı otomatik çeksin (demo parser).</p>' +
        '<textarea id="mail-in" style="min-height:220px">' + sample + '</textarea>' +
        '<button class="btn btn--block btn--orange" id="parse-mail" style="margin-top:12px">🔍 Verileri Çek</button></div>' +
      '<div class="card"><h3>Çekilen Veriler</h3><div id="parse-out" style="margin-top:10px"><p class="mute2">Henüz işlenmedi.</p></div></div>' +
      '</div></div>';

    el("parse-mail").addEventListener("click", function () {
      var t = el("mail-in").value || "";
      var out = el("parse-out");
      out.innerHTML = '<p class="muted">Okunuyor <span class="typing"><i></i><i></i><i></i></span></p>';
      S.fakeAsync(1100).then(function () {
        var fob = (t.match(/(?:usd|\$)\s?([0-9]+(?:[.,][0-9]+)?)/i) || [])[1] || "—";
        var moq = (t.match(/moq[:\s]*([0-9.,]+)/i) || [])[1] || "—";
        var lead = (t.match(/lead\s*time[:\s]*([0-9]+\s*(?:day|days|gün))/i) || [])[1] || "—";
        var cert = (t.match(/(iso\s?9001|iso|ce|fda|fcc|rohs)[,\s/]*((?:ce|fda|fcc|rohs|iso)?)/i) || [])[0] || "—";
        var pay = (t.match(/([0-9]+%[^.\n]*deposit[^.\n]*)/i) || [])[1] || "—";
        out.innerHTML = '<div class="brief">' +
          '<div class="cost-line"><span>FOB Birim Fiyat</span><strong class="mono">$' + S.esc(fob) + '</strong></div>' +
          '<div class="cost-line"><span>MOQ</span><strong class="mono">' + S.esc(moq) + ' adet</strong></div>' +
          '<div class="cost-line"><span>Lead Time</span><strong>' + S.esc(lead) + '</strong></div>' +
          '<div class="cost-line"><span>Sertifika</span><strong>' + S.esc(cert.toUpperCase()) + '</strong></div>' +
          '<div class="cost-line"><span>Ödeme</span><strong>' + S.esc(pay) + '</strong></div>' +
          '<span class="badge badge--green" style="margin-top:12px">✓ Otomatik çıkarıldı</span></div>';
        S.toast("Mail okundu", "Fiyat/MOQ/lead time otomatik çekildi (demo).", "orange");
      });
    });
  }

  /* =========================================================
     ADIM 12 — FOLLOW-UP OTOMASYONU
     ========================================================= */
  function viewFollowup() {
    var fups = S.getFollowups();
    var items = fups.map(function (f) {
      var cls = f.durum === "gonderildi" ? "" : "is-pending";
      return '<div class="tl-item ' + cls + '"><div class="flex-between"><strong>' + S.esc(f.asama) + ' · ' + S.esc(f.musteri) + '</strong>' +
        (f.durum === "gonderildi" ? '<span class="badge badge--green">Gönderildi</span>' : '<span class="badge badge--mute">Bekliyor</span>') + '</div>' +
        '<p class="muted" style="font-size:.85rem">' + S.esc(f.ne) + ' · Kanal: ' + S.esc(f.kanal) + '</p></div>';
    }).join("") || '<p class="mute2">Henüz follow-up yok.</p>';

    root().innerHTML =
      '<div class="view"><div class="cost-grid">' +
      '<div class="card"><h3>🔁 Otomatik Takip Akışı</h3><p class="muted" style="font-size:.88rem; margin:6px 0 14px">Teklif sonrası belirlenen aralıklarla otomatik follow-up gönderilir.</p>' +
        '<div class="timeline" id="fup-tl">' + items + '</div></div>' +
      '<div class="card"><h3>Yeni Follow-up Kuralı</h3>' +
        '<label class="field"><span>Müşteri</span><input id="fup-cust" placeholder="Müşteri adı" value="Yeni Müşteri" /></label>' +
        '<div class="form-cols"><label class="field"><span>Ne zaman</span><select id="fup-when"><option>6 saat sonra</option><option>1 gün sonra</option><option>3 gün sonra</option><option>1 hafta sonra</option></select></label>' +
        '<label class="field"><span>Kanal</span><select id="fup-kanal"><option>E-posta</option><option>WhatsApp</option></select></label></div>' +
        '<button class="btn btn--block btn--orange" id="fup-add">➕ Follow-up Planla</button>' +
        '<div class="brief" style="margin-top:14px"><h5>Şablon Önizleme</h5><p class="muted" style="font-size:.86rem">"Merhaba, gönderdiğimiz teklifle ilgili bir sorunuz var mı? Yardımcı olmaktan memnuniyet duyarız."</p></div></div>' +
      '</div></div>';

    el("fup-add").addEventListener("click", function () {
      var arr = S.getFollowups();
      arr.push({ id: S.uid("f"), musteri: el("fup-cust").value || "Müşteri", asama: "Follow-up " + (arr.length + 1), ne: el("fup-when").value, kanal: el("fup-kanal").value, durum: "bekliyor" });
      S.saveFollowups(arr);
      S.toast("Follow-up planlandı", el("fup-when").value + " · " + el("fup-kanal").value, "orange");
      viewFollowup();
    });
  }

  /* =========================================================
     ADIM 13 — GELİŞMİŞ PANEL & SÜREÇ TAKİP
     ========================================================= */
  function viewSurec() {
    var leads = S.getLeads(), jobs = S.getJobs();
    var aktif = jobs.filter(function (j) { return j.durum !== "rapor-hazir"; }).length;
    var tamam = jobs.filter(function (j) { return j.durum === "rapor-hazir"; }).length;
    var rfqCount = jobs.filter(function (j) { return j.rfqGonderildi; }).length;

    // pipeline aşamaları
    var stages = [
      { k: "Lead", v: leads.length },
      { k: "Randevu", v: leads.filter(function (l) { return l.randevu; }).length },
      { k: "İş Başladı", v: jobs.length },
      { k: "RFQ", v: rfqCount },
      { k: "Rapor", v: tamam }
    ];
    var max = Math.max.apply(null, stages.map(function (s) { return s.v; }).concat([1]));
    var bars = stages.map(function (s) {
      var h = Math.round((s.v / max) * 150) + 6;
      return '<div class="bar" style="height:' + h + 'px"><span>' + s.v + '</span><small>' + s.k + '</small></div>';
    }).join("");

    root().innerHTML =
      '<div class="view">' +
      '<div class="stat-grid">' +
        statCard("🔄", "Aktif Süreç", aktif, "Devam eden işler", "orange") +
        statCard("✅", "Tamamlanan", tamam, "Rapor teslim edildi", "green") +
        statCard("✉️", "RFQ Gönderilen", rfqCount, "Teklif beklenen", "blue") +
        statCard("📊", "Dönüşüm", (leads.length ? Math.round((tamam / leads.length) * 100) : 0) + "%", "Lead → Rapor", "green") +
      '</div>' +
      '<div class="cost-grid">' +
        '<div class="card"><h3>📈 Satış Hunisi (Pipeline)</h3><p class="muted" style="font-size:.85rem; margin:6px 0 10px">Lead\'den rapora dönüşüm.</p><div class="bars" style="margin-top:24px">' + bars + '</div></div>' +
        '<div class="card"><h3>🚦 İş Durumları</h3><div style="margin-top:12px">' + jobStatusList(jobs) + '</div></div>' +
      '</div></div>';
  }

  function jobStatusList(jobs) {
    if (!jobs.length) return '<p class="mute2">Henüz iş yok.</p>';
    return jobs.map(function (j) {
      var lead = S.getLead(j.leadId);
      var pct = j.durum === "rapor-hazir" ? 100 : j.maliyet ? 80 : j.rfqGonderildi ? 60 : 30;
      return '<div style="margin-bottom:14px"><div class="flex-between"><strong>' + S.esc(lead ? lead.ad : "—") + '</strong>' + badge(j.durum === "rapor-hazir" ? "rapor-hazir" : "is-basladi") + '</div>' +
        '<div style="height:8px; background:var(--bg-2); border-radius:6px; overflow:hidden; margin-top:6px"><div style="height:100%; width:' + pct + '%; background:linear-gradient(90deg,var(--green),var(--green-d))"></div></div>' +
        '<span class="mute2" style="font-size:.78rem">' + S.esc(j.urun) + ' · %' + pct + ' tamamlandı</span></div>';
    }).join("");
  }

  /* =========================================================
     ADIM 14 — WHATSAPP ENTEGRASYONU
     ========================================================= */
  function viewWhatsapp() {
    root().innerHTML =
      '<div class="view"><div class="cost-grid">' +
      '<div class="card"><h3>💬 WhatsApp ile Müşteri İletişimi</h3><p class="muted" style="font-size:.88rem; margin:6px 0 14px">Müşterilere otomatik bildirim ve mesaj gönderin (demo).</p>' +
        '<div class="brief"><h5>Hazır Şablonlar</h5><div class="pill-list" style="margin-top:8px">' +
          '<button class="btn btn--sm btn--ghost wa-tpl">📑 Rapor hazır</button>' +
          '<button class="btn btn--sm btn--ghost wa-tpl">📅 Randevu hatırlatma</button>' +
          '<button class="btn btn--sm btn--ghost wa-tpl">💰 Teklif takibi</button>' +
        '</div></div>' +
        '<div class="brief" style="margin-top:14px"><h5>Otomasyon</h5><p class="muted" style="font-size:.86rem">Randevu onayı, rapor teslimi ve follow-up adımlarında WhatsApp mesajları otomatik tetiklenir.</p></div></div>' +
      '<div><div class="wa">' +
        '<div class="wa-head"><div class="av">👤</div><div><strong style="color:#fff">Müşteri</strong><br><span style="font-size:.72rem; color:rgba(255,255,255,.6)">çevrimiçi</span></div></div>' +
        '<div class="wa-body" id="wa-body"></div>' +
        '<div class="wa-foot"><input id="wa-input" placeholder="Mesaj yazın…" /><button class="btn btn--sm" id="wa-send">➤</button></div>' +
      '</div></div></div></div>';

    paintWA();
    el("wa-send").addEventListener("click", sendWA);
    el("wa-input").addEventListener("keydown", function (e) { if (e.key === "Enter") sendWA(); });
    root().querySelectorAll(".wa-tpl").forEach(function (b) {
      b.addEventListener("click", function () { el("wa-input").value = b.textContent.replace(/^[^\s]+\s/, "") + " ile ilgili bilgilendirme."; el("wa-input").focus(); });
    });
  }

  function paintWA() {
    var msgs = S.getMessages();
    el("wa-body").innerHTML = msgs.map(function (m) {
      return '<div class="bubble ' + (m.yon === "out" ? "out" : "in") + '">' + S.esc(m.text) + '<span class="t">' + S.esc(m.t) + (m.yon === "out" ? " ✓✓" : "") + '</span></div>';
    }).join("");
    var b = el("wa-body"); b.scrollTop = b.scrollHeight;
  }

  function sendWA() {
    var inp = el("wa-input"); var txt = (inp.value || "").trim();
    if (!txt) return;
    var msgs = S.getMessages();
    msgs.push({ id: S.uid("wa"), yon: "out", text: txt, t: nowHM() });
    S.saveMessages(msgs); inp.value = ""; paintWA();
    // otomatik demo yanıt
    S.fakeAsync(1300).then(function () {
      var m2 = S.getMessages();
      m2.push({ id: S.uid("wa"), yon: "in", text: "Teşekkürler, bilgi için 🙏", t: nowHM() });
      S.saveMessages(m2); paintWA();
    });
    S.toast("WhatsApp gönderildi", "Mesaj iletildi (demo).");
  }

  /* ---------- ortak ---------- */
  function emptyState(title, msg, gotoView) {
    root().innerHTML = '<div class="view"><div class="card empty"><div class="ico">📭</div><h3>' + S.esc(title) + '</h3><p class="mute2" style="margin:8px 0 16px">' + S.esc(msg) + '</p>' +
      (gotoView ? '<button class="btn" id="empty-go">İlgili adıma git →</button>' : '') + '</div></div>';
    if (gotoView && el("empty-go")) el("empty-go").addEventListener("click", function () { go(gotoView); });
  }

  function nowHM() { var d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }

  var VIEWS = {
    dashboard: viewDashboard, leads: viewLeads, customer: viewCustomer, rfq: viewRFQ,
    cost: viewCost, report: viewReport, "ai-analiz": viewAIAnaliz, "ai-tedarik": viewAITedarik,
    "mail-oku": viewMailOku, followup: viewFollowup, surec: viewSurec, whatsapp: viewWhatsapp
  };

  /* ---------- init ---------- */
  function isMobile() { return window.matchMedia("(max-width: 920px)").matches; }

  document.addEventListener("DOMContentLoaded", function () {
    var sidebar = el("sidebar"), menuBtn = el("menu-toggle");
    if (isMobile()) sidebar.classList.add("is-collapsed");
    if (menuBtn) menuBtn.addEventListener("click", function () { sidebar.classList.toggle("is-collapsed"); });

    document.querySelectorAll(".side-link[data-view]").forEach(function (l) {
      l.addEventListener("click", function () {
        go(l.getAttribute("data-view"));
        if (isMobile()) sidebar.classList.add("is-collapsed");
      });
    });
    el("reset-data").addEventListener("click", function () {
      if (confirm("Tüm demo verisi sıfırlansın mı? Bu işlem geri alınamaz.")) {
        S.resetAll(); S.seedIfEmpty(); state.selectedLead = null; state.selectedJob = null;
        S.toast("Sıfırlandı", "Demo verisi yeniden yüklendi.");
        go("dashboard");
      }
    });
    go("dashboard");
  });
})();

/* ============================================================
   store.js — localStorage veri katmanı + ortak yardımcılar
   Tüm sayfalar bu dosyayı paylaşır. Backend yok; veriler
   tarayıcıda saklanır, adımlar arasında gerçekten akar.
   ============================================================ */
(function (global) {
  "use strict";

  var KEYS = {
    leads: "oto_leads",
    jobs: "oto_jobs",
    followups: "oto_followups",
    messages: "oto_messages",
    seeded: "oto_seeded_v1"
  };

  /* ---- düşük seviye ---- */
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function uid(prefix) { return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---- Leads ---- */
  function getLeads() { return read(KEYS.leads); }
  function getLead(id) { return getLeads().filter(function (l) { return l.id === id; })[0] || null; }
  function saveLead(lead) {
    var all = getLeads();
    if (!lead.id) { lead.id = uid("lead"); lead.createdAt = Date.now(); all.unshift(lead); }
    else {
      var i = all.map(function (l) { return l.id; }).indexOf(lead.id);
      if (i >= 0) all[i] = lead; else all.unshift(lead);
    }
    write(KEYS.leads, all);
    return lead;
  }
  function updateLead(id, patch) {
    var l = getLead(id); if (!l) return null;
    Object.keys(patch).forEach(function (k) { l[k] = patch[k]; });
    return saveLead(l);
  }

  /* ---- Jobs (işler / projeler) ---- */
  function getJobs() { return read(KEYS.jobs); }
  function getJob(id) { return getJobs().filter(function (j) { return j.id === id; })[0] || null; }
  function getJobByLead(leadId) { return getJobs().filter(function (j) { return j.leadId === leadId; })[0] || null; }
  function saveJob(job) {
    var all = getJobs();
    if (!job.id) { job.id = uid("job"); job.createdAt = Date.now(); all.unshift(job); }
    else {
      var i = all.map(function (j) { return j.id; }).indexOf(job.id);
      if (i >= 0) all[i] = job; else all.unshift(job);
    }
    write(KEYS.jobs, all);
    return job;
  }

  /* ---- Followups & messages (Faz 2 demo) ---- */
  function getFollowups() { return read(KEYS.followups); }
  function saveFollowups(arr) { write(KEYS.followups, arr); }
  function getMessages() { return read(KEYS.messages); }
  function saveMessages(arr) { write(KEYS.messages, arr); }

  function resetAll() {
    Object.keys(KEYS).forEach(function (k) { localStorage.removeItem(KEYS[k]); });
  }

  /* ---- Sabit veriler (üreticiler) ---- */
  var MANUFACTURERS = [
    { id: "m1", name: "Shenzhen Top Plastics Co.", city: "Shenzhen", rating: 4.8, fob: 0.79, moq: 3000, certs: "ISO, CE" },
    { id: "m2", name: "Ningbo Better Plastic", city: "Ningbo", rating: 4.5, fob: 0.84, moq: 5000, certs: "ISO" },
    { id: "m3", name: "Qingdao Home Pack Co.", city: "Qingdao", rating: 4.3, fob: 0.88, moq: 2000, certs: "CE, FDA" },
    { id: "m4", name: "Guangzhou EcoStore Ltd.", city: "Guangzhou", rating: 4.1, fob: 0.91, moq: 4000, certs: "ISO, FDA" },
    { id: "m5", name: "Yiwu Smart Goods", city: "Yiwu", rating: 3.9, fob: 0.74, moq: 8000, certs: "CE" }
  ];

  /* ---- Seed (fotoğraftaki örnek verilerle) ---- */
  function seedIfEmpty() {
    if (localStorage.getItem(KEYS.seeded)) return;
    var now = Date.now();
    var demoLeads = [
      { id: "lead_demo1", ad: "Adnan Yılmaz", telefon: "+90 532 123 45 67", email: "adnan@firma.com", urun: "Plastik Saklama Kutusu", sektor: "Ev & Yaşam", butce: "20K+", ithalatGecmisi: "Evet", aciliyet: "Yüksek", durum: "is-basladi", kaliteSkoru: 92, randevu: { tarih: "2025-05-14", saat: "14:00", platform: "Google Meet" }, createdAt: now - 86400000 * 6 },
      { id: "lead_demo2", ad: "Mehmet Kaya", telefon: "+90 533 222 11 88", email: "mehmet@ticaret.com", urun: "LED Aydınlatma", sektor: "Elektronik", butce: "50K+", ithalatGecmisi: "Evet", aciliyet: "Orta", durum: "randevu", kaliteSkoru: 88, randevu: { tarih: "2025-05-16", saat: "11:00", platform: "Zoom" }, createdAt: now - 86400000 * 4 },
      { id: "lead_demo3", ad: "Zeynep Demir", telefon: "+90 534 777 65 43", email: "zeynep@magaza.com", urun: "Kozmetik Ambalaj", sektor: "Kozmetik", butce: "20K+", ithalatGecmisi: "Hayır", aciliyet: "Yüksek", durum: "kaliteli", kaliteSkoru: 74, randevu: null, createdAt: now - 86400000 * 2 },
      { id: "lead_demo4", ad: "Burak Şahin", telefon: "+90 535 444 33 22", email: "burak@gmail.com", urun: "Oyuncak", sektor: "Oyuncak", butce: "5K-20K", ithalatGecmisi: "Hayır", aciliyet: "Düşük", durum: "uygun-degil", kaliteSkoru: 38, randevu: null, createdAt: now - 86400000 * 1 }
    ];
    write(KEYS.leads, demoLeads);

    var demoJob = {
      id: "job_demo1", leadId: "lead_demo1", urun: "Plastik Saklama Kutusu", adet: 5000,
      ureticiler: ["m1", "m2", "m3"], rfqGonderildi: true,
      teklifler: [
        { uretici: "Shenzhen Top Plastics Co.", fob: 0.79, moq: 3000, leadTime: "25 gün", sertifika: "ISO, CE" },
        { uretici: "Ningbo Better Plastic", fob: 0.84, moq: 5000, leadTime: "30 gün", sertifika: "ISO" },
        { uretici: "Qingdao Home Pack Co.", fob: 0.88, moq: 2000, leadTime: "22 gün", sertifika: "CE, FDA" }
      ],
      maliyet: { fob: 3950, navlun: 480, sigorta: 65, kdv: 0, gumruk: 0, diger: 120, toplam: 4615 },
      rapor: { enUygun: "Shenzhen Top Plastics Co." },
      durum: "rapor-hazir", createdAt: now - 86400000 * 5
    };
    write(KEYS.jobs, [demoJob]);

    write(KEYS.followups, [
      { id: "f1", musteri: "Mehmet Kaya", asama: "Follow-up 1", ne: "6 saat sonra", durum: "gonderildi", kanal: "E-posta" },
      { id: "f2", musteri: "Mehmet Kaya", asama: "Follow-up 2", ne: "3 gün sonra", durum: "bekliyor", kanal: "WhatsApp" }
    ]);
    write(KEYS.messages, [
      { id: "wa1", yon: "out", text: "Merhaba Adnan Bey, tedarikçi karşılaştırma raporunuz hazır. En uygun seçenek Shenzhen Top Plastics. 👍", t: "14:32" }
    ]);

    localStorage.setItem(KEYS.seeded, "1");
  }

  /* ============================================================
     Ortak UI yardımcıları
     ============================================================ */
  function toast(title, msg, type) {
    var wrap = document.getElementById("toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.id = "toast-wrap"; document.body.appendChild(wrap); }
    var el = document.createElement("div");
    el.className = "toast" + (type === "orange" ? " is-orange" : type === "red" ? " is-red" : "");
    el.innerHTML = "<strong>" + esc(title) + "</strong>" + (msg ? "<span>" + esc(msg) + "</span>" : "");
    wrap.appendChild(el);
    setTimeout(function () { el.style.transition = "opacity .3s, transform .3s"; el.style.opacity = "0"; el.style.transform = "translateX(30px)"; setTimeout(function () { el.remove(); }, 300); }, 3600);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function fmtMoney(n, cur) {
    cur = cur || "USD";
    var v = Number(n) || 0;
    return v.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " " + cur;
  }

  function stars(rating) {
    var full = Math.round(rating);
    return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
  }

  function timeAgo(ts) {
    var d = Math.floor((Date.now() - ts) / 86400000);
    if (d <= 0) return "Bugün";
    if (d === 1) return "Dün";
    return d + " gün önce";
  }

  /* fake async — gönderim/AI hissi için */
  function fakeAsync(ms) {
    return new Promise(function (res) { setTimeout(res, ms || 900); });
  }

  global.Store = {
    KEYS: KEYS, MANUFACTURERS: MANUFACTURERS,
    getLeads: getLeads, getLead: getLead, saveLead: saveLead, updateLead: updateLead,
    getJobs: getJobs, getJob: getJob, getJobByLead: getJobByLead, saveJob: saveJob,
    getFollowups: getFollowups, saveFollowups: saveFollowups,
    getMessages: getMessages, saveMessages: saveMessages,
    seedIfEmpty: seedIfEmpty, resetAll: resetAll, uid: uid,
    toast: toast, esc: esc, fmtMoney: fmtMoney, stars: stars, timeAgo: timeAgo, fakeAsync: fakeAsync
  };
})(window);

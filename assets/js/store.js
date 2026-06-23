/* ============================================================
   store.js — Veri katmanı (Supabase VEYA localStorage) + yardımcılar
   ------------------------------------------------------------
   • config.js içindeki window.SUPA gerçek bilgilerle doldurulursa
     → Supabase (bulut veritabanı) kullanılır, veriler tüm cihazlarda paylaşılır.
   • Doldurulmazsa → tarayıcı localStorage'ı (demo) kullanılır.
   Mimari: tüm veriler açılışta bir kez bellek-içi "cache"e yüklenir
   (Store.load). Getter'lar cache'ten SENKRON okur; mutasyonlar cache'i
   günceller ve arka planda backend'e yazar (write-through).
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- Mod tespiti (Supabase mı, local mi?) ---------- */
  var cfg = global.SUPA || {};
  var hasPlaceholder = !cfg.url || !cfg.key ||
    /PROJE_REF|ANON_KEY|YOUR_/.test(cfg.url + " " + cfg.key) ||
    !/^https?:\/\//.test(cfg.url);
  var sb = null;
  if (!hasPlaceholder && global.supabase && global.supabase.createClient) {
    try { sb = global.supabase.createClient(cfg.url, cfg.key); }
    catch (e) { sb = null; }
  }
  var MODE = sb ? "supabase" : "local";

  var TABLES = ["leads", "jobs", "followups", "messages"];
  var LS = { leads: "oto_leads", jobs: "oto_jobs", followups: "oto_followups", messages: "oto_messages" };

  /* ---------- bellek-içi cache ---------- */
  var cache = { leads: [], jobs: [], followups: [], messages: [] };

  /* ---------- düşük seviye ---------- */
  function lsRead(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function lsWrite(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function uid(prefix) { return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function idx(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return i; return -1; }
  function toRow(o) { return { id: o.id, data: o }; }

  /* ---------- backend yazma (write-through) ---------- */
  function persist(table, obj) {
    if (sb) {
      sb.from(table).upsert(toRow(obj)).then(function (r) {
        if (r.error) toast("Kayıt hatası", r.error.message, "red");
      });
    } else {
      lsWrite(LS[table], cache[table]);
    }
  }
  function persistArray(table) {
    if (sb) {
      sb.from(table).upsert(cache[table].map(toRow)).then(function (r) {
        if (r.error) toast("Kayıt hatası", r.error.message, "red");
      });
    } else {
      lsWrite(LS[table], cache[table]);
    }
  }

  /* ---------- açılışta tüm veriyi cache'e yükle ---------- */
  function load() {
    if (sb) {
      return Promise.all(TABLES.map(function (t) {
        return sb.from(t).select("data,created_at").order("created_at", { ascending: false })
          .then(function (r) {
            if (r.error) { console.warn("Supabase yükleme hatası (" + t + "):", r.error.message); cache[t] = []; }
            else cache[t] = (r.data || []).map(function (x) { return x.data; });
          });
      }));
    }
    TABLES.forEach(function (t) { cache[t] = lsRead(LS[t]); });
    return Promise.resolve();
  }

  /* ---------- Leads ---------- */
  function getLeads() { return cache.leads; }
  function getLead(id) { var i = idx(cache.leads, id); return i >= 0 ? cache.leads[i] : null; }
  function saveLead(lead) {
    if (!lead.id) { lead.id = uid("lead"); lead.createdAt = Date.now(); cache.leads.unshift(lead); }
    else { var i = idx(cache.leads, lead.id); if (i >= 0) cache.leads[i] = lead; else cache.leads.unshift(lead); }
    persist("leads", lead);
    return lead;
  }
  function updateLead(id, patch) {
    var l = getLead(id); if (!l) return null;
    Object.keys(patch).forEach(function (k) { l[k] = patch[k]; });
    persist("leads", l);
    return l;
  }

  /* ---------- Jobs ---------- */
  function getJobs() { return cache.jobs; }
  function getJob(id) { var i = idx(cache.jobs, id); return i >= 0 ? cache.jobs[i] : null; }
  function getJobByLead(leadId) { return cache.jobs.filter(function (j) { return j.leadId === leadId; })[0] || null; }
  function saveJob(job) {
    if (!job.id) { job.id = uid("job"); job.createdAt = Date.now(); cache.jobs.unshift(job); }
    else { var i = idx(cache.jobs, job.id); if (i >= 0) cache.jobs[i] = job; else cache.jobs.unshift(job); }
    persist("jobs", job);
    return job;
  }

  /* ---------- Followups & messages ---------- */
  function getFollowups() { return cache.followups; }
  function saveFollowups(arr) { cache.followups = arr; persistArray("followups"); }
  function getMessages() { return cache.messages; }
  function saveMessages(arr) { cache.messages = arr; persistArray("messages"); }

  /* ---------- Reset / Seed ---------- */
  function resetAll() {
    cache = { leads: [], jobs: [], followups: [], messages: [] };
    if (sb) {
      return Promise.all(TABLES.map(function (t) {
        return sb.from(t).delete().neq("id", "__none__").then(function () {});
      }));
    }
    Object.keys(LS).forEach(function (k) { localStorage.removeItem(LS[k]); });
    localStorage.removeItem("oto_seeded_v1");
    return Promise.resolve();
  }

  function seedIfEmpty() {
    // Gerçek (Supabase) modda demo verisi EKLENMEZ — yalnızca gerçek veriler.
    if (sb) return Promise.resolve();
    if (cache.leads.length) return Promise.resolve();
    var now = Date.now();
    var demoLeads = [
      { id: "lead_demo1", ad: "Adnan Yılmaz", telefon: "+90 532 123 45 67", email: "adnan@firma.com", urun: "Plastik Saklama Kutusu", sektor: "Ev & Yaşam", butce: "20K+", ithalatGecmisi: "Evet", aciliyet: "Yüksek", durum: "is-basladi", kaliteSkoru: 92, randevu: { tarih: "2025-05-14", saat: "14:00", platform: "Google Meet" }, createdAt: now - 86400000 * 6 },
      { id: "lead_demo2", ad: "Mehmet Kaya", telefon: "+90 533 222 11 88", email: "mehmet@ticaret.com", urun: "LED Aydınlatma", sektor: "Elektronik", butce: "50K+", ithalatGecmisi: "Evet", aciliyet: "Orta", durum: "randevu", kaliteSkoru: 88, randevu: { tarih: "2025-05-16", saat: "11:00", platform: "Zoom" }, createdAt: now - 86400000 * 4 },
      { id: "lead_demo3", ad: "Zeynep Demir", telefon: "+90 534 777 65 43", email: "zeynep@magaza.com", urun: "Kozmetik Ambalaj", sektor: "Kozmetik", butce: "20K+", ithalatGecmisi: "Hayır", aciliyet: "Yüksek", durum: "kaliteli", kaliteSkoru: 74, randevu: null, createdAt: now - 86400000 * 2 },
      { id: "lead_demo4", ad: "Burak Şahin", telefon: "+90 535 444 33 22", email: "burak@gmail.com", urun: "Oyuncak", sektor: "Oyuncak", butce: "5K-20K", ithalatGecmisi: "Hayır", aciliyet: "Düşük", durum: "uygun-degil", kaliteSkoru: 38, randevu: null, createdAt: now - 86400000 * 1 }
    ];
    var demoJobs = [{
      id: "job_demo1", leadId: "lead_demo1", urun: "Plastik Saklama Kutusu", adet: 5000,
      ureticiler: ["m1", "m2", "m3"], rfqGonderildi: true,
      teklifler: [
        { uretici: "Shenzhen Top Plastics Co.", fob: 0.79, moq: 3000, leadTime: "25 gün", sertifika: "ISO, CE" },
        { uretici: "Ningbo Better Plastic", fob: 0.84, moq: 5000, leadTime: "30 gün", sertifika: "ISO" },
        { uretici: "Qingdao Home Pack Co.", fob: 0.88, moq: 2000, leadTime: "22 gün", sertifika: "CE, FDA" }
      ],
      maliyet: { fob: 3950, navlun: 480, sigorta: 65, kdv: 0, gumruk: 0, diger: 120, toplam: 4615 },
      rapor: { enUygun: "Shenzhen Top Plastics Co." }, durum: "rapor-hazir", createdAt: now - 86400000 * 5
    }];
    var demoF = [
      { id: "f1", musteri: "Mehmet Kaya", asama: "Follow-up 1", ne: "6 saat sonra", durum: "gonderildi", kanal: "E-posta" },
      { id: "f2", musteri: "Mehmet Kaya", asama: "Follow-up 2", ne: "3 gün sonra", durum: "bekliyor", kanal: "WhatsApp" }
    ];
    var demoM = [
      { id: "wa1", yon: "out", text: "Merhaba Adnan Bey, tedarikçi karşılaştırma raporunuz hazır. En uygun seçenek Shenzhen Top Plastics. 👍", t: "14:32" }
    ];
    cache.leads = demoLeads; cache.jobs = demoJobs; cache.followups = demoF; cache.messages = demoM;
    if (sb) {
      return Promise.all([
        sb.from("leads").upsert(demoLeads.map(toRow)),
        sb.from("jobs").upsert(demoJobs.map(toRow)),
        sb.from("followups").upsert(demoF.map(toRow)),
        sb.from("messages").upsert(demoM.map(toRow))
      ]);
    }
    lsWrite(LS.leads, demoLeads); lsWrite(LS.jobs, demoJobs);
    lsWrite(LS.followups, demoF); lsWrite(LS.messages, demoM);
    localStorage.setItem("oto_seeded_v1", "1");
    return Promise.resolve();
  }

  /* ---------- Sabit veriler (üreticiler) ---------- */
  var MANUFACTURERS = [
    { id: "m1", name: "Shenzhen Top Plastics Co.", city: "Shenzhen", rating: 4.8, fob: 0.79, moq: 3000, certs: "ISO, CE" },
    { id: "m2", name: "Ningbo Better Plastic", city: "Ningbo", rating: 4.5, fob: 0.84, moq: 5000, certs: "ISO" },
    { id: "m3", name: "Qingdao Home Pack Co.", city: "Qingdao", rating: 4.3, fob: 0.88, moq: 2000, certs: "CE, FDA" },
    { id: "m4", name: "Guangzhou EcoStore Ltd.", city: "Guangzhou", rating: 4.1, fob: 0.91, moq: 4000, certs: "ISO, FDA" },
    { id: "m5", name: "Yiwu Smart Goods", city: "Yiwu", rating: 3.9, fob: 0.74, moq: 8000, certs: "CE" }
  ];

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

  function stars(rating) { var full = Math.round(rating); return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full); }

  function timeAgo(ts) {
    var d = Math.floor((Date.now() - ts) / 86400000);
    if (d <= 0) return "Bugün"; if (d === 1) return "Dün"; return d + " gün önce";
  }

  function fakeAsync(ms) { return new Promise(function (res) { setTimeout(res, ms || 900); }); }

  /* ============================================================
     Auth (Supabase). Local modda kullanıcı yoktur (yapılandırılmamış).
     ============================================================ */
  function currentUser() {
    if (!sb) return Promise.resolve(null);
    return sb.auth.getUser().then(function (r) { return (r && r.data) ? r.data.user : null; })
      .catch(function () { return null; });
  }
  function signUp(email, pw) {
    if (!sb) return Promise.reject(new Error("Supabase yapılandırılmamış (config.js)."));
    return sb.auth.signUp({ email: email, password: pw }).then(function (r) { if (r.error) throw r.error; return r.data; });
  }
  function signIn(email, pw) {
    if (!sb) return Promise.reject(new Error("Supabase yapılandırılmamış (config.js)."));
    return sb.auth.signInWithPassword({ email: email, password: pw }).then(function (r) { if (r.error) throw r.error; return r.data; });
  }
  function signOut() {
    if (!sb) return Promise.resolve();
    return sb.auth.signOut();
  }

  global.Store = {
    MODE: MODE, MANUFACTURERS: MANUFACTURERS,
    authConfigured: !!sb,
    currentUser: currentUser, signUp: signUp, signIn: signIn, signOut: signOut,
    load: load,
    getLeads: getLeads, getLead: getLead, saveLead: saveLead, updateLead: updateLead,
    getJobs: getJobs, getJob: getJob, getJobByLead: getJobByLead, saveJob: saveJob,
    getFollowups: getFollowups, saveFollowups: saveFollowups,
    getMessages: getMessages, saveMessages: saveMessages,
    seedIfEmpty: seedIfEmpty, resetAll: resetAll, uid: uid,
    toast: toast, esc: esc, fmtMoney: fmtMoney, stars: stars, timeAgo: timeAgo, fakeAsync: fakeAsync
  };
})(window);

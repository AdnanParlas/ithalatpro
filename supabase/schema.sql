-- ============================================================
-- İthalatPro — Supabase şeması
-- Supabase Panel → SQL Editor → New query → bu dosyanın tamamını
-- yapıştır → "Run". Tablolar + güvenlik kuralları oluşur.
-- ============================================================

-- Her tablo: id (uygulama üretir, metin) + data (jsonb) + created_at.
-- Bu yapı uygulamadaki nesnelerle birebir uyumludur (kolon eşlemesi yok).

create table if not exists public.leads (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.jobs (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.followups (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.leads     enable row level security;
alter table public.jobs      enable row level security;
alter table public.followups enable row level security;
alter table public.messages  enable row level security;

-- ⚠️ DEMO MODU — login YOK.
-- Bu kurallar anonim (anon) ziyaretçiye tüm işlemleri açar.
-- Yani anon anahtarı bilen herkes verileri okuyabilir/yazabilir.
-- Demo/test için uygundur. CANLI/gerçek müşteri verisi için aşağıdaki
-- "ÜRETİM" bölümüne geç.

create policy "demo_all_leads"     on public.leads     for all to anon using (true) with check (true);
create policy "demo_all_jobs"      on public.jobs      for all to anon using (true) with check (true);
create policy "demo_all_followups" on public.followups for all to anon using (true) with check (true);
create policy "demo_all_messages"  on public.messages  for all to anon using (true) with check (true);

-- anon rolüne tablo yetkileri (Supabase çoğu projede otomatik verir;
-- garanti olsun diye açıkça veriyoruz):
grant usage on schema public to anon;
grant select, insert, update, delete on public.leads, public.jobs, public.followups, public.messages to anon;

-- ============================================================
-- ÜRETİM (PRODUCTION) — admin login ekleyince burayı kullan
-- ------------------------------------------------------------
-- Aşağıdaki blok yorum (--) halinde. Gerçek müşteri verisiyle
-- yayına geçerken: yukarıdaki "demo_all_*" politikalarını DROP et,
-- aşağıdakileri aç. O zaman:
--   • Başvuru formu (leads INSERT) herkese açık kalır,
--   • Okuma/güncelleme yalnızca giriş yapmış (authenticated) admin'e.
-- ============================================================
-- drop policy "demo_all_leads"     on public.leads;
-- drop policy "demo_all_jobs"      on public.jobs;
-- drop policy "demo_all_followups" on public.followups;
-- drop policy "demo_all_messages"  on public.messages;
--
-- -- Herkes başvuru gönderebilir (yalnızca INSERT):
-- create policy "public_insert_leads" on public.leads for insert to anon with check (true);
-- -- Geri kalan her şey yalnızca giriş yapmış admin'e:
-- create policy "auth_all_leads"     on public.leads     for all to authenticated using (true) with check (true);
-- create policy "auth_all_jobs"      on public.jobs      for all to authenticated using (true) with check (true);
-- create policy "auth_all_followups" on public.followups for all to authenticated using (true) with check (true);
-- create policy "auth_all_messages"  on public.messages  for all to authenticated using (true) with check (true);
-- revoke select, update, delete on public.leads from anon;
-- revoke all on public.jobs, public.followups, public.messages from anon;

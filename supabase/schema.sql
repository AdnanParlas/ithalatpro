-- ============================================================
-- İthalatPro — Supabase şeması (GERÇEK / ÜRETİM)
-- Model: "Ekip ortak panel" → giriş yapan herkes tüm veriyi görür.
--        Başvuru formu herkese açık (anonim lead ekleyebilir).
--
-- Kurulum: Supabase Panel → SQL Editor → New query → bu dosyanın
-- TAMAMINI yapıştır → Run.
-- ============================================================

-- ---- Tablolar (id uygulama üretir; data = jsonb nesne) ----
create table if not exists public.leads (
  id text primary key, data jsonb not null, created_at timestamptz not null default now()
);
create table if not exists public.jobs (
  id text primary key, data jsonb not null, created_at timestamptz not null default now()
);
create table if not exists public.followups (
  id text primary key, data jsonb not null, created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id text primary key, data jsonb not null, created_at timestamptz not null default now()
);

-- ---- RLS aç ----
alter table public.leads     enable row level security;
alter table public.jobs      enable row level security;
alter table public.followups enable row level security;
alter table public.messages  enable row level security;

-- Tekrar çalıştırılabilir olsun diye eski politikaları temizle
drop policy if exists "leads_insert_anon" on public.leads;
drop policy if exists "leads_all_auth"    on public.leads;
drop policy if exists "jobs_all_auth"      on public.jobs;
drop policy if exists "followups_all_auth" on public.followups;
drop policy if exists "messages_all_auth"  on public.messages;
-- (varsa eski demo politikaları)
drop policy if exists "demo_all_leads"     on public.leads;
drop policy if exists "demo_all_jobs"      on public.jobs;
drop policy if exists "demo_all_followups" on public.followups;
drop policy if exists "demo_all_messages"  on public.messages;

-- ============================================================
-- GÜVENLİK POLİTİKALARI
-- ============================================================
-- 1) Başvuru formu: anonim ziyaretçi yalnızca LEAD EKLEYEBİLİR (insert),
--    okuyamaz/güncelleyemez.
create policy "leads_insert_anon" on public.leads
  for insert to anon with check (true);

-- 2) Panel: giriş yapmış (authenticated) kullanıcı her şeyi yapabilir.
--    "Ekip ortak panel" → herkes tüm satırları görür.
create policy "leads_all_auth"     on public.leads     for all to authenticated using (true) with check (true);
create policy "jobs_all_auth"      on public.jobs      for all to authenticated using (true) with check (true);
create policy "followups_all_auth" on public.followups for all to authenticated using (true) with check (true);
create policy "messages_all_auth"  on public.messages  for all to authenticated using (true) with check (true);

-- ---- Rol yetkileri ----
grant usage on schema public to anon, authenticated;
grant insert on public.leads to anon;
grant select, insert, update, delete on
  public.leads, public.jobs, public.followups, public.messages to authenticated;

-- ============================================================
-- NOT (güvenlik): Şu an "açık kayıt" + "ekip ortak panel" seçili.
-- Yani KAYIT OLAN HERKES tüm verileri görür. Daha sıkı istersen:
--   • Supabase → Authentication → Providers → Email → "Allow new users
--     to sign up" KAPAT (sadece sen Dashboard'dan kullanıcı eklersin).
--   • Ya da kişi-bazlı veri için satıra owner uuid eklenip politikalar
--     auth.uid() ile kısıtlanır (iste, ekleyeyim).
-- ============================================================

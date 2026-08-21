-- Plain Invoice — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a NEW project.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  public_id text not null unique,
  number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid')),
  from_name text not null default '',
  from_email text not null default '',
  from_address text not null default '',
  to_name text not null default '',
  to_email text not null default '',
  to_address text not null default '',
  due_date date,
  notes text not null default '',
  payment_link text not null default '',
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, number)
);

create table if not exists public.line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null default '',
  quantity numeric(12, 2) not null default 1,
  unit_amount_cents integer not null default 0,
  sort_order integer not null default 0
);

create index if not exists invoices_user_id_idx on public.invoices (user_id);
create index if not exists invoices_public_id_idx on public.invoices (public_id);
create index if not exists line_items_invoice_id_idx on public.line_items (invoice_id);

alter table public.profiles enable row level security;
alter table public.invoices enable row level security;
alter table public.line_items enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id and plan = 'free');

drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own"
  on public.invoices for select
  using (auth.uid() = user_id);

drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own"
  on public.invoices for insert
  with check (auth.uid() = user_id);

drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own"
  on public.invoices for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own"
  on public.invoices for delete
  using (auth.uid() = user_id);

drop policy if exists "line_items_select_own" on public.line_items;
create policy "line_items_select_own"
  on public.line_items for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = line_items.invoice_id and i.user_id = auth.uid()
    )
  );

drop policy if exists "line_items_insert_own" on public.line_items;
create policy "line_items_insert_own"
  on public.line_items for insert
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = line_items.invoice_id and i.user_id = auth.uid()
    )
  );

drop policy if exists "line_items_update_own" on public.line_items;
create policy "line_items_update_own"
  on public.line_items for update
  using (
    exists (
      select 1 from public.invoices i
      where i.id = line_items.invoice_id and i.user_id = auth.uid()
    )
  );

drop policy if exists "line_items_delete_own" on public.line_items;
create policy "line_items_delete_own"
  on public.line_items for delete
  using (
    exists (
      select 1 from public.invoices i
      where i.id = line_items.invoice_id and i.user_id = auth.uid()
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute procedure public.set_updated_at();

create or replace function public.enforce_free_invoice_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan text;
  invoice_count integer;
begin
  select plan into current_plan from public.profiles where id = new.user_id;
  if current_plan = 'pro' then
    return new;
  end if;
  select count(*) into invoice_count from public.invoices where user_id = new.user_id;
  if invoice_count >= 3 then
    raise exception 'FREE_LIMIT_REACHED'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_free_limit on public.invoices;
create trigger invoices_free_limit
  before insert on public.invoices
  for each row execute procedure public.enforce_free_invoice_limit();

create or replace function public.get_public_invoice(p_public_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', i.id,
    'public_id', i.public_id,
    'number', i.number,
    'status', i.status,
    'from_name', i.from_name,
    'from_email', i.from_email,
    'from_address', i.from_address,
    'to_name', i.to_name,
    'to_email', i.to_email,
    'to_address', i.to_address,
    'due_date', i.due_date,
    'notes', i.notes,
    'payment_link', i.payment_link,
    'currency', i.currency,
    'created_at', i.created_at,
    'line_items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', li.id,
          'description', li.description,
          'quantity', li.quantity,
          'unit_amount_cents', li.unit_amount_cents,
          'sort_order', li.sort_order
        )
        order by li.sort_order, li.id
      )
      from public.line_items li
      where li.invoice_id = i.id
    ), '[]'::jsonb)
  )
  from public.invoices i
  where i.public_id = p_public_id
    and i.status in ('sent', 'paid');
$$;

revoke all on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon, authenticated;

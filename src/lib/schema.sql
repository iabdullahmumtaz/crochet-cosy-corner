create table if not exists users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'customer')),
  phone text not null default '',
  city text not null default '',
  created_at timestamptz not null
);

create table if not exists addresses (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  label text not null,
  line text not null,
  city text not null,
  phone text not null
);

create table if not exists categories (
  id text primary key,
  label text not null,
  blurb text not null,
  motif text not null,
  palette text not null,
  image_url text not null default '',
  sort_order integer not null default 0
);

create table if not exists products (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  price integer not null,
  compare_at integer,
  category text not null references categories (id),
  motif text not null,
  palette text not null,
  stock integer not null,
  featured boolean not null default false,
  active boolean not null default true,
  yarn text not null,
  image_url text not null default '',
  created_at timestamptz not null
);

create table if not exists orders (
  id text primary key,
  number text not null unique,
  user_id text references users (id) on delete set null,
  email text not null,
  name text not null,
  phone text not null,
  address text not null,
  city text not null,
  notes text not null default '',
  payment text not null,
  reference text not null default '',
  subtotal integer not null,
  shipping integer not null,
  discount integer not null default 0,
  coupon_code text not null default '',
  total integer not null,
  status text not null,
  courier text not null default '',
  tracking_code text not null default '',
  stock_restored boolean not null default false,
  created_at timestamptz not null
);

create table if not exists order_items (
  id text primary key,
  order_id text not null references orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  price integer not null,
  qty integer not null,
  line_total integer not null
);

create table if not exists tracking_events (
  id text primary key,
  order_id text not null references orders (id) on delete cascade,
  status text not null,
  label text not null,
  note text not null default '',
  at timestamptz not null
);

create table if not exists reviews (
  id text primary key,
  product_id text,
  user_id text,
  name text not null,
  city text not null,
  rating integer not null,
  body text not null,
  created_at timestamptz not null
);

create table if not exists messages (
  id text primary key,
  name text not null,
  email text not null,
  topic text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null
);

create table if not exists subscribers (
  id text primary key,
  email text not null unique,
  created_at timestamptz not null
);

create table if not exists coupons (
  code text primary key,
  label text not null,
  type text not null check (type in ('percent', 'fixed', 'shipping')),
  value integer not null,
  min_order integer not null default 0,
  active boolean not null default true
);

create table if not exists shop_meta (
  key text primary key,
  value text not null
);

alter table users enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table tracking_events enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;
alter table subscribers enable row level security;
alter table coupons enable row level security;
alter table shop_meta enable row level security;

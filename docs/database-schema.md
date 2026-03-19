# StudioFlow Database Schema Draft

This schema is designed around the MVP modules: auth, bookings, clients, staff, services, payments, and consent forms.

## Core notes

- PostgreSQL is the primary database.
- Firebase Auth should remain the identity provider; `users.firebase_uid` links app users to Firebase.
- Every operational record belongs to a `business_id`.
- Roles can stay seeded and stable: `ADMIN`, `STAFF`, `RECEPTIONIST`, `CUSTOMER`.

## SQL draft

```sql
create extension if not exists "pgcrypto";

create table roles (
  id uuid primary key default gen_random_uuid(),
  code varchar(40) not null unique,
  name varchar(80) not null,
  created_at timestamptz not null default now()
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  business_type varchar(80) not null,
  phone varchar(40),
  email varchar(160),
  timezone varchar(80) not null default 'America/Edmonton',
  address_line_1 varchar(160),
  address_line_2 varchar(160),
  city varchar(80),
  region varchar(80),
  postal_code varchar(20),
  country varchar(80),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  role_id uuid not null references roles(id),
  firebase_uid varchar(160) not null unique,
  full_name varchar(160) not null,
  email varchar(160) not null,
  phone varchar(40),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, email)
);

create table staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  title varchar(120),
  bio text,
  skill_tags text[] not null default '{}',
  commission_percentage numeric(5,2) not null default 0,
  working_hours jsonb not null default '{}'::jsonb,
  leave_dates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  full_name varchar(160) not null,
  email varchar(160),
  phone varchar(40),
  birth_date date,
  notes text,
  consent_status varchar(40) not null default 'PENDING',
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category varchar(80) not null,
  name varchar(160) not null,
  description text,
  duration_minutes integer not null,
  price numeric(10,2) not null,
  deposit_required boolean not null default false,
  deposit_amount numeric(10,2),
  add_ons jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  service_id uuid not null references services(id),
  staff_profile_id uuid references staff_profiles(id),
  status varchar(40) not null default 'PENDING',
  start_at timestamptz not null,
  end_at timestamptz not null,
  buffer_before_minutes integer not null default 0,
  buffer_after_minutes integer not null default 0,
  notes text,
  cancellation_reason text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  appointment_id uuid not null references appointments(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  invoice_number varchar(80) not null unique,
  subtotal_amount numeric(10,2) not null default 0,
  deposit_amount numeric(10,2) not null default 0,
  balance_due numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  payment_status varchar(40) not null default 'UNPAID',
  payment_method varchar(40),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table consent_forms (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  form_name varchar(160) not null,
  form_type varchar(80) not null,
  form_version varchar(40) not null,
  status varchar(40) not null default 'PENDING',
  signed_at timestamptz,
  signature_file_url text,
  pdf_file_url text,
  form_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  file_name varchar(160) not null,
  file_type varchar(80) not null,
  storage_path text not null,
  uploaded_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  channel varchar(40) not null,
  title varchar(160) not null,
  body text not null,
  status varchar(40) not null default 'PENDING',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_users_business_id on users(business_id);
create index idx_staff_profiles_business_id on staff_profiles(business_id);
create index idx_clients_business_id on clients(business_id);
create index idx_services_business_id on services(business_id);
create index idx_appointments_business_start on appointments(business_id, start_at);
create index idx_payments_business_status on payments(business_id, payment_status);
create index idx_consent_forms_client_status on consent_forms(client_id, status);
create index idx_client_documents_client_id on client_documents(client_id);
create index idx_notifications_user_status on notifications(user_id, status);
```

## Backend notes for Spring Boot

- Model `users`, `roles`, and `businesses` first to unlock auth and access control.
- `appointments` should enforce booking overlap rules in the service layer, not only in the UI.
- `consent_forms.form_payload` allows service-specific JSON while the product shape is still evolving.
- `client_documents.storage_path` should store Firebase Storage paths, not public URLs as the source of truth.

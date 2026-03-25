# Database Schema

This section provides canonical table schemas and key constraints for the primary domain data. The SQL snippets are illustrative — adapt names, enum types, and UUID functions to the migration tooling (Prisma). Ensure these extensions are enabled in the DB: `postgis`, `btree_gist`, and a UUID generator (`pgcrypto` or `uuid-ossp`).

## Notes

- Use `GEOGRAPHY(Point,4326)` (PostGIS) for `gear.location` for accurate distance queries.
- Use `DATERANGE` for booking periods and a GIST exclusion constraint to prevent double-booking.
- Store denormalized documents/events in an `events` append-only table for audit and saga replay.

## Core tables

**Users**

| Column      | Type        | Constraints / Notes                                      |
| ----------- | ----------- | -------------------------------------------------------- |
| id          | UUID        | PK, default gen_random_uuid() / uuid_generate_v4()       |
| email       | text        | NOT NULL, UNIQUE                                         |
| name        | text        | nullable                                                 |
| role        | text        | NOT NULL, default 'renter' (recommend enum: `user_role`) |
| kyc_status  | text        | default 'unknown'                                        |
| payout_info | jsonb       | vendor-specific payout/account metadata                  |
| created_at  | timestamptz | NOT NULL, default now()                                  |
| updated_at  | timestamptz | NOT NULL, default now()                                  |

**Gear (listings)**

| Column        | Type                  | Constraints / Notes                                   |
| ------------- | --------------------- | ----------------------------------------------------- |
| id            | UUID                  | PK, default gen_random_uuid()                         |
| owner_id      | UUID                  | FK -> `users(id)`, ON DELETE CASCADE                  |
| title         | text                  | NOT NULL                                              |
| description   | text                  | nullable                                              |
| price_per_day | numeric(10,2)         | NOT NULL                                              |
| deposit       | numeric(10,2)         | default 0                                             |
| location      | geography(Point,4326) | PostGIS point for geospatial queries; index with GIST |
| is_active     | boolean               | default true                                          |
| created_at    | timestamptz           | NOT NULL, default now()                               |
| updated_at    | timestamptz           | NOT NULL, default now()                               |

Indexes & notes: create a GIST index on `location` and normal indexes on common filters (price, is_active).

**Gear photos / media**

| Column      | Type        | Constraints / Notes                 |
| ----------- | ----------- | ----------------------------------- |
| id          | UUID        | PK                                  |
| gear_id     | UUID        | FK -> `gear(id)`, ON DELETE CASCADE |
| object_key  | text        | storage object key / path           |
| sha256      | text        | optional integrity/hash             |
| uploaded_by | UUID        | FK -> `users(id)` optional          |
| uploaded_at | timestamptz | NOT NULL, default now()             |

**Bookings**

| Column       | Type          | Constraints / Notes                                       |
| ------------ | ------------- | --------------------------------------------------------- |
| id           | UUID          | PK                                                        |
| gear_id      | UUID          | FK -> `gear(id)`                                          |
| renter_id    | UUID          | FK -> `users(id)` (ON DELETE SET NULL recommended)        |
| period       | daterange     | NOT NULL — canonical booking range (start, end)           |
| status       | text          | booking lifecycle state (recommend enum `booking_status`) |
| total_amount | numeric(12,2) | NOT NULL                                                  |
| hold_id      | text          | external payment hold / PaymentIntent id                  |
| created_at   | timestamptz   | NOT NULL, default now()                                   |
| updated_at   | timestamptz   | NOT NULL, default now()                                   |

Concurrency & correctness: enforce a GIST `EXCLUDE` constraint on `(gear_id WITH =, period WITH &&)` for active states (requires `btree_gist`) to prevent overlapping confirmed/active bookings.

**Payments**

| Column           | Type          | Constraints / Notes                                 |
| ---------------- | ------------- | --------------------------------------------------- |
| id               | UUID          | PK                                                  |
| booking_id       | UUID          | FK -> `bookings(id)`                                |
| stripe_intent_id | text          | external gateway id                                 |
| amount           | numeric(12,2) | NOT NULL                                            |
| currency         | text          | default 'usd'                                       |
| status           | text          | payment lifecycle (recommend enum `payment_status`) |
| captured_at      | timestamptz   | nullable                                            |
| created_at       | timestamptz   | NOT NULL, default now()                             |

Add a unique index on `booking_id` when one payment record should map to a booking, or allow many-to-one if storing settlement history.

**Disputes**

| Column     | Type        | Constraints / Notes                             |
| ---------- | ----------- | ----------------------------------------------- |
| id         | UUID        | PK                                              |
| booking_id | UUID        | FK -> `bookings(id)`                            |
| type       | text        | dispute category                                |
| status     | text        | default 'open'                                  |
| evidence   | jsonb       | structured evidence references (S3 keys, notes) |
| created_at | timestamptz | NOT NULL, default now()                         |
| updated_at | timestamptz | NOT NULL, default now()                         |

**Events (append-only)**

| Column         | Type        | Constraints / Notes                   |
| -------------- | ----------- | ------------------------------------- |
| id             | bigserial   | PK, append-only sequence              |
| aggregate_type | text        | e.g., 'booking', 'payment'            |
| aggregate_id   | uuid        | id of the entity the event belongs to |
| event_type     | text        | e.g., 'booking.confirmed'             |
| payload        | jsonb       | event data, immutable                 |
| created_at     | timestamptz | NOT NULL, default now()               |

## Indexing & performance

- Create GIST index on `gear.location` (above) for geospatial queries.
- Consider a materialized `listing_search` table (denormalized) synced via events for OpenSearch/Elasticsearch indexing.
- Add partial indexes on `bookings(status)` and `payments(status)` for fast lookups of active holds and pending captures.

## Example enum / type suggestions

- `user_role`: ['renter', 'owner', 'admin']
- `booking_status`: ['provisional', 'confirmed', 'active', 'completed', 'cancelled', 'disputed']
- `payment_status`: ['authorized', 'captured', 'voided', 'refunded']

## Migration notes

- Enable required extensions in a migration: `CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS btree_gist; CREATE EXTENSION IF NOT EXISTS pgcrypto;` (or `uuid-ossp`).
- When using an ORM (Prisma), model the `period` as separate `start_date`/`end_date` fields and create a database-level `DATERANGE` column and exclusion constraint via raw SQL migration where the ORM cannot express the constraint.

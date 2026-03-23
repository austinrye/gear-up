# Gear Up — Outdoor Gear Rental Marketplace

[![Demo](https://img.shields.io/badge/demo-pending-lightgrey)](https://austinrye.dev/projects/gear-up/)
[![Build Status](https://img.shields.io/badge/build-pending-lightgrey)](https://github.com/your-org/gear-up/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Short: A marketplace to rent outdoor gear — owners list equipment, renters book for date ranges, and the platform handles payments, deposits, and disputes.

## Table of Contents

- [Gear Up — Outdoor Gear Rental Marketplace](#gear-up--outdoor-gear-rental-marketplace)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Architecture Overview](#architecture-overview)
  - [Tech Stack](#tech-stack)
  - [Project Layout](#project-layout)
  - [Features](#features)
    - [Core Marketplace](#core-marketplace)
    - [Listings \& Availability](#listings--availability)
    - [Booking \& Payments](#booking--payments)
    - [Communication \& Trust](#communication--trust)
    - [Logistics \& Fulfillment](#logistics--fulfillment)
    - [Search \& Discovery](#search--discovery)
    - [Notifications \& User Settings](#notifications--user-settings)
    - [Admin \& Reporting](#admin--reporting)
    - [Security \& Compliance](#security--compliance)
    - [Integrations \& Extras](#integrations--extras)
  - [Booking \& Payment Flow](#booking--payment-flow)
  - [Getting Started (dev)](#getting-started-dev)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [License](#license)

---

## About

This repository contains the design and scaffolding for an outdoor-gear rental marketplace MVP. The primary goals are: reliable availability handling (no double-booking), marketplace payments/escrow, owner payouts, and a simple web UI. The README contains the high-level architecture and recommended next steps.

Homepage / demo: TBA

## Architecture Overview

The system is organized as small backend services (Auth, Catalog, Availability, Booking, Payments, Notifications) with an API gateway, event bus, and managed data stores. See `docs/architecture.md` for diagrams and sequence flows (to be added).

Key design choices:

- Event-driven booking pipeline (Saga) to coordinate payment holds and booking state.
- PostgreSQL + PostGIS for primary data and geospatial queries; Redis for caching and locks.
- Stripe Connect for marketplace payments and KYC.

## Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express.js + TypeScript
- DB: PostgreSQL + PostGIS + Prisma
- API: REST (public) + gRPC (internal) + GraphQL (optional gateway/BFF)
- Cache/locks: Redis
- Search: Elasticsearch / OpenSearch
- Storage: S3-compatible object storage
- Messaging: Kafka / RabbitMQ (or Redis Streams for early stages)
- Payments: Stripe Connect

## Project Layout

```
.
├── web/                        # Frontend: React + Vite + TypeScript
│   └── src/
│       ├── app/                # Next.js App Router (routes & layouts)
│       │   ├── listings/       # grid, filters
│       │   ├── listings/[id]/  # dynamic listing details
│       │   ├── search/         # results, map, filters
│       │   ├── booking/        # booking flow and details
│       │   ├── checkout/       # payment, confirmation
│       │   ├── account/        # profile, settings
│       │   ├── auth/           # sign-in, sign-up, reset
│       │   ├── admin/          # admin dashboards (protected)
│       │   ├── layout.tsx      # Root layout (HTML shell, providers)
│       │   └── page.tsx        # Root (home) page
│       ├── components/         # Global UI components
│       │   ├── ui/             # High-reusability (Button, Input, Card) + shadcn
│       │   └── layout/         # App-wide UI (Navbar, Footer)
│       └── features/           # Feature specific UI/logic
│           ├── auth/           # Authentication flows (signup, login, session)
│           ├── users/          # Profiles, settings, verification
│           ├── catalog/        # Listing browse, details, and media
│           ├── search/         # Search, filters, autosuggest, map
│           ├── booking/        # Booking flow, checkout, calendar
│           ├── inventory/      # Owner item management & availability
│           ├── pricing/        # Pricing UI, discounts, coupons
│           ├── payments/       # Checkout UI, payment methods, receipts
│           ├── notifications/  # In-app notifications and preferences
│           ├── reviews/        # Reviews, ratings, moderation UI
│           ├── insurance/      # Insurance options and quoting UI
│           └── admin/          # Admin dashboards and moderation tools
│
├── api/                        # Backend APIs: Node.js + Express.js
│   └── src/
│       ├── configs/            # Env vars, validation, DB connection
│       ├── middlewares/        # Auth, error handling, rate limiting
│       ├── modules/            # Env vars, validation, migrations, ORM models
│       │   ├── auth/           # Registration, login, sessions, KYC, identity
│       │   ├── users/          # Profiles, verification badges, reputation
│       │   ├── catalog/        # Listings, media metadata, thumbnails
│       │   ├── search/         # Indexing, geo-search, autosuggest
│       │   ├── booking/        # Reservations, calendar, lifecycle, conflict detection
│       │   ├── inventory/      # Item state, check-in/out, fulfillment tasks
│       │   ├── pricing/        # Pricing rules, discounts, deposits
│       │   ├── payments/       # Stripe Connect integration, transactions, payouts
│       │   ├── notifications/  # Email/SMS/push, templating, delivery
│       │   ├── reviews/        # Reviews, ratings, moderation
│       │   ├── insurance/      # Quoting, claims intake, risk checks
│       │   └── admin/          # Admin APIs, moderation, manual payouts
│       └── index.js            # Server entry point
│
├── db/                         # Database: PostgreSQL + Prisma
│   ├── prisma/
│   │   ├── migrations/         # Migration history
│   │   └── schema.prisma       # Canonical Prisma schema (models, enums, generators)
│   └── src/
│       ├── client.ts           # Exports a configured Prisma Client instance
│       └── seed.ts             # Local development seed
│
├── infra/                      # Terraform/CloudFormation and deployment scripts
└── docs/                       # Architecture diagrams, sequence flows, runbooks
```

## Features

Below is a living checklist of user-facing features planned for the Gear Up platform.

### Core Marketplace

- [ ] Search listings — browse available gear using filters and map
- [ ] View listing details — photos, descriptions, rules, availability calendar
- [ ] Create listing (owners) — add listing details, photos, pricing, availability
- [ ] Booking checkout — select dates, review price breakdown, and pay
- [ ] Booking calendar — per-listing calendar showing blocked/available dates

### Listings & Availability

- [ ] Availability rules — set booking rules, minimum/maximum nights, lead time
- [ ] Block dates & maintenance mode — owners can block dates or mark unavailable
- [ ] Calendar sync — export/import iCal for external calendar sync
- [ ] Media uploads & moderation — upload photos and manage approval/flags

### Booking & Payments

- [ ] Request to Book / Instant Book — support booking modes and owner approvals
- [ ] Payment authorization & holds — authorize rental + deposit (manual capture)
- [ ] Capture & payout — capture at rental start and schedule owner payout
- [ ] Cancellations & modifications — policies for refunds, partial refunds, penalties
- [ ] Coupons & discounts — apply promo codes at checkout

### Communication & Trust

- [ ] In-app messaging — conversation between renter and owner per booking
- [ ] User profiles & verification — profiles, IDs, and verification badges
- [ ] Reviews & ratings — renter and owner reviews after completed rentals
- [ ] Dispute flow — submit claims and platform mediation tools

### Logistics & Fulfillment

- [ ] Pickup / delivery options — enable pickup times or delivery/shipping choices
- [ ] Shipping integration — label creation and tracking (optional)
- [ ] Check-in / check-out workflows — record item condition and handoffs

### Search & Discovery

- [ ] Geo and date search — find gear by location and availability dates
- [ ] Filters & facets — price, category, capacity, amenities, tags
- [ ] Map view & bounding-box search — visualize nearby gear on a map
- [ ] Saved favorites / wishlists — save listings for later

### Notifications & User Settings

- [ ] Email / SMS / In-app notifications — booking confirmations, reminders
- [ ] Notification preferences — user controls for channels and frequency
- [ ] Account settings & security — password, 2FA, session management

### Admin & Reporting

- [ ] Admin dashboard — moderation, support tickets, manual payouts
- [ ] Transaction history & statements — owner earnings and reconciliations
- [ ] Analytics & usage reports — bookings, revenue, occupancy trends

### Security & Compliance

- [ ] KYC for owners — identity verification for payouts and trust signals
- [ ] PCI compliance via gateway — no raw card storage (Stripe integration)
- [ ] Privacy & data retention — controls for PII and retention policies

### Integrations & Extras

- [ ] Insurance at checkout — offer optional insurance products during booking
- [ ] Multi-currency & tax handling — display and process local currencies and taxes
- [ ] Mobile / PWA experience — responsive UI and offline-capable PWA features
- [ ] Third-party identity & fraud checks — optional integrations for risk mitigation

## Booking & Payment Flow

1. Search & select gear (Catalog + Availability).
2. Create provisional booking and reserve dates (DB exclusion constraint or advisory lock).
3. Authorize payment (Stripe PaymentIntent, `capture_method=manual`) for rental + deposit.
4. On successful auth, mark booking `confirmed` and emit `booking.confirmed`.
5. Capture charge at rental start; release or transfer deposit on return or claim.
6. Compensating transactions on failure (void hold, release reservation).

Concurrency and correctness: use PostgreSQL exclusion constraints for dateranges, Redis locks for high contention, idempotent handlers, and event deduplication.

## Getting Started (dev)

Requirements:

- Node.js 18+ and Typescript
- `npm` for package management
- Docker (for local Postgres + Redis)
- Terraform (optional, for infra skeleton)

Quickstart (local dev sketch):

```bash
git clone https://github.com/your-org/gear-up.git
cd gear-up
# start local dev DBs via docker-compose (to be added)
# frontend: cd frontend && npm install && npm run dev
# backend services (Node/Express): e.g. cd backend/services/booking && npm install && npm run dev
```

## Roadmap

- Phase 0: Architecture doc, schema prototypes, infra skeleton, and booking prototype
- Phase 1: MVP — booking + Stripe Connect + web UI + observability
- Phase 2: Mobile client, insurance/claims integration, improved search
- Phase 3: Scale & hardening — sharding, multi-region, advanced monitoring

## Contributing

Contributions welcome. Opening issues for feature requests, and PRs for implementation. Please follow the repo's coding standards and include tests for new behavior.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Austin Rye

---

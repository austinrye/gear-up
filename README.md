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
- Backend: Kotlin + Spring Boot
- DB: PostgreSQL with PostGIS
- API: REST (public) + gRPC (internal) + GraphQL (optional gateway/BFF)
- Cache/locks: Redis
- Search: Elasticsearch / OpenSearch
- Storage: S3-compatible object storage
- Messaging: Kafka / RabbitMQ (or Redis Streams for early stages)
- Payments: Stripe Connect

## Project Layout

- `frontend/` — React + Vite + TypeScript frontend (PWA-ready)
- `backend/app/` - Spring Boot + Kotlin application
- `backend/modules/common` — common libraries, DTOs, domain primitives, validation, error types, DB migrations, ORM models shared across modules; keep minimal surface and backward-compatible.
- `backend/modules/auth` — registration, login, JWT/OAuth/SSO, sessions/tokens, roles, 2FA, KYC/verification; owns users, auth_tokens, identities tables; exposes sync REST/gRPC auth API and account events.
- `backend/modules/users` — user profiles, owner/renter attributes, verification badges, reputation score; owns profile metadata and verification artifacts; provides profile read APIs.
- `backend/modules/catalog` — listings CRUD, categories, attributes, media metadata, thumbnails; owns listings, listing_attributes, media metadata; coordinates with Media subsystem for storage/transform; exposes catalog read/write APIs.
- `backend/modules/search` — full-text indexing, geo-search, faceted filters, autosuggest; maintains search index (Elasticsearch/Opensearch) and sync workers; provides search API (query-only surface).
- `backend/modules/booking` — calendar, reservations, holds, conflict detection, cancellations, timezone handling, booking lifecycle; owns bookings, availability tables; exposes booking command API and booking events.
- `backend/modules/inventory` — item state (available, checked-out, maintenance), check-in/out workflows, pickup/delivery, shipping integration; owns inventory_items, fulfillment tasks; exposes inventory control API.
- `backend/modules/pricing` — pricing rules, seasonal rates, discounts, coupons, security deposits, dynamic pricing hooks; owns pricing rule store and evaluation engine; exposes pricing API and validation.
- `backend/modules/payments` — payment processing (Stripe Connect integration), gateway integration, split payouts to owners, refunds, invoices, tax handling, reconciliation; owns transactions, payouts, invoices; communicates with external gateways and emits financial events.
- `backend/modules/notifications` — in-app messaging, email/SMS/push, templating, delivery retries, message persistence; owns messages, notification_preferences; exposes send/subscribe APIs and consumes domain events.
- `backend/modules/reviews` — post-rental reviews, aggregated scores, moderation, dispute flags; owns reviews, ratings; exposes review APIs and moderation tools.
- `backend/modules/insurance` — insurance quoting/checkout integration, claims intake endpoints, risk scoring, fraud checks; houses risk models and policy references; emits risk/hold flags.
- `backend/modules/admin` — admin UI APIs, moderation actions, manual payouts, support tools, feature flag control; unified admin surface with elevated permissions.
- `infra/` — Terraform/CloudFormation and deployment scripts
- `docs/` — architecture diagrams, sequence flows, runbooks

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

- Java 17+ (or compatible JVM) and Kotlin
- Gradle (recommended) or Maven with Kotlin support
- Docker (for local Postgres + Redis)
- Terraform (optional, for infra skeleton)

Quickstart (local dev sketch):

```bash
git clone https://github.com/your-org/gear-up.git
cd gear-up
# start local dev DBs via docker-compose (to be added)
# cd web && npm install && npm run dev
# backend services use Gradle/Kotlin: e.g. cd service/booking && ./gradlew bootRun
```

This repo currently contains architecture notes. I can scaffold `docs/architecture.md`, `infra/terraform/`, and a minimal `service/booking` prototype next.

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

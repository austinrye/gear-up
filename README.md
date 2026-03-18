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

- `services/auth` — authentication, JWT/OAuth, KYC flows
- `services/catalog` — gear CRUD, photos, categories, metadata
- `services/availability` — date-range calendar, conflict detection
- `services/booking` — booking lifecycle, holds, captures
- `services/payments` — Stripe Connect integration, payouts
- `services/notifications` — email/SMS/push
- `web/` — React + Vite + TypeScript frontend (PWA-ready)
- `infra/` — Terraform/CloudFormation and deployment scripts
- `docs/` — architecture diagrams, sequence flows, runbooks

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

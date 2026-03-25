# GearUp — Outdoor Gear Rental Marketplace

[![Demo](https://img.shields.io/badge/demo-pending-lightgrey)](https://austinrye.dev/projects/gear-up/)
[![Build Status](https://img.shields.io/badge/build-pending-lightgrey)](https://github.com/your-org/gear-up/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

GearUp connects outdoors enthusiasts and gear owners to rent equipment for trips and adventures; owners list gear and set availability while renters book items for specific date ranges. It's designed for casual adventurers, weekend campers, and small rental businesses — the platform handles availability, payments, deposits, and dispute resolution.

## Key Features

- Identity verification (owner & renter KYC)
- Availability calendars with date-range exclusion, conflict prevention, and iCal sync
- Booking workflow: provisional reservations, confirmations, cancellations, and refunds
- Escrow-style payments: authorization (holds), captures, deposits, and automated refunds
- Owner payouts and marketplace split payments (Stripe Connect)
- Geo/date search and availability-aware listings with filters
- Pricing rules: seasonal rates, discounts, security deposits, and fees
- Messaging, reviews, ratings, and dispute resolution tools
- Damage claims and optional insurance integrations
- Notifications: email, SMS, in-app, and webhook events for integrations
- Admin dashboards, reporting, and audit logs

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: Express.js + TypeScript
- DB: PostgreSQL + PostGIS + Prisma
- API: REST (public) + gRPC (internal) + GraphQL (optional gateway/BFF)
- Cache/locks: Redis
- Search: Elasticsearch / OpenSearch
- Storage: S3-compatible object storage
- Messaging: Kafka / RabbitMQ
- Payments: Stripe Connect

## Quick Start

Requirements:

- Node.js 18+

Local Dev Guide:

```bash
git clone https://github.com/austinrye/gear-up.git && cd gear-up

# Install dependencies for the repo
npm install

# Run backend API in development
cd api && npm run dev

# TBA: web frontend
```

## Documentation

Detailed guides and technical specifications can be found in the [`/docs`](./docs) directory:

| Section                                            | Description                                             |
| :------------------------------------------------- | :------------------------------------------------------ |
| **[Architecture](docs/architecture.md)**           | Architecture and sequence flows.                        |
| **[Features](docs/features.md)**                   | Feature checklist and implementation notes.             |
| **[Project Structure](docs/project-structure.md)** | Project layout and contributor guidelines.              |
| **[Database](docs/database.md)**                   | Canonical table schemas, indexing, and migration notes. |

## Contributing

Contributions welcome. Opening issues for feature requests, and PRs for implementation. Please follow the repo's coding standards and include tests for new behavior.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Austin Rye

---

# Gear Up — Architecture

This document describes the high-level architecture for the Gear Up outdoor-gear rental marketplace. It is a living document intended to guide implementation, infra, and QA for the MVP and subsequent phases.

## Overview

Goal: provide a reliable, consumer-facing marketplace where owners list outdoor gear and renters reserve items for date ranges. Core constraints are correctness (no double-booking), secure marketplace payments (escrow/payouts), and a simple owner/renter UX.

Principles:

- Small, focused services (bounded contexts) with clear responsibilities.
- Event-driven coordination for cross-service workflows (booking + payments).
- Use managed services where practical to reduce ops burden for MVP.

## Components

- API Gateway / Edge: ingress, TLS termination, authentication, rate-limiting, routing.
- Auth Service: user management, OAuth/JWT, owner KYC integration.
- Catalog Service: gear listings, metadata, images references.
- Availability Service: date-range availability logic and calendar APIs.
- Booking Service: booking lifecycle coordinator (provisional, confirmed, active, completed, disputed).
- Payments Service: Stripe Connect integration (PaymentIntents, captures, refunds, payouts).
- Notifications Service: email/SMS/push templates and delivery.
- Reviews & Disputes Service: post-rental reviews and claim handling.
- Event Bus: Kafka/RabbitMQ (or Redis Streams) for reliable message delivery and consumption.
- Datastores: PostgreSQL (+PostGIS) for domain data; Redis for cache/locks; OpenSearch for search.
- Object Storage: S3-compatible storage for photos and evidence artifacts.

## Booking sequence (simplified)

1. Client queries Catalog + Availability to display available gear.
2. Client requests a provisional booking for a date range.
   - Booking Service attempts to reserve dates using a DB exclusion constraint or an advisory lock.
3. Booking Service asks Payments Service to create a PaymentIntent with `capture_method=manual` (hold).
4. If authorization succeeds, Booking Service marks the booking `confirmed` and emits `booking.confirmed`.
5. At rental start, Booking Service (or rental-worker) requests capture of the authorized amount.
6. At return, platform decides to release deposit or transfer funds to owner; may create a dispute which halts payout.
7. For any failure, compensate: release reserved dates, void holds/refunds, and notify participants.

Notes on correctness:

- Primary defense: PostgreSQL exclusion constraints on a `daterange` column with a GIST index.
- Secondary defense: short-lived Redis distributed locks during booking flows.
- All external operations are idempotent and recorded with unique operation IDs.

## Events and Sagas

- Use events for long-running processes (payment holds, captures, disputes).
- The Booking Service orchestrates the saga by emitting commands/events and listening for confirmations (payment.authorized, payment.captured, dispute.created).
- Keep compensating actions explicit and tested (refunds, reopen availability).

## API strategy

Adopt a pragmatic hybrid API strategy:

- REST for public-facing HTTP/JSON APIs — easy for browsers, mobile apps, and third-party integrations. Implement with Express.js and TypeScript.
- gRPC for internal service-to-service calls — use `@grpc/grpc-js` (grpc-node) and protobuf for strong typing, low latency, and streaming where useful. Expose gRPC-Web via a proxy (Envoy) if needed for browser clients.
- GraphQL only as a gateway/BFF when the frontend requires complex, aggregated queries; use Apollo Server or a GraphQL gateway in Node for that layer if necessary.

## Geospatial & Search

- Use PostGIS for authoritative geolocation queries (ST_DWithin). Create GIST indexes and tune queries for common radii.
- Use OpenSearch/Elasticsearch to provide text and faceted search; synchronize denormalized listing documents from Catalog.

## Security & Compliance

- TLS and secure headers at edge; enforce strong CORS policies.
- Use Stripe to reduce PCI scope; never store raw card data.
- KYC for owners via Stripe Identity or a dedicated verification vendor.
- Protect media uploads with signed S3 URLs and access policies; store SHA256 hash for tamper evidence.

## Observability

- Structured logs (JSON) collected centrally.
- Metrics: Prometheus for service metrics; Grafana dashboards for SLA/SLO tracking.
- Distributed tracing (OpenTelemetry) for booking/payment flows.

## Infra & Deployment (MVP guidance)

- Managed Postgres with PostGIS (RDS/Aurora/Cloud SQL) and a read-replica for search/reads.
- Redis managed or hosted for cache/locks.
- Kubernetes (EKS/GKE/AKS) for services or serverless containers for early prototypes.
- Terraform modules for core infra (VPC, DB, Redis, object storage, k8s cluster).

## Non-functional requirements

- Availability: target 99.9% for booking APIs in production.
- Latency: booking confirmation should complete within 2s in common cases (auth dependent).
- Data retention: define retention for PII and media based on privacy policy.

## Next steps

1. Add diagrams to this document: component diagram and booking sequence diagram (Mermaid).
2. Create `infra/terraform/` skeleton and a `docker-compose` for local development (Postgres + PostGIS + Redis).

## Frontend pages (UI surface)

This section lists the web pages and UI surfaces required for the MVP and near-term features. Pages are grouped by public, renter, owner (host), account/auth, messaging/support, and admin flows.

### Public

- Home / Landing: marketing, search hero, featured listings, call-to-actions.
- Explore / Search Results: list + map, filters, date & location inputs, autosuggest.
- Listing Detail: full gallery, description, rules, host info, availability calendar, reviews, booking CTA.
- Listing Preview Modal: quick view from search results.
- Static / Marketing: About, How it Works, FAQ, Roadmap, Terms & Privacy.

### Booking & Renter Flow

- Availability Calendar: select start/end dates and see blocked dates.
- Booking Review: price breakdown, add-ons, optional insurance, cancellation policy.
- Checkout / Payment: payment method entry, payment authorization/hold flow, confirmation.
- Booking Confirmation / Receipt: booking summary, contact info, next steps.
- My Bookings / Upcoming Trips: list of bookings with status, modify/cancel actions.
- Booking Detail Page: conversation, pickup/delivery instructions, check-in/out checklist, dispute actions.
- Post-Rental Review: leave rating and review for host and item.

### Owner (Host) Flow

- Create / Edit Listing Wizard: details, photos, pricing, availability rules, location entry.
- Listing Manager / Host Dashboard: list of owner listings, publish/draft, basic analytics.
- Listing Calendar / Availability Management: block dates, sync iCal, maintenance mode.
- Reservations Inbox: incoming booking requests, accept/decline, manage booking lifecycle.
- Payouts & Transactions: earnings overview, payout settings, payout history, transaction detail.
- Performance & Analytics: occupancy, revenue trends, top listings.
- Host Onboarding / KYC: identity verification, Stripe Connect onboarding, tax info.

### Account & Auth

- Sign Up / Sign In: email/phone, social login, passwordless options, MFA enrollment.
- Confirmations & Password Reset: email/OTP flows and recovery.
- Profile: public-facing profile with verification badges and bio.
- Settings: notification preferences, communication channels, privacy settings.
- Payment Methods: saved cards and bank accounts, add/remove.
- Security: 2FA, active sessions, device management.

### Messaging & Support

- In-app Messaging / Conversations: renter ↔ host per booking, message list and composer.
- Help Center / Knowledge Base: searchable support articles.
- Support Ticket / Contact Form: file attachments, ticket status.
- Dispute / Claims Flow: open a dispute, upload evidence, view status and resolution.

### Admin & Moderation

- Admin Dashboard: system metrics, recent activity, health checks.
- User Management: view/suspend/reactivate users, KYC status checks.
- Listing Moderation: review pending listings, flagged media, remove content.
- Transaction Management: refunds, manual payouts, ledger views.
- Reports & Audit: disputes, chargebacks, operational reports and exports.

### System & Utility Pages

- Notifications Center: centralized in-app notifications.
- Search Autosuggest & Empty States: UX for no results and edge cases.
- Error Pages: 404, 500, maintenance.
- Developer / API Docs (optional): webhook docs, integration guides.

These pages are intentionally organized to map to the backend services and event flows defined in this architecture doc (Catalog, Availability, Booking, Payments, Notifications). Use these page groupings when designing routes, components, and BFF/GraphQL schemas.

---

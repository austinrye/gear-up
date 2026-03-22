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

## Data model (summary)

- users: id, role, email, kyc_status, payout_info
- gear: id, owner_id, title, description, price_per_day, deposit, location (geom)
- gear_photos: id, gear_id, object_key, hash, uploaded_by, uploaded_at
- bookings: id, gear_id, renter_id, start_date, end_date, status, total_amount, hold_id
- payments: id, booking_id, stripe_intent_id, amount, status
- disputes: id, booking_id, type, status, evidence_refs

Persist important state transitions (booking.created, booking.confirmed, payment.captured) to an append-only events table to facilitate audits and replay.

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

---

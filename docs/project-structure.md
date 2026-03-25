## Project Layout

```
.
├── web/                          # Frontend: React + Vite + TypeScript
│   └── src/
│       ├── app/                  # Next.js App Router (routes & layouts)
│       │   ├── home/             # Landing, featured listings, marketing
│       │   ├── listings/         # Grid, filters, collection pages
│       │   ├── listings/[id]/    # Dynamic listing details (gallery, calendar, reviews)
│       │   ├── search/           # Results, map, filters, autosuggest
│       │   ├── booking/          # Availability picker, booking review
│       │   ├── checkout/         # Payment, authorization flow, confirmation
│       │   ├── account/          # Profile, settings, bookings, receipts
│       │   ├── owner/            # Owner dashboard
│       │   │   ├── gear/         # Gear manager (edit, new)
│       │   │   ├── listings/     # Listing manager (list, edit, new)
│       │   │   ├── reservations/ # Inbox for booking requests
│       │   │   └── payouts/      # Payouts & transaction history
│       │   ├── auth/             # Sign-in, sign-up, reset, verification
│       │   ├── messages/         # In-app conversations per booking
│       │   ├── help/             # Support articles, contact form
│       │   ├── admin/            # Admin dashboards (protected)
│       │   ├── layout.tsx        # Root layout (HTML shell, providers)
│       │   └── page.tsx          # Root (home) page
│       ├── components/           # Global UI components
│       │   ├── ui/               # High-reusability (Button, Input, Card) + shadcn
│       │   └── layout/           # App-wide UI (Navbar, Footer)
│       └── features/             # Feature specific UI/logic
│           ├── auth/             # Authentication flows (signup, login, session)
│           ├── users/            # Profiles, settings, verification
│           ├── catalog/          # Listing browse, details, and media handling
│           ├── search/           # Search logic, filters, map integration
│           ├── booking/          # Booking state, calendar interactions
│           ├── inventory/        # Owner item management & availability
│           ├── pricing/          # Pricing UI, discounts, coupons, price rules
│           ├── payments/         # Checkout UI, saved payment methods, receipts
│           ├── notifications/    # In-app notifications and preferences
│           ├── reviews/          # Reviews, ratings, moderation UI
│           ├── insurance/        # Insurance options and quoting UI
│           └── admin/            # Admin dashboards and moderation tools
│
├── api/                          # Backend APIs: Node.js + Express.js
│   └── src/
│       ├── configs/              # Env vars, validation, DB connection
│       ├── middlewares/          # Auth, error handling, rate limiting
│       ├── modules/              # Env vars, validation, migrations, ORM models
│       │   ├── auth/             # Registration, login, sessions, KYC, identity
│       │   ├── users/            # Profiles, verification badges, reputation
│       │   ├── catalog/          # Listings, media metadata, thumbnails
│       │   ├── search/           # Indexing, geo-search, autosuggest
│       │   ├── booking/          # Reservations, calendar, lifecycle, conflict detection
│       │   ├── inventory/        # Item state, check-in/out, fulfillment tasks
│       │   ├── pricing/          # Pricing rules, discounts, deposits
│       │   ├── payments/         # Stripe Connect integration, transactions, payouts
│       │   ├── notifications/    # Email/SMS/push, templating, delivery
│       │   ├── reviews/          # Reviews, ratings, moderation
│       │   ├── insurance/        # Quoting, claims intake, risk checks
│       │   └── admin/            # Admin APIs, moderation, manual payouts
│       ├── app.js                # Express app setup & middleware
│       └── index.js              # Server entry point
│
├── db/                           # Database: PostgreSQL + Prisma
│   ├── prisma/
│   │   ├── migrations/           # Migration history
│   │   └── schema.prisma         # Canonical Prisma schema (models, enums, generators)
│   └── src/
│       ├── client.ts             # Exports a configured Prisma Client instance
│       └── seed.ts               # Local development seed
│
├── infra/                        # Terraform/CloudFormation and deployment scripts
└── docs/                         # Architecture diagrams, sequence flows, runbooks
```

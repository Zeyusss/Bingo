# Bingo-The-Awaken

A **production-minded, full-stack handmade marketplace**: three **Next.js 15** apps (customers, sellers, admins), a fleet of **Express** microservices, a central **API gateway** with sliding-window **rate limiting**, **MongoDB + Prisma**, **Redis**, **Kafka** event processing, **Stripe** payments, **ImageKit** media, and a **TensorFlow.js**–backed recommendation API—wired together in an **Nx** monorepo with **TypeScript** end-to-end.

[![CI](https://github.com/Zeyusss/Bingo-The-Awaken/actions/workflows/ci.yml/badge.svg)](https://github.com/Zeyusss/Bingo-The-Awaken/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nx](https://img.shields.io/badge/monorepo-Nx-143055?logo=nx&logoColor=white)](https://nx.dev)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-MongoDB-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Express](https://img.shields.io/badge/API-Express-000000?logo=express&logoColor=white)](https://expressjs.com)

**Nx · Next.js · React · TypeScript · Express · Prisma · MongoDB · Redis · Kafka · Stripe · ImageKit · TanStack Query · Zustand · Jest**

---

## Table of contents

1. [Project overview](#1-project-overview)  
2. [Key features](#2-key-features)  
3. [Tech stack](#3-tech-stack)  
4. [Architecture & design](#4-architecture--design)  
5. [Project structure](#5-project-structure)  
6. [Data flow](#6-data-flow)  
7. [UI / UX & platform quality](#7-ui--ux--platform-quality)  
8. [Installation & running locally](#8-installation--running-locally)  
9. [Environment configuration](#9-environment-configuration)  
10. [Testing & CI](#10-testing--ci)  
11. [Future improvements](#11-future-improvements)  
12. [Developer notes](#12-developer-notes)  
13. [What makes this project stand out](#13-what-makes-this-project-stand-out)  
14. [Contributing & license](#14-contributing--license)  
15. [For recruiters & reviewers](#15-for-recruiters--reviewers)

---

## 1. Project overview

**Bingo-The-Awaken** is a **handmade e-commerce ecosystem**: buyers discover products and complete checkout, sellers run shops and inventory from a dashboard, and operators use an admin console for users, catalog, revenue, and operational views.

The codebase is organized as a **single Nx workspace** with:

- **Three Next.js frontends** (`user-ui`, `seller-ui`, `admin-ui`) on React 19 with Tailwind-oriented styling patterns used across apps.  
- **Dedicated backend services** for auth, catalog, orders, sellers, admin APIs, real-time chat, blogs, recommendations, structured logging, and Kafka-backed analytics consumers.  
- **One HTTP API gateway** that fronts the microservices, applies **tiered rate limits** (general, API, dashboard, monitoring), and proxies to each service on well-defined ports.

Domain data is modeled in **Prisma** against **MongoDB** (see `prisma/schema.prisma`): users, sellers, shops, products, orders, cart and wishlist items, conversations, analytics, abandoned carts, blogs, sliders, and more.

A longer product narrative lives in [`PLATFORM_DOCUMENTATION.md`](PLATFORM_DOCUMENTATION.md).

---

## 2. Key features

Capabilities reflected in **routes, services, and schema** (not marketing copy):

| Area | What the repo implements |
|------|---------------------------|
| **Customer storefront** (`user-ui`) | Home, catalog, product detail, cart, checkout (Stripe.js), wishlist/compare flows, profile, offers, policies, auth screens—backed by gateway → auth / product / order services. |
| **Seller workspace** (`seller-ui`) | Signup/login, shop creation, dashboard analytics hooks, product and event management, chats, verification UI—talks to gateway-backed APIs. |
| **Admin console** (`admin-ui`) | Admin login, user/seller management, products, payments, notifications, abandoned carts, blogs, logger dashboard with WebSocket feed. |
| **Auth & identity** (`auth-service`) | Registration, login, JWT access/refresh patterns, Stripe-related flows in controller code, ImageKit-related upload configuration, Swagger UI at `/api-docs`. |
| **Catalog & engagement** (`product-service`) | Product and wishlist routes, abandoned-cart logic with email hooks, Swagger UI at `/api-docs`. |
| **Commerce** (`order-service`) | Stripe SDK usage, webhook secret verification, transactional email utilities. |
| **Real-time** | WebSocket URIs consumed from env in customer/seller UIs; chatting service behind `/chatting` on the gateway. |
| **Recommendations** (`recommendation-service`) | HTTP API mounted at `/recommendation` on the gateway; service depends on `@tensorflow/tfjs-node`. |
| **Events & analytics** | `kafka-service` consumes topic `users-events` and updates user/shop analytics services; shared Kafka client in `packages/utils/kafka`. |
| **Cross-cutting packages** | Shared Prisma client, Redis client, ImageKit wrapper, auth middleware (`ACCESS_TOKEN_SECRET`), structured logging utilities, reusable UI components under `packages/components`. |

---

## 3. Tech stack

**Nx (21.x) + npm workspaces**  
Chosen to coordinate **many deployable units** (three Next apps + nine+ Node services + e2e projects) with a **single TypeScript base config**, path aliases (`@packages/*`), and **affected** CI (`nx affected -t lint test build`).

**Next.js ~15.2 + React 19**  
App Router–style layouts under `apps/*/src/app`, server/client components as appropriate, and **Tailwind CSS** for rapid UI work across storefront and dashboards.

**Express microservices**  
Each service owns a slice of the domain; the **API gateway** centralizes **CORS**, **cookie parsing**, **large JSON bodies**, and **express-rate-limit** with custom keying (user id + IP) and **Retry-After** headers.

**Prisma + MongoDB**  
A **single schema** defines the marketplace domain (orders, products, shops, carts, messages, blogs, etc.), giving **typed queries** and a clear contract between services and the database.

**TanStack Query + Zustand (+ Jotai where used)**  
Server state, caching, and mutations are handled with **`@tanstack/react-query`** (see `QueryClientProvider` / `QueryProvider` patterns and hooks across UIs). Client flags and persisted UI state use **`zustand`** (e.g. `apps/user-ui/src/store/authStore.ts`, `comparisonStore.ts`). **Jotai** appears for lightweight atoms in admin/seller config modules.

**Stripe · ImageKit · Nodemailer / Gmail paths**  
Payments and media are first-class in dependencies and service code; email uses SMTP env blocks and, in order-service, optional Gmail app-password variables for specific flows.

**Kafka (kafkajs) + Redis (ioredis)**  
Event streaming and caching/redis integration live in shared packages and consumers—suitable for **scale-out** and **decoupled** analytics.

**Jest (Nx multi-project)**  
Root `jest.config.ts` uses `getJestProjectsAsync()` so each app’s tests plug into the workspace standard.

---

## 4. Architecture & design

### High-level architecture

```
Browsers (Next.js ×3)
        │
        ▼
   api-gateway  :8080  ──rate limits + proxy──►  auth :6001  |  product :6002  |  seller :6003
        │                                        order :6004 |  admin :6005   |  chatting :6006
        │                                        recommendation :6007 |  logger :6008 |  blog :6009
        ▼
   MongoDB (Prisma)   Redis   Kafka brokers   Stripe / ImageKit / SMTP (env-driven)
```

### Separation of concerns

- **Presentation**: `apps/*-ui` — pages, widgets, hooks, minimal transport (axios/fetch + React Query).  
- **Edge / routing**: `apps/api-gateway` — **no business domain**; **policy** (limits, paths) and **reverse proxy** only.  
- **Domain services**: `apps/*-service` — HTTP handlers, Prisma usage, integrations.  
- **Shared kernel**: `packages/*` — DB client, Redis, ImageKit, Kafka factory, middleware, error handler, shared React components.

### Why a gateway layer

- **One browser origin story**: frontends target a **single base URL** (`NEXT_PUBLIC_SERVER_URL` / `NEXT_PUBLIC_SERVER_URI`) while the gateway fans out to services.  
- **Operational knobs**: different **rate limits** for dashboards vs public API traffic (`apps/api-gateway/src/main.ts`).  
- **Clear extension point**: new routes are **one proxy line** away.

---

## 5. Project structure

```
Bingo-The-Awaken/
├── .github/workflows/ci.yml
├── apps/
│   ├── admin-service/          # Admin REST API
│   ├── admin-ui/               # Next.js admin app
│   ├── api-gateway/            # Express proxy + rate limits
│   ├── api-gateway-e2e/
│   ├── auth-service/           # Auth + Swagger UI
│   ├── auth-service-e2e/
│   ├── blog-service/
│   ├── chatting-service/
│   ├── kafka-service/
│   ├── kafka-service-e2e/
│   ├── logger-service/
│   ├── order-service/
│   ├── order-service-e2e/
│   ├── product-service/
│   ├── product-service-e2e/
│   ├── recommendation-service/
│   ├── seller-service/
│   ├── seller-ui/
│   └── user-ui/
├── packages/
│   ├── components/             # Shared React UI
│   ├── error-handler/
│   ├── libs/                   # prisma, redis, imagekit
│   ├── middleware/
│   └── utils/                  # kafka client, logging helpers
├── prisma/schema.prisma
├── nx.json
├── package.json                # Root deps + scripts
├── jest.config.ts
├── tsconfig.base.json          # @packages/* paths
└── PLATFORM_DOCUMENTATION.md
```

---

## 6. Data flow

**Typical request path**

1. **Browser** calls `https://your-gateway/...` (locally `http://localhost:8080`).  
2. **Gateway** matches path prefix (`/product`, `/order`, `/admin`, `/blogs`, `/recommendation`, `/chatting`, or default `/` → auth) and forwards to the **correct localhost port**.  
3. **Service** validates cookies/JWT (shared middleware uses `ACCESS_TOKEN_SECRET`), runs **Prisma** queries or calls **Stripe / ImageKit / Redis / Kafka** as needed.  
4. **Response** returns through the gateway to the UI; **React Query** caches or invalidates on the client; **Zustand** holds session/UI flags where used.

**Event path (analytics)**

1. Producers publish to Kafka (client configured in `packages/utils/kafka/index.ts` with SASL env credentials).  
2. **`kafka-service`** subscribes to `users-events`, batches work, and invokes analytics updaters for shops and users.

---

## 7. UI / UX & platform quality

- **Dashboard UX**: Seller and admin surfaces use charts (e.g. **Nivo** in dependencies), tables, and filters—aimed at **operators and sellers**, not only end-customers.  
- **Resilience at the edge**: Rate limit responses include structured JSON, **Retry-After**, and standard rate-limit headers for well-behaved clients.  
- **Developer experience**: Nx graph, workspace-wide TypeScript strictness flags in `tsconfig.base.json`, and Swagger for **auth** and **product** services reduce onboarding friction.  
- **Payments UX**: Checkout integrates **Stripe.js** on the customer app via `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`.

---

## 8. Installation & running locally

### Prerequisites

- **Node.js 20** (matches [`.github/workflows/ci.yml`](.github/workflows/ci.yml))  
- **npm** + [`package-lock.json`](package-lock.json)  
- **MongoDB** URI for Prisma  
- For full features: **Redis**, **Kafka** credentials, **Stripe**, **ImageKit**, **SMTP** (or Gmail variables where used)

### Setup

```bash
cd "h:\Ang Project\Bingo-The-Awaken"   # or your clone path
npm ci --legacy-peer-deps
npx prisma generate
```

### Run services

Default **service ports** are documented in each `main.ts` and wired in [`apps/api-gateway/src/main.ts`](apps/api-gateway/src/main.ts) (e.g. gateway **8080**, auth **6001**, product **6002**, seller **6003**, order **6004**, admin **6005**, chatting **6006**, recommendation **6007**, logger **6008**, blog **6009**).

Root [`package.json`](package.json) scripts include:

| Script | Role |
|--------|------|
| `npm run dev` | `nx run-many --target=serve --all` |
| `npm run dev:all` | `concurrently` auth-service + api-gateway |
| `npm run user-ui` / `seller-ui` / `admin-ui` | Nx `dev` for that Next app |
| `npm run auth-docs` / `product-docs` | Regenerate Swagger JSON |

Examples:

```bash
npx nx serve api-gateway
npx nx serve auth-service
npx nx dev user-ui
npx nx build user-ui
```

**CORS** on the gateway allows `http://localhost:3000`–`3003` for local multi-app development.

An [`apps/auth-service/Dockerfile`](apps/auth-service/Dockerfile) exists; there is **no** root `docker-compose` in this repo.

---

## 9. Environment configuration

**Do not commit secrets.** Variables are discovered from source; set them locally or in your deploy platform.

### Backend (many services load repo-root `.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MongoDB connection for Prisma |
| `PORT` | Override per-service listen port |
| `NODE_ENV` | e.g. development error payloads in some controllers |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | JWT signing and middleware verification |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe server + webhooks |
| `SMTP_*` / `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Email sending paths |
| `IMAGEKIT_*` / `IMAGEKIT_URL_ENDPOINT` | Media uploads |
| `REDIS_DATABASE_URL` | Redis (`redis://` or `rediss://`) |
| `KAFKA_API_KEY` / `KAFKA_API_SECRET` | Kafka SASL |
| `FRONTEND_URL`, `USER_UI_URL` | Links inside emails |
| `ORDER_SERVICE_URL`, `USER_SERVICE_URL` | Admin-service dashboard HTTP clients (defaults in code may not match your local ports—configure explicitly) |
| `NEXT_PUBLIC_SERVER_URL` | Also read in **order-service** abandoned-cart email templates |

**Not every entrypoint calls `dotenv` on the repo-root file**—`api-gateway`, `kafka-service`, and `recommendation-service` rely on **`process.env` from the shell** unless your runner injects a file. `chatting-service` uses `dotenv.config()` without a custom path (cwd-dependent). Services like **auth**, **product**, **order**, **seller**, **admin**, **blog**, and **logger** resolve **`../../../.env`** from `apps/<name>/src`.

### Next.js apps (`apps/user-ui`, `seller-ui`, `admin-ui`)

Examples: `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_SERVER_URI`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `NEXT_PUBLIC_CHATTING_wEBSOCKET_URI` (spelling as in code), `NEXT_PUBLIC_SOCKET_URI`, `NEXT_PUBLIC_USER_UI_LINK`, `NEXT_PUBLIC_USE_UI_LINK`, `NEXT_PUBLIC_SELLER_SERVER_URI`.

### E2E

Jest e2e helpers use `HOST` / `PORT` under `apps/*-e2e/src/support/`.

---

## 10. Testing & CI

- **Local**: `npx nx run-many -t test` or project-scoped `npx nx test <project>`.  
- **CI**: On `master` and PRs, [`npm ci --legacy-peer-deps`](.github/workflows/ci.yml) then **`npx nx affected -t lint test build`**.

---

## 11. Future improvements

Grounded suggestions from repository shape—not a roadmap promise:

- **Align admin-service default upstream URLs** (`ORDER_SERVICE_URL` / `USER_SERVICE_URL` defaults in `apps/admin-service/src/utils/dashboardData.ts`) with **actual** local gateway/service ports to reduce “works on my machine” friction.  
- **Externalize Kafka broker configuration** (currently hardcoded broker host in `packages/utils/kafka/index.ts`) so environments don’t require code changes.  
- **Normalize public env names** (`NEXT_PUBLIC_USE_UI_LINK` vs `NEXT_PUBLIC_USER_UI_LINK`, `NEXT_PUBLIC_SERVER_URL` vs `NEXT_PUBLIC_SERVER_URI`) behind a single config module per app.  
- **Expand automated tests** beyond current Jest layout (e2e coverage, contract tests for gateway routing).  
- **Optional**: root `docker-compose` for one-command local infra (MongoDB, Redis, etc.)—not present today.

---

## 12. Developer notes

- **Monorepo imports**: use `@packages/...` per [`tsconfig.base.json`](tsconfig.base.json).  
- **Prisma**: run `npx prisma generate` after schema changes.  
- **Swagger regeneration**: `npm run auth-docs` / `npm run product-docs` before shipping route changes that must appear in docs.  
- **Always install before Nx CLI**: `npx nx` without `node_modules` may download a **different** global Nx major than the workspace pins—use **`npm ci`** first, then **`npx nx`** from the repo root.

---

## 13. What makes this project stand out

- **True full-stack scope** in one repo: **three** production-style frontends **and** **many** cooperating backends—not a demo-only API or a UI-only spike.  
- **Gateway-first operations**: tiered **rate limiting**, structured **429** responses, and clear **path-based routing** to microservices.  
- **Rich domain model** in **Prisma** (orders, shops, messaging, blogs, analytics, abandoned carts, sliders—see `prisma/schema.prisma`).  
- **Modern client stack**: **React 19**, **Next.js 15**, **TanStack Query**, and **Zustand** working together for scalable UI state.  
- **Real integrations**: **Stripe**, **ImageKit**, **Kafka**, **Redis**, **TensorFlow.js** recommendations—dependencies are not decorative; they appear in service code.  
- **Documentation**: Swagger on **auth** and **product** services plus this README and **`PLATFORM_DOCUMENTATION.md`**.

---

## 14. Contributing & license

Contributions: fork → branch from **`master`** → `npm ci --legacy-peer-deps` → `npx prisma generate` when needed → **`npx nx affected -t lint test build`** → PR with behavior and env-variable notes.

**License: MIT** — see [`package.json`](package.json) `license` field.

---

## 15. For recruiters & reviewers

Suggested reading order (all paths real):

| Priority | Path | Why |
|----------|------|-----|
| 1 | [`apps/api-gateway/src/main.ts`](apps/api-gateway/src/main.ts) | Routing map + rate-limit design + CORS policy |
| 2 | [`prisma/schema.prisma`](prisma/schema.prisma) | Domain breadth and data modeling |
| 3 | [`apps/auth-service/src/controller/auth.controller.ts`](apps/auth-service/src/controller/auth.controller.ts) | Auth, Stripe, and ImageKit touchpoints |
| 4 | [`apps/order-service/src/controllers/order.controller.ts`](apps/order-service/src/controllers/order.controller.ts) | Payments and webhooks |
| 5 | [`apps/user-ui/src/app/providers.tsx`](apps/user-ui/src/app/providers.tsx) + [`apps/user-ui/src/store/authStore.ts`](apps/user-ui/src/store/authStore.ts) | React Query + Zustand client composition |
| 6 | [`apps/kafka-service/src/main.ts`](apps/kafka-service/src/main.ts) + [`packages/utils/kafka/index.ts`](packages/utils/kafka/index.ts) | Event-driven analytics path |
| 7 | [`PLATFORM_DOCUMENTATION.md`](PLATFORM_DOCUMENTATION.md) | Product story and feature deep-dive |

**Repository:** [github.com/Zeyusss/Bingo-The-Awaken](https://github.com/Zeyusss/Bingo-The-Awaken)

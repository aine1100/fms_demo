# Fire Management System (FMS)

This repository is a microservice-based Fire Management System built with TypeScript, Express, Drizzle ORM, and a Next.js frontend.

## Repository layout

- `api-gateway/` - HTTP gateway that proxies requests to individual microservices.
- `packages/database/` - shared database schema and connection code using Drizzle.
- `shared/` - shared middleware, types, and utilities used across services.
- `services/` - microservices:
  - `auth`
  - `customer`
  - `extinguisher`
  - `notification`
  - `payment`
  - `inspection`
  - `rules`
- `view/` - Next.js frontend.

## Prerequisites

- Node.js 18+ / npm 10+
- PostgreSQL database
- Optional: Redis if you want to use the shared Redis utility.

## Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Update `.env` with your database and mail settings.

3. Install dependencies from the repository root:

```bash
npm install
```

## Database

The database package uses `DATABASE_URL` from `.env`.

Available database commands:

```bash
npm run db:push
npm run db:generate
npm run db:migrate
```

## Running services

Each service is run from the root using npm workspaces.

### Start one service

```bash
npm run dev:gateway
npm run dev:auth
npm run dev:customer
npm run dev:extinguisher
npm run dev:notification
npm run dev:payment
npm run dev:inspection
npm run dev:rules
```

### Frontend

```bash
cd view
npm install
npm run dev
```

## Default ports

The gateway and services use the following defaults unless overridden in `.env`:

- API Gateway: `4000`
- Auth: `4001`
- Customer: `4002`
- Extinguisher: `4003`
- Notification: `4004`
- Payment: `4005`
- Inspection: `4006`
- Rules: `4007`

## Environment variables

The root `.env` file is used by:

- `api-gateway`
- all services under `services/`
- the database package
- shared utilities such as auth, email, and Redis

### Frontend service URLs

The Next.js app reads service URLs from `NEXT_PUBLIC_*` variables.

## API documentation

Each service exposes Swagger docs at `/api-docs`.

Example:

- `http://localhost:4001/api-docs` for Auth
- `http://localhost:4002/api-docs` for Customer
- `http://localhost:4003/api-docs` for Extinguisher
- `http://localhost:4004/api-docs` for Notification
- `http://localhost:4005/api-docs` for Payment
- `http://localhost:4006/api-docs` for Inspection
- `http://localhost:4007/api-docs` for Rules

The API gateway exposes the unified HTTP routes:

- `/auth`
- `/customers`
- `/extinguishers`
- `/notifications`
- `/payments`
- `/inspections`
- `/rules`
- `/compliance`

## Notes

- The gateway proxies `/compliance` to the `rules` service.
- Use `JWT_SECRET` and the refresh token settings to secure authentication.
- Mail settings are required if the app needs to send emails.
- Redis is optional, and `REDIS_URL` falls back to `redis://127.0.0.1:7001` if not provided.

# Inventory Management

A learning project combining a React shop interface with an Express API and MongoDB. Users can register, sign in, browse/filter items, and manage their own cart. Signed-in users can also manage the shared catalog through the management screen.

## What problem it explores

Keeping a catalog and a user's selection in persistent storage instead of only in browser state. The frontend sends HTTP requests; Express validates authentication and reads/writes MongoDB through Mongoose models.

## Structure

```text
frontend/                React + Vite application
  src/components/        Login, registration, shop, cart and management views
backend/
  routes/                Authentication and item/cart HTTP handlers
  middleware/            JWT verification
  models/                Mongoose Item and User schemas
  tests/                 Authentication/configuration regression tests
```

## Run locally

Requirements: Node.js 20.13+ (22 recommended), npm, and MongoDB.

1. Start a local MongoDB instance. With Docker: `docker run --name inventory-mongo -p 127.0.0.1:27017:27017 -d mongo:7`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Generate a signing key with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and set `JWT_SECRET` in `.env`. Never commit that file.
4. From the repository root:

```sh
npm ci --prefix backend
npm ci --prefix frontend
```

5. In one terminal: `cd backend` then `npm start` (API port 3000).
6. In another: `cd frontend` then `npm run dev` (open the URL Vite prints, normally http://localhost:5173).
7. Register with a username, email and password of at least 12 characters. Sign in, visit `/Admin` to add sample items, then `/Shop` to browse and use your cart.

Vite proxies `/reg` and `/getitems` to the local API. Production hosting must provide equivalent routing. Use synthetic demo accounts and items only.

## Authentication and API

- `POST /reg/auth/register`: username, email, password.
- `POST /reg/auth/login`: email, password; returns a one-hour JWT.
- Item/cart endpoints under `/getitems` require `Authorization: Bearer <token>`.
- Cart ownership comes from the verified token, not a client-supplied user ID.
- `/getitems/all`, `/filter`, `/cart`, `/addtoDB`, `/editItem`, `/deleteitem`, `/addtoUserCart`, `/removeItemFromCart` support the existing UI.

Passwords are hashed with BCrypt. JWT and database settings come from environment configuration. Existing tokens signed with the previous hard-coded key are intentionally invalid after key replacement.

## Validate

```sh
npm test --prefix backend
npm run build --prefix frontend
```

Tests cover signing-key configuration and authentication middleware: valid, missing, forged, expired and malformed-subject tokens. Route tests also verify cart ownership, rejection of arbitrary deletion filters and safe handling of absent cart items, using database stubs. They do not test MongoDB persistence or the complete UI. Before presenting a release, manually verify registration, login, adding/editing/deleting items, cart add/remove, and filtering against MongoDB.

## Current limitations

This is a demo, not production-ready commerce software. The management screen is named Admin, but there is no administrator role: all signed-in accounts can edit the shared catalog. Add role-based permissions, rate limits, database-backed tests, browser tests and a secure deployment configuration before public hosting. The browser stores tokens in localStorage; reassess session handling for production. Historical commits may contain old configuration; rotate any previously used credentials separately.

Screenshots and a short demo recording can be added after a complete database-backed walkthrough. No screenshots or claims of deployment are fabricated.

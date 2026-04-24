# Fenmo Expense Tracker

A production-ready full-stack Expense Tracker built for robustness under real-world network conditions.

## Key Design Decisions
- **Idempotency Strategy For Resilience**: We handle flaky networks and double-clicks by letting the frontend assign a UUID `idempotencyKey` per form-render. The backend strictly prevents duplicates on this key allowing safe generic retries and `POST` idempotence.
- **Relational Integrity**: PostgreSQL orchestrated by Prisma ensures atomicity and explicit table relationships between `User`, `Expense`, and `Category`. Seeders automatically bootstrap the initial dynamic categories for you.
- **Redux Thunk & Vite**: RTK (`Redux Toolkit`) slices naturally integrate our business state safely and the Thunk lifecycle handles Loading and Error boolean states directly attached to the forms globally.
- **Dynamic Theming with Material UI**: Implemented a responsive Dark UI theme designed to provide a premium and professional finish natively.

## Trade-offs Made (Timebox)
- Custom pagination was skipped for now; `fetchExpenses` returns all expenses of a user, relying on frontend CSS to scale until datasets grow heavily.
- Granular tests setup (Jest/Cypress) are currently omitted due to the condensed timeline, replaced by strong Zod Type-Safe payload contracts natively acting as structural integration boundaries.

## Intentionally Excluded
- Password reset and email confirmation flows are not built.
- We did not utilize RTK Query, as redux-thunk was chosen per specific constraints which provided adequate and precise architectural flexibility for this exact layout model.
- Redux slices do not persist across refreshes via Redux-Persist. Token storage is standard `localStorage` relying on manual slice bootstrap logic.

## How to Start Locally

Make sure you have Docker running locally.

### 1. Database
```bash
docker compose up -d
```

### 2. Backend Environment Verification
Ensure there is a `.env` file present within `/backend`. It explicitly leverages the following (dynamically configured earlier):
```bash
DATABASE_URL="postgresql://fenmo:fenmopassword@localhost:5433/fenmodb?schema=public"
JWT_SECRET="supers3cr3t-fenmo-key-in-prod-should-be-random"
PORT=4000
```

### 3. Backend Execution
Open a terminal inside `/backend`:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
### 4. Viewing the Database (Prisma Studio)
To visually inspect and manage your database GUI provided natively by Prisma, open a terminal in the `/backend` directory and run:
```bash
npx prisma studio
```
It will open the graphical interface at `http://localhost:5555`.

### 5. Frontend Environment Verification
Ensure there is a `.env` file present within `/frontend`. It sets up connection routing:
```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

### 5. Frontend Execution
Open another terminal inside `/frontend`:
```bash
npm install
npm run dev
```

Browse to `http://localhost:5173`. Register an account, log in, and track your expenses!

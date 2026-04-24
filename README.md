# Fenmo Expense Tracker

A production-ready full-stack Expense Tracker built for robustness under real-world network conditions. This project fulfills the requirements of the full-stack assignment.

##  Git repository
- **Repository:** [https://github.com/Keshavsaini22/fenmo-assignment](https://github.com/Keshavsaini22/fenmo-assignment)

##  Live Demo
- **Frontend:** [https://fenmo-assignment-kri8.vercel.app/](https://fenmo-assignment-kri8.vercel.app/)
- **Backend API:** [https://fenmo-assignment-azure.vercel.app/](https://fenmo-assignment-azure.vercel.app/)

##  Key Features
- **Accurate Expense Recording:** Capture amount, category, description, and date.
- **Data Integrity:** Strict usage of `Decimal(10, 2)` for financial accuracy.
- **Resilient Postings:** Built-in idempotency to prevent duplicate entries during network retries.
- **Infinite Scrolling:** Server-side offset pagination for smooth list browsing.
- **Dynamic Filtering & Sorting:** Real-time filtering by category and chronological sorting.
- **Visual Analytics:** Total visible expenses counter with smooth transitions.
- **Secure Authentication:** JWT-based user isolation and session management.

## 🛠 Tech Stack
- **Frontend:** React, Redux Toolkit, Material UI, Vite
- **Backend:** Node.js, Express, Prisma ORM, Zod, JWT
- **Database:** PostgreSQL (Aiven for production, Docker for local)
- **Testing:** Jest, AAA Pattern Unit Tests

##  Key Design Decisions
- **Idempotency Strategy**: We handle flaky networks and double-clicks by letting the frontend assign a UUID `idempotencyKey` per form-render. The backend strictly prevents duplicates on this key, allowing safe generic retries and `POST` idempotence.
- **Relational Persistence (PostgreSQL)**: Chosen over NoSQL or in-memory stores to guarantee ACID compliance and relational integrity for financial data. Prisma provides excellent type-safety and developer experience.
- **State Management**: Redux Toolkit was chosen for its robust handling of asynchronous state (Thunks) and centralized business logic, which is essential for a data-heavy dashboard.
- **Production Hardening:** Strictly enforced Zod schemas on both frontend and backend to act as a double-layer of structural validation.

##  Trade-offs & Current Scope
- **Pagination Strategy**: Implemented offset-based pagination (`skip`/`take`) which is highly performant for standard datasets but may require cursor-based pagination for millions of rows.
- **Testing Coverage**: Focused on core business logic (Controllers) and data correctness through Unit Tests following the AAA (Arrange-Act-Assert) pattern. Full E2E coverage was omitted in favor of manual end-to-end verification.
- **Auth Scope**: Focused on robust Register/Login/Session flows. Features like "Forgot Password" or 2FA were omitted to prioritize core transaction reliability.

##  How to Start Locally

### 1. Database Setup
Make sure you have Docker running.
```bash
docker compose up -d
```

### 2. Backend Setup
1. Enter the directory: `cd backend`
2. Configure `.env`:
   ```bash
   DATABASE_URL="postgresql://fenmo:fenmopassword@localhost:5433/fenmodb?schema=public"
   JWT_SECRET="development-secret"
   PORT=4000
   ```
3. Run initialization:
   ```bash
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

### 3. Frontend Setup
1. Enter the directory: `cd frontend`
2. Configure `.env.local`:
   ```bash
   VITE_API_BASE_URL=http://localhost:4000/api
   ```
3. Start the UI:
   ```bash
   npm install
   npm run dev
   ```

##  Running Tests
```bash
cd backend
npm test
```

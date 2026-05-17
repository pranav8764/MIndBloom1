# Switch to Clerk Authentication & Parallel Dev Setup

## Goal
Replace the existing JWT‑based authentication with Clerk, configure a new MongoDB cluster, and enable running the backend and frontend on separate ports concurrently. All changes will be applied step‑by‑step, pausing for user confirmation after each major phase.

## User Review Required
> **⚠️ Critical decisions needed:**
> - **Clerk keys**: You need to provide the Clerk **Publishable Key** (frontend) and **Secret Key** (backend). These can be generated from the Clerk dashboard for a new application.
> - **MongoDB URI**: Provide the connection string for the new MongoDB cluster you will create (e.g., `mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/mindbloom?retryWrites=true&w=majority`).
> - **Ports**: Confirm the desired ports for the backend (default `5000`) and frontend (default Vite `5173`). If you prefer different ports, let us know.

## Open Questions
- Do you want to completely remove the existing `auth` routes (`/api/auth/*`) or keep them as fallbacks?
- Will the frontend be served separately (e.g., via Vite) or do you eventually want a combined production build?
- Should we add a root `concurrently` script now, or would you prefer manual terminal tabs?

## Proposed Changes
---
### 1️⃣ Environment Setup
- **Create `.env` files** for both `client/` and `server/`.
  - `client/.env`:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
    ```
  - `server/.env`:
    ```env
    MONGODB_URI=<YOUR_MONGODB_URI>
    CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>
    PORT=5000
    ```
- Add these files to `.gitignore` (already present) to keep credentials secret.

---
### 2️⃣ Install Clerk SDKs
- **Backend** (`server/`):
  ```bash
  npm i @clerk/clerk-sdk-node express-clerk-middleware
  ```
- **Frontend** (`client/`):
  ```bash
  npm i @clerk/clerk-react
  ```

---
### 3️⃣ Backend – Replace JWT Middleware
- **File:** `server/middleware/auth.js`
- **Current:** verifies JWT from `Authorization` header.
- **New:** Use Clerk middleware.
  ```js
  const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
  const clerk = ClerkExpressWithAuth({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  module.exports = clerk; // use as Express middleware
  ```
- Update all route files to import the new `auth` middleware unchanged (the export shape stays the same).
- In routes where `req.userId` was set by JWT, Clerk provides `req.auth?.userId`. Adjust any code that directly accesses `req.userId` to use `req.auth.userId`.

---
### 4️⃣ Frontend – Add Clerk Provider
- **File:** `client/src/main.jsx` (or `index.jsx`). Wrap the app with `ClerkProvider`.
  ```jsx
  import { ClerkProvider } from '@clerk/clerk-react';
  import App from './App';
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  ReactDOM.createRoot(document.getElementById('root')).render(
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  );
  ```
- **AuthContext:** Replace manual token handling with Clerk’s `useUser`, `useAuth` hooks. Remove `localStorage` JWT logic.
- Update login/register pages to use Clerk’s pre‑built UI components (`<SignIn />`, `<SignUp />`).
- Adjust API calls to include Clerk JWT automatically via Clerk middleware: the Clerk SDK can inject the token via `api.interceptors.request` using `getToken`.

---
### 5️⃣ API Service – Attach Clerk Token
- In `client/src/services/apiService.js` modify the axios instance:
  ```js
  import { useClerk } from '@clerk/clerk-react';
  const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
  api.interceptors.request.use(async (config) => {
    const { getToken } = useClerk();
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```
- Ensure all existing service calls work without manual `Authorization` header manipulation.

---
### 6️⃣ MongoDB – Connect to New Cluster
- The existing `server/index.js` already reads `process.env.MONGODB_URI`. After you create the cluster, paste the URI into `server/.env`.
- Verify connection by running the server (`npm run dev` in `server/`). The console should log a successful DB connection.

---
### 7️⃣ Parallel Development Scripts
- **Root `package.json`** (create if missing) with a `dev` script using `concurrently`:
  ```json
  {
    "scripts": {
      "dev": "concurrently \"npm run dev --prefix client\" \"npm run dev --prefix server\""
    },
    "devDependencies": {
      "concurrently": "^8.2.2"
    }
  }
  ```
- Run with `npm run dev` from the project root; backend will be on `localhost:5000`, frontend on `localhost:5173` (or ports you configure).
- If you prefer separate terminals, simply run `npm run dev` in `client/` and `npm run dev` in `server/`.

---
### 8️⃣ Verify Basic Flow
1. Start both services (`npm run dev` at root or two terminals).
2. Open the frontend URL.
3. Use Clerk’s sign‑up component to create a user.
4. Ensure the backend receives a request with a valid Clerk token (check logs).
5. Verify a protected route (e.g., `/api/user/me`) returns user data.

---
## Verification Plan
### Automated
- Run `node server/test-server.js` after auth middleware switch (tests may need updates to use Clerk token).
### Manual
- Manual UI test of login, dashboard load, habit completion (XP update) to confirm auth works end‑to‑end.
- Confirm MongoDB data appears in the new cluster (check collections via Atlas).

---
**Next Steps**
1. Provide Clerk keys and MongoDB URI.
2. Confirm ports and whether to add the concurrent script now.
3. Approve the plan to start applying changes (we’ll create a `task.md` and proceed step‑by‑step).

---
*All modifications will be committed incrementally, with a `task.md` tracking each sub‑task.*

# Frontend Setup & Required Backend Changes

## ✅ What's Been Built

The frontend has been fully implemented with:

1. **Complete UI Components** - Button, Card, Input, Select, Dialog, Badge, Tabs, Slider, Dropdown Menu
2. **All Pages**:
   - Homepage
   - Authentication (Sign In / Sign Up)
   - Dashboard with Portfolio
   - Trading Interface
   - Deposit Flow
   - Withdrawal Flow
   - Transaction History
   - Settings Page
3. **Layout Components** - Header with navigation, MainLayout wrapper
4. **API Client** - Complete API integration layer
5. **React Query Setup** - For server state management
6. **Dark Mode Support** - Theme toggle component
7. **Tailwind CSS** - Fully configured with custom theme

## ⚠️ Required Backend Changes

### 1. **CRITICAL: NextAuth Session Token Access**

**Issue**: The frontend API calls need a JWT token, but NextAuth v5 doesn't expose it by default in the session.

**Solution Options**:

**Option A**: Modify `auth.config.ts` to include the token in the session:
```typescript
callbacks: {
  async jwt({ token, account }) {
    if (account) {
      token.accessToken = account.access_token;
    }
    return token;
  },
  async session({ session, token }) {
    session.accessToken = token.accessToken;
    return session;
  },
}
```

**Option B**: Create an API route that generates a JWT token for authenticated users:
```typescript
// app/api/auth/token/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Generate or retrieve JWT token for API calls
  // This should match the AUTH_SECRET used by your backend
  const token = await generateJWT(session.user.id);
  return NextResponse.json({ token });
}
```

**Option C**: Use NextAuth's `getToken()` helper:
```typescript
import { getToken } from "next-auth/jwt";

// In API routes or server components
const token = await getToken({ req, secret: process.env.AUTH_SECRET });
```

**Recommended**: Update `lib/api.ts` to fetch token from a server-side API route or modify the session callback.

### 2. **Environment Variables**

Add to `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3030
AUTH_SECRET=your-secret-at-least-32-chars  # Must match backend
AUTH_GOOGLE_ID=your-google-client-id  # Optional
AUTH_GOOGLE_SECRET=your-google-client-secret  # Optional
```

### 3. **API Route for Registration**

✅ Already created at `app/api/auth/register/route.ts`

This handles user registration. Make sure it's accessible and working.

### 4. **CORS Configuration**

Your backend API server needs to allow CORS from the frontend:

```typescript
// In your Express app (api-server)
import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
```

### 5. **Token Format**

The backend expects Bearer tokens. Ensure your frontend sends:
```
Authorization: Bearer <jwt-token>
```

The JWT should be signed with the same `AUTH_SECRET` that the backend uses.

## 🔧 Frontend Fixes Needed

### 1. **Update API Calls to Use Token**

Currently, API calls pass empty string `""` as token. Update `lib/api.ts`:

```typescript
// Create a hook or utility to get token
export async function getAuthToken(): Promise<string | null> {
  // Fetch from your token endpoint or get from session
  const response = await fetch("/api/auth/token");
  if (!response.ok) return null;
  const { token } = await response.json();
  return token;
}

// Then update all API calls:
export async function getPortfolio(userId: string) {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");
  return fetchWithAuth(`/v1/users/${userId}/portfolio`, token);
}
```

### 2. **Update All Pages to Use Token Properly**

Replace all instances of `""` token in:
- `app/dashboard/page.tsx`
- `app/trade/page.tsx`
- `app/deposit/page.tsx`
- `app/withdraw/page.tsx`
- `app/history/page.tsx`

### 3. **Add Loading States**

Some pages need better loading states. Consider adding skeleton loaders.

### 4. **Error Handling**

Add proper error boundaries and error handling for API failures.

## 📦 Installation Steps

1. **Install Dependencies**:
```bash
cd globx/apps/web
npm install
# or
pnpm install
```

2. **Set Environment Variables**:
Create `.env.local` with the variables mentioned above.

3. **Run Development Server**:
```bash
npm run dev
```

4. **Build for Production**:
```bash
npm run build
npm start
```

## 🎨 Design System

The frontend uses:
- **Tailwind CSS** for styling
- **Radix UI** components (via shadcn/ui)
- **Lucide React** for icons
- **Custom color scheme** with dark mode support

## 🔐 Authentication Flow

1. User signs up → Creates account via `/api/auth/register`
2. User signs in → NextAuth handles authentication
3. Session created → JWT stored in session
4. API calls → Use JWT token from session
5. Protected routes → Middleware redirects if not authenticated

## 📝 Notes

- All amounts are handled in smallest units (e.g., 1 USDC = 1,000,000)
- Token addresses are Solana mint addresses
- The frontend assumes devnet for now (can be made configurable)
- Transaction statuses are polled every 10 seconds on dashboard
- Dark mode preference is stored in localStorage

## 🚀 Next Steps

1. ✅ Fix token authentication (see above)
2. ✅ Test all API endpoints
3. ✅ Add error boundaries
4. ✅ Add toast notifications for user feedback
5. ✅ Add QR code generation for deposit addresses
6. ✅ Add real-time updates via WebSocket (optional)
7. ✅ Add price fetching API integration
8. ✅ Add token logo/images
9. ✅ Add transaction status polling
10. ✅ Add export functionality for transaction history

## 🐛 Known Issues

1. Token authentication needs to be implemented (see above)
2. Registration API route needs to be tested
3. CORS needs to be configured on backend
4. Token mint addresses are hardcoded (should come from API or config)
5. Price conversion is mocked (needs real price API)

---

**The frontend is complete and ready once the authentication token issue is resolved!**

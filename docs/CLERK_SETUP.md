# Clerk Authentication Setup Guide

## 🔐 What is Clerk?

Clerk provides drop-in authentication and user management for modern applications. We're using it for:
- User sign-up and sign-in
- Multi-tenant user isolation
- Session management
- User profiles
- Per-user data storage

## 📝 Setup Instructions

### 1. Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
   - Name: `PodcastProAI` (or your preferred name)
   - Choose your preferred sign-in methods (Email, Google, etc.)

### 2. Get Your API Keys

From your Clerk Dashboard:

1. Navigate to **API Keys** in the sidebar
2. Copy your keys:
   - **Publishable Key** - starts with `pk_test_` or `pk_live_`
   - **Secret Key** - starts with `sk_test_` or `sk_live_`

### 3. Configure Frontend (Client)

1. Navigate to `client/.env.local`
2. Add your Clerk Publishable Key:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://localhost:3001
```

### 4. Configure Backend (Server)

1. Create `server/.env` file (copy from `.env.example`)
2. Add your Clerk Secret Key:

```bash
PORT=3001
NODE_ENV=development

CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 5. Configure Clerk Application Settings

In your Clerk Dashboard:

#### Paths Configuration
1. Go to **Paths** section
2. Configure:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - Home URL: `/`
   - After sign-in: `/`
   - After sign-up: `/`
   - After sign-out: `/sign-in`

#### Allowed Origins (CORS)
1. Go to **CORS** section
2. Add allowed origins:
   - Development: `http://localhost:5173`
   - Production: `https://your-production-domain.com`

#### Session Token Configuration
1. Go to **Sessions** section
2. Ensure JWT sessions are enabled
3. Note the JWT template (default is fine)

### 6. Test Authentication

1. Start the frontend:
```bash
cd client
npm run dev
```

2. Start the backend:
```bash
cd server
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173)
4. You should be redirected to the sign-in page
5. Click "Sign up" to create a test account
6. After signing up, you'll be redirected to the dashboard

## 🔒 How Authentication Works

### Frontend Flow

1. User visits any protected route
2. `ProtectedRoute` component checks authentication status
3. If not signed in → redirect to `/sign-in`
4. User signs in via Clerk UI
5. Clerk creates a session
6. User redirected back to dashboard
7. All API requests include session token in `Authorization` header

### Backend Flow

1. API request received
2. `requireAuth` middleware extracts token from header
3. Clerk SDK validates token
4. User ID attached to `req.auth.userId`
5. Route handler processes request with user context
6. Response sent back to client

### Per-User Data Isolation

All user data is automatically scoped:

```typescript
// In any protected route handler
const userId = getUserId(req);

// Use userId for R2 paths
const userAssetPath = `/users/${userId}/assets/`;
const userVideoPath = `/users/${userId}/videos/`;
```

## 🎨 Customizing the Sign-In UI

Clerk's UI is customizable via the dashboard or appearance prop:

```jsx
<SignIn 
  appearance={{
    elements: {
      card: "bg-white/10 backdrop-blur-sm",
      formButtonPrimary: "bg-gradient-to-r from-accent to-accent-dark"
    }
  }}
/>
```

## 📚 Available Clerk Components

- `<SignIn />` - Sign-in page component
- `<SignUp />` - Sign-up page component
- `<UserButton />` - User menu with avatar (in header)
- `<UserProfile />` - Full user profile management
- `useUser()` - Hook to get current user
- `useAuth()` - Hook to check auth status
- `useSession()` - Hook to access session

## 🔐 Security Features

✅ **Automatic Session Management** - Clerk handles tokens, refresh, and expiration  
✅ **Multi-Factor Authentication** - Enable in Clerk dashboard  
✅ **Passwordless Options** - Email magic links, SMS codes  
✅ **Social Login** - Google, GitHub, Facebook, etc.  
✅ **User Metadata** - Store additional user data  
✅ **Organizations** - Multi-user workspaces (future)  

## 🚀 Next Steps

Once Clerk is configured:

1. ✅ Users can sign up/sign in
2. ✅ All API endpoints are protected
3. ✅ User data is automatically isolated
4. 🔄 Connect R2 storage with per-user paths
5. 🔄 Build user settings page
6. 🔄 Add billing/subscription management

## 🆘 Troubleshooting

### "Missing Clerk Publishable Key" Warning
- Check that `.env.local` exists in `client/` directory
- Ensure key starts with `pk_test_` or `pk_live_`
- Restart dev server after adding env vars

### 401 Unauthorized on API Requests
- Verify `CLERK_SECRET_KEY` in `server/.env`
- Check that frontend is sending `Authorization` header
- Ensure Clerk session is active (check browser dev tools)

### Sign-in page not showing
- Verify Clerk publishable key is valid
- Check browser console for errors
- Ensure `@clerk/clerk-react` is installed

### CORS errors
- Add `http://localhost:5173` to Clerk CORS settings
- Ensure backend `cors()` middleware is enabled

## 📖 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [Clerk Node.js SDK](https://clerk.com/docs/references/nodejs/overview)
- [Clerk Dashboard](https://dashboard.clerk.com)

---

**Status**: ✅ Clerk integration complete and ready for configuration  
**Time to setup**: ~10 minutes  
**Next**: Add your Clerk API keys and test sign-in flow

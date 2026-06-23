# Auth providers

## Google

### 1. Google Cloud Console (one-time)

1. Open https://console.cloud.google.com/apis/credentials
2. Create a project (or pick the existing one) → **Create credentials → OAuth client ID**
3. Application type: **Web application**
4. Authorized JavaScript origins:
   - `https://tyqygzfodwczewacch.supabase.co`
   - `http://localhost:3000` (for dev)
5. Authorized redirect URIs:
   - `https://tyqygzfodwczewacch.supabase.co/auth/v1/callback`
6. Copy the **Client ID** and **Client Secret**.

### 2. Supabase dashboard

1. Open https://supabase.com/dashboard/project/tyqygzfodwczewacch/auth/providers
2. Find **Google** in the providers list → toggle on
3. Paste **Client ID** and **Client Secret** from step 1
4. Click **Save**

### 3. Verify

The button on `/auth/sign-in` and `/auth/sign-up` should now bounce through Google's consent screen and land back at `/auth/callback`, which exchanges the code and redirects to `/dashboard` (or whatever was passed in `?next=`).

## Adding more providers (GitHub, Apple, etc.)

The pattern is the same — enable in the Supabase dashboard, plug in OAuth credentials, add a button calling `signInWithOAuth({ provider: '<name>' })` in `src/app/auth/oauth-buttons.tsx`. The OAuth button is a thin wrapper; the same `signInWithGoogle` server action in `src/app/auth/actions.ts` is the template to copy.

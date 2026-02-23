# GlobX Mobile (React Native / Expo)

React Native version of the GlobX web app. Uses the same backend API and the Next.js web app for auth (login/register).

## Setup

1. **Environment**
   - Create `.env` in `apps/mobile/` (or set in app config):
     - `EXPO_PUBLIC_API_URL` – backend API base (e.g. `http://localhost:3030`)
     - `EXPO_PUBLIC_AUTH_URL` – Next.js web app base for auth (e.g. `http://localhost:3000` or your machine IP for device)
   - For a physical device, use your machine’s LAN IP instead of `localhost` (e.g. `http://192.168.1.10:3000`).

2. **Run**
   - From repo root: `pnpm --filter mobile start`
   - Or: `cd apps/mobile && pnpm start`
   - Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

## Auth

- Sign In / Sign Up use the web app’s `/api/auth/login` and `/api/auth/register`.
- JWT is stored in secure storage and sent as `Authorization: Bearer <token>` to the backend API.

## Screens

- **Home** – landing; Sign In / Create Account.
- **Sign In / Sign Up** – email/password auth.
- **Main (tabs)** – Dashboard, Trade, Markets, More.
- **Deposit, Withdraw, History, Settings** – stack screens (placeholders for full flows).

## Converting from web

This app mirrors the web app’s structure and API. Shared logic lives in `src/lib/` (api, tokens, theme, utils). Screens are implemented with React Native components and StyleSheet; charts and advanced trading UI can be added with libraries like `react-native-charts-wrapper` or `react-native-svg` + custom charts.

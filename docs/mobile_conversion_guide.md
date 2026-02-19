# IHSS Companion — Mobile Conversion Guide

## Overview

This document describes how to convert the IHSS Companion web app into a React Native mobile app using Expo. The backend API is fully shared and requires no changes. Only the frontend layer needs to be replaced with React Native components.

---

## Architecture

```
apps/
  frontend/        ← React (web) — Vite + MUI
  mobile/          ← React Native (future) — Expo + NativeBase/Tamagui
  api/             ← Shared backend — no changes needed
  worker/          ← Shared worker — no changes needed
packages/
  shared-types/    ← Shared TypeScript DTOs — used by both web and mobile
  prompts/         ← Shared AI prompts — used by API only
```

---

## Shared API Client

The `apps/frontend/src/services/apiClient.ts` module uses the browser `fetch` API with `credentials: 'include'` for cookie-based auth. For React Native, replace `fetch` with the same `fetch` (React Native has it built-in), but change cookie handling to use `AsyncStorage` + `Authorization: Bearer` header instead of cookies.

### Web (current)

```typescript
const res = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',          // ← browser cookie
  body: JSON.stringify({ email, password }),
});
```

### React Native (future)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const res = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
  },
  body: JSON.stringify({ email, password }),
});
const { token } = await res.json();
await AsyncStorage.setItem('token', token);
```

**Required API change**: Add a `POST /auth/token` endpoint that returns a JWT in the response body (in addition to the existing cookie-based flow) for mobile clients.

---

## Page-by-Page Conversion Map

| Web Page | React Native Screen | Key Differences |
|---|---|---|
| `Home.tsx` | `HomeScreen.tsx` | Replace MUI with NativeBase/Tamagui components |
| `Login.tsx` | `LoginScreen.tsx` | Use `TextInput` instead of MUI `TextField` |
| `Register.tsx` | `RegisterScreen.tsx` | Same as Login |
| `Dashboard.tsx` | `DashboardScreen.tsx` | Use `FlatList` for nav cards |
| `Shifts.tsx` | `ShiftsScreen.tsx` | Use `ScrollView` + `TouchableOpacity` |
| `Exports.tsx` | `ExportsScreen.tsx` | Use `Accordion` from NativeBase |
| `Incidents.tsx` | `IncidentsScreen.tsx` | Direct conversion |
| `Assistant.tsx` | `AssistantScreen.tsx` | Use `KeyboardAvoidingView` for chat input |
| `Certifications.tsx` | `CertificationsScreen.tsx` | Use `FlatList` for cert cards |
| `NotificationSettings.tsx` | `NotificationSettingsScreen.tsx` | Use `expo-notifications` for push |

---

## Navigation

Replace `react-router-dom` with `@react-navigation/native`:

```typescript
// Web
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');

// React Native
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();
navigation.navigate('Dashboard');
```

The bottom navigation (`BottomNav.tsx`) maps directly to `@react-navigation/bottom-tabs`.

---

## Environment Variables

Replace Vite's `import.meta.env.VITE_API_BASE_URL` with Expo's `Constants.expoConfig.extra.apiBaseUrl`:

```typescript
// Web
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// React Native (Expo)
import Constants from 'expo-constants';
const API_BASE = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:4000';
```

Configure in `app.config.ts`:

```typescript
export default {
  extra: {
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.ihsscareguide.com',
  },
};
```

---

## Recommended Expo Setup

```bash
npx create-expo-app apps/mobile --template expo-template-blank-typescript
cd apps/mobile
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install @react-native-async-storage/async-storage
npx expo install expo-notifications expo-constants
```

---

## Shared Types

The `packages/shared-types/src/index.ts` module is already framework-agnostic TypeScript. Import directly in the mobile app:

```typescript
import type { ShiftDto, IncidentDto, CertificationDto } from '../../packages/shared-types/src';
```

---

## Push Notifications

The worker already sends email reminders for certification expiry. For mobile push notifications, add `expo-notifications` token registration to the mobile onboarding flow and store the token in the `users` table. The worker can then send both email and push notifications.

---

## Production URLs

| Environment | API Base URL |
|---|---|
| Production | `https://api.ihsscareguide.com` |
| Staging | `https://api-staging.ihsscareguide.com` |
| Local | `http://localhost:4000` |

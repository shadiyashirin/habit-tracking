# Habit Tracker Technical Documentation

## Overview

This repository contains a habit tracking system with:

- A Django REST backend in `backend/`
- An Expo React Native mobile client in `habitly-expo/`

There is no separate web frontend directory in the current workspace. The active application surfaces are the REST API and the Expo mobile app.

## Repository Structure

```text
habit-tracker/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── habittracker/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── habits/
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── auth_serializers.py
│   │   ├── auth_views.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── migrations/
│   └── env/
└── habitly-expo/
    ├── app/
    │   ├── _layout.jsx
    │   ├── index.jsx
    │   ├── auth.jsx
    │   └── (tabs)/
    │       ├── _layout.jsx
    │       ├── today.jsx
    │       ├── week.jsx
    │       ├── stats.jsx
    │       └── profile.jsx
    ├── src/
    │   ├── api.js
    │   ├── components/
    │   │   └── AddHabitSheet.jsx
    │   ├── config/
    │   │   └── apiBase.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useHabits.js
    │   ├── theme/
    │   │   └── index.js
    │   └── utils/
    │       └── dates.js
    ├── android/
    ├── app.json
    ├── babel.config.js
    └── package.json
```

## System Architecture

### High-Level Design

- Backend is a monolithic Django application exposing a JSON REST API.
- Mobile app is an Expo Router application with shared state handled through React context and custom hooks.
- Authentication uses JWT access and refresh tokens.
- Persistent server storage uses SQLite.
- Persistent client-side auth state uses AsyncStorage.

### Request Flow

1. User opens the mobile app.
2. `AuthContext.jsx` restores tokens from AsyncStorage.
3. The app requests `GET /api/auth/me/` to validate the session.
4. Feature screens load habit and stats data via `useHabits.js`.
5. `useHabits.js` calls `src/api.js`.
6. `src/api.js` sends authorized requests to the Django API.
7. If an access token expires, the API client attempts `POST /api/auth/refresh/`.
8. Django returns habits, logs, and computed 7-day completion stats.

## Backend

### Backend Stack

- Django `>=4.2,<5.0`
- Django REST Framework `>=3.14`
- `django-cors-headers`
- `djangorestframework-simplejwt`
- SQLite database

### Project Module: `backend/habittracker/`

#### `settings.py`

Responsibilities:

- Global Django configuration
- DRF configuration
- Simple JWT configuration
- CORS settings for development
- Database configuration using SQLite

Notable behavior:

- `ALLOWED_HOSTS = ['*']`
- CORS is permissive in development
- Default DRF permission is authenticated access

#### `urls.py`

Routes:

- `/admin/`
- `/api/` mapped to the `habits` app

### Domain App: `backend/habits/`

#### Data Model

##### `Habit`

Fields:

- `user`: foreign key to Django user
- `name`: habit name
- `color`: UI color token
- `created_at`: creation timestamp

Behavior:

- Ordered by `created_at`
- One user can own many habits

##### `HabitLog`

Fields:

- `habit`: foreign key to `Habit`
- `date`: specific day
- `completed`: boolean check-in state

Behavior:

- Unique on `(habit, date)`
- Ordered by `date`

This gives the backend a simple normalized structure:

```text
User
└── Habit
    └── HabitLog (one row per day per habit)
```

#### Serialization

##### `serializers.py`

- `HabitLogSerializer`
- `HabitSerializer`
- `HabitLogToggleSerializer`

`HabitSerializer` includes nested `logs`, which allows the mobile client to render habit state without extra per-habit requests.

##### `auth_serializers.py`

- `RegisterSerializer`
  - Validates password confirmation
  - Validates unique email
  - Creates Django users with `create_user`
- `UserSerializer`
  - Returns `id`, `username`, `email`

#### Views

##### `views.py`

Main class: `HabitViewSet`

Responsibilities:

- CRUD for habits
- Filter habits by authenticated user
- Filter logs to the last 7 days in the list response
- Toggle completion state for a habit/day
- Compute 7-day stats

Important endpoints:

- `GET /api/habits/`
  - Returns current user's habits
  - Logs are trimmed to the last 7 days

- `POST /api/habits/`
  - Creates a new habit
  - User is assigned automatically in `perform_create`

- `DELETE /api/habits/{id}/`
  - Deletes a habit owned by the current user

- `POST /api/habits/toggle/`
  - Creates or updates a `HabitLog`
  - Expected payload:

```json
{
  "habit_id": 1,
  "date": "2026-03-29",
  "completed": true
}
```

- `GET /api/habits/stats/`
  - Returns a 7-day summary
  - Each day includes:
    - `date`
    - `day_name`
    - `day_num`
    - `month`
    - `total`
    - `completed`
    - `percentage`
    - `is_today`

##### `auth_views.py`

- `RegisterView`
  - Creates a user
  - Returns user payload plus JWT tokens

- `UserProfileView`
  - Returns the authenticated user's profile

#### API Routing

Defined in `backend/habits/urls.py`:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `GET /api/habits/`
- `POST /api/habits/`
- `DELETE /api/habits/{id}/`
- `POST /api/habits/toggle/`
- `GET /api/habits/stats/`

## Mobile App

### Mobile Stack

- Expo SDK 54
- Expo Router
- React 19
- React Native 0.81
- AsyncStorage
- Reanimated
- React Native SVG

### App Shell

#### `app/_layout.jsx`

Responsibilities:

- Wraps the app in `AuthProvider`
- Wraps the app in `SafeAreaProvider`
- Configures root stack navigation
- Controls status bar appearance

Root stack screens:

- `index`
- `auth`
- `(tabs)`

#### `app/(tabs)/_layout.jsx`

Responsibilities:

- Defines bottom tab navigation
- Applies dark/light tab styling

Tabs:

- `today`
- `week`
- `stats`
- `profile`

### Mobile Screens

#### `app/auth.jsx`

Responsibilities:

- Login and registration UI
- Sends user credentials through `AuthContext`

#### `app/(tabs)/today.jsx`

Responsibilities:

- Shows current day summary
- Shows completion progress
- Lists today's habits
- Toggles habit completion
- Opens the add-habit modal

Uses:

- `useHabits()`
- `useAuth()`
- `AddHabitSheet`
- `expo-haptics`

#### `app/(tabs)/week.jsx`

Responsibilities:

- Shows a 7-day grid for habits and check-ins
- Displays recent history in a denser time view

#### `app/(tabs)/stats.jsx`

Responsibilities:

- Shows summary cards
- Renders the daily completion graph
- Shows per-habit weekly breakdown

Current implementation details:

- Uses `react-native-svg`
- Builds graph points from `stats`
- Draws horizontal grid lines and a smoothed progress line
- Displays day labels and percentage values

#### `app/(tabs)/profile.jsx`

Responsibilities:

- User-facing profile/account screen
- Likely includes logout and account summary concerns

### Shared Mobile Modules

#### `src/context/AuthContext.jsx`

Responsibilities:

- Global auth/session state
- Token restore on startup
- Login
- Registration
- Profile fetch
- Refresh-token flow
- Logout

Stored keys:

- `access_token`
- `refresh_token`

#### `src/api.js`

Responsibilities:

- Central HTTP client for authenticated habit operations
- Adds `Authorization: Bearer ...`
- Attempts refresh on `401`
- Replays the failed request after refresh

Exports:

- `fetchHabits`
- `fetchStats`
- `createHabit`
- `deleteHabit`
- `toggleLog`

#### `src/hooks/useHabits.js`

Responsibilities:

- Loads habits and stats together
- Exposes UI-friendly loading/error state
- Implements optimistic updates for toggles and deletes
- Re-syncs stats after mutation
- Calculates streaks on the client

Returned values:

- `habits`
- `stats`
- `loading`
- `error`
- `refreshing`
- `onRefresh`
- `toggle`
- `addHabit`
- `removeHabit`
- `getStreak`

#### `src/config/apiBase.js`

Responsibilities:

- Resolves backend base URL for development
- Supports emulator, simulator, and physical-device access patterns

This file is important because Expo Go on a physical phone cannot use `localhost` or Android emulator loopback addresses.

#### `src/components/AddHabitSheet.jsx`

Responsibilities:

- Modal/bottom-sheet for habit creation
- Collects name and color input

#### `src/theme/index.js`

Responsibilities:

- Central theme tokens
- Brand colors
- Habit colors
- Spacing scale
- Radius scale
- Font sizes and font weights

## Authentication Design

Authentication uses JWT with refresh tokens:

1. Login hits `/api/auth/login/`
2. Access and refresh tokens are stored in AsyncStorage
3. Access token is attached to protected requests
4. If a request returns `401`, the app calls `/api/auth/refresh/`
5. On success, the original request is retried

Registration differs slightly:

- `/api/auth/register/` returns a nested `tokens` object
- `/api/auth/login/` returns access and refresh tokens at the top level

This is handled directly in `AuthContext.jsx`.

## Data Contract Between Backend and Mobile

### Habit Response Shape

```json
{
  "id": 1,
  "name": "Exercise",
  "color": "teal",
  "created_at": "2026-03-29T10:00:00Z",
  "logs": [
    {
      "id": 11,
      "date": "2026-03-29",
      "completed": true
    }
  ]
}
```

### Stats Response Shape

```json
{
  "date": "2026-03-29",
  "day_name": "Sat",
  "day_num": "29",
  "month": "Mar",
  "total": 5,
  "completed": 3,
  "percentage": 60,
  "is_today": true
}
```

## Development Workflow

### Backend

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Run the API locally:

```bash
python manage.py runserver
```

Run for physical-device access on the local network:

```bash
python manage.py runserver 0.0.0.0:8000
```

### Mobile

Install dependencies:

```bash
cd habitly-expo
npm install
```

Start Expo:

```bash
npm run start -- --clear
```

For physical-device testing:

- Phone and laptop must be on the same Wi-Fi
- Django should be started with `0.0.0.0:8000`
- Firewall must allow inbound access to port `8000` if blocked

## Design Decisions

### Why nested logs?

The mobile app needs each habit with recent completion history. Returning nested logs lets the client render Today and Week views without separate log endpoints.

### Why server-side stats?

The backend computes daily percentages from canonical habit/log data, which keeps reporting logic consistent across clients.

### Why client-side streaks?

Streaks are currently lightweight and derived from recent logs already available in the habit payload, so they are calculated in `useHabits.js`.

### Why optimistic updates?

The app updates toggle state immediately so the UI feels fast, then reconciles with server data if needed.

## Known Technical Characteristics

- SQLite is suitable for local development and simple deployments, but not ideal for larger multi-user production workloads.
- The backend currently uses Django's built-in `User` model directly.
- The API is focused on one bounded context: habits and their daily logs.
- The mobile app currently has the strongest product surface; no standalone web client is present in this repo.

## Suggested Future Improvements

- Add automated tests for API endpoints and mobile hooks
- Add environment-based configuration instead of relying on dev URL heuristics
- Unify auth response shape between register and login
- Add OpenAPI or API schema documentation
- Add service/repository layering if backend business rules grow
- Replace SQLite with PostgreSQL for production use
- Add CI for linting, tests, and dependency checks

## Quick Reference

Backend entry points:

- `backend/manage.py`
- `backend/habittracker/settings.py`
- `backend/habits/views.py`
- `backend/habits/auth_views.py`

Mobile entry points:

- `habitly-expo/app/_layout.jsx`
- `habitly-expo/app/auth.jsx`
- `habitly-expo/src/context/AuthContext.jsx`
- `habitly-expo/src/hooks/useHabits.js`
- `habitly-expo/src/api.js`

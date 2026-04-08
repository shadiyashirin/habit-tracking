# Habitly — Expo React Native App

Mobile app frontend for the Habit Tracker. Uses the same Django backend.

## Project Structure

```
habitly-expo/
├── app/
│   ├── _layout.jsx          ← Root layout (SafeAreaProvider, StatusBar)
│   ├── index.jsx            ← Redirects to Today tab
│   └── (tabs)/
│       ├── _layout.jsx      ← Bottom tab navigator
│       ├── today.jsx        ← Today's check-ins + progress bar
│       ├── week.jsx         ← 7-day grid with day+date columns
│       └── stats.jsx        ← Bar chart + per-habit breakdown
├── src/
│   ├── api.js               ← All fetch calls to Django
│   ├── theme/index.js       ← Colors, spacing, font constants
│   ├── hooks/useHabits.js   ← Data fetching + optimistic updates
│   ├── utils/dates.js       ← Date helpers
│   └── components/
│       └── AddHabitSheet.jsx ← Animated bottom sheet modal
├── app.json
├── babel.config.js
└── package.json
```

## Setup

### 1. Make sure the Django backend is running

```bash
cd ../habit-tracker/backend
python manage.py runserver
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API URL

Open `src/api.js` and set the correct IP:

- **Android Emulator**: uses `10.0.2.2` (already set as default)
- **iOS Simulator**: change to `http://localhost:8000/api`
- **Physical Device**: change to your computer's local IP, e.g. `http://192.168.1.5:8000/api`
  - Find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
  - Make sure your phone and computer are on the same WiFi

### 4. Start the app

```bash
npx expo start
```

Then:
- Press `a` → open in Android emulator
- Press `i` → open in iOS simulator
- Scan QR code with **Expo Go** app on your phone for instant preview

## Testing on Your Phone (Fastest Way)

1. Install **Expo Go** from Play Store / App Store
2. Run `npx expo start`
3. Scan the QR code shown in the terminal
4. Make sure your phone and laptop are on the same WiFi network
5. Set the API URL to your laptop's local IP in `src/api.js`

## Building for Production (APK / App Store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (create one free at expo.dev)
eas login

# Configure the build
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Build iOS (requires Apple Developer account)
eas build --platform ios
```

## Features

- **Today tab** — check off habits for today, progress bar shows % complete
- **Week tab** — full 7-day grid, each column shows day name + date + month
- **Progress tab** — bar chart by day, per-habit breakdown with streaks
- **Add habit** — animated bottom sheet with name input + color picker
- **Streaks** — consecutive day counter per habit
- **Haptic feedback** — subtle vibration on checkbox tap
- **Dark mode** — full dark mode support, auto-detects system setting
- **Pull to refresh** — swipe down to reload data
- **Optimistic updates** — checkboxes respond instantly, syncs in background

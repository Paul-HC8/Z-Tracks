# Expense Tracker

A minimal React Native (Expo) app for logging expenses in a couple of taps and
tracking spend by category over day / week / month, backed by on-device SQLite.

## Setup

```bash
npm install
npx expo install expo-sqlite react-native-screens react-native-safe-area-context
npm start
```

Then scan the QR code with Expo Go, or run `npm run android` / `npm run ios`.

## What's here

- `db/database.js` — SQLite schema + queries (add expense, totals by category, grand total).
- `db/dateRanges.js` — day/week/month boundary helpers.
- `screens/AddExpenseScreen.js` — the main screen: big amount display, on-screen
  numeric keypad (no system keyboard needed), 3 category buttons
  (Transpo / Food / Others), one Save button.
- `screens/StatsScreen.js` — Day/Week/Month toggle, total spend, and a bar per
  category so you can see where the money's going.
- `App.js` — bottom tab nav between the two screens, DB init on launch.

## About the "swipe up on lock screen" part

This is the one piece that **can't** be done in plain React Native/Expo JS —
there's no cross-platform API that lets an app add itself to the lock screen or
intercept a lock-screen swipe. It requires real native code per platform:

- **iOS**: a **Lock Screen Widget**, built with WidgetKit in Swift, as a
  separate widget extension target in Xcode. Tapping it opens the app (or, with
  iOS 17's interactive widgets, can even accept input without fully opening it).
- **Android**: an **App Widget** (Kotlin/Java, `AppWidgetProvider`), which can
  be placed on the lock screen on some OEM launchers, or more reliably a
  **Quick Settings Tile**. Tapping opens the app straight to the entry screen.

Both are doable *alongside* this RN app — they'd just call into (or share the
same SQLite file/API as) the app you already have here — but they're separate
native mini-projects, not something addable via an Expo/RN library alone.

**Practical middle ground today:** this app opens straight to the entry screen
by default, so from an unlocked phone it's already a 2-tap flow (unlock → open
app → log). If you want, I can also wire up:
- An **Android home-screen widget** (still not lock screen, but glanceable/tappable
  without fully opening the app) — doable with `expo-dev-client` + a small
  native module.
- **iOS/Android quick actions** (long-press the app icon) to jump straight to
  a specific category.

Let me know which of those you'd want and I can build it out next.

## Data model

```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  category TEXT NOT NULL,   -- 'Transpo' | 'Food' | 'Others'
  created_at TEXT NOT NULL  -- ISO 8601
);
```

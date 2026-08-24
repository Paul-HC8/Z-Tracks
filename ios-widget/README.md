# iOS Lock Screen Widget — Setup

This requires the **bare workflow** (or `expo prebuild`) since Widget
Extensions and native modules aren't available in Expo Go.

## 1. Generate the native iOS project

```bash
npx expo prebuild --platform ios
```

This creates an `ios/` folder with an Xcode project.

## 2. Open in Xcode and add a Widget Extension target

`ios/YourApp.xcworkspace` → File → New → Target → **Widget Extension**
- Product Name: `ExpenseWidget`
- Uncheck "Include Configuration Intent" (not needed — `ExpenseWidget.swift`
  already defines a `StaticConfiguration`)
- Team/bundle identifier: `com.yourname.expensetracker.ExpenseWidget`

Xcode will scaffold some placeholder files inside `ios/ExpenseWidget/` —
**delete those** and drag in the four files from `ios-widget/ExpenseWidget/`
in this repo instead:
- `ExpenseWidgetBundle.swift`
- `ExpenseWidget.swift`
- `SharedStore.swift`
- `LogExpenseIntent.swift` (only if targeting iOS 17+ interactive widgets —
  otherwise you can skip this file and drop `.supportedFamilies` down to
  just tap-to-open behavior)

Make sure they're added to the **ExpenseWidget** target (checkbox in the
File Inspector), not the main app target.

## 3. Add the native bridge to the main app target

Drag `ios-widget/ios-native-module/ExpenseWidgetBridge.swift` and
`ExpenseWidgetBridge.m` into the main app target (the RN app, not the
widget). If Xcode prompts for a bridging header, let it create one.

## 4. Enable App Groups on both targets

For **both** the main app target and the `ExpenseWidget` target:
Signing & Capabilities → + Capability → **App Groups** → add
`group.com.yourname.expensetracker`

(This same identifier is used in `SharedStore.swift`, `app.json`'s iOS
entitlements, and both targets' capabilities — keep it identical everywhere,
swapped for your own reverse-DNS domain.)

## 5. Set the minimum iOS version

- Main app + widget: iOS 16.0 minimum for Lock Screen accessory widgets.
- `LogExpenseIntent.swift` (one-tap logging without opening the app) needs
  iOS 17.0 — if you want to support iOS 16, remove that file and the
  `.interactive` bits; the widget still works as a glanceable total that
  deep-links into the app on tap.

## 6. Build and run

```bash
npx expo run:ios
```

Then, on a **physical device or simulator**: long-press the Lock Screen →
Customize → tap the widget area under the clock → add "Today's Spend."

## What you get

- **Tap the widget** → app opens directly to the Add Expense screen
  (via the `expensetracker://add` deep link), keypad ready.
- *(iOS 17+, if you wire up `LogExpenseIntent` with actual buttons in the
  widget view)* → tap a category on the widget itself and it logs the
  last-used amount immediately, no app-opening at all. The entry gets
  synced into the real SQLite database the next time the app launches
  (`drainPendingWidgetEntries` in `App.js` handles this automatically).

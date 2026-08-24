import { NativeModules, Platform } from 'react-native';

const { ExpenseWidgetBridge } = NativeModules;

const isAvailable = Platform.OS === 'ios' && !!ExpenseWidgetBridge;

export async function pushTodayTotalsToWidget(todayTotal, byCategory, lastAmount) {
  if (!isAvailable) return;
  try {
    await ExpenseWidgetBridge.updateTodayTotals(todayTotal, byCategory, lastAmount);
  } catch (e) {
    console.warn('Widget update failed', e);
  }
}

// Call once on app launch. Returns any expenses that were logged straight
// from the Lock Screen widget (iOS 17+ interactive intent) while the app
// wasn't running, so they can be inserted into SQLite.
export async function drainPendingWidgetEntries() {
  if (!isAvailable) return [];
  try {
    return await ExpenseWidgetBridge.drainPendingWidgetEntries();
  } catch (e) {
    console.warn('Widget drain failed', e);
    return [];
  }
}

import Foundation
import WidgetKit

@objc(ExpenseWidgetBridge)
class ExpenseWidgetBridge: NSObject {

    // Called from JS right after a new expense is saved to SQLite.
    // JS passes the already-recomputed totals for "today" so this file
    // doesn't need to know anything about the SQLite schema.
    @objc
    func updateTodayTotals(_ todayTotal: NSNumber,
                            byCategory: NSDictionary,
                            lastAmount: NSNumber,
                            resolver: @escaping RCTPromiseResolveBlock,
                            rejecter: @escaping RCTPromiseRejectBlock) {
        var dict: [String: Double] = [:]
        for (k, v) in byCategory {
            if let key = k as? String, let value = v as? NSNumber {
                dict[key] = value.doubleValue
            }
        }
        SharedStore.write(todayTotal: todayTotal.doubleValue, byCategory: dict, lastAmount: lastAmount.doubleValue)
        WidgetCenter.shared.reloadAllTimelines()
        resolver(nil)
    }

    // Called from JS on app launch to pull in anything logged directly
    // from the Lock Screen widget (via LogExpenseIntent) while the app
    // wasn't running, so it can be written into the real SQLite DB.
    @objc
    func drainPendingWidgetEntries(_ resolver: @escaping RCTPromiseResolveBlock,
                                    rejecter: @escaping RCTPromiseRejectBlock) {
        let entries = PendingSync.readAll()
        PendingSync.clear()
        resolver(entries)
    }

    @objc
    static func requiresMainQueueSetup() -> Bool { false }
}

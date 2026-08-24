import Foundation

/// Reads/writes the small bits of data the Lock Screen widget needs.
/// The RN app writes here (via the native bridge module) every time an
/// expense is saved; the widget only ever reads from here — it never
/// touches the app's SQLite file directly.
///
/// IMPORTANT: Replace "group.com.yourname.expensetracker" with your own
/// App Group identifier (must match exactly in both the main app target
/// and the widget extension target's entitlements).
enum SharedStore {
    static let appGroupId = "group.com.yourname.expensetracker"

    private static var defaults: UserDefaults? {
        UserDefaults(suiteName: appGroupId)
    }

    private enum Keys {
        static let todayTotal = "todayTotal"
        static let todayByCategory = "todayByCategory" // JSON: {"Transpo":10,"Food":20,"Others":5}
        static let lastAmount = "lastAmount"
        static let lastUpdated = "lastUpdated"
    }

    struct Snapshot {
        let todayTotal: Double
        let byCategory: [String: Double]
        let lastAmount: Double
    }

    static func read() -> Snapshot {
        let d = defaults
        let total = d?.double(forKey: Keys.todayTotal) ?? 0
        let lastAmount = d?.double(forKey: Keys.lastAmount) ?? 0
        var byCategory: [String: Double] = [:]
        if let data = d?.string(forKey: Keys.todayByCategory)?.data(using: .utf8),
           let parsed = try? JSONDecoder().decode([String: Double].self, from: data) {
            byCategory = parsed
        }
        return Snapshot(todayTotal: total, byCategory: byCategory, lastAmount: lastAmount)
    }

    /// Called from the native bridge whenever the RN app logs a new expense.
    static func write(todayTotal: Double, byCategory: [String: Double], lastAmount: Double) {
        let d = defaults
        d?.set(todayTotal, forKey: Keys.todayTotal)
        d?.set(lastAmount, forKey: Keys.lastAmount)
        if let data = try? JSONEncoder().encode(byCategory),
           let json = String(data: data, encoding: .utf8) {
            d?.set(json, forKey: Keys.todayByCategory)
        }
        d?.set(Date(), forKey: Keys.lastUpdated)
    }
}

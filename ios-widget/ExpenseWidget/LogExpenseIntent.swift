import AppIntents
import WidgetKit

/// Logs an expense directly from the Lock Screen with one tap.
/// Since Lock Screen widgets can't show a text field, this logs the
/// last-used amount (stored by the RN app after every save) against
/// whichever category button was tapped. Good for repeat purchases
/// like a daily commute fare or the same coffee order.
struct LogExpenseIntent: AppIntent {
    static var title: LocalizedStringResource = "Log Expense"

    @Parameter(title: "Category")
    var category: String

    init() {}

    init(category: String) {
        self.category = category
    }

    func perform() async throws -> some IntentResult {
        let snapshot = SharedStore.read()
        let amount = snapshot.lastAmount > 0 ? snapshot.lastAmount : 0

        if amount > 0 {
            var byCategory = snapshot.byCategory
            byCategory[category, default: 0] += amount
            let newTotal = snapshot.todayTotal + amount
            SharedStore.write(todayTotal: newTotal, byCategory: byCategory, lastAmount: amount)

            // Also queue this for the RN app's SQLite DB to pick up next launch,
            // since the widget process can't write to expo-sqlite's file directly.
            PendingSync.enqueue(amount: amount, category: category)
        }

        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

/// Small outbox so entries logged straight from the widget (while the RN
/// app isn't running) get written into the real SQLite database the next
/// time the app launches. The RN side should read + clear this on startup.
enum PendingSync {
    private static let key = "pendingExpenses" // JSON array

    static func enqueue(amount: Double, category: String) {
        let d = UserDefaults(suiteName: SharedStore.appGroupId)
        var list = readAll()
        list.append(["amount": amount, "category": category, "createdAt": ISO8601DateFormatter().string(from: Date())])
        if let data = try? JSONSerialization.data(withJSONObject: list) {
            d?.set(data, forKey: key)
        }
    }

    static func readAll() -> [[String: Any]] {
        let d = UserDefaults(suiteName: SharedStore.appGroupId)
        guard let data = d?.data(forKey: key),
              let list = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
            return []
        }
        return list
    }

    static func clear() {
        UserDefaults(suiteName: SharedStore.appGroupId)?.removeObject(forKey: key)
    }
}

import WidgetKit
import SwiftUI

struct ExpenseEntry: TimelineEntry {
    let date: Date
    let todayTotal: Double
    let topCategory: String?
}

struct ExpenseProvider: TimelineProvider {
    func placeholder(in context: Context) -> ExpenseEntry {
        ExpenseEntry(date: Date(), todayTotal: 0, topCategory: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (ExpenseEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ExpenseEntry>) -> Void) {
        let entry = currentEntry()
        // Widget refreshes itself hourly as a fallback; the RN app also forces
        // an immediate reload via WidgetCenter whenever a new expense is saved.
        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }

    private func currentEntry() -> ExpenseEntry {
        let snapshot = SharedStore.read()
        let top = snapshot.byCategory.max(by: { $0.value < $1.value })?.key
        return ExpenseEntry(date: Date(), todayTotal: snapshot.todayTotal, topCategory: top)
    }
}

struct ExpenseWidgetEntryView: View {
    var entry: ExpenseEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            // Small ring/icon widget for the Lock Screen
            Gauge(value: min(entry.todayTotal, 1000), in: 0...1000) {
                Text("₱")
            } currentValueLabel: {
                Text(shortAmount(entry.todayTotal))
                    .font(.system(size: 13, weight: .semibold))
            }
            .gaugeStyle(.accessoryCircular)
            // Tapping opens the app directly on the Add Expense screen
            .widgetURL(URL(string: "expensetracker://add"))

        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text("Today")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                Text("₱\(entry.todayTotal, specifier: "%.2f")")
                    .font(.system(size: 18, weight: .bold))
                if let top = entry.topCategory {
                    Text("Mostly \(top)")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                }
            }
            .widgetURL(URL(string: "expensetracker://add"))

        case .accessoryInline:
            Text("Spent ₱\(entry.todayTotal, specifier: "%.0f") today")
                .widgetURL(URL(string: "expensetracker://add"))

        default:
            Text("₱\(entry.todayTotal, specifier: "%.2f")")
        }
    }

    private func shortAmount(_ value: Double) -> String {
        value >= 1000 ? String(format: "%.1fk", value / 1000) : String(format: "%.0f", value)
    }
}

struct ExpenseWidget: Widget {
    let kind: String = "ExpenseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ExpenseProvider()) { entry in
            ExpenseWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Today's Spend")
        .description("Shows what you've spent today. Tap to log a new expense.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

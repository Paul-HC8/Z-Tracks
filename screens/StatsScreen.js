import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCategoryTotals, getGrandTotal } from '../db/database';
import { getDayRange, getWeekRange, getMonthRange } from '../db/dateRanges';

const RANGE_OPTIONS = ['Day', 'Week', 'Month'];

const CATEGORY_COLORS = {
  Transpo: '#4F8CFF',
  Food: '#FF9F4F',
  Others: '#8A6BFF',
};

export default function StatsScreen() {
  const [range, setRange] = useState('Day');
  const [totals, setTotals] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);

  const load = useCallback(() => {
    const { startISO, endISO } =
      range === 'Day' ? getDayRange() : range === 'Week' ? getWeekRange() : getMonthRange();
    setTotals(getCategoryTotals(startISO, endISO));
    setGrandTotal(getGrandTotal(startISO, endISO));
  }, [range]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const maxTotal = totals.length ? Math.max(...totals.map((t) => t.total)) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Spending</Text>

      <View style={styles.tabRow}>
        {RANGE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.tab, range === opt && styles.tabSelected]}
            onPress={() => setRange(opt)}
          >
            <Text style={[styles.tabText, range === opt && styles.tabTextSelected]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.grandTotal}>₱{grandTotal.toFixed(2)}</Text>
      <Text style={styles.grandTotalLabel}>total this {range.toLowerCase()}</Text>

      <FlatList
        data={totals}
        keyExtractor={(item) => item.category}
        style={{ marginTop: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses logged for this {range.toLowerCase()} yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowCategory}>{item.category}</Text>
              <Text style={styles.rowAmount}>₱{item.total.toFixed(2)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${maxTotal ? (item.total / maxTotal) * 100 : 0}%`,
                    backgroundColor: CATEGORY_COLORS[item.category] || '#4F8CFF',
                  },
                ]}
              />
            </View>
            <Text style={styles.rowCount}>{item.count} entr{item.count === 1 ? 'y' : 'ies'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1D24',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabSelected: {
    backgroundColor: '#4F8CFF',
  },
  tabText: {
    color: '#8A8F98',
    fontWeight: '600',
  },
  tabTextSelected: {
    color: '#FFFFFF',
  },
  grandTotal: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    marginTop: 24,
    textAlign: 'center',
  },
  grandTotalLabel: {
    color: '#8A8F98',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: '#8A8F98',
    textAlign: 'center',
    marginTop: 40,
  },
  row: {
    marginBottom: 18,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowCategory: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  rowAmount: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A1D24',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  rowCount: {
    color: '#8A8F98',
    fontSize: 12,
    marginTop: 4,
  },
});

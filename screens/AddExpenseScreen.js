import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { addExpense, getTodaySummary, CATEGORIES } from '../db/database';
import { pushTodayTotalsToWidget } from '../widgetBridge';

const CATEGORY_ICONS = {
  Transpo: '🚗',
  Food: '🍔',
  Others: '💸',
};

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const canSave = amount.length > 0 && !isNaN(parseFloat(amount)) && category;

  function handleKeyPress(key) {
    if (key === 'del') {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (key === '.' && amount.includes('.')) return;
    if (amount.length >= 9) return;
    setAmount((a) => a + key);
  }

  function handleSave() {
    if (!canSave) return;
    const value = parseFloat(amount);
    addExpense(value, category);

    // Keep the Lock Screen widget in sync with the latest totals.
    const { total, byCategory } = getTodaySummary();
    pushTodayTotalsToWidget(total, byCategory, value);

    setSavedFlash(true);
    Keyboard.dismiss();
    setTimeout(() => {
      setAmount('');
      setCategory(null);
      setSavedFlash(false);
    }, 500);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>How much?</Text>
      <TextInput
        style={styles.amountDisplay}
        value={amount ? `₱${amount}` : '₱0'}
        editable={false}
      />

      {/* Simple numeric keypad so this works fast with one hand, no system keyboard needed */}
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map((k) => (
          <TouchableOpacity
            key={k}
            style={styles.key}
            onPress={() => handleKeyPress(k)}
          >
            <Text style={styles.keyText}>{k === 'del' ? '⌫' : k}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>What for?</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.categoryButton,
              category === c && styles.categoryButtonSelected,
            ]}
            onPress={() => setCategory(c)}
          >
            <Text style={styles.categoryIcon}>{CATEGORY_ICONS[c]}</Text>
            <Text
              style={[
                styles.categoryText,
                category === c && styles.categoryTextSelected,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        disabled={!canSave}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          {savedFlash ? 'Saved ✓' : 'Save Expense'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
        <Text style={styles.statsLink}>View spending →</Text>
      </TouchableOpacity>
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
  label: {
    color: '#8A8F98',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 8,
  },
  amountDisplay: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    width: '31%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#1A1D24',
    borderRadius: 10,
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1A1D24',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    borderColor: '#4F8CFF',
    backgroundColor: '#1E2A44',
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryText: {
    color: '#8A8F98',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#4F8CFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#2A2D34',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  statsLink: {
    color: '#4F8CFF',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});

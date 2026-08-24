import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddExpenseScreen from './screens/AddExpenseScreen';
import StatsScreen from './screens/StatsScreen';
import { initDB, addExpense } from './db/database';
import { drainPendingWidgetEntries } from './widgetBridge';

const Tab = createBottomTabNavigator();

// Deep link config: expensetracker://add opens straight to the Add screen
// (this is what the Lock Screen widget's widgetURL points at).
const linking = {
  prefixes: ['expensetracker://'],
  config: {
    screens: {
      Add: 'add',
      Stats: 'stats',
    },
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDB();
    // Pull in anything logged directly from the Lock Screen widget
    // (iOS 17+ interactive intent) while the app wasn't running.
    drainPendingWidgetEntries().then((entries) => {
      for (const e of entries || []) {
        addExpense(e.amount, e.category, e.createdAt);
      }
    });
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F1115', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#4F8CFF" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: true,
        colors: {
          primary: '#4F8CFF',
          background: '#0F1115',
          card: '#0F1115',
          text: '#FFFFFF',
          border: '#1A1D24',
          notification: '#4F8CFF',
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#0F1115', borderTopColor: '#1A1D24' },
          tabBarActiveTintColor: '#4F8CFF',
          tabBarInactiveTintColor: '#8A8F98',
        }}
      >
        <Tab.Screen name="Add" component={AddExpenseScreen} options={{ title: 'Log' }} />
        <Tab.Screen name="Stats" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../src/constants/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{label}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Registra',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="🎤" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Preventivi',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="📋" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

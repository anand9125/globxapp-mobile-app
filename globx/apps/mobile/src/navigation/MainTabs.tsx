import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "./types";
import { DashboardScreen } from "../screens/DashboardScreen";
import { TradeScreen } from "../screens/TradeScreen";
import { MarketsScreen } from "../screens/MarketsScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { colors } from "../lib/theme";
import { Text } from "react-native";

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? colors.accent.primary : colors.text.muted, fontSize: 12 }}>
      {label}
    </Text>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg.primary },
        headerTintColor: colors.text.primary,
        tabBarStyle: { backgroundColor: colors.bg.secondary, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.muted,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="Dashboard" focused={focused} /> }}
      />
      <Tab.Screen
        name="Trade"
        component={TradeScreen}
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="Trade" focused={focused} /> }}
      />
      <Tab.Screen
        name="Markets"
        component={MarketsScreen}
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="Markets" focused={focused} /> }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="More" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

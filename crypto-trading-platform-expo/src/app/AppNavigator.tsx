import React from "react";
import { Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuthStore } from "../auth/authStore";
import { useLogout } from "../auth/useLogout";

import { CustodyScreen } from "../features/custody/CustodyScreen";
import { TradeScreen } from "../features/trade/TradeScreen";
import { LendingScreen } from "../features/lending/LendingScreen";
import { StakingScreen } from "../features/staking/StakingScreen";
import { LiquidityScreen } from "../features/liquidity/LiquidityScreen";

import { LoginScreen } from "../features/Login/LoginScreen";
import { RegisterScreen } from "../features/Login/RegisterScreen";

import { ApprovalsScreen } from "../features/approvals/ApprovalsScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";

export type RootTabsParamList = {
  Custody: undefined;
  Trade: undefined;
  Lending: undefined;
  Staking: undefined;
  Liquidity: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Approvals: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabsParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerTitleAlign: "center", headerTintColor: "#2F6BFF" }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  const logout = useLogout();
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        tabBarShowLabel: true,
        tabBarIcon: ({ color, size }) => {
          const map: Record<keyof RootTabsParamList, keyof typeof Ionicons.glyphMap> = {
            Custody: "lock-closed-outline",
            Trade: "swap-horizontal-outline",
            Lending: "cash-outline",
            Staking: "leaf-outline",
            Liquidity: "water-outline",
          };
          return <Ionicons name={map[route.name as keyof RootTabsParamList]} size={size} color={color} />;
        },
        headerRight: () => (
          // <Pressable onPress={logout} style={{ paddingHorizontal: 14 }}>
          //   <Ionicons name="log-out-outline" size={22} />
          // </Pressable>
          <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingHorizontal: 14 }}>
            <Ionicons name="settings-outline" size={22} />
          </Pressable>
        ),
      })}
    >
      <Tab.Screen name="Custody" component={CustodyScreen} />
      <Tab.Screen name="Trade" component={TradeScreen} />
      <Tab.Screen name="Lending" component={LendingScreen} />
      <Tab.Screen name="Staking" component={StakingScreen} />
      <Tab.Screen name="Liquidity" component={LiquidityScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const token = useAuthStore((s) => s.token);

  return (
    <RootStack.Navigator>
      {token ? (
        <>
          <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <RootStack.Screen
            name="Approvals"
            component={ApprovalsScreen}
            options={{ headerTitle: "Approvals", headerTitleAlign: "center" }}
          />
          <RootStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerTitle: "Settings", headerTitleAlign: "center" }}
          />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      )}
    </RootStack.Navigator>
  );
}
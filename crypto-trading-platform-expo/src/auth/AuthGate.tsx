import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { getToken } from "./tokenStorage";
import { useAuthStore } from "./authStore";

/**
 * AuthGate behavior:
 * - Reads token from SecureStore
 * - If token exists -> enter app
 * - If token missing -> show Auth (Login/Register) via AppNavigator
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, setToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setToken(t); // ✅ if null, keep null (forces Login first)
      setLoading(false);
    })();
  }, [setToken]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Checking session…</Text>
      </View>
    );
  }

  return <>{children}</>;
}
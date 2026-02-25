import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { queryClient } from "./src/app/queryClient";
import { store } from "./src/store/store";
import { AuthGate } from "./src/auth/AuthGate";
import { AppNavigator } from "./src/app/AppNavigator";

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <AuthGate>
            <AppNavigator />
          </AuthGate>
        </NavigationContainer>
      </QueryClientProvider>
    </Provider>
  );
}

// src/ui/components/Card.tsx
import React from "react";
import { View } from "react-native";
import { theme } from "../themes/theme";

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.card,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.shadow.color,
          shadowOpacity: theme.shadow.opacity,
          shadowRadius: theme.shadow.radius,
          shadowOffset: theme.shadow.offset,
          elevation: theme.shadow.elevation,
          marginBottom: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
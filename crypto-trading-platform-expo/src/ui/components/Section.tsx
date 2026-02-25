import React from "react";
import { View, Text } from "react-native";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>{title}</Text>
      {children}
    </View>
  );
}

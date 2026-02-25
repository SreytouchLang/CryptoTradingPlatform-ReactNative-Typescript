// src/ui/components/Field.tsx
import React from "react";
import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../themes/theme";

export function Field(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: "900", marginBottom: 8, color: theme.colors.text }}>
        {props.label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.colors.borderSoft,
          borderRadius: theme.radius.input,
          paddingHorizontal: 12,
          backgroundColor: theme.colors.inputBg,
          height: 54,
        }}
      >
        {props.icon ? (
          <Ionicons name={props.icon} size={18} color={theme.colors.primary} />
        ) : null}

        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          keyboardType={props.keyboardType ?? "default"}
          placeholderTextColor="#9AA3B2"
          style={{
            flex: 1,
            marginLeft: props.icon ? 10 : 0,
            fontSize: 16,
            color: theme.colors.text,
            paddingVertical: 0,
          }}
        />
      </View>
    </View>
  );
}
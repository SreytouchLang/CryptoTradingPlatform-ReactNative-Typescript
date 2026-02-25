import React, { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../themes/theme";

type Variant = "primary" | "secondary" | "danger";

export function PrimaryButton({
  title,
  onPress,
  disabled,
  icon,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: Variant;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  }

  const colors = getColors(variant, !!disabled);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{
          height: 49,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
          borderWidth: colors.borderWidth,
          borderColor: colors.borderColor,
          shadowColor: colors.shadowColor,
          shadowOpacity: colors.shadowOpacity,
          shadowRadius: colors.shadowRadius,
          shadowOffset: { width: 0, height: 12 },
          elevation: colors.shadowOpacity > 0 ? 4 : 0,
          overflow: "hidden",
        }}
      >
        {/* subtle glossy highlight */}
        {variant === "primary" && !disabled ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -40,
              left: -40,
              width: 220,
              height: 220,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          />
        ) : null}

        {/* bottom shade for depth */}
        {variant === "primary" && !disabled ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -60,
              right: -80,
              width: 260,
              height: 260,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.10)",
            }}
          />
        ) : null}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {icon ? <Ionicons name={icon} size={19} color={colors.fg} /> : null}
          <Text style={{ color: colors.fg, fontWeight: "900", fontSize: 17 }}>
            {title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function getColors(variant: Variant, disabled: boolean) {
  const primary = theme.colors.primary;
  const soft = theme.colors.primarySoft;

  if (variant === "primary") {
    return {
      bg: disabled ? soft : primary,
      fg: "#fff",
      borderWidth: 0,
      borderColor: "transparent",
      shadowColor: primary,
      shadowOpacity: disabled ? 0 : 0.28,
      shadowRadius: 18,
    };
  }

  if (variant === "secondary") {
    return {
      bg: disabled ? "#F1F5FF" : "#FFFFFF",
      fg: disabled ? "#9AA3B2" : primary,
      borderWidth: 1,
      borderColor: disabled ? theme.colors.border : theme.colors.borderSoft,
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowRadius: 0,
    };
  }

  // danger
  return {
    bg: disabled ? "#FFE4E6" : "#EF4444",
    fg: "#fff",
    borderWidth: 0,
    borderColor: "transparent",
    shadowColor: "#EF4444",
    shadowOpacity: disabled ? 0 : 0.22,
    shadowRadius: 18,
  };
}
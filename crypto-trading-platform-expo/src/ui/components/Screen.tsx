// src/ui/components/Screen.tsx
import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { theme } from "../themes/theme";

export function Screen({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: ViewStyle;
}) {
    const y = useRef(new Animated.Value(10)).current;
    const o = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(o, { toValue: 1, duration: 220, useNativeDriver: true }),
            Animated.timing(y, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start();
    }, [o, y]);

    return (
        <Animated.View
            style={[
                {
                    flex: 1,
                    backgroundColor: theme.colors.bg,
                    padding: 16,
                    opacity: o,
                    transform: [{ translateY: y }],
                },
                style,
            ]}
        >
            {children}
        </Animated.View>
    );
}
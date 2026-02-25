// src/auth/LoginScreen.tsx
import React, { useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    Text,
    TextInput,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/endpoints";
import { useAuthStore } from "../../auth/authStore";
import { setToken as persistToken } from "../../auth/tokenStorage";

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
    const setToken = useAuthStore((s) => s.setToken);

    const [email, setEmail] = useState("demo@crypto.local");
    const [password, setPassword] = useState("password123");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(
        () => email.trim().length > 3 && password.length >= 6 && !loading,
        [email, password, loading]
    );

    async function onLogin() {
        try {
            setLoading(true);
            const res = await api.login({
                email: email.trim().toLowerCase(),
                password,
            });
            await persistToken(res.token);
            setToken(res.token);
        } catch (e: any) {
            Alert.alert("Login failed", e?.message ?? "Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, backgroundColor: "#F4F7FF" }}
        >
            <StatusBar barStyle="dark-content" />

            {/* ✅ FIXED TOP HEADER */}
            <View style={{ paddingTop: 14, paddingHorizontal: 18, paddingBottom: 14 }}>
                <View style={styles.header}>
                    <View style={styles.blobRight} />
                    <View style={styles.blobLeft} />

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="shield-checkmark-outline" size={22} color="#fff" />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerSub}>Crypto Trading Demo</Text>
                            <Text style={styles.headerTitle}>Sign in</Text>
                            <Text style={styles.headerCaption}>
                                Custody • Trading • Lending • Staking • Liquidity
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ✅ CENTERED CONTENT AREA */}
            <View style={{ flex: 1, justifyContent: "center" }}>
                <View style={{ paddingHorizontal: 18 }}>
                    <View style={{ width: "100%", maxWidth: 520, alignSelf: "center" }}>
                        {/* Card */}
                        <View style={styles.card}>
                            <Text style={styles.welcomeTitle}>Welcome back</Text>
                            <Text style={styles.welcomeDesc}>
                                Sign in to continue. Demo credentials are already filled in.
                            </Text>

                            {/* Email */}
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrap}>
                                <Ionicons name="mail-outline" size={18} color="#2F6BFF" />
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="name@company.com"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholderTextColor="#9AA3B2"
                                    style={styles.input}
                                />
                            </View>

                            {/* Password */}
                            <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
                            <View style={styles.inputWrap}>
                                <Ionicons name="lock-closed-outline" size={18} color="#2F6BFF" />
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor="#9AA3B2"
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                />
                                <Pressable
                                    onPress={() => setShowPassword((v) => !v)}
                                    hitSlop={10}
                                    style={{ padding: 6 }}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={18}
                                        color="#6B7280"
                                    />
                                </Pressable>
                            </View>

                            {/* CTA */}
                            <Pressable
                                onPress={onLogin}
                                disabled={!canSubmit}
                                style={[
                                    styles.cta,
                                    { backgroundColor: canSubmit ? "#2F6BFF" : "#B8C6FF" },
                                ]}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <Ionicons name="log-in-outline" size={18} color="#fff" />
                                    <Text style={styles.ctaText}>{loading ? "Signing in…" : "Sign In"}</Text>
                                </View>
                            </Pressable>

                            {/* Secondary */}
                            <View style={{ marginTop: 14, flexDirection: "row", justifyContent: "center" }}>
                                <Text style={{ opacity: 0.75 }}>Don’t have an account? </Text>
                                <Text
                                    style={{ fontWeight: "900", color: "#2F6BFF" }}
                                    onPress={() => navigation.navigate("Register")}
                                >
                                    Create one
                                </Text>
                            </View>

                            {/* Tiny help row */}
                            <View style={styles.helpRow}>
                                <Ionicons name="information-circle-outline" size={18} color="#2F6BFF" />
                                <Text style={{ flex: 1, opacity: 0.7 }}>
                                    Demo user: demo@crypto.local / password123
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = {
    header: {
        borderRadius: 22,
        padding: 18,
        overflow: "hidden" as const,
        backgroundColor: "#2F6BFF",
    },
    blobRight: {
        position: "absolute" as const,
        right: -80,
        top: -70,
        width: 220,
        height: 220,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    blobLeft: {
        position: "absolute" as const,
        left: -90,
        bottom: -90,
        width: 240,
        height: 240,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.10)",
    },
    headerIcon: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.22)",
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },
    headerSub: { color: "rgba(255,255,255,0.85)", fontWeight: "800" as const },
    headerTitle: { color: "#fff", fontSize: 24, fontWeight: "900" as const, marginTop: 2 },
    headerCaption: { color: "rgba(255,255,255,0.85)", marginTop: 6 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E9EEFF",
        shadowColor: "#1B2A6B",
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
    },
    welcomeTitle: { fontSize: 26, fontWeight: "900" as const, marginBottom: 6 },
    welcomeDesc: { opacity: 0.65, marginBottom: 16, lineHeight: 20 },

    label: { fontWeight: "900" as const, marginBottom: 8 },
    inputWrap: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        borderWidth: 1,
        borderColor: "#DCE4FF",
        borderRadius: 16,
        paddingHorizontal: 12,
        backgroundColor: "#F8FAFF",
        height: 54,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        paddingVertical: 0,
        color: "#111827",
    },

    cta: {
        marginTop: 18,
        height: 54,
        borderRadius: 16,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        shadowColor: "#2F6BFF",
        shadowOpacity: 0.28,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
    },
    ctaText: { color: "#fff", fontWeight: "900" as const, fontSize: 16 },

    helpRow: {
        marginTop: 14,
        padding: 12,
        borderRadius: 14,
        backgroundColor: "#F3F6FF",
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 10,
    },
};
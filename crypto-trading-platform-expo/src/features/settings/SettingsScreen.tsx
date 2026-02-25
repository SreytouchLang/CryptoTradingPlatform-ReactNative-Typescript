// src/features/settings/SettingsScreen.tsx
import React, { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../ui/components/Screen";
import { Card } from "../../ui/components/Card";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { theme } from "../../ui/themes/theme";
import { useLogout } from "../../auth/useLogout";

export function SettingsScreen() {
    const logout = useLogout();

    // demo user profile (store later if you want)
    const [name, setName] = useState("Sreytouch Lang");
    const [email, setEmail] = useState("demo@Crypto.local");

    const [editOpen, setEditOpen] = useState(false);
    const [pwdOpen, setPwdOpen] = useState(false);

    const [newName, setNewName] = useState(name);
    const [newEmail, setNewEmail] = useState(email);

    const [pwd1, setPwd1] = useState("");
    const [pwd2, setPwd2] = useState("");

    function saveProfile() {
        if (newName.trim().length < 2) return Alert.alert("Invalid name", "Please enter your name.");
        if (!newEmail.includes("@")) return Alert.alert("Invalid email", "Please enter a valid email.");

        setName(newName.trim());
        setEmail(newEmail.trim().toLowerCase());
        setEditOpen(false);
        Alert.alert("Saved", "Profile updated (demo).");
    }

    function changePassword() {
        if (pwd1.length < 6) return Alert.alert("Too short", "Password must be at least 6 characters.");
        if (pwd1 !== pwd2) return Alert.alert("Mismatch", "Passwords do not match.");

        setPwd1("");
        setPwd2("");
        setPwdOpen(false);
        Alert.alert("Updated", "Password updated (demo UI only).");
    }

    return (
        <Screen>
            {/* Header card */}
            <View
                style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: 22,
                    padding: 16,
                    overflow: "hidden",
                    marginBottom: 12,
                }}
            >
                <View
                    style={{
                        position: "absolute",
                        right: -70,
                        top: -80,
                        width: 220,
                        height: 220,
                        borderRadius: 999,
                        backgroundColor: "rgba(255,255,255,0.16)",
                    }}
                />
                <View
                    style={{
                        position: "absolute",
                        left: -90,
                        bottom: -90,
                        width: 240,
                        height: 240,
                        borderRadius: 999,
                        backgroundColor: "rgba(0,0,0,0.10)",
                    }}
                />

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 18,
                            backgroundColor: "rgba(255,255,255,0.22)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="person-outline" size={24} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "800" }}>
                            Profile
                        </Text>
                        <Text
                            style={{
                                color: "#fff",
                                fontSize: 22,
                                fontWeight: "900",
                                marginTop: 2,
                            }}
                        >
                            {name}
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
                            {email}
                        </Text>
                    </View>
                </View>
            </View>

            <Card>
                <MenuRow icon="create-outline" title="Edit profile" onPress={() => {
                    setNewName(name);
                    setNewEmail(email);
                    setEditOpen(true);
                }} />
                <Divider />
                <MenuRow icon="key-outline" title="Change password" onPress={() => {
                    setPwd1("");
                    setPwd2("");
                    setPwdOpen(true);
                }} />
                <Divider />
                <MenuRow
                    icon="log-out-outline"
                    title="Logout"
                    danger
                    onPress={() => {
                        Alert.alert("Logout", "Are you sure you want to logout?", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Logout", style: "destructive", onPress: logout },
                        ]);
                    }}
                />
            </Card>

            {/* Edit profile bottom sheet */}
            <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
                <Label text="Name" />
                <Input value={newName} onChangeText={setNewName} placeholder="Your name" />

                <Label text="Email" />
                <Input value={newEmail} onChangeText={setNewEmail} placeholder="name@company.com" />

                <View style={{ height: 12 }} />
                <PrimaryButton title="Save" icon="checkmark-outline" onPress={saveProfile} variant="primary" />
                <View style={{ height: 10 }} />
                <PrimaryButton title="Cancel" icon="close-outline" onPress={() => setEditOpen(false)} variant="secondary" />
            </BottomSheet>

            {/* Change password bottom sheet */}
            <BottomSheet open={pwdOpen} onClose={() => setPwdOpen(false)} title="Change password">
                <Label text="New password" />
                <Input value={pwd1} onChangeText={setPwd1} placeholder="••••••" secure />

                <Label text="Confirm password" />
                <Input value={pwd2} onChangeText={setPwd2} placeholder="••••••" secure />

                <View style={{ height: 12 }} />
                <PrimaryButton title="Update password" icon="key-outline" onPress={changePassword} variant="primary" />
                <View style={{ height: 10 }} />
                <PrimaryButton title="Cancel" icon="close-outline" onPress={() => setPwdOpen(false)} variant="secondary" />
            </BottomSheet>
        </Screen>
    );
}

function MenuRow({
    icon,
    title,
    onPress,
    danger,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    danger?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}
        >
            <View
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    backgroundColor: danger ? "#FFF2F2" : theme.colors.infoBg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                }}
            >
                <Ionicons
                    name={icon}
                    size={18}
                    color={danger ? "#B91C1C" : theme.colors.primary}
                />
            </View>

            <Text
                style={{
                    flex: 1,
                    fontWeight: "900",
                    color: danger ? "#B91C1C" : theme.colors.text,
                }}
            >
                {title}
            </Text>

            <Ionicons name="chevron-forward" size={18} color="#9AA3B2" />
        </Pressable>
    );
}

function Divider() {
    return <View style={{ height: 1, backgroundColor: theme.colors.border }} />;
}

function BottomSheet({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>
                {/* Backdrop (tap to close) */}
                <Pressable style={{ flex: 1 }} onPress={onClose} />

                {/* Sheet */}
                <View
                    style={{
                        backgroundColor: "#fff",
                        borderTopLeftRadius: 22,
                        borderTopRightRadius: 22,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <Text style={{ flex: 1, fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
                            {title}
                        </Text>
                        <Pressable onPress={onClose} hitSlop={10} style={{ padding: 6 }}>
                            <Ionicons name="close-outline" size={22} color={theme.colors.text} />
                        </Pressable>
                    </View>

                    {children}
                </View>
            </View>
        </Modal>
    );
}

function Label({ text }: { text: string }) {
    return (
        <Text style={{ fontWeight: "900", marginBottom: 8, color: theme.colors.text }}>
            {text}
        </Text>
    );
}

function Input({
    value,
    onChangeText,
    placeholder,
    secure,
}: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder: string;
    secure?: boolean;
}) {
    return (
        <View
            style={{
                borderWidth: 1,
                borderColor: theme.colors.borderSoft,
                borderRadius: 16,
                paddingHorizontal: 12,
                backgroundColor: theme.colors.inputBg,
                height: 54,
                justifyContent: "center",
                marginBottom: 12,
            }}
        >
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9AA3B2"
                secureTextEntry={!!secure}
                autoCapitalize="none"
                style={{ fontSize: 16, color: theme.colors.text }}
            />
        </View>
    );
}
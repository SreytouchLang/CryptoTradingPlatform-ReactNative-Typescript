import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../ui/components/Screen";
import { Card } from "../../ui/components/Card";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { Row } from "../../ui/components/Row";
import { Section } from "../../ui/components/Section";
import { theme } from "../../ui/themes/theme";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { approve, reject, clearCompleted, TransferRequest, ApprovalItem } from "../../store/slices/approvalQueueSlice";

export function ApprovalsScreen() {
    const dispatch = useAppDispatch();
    const items = useAppSelector((s) => s.approvalQueue.items);

    const [approver] = useState("approver@Crypto.demo");

    const pending = useMemo(
        () => items.filter((r) => r.status === "PENDING" || r.status === "IN_REVIEW"),
        [items]
    );

    const doneExists = useMemo(
        () => items.some((r) => r.status === "APPROVED" || r.status === "REJECTED"),
        [items]
    );

    return (
        <Screen>
            <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <Text style={{ fontSize: 28, fontWeight: "900", color: theme.colors.text, flex: 1 }}>
                        Approvals
                    </Text>
                    <PrimaryButton
                        title="Clear done"
                        icon="trash-outline"
                        disabled={!doneExists}
                        onPress={() => dispatch(clearCompleted())}
                    />
                </View>

                {!items.length ? (
                    <Card style={{ backgroundColor: theme.colors.infoBg }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                            <Text style={{ flex: 1, color: theme.colors.subtext }}>
                                No approval requests yet. Create one from Custody → Transfers.
                            </Text>
                        </View>
                    </Card>
                ) : (
                    <>
                        <Section title={`Pending (${pending.length})`}>
                            {pending.length === 0 ? (
                                <Text style={{ color: theme.colors.subtext }}>No pending requests.</Text>
                            ) : (
                                pending.map((it) => (
                                    <ApprovalCard
                                        key={it.id}
                                        item={it}
                                        approver={approver}
                                        onApprove={() => dispatch(approve({ id: it.id, approver }))}
                                        onReject={() => {
                                            Alert.alert("Reject request", "Reject this request?", [
                                                { text: "Cancel", style: "cancel" },
                                                {
                                                    text: "Reject",
                                                    style: "destructive",
                                                    onPress: () => dispatch(reject({ id: it.id, approver, reason: "Rejected in demo" })),
                                                },
                                            ]);
                                        }}
                                    />
                                ))
                            )}
                        </Section>

                        <Section title="History">
                            {items
                                .filter((r) => r.status === "APPROVED" || r.status === "REJECTED")
                                .slice(0, 20)
                                .map((it) => (
                                    <Card key={it.id}>
                                        <Row label="ID" value={it.id} />
                                        <Row label="Status" value={it.status} />
                                        {it.type === "TRANSFER" ? (
                                            <>
                                                <Row label="Asset" value={`${it.amount} ${it.asset}`} />
                                                <Row label="To" value={shortAddr(it.toAddress)} />
                                            </>
                                        ) : (
                                            <Row label="Summary" value={(it as any).summary ?? "Order review"} />
                                        )}
                                    </Card>
                                ))}
                        </Section>
                    </>
                )}
            </ScrollView>
        </Screen>
    );
}

function ApprovalCard({
    item,
    approver,
    onApprove,
    onReject,
}: {
    item: ApprovalItem;
    approver: string;
    onApprove: () => void;
    onReject: () => void;
}) {
    const isTransfer = item.type === "TRANSFER";
    const tr = item as TransferRequest;

    const approvalsText = isTransfer ? `${tr.approvals.length}/${tr.approvalsRequired}` : "—";
    const approvedByYou = isTransfer ? tr.approvals.some((a) => a.by === approver) : false;

    return (
        <Card>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 16,
                        backgroundColor: theme.colors.infoBg,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                    }}
                >
                    <Ionicons name="checkmark-done-outline" size={18} color={theme.colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900", fontSize: 16, color: theme.colors.text }}>{item.id}</Text>
                    <Text style={{ color: theme.colors.subtext }}>
                        {item.status}
                        {isTransfer ? ` • approvals ${approvalsText}` : ""}
                    </Text>
                </View>

                {isTransfer && tr.riskScore >= 70 ? (
                    <View
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 999,
                            backgroundColor: "#FFF2F2",
                            borderWidth: 1,
                            borderColor: "#FFD1D1",
                        }}
                    >
                        <Text style={{ color: "#B91C1C", fontWeight: "900" }}>High risk</Text>
                    </View>
                ) : null}
            </View>

            {isTransfer ? (
                <>
                    <Row label="From" value={tr.fromVault} />
                    <Row label="Asset" value={`${tr.amount} ${tr.asset}`} />
                    <Row label="To" value={shortAddr(tr.toAddress)} />
                    <Row label="Fee" value={tr.feeLabel} />
                    <Row label="ETA" value={tr.etaLabel} />
                    <Row label="Risk" value={`${tr.riskScore}/100`} />
                </>
            ) : (
                <Row label="Summary" value={(item as any).summary ?? "Order review"} />
            )}

            <View style={{ height: 12 }} />

            <PrimaryButton
                title={approvedByYou ? "Approved by you" : "Approve"}
                icon="checkmark-circle-outline"
                disabled={approvedByYou}
                onPress={onApprove}
            />

            <View style={{ height: 10 }} />

            <PrimaryButton title="Reject" icon="close-circle-outline" onPress={onReject} />
        </Card>
    );
}

function shortAddr(a: string) {
    if (!a) return "";
    if (a.length <= 14) return a;
    return `${a.slice(0, 8)}…${a.slice(-6)}`;
}
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "../../ui/components/Screen";
import { Card } from "../../ui/components/Card";
import { Field } from "../../ui/components/Field";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { Section } from "../../ui/components/Section";
import { Row } from "../../ui/components/Row";
import { theme } from "../../ui/themes/theme";

import { useBalances, useVaults } from "./custodyHooks";
import { approvalsRequiredForVault, isColdVault } from "../../domain/policy";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { enqueueTransfer } from "../../store/slices/approvalQueueSlice";

type Mode = "Overview" | "Transfers";

export function CustodyScreen() {
  const vaults = useVaults();
  const balances = useBalances();

  const [mode, setMode] = useState<Mode>("Overview");

  // transfer form
  const [fromVault, setFromVault] = useState("vlt_2");
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("0.01");
  const [toAddress, setToAddress] = useState("bc1q-demo-address...");
  const [network, setNetwork] = useState("BTC");
  const [priority, setPriority] = useState("Standard"); // Standard | Fast
  const [memo, setMemo] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const approvalsCount = useAppSelector((s) =>
    s.approvalQueue.items.filter((x) => x.status === "PENDING" || x.status === "IN_REVIEW").length
  );

  const approvalsRequired = fromVault === "vlt_1" ? 2 : 1;
  const dailyLimit = 250000;

  const amountValue = Number(amount || "0");
  const usdApprox =
    asset.toUpperCase() === "BTC"
      ? amountValue * 98000
      : asset.toUpperCase() === "ETH"
      ? amountValue * 5200
      : amountValue;

  const allowlisted = toAddress.toLowerCase().startsWith("bc1q");
  const limitExceeded = usdApprox > dailyLimit;

  const riskScore = Math.min(
    100,
    10 +
      (approvalsRequired === 2 ? 25 : 0) +
      (usdApprox > 50000 ? 25 : 0) +
      (usdApprox > 150000 ? 25 : 0) +
      (priority.toLowerCase() === "fast" ? 10 : 0)
  );

  const feeLabel =
    network.toUpperCase() === "BTC"
      ? priority.toLowerCase() === "fast"
        ? "~0.00025 BTC"
        : "~0.00015 BTC"
      : priority.toLowerCase() === "fast"
      ? "~0.003 ETH"
      : "~0.002 ETH";

  const etaLabel = priority.toLowerCase() === "fast" ? "≈ 5–10 min" : "≈ 15–30 min";

  const canSubmitTransfer = useMemo(() => {
    return toAddress.trim().length > 10 && Number(amount) > 0 && asset.trim().length > 0;
  }, [toAddress, amount, asset]);

  async function onSubmitTransfer() {
    try {
      setSubmitting(true);

      const action = dispatch(
        enqueueTransfer({
          fromVault,
          toAddress,
          asset,
          amount: Number(amount),
          network,
          priority,
          memo,
          feeLabel,
          etaLabel,
          approvalsRequired,
          riskScore,
        })
      );

      // @reduxjs/toolkit returns payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = (action as any).payload;
      setSubmitResult(created.id);
      setReviewOpen(false);
      setMode("Overview");
    } finally {
      setSubmitting(false);
    }
  }

  const totalVaults = vaults.data?.length ?? 0;
  const totalBalances = balances.data?.length ?? 0;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        {/* Hero */}
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

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.22)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="lock-closed-outline" size={22} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "800" }}>Custody</Text>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", marginTop: 2 }}>
                Vaults & balances
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
                {totalVaults} vault(s) • {totalBalances} balance row(s)
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate("Approvals")}
              style={{
                backgroundColor: "rgba(255,255,255,0.20)",
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "900" }}>{approvalsCount}</Text>
            </Pressable>
          </View>
        </View>

        {/* Segmented */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <SegTab active={mode === "Overview"} label="Overview" icon="grid-outline" onPress={() => setMode("Overview")} />
          <SegTab active={mode === "Transfers"} label="Transfers" icon="send-outline" onPress={() => setMode("Transfers")} />
        </View>

        {mode === "Transfers" ? (
          <>
            <Text style={{ fontSize: 28, fontWeight: "900", marginBottom: 12, color: theme.colors.text }}>
              Create transfer
            </Text>

            <Card>
              <Field label="From Vault ID" value={fromVault} onChangeText={setFromVault} icon="lock-closed-outline" />
              <Field label="Asset" value={asset} onChangeText={setAsset} icon="pricetag-outline" />
              <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" icon="calculator-outline" />
              <Field label="To Address" value={toAddress} onChangeText={setToAddress} icon="location-outline" />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Network" value={network} onChangeText={setNetwork} icon="git-network-outline" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Priority" value={priority} onChangeText={setPriority} icon="speedometer-outline" />
                </View>
              </View>

              <Field label="Memo / Note (optional)" value={memo} onChangeText={setMemo} icon="document-text-outline" />

              <View style={{ marginTop: 6 }}>
                <Row label="Estimated network fee" value={feeLabel} />
                <Row label="Estimated ETA" value={etaLabel} />
                <Row label="Approvals required" value={`${approvalsRequired}`} />
                <Row label="Risk score" value={`${riskScore}/100`} />

                <View style={{ marginTop: 10 }}>
                  <PolicyRow ok={allowlisted} text="Destination is allowlisted (demo rule: bc1q…)" />
                  <PolicyRow ok={!limitExceeded} text="Within daily transfer limit (demo)" />
                </View>
              </View>

              <View style={{ height: 12 }} />

              <PrimaryButton
                title="Review Transfer"
                icon="eye-outline"
                disabled={!canSubmitTransfer}
                onPress={() => setReviewOpen(true)}
              />

              {submitResult ? (
                <View
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 14,
                    backgroundColor: "#ECFDF5",
                    borderWidth: 1,
                    borderColor: "#BBF7D0",
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
                  <Text style={{ flex: 1, color: "#14532D", fontWeight: "800" }}>
                    Added to approvals queue: {submitResult}
                  </Text>
                </View>
              ) : null}
            </Card>

            {reviewOpen ? (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  justifyContent: "center",
                  padding: 18,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "900", marginBottom: 10, color: theme.colors.text }}>
                    Review transfer
                  </Text>

                  <Row label="From" value={fromVault} />
                  <Row label="Asset" value={asset} />
                  <Row label="Amount" value={amount} />
                  <Row label="To" value={toAddress} />
                  <Row label="Network" value={network} />
                  <Row label="Priority" value={priority} />
                  <Row label="Fee" value={feeLabel} />
                  <Row label="ETA" value={etaLabel} />
                  <Row label="Approvals" value={`${approvalsRequired}`} />
                  <Row label="Risk" value={`${riskScore}/100`} />
                  {memo.trim() ? <Row label="Memo" value={memo} /> : null}

                  <View style={{ marginTop: 12 }}>
                    <PolicyRow ok={allowlisted} text="Destination is allowlisted" />
                    <PolicyRow ok={!limitExceeded} text="Within daily transfer limit" />
                  </View>

                  <View style={{ height: 14 }} />

                  <PrimaryButton
                    title={submitting ? "Submitting…" : "Submit Transfer Request"}
                    icon="paper-plane-outline"
                    disabled={submitting || !allowlisted || limitExceeded}
                    onPress={onSubmitTransfer}
                  />

                  <View style={{ height: 10 }} />

                  <PrimaryButton title="Cancel" icon="close-outline" onPress={() => setReviewOpen(false)} />
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <Section title="Custody Vaults">
              {vaults.isLoading ? (
                <Text style={{ color: theme.colors.subtext }}>Loading vaults…</Text>
              ) : (
                vaults.data?.map((v) => {
                  const cold = isColdVault(v);
                  const approvals = approvalsRequiredForVault(v);

                  return (
                    <Card key={v.id}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 16,
                            backgroundColor: theme.colors.infoBg,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name={cold ? "snow-outline" : "flash-outline"} size={20} color={theme.colors.primary} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "900", fontSize: 16, color: theme.colors.text }}>{v.name}</Text>
                          <Text style={{ color: theme.colors.subtext }}>
                            {cold ? "Cold (higher security)" : "Hot (faster access)"}
                          </Text>
                        </View>

                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ fontWeight: "900", color: theme.colors.text }}>{approvals} approvals</Text>
                          <Text style={{ color: theme.colors.subtext, fontWeight: "800" }}>required</Text>
                        </View>
                      </View>

                      <Text style={{ color: theme.colors.subtext }}>
                        Custody vs exchange risk: assets here are held under vault controls + policies, not left on an exchange.
                      </Text>
                    </Card>
                  );
                })
              )}
            </Section>

            <Section title="Balances">
              {balances.isLoading ? (
                <Text style={{ color: theme.colors.subtext }}>Loading balances…</Text>
              ) : (
                balances.data?.map((b, idx) => (
                  <Card key={`${b.accountId}_${b.symbol}_${idx}`}>
                    <Row label="Vault" value={b.accountId} />
                    <Row label="Asset" value={b.symbol} />
                    <Row label="Amount" value={String(b.amount)} />
                  </Card>
                ))
              )}
            </Section>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function SegTab({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? theme.colors.primary : "transparent",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={18} color={active ? "#fff" : theme.colors.text} />
        <Text style={{ fontWeight: "900", color: active ? "#fff" : theme.colors.text }}>{label}</Text>
      </View>
    </Pressable>
  );
}

function PolicyRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
      <Ionicons name={ok ? "checkmark-circle-outline" : "close-circle-outline"} size={18} color={ok ? "#16A34A" : "#DC2626"} />
      <Text style={{ flex: 1, color: ok ? "#14532D" : "#7F1D1D", fontWeight: "800" }}>{text}</Text>
    </View>
  );
}
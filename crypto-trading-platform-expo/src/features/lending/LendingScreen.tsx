// src/features/lending/LendingScreen.tsx
import React, { useMemo, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../ui/components/Screen";
import { Card } from "../../ui/components/Card";
import { Field } from "../../ui/components/Field";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { Section } from "../../ui/components/Section";
import { Row } from "../../ui/components/Row";
import { theme } from "../../ui/themes/theme";

import { useCreateLoanIntent, useLendingOffers } from "./lendingHooks";
import { fmtUSD } from "../../utils/format";

type IntentStatus = "PENDING" | "APPROVED";

type Intent = {
  id: string;
  status: IntentStatus;
  offerId: string;
  amount: number;
  apr: number;
  termDays: number;
  minAmount: number;
  createdAt: number;
};

export function LendingScreen() {
  const offers = useLendingOffers();
  const createIntent = useCreateLoanIntent();

  const [amount, setAmount] = useState("100000");

  // ✅ history feature (last 10)
  const [intentHistory, setIntentHistory] = useState<Intent[]>([]);
  const timers = useRef<Record<string, any>>({}); // avoid TS lib timer differences

  const amountNum = useMemo(() => Number(amount || "0"), [amount]);

  function estInterest(apr: number, termDays: number, principal: number) {
    return principal * (apr / 100) * (termDays / 365);
  }

  function formatWhen(ts: number) {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  }

  async function onCreate(offer: { id: string; apr: number; termDays: number; minAmount: number }) {
    if (amountNum <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }
    if (amountNum < offer.minAmount) {
      Alert.alert("Amount too low", `Minimum is ${fmtUSD(offer.minAmount)} for this offer.`);
      return;
    }

    try {
      const res = await createIntent.mutateAsync({ offerId: offer.id, amount: amountNum });

      const created: Intent = {
        id: res.id,
        status: "PENDING",
        offerId: offer.id,
        amount: amountNum,
        apr: offer.apr,
        termDays: offer.termDays,
        minAmount: offer.minAmount,
        createdAt: Date.now(),
      };

      // add to top, keep last 10
      setIntentHistory((prev) => [created, ...prev].slice(0, 10));

      // ✅ auto-approve simulation after 3 seconds
      if (timers.current[created.id]) clearTimeout(timers.current[created.id]);
      timers.current[created.id] = setTimeout(() => {
        setIntentHistory((prev) =>
          prev.map((it) => (it.id === created.id ? { ...it, status: "APPROVED" } : it))
        );
      }, 3000);
    } catch (e: any) {
      Alert.alert("Create intent failed", e?.message ?? "Please try again.");
    }
  }

  const latest = intentHistory[0] ?? null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", marginBottom: 12, color: theme.colors.text }}>
          Lending
        </Text>

        {/* Amount input */}
        <Card>
          <Field
            label="Amount (USDC)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="100000"
            icon="cash-outline"
          />
          <Text style={{ color: theme.colors.subtext }}>
            Lending is typically policy-controlled, with collateral + counterparty limits.
          </Text>
        </Card>

        {/* ✅ Latest intent summary */}
        {latest ? (
          <Card
            style={{
              backgroundColor: latest.status === "APPROVED" ? "#ECFDF5" : theme.colors.infoBg,
              borderColor: latest.status === "APPROVED" ? "#BBF7D0" : theme.colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Ionicons
                name={latest.status === "APPROVED" ? "checkmark-circle-outline" : "time-outline"}
                size={20}
                color={latest.status === "APPROVED" ? "#16A34A" : theme.colors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>
                  {latest.status === "APPROVED" ? "Loan intent approved" : "Loan intent created"}
                </Text>
                <Text style={{ color: theme.colors.subtext }}>
                  Status: {latest.status} {latest.status === "PENDING" ? "(auto-approve in ~3s)" : ""}
                </Text>
              </View>
            </View>

            <Row label="Intent ID" value={latest.id} />
            <Row label="Offer" value={latest.offerId} />
            <Row label="Amount" value={fmtUSD(latest.amount)} />
            <Row label="APR" value={`${latest.apr}%`} />
            <Row label="Term" value={`${latest.termDays} days`} />
            <Row label="Created" value={formatWhen(latest.createdAt)} />

            <View style={{ marginTop: 10 }}>
              <Text style={{ color: theme.colors.subtext }}>
                Est. interest ≈{" "}
                <Text style={{ fontWeight: "900", color: theme.colors.text }}>
                  {fmtUSD(estInterest(latest.apr, latest.termDays, latest.amount))}
                </Text>
              </Text>
            </View>
          </Card>
        ) : null}

        {/* ✅ Intent History */}
        <Section title={`Intent History (${intentHistory.length})`}>
          {intentHistory.length === 0 ? (
            <Text style={{ color: theme.colors.subtext }}>No intents yet. Create one from an offer below.</Text>
          ) : (
            intentHistory.map((it) => (
              <Card key={it.id}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 14,
                      backgroundColor: it.status === "APPROVED" ? "#ECFDF5" : theme.colors.infoBg,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={it.status === "APPROVED" ? "checkmark-outline" : "time-outline"}
                      size={18}
                      color={it.status === "APPROVED" ? "#16A34A" : theme.colors.primary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text }}>{it.offerId}</Text>
                    <Text style={{ color: theme.colors.subtext }}>{it.id}</Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text }}>{it.status}</Text>
                    <Text style={{ color: theme.colors.subtext }}>{fmtUSD(it.amount)}</Text>
                  </View>
                </View>

                <Row label="APR" value={`${it.apr}%`} />
                <Row label="Term" value={`${it.termDays} days`} />
                <Row label="Est. interest" value={fmtUSD(estInterest(it.apr, it.termDays, it.amount))} />
              </Card>
            ))
          )}
        </Section>

        {/* Offers */}
        <Section title="Offers">
          {offers.isLoading ? (
            <Text style={{ color: theme.colors.subtext }}>Loading offers…</Text>
          ) : (
            offers.data?.map((o) => {
              const disabled = createIntent.isPending || amountNum < o.minAmount || amountNum <= 0;

              return (
                <Card key={o.id}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        backgroundColor: theme.colors.infoBg,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <Ionicons name="cash-outline" size={18} color={theme.colors.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "900", fontSize: 16, color: theme.colors.text }}>{o.id}</Text>
                      <Text style={{ color: theme.colors.subtext }}>{o.symbol}</Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>{o.apr}%</Text>
                      <Text style={{ color: theme.colors.subtext, fontWeight: "800" }}>APR</Text>
                    </View>
                  </View>

                  <Row label="Term" value={`${o.termDays} days`} />
                  <Row label="Minimum" value={fmtUSD(o.minAmount)} />

                  <View style={{ marginTop: 10 }}>
                    <Text style={{ color: theme.colors.subtext }}>
                      Est. interest on {fmtUSD(amountNum || 0)} ≈{" "}
                      <Text style={{ fontWeight: "900", color: theme.colors.text }}>
                        {fmtUSD(estInterest(o.apr, o.termDays, amountNum || 0))}
                      </Text>
                    </Text>
                  </View>

                  <View style={{ height: 12 }} />

                  <PrimaryButton
                    title={createIntent.isPending ? "Creating…" : "Create Loan Intent"}
                    icon="document-text-outline"
                    disabled={disabled}
                    onPress={() => onCreate(o)}
                  />

                  {amountNum < o.minAmount ? (
                    <Text style={{ marginTop: 10, color: theme.colors.subtext }}>
                      Minimum required: {fmtUSD(o.minAmount)}
                    </Text>
                  ) : null}
                </Card>
              );
            })
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}
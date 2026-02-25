// ✅ FULL FILE: src/features/liquidity/LiquidityScreen.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../ui/components/Screen";
import { Card } from "../../ui/components/Card";
import { Field } from "../../ui/components/Field";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { Section } from "../../ui/components/Section";
import { Row } from "../../ui/components/Row";
import { theme } from "../../ui/themes/theme";

import { fmtUSD } from "../../utils/format";
import { useRfq } from "./liquidityHooks";

export function LiquidityScreen() {
  const rfq = useRfq();

  const [base, setBase] = useState("BTC");
  const [quote, setQuote] = useState("USDC");
  const [notional, setNotional] = useState("250000");

  const notionalNum = useMemo(() => Number(notional || "0"), [notional]);
  const canSubmit = notionalNum > 0 && !rfq.isPending;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", marginBottom: 12, color: theme.colors.text }}>
          Liquidity
        </Text>

        <Card>
          <Field label="Base" value={base} onChangeText={setBase} placeholder="BTC" icon="cube-outline" />
          <Field label="Quote" value={quote} onChangeText={setQuote} placeholder="USDC" icon="cash-outline" />
          <Field
            label="Notional"
            value={notional}
            onChangeText={setNotional}
            keyboardType="numeric"
            placeholder="250000"
            icon="calculator-outline"
          />

          <PrimaryButton
            title={rfq.isPending ? "Requesting…" : "Request Quotes"}
            icon="water-outline"
            disabled={!canSubmit}
            onPress={() => rfq.mutate({ base, quote, notional: notionalNum })}
          />

          <Text style={{ marginTop: 12, color: theme.colors.subtext }}>
            RFQ is common for institutional execution (multi-venue quotes, best price, expiry).
          </Text>
        </Card>

        <Section title="Quotes">
          {!rfq.data?.length ? (
            <Text style={{ color: theme.colors.subtext }}>
              {rfq.isPending ? "Fetching quotes…" : "No quotes yet. Request quotes to see venues."}
            </Text>
          ) : (
            rfq.data.map((q) => (
              <Card key={q.id}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 14,
                      backgroundColor: theme.colors.infoBg,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="water-outline" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900", fontSize: 16, color: theme.colors.text }}>
                      {q.venue}
                    </Text>
                    <Text style={{ color: theme.colors.subtext }}>RFQ venue</Text>
                  </View>
                </View>

                <Row label="Price" value={fmtUSD(q.price)} />
                <Row label="Expires" value={new Date(q.expiresAt).toLocaleTimeString()} />
              </Card>
            ))
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}
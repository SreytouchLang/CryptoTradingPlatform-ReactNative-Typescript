// ✅ FULL FILE: src/features/trade/TradeScreen.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Screen } from "../../ui/components/Screen";
import { Card } from "../../ui/components/Card";
import { Field } from "../../ui/components/Field";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { Section } from "../../ui/components/Section";
import { Row } from "../../ui/components/Row";
import { theme } from "../../ui/themes/theme";

import { useOrders, usePlaceOrder, useQuote } from "./tradeHooks";
import { fmtUSD } from "../../utils/format";
import { newIdempotencyKey } from "../../utils/idempotency";

export function TradeScreen() {
  const [symbol, setSymbol] = useState("BTC");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState("0.1");
  const [accountId, setAccountId] = useState("vlt_2"); // hot vault by default

  const quote = useQuote(symbol);
  const orders = useOrders();
  const place = usePlaceOrder();

  const price = side === "BUY" ? quote.data?.ask : quote.data?.bid;

  const notional = useMemo(() => {
    const q = Number(qty || "0");
    return price ? q * price : 0;
  }, [qty, price]);

  const canSubmit = !!price && Number(qty) > 0 && !place.isPending;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            marginBottom: 12,
            color: theme.colors.text,
          }}
        >
          Trade
        </Text>

        <Card>
          <Field
            label="Symbol (BTC/ETH/USDC)"
            value={symbol}
            onChangeText={setSymbol}
            placeholder="BTC"
            icon="pricetag-outline"
          />

          <Field
            label="Side (BUY/SELL)"
            value={side}
            onChangeText={(t) =>
              setSide(t.toUpperCase() === "SELL" ? "SELL" : "BUY")
            }
            placeholder="BUY"
            icon="swap-horizontal-outline"
          />

          <Field
            label="Quantity"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
            placeholder="0.1"
            icon="calculator-outline"
          />

          <Field
            label="Account/Vault ID"
            value={accountId}
            onChangeText={setAccountId}
            placeholder="vlt_2"
            icon="lock-closed-outline"
          />

          <View style={{ marginTop: 6 }}>
            <Row label="Quote" value={price ? fmtUSD(price) : "—"} />
            <Row label="Notional" value={fmtUSD(notional)} />
            <Text style={{ marginTop: 8, color: theme.colors.subtext }}>
              Security note: writes use idempotency keys to prevent duplicates.
            </Text>
          </View>

          <View style={{ height: 12 }} />

          <PrimaryButton
            title={place.isPending ? "Placing…" : "Place Order"}
            icon="paper-plane-outline"
            disabled={!canSubmit}
            onPress={() =>
              place.mutate({
                symbol,
                side,
                qty: Number(qty),
                accountId,
                idempotencyKey: newIdempotencyKey("order"),
              })
            }
          />

          {place.error ? (
            <Text style={{ marginTop: 10, color: "crimson" }}>
              Failed to place order.
            </Text>
          ) : null}
        </Card>

        <Section title="Recent Orders">
          {!orders.data?.length ? (
            <Text style={{ color: theme.colors.subtext }}>No orders yet.</Text>
          ) : (
            orders.data.map((o) => (
              <Card key={o.id}>
                <Row label="ID" value={o.id} />
                <Row label="Asset" value={o.symbol} />
                <Row label="Side" value={o.side} />
                <Row label="Qty" value={String(o.qty)} />
                <Row label="Price" value={fmtUSD(o.price)} />
                <Row label="Status" value={o.status} />
                <Row label="Risk" value={`${o.riskScore}/100`} />
                <Text style={{ marginTop: 8, color: theme.colors.subtext }}>
                  If risk is high, status goes to REVIEW (institutional controls).
                </Text>
              </Card>
            ))
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}
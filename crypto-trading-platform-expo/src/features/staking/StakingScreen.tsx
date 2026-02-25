// ✅ FULL FILE: src/features/staking/StakingScreen.tsx
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

import { useStake, useStaking } from "./stakingHooks";

export function StakingScreen() {
  const staking = useStaking();
  const stake = useStake();

  const [symbol, setSymbol] = useState("ETH");
  const [amount, setAmount] = useState("5");

  const canSubmit = useMemo(() => Number(amount) > 0 && !stake.isPending, [amount, stake.isPending]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", marginBottom: 12, color: theme.colors.text }}>
          Staking
        </Text>

        <Card>
          <Field label="Symbol" value={symbol} onChangeText={setSymbol} placeholder="ETH" icon="leaf-outline" />
          <Field
            label="Amount to stake"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="5"
            icon="calculator-outline"
          />

          <PrimaryButton
            title={stake.isPending ? "Staking…" : "Stake"}
            icon="leaf-outline"
            disabled={!canSubmit}
            onPress={() => stake.mutate({ symbol, amount: Number(amount) })}
          />

          <Text style={{ marginTop: 12, color: theme.colors.subtext }}>
            Institutional staking often includes validator risk, slashing risk, and policy approval.
          </Text>
        </Card>

        <Section title="Positions">
          {staking.isLoading ? (
            <Text style={{ color: theme.colors.subtext }}>Loading positions…</Text>
          ) : (
            staking.data?.map((s) => (
              <Card key={s.symbol}>
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
                    <Ionicons name="leaf-outline" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900", fontSize: 16, color: theme.colors.text }}>
                      {s.symbol}
                    </Text>
                    <Text style={{ color: theme.colors.subtext }}>Staking position</Text>
                  </View>
                </View>

                <Row label="Staked" value={String(s.stakedAmount)} />
                <Row label="APR" value={`${s.apr}%`} />
                <Row label="Rewards YTD" value={String(s.rewardsYtd)} />
              </Card>
            ))
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}
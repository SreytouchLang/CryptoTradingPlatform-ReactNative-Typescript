import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../ui/components/Screen";
import { Card } from "../../ui/components/Card";
import { Field } from "../../ui/components/Field";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { Section } from "../../ui/components/Section";
import { Row } from "../../ui/components/Row";
import { theme } from "../../ui/themes/theme";

import {
  useApproveTransfer,
  useCreateTransferDraft,
  useSubmitTransferForApproval,
  useTransfers,
} from "./custodyHooks";

type Priority = "Standard" | "Fast";

export function TransferScreen() {
  const transfers = useTransfers();
  const createDraft = useCreateTransferDraft();
  const submitForApproval = useSubmitTransferForApproval();
  const approve = useApproveTransfer();

  const [fromVault, setFromVault] = useState("vlt_2");
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("0.01");
  const [toAddress, setToAddress] = useState("bc1q-demo-address...");
  const [network, setNetwork] = useState("BTC");
  const [priority, setPriority] = useState<Priority>("Standard");
  const [memo, setMemo] = useState("");

  const amountNum = useMemo(() => Number(amount || "0"), [amount]);

  const canCreateDraft =
    fromVault.trim().length > 0 &&
    asset.trim().length > 0 &&
    amountNum > 0 &&
    toAddress.trim().length > 10;

  const allowlisted = useMemo(() => toAddress.toLowerCase().startsWith("bc1q"), [toAddress]);

  async function onCreateDraft() {
    try {
      const res = await createDraft.mutateAsync({
        fromVault,
        toAddress: toAddress.trim(),
        asset: asset.trim().toUpperCase(),
        amount: amountNum,
        network: network.trim().toUpperCase(),
        priority,
        memo: memo.trim() ? memo.trim() : undefined,
      });

      Alert.alert("Draft created", `Transfer ID: ${res.id}`);
    } catch (e: any) {
      Alert.alert("Create draft failed", e?.message ?? "Please try again.");
    }
  }

  async function onSubmitLatestDraft() {
    const latestDraft = transfers.data?.find((t) => t.status === "DRAFT");
    if (!latestDraft) {
      Alert.alert("No draft found", "Create a draft first.");
      return;
    }

    try {
      const res = await submitForApproval.mutateAsync({ id: latestDraft.id });
      Alert.alert("Submitted", `Status: ${res.status}`);
    } catch (e: any) {
      Alert.alert("Submit failed", e?.message ?? "Please try again.");
    }
  }

  async function onApproveFirstPending() {
    const pending = transfers.data?.find((t) => t.status === "PENDING_APPROVAL");
    if (!pending) {
      Alert.alert("Nothing pending", "No transfer is pending approval right now.");
      return;
    }

    try {
      const res = await approve.mutateAsync({ id: pending.id });
      Alert.alert("Approved action", `Status: ${res.status} (${res.approvals}/${res.approvalsRequired})`);
    } catch (e: any) {
      Alert.alert("Approve failed", e?.message ?? "Please try again.");
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", marginBottom: 12, color: theme.colors.text }}>
          Transfers
        </Text>

        <Card>
          <Field label="From Vault" value={fromVault} onChangeText={setFromVault} icon="lock-closed-outline" />
          <Field label="Asset" value={asset} onChangeText={setAsset} icon="pricetag-outline" />
          <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" icon="calculator-outline" />
          <Field label="To Address" value={toAddress} onChangeText={setToAddress} icon="location-outline" />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="Network" value={network} onChangeText={setNetwork} icon="git-network-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Priority (Standard/Fast)"
                value={priority}
                onChangeText={(t) => setPriority(t.toLowerCase() === "fast" ? "Fast" : "Standard")}
                icon="speedometer-outline"
              />
            </View>
          </View>

          <Field label="Memo (optional)" value={memo} onChangeText={setMemo} icon="document-text-outline" />

          <View
            style={{
              marginTop: 6,
              padding: 12,
              borderRadius: 14,
              backgroundColor: theme.colors.infoBg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ionicons
              name={allowlisted ? "checkmark-circle-outline" : "warning-outline"}
              size={18}
              color={allowlisted ? theme.colors.primary : "#B91C1C"}
            />
            <Text style={{ flex: 1, color: theme.colors.subtext }}>
              Demo policy: destination must start with <Text style={{ fontWeight: "900" }}>bc1q</Text> to be allowlisted.
            </Text>
          </View>

          <View style={{ height: 12 }} />

          <PrimaryButton
            title={createDraft.isPending ? "Creating…" : "Create Transfer Draft"}
            icon="create-outline"
            disabled={!canCreateDraft || createDraft.isPending}
            onPress={onCreateDraft}
          />

          <View style={{ height: 10 }} />

          <PrimaryButton
            title={submitForApproval.isPending ? "Submitting…" : "Submit Latest Draft for Approval"}
            icon="paper-plane-outline"
            disabled={submitForApproval.isPending}
            onPress={onSubmitLatestDraft}
          />

          <View style={{ height: 10 }} />

          <PrimaryButton
            title={approve.isPending ? "Approving…" : "Approve First Pending"}
            icon="checkmark-done-outline"
            disabled={approve.isPending}
            onPress={onApproveFirstPending}
          />
        </Card>

        <Section title="Transfer History">
          {transfers.isLoading ? (
            <Text style={{ color: theme.colors.subtext }}>Loading transfers…</Text>
          ) : !transfers.data?.length ? (
            <Text style={{ color: theme.colors.subtext }}>No transfers yet.</Text>
          ) : (
            transfers.data.map((t) => (
              <Card key={t.id}>
                <Row label="ID" value={t.id} />
                <Row label="Status" value={t.status} />
                <Row label="From" value={t.fromVault} />
                <Row label="Asset" value={`${t.amount} ${t.asset}`} />
                <Row label="To" value={shortAddr(t.toAddress)} />
                <Row label="Fee" value={t.feeLabel} />
                <Row label="ETA" value={t.etaLabel} />
                <Row label="Approvals" value={`${t.approvals}/${t.approvalsRequired}`} />
              </Card>
            ))
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}

function shortAddr(a: string) {
  if (!a) return "";
  if (a.length <= 16) return a;
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}
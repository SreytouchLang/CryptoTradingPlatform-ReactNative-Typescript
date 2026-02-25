import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/api/endpoints";
import { queryClient } from "@/app/queryClient";

export function useVaults() {
  return useQuery({ queryKey: ["vaults"], queryFn: api.vaults });
}

export function useBalances() {
  return useQuery({ queryKey: ["balances"], queryFn: api.balances });
}

export function useTransfers() {
  return useQuery({ queryKey: ["transfers"], queryFn: api.transfers });
}

export function useCreateTransferDraft() {
  return useMutation({
    mutationFn: api.createTransferDraft,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}

export function useSubmitTransferForApproval() {
  return useMutation({
    mutationFn: api.submitTransferForApproval,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}

export function useApproveTransfer() {
  return useMutation({
    mutationFn: api.approveTransfer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transfers"] });
      await queryClient.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

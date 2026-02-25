import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/api/endpoints";
import { queryClient } from "@/app/queryClient";

export function useStaking() {
  return useQuery({ queryKey: ["staking"], queryFn: api.staking });
}

export function useStake() {
  return useMutation({
    mutationFn: api.stake,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["staking"] });
      await queryClient.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

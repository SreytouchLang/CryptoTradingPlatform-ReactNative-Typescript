import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/api/endpoints";
import { queryClient } from "@/app/queryClient";

export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => api.quote(symbol),
    enabled: !!symbol,
    refetchInterval: 10_000,
  });
}

export function useOrders() {
  return useQuery({ queryKey: ["orders"], queryFn: api.orders });
}

export function usePlaceOrder() {
  return useMutation({
    mutationFn: api.placeOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

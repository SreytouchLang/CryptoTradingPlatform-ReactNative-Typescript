import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/api/endpoints";

export function useLendingOffers() {
  return useQuery({ queryKey: ["lendingOffers"], queryFn: api.lendingOffers });
}

export function useCreateLoanIntent() {
  return useMutation({ mutationFn: api.createLoanIntent });
}

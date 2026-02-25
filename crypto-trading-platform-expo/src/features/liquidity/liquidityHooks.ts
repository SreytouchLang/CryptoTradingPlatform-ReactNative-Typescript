import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/endpoints";

export function useRfq() {
  return useMutation({ mutationFn: api.rfq });
}

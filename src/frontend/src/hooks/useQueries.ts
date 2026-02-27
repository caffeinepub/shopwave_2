import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { ProductOutput, CartOutput } from "../backend.d";
import type { ProductInput } from "../backend";

// ─── Products ────────────────────────────────────────────────────────────────

export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<ProductOutput[]>({
    queryKey: ["products", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSearchProducts(keyword: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<ProductOutput[]>({
    queryKey: ["products", "search", keyword],
    queryFn: async () => {
      if (!actor) return [];
      if (!keyword.trim()) return actor.getAllProducts();
      return actor.searchByName(keyword.trim());
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useFilterByCategory(category: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<ProductOutput[]>({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getAllProducts();
      return actor.filterByCategory(category);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProduct(productId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<ProductOutput | null>({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!actor || !productId) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !actorFetching && !!productId,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productInput: ProductInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProduct(productInput);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["products", "all"] });
    },
  });
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function useGetCallerCart() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<CartOutput>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerCart();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCartItemCount() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["cart", "count"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCallerCartItemCount();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCartItem(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearCallerCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

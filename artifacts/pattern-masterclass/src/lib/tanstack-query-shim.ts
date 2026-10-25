/**
 * Lightweight, zero-dependency shim for @tanstack/react-query.
 * Satisfies Orval-generated query hooks without bundling heavy unused dependencies.
 */
export function useQuery<TData = unknown>(options?: unknown): {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
} {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => undefined,
  };
}

export function useMutation<TData = unknown, TVariables = unknown>(options?: unknown): {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  reset: () => void;
} {
  return {
    mutate: () => {},
    mutateAsync: async () => (undefined as unknown as TData),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: () => {},
  };
}

export type MutationFunction<TData = unknown, TVariables = unknown> = (variables: TVariables) => Promise<TData>;
export type QueryFunction<T = unknown> = (context: unknown) => Promise<T>;
export type QueryKey = readonly unknown[];
export type UseMutationOptions<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown> = Record<string, unknown>;
export type UseMutationResult<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown> = ReturnType<typeof useMutation<TData, TVariables>>;
export type UseQueryOptions<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData> = Record<string, unknown>;
export type UseQueryResult<TData = unknown, TError = unknown> = ReturnType<typeof useQuery<TData>>;

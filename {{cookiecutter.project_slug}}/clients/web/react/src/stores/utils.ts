import { StoreApi, UseBoundStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

/**
 * Utility function to create selectors on the wrapped zustand store.
 * @example
 * ```typescript
 * //instead of
 * const someStoreField = useStore( s => s.someStoreField )
 * // we can do
 * const someStoreField = useStore.use.someStoreField()
 * ```
 * @url https://github.com/pmndrs/zustand/blob/main/docs/guides/auto-generating-selectors.md
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

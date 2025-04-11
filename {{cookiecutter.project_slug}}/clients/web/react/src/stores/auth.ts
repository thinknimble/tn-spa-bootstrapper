import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../services/user'
import { createSelectors } from './utils'

type AuthState = {
  token: string
  hasHydrated: Promise<boolean>
  userId: string
  /**
   * @deprecated This is a copy of the user model, we keep this in local storage to have it readily available on app load. We will update it accordingly in time if the server user has changed. Do not use this as source of truth, use `useUser` from `src/services/user` instead
   */
  user: User | null
  isClearingAuth: boolean
  tokenExpirationDate: null | string
  actions: {
    hydrate: () => void
    changeToken: (t: string) => void
    changeUserId: (id: string) => void
    clearAuth: () => void
    /**
     * Use only if you're syncing this state with the server
     * @deprecated
     */
    writeUserInStorage: (user: User) => void
    changeTokenExpirationDate: (tokenExpirationDate: string) => void
  }
}
let resolveHydrationValue: (value: boolean) => void
const hasHydrated = new Promise<boolean>((res) => {
  resolveHydrationValue = res
})

const defaultValues: Omit<AuthState, 'actions' | 'hasHydrated'> = {
  token: '',
  userId: '',
  user: null,
  isClearingAuth: false,
  tokenExpirationDate: null,
}

export const useAuth = createSelectors(
  create<AuthState>()(
    // This is a middleware that will auto-persist our changes in the store to the local storage. So anything that is within the store we will save into LocalStorage automagically.If there are any fields in this store that you don't want here you can customize the `partialize` callback further down
    persist(
      (set) => ({
        hasHydrated,
        ...defaultValues,
        actions: {
          changeToken(t) {
            set({ token: t, isClearingAuth: false })
          },
          changeUserId(id) {
            set({ userId: id })
          },
          hydrate() {
            resolveHydrationValue(true)
          },
          clearAuth() {
            set({ ...defaultValues })
          },
          writeUserInStorage(user) {
            set({ user })
          },
          changeTokenExpirationDate(tokenExpirationDate) {
            set({ tokenExpirationDate })
          },
        },
      }),
      {
        name: 'auth',
        onRehydrateStorage: () => (state) => {
          if (!state) {
            return
          }
          // we're going to store this store in local storage so we must make sure that hydration succeeds
          state.actions.hydrate()
        },
        partialize(state) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { actions: _, ...rest } = state
          return rest
        },
      },
    ),
  ),
)

import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { UserShape as User, userApi } from '@services/user/'
import { queryClient } from '@utils/query-client'
import { createSelectors } from '@stores/utils'

type AuthState = {
  token: string
  hasHydrated: Promise<boolean>
  userId: string
  expoToken: string
  /**
   * @deprecated This is a copy of the user model, we keep this in local store to have it readily available on app load. We will update it accordingly in time if the server user has changed. Do not use this as source of truth, use `useUser` instead
   */
  user: User | null
  actions: {
    hydrate: () => void
    changeToken: (t: string) => void
    changeUserId: (id: string) => void
    clearAuth: () => void
    changeExpoToken: (et: string) => void
    /**
     * @deprecated Use only if you're syncing this state with the server
     */
    writeUserInStorage: (user: User) => void
  }
}

let resolveHydrationValue: (value: boolean) => void
const hasHydrated = new Promise<boolean>((res) => {
  resolveHydrationValue = res
})

const defaultState: Omit<AuthState, 'actions'> = {
  expoToken: '',
  hasHydrated,
  token: '',
  userId: '',
  user: null,
}

export const useAuth = createSelectors(
  create<AuthState>()(
    persist(
      (set) => ({
        ...defaultState,
        actions: {
          changeToken(t) {
            set({ token: t })
          },
          changeUserId(id) {
            set({ userId: id })
          },
          hydrate() {
            resolveHydrationValue(true)
          },
          clearAuth() {
            set({
              token: '',
              userId: '',
              user: null,
            })
          },
          changeExpoToken(et) {
            set({ expoToken: et })
          },
          writeUserInStorage(user) {
            set({ user })
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
        storage: createJSONStorage(() => AsyncStorage),
        partialize(state) {
          // ignore actions since functions are not serializable for localStorage
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { actions, ...rest } = state
          return rest
        },
      },
    ),
  ),
)

export const logout = async() => {
  await userApi.csc.logout()
  useAuth.getState().actions.clearAuth()
  queryClient.invalidateQueries({queryKey: ['user']})
}

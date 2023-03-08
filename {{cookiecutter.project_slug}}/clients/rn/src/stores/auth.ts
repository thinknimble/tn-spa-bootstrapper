import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { client } from '../../App'
import { User } from '../services/user'
import { createSelectors } from './utils'

type AuthState = {
  token: string
  hasHydrated: boolean
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

const defaultState: Omit<AuthState, 'actions'> = {
  expoToken: '',
  hasHydrated: false,
  token: '',
  userId: '',
  user: null,
}

export const useAuth = createSelectors(
  create<AuthState>()(
    persist(
      (set, get) => ({
        ...defaultState,
        actions: {
          changeToken(t) {
            set({ token: t })
          },
          changeUserId(id) {
            set({ userId: id })
          },
          hydrate() {
            set({ hasHydrated: true })
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
          const { actions, ...rest } = state
          return rest
        },
      },
    ),
  ),
)

export const logout = () => {
  useAuth.getState().actions.clearAuth()
  client.invalidateQueries(['user'])
}

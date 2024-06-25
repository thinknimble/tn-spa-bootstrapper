// Pinia Store
import { defineStore } from 'pinia'
import { UserShape } from '@/services/users'

const STORAGE_HASH = '{{ random_ascii_string(10) }}'
export const STORAGE_KEY = `{{ cookiecutter.project_slug }}-${STORAGE_HASH}`

interface State {
  user: UserShape | null
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    user: null,
  }),
  persist: {
    key: STORAGE_KEY,
  },
  getters: {
    isLoggedIn: (state) => {
      return !!state.user
    },
    token: (state) => {
      return state.user ? state.user.token : null
    },
  },
  actions: {
    updateUser(payload: UserShape) {
      this.user = payload
    },
    clearUser() {
      this.$reset()
    },
  },
})

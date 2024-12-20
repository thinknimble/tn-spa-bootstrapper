// Pinia Store
import { defineStore } from 'pinia'
import { UserShape } from '@/services/users'

const STORAGE_HASH = '{{ random_ascii_string(10) }}'
export const STORAGE_KEY = `{{ cookiecutter.project_slug }}-${STORAGE_HASH}`

interface State {
  user: UserShape | null
  token: string | null
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    token: null,
    user: null,
  }),
  persist: {
    key: STORAGE_KEY,
  },
  getters: {
    isLoggedIn: (state) => {
      return !!state.user
    },
  },
  actions: {
    updateUser(payload: UserShape) {
      this.user = payload
    },
    updateToken(payload: string) {
      this.token = payload
    },
    clearUser() {
      this.$reset()
    },
  },
})

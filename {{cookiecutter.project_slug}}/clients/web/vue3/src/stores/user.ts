// Pinia Store
import { defineStore } from 'pinia'
import { z } from 'zod'
import { UserShape } from '@/services/users'

const STORAGE_HASH = '{{ random_ascii_string(10) }}'
export const STORAGE_KEY = `{{ cookiecutter.project_slug }}-${STORAGE_HASH}`

interface State {
  user: UserShape | null
  token: z.string() | null
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    user: null,
    token: null,
  }),
  persist: {
    key: STORAGE_KEY,
  },
  getters: {
    isLoggedIn: (state) => {
      return !!state.user
    },
    token: (state) => {
      return state.token
    },
  },
  actions: {
    updateUser(payload: UserShape) {
      const { token, ...userData } = payload
      this.user = userData
      if (token) {
        this.token = token
      }
    },
    clearUser() {
      this.$reset()
    },
  },
})

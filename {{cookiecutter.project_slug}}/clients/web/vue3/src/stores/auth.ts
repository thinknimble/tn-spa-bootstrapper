// Pinia Store
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_HASH = 'aYlBAJpGke'
export const STORAGE_KEY = `{{ cookiecutter.project_slug }}-${STORAGE_HASH}`

export const useAuthStore = defineStore(
  'auth',
  () => {
    const userId = ref<string | null>(null)
    const token = ref<string | null>(null)

    const isLoggedIn = computed(() => Boolean(token.value))
    const updateAuth = (payload: { userId: string; token: string }) => {
      userId.value = payload.userId
      token.value = payload.token
    }
    const clearStore = () => {
      userId.value = null
      token.value = null
    }
    return {
      userId,
      token,
      isLoggedIn,
      updateAuth,
      clearStore,
    }
  },
  {
    persist: {
      key: STORAGE_KEY,
    },
  },
)

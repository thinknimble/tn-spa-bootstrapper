<template>
  <div class="font-avenir antialiased text-center">
    <div class="flex justify-center p-7">
      <router-link to="/" class="router">Home</router-link>
      <template v-if="isLoggedIn">
        |
        <router-link to="/dashboard" class="router">Dashboard</router-link>
        |
        <span id="logout" class="router underline" @click="logout()">Logout</span>
      </template>
      <template v-else>
        |
        <router-link to="/login" data-cy="login" class="router">Login</router-link>
        |
        <router-link to="/signup" class="router">Signup</router-link>
      </template>
    </div>
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const router = useRouter()

    async function logout() {
      await store.dispatch('setUser', null)
      router.push({ name: 'Home' })
    }

    return {
      logout,
      isLoggedIn: computed(() => store.getters.isLoggedIn),
    }
  },
}
</script>

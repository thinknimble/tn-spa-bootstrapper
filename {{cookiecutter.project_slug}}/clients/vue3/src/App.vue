<template>
  <div class="app font-avenir antialiased text-center">
    <div id="nav" class="nav flex justify-center p-7">
      <router-link to="/" class="router font-bold px-2 hover:cursor-pointer active:bg-blue-600">
        Home
      </router-link>
      <template v-if="isLoggedIn">
        |
        <router-link to="/dashboard" class="router font-bold px-2 hover:cursor-pointer">
          Dashboard
        </router-link>
        |
        <span
          id="logout"
          class="router font-bold px-2 hover:cursor-pointer underline"
          @click="logout()"
        >
          Logout
        </span>
      </template>
      <template v-else>
        |
        <router-link to="/login" data-cy="login" class="router font-bold px-2 hover:cursor-pointer">
          Login
        </router-link>
        |
        <router-link to="/signup" class="router font-bold px-2 hover:cursor-pointer">
          Signup
        </router-link>
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

<style scoped lang="css">
.router-link-exact-active {
  color: theme('colors.accent');
}
</style>

<template>
  <div id="nav">
    <router-link to="/">Home</router-link>
    <template v-if="isLoggedIn">
      | <router-link to="/dashboard">Dashboard</router-link> |
      <span id="logout" @click="logout()">Logout</span>
    </template>
    <template v-else>
      | <router-link to="/login" data-cy="login">Login</router-link> |
      <router-link to="/signup">Signup</router-link>
    </template>
  </div>
  <router-view />
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav #logout {
  /* Same style as a link */
  font-weight: bold;
  color: #2c3e50;
  text-decoration: underline;
  cursor: pointer;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

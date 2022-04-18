<template>
  <div class="login">
    <h1>This is a login page</h1>
    <form @submit.prevent="login">
      <label>
        Email:
        <br />
        <input
          v-model="email"
          spellcheck="false"
        />
      </label>
      <label>
        Password:
        <br />
        <input
          type="password"
          v-model="password"
          spellcheck="false"
        />
      </label>

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import User from '@/services/users'

export default {
  name: 'Login',
  data() {
    return {
      user: {
        email: '',
        password: '',
      },
    }
  },
  methods: {
    login() {
      if (this.$refs.form.checkValidity()) {
        User.api
          .login(this.user)
          .then(this.handleUser)
          .catch(this.handleError)
      } else this.$refs.form.reportValidity()
    },
    handleUser(user) {
      // // Update Store
      // this.$store.dispatch('setUser', user.data)

      // // Redirect
      // let route = this.$route.query.redirect
      // if (!route && user.data.is_admin) route = { name: 'DashboardAdmin' }
      // if (!route && (user.data.is_vendor || user.data.is_integrator)) route = { name: 'Dashboard' }
      // if (!route) route = { name: 'SystemSearch' }
      // this.$router.push(route)
    },
    handleError() {
      // this.$Alert.alert({ message: 'Incorrect email/password combination', timeout: 2000 })
    },
  },
}
</script>

<style scoped lang="scss"></style>

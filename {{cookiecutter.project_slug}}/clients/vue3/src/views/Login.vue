<template>
  <div class="login">
    <form @submit.prevent="attemptLogin()">

      <!-- email field -->
      <div class="form-block">
        <label for="email-field">Email:</label>
        <input
          id="email-field"
          type="email"
          placeholder="Email"
          spellcheck="false"
          v-model="loginForm.email.value"
          @blur="loginForm.email.validate()"
        />
        <ul v-if="loginForm.email.errors.length">
          <li v-for="(e, index) in loginForm.email.errors" :key="index">
            {{ e.message }}
          </li>
        </ul>
      </div>

      <!-- password field -->
      <div class="form-block">
        <label for="password-field">Password:</label>
        <input
          id="password-field"
          type="password"
          placeholder="Password"
          v-model="loginForm.password.value"
          @blur="loginForm.password.validate()"
        />
        <ul v-if="loginForm.password.errors.length">
          <li v-for="(e, index) in loginForm.password.errors" :key="index">
            {{ e.message }}
          </li>
        </ul>
      </div>

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import User, { LoginForm } from '@/services/users/'

export default {
  name: 'Login',
  setup() {
    const loginForm = ref(new LoginForm())

    function handleLoginSuccess(data) {
      alert('Succesful login, see console for data.')
      console.log('success', data)
    }

    function handleLoginFailure(err) {
      alert(err)
    }

    function attemptLogin() {
      const form = loginForm.value
      form.validate()
      if (!form.isValid) return

      User.api
        .login({ email: form.email.value, password: form.password.value })
        .then(handleLoginSuccess)
        .catch(handleLoginFailure)
    }

    return {
      loginForm,
      attemptLogin,
    } 
  },
}
</script>

<style scoped lang="scss">

.form-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
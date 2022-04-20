<template>
  <div class="login">
    <form @submit.prevent="attemptLogin()">
      <InputField
        v-model:value="form.email.value"
        :errors="form.email.errors"
        @blur="form.email.validate()"
        type="email"
        label="Email:"
        placeholder="Email"
      />

      <InputField
        v-model:value="form.password.value"
        :errors="form.password.errors"
        @blur="form.password.validate()"
        type="password"
        label="Password:"
        placeholder="Password"
      />

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import User, { LoginForm } from '@/services/users/'
import InputField from '@/components/inputs/InputField'

export default {
  name: 'Login',
  components: {
    InputField,
  },
  setup() {
    const form = ref(new LoginForm())

    function handleLoginSuccess(data) {
      alert('Succesful login, see console for data.')
      console.log('success', data)
    }

    function handleLoginFailure(error) {
      alert(error)
    }

    function attemptLogin() {
      // unwrap form
      const form = form.value
      form.validate()
      if (!form.isValid) return

      User.api
        .login({ email: form.email.value, password: form.password.value })
        .then(handleLoginSuccess)
        .catch(handleLoginFailure)
    }

    return {
      form,
      attemptLogin,
    }
  },
}
</script>

<style scoped lang="scss"></style>

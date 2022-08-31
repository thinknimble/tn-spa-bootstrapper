<template>
  <div class="login">
    <form @submit.prevent="attemptLogin()">
      <InputField
        v-model:value="form.email.value"
        :errors="form.email.errors"
        @blur="form.email.validate()"
        type="email"
        data-cy="email"
        label="Email:"
        placeholder="Email"
      />

      <InputField
        v-model:value="form.password.value"
        :errors="form.password.errors"
        @blur="form.password.validate()"
        type="password"
        data-cy="password"
        label="Password:"
        placeholder="Password"
      />

      <button data-cy="submit" type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import User, { LoginForm } from '@/services/users/'
import InputField from '@/components/inputs/InputField'

export default {
  name: 'Login',
  components: {
    InputField,
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const form = ref(new LoginForm())

    async function handleLoginSuccess(user) {
      await store.dispatch('setUser', user)
      const redirectPath = router.currentRoute.value.query.redirect
      if (redirectPath) {
        router.push({ path: redirectPath })
      } else {
        router.push({ name: 'Dashboard' })
      }
    }

    function handleLoginFailure(error) {
      alert(error)
    }

    function attemptLogin() {
      // unwrap form
      const unwrappedForm = form.value
      unwrappedForm.validate()
      if (!unwrappedForm.isValid) return

      User.api
        .login({ email: unwrappedForm.email.value, password: unwrappedForm.password.value })
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

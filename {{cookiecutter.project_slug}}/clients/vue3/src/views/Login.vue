<template>
  <div
    class="login container w-full sm:max-w-prose content-center mx-auto py-5 bg-gray-100 rounded-lg"
  >
    <h1 class="heading--bold">Log In.</h1>
    <form class="flex flex-col items-center" @submit.prevent="attemptLogin()">
      <InputField
        v-model:value="form.email.value"
        :errors="form.email.errors"
        @blur="form.email.validate()"
        type="email"
        data-cy="email"
        label="Email"
        placeholder="Enter email..."
      />
      <InputField
        v-model:value="form.password.value"
        :errors="form.password.errors"
        @blur="form.password.validate()"
        type="password"
        data-cy="password"
        label="Password"
        placeholder="Enter password..."
      />
      <button class="btn--primary" data-cy="submit" type="submit">Login</button>
      <div class="flex self-center m-4">
        <p class="mr-2">Don't have an account?</p>
        <router-link to="/signup" class="font-bold text-primary hover:underline">
          Sign up.
        </router-link>
      </div>
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

<style scoped lang="css"></style>

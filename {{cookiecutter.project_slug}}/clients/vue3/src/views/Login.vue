<template>
  <div class="container is-max-desktop section" :class="{ box: isDesktopPlus }">
    <h1 class="title">Login.</h1>
    <h2 class="subtitle">Welcome back! Login with the data you entered during registration.</h2>
    <div class="columns is-centered">
      <div class="column">
        <form class="mb-4" @submit.prevent="attemptLogin()">
          <InputField
            v-model:value="form.email.value"
            :errors="form.email.errors"
            @blur="form.email.validate()"
            type="email"
            label="Email:"
            placeholder="Enter your email..."
          />

          <InputField
            v-model:value="form.password.value"
            :errors="form.password.errors"
            @blur="form.password.validate()"
            type="password"
            label="Password:"
            placeholder="Enter your password..."
          />

          <button class="button is-fullwidth is-primary" type="submit">Login</button>
        </form>
        <div class="level mb-0">
          <div class="level-item has-text-centered">
            <p>Don't have an account?</p>
            <button class="button is-ghost" @click.prevent="routeToSignup()">Sign up</button>
          </div>
        </div>
        <div class="level">
          <div class="level-item has-text-centered">
            <button class="button is-ghost" @click.prevent="routeToRequestPasswordReset()">
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useMq } from 'vue3-mq'

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
    const mq = useMq()
    const form = ref(new LoginForm())

    async function handleLoginSuccess({ data }) {
      await store.dispatch('setUser', User.fromAPI(data))
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
      isDesktopPlus: computed(() => mq.desktopPlus),
      routeToSignup: () => router.push({ name: 'Signup' }),
      routeToRequestPasswordReset: () => router.push({ name: 'RequestPasswordReset' }),
    }
  },
}
</script>

<style scoped lang="scss"></style>

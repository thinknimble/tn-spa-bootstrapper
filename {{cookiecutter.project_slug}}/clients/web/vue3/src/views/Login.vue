<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-12 w-auto" src="@/assets/icons/glyph.svg" alt="ThinkNimble" />
      <h2 class="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
        Log in
      </h2>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="attemptLogin()">
        <InputField
          v-model:value="form.email.value"
          :errors="form.email.errors"
          @blur="form.email.validate()"
          type="email"
          data-cy="email"
          label="Email address"
          placeholder="Enter email..."
        />
        <div>
          <div class="mt-2">
            <InputField
              v-model:value="form.password.value"
              :errors="form.password.errors"
              @blur="form.password.validate()"
              type="password"
              data-cy="password"
              placeholder="Enter password..."
              label="Password"
              autocomplete="current-password"
            >
              <template v-slot:input-label>
                <div class="flex items-center justify-between w-full">
                  <label
                    for="Password-field"
                    class="block text-sm font-medium leading-6 text-primary"
                  >
                    Password
                  </label>

                  <div class="text-sm hover:underline">
                    <router-link
                      :to="{ name: 'RequestPasswordReset' }"
                      class="font-semibold text-accent"
                      data-cy="password-reset"
                      >Forgot password?</router-link
                    >
                  </div>
                </div>
              </template>
            </InputField>
          </div>
        </div>

        <div v-if="!loggingIn">
          <button type="submit" data-cy="submit" class="btn--primary bg-primary">Log in</button>
        </div>
        <div v-else>
          <LoadingSpinner />
        </div>
      </form>
    </div>
    <div class="m-4 flex self-center text-sm">
      <p class="mr-2">Don't have an account?</p>
      <router-link :to="{ name: 'Signup' }" class="font-bold text-primary hover:underline">
        Sign up.
      </router-link>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import InputField from '@/components/inputs/InputField.vue'
import { LoginForm, userApi } from '@/services/users/'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useAlert } from '@/composables/CommonAlerts'

export default {
  name: 'Login',
  components: {
    InputField,
    LoadingSpinner,
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const form = ref(new LoginForm())
    const loggingIn = ref(false)
    const { errorAlert } = useAlert()

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
      errorAlert(error)
    }

    function attemptLogin() {
      // unwrap form
      const unwrappedForm = form.value
      unwrappedForm.validate()
      if (!unwrappedForm.isValid) return
      loggingIn.value = true
      userApi.csc
        .login({ email: unwrappedForm.email.value, password: unwrappedForm.password.value })
        .then(handleLoginSuccess)
        .catch(handleLoginFailure)
        .finally(() => (loggingIn.value = false))
    }

    return {
      form,
      attemptLogin,
      loggingIn,
    }
  },
}
</script>

<style scoped lang="css"></style>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-12 w-auto" src="@/assets/icons/glyph.svg" alt="ThinkNimble" />
      <h2 class="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
        Log in
      </h2>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="login(form.value)">
        <InputField
          v-model:value="form.email.value"
          :errors="form.email.errors"
          @blur="form.email.validate()"
          type="email"
          data-cy="email"
          label="Email address"
          placeholder="Enter email..."
          :id="form.email.id"
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
              :id="form.password.id"
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
                      data-cy="password-reset"
                      :to="{ name: 'RequestPasswordReset' }"
                      class="font-semibold text-accent"
                      >Forgot password?</router-link
                    >
                  </div>
                </div>
              </template>
            </InputField>
          </div>
        </div>

        <div v-if="!loading">
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
import { useUsers } from '@/composables/Users'
import { ref } from 'vue'

export default {
  name: 'Login',
  components: {
    InputField,
    LoadingSpinner,
  },
  setup() {
    const { loginForm, loading, login } = useUsers()
    return {
      form: loginForm,
      loading,
      login,
    }
  },
}
</script>

<style scoped lang="css"></style>

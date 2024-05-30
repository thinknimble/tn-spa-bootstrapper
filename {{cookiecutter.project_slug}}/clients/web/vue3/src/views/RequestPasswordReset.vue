<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-12 w-auto" src="@/assets/icons/glyph.svg" alt="ThinkNimble" />
      <h2 class="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
        Request Password Reset
      </h2>
    </div>
    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="requestPasswordReset(form.value.email)">
        <InputField
          v-model:value="form.email.value"
          :errors="form.email.errors"
          @blur="form.email.validate()"
          type="email"
          label="Email address"
          placeholder="Enter email..."
        />
        <button
          :class="form.isValid ? 'btn--primary bg-primary' : 'btn--disabled bg-gray-200'"
          type="submit"
        >
          Request Password Reset
        </button>
      </form>

      <div class="pt-6">
        <button type="button" class="btn--primary bg-primary">
          <router-link :to="{ name: 'Login' }" class="" id="login-link">
            Return to Login
          </router-link>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useUsers } from '@/composables/Users'
import InputField from '@/components/inputs/InputField.vue'

export default {
  name: 'RequestPasswordReset',
  components: {
    InputField,
  },
  setup() {
    const { forgotPasswordForm, loading, requestPasswordReset } = useUsers()

    return {
      form: forgotPasswordForm,
      loading,
      requestPasswordReset,
    }
  },
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-12 w-auto" src="@/assets/icons/glyph.svg" alt="ThinkNimble" />
      <h2 class="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
        Password Reset
      </h2>
    </div>
    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="resetPassword(form.value)">
        <InputField
          v-model:value="form.password.value"
          :errors="form.password.errors"
          @blur="form.password.validate()"
          type="password"
          label="New Password"
          placeholder="New password"
          :id="form.password.id"
        />

        <InputField
          v-model:value="form.confirmPassword.value"
          :errors="form.confirmPassword.errors"
          @blur="form.confirmPassword.validate()"
          type="password"
          label="Confirm Password"
          placeholder="Confirm Password"
          :id="form.confirmPassword.id"
          data-cy=""
        />

        <button class="btn--primary bg-primary" :disabled="!form.isValid" type="submit">
          Reset Password
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { useUsers } from '@/composables/Users'

import InputField from '@/components/inputs/InputField.vue'

export default {
  name: 'ResetPassword',
  components: {
    InputField,
  },
  setup() {
    const { resetPasswordForm, loading, resetPassword, getCodeUidFromRoute } = useUsers()
    const { uid, token } = getCodeUidFromRoute()

    resetPasswordForm.uid.value = uid
    resetPasswordForm.token.value = token

    return {
      form: resetPasswordForm,
      loading,
      resetPassword,
    }
  },
}
</script>

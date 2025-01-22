<script lang="ts" setup>
import { ref } from 'vue'
import { useUsers } from '@/composables/use-users'
import InputField from '@/components/inputs/InputField.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Button from '@/components/Button.vue'

const passwordResetSuccess = ref(false)

const { forgotPasswordForm: form, loading, requestPasswordReset } = useUsers()

const makeRequest = async () => {
  await requestPasswordReset(form.email.value ?? '')
  passwordResetSuccess.value = true
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-12 w-auto" src="@/assets/icons/glyph.svg" alt="ThinkNimble" />
      <h2 class="pt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
        Request Password Reset
      </h2>
    </div>
    <div class="pt-6 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="makeRequest">
        <InputField
          v-model:value="form.email.value"
          :errors="form.email.errors"
          @blur="form.email.validate()"
          type="email"
          label="Email address"
          placeholder="Enter email..."
          data-cy="email"
        />

        <LoadingSpinner v-if="loading" />
        <Button
          v-else-if="!loading && !passwordResetSuccess"
          type="submit"
          :disabled="loading || !form.email.isValid"
          variant="primary"
          data-cy="submit"
        >
          Request Password Reset
        </Button>
      </form>
      <template v-if="passwordResetSuccess">
        <p class="text-md" data-cy="submit-success">
          Your request has been submitted. If there is an account associated with the email
          provided, you should receive an email momentarily with instructions to reset your
          password.
        </p>
        <p class="text-md">
          If you do not see the email in your main folder soon, please make sure to check your spam
          folder.
        </p>
        <div class="pt-6">
          <Button type="button" variant="primary">
            <router-link :to="{ name: 'Login' }" class="" id="login-link">
              Return to Login
            </router-link>
          </Button>
        </div>
      </template>
    </div>
  </div>
</template>

<template>
  <template v-if="!resetLinkSent">
    <div class="request-password-reset">
      <form @submit.prevent="attemptResetRequest()">
        <InputField
          v-model:value="form.email.value"
          :errors="form.email.errors"
          @blur="form.email.validate()"
          type="email"
          label="Email:"
          placeholder="Email"
        />

        <button
          :class="{ 'btn--disabled': !form.isValid }"
          :disabled="!form.isValid"
          type="submit">
          Request Password Reset
        </button>
      </form>
    </div>
  </template>
  <template v-else>
    <p class="">
      Your request has been submitted. If there is an account associated with the email provided, you should receive an email momentarily with instructions to reset your password.
    </p>
    <p class="">
      If you do not see the email in your main folder soon, please make sure to check your spam folder.
    </p>
    <div class="">
      <button type="button" class="btn--primary">
        <router-link :to="{ name: 'Login' }" class="" id="login-link">
          Return to Login
        </router-link>
      </button>
    </div>
  </template>
</template>


<script>
import { ref } from 'vue'
import  { userApi,  RequestPasswordResetForm } from '@/services/users/'
import InputField from '@/components/inputs/InputField'

export default {
  name: 'RequestPasswordReset',
  components: {
    InputField,
  },
  setup() {
    const form = ref(new RequestPasswordResetForm())
    const resetLinkSent = ref(false)

    function handleResetRequestSuccess(data) {
      resetLinkSent.value = true
      console.log('success', data)
    }

    function handleResetRequestFailure(error) {
      alert(error)
    }

    function attemptResetRequest() {
      // unwrap form
      const unwrappedForm = form.value
      unwrappedForm.validate()
      if (!unwrappedForm.isValid) return

      userApi.csc.requestPasswordReset({email: unwrappedForm.email.value})
        .then(handleResetRequestSuccess)
        .catch(handleResetRequestFailure)
    }

    return {
      form,
      attemptResetRequest,
      resetLinkSent,
    }
  },
}
</script>

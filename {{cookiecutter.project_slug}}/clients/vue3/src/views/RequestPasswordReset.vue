<template>
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

      <button type="submit">Request Password Reset</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import User, { RequestPasswordResetForm } from '@/services/users/'
import InputField from '@/components/inputs/InputField'

export default {
  name: 'RequestPasswordReset',
  components: {
    InputField,
  },
  setup() {
    const form = ref(new RequestPasswordResetForm())

    function handleResetRequestSuccess(data) {
      alert('Succesful request, see console for data.')
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

      User.api
        .requestPasswordReset(unwrappedForm.email.value)
        .then(handleResetRequestSuccess)
        .catch(handleResetRequestFailure)
    }

    return {
      form,
      attemptResetRequest,
    }
  },
}
</script>

<style scoped lang="scss"></style>

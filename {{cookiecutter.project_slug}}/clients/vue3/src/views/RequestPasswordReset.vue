<template>
  <div class="request-password-reset">
    <form @submit.prevent="attemptResetRequest()">

      <!-- email field -->
      <div class="form-block">
        <label for="email-field">Email:</label>
        <input
          id="email-field"
          type="email"
          placeholder="Email"
          spellcheck="false"
          v-model="requestPasswordResetForm.email.value"
          @blur="requestPasswordResetForm.email.validate()"
        />
        <ul v-if="requestPasswordResetForm.email.errors.length">
          <li v-for="(error, index) in requestPasswordResetForm.email.errors" :key="index">
            {{ error.message }}
          </li>
        </ul>
      </div>

      <button type="submit">Request Password Reset</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import User, { RequestPasswordResetForm } from '@/services/users/'

export default {
  name: 'RequestPasswordReset',
  setup() {
    const { requestPasswordResetForm, attemptResetRequest } = useRequestPasswordResetForm()

    return { requestPasswordResetForm, attemptResetRequest }
  },
}

function useRequestPasswordResetForm() {
  const requestPasswordResetForm = ref(new RequestPasswordResetForm())

  function handleResetRequestSuccess(data) {
    alert('Succesful request, see console for data.')
    console.log('success', data)
  }

  function handleResetRequestFailure(error) {
    alert(error)
  }

  function attemptResetRequest() {
    const form = requestPasswordResetForm.value
    form.validate()
    if (!form.isValid) return

    User.api
      .requestPasswordReset(form.email.value)
      .then(handleResetRequestSuccess)
      .catch(handleResetRequestFailure)
  }

  return {
    requestPasswordResetForm,
    attemptResetRequest,
  }
}
</script>

<style scoped lang="scss">

.form-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
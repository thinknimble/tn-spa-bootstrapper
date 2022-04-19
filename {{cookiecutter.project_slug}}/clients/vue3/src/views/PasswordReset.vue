<template>
  <div class="password-reset">
    <form @submit.prevent="attemptPasswordReset()">

      <!-- new password field -->
      <div class="form-block">
        <label for="new-password-field">New Password:</label>
        <input
          id="new-password-field"
          type="password"
          placeholder="New password"
          v-model="passwordResetForm.password.value"
          @blur="passwordResetForm.password.validate()"
        />
        <ul v-if="passwordResetForm.password.errors.length">
          <li v-for="(error, index) in passwordResetForm.password.errors" :key="index">
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
import { useRoute } from 'vue-router';

import User, { PasswordResetForm } from '@/services/users/'

export default {
  name: 'PasswordReset',
  setup() {
    const passwordResetForm = ref(new PasswordResetForm())
    const route = useRoute()

    function handleResetSuccess(data) {
      alert('Succesful password reset, see console for data.')
      console.log('success', data)
    }

    function handleResetFailure(error) {
      alert(error)
    }

    function attemptPasswordReset() {
      const form = passwordResetForm.value
      form.validate()
      if (!form.isValid) return

      const { uid, token } = route.params

      User.api
        .resetPassword({
          uid,
          token,
          password: form.password.value,
        })
        .then(handleResetSuccess)
        .catch(handleResetFailure)
    }

    return {
      passwordResetForm,
      attemptPasswordReset,
    } 
  },
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
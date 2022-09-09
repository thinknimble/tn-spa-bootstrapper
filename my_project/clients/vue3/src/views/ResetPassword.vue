<template>
  <div class="reset-password">
    <form @submit.prevent="attemptPasswordReset()">
      <InputField
        v-model:value="form.password.value"
        :errors="form.password.errors"
        @blur="form.password.validate()"
        type="password"
        label="New Password:"
        placeholder="New password"
      />

      <button type="submit">Reset Password</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import User, { PasswordResetForm } from '@/services/users/'
import InputField from '@/components/inputs/InputField'

export default {
  name: 'ResetPassword',
  components: {
    InputField,
  },
  setup() {
    const form = ref(new PasswordResetForm())
    const route = useRoute()

    function handleResetSuccess(data) {
      alert('Succesfully reset password, see console for data.')
      console.log('success', data)
    }

    function handleResetFailure(error) {
      alert(error)
    }

    function attemptPasswordReset() {
      // unwrap form
      const unwrappedForm = form.value
      unwrappedForm.validate()
      if (!unwrappedForm.isValid) return

      const { uid, token } = route.params

      User.api
        .resetPassword({
          uid,
          token,
          password: unwrappedForm.password.value,
        })
        .then(handleResetSuccess)
        .catch(handleResetFailure)
    }

    return {
      form,
      attemptPasswordReset,
    }
  },
}
</script>

<style scoped lang="scss"></style>

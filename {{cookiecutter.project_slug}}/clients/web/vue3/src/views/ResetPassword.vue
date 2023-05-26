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
      <InputField
        v-model:value="form.passwordConfirmation.value"
        :errors="form.passwordConfirmation.errors"
        @blur="form.passwordConfirmation.validate()"
        type="password"
        label="Confirm Password:"
        placeholder="Confirm Password"
      />

      <button type="submit">Reset Password</button>
    </form>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import User, { PasswordResetForm } from '@/services/users/'
import InputField from '@/components/inputs/InputField'

export default {
  name: 'ResetPassword',
  components: {
    InputField,
  },
  setup() {
    const form = ref(new PasswordResetForm())
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    function handleResetSuccess(data) {
      store.dispatch('setUser', data)
      router.push({ name: 'Dashboard' })
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

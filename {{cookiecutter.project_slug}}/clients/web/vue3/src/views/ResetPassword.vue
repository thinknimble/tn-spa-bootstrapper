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
        label="New Password:"
        placeholder="New password"
      />
      <p class="text-accent" v-if="matchingPasswordsError">{{ "{{ matchingPasswordsError }}" }}</p>

      <button
        :class="{ 'btn--disabled': !form.isValid || matchingPasswordsError }"
        :disabled="!form.isValid || matchingPasswordsError"
        type="submit">
        Reset Password
      </button>
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
    let matchingPasswordsError = ref(false)
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    watch(
      () => [form.value.password.value, form.value.passwordConfirmation.value],
      () => {
        if (form.value.password.value && form.value.passwordConfirmation.value
            && form.value.password.value !== form.value.passwordConfirmation.value){
          matchingPasswordsError.value = 'Passwords must match'
        }else{
          matchingPasswordsError.value = false
        }
      }
    )

    function handleResetSuccess(data) {
      alert('Succesfully reset password')
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
      matchingPasswordsError,
    }
  },
}
</script>

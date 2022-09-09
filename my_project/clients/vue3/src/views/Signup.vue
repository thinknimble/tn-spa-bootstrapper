<template>
  <div class="signup">
    <form @submit.prevent="attemptUserRegistration()">
      <InputField
        v-model:value="form.firstName.value"
        :errors="form.firstName.errors"
        @blur="form.firstName.validate()"
        label="First Name:"
        placeholder="First name"
      />

      <InputField
        v-model:value="form.lastName.value"
        :errors="form.lastName.errors"
        @blur="form.lastName.validate()"
        label="Last Name:"
        placeholder="Last name"
      />

      <InputField
        v-model:value="form.email.value"
        :errors="form.email.errors"
        @blur="form.email.validate()"
        type="email"
        label="Email:"
        placeholder="Email"
      />

      <InputField
        v-model:value="form.password.value"
        :errors="form.password.errors"
        @blur="form.password.validate()"
        type="password"
        label="Password:"
        placeholder="Password"
      />

      <button type="submit">Signup</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import User, { SignupForm } from '@/services/users/'
import InputField from '@/components/inputs/InputField'

export default {
  name: 'Signup',
  components: {
    InputField,
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const form = ref(new SignupForm())

    async function handleRegistrationSuccess(user) {
      await store.dispatch('setUser', user)
      const redirectPath = router.currentRoute.value.query.redirect
      if (redirectPath) {
        router.push({ path: redirectPath })
      } else {
        router.push({ name: 'Dashboard' })
      }
    }

    function handleRegistrationFailure(error) {
      alert(error)
    }

    function attemptUserRegistration() {
      // unwrap form
      const unwrappedForm = form.value
      unwrappedForm.validate()
      if (!unwrappedForm.isValid) return

      User.api
        .registerUser({
          firstName: unwrappedForm.firstName.value,
          lastName: unwrappedForm.lastName.value,
          email: unwrappedForm.email.value,
          password: unwrappedForm.password.value,
        })
        .then(handleRegistrationSuccess)
        .catch(handleRegistrationFailure)
    }

    return {
      form,
      attemptUserRegistration,
    }
  },
}
</script>

<style scoped lang="scss"></style>

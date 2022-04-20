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
import User, { SignupForm } from '@/services/users/'

export default {
  name: 'Signup',
  setup() {
    const form = ref(new SignupForm())

    function handleRegistrationSuccess(data) {
      alert('Succesful user registration, see console for data.')
      console.log('success', data)
    }

    function handleRegistrationFailure(error) {
      alert(error)
    }

    function attemptUserRegistration() {
      // unwrap form
      const form = form.value
      form.validate()
      if (!form.isValid) return

      User.api
        .registerUser({
          firstName: form.firstName.value,
          lastName: form.lastName.value,
          email: form.email.value,
          password: form.password.value,
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

<template>
  <div class="signup">
    <form @submit.prevent="attemptUserRegistration()">
      <!-- first name field -->
      <div class="form-block">
        <label for="first-name-field">First Name:</label>
        <input
          id="first-name-field"
          placeholder="First name"
          spellcheck="false"
          v-model="signupForm.firstName.value"
          @blur="signupForm.firstName.validate()"
        />
        <ul v-if="signupForm.firstName.errors.length">
          <li v-for="(error, index) in signupForm.firstName.errors" :key="index">
            {{ error.message }}
          </li>
        </ul>
      </div>

      <!-- last name field -->
      <div class="form-block">
        <label for="last-name-field">Last name:</label>
        <input
          id="last-name-field"
          placeholder="Last name"
          spellcheck="false"
          v-model="signupForm.lastName.value"
          @blur="signupForm.lastName.validate()"
        />
        <ul v-if="signupForm.lastName.errors.length">
          <li v-for="(error, index) in signupForm.lastName.errors" :key="index">
            {{ error.message }}
          </li>
        </ul>
      </div>

      <!-- email field -->
      <div class="form-block">
        <label for="email-field">Email:</label>
        <input
          id="email-field"
          type="email"
          placeholder="Email"
          spellcheck="false"
          v-model="signupForm.email.value"
          @blur="signupForm.email.validate()"
        />
        <ul v-if="signupForm.email.errors.length">
          <li v-for="(error, index) in signupForm.email.errors" :key="index">
            {{ error.message }}
          </li>
        </ul>
      </div>

      <!-- password field -->
      <div class="form-block">
        <label for="password-field">Password:</label>
        <input
          id="password-field"
          type="password"
          placeholder="Password"
          v-model="signupForm.password.value"
          @blur="signupForm.password.validate()"
        />
        <ul v-if="signupForm.password.errors.length">
          <li v-for="(error, index) in signupForm.password.errors" :key="index">
            {{ error.message }}
          </li>
        </ul>
      </div>

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
    const signupForm = ref(new SignupForm())

    function handleRegistrationSuccess(data) {
      alert('Succesful user registration, see console for data.')
      console.log('success', data)
    }

    function handleRegistrationFailure(error) {
      alert(error)
    }

    function attemptUserRegistration() {
      const form = signupForm.value
      form.validate()
      if (!form.isValid) return

      User.api
        .registerUser({
          firstName: form.firstName.value,
          lastName: form.lastName.value,
          email: form.email.value,
          password: form.password.value
        })
        .then(handleRegistrationSuccess)
        .catch(handleRegistrationFailure)
    }

    return {
      signupForm,
      attemptUserRegistration,
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
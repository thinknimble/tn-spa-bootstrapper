<template>
  <div class="login">
    <div class="columns">
      <div class="column"></div>
      <div class="column">
        <div class="card">
          <div class="card-header">
            <h1 class="title">Login</h1>
          </div>
          <div class="card-content">
            <!-- ORIGINAL -->
              <FormField
                labelText="Email"
                v-model="loginForm.email.value"
                placeholder="Email"
                type="text"
                @blur="loginForm.email.validate()"
                :errors="loginForm.email.errors"
              />
              <FormField
                labelText="Password"
                v-model="loginForm.password.value"
                placeholder="Password"
                type="password"
                @blur="loginForm.password.validate()"
                :errors="loginForm.password.errors"
              />
              <!-- EDIT FOR TESTING -->
              <!-- <FormField
                labelText="Email"
                placeholder="Email"
                type="text"
                @blur="loginForm.email.validate()"
              />
              <FormField
                labelText="Password"
                placeholder="Password"
                type="password"
                @blur="loginForm.password.validate()"
              /> -->
            <button @click="onLogin" :disabled="!loginForm.isValid" class="button is-primary">Login</button>
          </div>
        </div>
      </div>
      <div class="column"></div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import User, { LoginForm } from '@/services/users/'

import FormField from '@/components/FormField'


export default {
  name: 'Login',
  components: { FormField },
  setup() {
    const loginForm = ref(new LoginForm())
    async function  onLogin(){
        if(!loginForm.email.value.isValid){
            // revalidate to show errors on form in case no blur
            loginForm.email.value.validate()
            return
        }
        // unfortunate side effect of new vue reactivity is calling value to unwrap and value from the form
        console.log("loginForm (keys)", Object.keys(loginForm) )
        console.log("loginForm.value (keys)", Object.keys(loginForm.value) )
        console.log("loginForm.value", loginForm.value)
        await User.api.login(loginForm.value.value)
    }
    return {
      loginForm,
      onLogin,
    }
  },
}
</script>

<style lang="scss" scoped></style>

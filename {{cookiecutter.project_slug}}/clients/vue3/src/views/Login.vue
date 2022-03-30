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
              <FormField
                labelText="Email"
                v-model:modelValue="loginForm.email.value"
                placeholder="Email"
                type="text"
                @blur="loginForm.email.validate()"
                :errors="loginForm.email.errors"
              />
              <FormField
                labelText="Password"
                v-model:modelValue="loginForm.password.value"
                placeholder="Password"
                type="password"
                @blur="loginForm.password.validate()"
                :errors="loginForm.password.errors"
              />
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
        // if(!loginForm.value.isValid){
        //     // revalidate to show errors on form in case no blur
        //     loginForm.value.validate()
        //     return
        // }
        // // unfortunate side effect of new vue reactivity is calling value to unwrap and value from the form 
        // await User.api.login(loginForm.value.value)

    }
    return {
      loginForm,
      onLogin,
      // fieldMap: 
    }
  }
}
</script>

<style lang="scss" scoped></style>

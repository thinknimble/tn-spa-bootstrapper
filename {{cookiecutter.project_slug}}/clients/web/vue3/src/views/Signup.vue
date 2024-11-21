<script lang="ts" setup>
import InputField from '@/components/inputs/InputField.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useUsers } from '@/composables/use-users'
const { register, loading, registerForm: form } = useUsers()
const onRegister = () => {
  const createAccountInput = {
    firstName: form.firstName.value ?? '',
    lastName: form.lastName.value ?? '',
    email: form.email.value ?? '',
    password: form.password.value ?? '',
    confirmPassword: form.confirmPassword.value ?? '',
  }
  register(createAccountInput)
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-10 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-12 w-auto" src="@/assets/icons/glyph.svg" alt="ThinkNimble" />
      <h2 class="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
        Sign up
      </h2>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="onRegister()">
        <div>
          <label class="mb-2 block text-left text-sm font-medium leading-6 text-primary"
            >First Name</label
          >
          <InputField
            v-model:value="form.firstName.value"
            :errors="form.firstName.errors"
            @blur="form.firstName.validate()"
            placeholder="Enter first name..."
          />
        </div>

        <div>
          <label class="mb-2 block text-left text-sm font-medium leading-6 text-primary"
            >Last Name</label
          >
          <InputField
            v-model:value="form.lastName.value"
            :errors="form.lastName.errors"
            @blur="form.lastName.validate()"
            placeholder="Enter last name..."
          />
        </div>

        <div>
          <label class="mb-2 block text-left text-sm font-medium leading-6 text-primary"
            >Email</label
          >
          <InputField
            v-model:value="form.email.value"
            :errors="form.email.errors"
            @blur="form.email.validate()"
            type="email"
            placeholder="Enter email..."
          />
        </div>

        <div>
          <label class="mb-2 block text-left text-sm font-medium leading-6 text-primary"
            >Password</label
          >
          <InputField
            v-model:value="form.password.value"
            :errors="form.password.errors"
            @blur="form.password.validate()"
            type="password"
            placeholder="Enter password..."
          />
        </div>
        <div>
          <label class="mb-2 block text-left text-sm font-medium leading-6 text-primary"
            >Confirm Password</label
          >
          <InputField
            v-model:value="form.confirmPassword.value"
            :errors="form.confirmPassword.errors"
            @blur="form.confirmPassword.validate()"
            type="password"
            placeholder="Confirm Password"
          />
        </div>
        <div>
          <LoadingSpinner v-if="loading" />
          <Button variant="primary" v-else :disabled="!form.isValid" type="submit">
            Sign up
          </Button>
        </div>
      </form>
    </div>
    <div class="m-4 flex self-center text-sm">
      <p class="mr-2">Already have an account?</p>
      <router-link :to="{ name: 'Login' }" class="font-bold text-primary hover:underline">
        Log in.
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="css"></style>

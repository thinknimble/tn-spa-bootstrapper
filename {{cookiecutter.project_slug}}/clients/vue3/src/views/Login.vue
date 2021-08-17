{% raw -%}
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <span @click="$router.push('/')" className="w-full flex justify-center bg-clip-text bg-gradient-to-br from-blue to-teal-800 text-5xl sm:text-md font-bold text-transparent"> {% endraw -%} {{ cookiecutter.project_name }} {% raw -%}</span>
      <h2 class="mt-6 text-center text-3xl font-semibold text-gray-600">Sign in to your account</h2>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
      <div className="bg-white py-8 px-4 pt-2 shadow sm:rounded-lg sm:px-10">
        <Form @submit="onSubmit" :validation-schema="schema" class="mt-2 space-y-6">
          <input type="hidden" name="remember" value="true" />
          <div class="rounded-md shadow-sm -space-y-px">
            <TextInput inputClasses="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" name="email" type="email" label="E-mail" placeholder="Your email address" />
            <TextInput inputClasses="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" name="password" type="password" label="Password" placeholder="Your password" />
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember_me" name="remember_me" type="checkbox" class="h-4 w-4 text-blue focus:ring-blue-500 border-gray-300 rounded" />
              <label for="remember_me" class="ml-2 block text-md text-gray-900"> Remember me </label>
            </div>

            <div class="text-md">
              <router-link to="recover-password" class="font-medium text-blue hover:text-blue-500"> Forgot your password? </router-link>
            </div>
          </div>

          <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-md font-medium rounded-md text-white bg-blue hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <!-- Heroicon name: solid/lock-closed -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </span>
              Sign in
            </button>
          </div>
        </Form>
      </div>
      <TransitionRoot as="template" :show="credentials_error">
        <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="credentials_error = false" :open="credentials_error">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
              <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <!-- This element is to trick the browser into centering the modal contents. -->
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900"> Invalid credentials </DialogTitle>
                      <div class="mt-2">
                        <p class="text-sm text-gray-500">Please make sure you entered valid credentials</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="credentials_error = false" ref="cancelButtonRef">Cancel</button>
                </div>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </div>
</template>

<script>
import * as Yup from 'yup'
import { ref } from 'vue'
import { Form } from 'vee-validate'
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ExclamationIcon } from '@heroicons/vue/outline'
import TextInput from '../components/shared/TextInput.vue'
export default {
  name: 'Login',

  components: {
    TextInput,
    Form,
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    ExclamationIcon
  },
  setup() {
    const credentials_error = ref(false)

    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().min(8).required()
    })

    return {
      schema,
      credentials_error
    }
  },

  created() {
    if (this.$store.state.auth.status.isLoggedIn) {
      this.$router.replace('/')
    }
  },

  methods: {
    onSubmit(values) {
      this.$store.dispatch('ui/showLoading')
      if (values.email && values.password) {
        this.$store
          .dispatch('auth/login', values)
          .then(() => {
            this.$store.dispatch('ui/hideLoading')

            this.$router.replace('/')
          })
          .catch((err) => {
            console.log(err)
            this.$store.dispatch('ui/hideLoading')
            this.credentials_error = true
          })
      }
    }
  }
}
</script>
{% endraw -%}
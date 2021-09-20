{% raw -%}
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <span @click="$router.push('/')" className="w-full flex justify-center bg-clip-text bg-gradient-to-br from-blue to-teal-800 text-5xl sm:text-md font-bold text-transparent"> {% endraw -%} {{ cookiecutter.project_name }} {% raw -%}</span>
      <h2 class="mt-6 text-center text-3xl font-semibold text-gray-600">Sign Up to your new account</h2>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
      <div className="bg-white py-8 px-4 pt-2 shadow sm:rounded-lg sm:px-10">
        <Form @submit="onSubmit" :validation-schema="schema" class="mt-2 space-y-6">
          <input type="hidden" name="remember" value="true" />
            <div class="rounded-md shadow-sm -space-y-px">
            <TextInput inputClasses="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" name="username" type="text" label="Username" placeholder="Your username" />
          </div>
          <div class="rounded-md shadow-sm -space-y-px">
            <TextInput inputClasses="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" name="email" type="email" label="E-mail" placeholder="Your email address" />
          </div>
          <div class="rounded-md shadow-sm -space-y-px">
            <TextInput inputClasses="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" name="password" type="password" label="Password" placeholder="Your password" />
          </div>
          <div class="rounded-md shadow-sm -space-y-px">
            <TextInput inputClasses="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" name="re-password" type="password" label="Re-Password" placeholder="Re-Type Your password" />
          </div>
          <div class="flex items-center justify-between">
            <div class="text-md">
              <router-link to="login" class="font-medium text-blue hover:text-blue-500"> Have and account? </router-link>
            </div>
          </div>

          <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-md font-medium rounded-md text-white bg-blue hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Register
            </button>
          </div>
        </Form>
      </div>
      <TransitionRoot as="template" :show="show_registration_error">
        <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="show_registration_error = false" :open="show_registration_error">
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
                      <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900"> Error Signing Up </DialogTitle>
                      <div class="mt-2">
                          <p class="text-sm text-gray-500" v-for="(er, index) in registration_error" :key="index">{{er}}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="show_registration_error = false" ref="cancelButtonRef">Cancel</button>
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
import AuthService from "@/services/auth.service";

export default {
  name: 'Register',

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
    const show_registration_error = ref(false)
    const registration_error = ref("")
    Yup.addMethod(Yup.string, 'equalTo', function(ref, msg) {
      return this.test({
        name: 'equalTo',
        exclusive: false,
        message: msg || '${path} must be the same as ${reference}',
        params: {
          reference: ref.path
        },
        test: function (value) {
          return value === this.resolve(ref)
        }
      })
    })

    const schema = Yup.object().shape({
      username: Yup.string(),
      email: Yup.string().email().required(),
      password: Yup.string().min(8).required(),
      're-password': Yup.string().equalTo(Yup.ref('password'))
    })

    return {
      schema,
      show_registration_error,
      registration_error
    }
  },
  methods: {
    onSubmit(values) {
      this.$store.dispatch('ui/showLoading')
      AuthService.register(values)
          .then(() => {
            this.$store.dispatch('ui/hideLoading')
            this.$router.replace('/login')
          })
          .catch((error) => {
            this.$store.dispatch('ui/hideLoading')
            this.show_registration_error = true
            if (error["code"] == "BAD_REQUEST") {
            if (Object.keys(error["errors"]).length > 0) {
              Object.keys(error["errors"]).forEach((key) => {
                  this.registration_error.push(...error["errors"][key]);
              });
            }
          }else{
            this.registration_error.push(error["code"]);
          }
          })
      }
  }
}
</script>
{% endraw -%}
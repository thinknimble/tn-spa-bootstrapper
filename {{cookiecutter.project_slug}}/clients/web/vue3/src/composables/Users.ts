import {
    AccountForm,
    EmailForgotPasswordForm,
    LoginForm,
    LoginShape,
    ResetPasswordForm,
    ResetPasswordShape,
    UserCreateShape,
    UserShape,
    userApi,
  } from '@/services/users'
  import { useMutation, useQueryClient } from '@tanstack/vue-query'
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useStore } from 'vuex'
  import { useAlert } from '@/composables/CommonAlerts'
  
  export function useUsers() {
    const store = useStore()
    const router = useRouter()
    const qc = useQueryClient()
    const loginForm = reactive(new LoginForm({}))
    const forgotPasswordForm = reactive(new EmailForgotPasswordForm({}))
    const resetPasswordForm = reactive(new ResetPasswordForm({}))
    const registerForm = reactive(new AccountForm({}))
    const loading = ref(false)
    const { errorAlert, successAlert } = useAlert()

    const { data: user, mutate: login } = useMutation({
      mutationFn: async (user: LoginShape) => {
        return await userApi.csc.login(user)
      },
      onMutate: async () => {
        loading.value = true
      },
      onError: (error: Error) => {
        loading.value = false
        console.log(error)
        errorAlert('Invalid email or password')
      },
      onSuccess: (data: UserShape, _, __) => {
        loading.value = false
        store.dispatch('setUser', data)
        const redirectPath = router.currentRoute.value.query.redirect
        if (redirectPath) {
          router.push({ path: redirectPath as string })
        } else {
          router.push({ name: 'Dashboard' })
        }
        qc.invalidateQueries({ queryKey: ['user'] })
      },
    })
    const { mutate: requestPasswordReset } = useMutation({
      mutationFn: async (email: string) => {
        await userApi.csc.requestPasswordReset({ email })
      },
      onError: (error: Error) => {
        loading.value = false
        console.log(error)
      },
      onSuccess: (_, __, ___) => {
        loading.value = false
        successAlert('Password reset link sent to your email')
        qc.invalidateQueries({ queryKey: ['user'] })
      },
    })
  
    const { mutate: resetPassword } = useMutation({
      mutationFn: async (data: ResetPasswordShape) => {
        return await userApi.csc.resetPassword(data)
      },
      onError: (error: Error) => {
        loading.value = false
        console.log(error)
        errorAlert('There was an error attempting to reset password')
      },
      onSuccess: (data: UserShape, _, __) => {
        loading.value = false
        store.dispatch('setUser', data)
        router.push({ name: 'Dashboard' })
        qc.invalidateQueries({ queryKey: ['user'] })
      },
    })
  
    const { mutate: register } = useMutation({
      mutationFn: async (data: UserCreateShape) => {
        return await userApi.create(data)
      },
      onError: (error: Error) => {
        loading.value = false
        console.log(error)
        errorAlert('There was an error attempting to register')
      },
      onSuccess: (data: UserShape, _, __) => {
        store.dispatch('setUser', data)
        router.push({ name: 'Dashboard' })
        qc.invalidateQueries({ queryKey: ['user'] })
        loading.value = false
      },
    })
  
    return {
      loginForm,
      forgotPasswordForm,
      resetPasswordForm,
      loading,
      login,
      requestPasswordReset,
      resetPassword,
      user,
      register,
      registerForm,
    }
  }
  
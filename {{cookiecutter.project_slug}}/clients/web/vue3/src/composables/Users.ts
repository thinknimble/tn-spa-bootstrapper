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
import { useUserStore } from '@/stores/user'
import { useAlert } from '@/composables/CommonAlerts'

export function useUsers() {
  const userStore = useUserStore()
  const router = useRouter()
  const qc = useQueryClient()
  const loginForm = reactive(new LoginForm({}))
  const forgotPasswordForm = reactive(new EmailForgotPasswordForm({}))
  const resetPasswordForm = reactive(new ResetPasswordForm({}))
  const registerForm = reactive(new AccountForm({}))
  const loading = ref(false)
  const { errorAlert, successAlert } = useAlert()

  const getEmailFromRoute = () => {
    const { email } = router.currentRoute.value.params
    return { email }
  }

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
    onSuccess: (data: UserShape) => {
      loading.value = false
      userStore.updateUser(data)
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
      return email
    },
    onError: (error: Error) => {
      loading.value = false
      console.log(error)
    },
    onSuccess: (email: string) => {
      loading.value = false
      successAlert('Password reset code to your email')
      qc.invalidateQueries({ queryKey: ['user'] })
      router.push({ name: 'ResetPassword', params: { email } })
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
    onSuccess: (data: UserShape) => {
      loading.value = false
      userStore.updateUser(data)
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
    onSuccess: (data: UserShape) => {
      userStore.updateUser(data)
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
    getEmailFromRoute,
  }
}

import {
  AccountForm,
  EmailForgotPasswordForm,
  LoginForm,
  LoginShape,
  ResetPasswordForm,
  ResetPasswordShape,
  TAccountForm,
  TEmailForgotPasswordForm,
  TLoginForm,
  TResetPasswordForm,
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
  const loginForm = reactive(new LoginForm({}) as TLoginForm)
  const forgotPasswordForm = reactive(new EmailForgotPasswordForm({}) as TEmailForgotPasswordForm)
  const resetPasswordForm = reactive(new ResetPasswordForm({}) as TResetPasswordForm)
  const registerForm = reactive(new AccountForm({}) as TAccountForm)
  const loading = ref(false)
  const { errorAlert, successAlert } = useAlert()

  const getCodeUidFromRoute = () => {
    const { uid, token } = router.currentRoute.value.params
    return { uid, token }
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
    onSuccess: (data) => {
      loading.value = false
      const { token, ...userData } = data
      userStore.updateUser(userData)
      userStore.updateToken(token)
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
    onSuccess: () => {
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
    onSuccess: (data: UserShape) => {
      loading.value = false
      userStore.updateUser(data)
      router.push({ name: 'Dashboard' })
      qc.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const { mutate: register } = useMutation({
    mutationFn: async (data: UserCreateShape) => {
      return await userApi.csc.signup(data)
    },
    onError: (error: Error) => {
      loading.value = false
      console.log(error)
      errorAlert('There was an error attempting to register')
    },
    onSuccess: (data) => {
      const { token, ...userData } = data
      userStore.updateUser(userData)
      userStore.updateToken(token)
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
    getCodeUidFromRoute,
  }
}

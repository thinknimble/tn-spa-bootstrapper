import { useAlert } from '@/composables/CommonAlerts'
import {
  AccountForm,
  EmailForgotPasswordForm,
  LoginForm,
  LoginShape,
  ResetPasswordForm,
  ResetPasswordShape,
  UserWithTokenShape,
  userApi,
  userQueries,
} from '@/services/users'
import { useAuthStore } from '@/stores/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export function useUsers() {
  const authStore = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const loginForm = reactive(new LoginForm({}))
  const forgotPasswordForm = reactive(new EmailForgotPasswordForm({}))
  const resetPasswordForm = reactive(new ResetPasswordForm({}))
  const registerForm = reactive(new AccountForm({}))
  const loading = ref(false)
  const { errorAlert, successAlert } = useAlert()

  const { data: user , isPending} = useQuery(userQueries.retrieve(authStore.userId ?? ''))

  const getCodeUidFromRoute = () => {
    const { uid, token } = router.currentRoute.value.params
    return { uid, token }
  }

  const { mutate: login } = useMutation({
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
      const { token, ...user } = data
      authStore.updateAuth({ userId: user.id, token })
      qc.setQueryData(userQueries.retrieve(user.id).queryKey, user)

      const redirectPath = router.currentRoute.value.query.redirect
      if (redirectPath) {
        router.push({ path: redirectPath as string })
      } else {
        router.push({ name: 'Dashboard' })
      }
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
    onSuccess: (data) => {
      loading.value = false
      const { token, ...user } = data
      authStore.updateAuth({ userId: user.id, token })
      qc.setQueryData(userQueries.retrieve(user.id).queryKey, user)
      router.push({ name: 'Dashboard' })
    },
  })

  const { mutate: register } = useMutation({
    mutationFn: userApi.create,
    onError: (error: Error) => {
      loading.value = false
      console.log(error)
      errorAlert('There was an error attempting to register')
    },
    onSuccess: (data) => {
      const { token, ...user } = data as UserWithTokenShape
      authStore.updateAuth({ userId: user.id, token })
      qc.setQueryData(userQueries.retrieve(user.id).queryKey, user)
      router.push({ name: 'Dashboard' })
      qc.invalidateQueries({ queryKey: ['user'] })
      loading.value = false
    },
  })

  return {
    isUserLoading: isPending,
    user,
    loginForm,
    forgotPasswordForm,
    resetPasswordForm,
    loading,
    login,
    requestPasswordReset,
    resetPassword,
    register,
    registerForm,
    getCodeUidFromRoute,
  }
}

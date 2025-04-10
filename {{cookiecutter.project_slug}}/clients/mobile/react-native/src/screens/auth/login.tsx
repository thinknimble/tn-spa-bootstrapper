import { ErrorMessage } from '@components/errors'
import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { BounceableWind } from '@components/styled'
import { TextFormField } from '@components/text-form-field'
import { LoginForm, LoginFormInputs, TLoginForm, userApi } from '@services/user'
import { useAuth } from '@stores/auth'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { getNavio } from '../routes'
import { useMutation } from '@tanstack/react-query'
import { BButton } from '@components/Button'

const LoginInner = () => {
  const { form, overrideForm } = useTnForm<TLoginForm>()
  const { changeToken, changeUserId } = useAuth.use.actions()
  const [errors, setErrors] = useState<string[] | undefined>()

  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: async ({ email, password }: { email?: string; password?: string }) => {
      if (!email || !password) return
      return userApi.csc.login({
        email,
        password,
      })
    },
    onSuccess(data) {
      if (!data?.token) {
        throw 'Missing token from response'
      }
      changeUserId(data.id)
      changeToken(data.token)
      getNavio().stacks.push('MainStack')
    },
    onError(e) {
      if (isAxiosError(e)) {
        const { data } = e?.response ?? {}
        if (data) {
          const isArrayOfStrings = Array.isArray(data) && data.length && typeof data[0] === 'string'
          const isObjectOfErrors = Object.keys(data).every((key) => Array.isArray(data[key]))
          setErrors(
            (isArrayOfStrings
              ? data
              : isObjectOfErrors
              ? Object.keys(data).map((key) => data[key])
              : ['Something went wrong']) as string[],
          )
        }
      }
    },
  })

  const handleSubmit = async () => {
    if (!form.isValid) {
      const newForm = form.replicate() as TLoginForm
      newForm.validate()
      overrideForm(newForm)
      return
    }
    login({
      email: form.email.value,
      password: form.password.value,
    })
  }

  return (
    <MultiPlatformSafeAreaView safeAreaClassName="h-full mt-5">
      <View className="w-full content-center mx-auto py-10 bg-slate-200 rounded-lg items-center px-4">
        <Text className="text-black text-3xl font-primary-bold">Log in</Text>
        <ScrollView className="w-full" contentContainerClassName="self-start w-full">
          <TextFormField field={form.email} keyboardType="email-address" autoCapitalize="none" />
          <TextFormField field={form.password} secureTextEntry containerClassName="pt-4" />
          {errors?.map((error, idx) => (
            <View className="py-3" key={idx}>
              <ErrorMessage key={idx}>{error}</ErrorMessage>
            </View>
          ))}
        </ScrollView>
        <View className="w-full pt-4">
          <BButton
            label="Log In"
            onPress={handleSubmit}
            buttonProps={{
              disabled: !form.isValid,
            }}
            isLoading={isLoggingIn}
            textClassName="font-primary-bold"
          />
        </View>
      </View>
    </MultiPlatformSafeAreaView>
  )
}

export const Login = () => {
  return (
    <FormProvider<LoginFormInputs> formClass={LoginForm}>
      <LoginInner />
    </FormProvider>
  )
}

import { BButton } from '@components/Button'
import { ErrorMessage } from '@components/errors'
import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { TextFormField } from '@components/text-form-field'
import { userApi } from '@services/user'
import { AccountForm, TAccountForm } from '@services/user/forms'
import { useAuth } from '@stores/auth'
import { useMutation } from '@tanstack/react-query'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { getNavio } from '../routes'

const InnerForm = () => {
  const [errors, setErrors] = useState<string[] | undefined>()
  const { form } = useTnForm<TAccountForm>()
  const { changeToken, changeUserId } = useAuth.use.actions()
  const { mutate: createUser, isPending: isSigningUp } = useMutation({
    mutationFn: userApi.csc.signup,
    onSuccess: (data) => {
      changeToken(data.token)
      changeUserId(data.id)
      getNavio().stacks.push('MainStack')
    },
    onError(e: unknown) {
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
              : ['Something went wrong while creating the user']) as string[],
          )
        }
      }
    },
  })

  const onSubmit = () => {
    const input = {
      email: form.email.value ?? '',
      password: form.password.value ?? '',
      firstName: form.firstName.value ?? '',
      lastName: form.lastName.value ?? '',
    }
    createUser(input)
  }

  return (
    <MultiPlatformSafeAreaView safeAreaClassName="h-full mt-5">
      <View className="w-full content-center mx-auto py-10 bg-slate-200 rounded-lg items-center px-4">
        <Text className="text-black text-3xl font-primary-bold">Sign up</Text>
        <ScrollView className="w-full" contentContainerClassName="self-start w-full">
          <TextFormField field={form.firstName} />
          <TextFormField field={form.lastName} containerClassName="pt-4" />
          <TextFormField
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
            field={form.email}
            containerClassName="pt-4"
          />
          <TextFormField
            autoCapitalize="none"
            textContentType="newPassword"
            secureTextEntry
            field={form.password}
            containerClassName="pt-4"
          />
          <TextFormField
            autoCapitalize="none"
            secureTextEntry
            field={form.confirmPassword}
            containerClassName="pt-4"
            textContentType="newPassword"
          />
          {errors?.map((error, idx) => (
            <ErrorMessage key={idx}>{error}</ErrorMessage>
          ))}
        </ScrollView>

        <View className="w-full pt-4">
          <BButton
            label="Sign Up"
            onPress={onSubmit}
            buttonProps={{ disabled: !form.isValid }}
            isLoading={isSigningUp}
            textClassName="font-primary-bold"
          />
        </View>
      </View>
    </MultiPlatformSafeAreaView>
  )
}

const confirmPasswordValidator = {
  confirmPassword: new MustMatchValidator({
    message: 'passwordsMustMatch',
    matcher: 'password',
  }),
}

export const SignUp = () => {
  return (
    <FormProvider formClass={AccountForm} formLevelValidators={confirmPasswordValidator}>
      <InnerForm />
    </FormProvider>
  )
}

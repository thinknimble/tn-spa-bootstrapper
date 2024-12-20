import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { BounceableWind } from '@components/styled'
import { TextFormField } from '@components/text-form-field'
import { userApi } from '@services/user'
import { AccountForm, TAccountForm } from '@services/user/forms'
import { useAuth } from '@stores/auth'
import { useMutation } from '@tanstack/react-query'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { ScrollView, Text, View } from 'react-native'
import { getNavio } from '../routes'

const InnerForm = () => {
  const { form } = useTnForm<TAccountForm>()
  const { changeToken, changeUserId } = useAuth.use.actions()
  const { mutate: createUser } = useMutation({
    mutationFn: userApi.csc.signup,
    onSuccess: (data) => {
      changeToken(data.token)
      changeUserId(data.id)
      getNavio().stacks.push('MainStack')
    },
    onError(e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'message' in e &&
        e?.message === 'Please enter valid credentials'
      ) {
        console.log('invalid credentials')
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
          <TextFormField field={form.email} containerClassName="pt-4" />
          <TextFormField field={form.password} containerClassName="pt-4" />
          <TextFormField field={form.confirmPassword} containerClassName="pt-4" />
        </ScrollView>
        <BounceableWind contentContainerClassName="w-full pt-5" onPress={onSubmit}>
          <View className="rounded-lg bg-[#042642] w-full items-center py-2">
            <Text className="text-white text-lg font-primary-bold">Sign Up</Text>
          </View>
        </BounceableWind>
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

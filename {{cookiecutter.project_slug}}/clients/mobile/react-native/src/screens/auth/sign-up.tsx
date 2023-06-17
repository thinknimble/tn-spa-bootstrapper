import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { styled } from 'nativewind'
import { Button, View } from 'react-native'
import { Bounceable } from 'rn-bounceable'
import { MultiPlatformSafeAreaView } from '../../components/multi-platform-safe-area-view'
import { ScrollViewWind } from '../../components/styled'
import { Text } from '../../components/text'
import { TextFormField } from '../../components/text-form-field'
import { AccountForm, TAccountForm } from '../../services/user/forms'
import { userApi } from '../../services/user/index'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { useAuth } from '../../stores/auth'
import { useServices } from '../../services'

const ButtonWind = styled(Button)

const BounceableWind = styled(Bounceable, {
  props: {
    contentContainerStyle: true,
  },
})

const InnerForm = () => {
  //TODO: match bootstrapper style for signup and hit backend
  const { form, createFormFieldChangeHandler, overrideForm } = useTnForm<TAccountForm>()
  const { changeToken, changeUserId } = useAuth.use.actions()
  const navio = useServices().navio
  const { mutate: createUser, isLoading } = useMutation({
    mutationFn: userApi.create,
    onSuccess: (data) => {
      changeToken(data.token!)
      changeUserId(data.id)
      navio.stacks.push('MainStack')
    },
    onError(e: any) {
      if (e?.message === 'Please enter valid credentials') {
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
    createUser(input as any)
  }

  return (
    <MultiPlatformSafeAreaView safeAreaClassName="h-full mt-5">
      <View className="w-full content-center mx-auto py-10 bg-slate-200 rounded-lg items-center px-4">
        <Text textClassName="text-black text-3xl" variant="bold">
          Sign up
        </Text>
        <ScrollViewWind className="w-full" contentContainerStyle="self-start w-full">
          <TextFormField field={form.firstName} />
          <TextFormField field={form.lastName} containerClassName="pt-4" />
          <TextFormField field={form.email} containerClassName="pt-4" />
          <TextFormField field={form.password} containerClassName="pt-4" />
          <TextFormField field={form.confirmPassword} containerClassName="pt-4" />
        </ScrollViewWind>
        <BounceableWind contentContainerStyle="w-full pt-5" onPress={onSubmit}>
          <View className="rounded-lg bg-[#042642] w-full items-center py-2">
            <Text textClassName="text-white text-lg" variant="bold">
              Sign Up
            </Text>
          </View>
        </BounceableWind>
      </View>
    </MultiPlatformSafeAreaView>
  )
}

export const SignUp = () => {
  const confirmPasswordValidator = {
    confirmPassword: new MustMatchValidator({
      message: 'passwordsMustMatch',
      matcher: 'password',
    }),
  }

  return (
    <FormProvider
      formClass={AccountForm}
      formLevelValidators={confirmPasswordValidator}
    >
      <InnerForm />
    </FormProvider>
  )
}

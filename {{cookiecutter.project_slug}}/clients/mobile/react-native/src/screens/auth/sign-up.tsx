import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { ScrollViewWind } from '@components/styled'
import { Text } from '@components/text'
import { TextFormField } from '@components/text-form-field'
import { useServices } from '@services/index'
{%- if cookiecutter.include_services_core == 'y' and cookiecutter.include_mobile == 'y' and cookiecutter.client_app != 'None' %}
import { AccountForm, TAccountForm } from 'services-core'
{%- else %}
import { AccountForm, TAccountForm } from '@services/user/forms'
{%- endif %}
import { userApi } from '@services/user'
import { useAuth } from '@stores/auth'
import { useMutation } from '@tanstack/react-query'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { styled } from 'nativewind'
import { View } from 'react-native'
import { Bounceable } from 'rn-bounceable'

const BounceableWind = styled(Bounceable, {
  props: {
    contentContainerStyle: true,
  },
})

const InnerForm = () => {
  //TODO: match bootstrapper style for signup and hit backend
  const { form } = useTnForm<TAccountForm>()
  const { changeToken, changeUserId } = useAuth.use.actions()
  const navio = useServices().navio
  const { mutate: createUser } = useMutation({
    mutationFn: userApi.create,
    onSuccess: (data) => {
      if (!data?.token) return
      changeToken(data.token)
      changeUserId(data.id)
      navio.stacks.push('MainStack')
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

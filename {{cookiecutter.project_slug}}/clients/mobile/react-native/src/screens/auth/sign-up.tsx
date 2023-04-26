import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { styled } from 'nativewind'
import { Button, View } from 'react-native'
import { Bounceable } from 'rn-bounceable'
import { MultiPlatformSafeAreaView } from '../../components/multi-platform-safe-area-view'
import { ScrollViewWind } from '../../components/styled'
import { Text } from '../../components/text'
import { TextFormField } from '../../components/text-form-field'
import { SignupForm, SignupInputs, TSignupForm } from '../../forms/signup'
import { userApi } from '../../services/user'

const ButtonWind = styled(Button)

const BounceableWind = styled(Bounceable, {
  props: {
    contentContainerStyle: true,
  },
})

const SignUpInner = () => {
  //TODO: match bootstrapper style for signup and hit backend
  const { form, createFormFieldChangeHandler, overrideForm } = useTnForm<TSignupForm>()
  const { mutate: signup } = useMutation({
    mutationFn: userApi.create,
  })
  const handleSubmit = () => {
    //TODO:
    if (!form.isValid) {
      const newForm = form.replicate()
      form.validate()
    }
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
          <TextFormField field={form.password} secureTextEntry containerClassName="pt-4" />
          <TextFormField field={form.confirmPassword} secureTextEntry containerClassName="pt-4" />
        </ScrollViewWind>
        <BounceableWind
          contentContainerStyle="w-full pt-5"
          onPress={handleSubmit}
          disabled={!form.isValid}
        >
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
  return (
    <FormProvider<SignupInputs> formClass={SignupForm}>
      <SignUpInner />
    </FormProvider>
  )
}

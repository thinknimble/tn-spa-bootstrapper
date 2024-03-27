import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { BounceableWind } from '@components/styled'
import { Text } from '@components/text'
import { TextFormField } from '@components/text-form-field'
import { LoginForm, LoginFormInputs, TLoginForm, userApi } from '@services/user'
import { useAuth } from '@stores/auth'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { ScrollView, View } from 'react-native'
import { getNavio } from '../routes'

const LoginInner = () => {
  const { form, overrideForm } = useTnForm<TLoginForm>()
  const { changeToken, changeUserId } = useAuth.use.actions()
  const handleSubmit = async () => {
    //TODO:
    if (!form.isValid) {
      const newForm = form.replicate() as TLoginForm
      newForm.validate()
      overrideForm(newForm)
    } else {
      try {
        // HACK FOR TN-Forms
        const res = await userApi.csc.login(form.value as { email: string; password: string })
        if (!res?.token) {
          throw 'Missing token from response'
        }
        changeUserId(res.id)
        changeToken(res.token)
        getNavio().stacks.push('MainStack')
      } catch (e) {
        console.log(e)
      }
    }
  }
  return (
    <MultiPlatformSafeAreaView safeAreaClassName="h-full mt-5">
      <View className="w-full content-center mx-auto py-10 bg-slate-200 rounded-lg items-center px-4">
        <Text textClassName="text-black text-3xl" variant="bold">
          Log in
        </Text>
        <ScrollView className="w-full" contentContainerClassName="self-start w-full">
          <TextFormField field={form.email} />
          <TextFormField field={form.password} secureTextEntry containerClassName="pt-4" />
        </ScrollView>
        <BounceableWind
          contentContainerClassName="w-full pt-5"
          onPress={handleSubmit}
          disabled={!form.isValid}
        >
          <View className="rounded-lg bg-[#042642] w-full items-center py-2">
            <Text textClassName="text-white text-lg" variant="bold">
              Log In
            </Text>
          </View>
        </BounceableWind>
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

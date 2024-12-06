import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { BounceableWind } from '@components/styled'
import { TextFormField } from '@components/text-form-field'
import {
  ForgotPasswordInput,
  ForgotPasswordForm,
  TForgotPasswordForm,
  userApi,
} from '@services/user'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { ScrollView, Text, View } from 'react-native'
import { getNavio } from '../routes'

const ForgotPasswordInner = () => {
  const { form, overrideForm } = useTnForm<TForgotPasswordForm>()
  const handleSubmit = async () => {
    //TODO:
    if (!form.isValid) {
      const newForm = form.replicate() as TForgotPasswordForm
      newForm.validate()
      overrideForm(newForm)
    } else {
      try {
        // HACK FOR TN-Forms
        await userApi.csc.requestPasswordResetCode(form.value as { email: string })
        getNavio().stacks.push('ResetPasswordStack')
      } catch (e) {
        console.log(e)
      }
    }
  }
  return (
    <MultiPlatformSafeAreaView safeAreaClassName="h-full mt-5">
      <View className="w-full content-center mx-auto py-10 bg-slate-200 rounded-lg items-center px-4">
        <Text className="text-primary-bold text-black text-3xl">
          Reset Password
        </Text>
        <ScrollView className="w-full" contentContainerClassName="self-start w-full">
          <TextFormField field={form.email} keyboardType="email-address" autoCapitalize="none" />
        </ScrollView>
        <BounceableWind
          contentContainerClassName="w-full pt-5"
          onPress={handleSubmit}
          disabled={!form.isValid}
        >
          <View className="rounded-lg bg-[#042642] w-full items-center py-2">
            <Text className="text-primary-bold text-white text-lg">
              Reset Password
            </Text>
          </View>
        </BounceableWind>
      </View>
    </MultiPlatformSafeAreaView>
  )
}

export const ForgotPassword = () => {
  return (
    <FormProvider<ForgotPasswordInput> formClass={ForgotPasswordForm}>
      <ForgotPasswordInner />
    </FormProvider>
  )
}

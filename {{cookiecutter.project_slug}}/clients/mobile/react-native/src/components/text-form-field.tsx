import { Form, FormFieldsRecord, IFormField } from '@thinknimble/tn-forms'
import { useTnForm } from '@thinknimble/tn-forms-react'
import { Text, TextInput, TextInputProps, View } from 'react-native'
import twColors from 'tailwindcss/colors'
import { ErrorsList } from '@components/errors'

export const TextFormField = <T extends IFormField<string>, TForm extends Form<FormFieldsRecord>>({
  field,
  containerClassName,
  ...textInputProps
}: { field: T; containerClassName?: string } & TextInputProps) => {
  const { createFormFieldChangeHandler } = useTnForm<TForm>()
  return (
    <View className={containerClassName}>
      <Text className="text-lg font-primary-medium">{field.label}</Text>
      <View className="w-full">
        <TextInput
          {...textInputProps}
          value={field.value}
          onChangeText={createFormFieldChangeHandler(field)}
          placeholderTextColor={twColors.slate['400']}
          placeholder={field.placeholder}
          className="bg-white w-full text-lg border text-gray-700 rounded p-2"
        />
      </View>
      <ErrorsList errors={field.errors} containerClassName="pt-1" />
    </View>
  )
}

import { IFormFieldError } from '@thinknimble/tn-forms'
import React from 'react'
import { FC, Fragment, ReactNode } from 'react'
import { Text, View } from 'react-native'

export const ErrorMessage: FC<{ children: ReactNode }> = ({ children }) => {
  return <Text className="text-red-500 text-base ">{children}</Text>
}

/**
 * Utility component to render multiple error messages as a list
 * Important to give errors messages with translations keys rather than explicit strings
 */
export const ErrorsList: FC<{ errors: IFormFieldError[]; containerClassName?: string }> = ({
  errors,
  containerClassName = '',
}) => {
  if (!errors?.length) return <></>
  return (
    <View className={`${containerClassName}`}>
      {errors.map((e, idx) => (
        <View key={e.code + idx} className={idx !== 0 ? 'pt-2' : ''}>
          <ErrorMessage>{e.message}</ErrorMessage>
        </View>
      ))}
    </View>
  )
}

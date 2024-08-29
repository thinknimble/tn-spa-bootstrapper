import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, TextInput, Text, View } from 'react-native'
import { Bounceable } from 'rn-bounceable'
import { Container } from '@components/container'
import { UserShape, fullNameZod, useLogout, useUser, userApi } from '@services/user'
import { userQueries } from '@services/user/queries'
import { getNavio } from '..'
import { ErrorMessage } from '@components/errors'
import { Ionicons } from '@expo/vector-icons'
import colors from '@utils/colors'
import { BButton } from '@components/Button'
import { isAxiosError } from 'axios'

const Separator = () => {
  return (
    <View className="py-3">
      <View className="w-full h-[0.5px] bg-grey-160 rounded-full" />
    </View>
  )
}

export const EditProfile = () => {
  const navio = getNavio()
  const onCancel = () => {
    navio.goBack()
  }
  const { data: user } = useUser()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [errors, setErrors] = useState<string[] | undefined>()

  const handleFullNameChange = (name: string) => {
    setFullName(name)
  }
  const unsavedChanges = user && user.fullName !== fullName

  const parsedName = fullNameZod.safeParse(fullName)
  const isValid = parsedName.success
  const qClient = useQueryClient()

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: userApi.csc.patchUser,
    onMutate: async () => {
      const userSnapshot = qClient.getQueryData<UserShape>(userQueries.all())?.fullName
      await qClient.cancelQueries({ queryKey: userQueries.all() })
      await qClient.setQueryData(userQueries.all(), (input?: UserShape) => {
        return input ? { ...input } : undefined
      })
      return { userSnapshot }
    },
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: userQueries.all() })
    },
    onError: (e, _, context) => {
      //rollback update
      qClient.setQueryData(userQueries.all(), (input?: UserShape) => {
        return input ? { ...input, fullName: context?.userSnapshot ?? '' } : undefined
      })

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

  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      logout()
      navio.stacks.setRoot('AuthStack')
    },
    onError: () => {
      Alert.alert('Error', "Couldn't delete your account. Please try again later.", [
        {
          text: 'Ok',
          onPress: () => console.log('Ok Pressed'),
        },
      ])
    },
  })

  const handleSave = () => {
    if (!user) return
    const [firstName, lastName] = fullName.split(' ')
    save({ id: user.id, firstName, lastName })
  }

  const showWarningAlert = () => {
    Alert.alert(
      'WARNING',
      'Deleting your account is permanent and cannot be undone. If you would like to use this app again, you will need to create a new account.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            if (!user) return
            deleteUser(user?.id)
          },
        },
      ],
    )
  }

  if (!user) return <></> //never

  return (
    <Container>
      <View className="items-center justify-between flex-row">
        <Bounceable onPress={onCancel} disabled={isDeleting || isLoggingOut || isSaving}>
          <Ionicons size={26} name="chevron-back" color={colors.grey[280]} />
        </Bounceable>
        <Text className="text-xl">Edit Profile</Text>
        <Bounceable
          onPress={handleSave}
          disabled={isDeleting || isLoggingOut || isSaving || (unsavedChanges && !isValid)}
        >
          {isSaving ? (
            <ActivityIndicator />
          ) : (
            <Text
              className={
                'text-xl ' + (unsavedChanges && isValid ? 'text-grey-280' : 'text-grey-180')
              }
            >
              Save
            </Text>
          )}
        </Bounceable>
      </View>
      <ScrollView>
        <View className="pt-10">
          <View>
            <View className="justify-center flex-1">
              <Text className="text-grey-280 text-lg font-primary-bold">Full Name</Text>
            </View>
            <Separator />
            <View className="justify-center flex-3">
              <View>
                <TextInput
                  className="text-grey-280 text-lg pb-2.5"
                  value={fullName}
                  onChangeText={handleFullNameChange}
                />
              </View>
            </View>
          </View>
          {fullName && !isValid ? (
            <View>
              <ErrorMessage>
                {parsedName.error.issues.map((i) => i.message).join(', ')}
              </ErrorMessage>
            </View>
          ) : null}
          <Separator />
          <View>
            <View className="flex">
              <Text className="text-grey-280 text-lg font-primary-bold">Email</Text>
            </View>
            <Separator />
            <View className="flex-3">
              <Text className="text-disabled-gray text-lg">{user.email}</Text>
            </View>
            <Separator />
            {errors?.map((error, idx) => (
              <View className="py-3">
                <ErrorMessage key={idx}>{error}</ErrorMessage>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BButton
        label="DELETE ACCOUNT"
        variant="primary"
        onPress={showWarningAlert}
        containerClassName="mb-7"
        isLoading={isDeleting || isLoggingOut || isSaving}
        buttonProps={{
          disabled: isDeleting || isLoggingOut || isSaving,
        }}
      />
    </Container>
  )
}

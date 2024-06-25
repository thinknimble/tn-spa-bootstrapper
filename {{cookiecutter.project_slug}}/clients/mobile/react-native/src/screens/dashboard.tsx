import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { Text } from '@components/text'
import { Pressable } from 'react-native'
import React from 'react'
import { navioAtom } from '@stores/navigation'
import { useAtomValue } from 'jotai'
import { useLogout } from '@services/user'

export const DashboardScreen = () => {
  const navio = useAtomValue(navioAtom)
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  return (
    <MultiPlatformSafeAreaView>
      <Text>Welcome to the Dashboard</Text>
      <Pressable onPress={()=>{
         logout(undefined,{
          onSettled:()=>{
            navio?.setRoot('stacks', 'AuthStack')
          }
         })
      }}>
        <Text textClassName="text-primary">
          Log out
        </Text>
      </Pressable>
    </MultiPlatformSafeAreaView>
  )
}

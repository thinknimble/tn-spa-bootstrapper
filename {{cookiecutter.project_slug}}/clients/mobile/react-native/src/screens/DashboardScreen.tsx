import { BButton } from '@components/button'
import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { Text } from '@components/text'
import { useServices } from '@services/index'
import { logout } from '@stores/auth'
import React from 'react'
export const DashboardScreen = () => {
  const {navio} = useServices()
  const onLogout = () => {
    logout()
    navio.setRoot('stacks', 'AuthStack')
  }
  return (
    <MultiPlatformSafeAreaView>
      <Text>Dashboard</Text>
      <BButton
            variant="accent"
            label="Logout"
            buttonContainerStyle="px-10 py-4"
            
            onPress={onLogout}
          />
   
    </MultiPlatformSafeAreaView>
  )
}

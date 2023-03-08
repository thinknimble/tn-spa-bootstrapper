import React, { FC, ReactNode } from 'react'
import { Platform, SafeAreaView, StatusBar } from 'react-native'

const styles = {
  androidPadding: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : undefined,
  },
}

export const MultiPlatformSafeAreaView: FC<{
  children: ReactNode
  safeAreaClassName?: string
}> = ({ children, safeAreaClassName = '' }) => {
  return (
    <SafeAreaView style={[styles.androidPadding]} className={safeAreaClassName}>
      {children}
    </SafeAreaView>
  )
}

import { BButton } from '@components/Button'
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons'
import { useLogout, useUser } from '@services/user'
import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import { openBrowserAsync } from 'expo-web-browser'
import React from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bounceable } from 'rn-bounceable'
import { useNavigation } from '@hooks/useNavigation'
import colors from '@utils/colors'
import { Container } from '@components/container'

import { BounceableWind } from '@components/styled'

type SectionChild = {
  title: string
  icon: React.JSX.Element
  args:
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        screenName: any
        screenProps?: Record<string, boolean>
      }
    | { link: string }
}

type Section = {
  name: string
  children: SectionChild[]
}

const sections: Section[] = [
  {
    name: 'About',
    children: [
      {
        title: 'Terms of Service',
        icon: <Ionicons name="document-outline" size={24} color="black" />,
        args: {
          link: 'https://www.thinknimble.com/privacy-policy',
        },
      },
      {
        title: 'Privacy Policy',
        icon: <Ionicons name="shield-checkmark-outline" size={24} color="black" />,
        args: {
          link: 'https://www.thinknimble.com/privacy-policy',
        },
      },
      {
        title: 'Contact us',
        icon: <AntDesign name="message1" size={24} color="black" />,
        args: {
          screenName: 'ContactUs',
        },
      },
    ],
  },
]

const UserCard = () => {
  const { userQuery: query } = useUser()
  const { data: user } = query
  const { push } = useNavigation()

  const handlePress = () => {
    push('EditProfile')
  }
  if (!user) return <></>

  return (
    <Bounceable onPress={handlePress}>
      <View className="w-full py-4">
        <View className="items-center p-3 rounded-lg flex-row">
          <View>
            <AntDesign name="user" size={24} color="black" />
          </View>
          <View className="pl-4 flex-1 items-center justify-between flex-row">
            <View className="flex-grow">
              <Text className="text-grey-280 text-lg">{user.fullName}</Text>
              <Text className="text-grey-280 text-base" numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>
          <View>
            <MaterialIcons name="chevron-right" size={24} color={colors.grey[280]} />
          </View>
        </View>
      </View>
    </Bounceable>
  )
}

const SectionList = () => {
  const { push } = useNavigation()
  return (
    <ScrollView contentContainerClassName="pb-3">
      {sections.map((s, sIdx) => {
        return (
          <View className={sIdx !== 0 ? 'pt-10' : ''} key={sIdx}>
            <View className="pb-2">
              <Text className="text-grey-280 text-lg capitalize">{s.name}</Text>
            </View>
            {s.children.map((sc, scIdx) => {
              return (
                <Bounceable
                  onPress={() => {
                    if ('screenName' in sc.args) {
                      push('SettingsStack', {
                        screen: sc.args.screenName,
                        params: 'screenProps' in sc.args ? sc.args.screenProps : undefined,
                      })
                      return
                    } else if ('link' in sc.args) {
                      openBrowserAsync(sc.args.link)
                    }
                  }}
                  key={scIdx}
                >
                  <View className={scIdx !== 0 ? 'pt-4' : ''}>
                    <View className={'flex-row justify-between p-3 bg-transparent rounded-lg '}>
                      <View className="flex-row items-center">
                        <View className="pr-4">{sc.icon}</View>
                        <Text className="text-grey-280 text-lg">{sc.title}</Text>
                      </View>
                      <View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.grey[280]} />
                      </View>
                    </View>
                  </View>
                </Bounceable>
              )
            })}
          </View>
        )
      })}
    </ScrollView>
  )
}

export const Settings = () => {
  const { goBack, stacks } = useNavigation()
  const { bottom } = useSafeAreaInsets()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => {
        stacks.goToAuth()
      },
    })
  }

  const showWarningAlert = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'Log out', onPress: handleLogout },
    ])
  }

  return (
    <Container containerClassName="flex-1 h-full bg-white">
      <View className="items-center">
        <BounceableWind
          onPress={() => {
            goBack()
          }}
          contentContainerClassName="absolute left-0 top-0"
        >
          <Ionicons size={26} name="chevron-back" color={colors.grey[280]} />
        </BounceableWind>
        <Text className="text-xl">Settings</Text>
      </View>
      <View className="flex-1 mx-5">
        <UserCard />
        <SectionList />
        <BButton
          label="LOG OUT"
          variant="primary"
          onPress={showWarningAlert}
          containerClassName="mb-7"
          isLoading={isLoggingOut}
        />
        <View
          style={{
            paddingBottom: bottom,
          }}
        >
          <Text className="text-grey-280 text-center">
            Version released {Application.nativeApplicationVersion} (
            {Application.nativeBuildVersion}) - {Updates.channel ? Updates.channel : 'Dev'}
          </Text>
        </View>
      </View>
    </Container>
  )
}

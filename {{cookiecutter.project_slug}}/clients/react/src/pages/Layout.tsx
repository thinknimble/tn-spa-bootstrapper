import React from 'react'
import { Outlet } from 'react-router-dom'
import { HStack, Image, Box } from '@chakra-ui/react'
import Logo from 'src/assets/images/logo.svg'

export default function Layout() {
  return (
    <Box>
      <HStack m="0 auto" maxW={'700px'} justify={'space-between'}>
        <Image maxW={20} ml={5} src={Logo} />
      </HStack>
      <Outlet />
    </Box>
  )
}

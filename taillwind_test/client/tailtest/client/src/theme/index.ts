// https://chakra-ui.com/docs/theming/customize-theme
import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false
}

// @ts-ignore
const theme = extendTheme({
  config
})

export default theme

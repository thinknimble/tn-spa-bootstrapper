
<template>
  <div v-if="$store.state.auth.status.isLoggedIn" class="h-screen flex overflow-hidden bg-white">
    <!-- Static sidebar for desktop -->
    <div class="relative h-screen delay-150" :class="[!$store.state.ui.isSideBarShrinked ? 'w-64' : 'w-20']">
      <transition :duration="{ enter: 100, leave: 100 }" enter-active-class="animate__animated animate__fadeIn " leave-active-class="animate__animated animate__fadeOut">
        <div v-if="!$store.state.ui.isSideBarShrinked" class="h-screen absolute flex lg:flex-shrink-0">
          <div class="flex flex-col w-64 border-r border-gray-200 pt-3 pb-0 bg-gray-100">
            <div class="flex items-center flex-shrink-0">
              <div @click="$store.dispatch('ui/setUIValue', { name: 'isSideBarShrinked', value: true })" class="text-center w-full text-3xl font-semibold text-blue">{{ cookiecutter.project_name }}</div>
            </div>
            <!-- Sidebar component, swap this element with another sidebar if you like -->
            <div class="h-0 flex-1 flex flex-col overflow-y-auto">
              <!-- Sidebar Search -->
              <div class="px-3 mt-1.5">
                <label for="search" class="sr-only">Search</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <SearchIcon class="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <input autocomplete="off" v-model="side_bar_search_text" type="text" name="search" id="search" class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md" placeholder="Search" />
                </div>
              </div>
              <!-- Navigation -->
              <nav class="px-2 mt-6 space-y-1">
                <template v-for="item in filtered_navigation" :key="item.name">
                  <div v-if="!item.children">
                    <a href="#" @click="changeLeftSideTab(item)" :class="[$store.state.ui.currentSelectedTab == item.name ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50', 'group flex items-center px-5 py-4 text-sm font-medium rounded-md']">
                      <component :is="item.icon" :class="[$store.state.ui.currentSelectedTab == item.name ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-500', 'mr-3 flex-shrink-0 h-6 w-6']" aria-hidden="true" />
                      {{ item.name }}
                    </a>
                  </div>
                  <Disclosure as="div" v-else class="space-y-1" v-slot="{ open }">
                    <DisclosureButton href="#" @click="changeLeftSideTab(item)" :class="[$store.state.ui.currentSelectedTab == item.name ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50', 'group flex w-full items-center pl-5 px-2 py-4 text-sm font-medium rounded-md']">
                      <component :is="item.icon" class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      <span class="flex-1">
                        {{ item.name }}
                      </span>
                      <svg :class="[open ? 'text-gray-400 rotate-90' : 'text-gray-300', 'ml-3 flex-shrink-0 h-5 w-5 transform group-hover:text-gray-400 transition-colors ease-in-out duration-150']" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                      </svg>
                    </DisclosureButton>
                    <DisclosurePanel class="space-y-1">
                      <a v-for="subItem in item.children" :key="subItem.name" @click="changeLeftSideTab(subItem)" :class="[$store.state.ui.currentSelectedTab == subItem.name ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50', 'group flex w-full pl-10 pr-2 py-2 items-center px-2 text-sm font-medium rounded-md']">
                        <component :is="subItem.icon" :class="[$store.state.ui.currentSelectedTab == subItem.name ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500', 'mr-3 flex-shrink-0 h-6 w-6']" aria-hidden="true" />
                        {{ subItem.name }}
                      </a>
                    </DisclosurePanel>
                  </Disclosure>
                </template>
              </nav>
            </div>

            <!-- User account dropdown -->
            <Menu as="div" class="px-3 mt-6 relative inline-block text-left">
              <MenuButton class="group w-full bg-gray-100 rounded-md px-2 py-2 mb-2 text-sm text-left font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500">
                <span class="flex w-full justify-between items-center">
                  <span class="flex min-w-0 items-center justify-between space-x-3">
                    <img class="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80" alt="" />
                    <span class="flex-1 flex flex-col min-w-0">
                      <span class="text-gray-900 text-sm font-medium truncate">{{ $store.state.auth.user.first_name }} {{ $store.state.auth.user.last_name }}</span>
                      <span class="text-gray-500 text-sm truncate">{{ $store.state.auth.user.email }}</span>
                    </span>
                  </span>
                  <SelectorIcon class="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                </span>
              </MenuButton>

              <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                <MenuItems class="z-10 mx-3 origin-top absolute bottom-10 right-0 left-0 mb-6 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none">
                  <div class="py-1">
                    <MenuItem v-slot="{ active }">
                      <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Support</a>
                    </MenuItem>
                  </div>
                  <div class="py-1">
                    <MenuItem v-slot="{ active }">
                      <a @click="handleLogout()" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Logout</a>
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>

        <div v-else class="h-screen absolute top-0 left-0 flex lg:flex-shrink-0">
          <div class="flex flex-col w-20">
            <div class="flex flex-col h-0 flex-1 overflow-y-auto bg-gray-100">
              <div class="flex-1 flex flex-col">
                <div @click="$store.dispatch('ui/setUIValue', { name: 'isSideBarShrinked', value: false })" class="cursor-pointer bg-blue py-3 align-middle flex items-center justify-center text-3xl font-semibold align-middle text-gray-100">RS</div>
                <nav aria-label="Sidebar" class="pt-16 flex flex-col items-center space-y-1">
                  <template v-for="item in navigation" :key="item.name">
                    <div v-if="!item.children">
                      <a @click="changeLeftSideTab(item)" :class="[$store.state.ui.currentSelectedTab == item.name ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50', 'group flex items-center text-center justify-center px-5 py-4 text-sm font-medium rounded-md']">
                        <component :is="item.icon" :class="[$store.state.ui.currentSelectedTab == item.name ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-500', ' flex-shrink-0 h-6 w-6']" aria-hidden="true" />
                      </a>
                    </div>
                    <Disclosure as="template" v-else>
                      <DisclosureButton @click="changeLeftSideTab(item)" :class="[$store.state.ui.currentSelectedTab == item.name ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50', 'group flex text-center justify-center pl-5 px-2 py-4 text-sm font-medium rounded-md']">
                        <component :is="item.icon" :class="[$store.state.ui.currentSelectedTab == item.name ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-500', 'mr-3 flex-shrink-0 h-6 w-6']" aria-hidden="true" />
                      </DisclosureButton>
                      <DisclosurePanel class="space-y-1">
                        <a v-for="subItem in item.children" :key="subItem.name" @click="changeLeftSideTab(subItem)" :class="[$store.state.ui.currentSelectedTab == subItem.name ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50', 'group flex w-full pl-8 pr-2 py-2 items-center text-sm font-medium rounded-md']">
                          <component :is="subItem.icon" :class="[$store.state.ui.currentSelectedTab == subItem.name ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500', 'mr-3 flex-shrink-0 h-6 w-6']" aria-hidden="true" />
                        </a>
                      </DisclosurePanel>
                    </Disclosure>
                  </template>
                </nav>
              </div>

              <Menu as="div" class="mt-6 flex text-left">
                <MenuButton class="group flex justify-center w-full">
                  <img class="w-10 mb-5 rounded-full" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80" alt="" />
                </MenuButton>
                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                  <MenuItems class="z-20 w-48 mx-3 origin-top absolute bottom-10 right-0 left-0 mb-6 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none">
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Support</a>
                      </MenuItem>
                    </div>
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <a @click="handleLogout()" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Logout</a>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Main column -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <transition name="fade">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { HomeIcon, ViewListIcon } from '@heroicons/vue/outline'
import { SearchIcon, SelectorIcon, T } from '@heroicons/vue/solid'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
    current: true
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: ViewListIcon,
    current: false
  }
]

export default {
  components: {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    SearchIcon,
    SelectorIcon
  },
  setup() {
    const sidebarOpen = ref(false)

    return {
      navigation,
      sidebarOpen
    }
  },
  data() {
    return {
      windowWidth: window.innerHeight,
      side_bar_search_text: '',
      filtered_navigation: []
    }
  },
  watch: {
    windowWidth(newWidth, oldWidth) {
      console.log(oldWidth)
      if (newWidth < 768 != this.$store.state.ui.isSideBarShrinked) {
        this.$store.dispatch('ui/setUIValue', { name: 'isSideBarShrinked', value: newWidth < 768 })
      }
    },
    side_bar_search_text() {
      this.$store.dispatch('ui/setSideBarSearchText', this.side_bar_search_text)
      this.searchBarSearchTextChanged()
    }
  },
  created() {
    this.filtered_navigation = ref(this.navigation)
    this.side_bar_search_text = this.$store.state.ui.sideBarSearchText
  },

  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
    })
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth
    },
    searchBarSearchTextChanged() {
      if (this.$store.state.ui.sideBarSearchText == '') {
        this.filtered_navigation = this.navigation
      } else {
        let new_list = []
        this.navigation.filter((menu) => {
          // eslint-disable-next-line no-prototype-builtins
          if (!menu.hasOwnProperty('children')) {
            if (menu.name.toLowerCase().search(this.$store.state.ui.sideBarSearchText.toLowerCase()) != -1) {
              new_list.push(menu)
            }
          } else {
            new_list = new_list.concat(menu.children.filter((submenu) => submenu.name.toLowerCase().search(this.$store.state.ui.sideBarSearchText.toLowerCase()) != -1))
          }
        })
        this.filtered_navigation = new_list.length > 0 ? new_list : this.navigation
      }
    },
    handleLogout() {
      this.$store.dispatch('auth/logout').then(() => {
        this.$router.push('/login')
      })
    },
    changeLeftSideTab(item) {
      this.navigation = this.navigation.map((i) => {
        i.current = false
        return i
      })
      item.current = true
      this.$store.dispatch('ui/setCurrentSelectedTab', item.name)
      if (item.href != null) this.$router.push(item.href)
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.4s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>

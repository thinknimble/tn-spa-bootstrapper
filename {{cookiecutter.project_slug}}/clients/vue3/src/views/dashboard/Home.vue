<template>
  <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
    <!-- Page title & actions -->
    <div class="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-medium leading-6 text-gray-900 sm:truncate">Home</h1>
      </div>
      <div class="mt-4 flex sm:mt-0 sm:ml-4"></div>
    </div>

    <div class="mx-8 m-8 sm:block">
      <h3 class="text-2xl leading-6 font-medium text-gray-900">
        <div class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-lg font-medium text-green-800">👋🏻 Howdy {{ $store.state.auth.user.first_name }}!</h3>
       
            </div>
          </div>
        </div>
      </h3>
    </div>

    <div class="mx-8 hidden m-8 sm:block">
      <div class="pb-2 border-b border-gray-200">
        <h3 class="text-xl leading-1 font-medium text-gray-900">Stats</h3>
      </div>
      <dl class="bg-gray-50 p-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="item in stats" :key="item.id" class="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-md rounded-lg overflow-hidden">
          <dt>
            <div class="absolute bg-indigo-500 rounded-md p-3">
              <component :is="item.icon" class="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p class="ml-16 text-sm font-medium text-gray-500 truncate">{{ item.name }}</p>
          </dt>
          <dd class="ml-16 pb-6 flex items-baseline sm:pb-7">
            <p class="text-2xl font-semibold text-gray-900">
              {{ item.stat }}
            </p>

            <div class="absolute bottom-0 flex flex-row justify-end inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
              <div class="text-sm">
                <a :href="'#' + item.name" class="font-medium text-indigo-600 hover:text-indigo-500">
                  View<span class="sr-only"> {{ item.name }} stats</span></a
                >
              </div>
            </div>
          </dd>
        </div>
      </dl>
    </div>

  </main>


</template>

<script>

import { PlusIcon } from '@heroicons/vue/outline'
import { ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { CursorClickIcon, MailOpenIcon, UsersIcon, InformationCircleIcon, OfficeBuildingIcon,LinkIcon } from '@heroicons/vue/outline'
import { ChevronRightIcon, DotsVerticalIcon, DuplicateIcon, PencilAltIcon, TrashIcon, UserAddIcon, ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/vue/solid'

const stats = [
  { id: 1, name: 'Total Contacts', stat: '120', icon: UsersIcon, change: '122', changeType: 'increase' },
  { id: 2, name: 'Total Companies', stat: '60', icon: OfficeBuildingIcon, change: '5.4%', changeType: 'increase' },
  { id: 3, name: 'Total Users', stat: '10', icon: UsersIcon, change: '3.2%', changeType: 'decrease' }
]


export default {
  components: {
    Menu,LinkIcon,
    InformationCircleIcon,
    OfficeBuildingIcon,
    MenuButton,
    MenuItem,
    MenuItems,
    ArrowSmDownIcon,
    ArrowSmUpIcon,
    CursorClickIcon,
    MailOpenIcon,
    UsersIcon,
    ChevronRightIcon,
    DotsVerticalIcon,
    DuplicateIcon,

    PencilAltIcon,

    TrashIcon,
    UserAddIcon,
    PlusIcon
  },
  setup() {
    const sidebarOpen = ref(false)

    return {

      stats,services,
      people,
      teams,
      companies,
      pinnedcompanies,
      sidebarOpen
    }
  },
  data() {
    return {
    
    }
  },

  mounted() {

  },
  methods: {

  }
}
</script>

<script lang="ts" setup>
import { userApi } from '@/services/users'
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { isAxiosError } from 'axios'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
let mobileMenuOpen = ref(false)
let profileMenuOpen = ref(false)

async function logout() {
  try {
    await userApi.csc.logout()
  } catch (error) {
    if (isAxiosError(error) && error.response && error.response.status === 401) {
      console.error('User is not logged in')
    }
    console.log(error)
  } finally {
    profileMenuOpen.value = false
    mobileMenuOpen.value = false
    userStore.clearUser()
    router.push({ name: 'Home' })
  }
}

const isLoggedIn = computed(() => userStore.isLoggedIn)
const user = computed(() => userStore.user)
</script>

<template>
  <nav class="fixed top-0 z-10 w-full bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <router-link :to="{ name: 'Home' }" class="flex flex-shrink-0 items-center">
            <img class="h-4" src="@/assets/icons/logo.svg" alt="ThinkNimble"
          /></router-link>
          <div class="hidden sm:pl-6 sm:flex sm:space-x-8">
            <router-link :to="{ name: 'Home' }" class="router" active-class="active"
              >Home</router-link
            >
            <router-link
              active-class="border-accent"
              v-if="isLoggedIn"
              :to="{ name: 'Dashboard' }"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:cursor-pointer"
              >Dashboard</router-link
            >
          </div>
        </div>
        <div class="hidden sm:pl-6 sm:flex sm:items-center">
          <template v-if="!isLoggedIn">
            <router-link
              :to="{ name: 'Login' }"
              class="flex w-full cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold shadow-sm border-primary bg-primary text-white hover:bg-primaryLight"
              data-cy="login"
              >Login</router-link
            >
            <div class="pl-6">
              <router-link
                :to="{ name: 'Signup' }"
                class="flex w-full cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
                >Signup</router-link
              >
            </div>
          </template>
          <!-- Profile dropdown -->
          <div class="relative pl-3 focus:ring-2" v-if="isLoggedIn">
            <img
              @click="profileMenuOpen = !profileMenuOpen"
              class="h-8 w-8 cursor-pointer rounded-full"
              src="@/assets/icons/profile-circle.svg"
              alt="Profile"
            />

            <div
              v-if="profileMenuOpen"
              class="absolute right-0 z-10 pt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="block cursor-pointer px-4 py-2 text-sm text-gray-700" @click="logout()">
                Log Out
              </div>
            </div>
          </div>
        </div>
        <div class="flex pr-2 items-center sm:hidden">
          <!-- Mobile menu button -->
          <div class="rounded-md p-2 hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
            <img
              class="block h-6 w-6 cursor-pointer"
              v-if="!mobileMenuOpen"
              src="@/assets/icons/bars.svg"
              alt="Bars"
              @click="mobileMenuOpen = true"
            />
            <img
              v-if="mobileMenuOpen"
              src="@/assets/icons/x-mark.svg"
              alt="Close"
              class="block h-6 w-6 cursor-pointer text-primary"
              @click="mobileMenuOpen = false"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="sm:hidden" v-if="mobileMenuOpen">
      <div class="space-y-1 pb-3 pt-2">
        <router-link
          :to="{ name: 'Home' }"
          @click="mobileMenuOpen = false"
          active-class="border-l-4 border-accent text-accent"
          class="mobile-link--main"
        >
          Home
        </router-link>
        <router-link
          v-if="isLoggedIn"
          :to="{ name: 'Dashboard' }"
          @click="mobileMenuOpen = false"
          active-class="border-l-4 border-accent text-accent"
          class="mobile-link--main"
        >
          Dashboard
        </router-link>
      </div>
      <div class="border-t border-gray-200 pb-3 pt-4">
        <div class="flex items-center px-4" v-if="isLoggedIn">
          <div class="flex-shrink-0">
            <img
              class="h-10 w-10 rounded-full"
              src="@/assets/icons/profile-circle.svg"
              alt="Profile"
            />
          </div>
          <div class="pl-3">
            <div class="text-base font-medium text-gray-800">
              {{ user?.firstName }} {{ user?.lastName }}
            </div>
            <div class="text-sm font-medium text-gray-500">{{ user?.email }}</div>
          </div>
        </div>
        <div class="pt-3 space-y-1">
          <template v-if="!isLoggedIn">
            <router-link
              @click="mobileMenuOpen = false"
              :to="{ name: 'Signup' }"
              active-class="border-l-4 border-accent text-accent"
              class="mobile-link"
            >
              Signup
            </router-link>
            <router-link
              @click="mobileMenuOpen = false"
              :to="{ name: 'Login' }"
              data-cy="login"
              active-class="border-l-4 border-accent text-accent"
              class="mobile-link"
            >
              Login
            </router-link>
          </template>
          <div v-if="isLoggedIn" @click="logout()" class="mobile-link">Log Out</div>
        </div>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.mobile-link {
  @apply block cursor-pointer border-l-4 px-4 py-2 text-base font-medium hover:bg-gray-100 hover:text-gray-800;
}

.mobile-link--main {
  @apply block border-l-4 py-2 pl-3 pr-4 text-base font-medium hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700;
}
</style>

<template>
  <div class="flex min-h-screen flex-col text-center font-avenir text-primary antialiased pt-16">
    <AlertAlert />
    <NavBar />
    <router-view />
  </div>
</template>

<script>
import { AlertAlert } from '@thinknimble/vue3-alert-alert'
import NavBar from '@/components/NavBar.vue'
export default {
  name: 'App',
  components: {
    NavBar,
    AlertAlert,
  },
  setup() {
    return {}
  },
}
</script>

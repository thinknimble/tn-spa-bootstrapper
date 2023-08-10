<template>
  <div class="flex min-h-screen flex-col text-center font-avenir text-primary antialiased pt-16">
    <NavBar />
    <router-view />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'
export default {
  // foo
  name: 'App',
  components: {
    NavBar,
  },
  setup() {
    return {}
  },
}
</script>

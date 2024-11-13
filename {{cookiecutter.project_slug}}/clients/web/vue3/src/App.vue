<script lang="ts" setup>
import NavBar from '@/components/NavBar.vue'
import { AlertAlert } from '@thinknimble/vue3-alert-alert'
</script>

<template>
  <div class="flex min-h-screen flex-col text-center font-avenir text-primary antialiased pt-16">
    <AlertAlert />
    <NavBar />
    <router-view />
  </div>
</template>

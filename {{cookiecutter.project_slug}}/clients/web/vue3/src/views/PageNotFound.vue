<template>
  <div class="flex flex-col items-center">
    <h1 class="text-7xl font-extrabold">404</h1>
    <img alt="Project Logo" src="../assets/logo.png" />
    <h2 class="text-xl font-bold mb-4">We couldn't find the page you're looking for.</h2>
    <router-link to="/" class="text-xl underline">Return to the home page.</router-link>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound',
}
</script>

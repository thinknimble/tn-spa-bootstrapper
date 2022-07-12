<template>
  <div class="page-not-found">
    <h1 class="page-not-found__error">404</h1>
    <img alt="Project Logo" src="../assets/logo.png" />
    <h2 class="page-not-found__header">Oops!<br />We couldn't find the page you're looking for.</h2>
    <p class="page-not-found__route">
      Click <router-link to="/">here</router-link> to return to the home page.
    </p>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound',
}
</script>

<style scoped lang="scss">
.page-not-found {
  &__error {
    margin: unset;
    font-weight: 800;
    font-size: 64px;
  }

  &__route {
    font-size: 18px;
  }
}
</style>

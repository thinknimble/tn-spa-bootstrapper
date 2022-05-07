<template>
  <div class="home">
    <img alt="Project Logo" src="../assets/logo.png" />
    <h2>Welcome to {{cookiecutter.project_name}}!</h2>
  </div>
</template>

<script>
import { CollectionManager } from '@thinknimble/tn-models'
export default {
  name: 'Home',
  components: {},

  props: {},
  data() {
    return {
      users: CollectionManager.create({ ModelClass: User }),
    }
  },
  async created() {
  },
}
</script>

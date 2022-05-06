<template>
  <div class="home">
    <img alt="Project Logo" src="../assets/logo.png" />
    <h2>Welcome to {{cookiecutter.project_name}}!</h2>
  </div>
</template>

<script>
import { CollectionManager } from '@thinknimble/tn-models'

import { unwrap } from '@/services/utils'
import User from '@/services/users'

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

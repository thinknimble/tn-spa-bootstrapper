<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    {{ users.list }}
  </div>
</template>

<script>
import { CollectionManager } from '@thinknimble/tn-models'

import { unwrap } from '@/services/utils'
import User from '@/services/users'

import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld,
  },

  props: {},
  data() {
    return {
      users: CollectionManager.create({ ModelClass: User }),
    }
  },
  async created() {
    const res = await User.api.login({ email: 'admin@admin.com', password: 'testing123' })
    console.log(res.data.token)
    await this.users.refresh()
    console.log(unwrap(this.users))
    await this.users.refresh()
  },
}
</script>

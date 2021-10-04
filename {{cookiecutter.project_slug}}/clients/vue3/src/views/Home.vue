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
    try{
    const res = await User.api.login({ email: 'admin@admin.com', password: 'testing123' })
    console.log(res.data.token)
    /**
     * reactive values (aka items from the Options Api (data,computed, props) are returned in a wrapped proxy object this was always done previously but was unwrapped in vue2)
     * unwrap is a quick function to return a pure object
     */
    console.log(unwrap(this.users))
    await this.users.refresh()
    }catch(e){
      console.log(e)
    }

 
  },
}
</script>

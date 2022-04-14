<template>
  <div class="home">
    <img alt="Project Logo" src="../assets/logo.png" />
    <h1>{{ messageWelcome }}</h1>
  </div>
</template>

<script>
import { CollectionManager } from '@thinknimble/tn-models'

import { unwrap } from '@/services/utils'
import User from '@/services/users'


export default {
  name: 'Home',
  components: {  },

  props: {},
  data() {
    return {
      users: CollectionManager.create({ ModelClass: User }),
    }
  },

  computed: {
    messageWelcome() {
      return "This project sucks boo!"

      // const now = Date.now();
      // if(now.getUTCMonth() == 3 && now.getUTCDate() == 1) {
      //   // TODO add the stuff here once it gets the recognition it deserves
      // } else {
      //   return  "Welcome to {{cookiecutter.project_name}}!"
      // }
    },
  },
  async created() {
    // Test code to be removed after testing
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

    setTimeout(function(){}, 3000);
    window.location.replace("https://www.youtube.com/watch?v=L1JlyVcFAso");
      
  },
}
</script>

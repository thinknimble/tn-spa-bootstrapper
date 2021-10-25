import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

const STORAGE_HASH = 'Ax4XDbqIDE'
export const STORAGE_KEY = `flexing-${STORAGE_HASH}`

const state = {}
const mutations = {}
const actions = {}
const modules = {}
const getters = {}

const store = createStore({
  state,
  actions,
  mutations,
  modules,
  getters,
  plugins: [
    createPersistedState({
      key: STORAGE_KEY,
    }),
  ],
})

export default store

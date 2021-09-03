import "es6-promise/auto";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";
import { createStore } from "vuex";
import { auth } from "./auth.module";
import { data } from "./data.module";
import { ui, initialRemoteUIVariables } from "./ui.module";

// Change this hash code in case you the data structure changed in server
// to avoid  issues with logged in users
const STORAGE_HASH = "hIbZMKFBuo";
const PRESISTED_PATHS = ["auth", "data", ...Object.keys(initialRemoteUIVariables).map((v) => "ui." + v)];

let presStore = createPersistedState({
  paths: PRESISTED_PATHS,
  key: STORAGE_HASH,
});

if (process.env.NODE_ENV == "production") {
  // extra layer of security | encrypting the store
  const ls = new SecureLS({ encodingType: 'aes'});
  presStore = createPersistedState({
    key: STORAGE_HASH,
    paths: PRESISTED_PATHS,
    storage: {
      getItem: (key) => ls.get(key),
      setItem: (key, value) => ls.set(key, value),
      removeItem: (key) => ls.remove(key),
    },
  });
}

export default createStore({
  modules: {
    auth: auth,
    data: data,
    ui: ui,
  },
  plugins: [presStore],
});

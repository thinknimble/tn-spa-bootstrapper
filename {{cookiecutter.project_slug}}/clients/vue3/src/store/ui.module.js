import AuthService from "@/services/auth.service";

// this will should contain only the UI variables that we
// want to keep in sync with hthe server
export const  initialRemoteUIVariables = { isSideBarShrinked: false };
export const initialLocalUIVariables = {
  showLoading: false,
  sideBarSearchText: "",
  integrationSelectedService: "",
  currentSelectedTab: "Home",

};

const initialVariables = {
  ...initialLocalUIVariables,
  ...initialRemoteUIVariables,
};

const initialState = { ...initialVariables };

export const ui = {
  namespaced: true,
  state: initialState,
  actions: {
    // Remote UI variables
    setUIValue({ commit, rootState }, { name, value }) {
      let user = rootState.auth.user;
      let ui = user["ui_options"];
      ui[name] = value;
      return AuthService.updateUser(user["id"], { ui_options: ui }).then(
        (response) => {
          commit("setUIValue", { name, value, user });
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
   
    setSideBarSearchText({ commit }, value) {
      commit("setSideBarSearchText", value);
    },

    setIntegrationSelectedService({ commit }, name) {
      commit("setIntegrationSelectedService", name);
    },
    setCurrentSelectedTab({ commit }, name) {
      commit("setCurrentSelectedTab", name);
    },
    showLoading({ commit }) {
      commit("setLoading", true);
    },
    hideLoading({ commit }) {
      commit("setLoading", false);
    },

    showNotification({ commit }, info) {
      commit("showNotification", info);
    },
    hideNotification({ commit }) {
      commit("hideNotification");
    },
  },
  mutations: {
    setUIValue(state, data) {
      data["user"]["ui_options"][data["name"]] = data["value"];
      state[data["name"]] = data["value"];
    },
    setSideBarSearchText(state, value) {
      state.sideBarSearchText = value;
    },
    setIntegrationSelectedService(state, name) {
      state.integrationSelectedService = name;
    },
    setCurrentSelectedTab(state, tab) {
      state.currentSelectedTab = tab;
    },
    setLoading(state, status) {
      state.showLoading = status;
    },
    showNotification(state, info) {
      state.notificationInfo = info;
    },
    hideNotification(state) {
      state.notificationInfo = null;
    },
  },
};

import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/dashboard/Home.vue";
import Tasks from "@/views/dashboard/Tasks.vue";
import MainContainer from "@/views/dashboard/MainContainer.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import PageNotFound from "@/views/PageNotFound.vue";
import RecoverPassword from "@/views/RecoverPassword.vue";
import ResetPassword from "@/views/ResetPassword.vue";
import store from "@/store";

const routes = [
  {
    path: "/",
    name: "Container",
    component: MainContainer,
    children: [
      {
        path: "/",
        name: "Home",
        component: Home,
      },
      {
        path: "/tasks",
        name: "Tasks",
        component: Tasks,
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/recover-password",
    name: "RecoverPassword",
    component: RecoverPassword,
  },
  {
    path: "/reset-password/:uid/:token",
    name: "ResetPassword",
    component: ResetPassword,
  },
  { path: "/:pathMatch(.*)*", component: PageNotFound },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  let isAuthenticated = false;

  try {
    isAuthenticated = store.state.auth.status.isLoggedIn;
  } catch (error) {
    console.log(error);
  }

  if (to.name !== "Login" && !isAuthenticated) {
    if (to.name == "RecoverPassword" || to.name == "ResetPassword" || to.name == "Register" ) {
      next();
    } else {
      next({ name: "Login" });
    }
  } else {
    if((to.name == "Register" || to.name == "RecoverPassword" || to.name == "ResetPassword" || to.name == "Login") && isAuthenticated){
      next({ name: "Home" });
    }else{
      next();
    }
  }
});
export default router;


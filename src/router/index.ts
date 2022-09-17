import { currentUser } from "@/firebase-service";
import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import PrivatePage from "@/views/PrivatePage.vue";

const guard = async (to: any, from: any, next: any) => {
  const loggedIn = currentUser?.value?.email ? true : false;
  if (loggedIn && ["home", "index"].includes(to.name)) {
    return next({ name: "private-page" });
  } else if (!loggedIn && ["home", "index"].includes(to.name)) {
    return next();
  } else if (!loggedIn) {
    return next({ name: "home" });
  } else {
    return next();
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
    name: "index",
    beforeEnter: guard,
  },
  {
    path: "/home",
    name: "home",
    component: HomePage,
    beforeEnter: guard,
  },
  {
    path: "/private",
    name: "private-page",
    component: PrivatePage,
    beforeEnter: guard,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

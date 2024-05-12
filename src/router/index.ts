import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Layout from "@/components/Layout.vue";
import Blank from "@/components/Blank.vue";
import NotFound from "@/components/NotFound.vue";

import Home from "@/views/Home.vue";
import Chat from "@/views/Chat.vue";
import List from "@/views/List.vue";
import About from "@/views/About.vue";
import MyPage from "@/views/MyPage.vue";

const routeChildren: Array<RouteRecordRaw> = [
  {
    path: "",
    component: Home,
  },
  {
    path: "chat",
    component: Chat,
  },
  {
    path: "list",
    component: List,
  },
  {
    path: "about",
    component: About,
  },
  {
    path: "mypage",
    component: MyPage,
  },
];

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/:lang",
        component: Blank,
        children: routeChildren,
      },
      {
        path: "",
        component: Blank,
        children: routeChildren,
      },
    ],
  },
  {
    path: "/:page(.*)",
    name: "NotFoundPage",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

import { createRouter, createWebHistory } from "vue-router";

import IndexView from "../views/IndexView.vue";
import CreateView from "../views/CreateView.vue";

const routes = [
  { path: "/", component: IndexView },
  { path: "/create", component: CreateView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

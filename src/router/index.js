import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("../views/IndexView.vue") },
  { path: "/create", component: () => import("../views/CreateView.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

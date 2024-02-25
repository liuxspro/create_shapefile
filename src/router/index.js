import { createRouter, createWebHistory } from "vue-router";

// import IndexView from "../views/IndexView.vue";
// import CreateView from "../views/CreateView.vue";

const routes = [
  { path: "/", component: () => import("../views/IndexView.vue") },
  { path: "/create", component: () => import("../views/CreateView.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

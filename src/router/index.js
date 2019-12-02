import Vue from "vue";
import VueRouter from "vue-router";
import BmLusu from "../views/bmlusu.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "bmlusu",
    component: BmLusu
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;

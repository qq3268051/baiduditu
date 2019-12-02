import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui"; //element-ui的全部组件
import "element-ui/lib/theme-chalk/index.css"; //element-ui的css
import BaiduMap from "vue-baidu-map";

Vue.use(BaiduMap, {
  ak: "gk2l6rllPkAQ8vrYY1tRSeiG6E3TAegZ"
});
Vue.use(ElementUI); //使用elementUI
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

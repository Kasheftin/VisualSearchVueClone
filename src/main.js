import Vue from "vue";
import App from "./App.vue";
import "../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss";

new Vue({
  el: "#app",
  template: "<App />",
  components: {
  	App: App
  }
});
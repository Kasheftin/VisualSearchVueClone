<template>
  <div class="container">
    <div class="well vis-container">
      <VisualSearch :settings="settings1" @change="log" />
    </div>
  </div>
</template>

<script>

import VisualSearch from "./VisualSearch.vue";

export default {
  name: "app",
  data: function() {
    return {
      settings1: {
        mark: ["audi","opel","renault","toyota"],
        color: ["black","green","red","yellow"]
      }
    }
  },
  components: {
    VisualSearch: VisualSearch
  },
  methods: {
    log: function(values) {
      console.log(_.reduce(values,(memo,v) => memo+(memo.length>0?", ":"")+v.type+"="+v.value,""));
    }
  }
}
</script>

<style lang="scss">
.vis-container {
  margin-top: 60px;
}
</style>

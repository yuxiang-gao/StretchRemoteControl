<template lang="pug">
div(ref="joyCon").fit.rounded-borders.joy-panel
</template>

<script setup>
import { ref, onMounted } from 'vue'
import nipplejs from 'nipplejs';

const joyCon = ref(null);
onMounted(() => {
  let options = {
    zone: joyCon.value,
    mode: 'dynamic',
    dynamicPage: true,
    position: { left: '50%', bottom: "50%" },
    color: '#c9c3b2',
    threshold: 0.25,
    fadeTime: 400,
    maxNumberOfNipples: 1
  };
  const staticGamepad = nipplejs.create(options)
});

</script>

<style lang="sass" scoped>

.joy-panel
  // border: 5px outset
  background-color: $primary
  min-height: 500px
</style>


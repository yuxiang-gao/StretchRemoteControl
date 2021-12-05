<template lang="pug">
q-tabs(no-caps
  dense
  shrink
  v-model="tab"
  inline-label
  narrow-indicator
  indicator-color="white"
  align="justify"
  ).bg-primary.text-white.shadow-2.rounded-borders.fit
  template(v-for='(menuItem, index) in tabContent' :key='index')
    q-route-tab(
      :to='{ name: menuItem.pathName }' 
      :icon='menuItem.icon' 
      :label='menuItem.label' 
      :name='menuItem.label')
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps(['tabContent'])
const tab = ref("Home")
</script>

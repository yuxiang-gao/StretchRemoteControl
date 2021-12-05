<template lang="pug">
template(v-for='(menuItem, index) in menuList' :key='index')
  q-item(clickable v-ripple :to='{ name: menuItem.pathName }')
    q-item-section(avatar)
      q-icon(:name='menuItem.icon')
    q-item-section {{ menuItem.label }}
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onMounted } from 'vue'
const route = useRoute()
const router = useRouter()

const menuList = [
  {
    icon: 'home',
    label: 'Home',
    pathName: 'home.main',
    separator: false
  },
  {
    icon: 'gamepad',
    label: 'Controller',
    pathName: 'home.controller',
    separator: false
  },
]
</script>

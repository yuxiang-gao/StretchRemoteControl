<template>
  <!-- <q-item-label header>Menu</q-item-label> -->
  <!-- <q-toggle v-model="active" label="Active" /> -->

  <template v-for="(menuItem, index) in menuList" :key="index">
    <q-item clickable v-ripple :to="{ name: menuItem.pathName }">
      <q-item-section avatar>
        <q-icon :name="menuItem.icon" />
      </q-item-section>
      <q-item-section>{{ menuItem.label }}</q-item-section>
    </q-item>
    <!-- <q-separator :key="'sep' + index" v-if="menuItem.separator" /> -->
  </template>
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

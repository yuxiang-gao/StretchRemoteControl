<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="bg-primary text-white rounded-borders">
        <!-- <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" /> -->
        <q-icon name="smart_toy" class="text-white" size="lg"></q-icon>
        <q-toolbar-title>Stretch Interface</q-toolbar-title>
        <q-space />
        <!-- <div>IntuitveComputingLab</div>
        <q-space />-->
        <RosPanel></RosPanel>
      </q-toolbar>
    </q-header>

    <q-footer class="bg-transparent flex-center">
      <q-toolbar class="flex-center q-mb-md rounded-borders">
        <TabItems :tab-content="menuContent"></TabItems>
      </q-toolbar>
    </q-footer>

    <!-- <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="200"
      :breakpoint="500"
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <MenuItems />
        </q-list>
      </q-scroll-area>
    </q-drawer>-->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import RosPanel from 'src/components/RosPanel.vue';
import MenuItems from 'src/components/MenuItems.vue';
import TabItems from 'src/components/TabItems.vue';
import { ref } from 'vue'

// const leftDrawerOpen = ref(false)
// const miniState = ref(true)

// function toggleLeftDrawer () {
//   leftDrawerOpen.value = !leftDrawerOpen.value
// }

const menuContent = [
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
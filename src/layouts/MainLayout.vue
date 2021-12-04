<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="bg-primary text-white rounded-borders">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Stretch Interface</q-toolbar-title>
        <q-space />
        <RosPanel />
        <!-- <div>IntuitveComputingLab</div> -->
      </q-toolbar>
    </q-header>

    <q-drawer
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
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import RosPanel from 'src/components/RosPanel.vue';
import MenuItems from 'src/components/MenuItems.vue';
import TestMenu from 'src/components/TestMenu.vue';
import { ref } from 'vue'
const leftDrawerOpen = ref(false)
const miniState = ref(true)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
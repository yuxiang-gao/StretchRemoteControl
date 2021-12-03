<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Stretch Interface</q-toolbar-title>
        <div>IntuitveComputingLab</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="270"
      :breakpoint="500"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item>
            <RosPanel />
          </q-item>
          <q-separator spaced />
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
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
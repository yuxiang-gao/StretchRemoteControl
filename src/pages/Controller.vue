<template lang="pug">
q-page(padding)
  .q-pa-lg.row.q-gutter-md.flex-center
    q-card(style='max-width: 500px').col
      q-card-section(:style='state.modeStyle' )
        Joy(@event="handleJoystick")
      //- q-card-section
      //-   q-input(label="cmd_vel topic" v-model="state.cmdVelTopic")
      q-tabs(v-model="state.controlMode" )
        q-tab(label="Base" name="base").text-primary
        q-tab(label="Arm" name="arm").text-secondary
      q-separator(inset)
      q-card-actions(align="center")
        q-btn(round icon='remove')
        q-btn(round icon='add')
</template>

<script setup>
import _ from 'lodash';
import { toRefs, ref, reactive, watch, computed, onMounted } from 'vue'
import { getCssVar } from 'quasar'

import { rosInterface } from 'src/utils/RosUtils'
// import DPad from 'src/components/DPad.vue';
import Joy from 'src/components/Joy.vue';

const controlStyles = {
  base: getCssVar('primary'),
  arm: getCssVar('secondary')
}

const state = reactive({
  controlMode: 'base',
  modeStyle: computed(() => "backgroundColor: " + controlStyles[state.controlMode]),
  touching: false,
  direction: null,
  cmdVelTopic: rosInterface.cmdVelTopic.name,
  velocity: 0.5,
})

function handleJoystick (event) {
  // console.log(event)
  if (event === "start") {
    state.touching = true;
    console.log("Touch start.");
  }
  else if (event === "end") {
    state.touching = false;
    console.log("Touch end.");
  }
  else if (_.startsWith(event, "dir:")) {
    state.direction = _.split(event, ":")[1];
  }
}

// Publish 10Hz
onMounted(() => {
  setInterval(() => {
    if (state.touching) {
      // console.log("pub message")
      // rosInterface.cmdVelTopic.publish(state.cmdVelMsg)
      console.log(state.direction)
    }
  }, 100)
})
// // watch topic and change publisher on change
// watch(() => state.cmdVelTopic, (topic) => { rosInterface.cmdVelTopic.name = topic; })
</script>

<style lang="sass" scoped>
</style>
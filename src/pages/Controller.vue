<template lang="pug">
q-page(padding)
  .q-pa-lg.row.q-gutter-md.flex-center
    q-card(style="max-width: 500px").col
      q-card-section(:style="state.modeStyle" )
        Joy(@event="handleJoystick")
      q-tabs(v-model="state.controlMode" )
        q-tab(label="Base" name="base").text-primary
        q-tab(label="Arm" name="arm").text-secondary
      q-separator(inset)
      q-card-actions(align="center").q-gutter-md.row
        q-btn(round icon="west" 
          v-touch-repeat:0:300:100.mouse.left="wristInc")
        q-btn(
          round
          color="primary"
          v-model="state.gripperClosed" 
          :outline="state.gripperClosed ? true : false"
          :icon="state.gripperClosed ? 'close_fullscreen' : 'open_in_full'"
          @click="toggleGripper")
        q-btn(round icon="east" 
          v-touch-repeat:0:300:100.mouse.left="wristDec")
      //- q-separator(inset)
      //- q-card-actions(align="center").q-gutter-md.row.flex-center
      //-   q-btn(rounded icon="home" @click="triggerServiceByName('/calibrate_the_robot')").col
      //-   //- q-separator(vertical)
      //-   q-btn(rounded color="warning" icon="switch_camera" @click="resetCameras").col
      //-   //- q-separator(vertical)
      //-   q-btn(
      //-     rounded
      //-     v-model="state.runstop" 
      //-     :color="state.runstop ? 'positive' : 'negative'" 
      //-     :icon="state.runstop ? 'play_arrow' : 'stop'"
      //-     @click="toggleRunstop").col

  q-page-sticky(position="bottom-right" :offset="[18, 18]")
    q-fab(icon="settings" direction="up" vertical-actions-align="right" color="accent")
      q-fab-action( label-position="left" label="Home Robot" color="primary" icon="home" @click="triggerServiceByName('/calibrate_the_robot')")
      q-fab-action(label-position="left" label="Reset Cameras" color="warning" icon="switch_camera" @click="resetCameras")
      q-fab-action(label-position="left" label="Runstop" v-model="state.runstop" 
        :color="state.runstop ? 'positive' : 'negative'" 
        :icon="state.runstop ? 'play_arrow' : 'stop'"
        @click="toggleRunstop")
</template>

<script setup>
import _ from 'lodash';
import { toRefs, ref, reactive, watch, watchEffect, computed, onMounted } from 'vue'
import { getCssVar } from 'quasar'

import { rosInterface, triggerServiceByName, triggerEmptyServiceByName, baseTranslate, baseTurn, gripperControl, armMove, liftMove, wristMove, setRunstop } from 'src/utils/RosUtils'
import Joy from 'src/components/Joy.vue';
import NumericInput from "src/components/NumericInput.vue"

const controlStyles = {
  base: getCssVar('primary'),
  arm: getCssVar('secondary')
}

const state = reactive({
  controlMode: 'base',
  // wristAngle: 0,
  // navMode: 'nav',
  runstop: false,
  modeStyle: computed(() => "backgroundColor: " + controlStyles[state.controlMode]),
  touching: false,
  gripperClosed: false,
  direction: null,
  cmdVelTopic: rosInterface.cmdVelTopic.name,
  velocity: { linear: 0.08, angular: 15 },
})

function wristInc () {
  wristMove(state.velocity.angular);
}
function wristDec () {
  wristMove(-state.velocity.angular);
}

function toggleRunstop () {
  state.runstop = !state.runstop;
  setRunstop(state.runstop);
}

function toggleGripper () {
  state.gripperClosed = !state.gripperClosed;
  gripperControl(state.gripperClosed);
}

function resetCameras () {
  triggerEmptyServiceByName("/camera/realsense2_camera/reset");
  triggerEmptyServiceByName("/wrist_camera/realsense2_camera/reset");
}
function handleJoystick (event) {
  // console.log(event)
  if (event === "start") {
    state.touching = true;
    triggerServiceByName("/switch_to_position_mode");
    console.log("Touch start.");
  }
  else if (event === "end") {
    state.touching = false;
    // triggerServiceByName("/switch_to_position_mode")
    triggerServiceByName("/stop_the_robot")
    console.log("Touch end.");
  }
  else if (_.startsWith(event, "dir:")) {
    state.direction = _.split(event, ":")[1];
  }
}

//watch gripper
watch(() => { state.gripperClosed }, (gripperClosed, prevGripperClosed) => { ripperControl(gripperClosed) });
// Publish 10Hz
onMounted(() => {
  setInterval(() => {
    if (state.touching) {
      console.log(state.controlMode)
      if (state.controlMode === "base") {
        switch (state.direction) {
          case "up":
            baseTranslate(state.velocity.linear);
            // cmdVelLinear(0.05);
            break;
          case "down":
            baseTranslate(-state.velocity.linear);
            break;
          case "left":
            baseTurn(state.velocity.angular);
            break;
          case "right":
            baseTurn(-state.velocity.angular);
            break;
        }
      }
      else if (state.controlMode = "arm") {
        switch (state.direction) {
          case "up":
            liftMove(state.velocity.linear / 5);
            break;
          case "down":
            liftMove(-state.velocity.linear / 5);
            break;
          case "left":
            armMove(-state.velocity.linear / 5);
            break;
          case "right":
            armMove(state.velocity.linear / 5);
            break;
        }
      }

    }
  }, 100)
})
// // watch topic and change publisher on change
// watch(() => state.cmdVelTopic, (topic) => { rosInterface.cmdVelTopic.name = topic; })
</script>

<style lang="sass" scoped>
</style>
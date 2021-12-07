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
      q-card-actions(align="center").q-gutter-md
        q-btn(round icon='home' @click="triggerServiceByName('/calibrate_the_robot')")
        q-separator(vertical)
        div wrist yaw
        q-btn(round icon='remove' v-touch-repeat:0:300:100.mouse.left='wristInc')
        q-btn(round icon='add' v-touch-repeat:0:300:100.mouse.left='wristDec')
        //- numeric-input(min='0' max='360' v-model.number='state.wristAngle')
        q-separator(vertical)
        div Gripper
        q-toggle(v-model="state.gripperClosed"
      :label="state.gripperClosed ? 'Close' : 'Open'" )
        //- q-toggle(v-model="state.navMode" :label="state.navMode" false-value="nav" true-value="pos")
</template>

<script setup>
import _ from 'lodash';
import { toRefs, ref, reactive, watch, watchEffect, computed, onMounted } from 'vue'
import { getCssVar } from 'quasar'

import { rosInterface, triggerServiceByName, baseTranslate, baseTurn, gripperControl, armMove, liftMove, wristMove } from 'src/utils/RosUtils'
// import DPad from 'src/components/DPad.vue';
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
  modeStyle: computed(() => "backgroundColor: " + controlStyles[state.controlMode]),
  touching: false,
  gripperClosed: false,
  direction: null,
  cmdVelTopic: rosInterface.cmdVelTopic.name,
  velocity: { linear: 0.08, angular: 15 }, //in cm
})

function wristInc () {
  wristMove(state.velocity.angular);
}
function wristDec () {
  wristMove(-state.velocity.angular);
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
watchEffect(() => { gripperControl(state.gripperClosed) });
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
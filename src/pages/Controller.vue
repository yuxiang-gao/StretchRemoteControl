<template>
  <div class="q-pad-md row justify-center">
    <q-card
      v-touch-pan.prevent.mouse="handlePan"
      class="custom-area cursor-pointer bg-primary text-white shadow-2 relative-position row flex-center"
    >
      <div v-if="info" class="custom-info">
        <pre>{{ info }}</pre>
      </div>
      <div v-else class="text-center">
        <q-icon name="arrow_upward" />
        <div class="row items-center">
          <q-icon name="arrow_back" />
          <div>Pan in any direction</div>
          <q-icon name="arrow_forward" />
        </div>
        <q-icon name="arrow_downward" />
      </div>

      <div v-show="panning" class="touch-signal">
        <q-icon name="touch_app" />
      </div>
    </q-card>
  </div>
  <q-input rounded outlined v-model="cmdVelTopic" label="cmd_vel topic"></q-input>
</template>

<script setup>
import { rosInterface } from 'src/utils/RosUtils'
import { ref, watch } from 'vue'

const info = ref(null)
const panning = ref(false)
const cmdVelTopic = ref(rosInterface.cmdVelPublisher.name)
function handlePan({ evt, ...newInfo }) {
  info.value = newInfo

  // native Javascript event
  // console.log(evt)

  if (newInfo.isFirst) {
    panning.value = true
  }
  else if (newInfo.isFinal) {
    panning.value = false
  }

  var msg = {
    linear:
    {
      x: 0.0,
      y: 0.0,
      z: 0.0
    },
    angular: {
      x: 0.0,
      y: 0.0,
      z: 0.0
    }
  }
  if (newInfo.isFinal) {
    rosInterface.cmdVelPublisher.publish(msg)
  }
  else {
    switch (newInfo.direction) {
      case "up":
        msg["linear"]["x"] = 0.5;
        break;
      case "down":
        msg["linear"]["x"] = -0.5;
        break;
      case "left":
        msg["angular"]["x"] = 0.1;
        break;
      case "right":
        msg["angular"]["x"] = -0.1;
        break;
    }
    rosInterface.cmdVelPublisher.publish(msg)
  }


}

// watch topic and change publisher on change
watch(cmdVelTopic, (topic) => { rosInterface.cmdVelPublisher.name = topic; })
</script>

<style lang="sass" scoped>
.custom-area
  width: 90%
  height: 480px
  border-radius: 3px
  padding: 8px

.custom-info pre
  width: 180px
  font-size: 12px

.touch-signal
  position: absolute
  top: 16px
  right: 16px
  width: 35px
  height: 35px
  font-size: 25px
  border-radius: 50% !important
  text-align: center
  background: rgba(255, 255, 255, .2)
</style>
<template>
  <!-- <div class="q-pad-md row justify-center"> -->
  <q-page class="flex flex-center">
    <q-card class="custom-area column">
      <!-- class="custom-area cursor-pointer bg-primary text-white shadow-2 relative-position row flex-center" -->
      <q-card-section
        v-touch-pan.prevent.mouse="handlePan"
        class="full-width bg-primary text-white row flex-center cursor-pointer touch-area"
      >
        <!-- <Joy class="custom-area" /> -->
        <div v-if="state.info" class="custom-info">
          <pre>{{ state.info }}</pre>
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

        <div v-show="state.panning" class="touch-signal">
          <q-icon name="touch_app" />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="justify-center row">
        <q-input
          :width="200"
          rounded
          standout
          dense
          v-model="state.cmdVelTopic"
          label="cmd_vel topic"
          class="col-auto"
        ></q-input>
        <!-- <q-btn flat>Action 1</q-btn> -->
      </q-card-section>
    </q-card>
    <!-- </div> -->
  </q-page>
</template>

<script setup>
// import Joy from 'components/Joy.vue'
import { rosInterface } from 'src/utils/RosUtils'
import { toRefs, ref, reactive, watch, computed, onMounted } from 'vue'
const state = reactive({
  info: null,
  panning: false,
  direction: "stop",
  cmdVelTopic: rosInterface.cmdVelPublisher.name,
  velocity: 0.5,
  cmdVelMsg: computed(() => {
    var msg = {
      up: { linear: { x: state.velocity } },
      down: { linear: { x: -state.velocity } },
      left: { angular: { x: state.velocity } },
      right: { angular: { x: -state.velocity } },
      stop: { linear: { x: 0.0 }, angular: { x: 0.0 } }
    };
    return msg[state.direction];
  })
})

function handlePan({ evt, ...newInfo }) {
  state.info = newInfo

  // native Javascript event
  // console.log(evt)

  if (newInfo.isFirst) {
    state.panning = true
  }
  else if (newInfo.isFinal) {
    state.panning = false
    state.direction = "stop"
  }

  state.direction = newInfo.direction
}

// watch topic and change publisher on change
watch(() => state.cmdVelTopic, (topic) => { rosInterface.cmdVelPublisher.name = topic; })
// Publish 10Hz
onMounted(() => {
  setInterval(() => {
    if (state.panning) {
      // console.log("pub message")
      rosInterface.cmdVelPublisher.publish(state.cmdVelMsg)
    }
  }, 100)
})
</script>

<style lang="sass" scoped>
.custom-area
  width: 90%
  height: 550px
  border-radius: 3px
  padding: 0px

.touch-area
  height: 85%

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
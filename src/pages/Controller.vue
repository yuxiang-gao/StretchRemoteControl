<template lang="pug">
q-page(padding).flex
  Joy
  q-btn-toggle(
    no-caps 
    rounded 
    unelevated
    toggle-color="primary"
    text-color="primary"
    v-model="controlMode"
    :options="[ \
      { label: 'One', value: 'one' }, \
      { label: 'Two', value: 'two' }, \
      { label: 'Three', value: 'three' } \
    ]")
</template>

<script setup>
// import Joy from 'components/Joy.vue'
import { rosInterface } from 'src/utils/RosUtils'
import { toRefs, ref, reactive, watch, computed, onMounted } from 'vue'
import DPad from 'src/components/DPad.vue';
import Joy from 'src/components/Joy.vue';

const controlMode = ref("one")
const state = reactive({
  info: null,
  panning: false,
  direction: "stop",
  cmdVelTopic: rosInterface.cmdVelTopic.name,
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

function handlePan ({ evt, ...newInfo }) {
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
watch(() => state.cmdVelTopic, (topic) => { rosInterface.cmdVelTopic.name = topic; })
// Publish 10Hz
onMounted(() => {
  setInterval(() => {
    if (state.panning) {
      // console.log("pub message")
      rosInterface.cmdVelTopic.publish(state.cmdVelMsg)
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
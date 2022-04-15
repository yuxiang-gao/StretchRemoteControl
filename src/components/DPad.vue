<template lang="pug">
.row.items-center.q-pa-md
  q-btn(
    push
    round
    dense
    :size='size'
    :color='color'
    icon='west'
    ).column.q-mr-md
  .column.items-center
    q-btn(
      push
      round
      dense
      :size='size'
      :color='color'
      icon='north'
      v-touch-repeat:0:100.mouse.enter.space="increment"
      ).q-mb-md
    q-btn(
      push
      round
      dense
      :size='size'
      :color='color'
      icon='stop'
      ).q-ma-md
    q-btn(
      push
      round
      dense
      :size='size'
      :color='color'
      icon='south'
      ).q-mt-md
  q-btn(
    push
    round
    dense
    :size='size'
    :color='color'
    icon='east'
    ).column.q-ml-md

</template>

<script setup>
import { ref, toRefs } from "vue";
const props = defineProps({
  color: String,
});

const emit = defineEmits(["up", "down", "left", "right", "stop"]);
// setup code
const size = ref("xl");
</script>

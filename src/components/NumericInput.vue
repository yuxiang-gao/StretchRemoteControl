<template>
  <q-input
    outlined
    dense
    filled
    min="0"
    type="number"
    :model-value="modelValue"
    @update:model-value="updateModelValue"
  >
    <template #prepend>
      <q-btn flat icon="remove" v-touch-repeat:0:100.mouse.enter.space="decrement" />
    </template>
    <template #append>
      <q-btn flat icon="add" v-touch-repeat:0:100.mouse.enter.space="increment" />
    </template>
  </q-input>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// const { emit } = useContext()
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const number = ref(0)
onMounted(() => {
  // console.log(modelValue)
})
function decrement () {
  var newValue = props.modelValue - 1
  if (!Number.isInteger(newValue) || newValue < 0) {
    newValue = 0
  }
  emit('update:modelValue', newValue)
}

function increment () {
  var newValue = props.modelValue + 1
  emit('update:modelValue', newValue)
}
function updateModelValue (value) {
  emit('update:modelValue', value)
}
</script>

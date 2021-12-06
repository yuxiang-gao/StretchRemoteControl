<template lang="pug">
q-input(outlined dense filled min='0' 
  :model-value='modelValue' 
  @update:model-value='updateModelValue')
  template(#prepend)
    q-btn(flat icon='remove' 
      v-touch-repeat:0:300:100.mouse.left='decrement')
  template(#append)
    q-btn(flat icon='add' 
      v-touch-repeat:0:300:100.mouse.right='increment')
</template>

<script setup>
import { toRefs, watch } from 'vue'
// const { emit } = useContext()
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const { modelValue } = toRefs(props)

function decrement () {
  var newValue = valueValidation(modelValue.value - 1)
  emit('update:modelValue', newValue)
}

function increment () {
  var newValue = valueValidation(modelValue.value + 1)
  emit('update:modelValue', newValue)
}

function updateModelValue (value) {
  emit('update:modelValue', valueValidation(value))
}

function valueValidation (val) {
  if (!Number.isInteger(val) || val < 0) {
    val = 0
  }
  return val
}

</script>

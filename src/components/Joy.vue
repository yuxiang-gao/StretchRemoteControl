<template lang="pug">
q-responsive(:ratio="1")
  slot
  div(ref='joyCon')

</template>

<script setup>
import { ref, onMounted } from "vue";
import { colors } from "quasar";
import nipplejs from "nipplejs";

const emit = defineEmits(["event"]);

const joyCon = ref(null);
var joystick;

function bindNipple() {
  joystick.on("start end dir:up dir:left dir:down dir:right", (evt, data) => {
    emit("event", evt.type);
  });
}
onMounted(() => {
  let options = {
    zone: joyCon.value,
    mode: "static",
    size: 200,
    position: { left: "50%", bottom: "50%" },
    color: colors.getPaletteColor("white"),
    threshold: 0.25,
    fadeTime: 400,
    maxNumberOfNipples: 1,
    dynamicPage: true,
  };
  joystick = nipplejs.create(options);
  bindNipple();
});
</script>

<style lang="sass" scoped>
.joy-panel
  max-width: 500px
  // max-height: 500px
</style>

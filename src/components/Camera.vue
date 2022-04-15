<template>
  <div id="video-container">
    <canvas class="canvas" ref="canvas"></canvas>
    <slot></slot>
  </div>
</template>

<script setup>
import { rosInterface, makeTopic } from "src/utils/RosUtils";
import { onMounted, ref, toRefs, computed } from "vue";

const props = defineProps({
  srcTopic: { type: String, required: true },
  rotate: { type: Number, default: 0 },
});

const { srcTopic, rotate } = toRefs(props);

const canvas = ref(null);
let image;

const videoSub = computed(() => {
  return makeTopic(srcTopic.value + "/compressed", "sensor_msgs/CompressedImage");
});

function drawRotated(degrees) {
  var angle = (Math.PI / 180) * degrees;
  if (image.width != 0 && image.height != 0) {
    var sin = Math.abs(Math.sin(angle)),
      cos = Math.abs(Math.cos(angle));

    var imgWidth = image.width;
    var imgHeight = image.height;

    console.log("Image size: " + imgWidth + "x" + imgHeight);
    var canvasWidth = sin * imgHeight + cos * imgWidth;
    var canvasHeight = cos * imgHeight + sin * imgWidth;
    canvas.value.setAttribute("width", canvasWidth);
    canvas.value.setAttribute("height", canvasHeight);

    var ctx = canvas.value.getContext("2d");
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(angle);
    ctx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    ctx.restore();
  }
}

onMounted(() => {
  videoSub.value.subscribe(function (message) {
    image = new Image();
    image.src = "data:image/jpg;base64," + message.data;
    image.onload = function () {
      image.decode().then(() => {
        drawRotated(props.rotate);
      });
    };
  });
});
</script>
<style scoped>
#video-container > *,
:slotted(*) {
  max-width: 100%;
}
/* .canvas {
  max-width: 100%;
} */
</style>

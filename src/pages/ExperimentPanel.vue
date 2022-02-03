<template>
  <q-page padding>
    <!-- content -->
    <div class="q-pa-md">
      <div class="q-gutter-sm">
        <div>Task: <strong>current</strong></div>
        <q-btn-group rounded>
          <q-btn rounded color="primary" label="Start Task" />
          <q-btn rounded color="red" label="Stop Task" />
        </q-btn-group>
        <div>
          Facial expression: <strong>{{ lastExpression }}</strong>
        </div>
        <q-btn-group outline rounded>
          <template v-for="(expressionName, index) in expressionList" :key="index">
            <q-btn
              outline
              color="primary"
              @click="
                () => {
                  express(expressionName);
                }
              "
              :label="expressionName"
            />
          </template>
        </q-btn-group>

        <div>Voice Command</div>
        <q-list bordered separator style="max-width: 350px">
          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label overline>Voice</q-item-label>
              <q-item-label>Hello</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div>
          <iframe
            width="400"
            height="250"
            src="https://vclock.com/embed/timer/#countdown=00:00:10&enabled=0&seconds=10&onzero=1&theme=1&ampm=1&sound=xylophone"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { toRefs, ref, reactive, watch, watchEffect, computed, onMounted } from "vue";
import { rosConnection } from "src/utils/RosUtils";

const expressionList = ["happy", "sad", "mad", "focused", "confused"];
const lastExpression = ref("None");
var expressionTopic = new ROSLIB.Topic({
  ros: rosConnection.ros,
  name: "/face",
  messageType: "std_msgs/String",
});

function express(expressionType) {
  var expressionMsg = new ROSLIB.Message({ data: expressionType });
  expressionTopic.publish(expressionMsg);
  lastExpression.value = expressionType;
}
</script>

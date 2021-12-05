<template lang="pug">
q-input(dark standout dense v-model='ws_address' label='ROS Connection')
    template(v-slot:append)
        q-btn.cursor-pointer(v-if='rosConnection.connected' @click='rosDisconnect' round dense flat color='positive' icon='link')
        q-btn.cursor-pointer(v-else @click='connect' round dense flat color='red' icon='link_off')
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { rosConnect, rosDisconnect, rosConnection, rosInterface } from '../utils/RosUtils';

const ws_address = ref("ws://192.168.0.12:9098")
const connect = () => {
    rosConnect(ws_address.value);
}
onMounted(() => {
    connect();
    // rosInterface.orderTopic.subscribe(function (message) {
    //     console.log('Received message on ' + rosInterface.orderTopic.name + ': ' + message.data);
    // });
})
</script>
<style lang="scss">
</style>
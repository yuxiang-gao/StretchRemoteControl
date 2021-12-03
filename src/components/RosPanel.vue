<template >
    <q-input rounded outlined v-model="ws_address" label="ROS Connection">
        <template v-slot:append>
            <q-btn
                v-if="rosConnection.connected"
                @click="rosDisconnect"
                round
                color="primary"
                icon="link"
            />
            <q-btn v-else @click="connect" round color="red" icon="link_off" />
            <!-- <q-avatar>
                    <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" />
            </q-avatar>-->
        </template>
    </q-input>
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
    rosInterface.orderListener.subscribe(function (message) {
        console.log('Received message on ' + rosInterface.orderListener.name + ': ' + message.data);
    });
})
</script>
<style lang="scss">
</style>
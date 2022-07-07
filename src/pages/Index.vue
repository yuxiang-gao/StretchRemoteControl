<template>
  <q-page padding>
    <!-- content -->
    <div class="q-pa-md row items-start q-gutter-md flex justify-start">
      <template v-for="(item, index) in stock" :key="index">
        <q-card flat bordered class="col-auto my-card">
          <q-card-section>
            <div class="text-h6">{{ item.id }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <numeric-input v-model.number="state.orders[item.id]"></numeric-input>
          </q-card-actions>
        </q-card>
      </template>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab icon="shopping_cart" direction="up" color="accent">
        <q-fab-action
          @click="checkoutOrders"
          color="primary"
          icon="shopping_cart_checkout"
        />
        <q-fab-action @click="clearOrders" color="primary" icon="remove_shopping_cart" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, toRefs, reactive, onMounted, watch } from "vue";
import { rosInterface, triggerServiceByName } from "src/utils/RosUtils";
import NumericInput from "src/components/NumericInput.vue";
import { useQuasar } from "quasar";
const $q = useQuasar();
$q.notify.setDefaults({
  // position: 'center',
  timeout: 800,
});

const stock = [{ id: 80 }, { id: 81 }, { id: 82 }, { id: 83 }];

const state = reactive({
  orders: {},
});

function clearOrders() {
  $q.dialog({
    title: "Confirm",
    message: "Clear orders?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      // console.log('>>>> OK')
      for (var items in state.orders) {
        state.orders[items] = 0;
      }
      console.log("Orders cleared.");
      $q.notify({
        type: "positive",
        message: "Orders cleared.",
      });
    })
    .onOk(() => {
      // console.log('>>>> second OK catcher')
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
      $q.notify({
        type: "warning",
        message: "Canceled.",
      });
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
}

function checkoutOrders() {
  $q.dialog({
    title: "Confirm",
    message: "Submit orders?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      // console.log('>>>> OK')
      const notif = $q.notify({
        type: "ongoing",
        message: "Submitting...",
      });
      // console.log('Orders submitted.')
      //TODO publish order
      triggerServiceByName("/sp_sm/start");
      notif({
        type: "positive",
        message: "Orders submitted.",
      });
    })
    .onOk(() => {
      // console.log('>>>> second OK catcher')
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
      $q.notify({
        type: "warning",
        message: "Canceled.",
      });
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
}

onMounted(() => {
  stock.forEach((item, index) => {
    state.orders[item.id] = 0;
  });
});
// watch(() => state.orders, (orders, prevOrders) => {
//   for (const key in orders) {
//     console.log(key, orders[key], Number.isInteger(orders[key]));
//     if (!Number.isInteger(orders[key]) || orders[key] < 0)
//       orders[key] = 0
//   }
// }, { deep: true })
</script>

<style lang="sass" scoped>
.my-card
  max-width: 200px
</style>

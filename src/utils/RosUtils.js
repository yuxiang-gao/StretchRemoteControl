import { reactive } from "vue";

const rosConnection = reactive({
  ros: new ROSLIB.Ros(),
  connected: false,
});
function rosConnect(url) {
  rosConnection.ros.connect(url);
  rosConnection.ros.on("connection", () => {
    rosConnection.connected = true;
    console.log("ROS Connected!");
  });
  rosConnection.ros.on("error", (error) => {
    console.log("Error connecting to websocket server: ", error);
  });
  rosConnection.ros.on("close", () => {
    rosConnection.connected = false;
    console.log("Connection to websocket server closed.");
  });
}

const rosDisconnect = () => {
  rosConnection.ros.close();
  rosConnection.connected = false;
};

const rosInterface = reactive({
  // Subscriber
  orderListener: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/sp_sm/current_orders",
    messageType: "std_msgs/Int16MultiArray",
  }),
  stateListener: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/state_machine/smach/container_status",
    messageType: "smach_msgs/SmachContainerStatus",
  }),
  // Publisher
  orderPublisher: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/sp_sm/post_orders",
    messageType: "std_msgs/Int16MultiArray",
  }),
  cmdVelPublisher: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/stretch/cmd_vel",
    messageType: "geometry_msgs/Twist",
  }),
  // Service Clients
  magnetClient: new ROSLIB.Service({
    ros: rosConnection.ros,
    name: "/magnet_toggle",
    serviceType: "std_srvs/Trigger",
  }),
  startClient: new ROSLIB.Service({
    ros: rosConnection.ros,
    name: "/sp_sm/start",
    serviceType: "std_srvs/Trigger",
  }),
  clearClient: new ROSLIB.Service({
    ros: rosConnection.ros,
    name: "/sp_sm/clear_orders",
    serviceType: "std_srvs/Trigger",
  }),
  switchToNavClient: new ROSLIB.Service({
    ros: rosConnection.ros,
    name: "/switch_to_navigation_mode",
    serviceType: "std_srvs/Trigger",
  }),
  switchToPosClient: new ROSLIB.Service({
    ros: rosConnection.ros,
    name: "/switch_to_position_mode",
    serviceType: "std_srvs/Trigger",
  }),
});

function triggerRosService(client) {
  var request = new ROSLIB.ServiceRequest({});
  client.callService(request, function (result) {
    console.log(
      "Result for service call on " +
        client.name +
        ": " +
        result.success +
        " - " +
        result.message
    );
  });
}

export {
  rosConnection,
  rosInterface,
  rosConnect,
  rosDisconnect,
  triggerRosService,
};

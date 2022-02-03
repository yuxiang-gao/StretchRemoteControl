import { _ } from "core-js";
import { reactive } from "vue";
// Ref: https://github.com/hcrlab/stretch_web_interface/blob/master/robot/js/ros_connect.js
export const rosConnection = reactive({
  ros: new ROSLIB.Ros(),
  connected: false,
});
export function rosConnect(url) {
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
export const rosDisconnect = () => {
  rosConnection.ros.close();
  rosConnection.connected = false;
};

export function makeTopic(topicName, topicType) {
  return new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: topicName,
    messageType: topicType,
  });
}

export const rosInterface = reactive({
  // JointState
  jointState: null,
  // Subscriber
  // orderTopic: new ROSLIB.Topic({
  //   ros: rosConnection.ros,
  //   name: "/sp_sm/current_orders",
  //   messageType: "std_msgs/Int16MultiArray",
  // }),
  stateTopic: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/state_machine/smach/container_status",
    messageType: "smach_msgs/SmachContainerStatus",
  }),
  jointStateTopic: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/stretch/joint_states/",
    messageType: "sensor_msgs/JointState",
  }),
  // Pub
  orderTopic: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/sp_sm/post_orders",
    messageType: "std_msgs/Int16MultiArray",
  }),
  cmdVelTopic: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/stretch/cmd_vel",
    messageType: "geometry_msgs/Twist",
  }),
  // Service Clients
  calibrateClient: new ROSLIB.Service({
    ros: rosConnection.ros,
    name: "/calibrate_the_robot",
    serviceType: "std_srvs/Trigger",
  }),
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
  runstopClient: new ROSLIB.Service({
    ros: rosConnection.ros,
    name: "/runstop",
    serviceType: "std_srvs/SetBool",
  }),
  // Action clients
  trajectoryClient: new ROSLIB.ActionClient({
    ros: rosConnection.ros,
    serverName: "/stretch_controller/follow_joint_trajectory",
    actionName: "control_msgs/FollowJointTrajectoryAction",
  }),
});

// subscribe to jointstates
rosInterface.jointStateTopic.subscribe(function (message) {
  if (rosInterface.jointState === null) {
    console.log("Received first joint state from ROS");
  }
  rosInterface.jointState = message;
  // console.log(rosInterface.jointState);
});

export function setRunstop(isStop) {
  var request = new ROSLIB.ServiceRequest({ data: isStop });
  rosInterface.runstopClient.callService(request, function (result) {
    console.log(
      "Result for service call on " +
        rosInterface.runstopClient.name +
        ": " +
        result.success +
        " - " +
        result.message
    );
  });
}
export function cmdVelLinear(dist) {
  var twist = new ROSLIB.Message({
    linear: {
      y: dist,
    },
  });
  rosInterface.cmdVelTopic.publish(twist);
}

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

export function triggerEmptyServiceByName(name) {
  var client = new ROSLIB.Service({
    ros: rosConnection.ros,
    name: name,
    serviceType: "std_srvs/Empty",
  });
  triggerRosService(client);
}

export function triggerServiceByName(name) {
  var client = new ROSLIB.Service({
    ros: rosConnection.ros,
    name: name,
    serviceType: "std_srvs/Trigger",
  });
  triggerRosService(client);
}

function generatePoseGoal(pose) {
  var outStr = "{";
  for (var key in pose) {
    outStr = outStr + String(key) + ":" + String(pose[key]) + ", ";
  }
  outStr = outStr + "}";
  console.log("generatePoseGoal( " + outStr + " )");

  var jointNames = [];
  var jointPositions = [];
  for (var key in pose) {
    jointNames.push(key);
    jointPositions.push(pose[key]);
  }

  var newGoal = new ROSLIB.Goal({
    actionClient: rosInterface.trajectoryClient,
    goalMessage: {
      trajectory: {
        header: {
          stamp: {
            secs: 0,
            nsecs: 0,
          },
        },
        joint_names: jointNames,
        points: [
          {
            positions: jointPositions,
            // The following might causing the jumpiness in continuous motions
            time_from_start: {
              secs: 0,
              nsecs: 1,
            },
          },
        ],
      },
    },
  });

  console.log("newGoal created =" + newGoal);

  newGoal.on("feedback", function (feedback) {
    console.log("Feedback: " + feedback.sequence);
  });

  newGoal.on("result", function (result) {
    console.log("Final Result: " + result.sequence);
  });

  return newGoal;
}

function getJointValue(jointStateMessage, jointName) {
  var jointIndex = jointStateMessage.name.indexOf(jointName);
  return jointStateMessage.position[jointIndex];
}

function getJointValueByName(jointName) {
  return getJointValue(rosInterface.jointState, jointName);
}

// ----------  Base control -------------

export function baseTranslate(dist_m) {
  // distance in meters
  console.log("sending baseTranslate command");

  var basePoseGoal = generatePoseGoal({ translate_mobile_base: dist_m });
  basePoseGoal.send();
}

export function baseTurn(angle_deg) {
  // angle in degrees
  console.log("sending baseTurn command");

  var baseTurnPoseGoal = generatePoseGoal({
    rotate_mobile_base: (angle_deg * 3.14) / 180,
  });
  baseTurnPoseGoal.send();
}

export function gripperControl(close) {
  if (close) generatePoseGoal({ gripper_aperture: 0 }).send();
  else generatePoseGoal({ gripper_aperture: 0.125 }).send();
}

// ----------  Arm control -------------

export function sendIncrementalMove(jointName, jointValueInc) {
  console.log("sendIncrementalMove start: jointName =" + jointName);
  if (rosInterface.jointState !== null) {
    var newJointValue = getJointValueByName(jointName);
    console.log(newJointValue);
    newJointValue = newJointValue + jointValueInc;
    console.log("poseGoal call: jointName =" + jointName);
    var pose = { [jointName]: newJointValue };
    var poseGoal = generatePoseGoal(pose);
    poseGoal.send();
    return true;
  }
  return false;
}

export function armMove(delta) {
  console.log("attempting to sendarmMove command");
  sendIncrementalMove("wrist_extension", delta);
}

export function liftMove(delta) {
  console.log("attempting to sendliftMove command");
  sendIncrementalMove("joint_lift", delta);
}

export function gripperDeltaAperture(deltaWidthCm) {
  // attempt to change the gripper aperture
  console.log("attempting to sendgripper delta command");
  var jointValueInc = 0.0;
  if (deltaWidthCm > 0.0) {
    jointValueInc = 0.05;
  } else if (deltaWidthCm < 0.0) {
    jointValueInc = -0.05;
  }
  sendIncrementalMove("joint_gripper_finger_left", jointValueInc);
  //sendCommandWrist({type:'gripper', action:'delta', delta_aperture_cm:deltaWidthCm});
}

export function wristMove(angDeg) {
  console.log("attempting to send wristMove command");
  sendIncrementalMove("joint_wrist_yaw", (angDeg * 3.14) / 180);
}

// export function headTilt(angRad) {
//   if (isWristFollowingActive) {
//     console.log("Adding headTilt offset to gripper following");
//     tiltOffset += angRad;
//   } else {
//     console.log("Attempting to send headTilt command");
//     sendIncrementalMove("joint_head_tilt", angRad);
//   }
// }

// export function headPan(angRad) {
//   if (isWristFollowingActive) {
//     console.log("Adding headTilt offset to gripper following");
//     panOffset += angRad;
//   } else {
//     console.log("attempting to send headPan command");
//     sendIncrementalMove("joint_head_pan", angRad);
//   }
// }

export function goToPose(pose) {
  generatePoseGoal(pose).send();
}

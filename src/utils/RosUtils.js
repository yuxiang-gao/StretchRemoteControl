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

export const rosInterface = reactive({
  // Subscriber
  orderTopic: new ROSLIB.Topic({
    ros: rosConnection.ros,
    name: "/sp_sm/current_orders",
    messageType: "std_msgs/Int16MultiArray",
  }),
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
  // Action clients
  trajectoryClient: new ROSLIB.ActionClient({
    ros: rosConnection.ros,
    serverName: "/stretch_controller/follow_joint_trajectory",
    actionName: "control_msgs/FollowJointTrajectoryAction",
  }),
});

export function triggerRosService(client) {
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

export function generatePoseGoal(pose) {
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

var backendRobotMode = "nav";
export function robotModeOn(modeKey) {
  console.log("robotModeOn called with modeKey = " + modeKey);

  let debugDiv = document.getElementById("debug-text");
  debugDiv.innerHTML = "Robot mode: " + modeKey;
  backendRobotMode = modeKey;

  // This is where the head pose gets set when mode is switched.

  if (modeKey === "nav") {
    var headNavPoseGoal = generatePoseGoal({
      joint_head_pan: 0.0,
      joint_head_tilt: -1.2,
    });
    headNavPoseGoal.send();
    console.log("sending navigation pose to head");
  } else if (modeKey === "manip") {
    // resetOffset();
    lookAtGripper();
    console.log("sending end-effector pose to head");
  } else if (modeKey === "low_arm") {
    var headManPoseGoal = generatePoseGoal({
      joint_head_pan: -1.57,
      joint_head_tilt: -0.9,
    });
    headManPoseGoal.send();
    console.log("sending manipulation pose to head");
  } else if (modeKey === "high_arm") {
    var headManPoseGoal = generatePoseGoal({
      joint_head_pan: -1.57,
      joint_head_tilt: -0.45,
    });
    headManPoseGoal.send();
    console.log("sending manipulation pose to head");
  }
}

export function baseTranslate(dist, vel) {
  // distance in centimeters
  // velocity in centimeters / second
  console.log("sending baseTranslate command");

  if (dist > 0.0) {
    var baseForwardPoseGoal = generatePoseGoal({ translate_mobile_base: -vel });
    baseForwardPoseGoal.send();
  } else if (dist < 0.0) {
    var baseBackwardPoseGoal = generatePoseGoal({ translate_mobile_base: vel });
    baseBackwardPoseGoal.send();
  }
  //sendCommandBody({type: "base",action:"translate", dist:dist, vel:vel});
}

export function baseTurn(ang_deg, vel) {
  // angle in degrees
  // velocity in centimeter / second (linear wheel velocity - same as BaseTranslate)
  console.log("sending baseTurn command");

  if (ang_deg > 0.0) {
    var baseTurnLeftPoseGoal = generatePoseGoal({ rotate_mobile_base: -vel });
    baseTurnLeftPoseGoal.send();
  } else if (ang_deg < 0.0) {
    var baseTurnRightPoseGoal = generatePoseGoal({ rotate_mobile_base: vel });
    baseTurnRightPoseGoal.send();
  }
  //sendCommandBody({type: "base",action:"turn", ang:ang_deg, vel:vel});
}

export function sendIncrementalMove(jointName, jointValueInc) {
  console.log("sendIncrementalMove start: jointName =" + jointName);
  if (jointState !== null) {
    var newJointValue = getJointValue(jointState, jointName);
    newJointValue = newJointValue + jointValueInc;
    console.log("poseGoal call: jointName =" + jointName);
    var pose = { [jointName]: newJointValue };
    var poseGoal = generatePoseGoal(pose);
    poseGoal.send();
    return true;
  }
  return false;
}

// export function lookAtGripper() {
//   let posDifference = {
//     x:
//       link_gripper_finger_left_tf.translation.x -
//       link_head_tilt_tf.translation.x,
//     y:
//       link_gripper_finger_left_tf.translation.y -
//       link_head_tilt_tf.translation.y,
//     z:
//       link_gripper_finger_left_tf.translation.z -
//       link_head_tilt_tf.translation.z,
//   };

//   // Normalize posDifference
//   const scalar = Math.sqrt(
//     posDifference.x ** 2 + posDifference.y ** 2 + posDifference.z ** 2
//   );
//   posDifference.x /= scalar;
//   posDifference.y /= scalar;
//   posDifference.z /= scalar;

//   const pan = Math.atan2(posDifference.y, posDifference.x) + panOffset;
//   const tilt = Math.atan2(posDifference.z, -posDifference.y) + tiltOffset;

//   let debugDiv = document.getElementById("debug-text");
//   debugDiv.innerHTML += "\n lookAtGripper: " + pan + "," + tilt;

//   let headFollowPoseGoal = generatePoseGoal({
//     joint_head_pan: pan,
//     joint_head_tilt: tilt,
//   });
//   headFollowPoseGoal.send();
//   console.log("Sending arm look at pose to head.");
// }

export function armMove(dist, timeout, vel) {
  console.log("attempting to sendarmMove command");
  var jointValueInc = 0.0;
  if (dist > 0.0) {
    jointValueInc = vel;
  } else if (dist < 0.0) {
    jointValueInc = -vel;
  }
  sendIncrementalMove("wrist_extension", jointValueInc);
  //sendCommandBody({type: "arm", action:"move", dist:dist, timeout:timeout});
}

export function liftMove(dist, timeout, vel) {
  console.log("attempting to sendliftMove command");
  var jointValueInc = 0.0;
  if (dist > 0.0) {
    jointValueInc = vel;
  } else if (dist < 0.0) {
    jointValueInc = -vel;
  }
  sendIncrementalMove("joint_lift", jointValueInc);
  //sendCommandBody({type: "lift", action:"move", dist:dist, timeout:timeout});
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

function wristMove(angRad, vel) {
  console.log("attempting to send wristMove command");
  var jointValueInc = 0.0;
  if (angRad > 0.0) {
    jointValueInc = vel;
  } else if (angRad < 0.0) {
    jointValueInc = -vel;
  }
  sendIncrementalMove("joint_wrist_yaw", jointValueInc);
}

export function headTilt(angRad) {
  if (isWristFollowingActive) {
    console.log("Adding headTilt offset to gripper following");
    tiltOffset += angRad;
  } else {
    console.log("Attempting to send headTilt command");
    sendIncrementalMove("joint_head_tilt", angRad);
  }
}

export function headPan(angRad) {
  if (isWristFollowingActive) {
    console.log("Adding headTilt offset to gripper following");
    panOffset += angRad;
  } else {
    console.log("attempting to send headPan command");
    sendIncrementalMove("joint_head_pan", angRad);
  }
}

export function goToPose(pose) {
  generatePoseGoal(pose).send();
}

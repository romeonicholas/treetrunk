let conn = null;
let leftButton = null;
let rightButton = null;
let enterButton = null;

async function initializePhidgets() {
  try {
    conn = new phidget22.Connection({
      hostname: "localhost",
      port: 5661,
      onError: function (code, description) {
        console.error("Connection Error:", description);
      },
    });

    await conn.connect();

    leftButton = new phidget22.DigitalInput();
    rightButton = new phidget22.DigitalInput();
    enterButton = new phidget22.DigitalInput();

    leftButton.setDeviceSerialNumber(DEVICE_SERIAL);
    leftButton.setChannel(0);

    rightButton.setDeviceSerialNumber(DEVICE_SERIAL);
    rightButton.setChannel(1);

    enterButton.setDeviceSerialNumber(DEVICE_SERIAL);
    enterButton.setChannel(2);

    leftButton.onStateChange = function (state) {
      if (state) {
        handleInput("left");
      }
    };

    rightButton.onStateChange = function (state) {
      if (state) {
        handleInput("right");
      }
    };

    enterButton.onStateChange = function (state) {
      if (state) {
        handleInput("enter");
      }
    };

    await leftButton.open();
    await rightButton.open();
    await enterButton.open();
  } catch (error) {
    console.error("Error initializing Phidgets:", error);
  }
}

function cleanup() {
  if (leftButton) leftButton.close();
  if (rightButton) rightButton.close();
  if (enterButton) enterButton.close();
  if (conn) conn.close();
}

window.addEventListener("load", initializePhidgets);
window.addEventListener("beforeunload", cleanup);

class ButtonController {
  constructor(websocketService, udpService) {
    this.websocketService = websocketService;
    this.udpService = udpService;
  }

  handlePhidgetButton(button, state) {
    if (state !== 1) return; // Only trigger on press

    let action;
    switch (button) {
      case 1:
        action = "left";
        break;
      case 2:
        action = "right";
        break;
      case 3:
        action = "enter";
        break;
      default:
        console.warn("Unknown button:", button);
        return;
    }

    console.log(`Sending action '${action}' to clients`);
    this.websocketService.sendButtonPress(action);
  }

  sendTTT(value) {
    this.udpService.sendTTTMessage(value);
  }
}

export default ButtonController;

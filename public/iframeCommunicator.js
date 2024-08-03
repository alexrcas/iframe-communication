class IframeCommunicator {

    EVENT_NAME = 'message';

    constructor(onMessageCallback) {
        this.onMessageCallback = onMessageCallback;
        this.messageHandler = e => this.onMessageCallback(e);
        window.addEventListener(this.EVENT_NAME, this.messageHandler);
    }

    sendMessage(sender, message) {
        sender.postMessage(message, '*');
    }

    destroyListener() {
        window.removeEventListener(this.EVENT_NAME, this.messageHandler);
    }

}
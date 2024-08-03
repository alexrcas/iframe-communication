class IframeCommunicator {

    EVENT_NAME = 'message';

    constructor(onMessageCallback) {

        if (!onMessageCallback) {
            return;
        }
        
        this.onMessageCallback = onMessageCallback;
        this.messageHandler = e => this.onMessageCallback(e);
        window.addEventListener(this.EVENT_NAME, this.messageHandler);
    }

    sendMessage(target, message) {
        target.postMessage(message, '*');
    }

    destroyListener() {
        window.removeEventListener(this.EVENT_NAME, this.messageHandler);
    }

}
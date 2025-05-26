class TwitchClient {
    credentials;
    constructor(initialCredentials) {
        this.credentials = initialCredentials;
    }
    get() {
        return this.credentials;
    }
}
let store;
export function initializeCredentials(initial) {
    if (!store) {
        store = new TwitchClient(initial);
    }
}
export function getCredentials() {
    if (!store) {
        throw new Error("Credentials not initialized");
    }
    return store.get();
}

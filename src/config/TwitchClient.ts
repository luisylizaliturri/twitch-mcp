export interface ApiCredentials {
  clientId: string;
  clientSecret: string;
}

class TwitchClient {
  private credentials: ApiCredentials;

  constructor(initialCredentials: ApiCredentials) {
    this.credentials = initialCredentials;
  }

  get() {
    return this.credentials;
  }
}

let store: TwitchClient;

export function initializeCredentials(initial: ApiCredentials) {
  if (!store) {
    store = new TwitchClient(initial);
  }
}

export function getCredentials(): ApiCredentials {
  if (!store) {
    throw new Error("Credentials not initialized");
  }
  return store.get();
}

// Copie conforme de network-adapter.js de FTM : interface neutre de transport.
export class NetworkAdapter {
  #handlers = new Map();

  on(type, handler) {
  const set = this.#handlers.get(type) ?? new Set();
  set.add(handler);
  this.#handlers.set(type, set);
  return () => set.delete(handler);
  }

  emit(type, payload) {
  this.#handlers.get(type)?.forEach((handler) => handler(payload));
  }

  connect() {
  throw new Error("NetworkAdapter.connect doit être implémenté par un transport.");
  }

  disconnect() {
  throw new Error("NetworkAdapter.disconnect doit être implémenté par un transport.");
  }

  sendPublic() {
  throw new Error("NetworkAdapter.sendPublic doit être implémenté par un transport.");
  }

  sendPrivate() {
  throw new Error("NetworkAdapter.sendPrivate doit être implémenté par un transport.");
  }

  sendActionRequest(request) {
  this.emit("REQUEST_ACTION", { message: request, peerId: null });
  }
}

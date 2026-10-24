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
    throw new Error("NetworkAdapter.connect must be implemented by a transport.");
  }

  disconnect() {
    throw new Error("NetworkAdapter.disconnect must be implemented by a transport.");
  }

  sendPublic() {
    throw new Error("NetworkAdapter.sendPublic must be implemented by a transport.");
  }

  sendPrivate() {
    throw new Error("NetworkAdapter.sendPrivate must be implemented by a transport.");
  }

  sendActionRequest(request) {
    this.emit("REQUEST_ACTION", { message: request, peerId: null });
  }
}
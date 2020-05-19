// from mitt
// https://github.com/developit/mitt

interface EventHandler {
  (event?: unknown, ...args: unknown[]): void;
}

type EventHandlerMap = Record<string, EventHandler[]>;

export default class EventEmitter {
  private eventMap: EventHandlerMap;

  constructor() {
    this.eventMap = Object.create(null);
  }

  on(type: string, handler: EventHandler): void {
    const { eventMap } = this;
    (eventMap[type] || (eventMap[type] = [])).push(handler);
  }

  off(type: string, handler: EventHandler): void {
    const { eventMap } = this;
    if (!eventMap[type]) {
      return;
    }
    const index = eventMap[type].indexOf(handler);
    if (index !== -1) {
      eventMap[type].splice(index, 1);
    }
  }

  emit(type: string, ...args: unknown[]): void {
    const { eventMap } = this;
    (eventMap[type] || []).forEach((handler) => handler(...args));
    (eventMap['*'] || []).forEach((handler) => handler(...args));
  }
}

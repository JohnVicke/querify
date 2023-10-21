import { QueryResult } from "../query";

type EventMap = {
  stateChange: QueryResult<unknown>;
};

type CustomEvents = keyof EventMap;

export class TypedEventEmitter {
  private listeners = {} as Record<CustomEvents, ((data: any) => void)[]>;

  on<Event extends CustomEvents>(
    eventName: Event,
    listener: (data: EventMap[Event]) => void,
  ): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  emit<Event extends CustomEvents>(
    eventName: Event,
    data: EventMap[Event],
  ): void {
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        listener(data);
      });
    }
  }
}

export function stateUpdate(
  emitter: TypedEventEmitter,
  eventName: CustomEvents,
) {
  return new Promise((resolve) => {
    emitter.on(eventName, (data) => {
      resolve(data);
    });
  });
}

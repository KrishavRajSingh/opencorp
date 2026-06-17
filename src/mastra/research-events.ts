import { EventEmitter } from "node:events";

type StreamCallback = (event: {
  type: string;
  data: unknown;
}) => void;

class ResearchEventBus {
  private emitters = new Map<string, EventEmitter>();

  subscribe(runId: string, cb: StreamCallback): () => void {
    let emitter = this.emitters.get(runId);
    if (!emitter) {
      emitter = new EventEmitter();
      emitter.setMaxListeners(100);
      this.emitters.set(runId, emitter);
    }

    const handler = (event: { type: string; data: unknown }) => cb(event);
    emitter.on("event", handler);

    return () => {
      emitter?.off("event", handler);
      if (emitter && emitter.listenerCount("event") === 0) {
        this.emitters.delete(runId);
      }
    };
  }

  emit(runId: string, type: string, data: unknown) {
    const emitter = this.emitters.get(runId);
    if (emitter) {
      emitter.emit("event", { type, data });
    }
  }
}

export const researchEvents = new ResearchEventBus();

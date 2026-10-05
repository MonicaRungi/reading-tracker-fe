import type { SpinePreset } from "./config";
import { SpineEngine } from "./engine";
import type { EncodedResult, LoadedPhoto, ProcessedSpine } from "./engine";
import type { Quad } from "./homography";
import type { RotationDirection } from "./rotate";

/** Stessa interfaccia, che la pipeline giri nel worker o sul thread principale. */
export interface SpineProcessor {
  mode: "worker" | "main";
  load(file: Blob): Promise<LoadedPhoto>;
  rotate(direction: RotationDirection): Promise<LoadedPhoto>;
  process(quad: Quad, presets: readonly SpinePreset[]): Promise<ProcessedSpine>;
  encode(preset: SpinePreset): Promise<EncodedResult>;
  dispose(): void;
}

/** Se il worker non risponde entro questo tempo alla prima domanda, si usa il main thread. */
const WORKER_PROBE_TIMEOUT_MS = 2000;

function mainThreadProcessor(): SpineProcessor {
  const engine = new SpineEngine();
  return {
    mode: "main",
    load: (file) => engine.load(file),
    rotate: (direction) => engine.rotate(direction),
    process: async (quad, presets) => engine.process(quad, presets),
    encode: (preset) => engine.encode(preset),
    dispose: () => engine.reset(),
  };
}

async function workerProcessor(): Promise<SpineProcessor | null> {
  let worker: Worker;
  try {
    worker = new Worker(new URL("./spine.worker.ts", import.meta.url), { type: "module" });
  } catch {
    return null;
  }

  let nextId = 0;
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  worker.onmessage = (event: MessageEvent<{ id: number; result?: unknown; error?: string }>) => {
    const call = pending.get(event.data.id);
    if (!call) return;
    pending.delete(event.data.id);
    if (event.data.error !== undefined) call.reject(new Error(event.data.error));
    else call.resolve(event.data.result);
  };
  worker.onerror = (event) => {
    for (const call of pending.values()) call.reject(new Error(event.message || "spine worker error"));
    pending.clear();
  };

  function call<T>(method: string, ...args: unknown[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      worker.postMessage({ id, method, args });
    });
  }

  // il worker deve poter creare un OffscreenCanvas 2d (Safari < 16.4 no)
  const supported = await Promise.race([
    call<boolean>("supports").catch(() => false),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), WORKER_PROBE_TIMEOUT_MS)),
  ]);
  if (!supported) {
    worker.terminate();
    return null;
  }

  return {
    mode: "worker",
    load: (file) => call<LoadedPhoto>("load", file),
    rotate: (direction) => call<LoadedPhoto>("rotate", direction),
    process: (quad, presets) => call<ProcessedSpine>("process", quad, presets),
    encode: (preset) => call<EncodedResult>("encode", preset),
    dispose: () => worker.terminate(),
  };
}

/** Pipeline in un worker (la UI non si blocca); ripiego sul thread principale. */
export async function createSpineProcessor(): Promise<SpineProcessor> {
  return (await workerProcessor()) ?? mainThreadProcessor();
}

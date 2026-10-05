/// <reference lib="webworker" />
import { SpineEngine } from "./engine";

/**
 * Worker della pipeline: riceve { id, method, args }, chiama SpineEngine e
 * risponde { id, result } oppure { id, error }. La foto ridotta (ImageBitmap)
 * viene trasferita, non copiata.
 */

type Method = "supports" | "load" | "rotate" | "process" | "encode" | "reset";

const scope = self as unknown as DedicatedWorkerGlobalScope;
const engine = new SpineEngine();

function supports(): boolean {
  try {
    return typeof OffscreenCanvas !== "undefined" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
    return false;
  }
}

scope.onmessage = async (event: MessageEvent<{ id: number; method: Method; args: unknown[] }>) => {
  const { id, method, args } = event.data;
  try {
    let result: unknown;
    const transfer: Transferable[] = [];
    switch (method) {
      case "supports":
        result = supports();
        break;
      case "load": {
        const loaded = await engine.load(args[0] as Blob);
        transfer.push(loaded.preview);
        result = loaded;
        break;
      }
      case "rotate": {
        const rotated = await engine.rotate(args[0] as Parameters<SpineEngine["rotate"]>[0]);
        transfer.push(rotated.preview);
        result = rotated;
        break;
      }
      case "process":
        result = engine.process(
          args[0] as Parameters<SpineEngine["process"]>[0],
          args[1] as Parameters<SpineEngine["process"]>[1],
        );
        break;
      case "encode":
        result = await engine.encode(args[0] as Parameters<SpineEngine["encode"]>[0]);
        break;
      case "reset":
        engine.reset();
        break;
    }
    scope.postMessage({ id, result }, transfer);
  } catch (error) {
    scope.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
};

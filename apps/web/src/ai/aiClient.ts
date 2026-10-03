let worker: Worker | null = null;
let requestId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' });
  }
  return worker;
}

export function requestMove(fen: string, level: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    const w = getWorker();

    const handler = (event: MessageEvent) => {
      if (event.data.id !== id) return;

      w.removeEventListener('message', handler);
      w.removeEventListener('error', errorHandler);

      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data.uci);
      }
    };

    const errorHandler = (err: ErrorEvent) => {
      w.removeEventListener('message', handler);
      w.removeEventListener('error', errorHandler);
      reject(err.error);
    };

    w.addEventListener('message', handler);
    w.addEventListener('error', errorHandler);
    w.postMessage({ id, fen, level });
  });
}

export function cancel(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  requestId++; // Invalidate pending requests
}

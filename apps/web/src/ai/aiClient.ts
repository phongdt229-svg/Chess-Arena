import type { Analysis } from './engine';

export type { Analysis };

// Each channel owns a worker, so a long analysis never delays the computer's move and vice versa
class Channel {
  private worker: Worker | null = null;
  private counter = 0;

  private get(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' });
    }
    return this.worker;
  }

  // One request/response round trip; `pick` extracts the payload from the reply
  send<T>(message: Record<string, unknown>, pick: (data: any) => T): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = ++this.counter;
      const w = this.get();

      const handler = (event: MessageEvent) => {
        if (event.data.id !== id) return;
        w.removeEventListener('message', handler);
        w.removeEventListener('error', errorHandler);
        if (event.data.error) reject(new Error(event.data.error));
        else resolve(pick(event.data));
      };

      const errorHandler = (err: ErrorEvent) => {
        w.removeEventListener('message', handler);
        w.removeEventListener('error', errorHandler);
        reject(err.error);
      };

      w.addEventListener('message', handler);
      w.addEventListener('error', errorHandler);
      w.postMessage({ id, ...message });
    });
  }

  cancel(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.counter++; // invalidate pending requests
  }
}

const moves = new Channel();
const analysis = new Channel();

export function requestMove(fen: string, level: number): Promise<string> {
  return moves.send({ kind: 'move', fen, level }, (data) => data.uci as string);
}

export function requestAnalysis(fen: string, maxDepth = 4, timeMs = 900): Promise<Analysis> {
  return analysis.send({ kind: 'analyse', fen, maxDepth, timeMs }, (data) => data.analysis as Analysis);
}

export const cancel = () => moves.cancel();
export const cancelAnalysis = () => analysis.cancel();

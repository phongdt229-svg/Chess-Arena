import { findBestMove, type EngineOptions } from './engine';

interface WorkerRequest {
  id: number;
  fen: string;
  level: number;
}

interface WorkerResponse {
  id: number;
  uci?: string;
  error?: string;
}

const LEVEL_OPTIONS: Record<number, EngineOptions> = {
  1: { depth: 1, randomness: 40, timeMs: 200 },
  2: { depth: 1, randomness: 20, timeMs: 300 },
  3: { depth: 2, randomness: 15, timeMs: 500 },
  4: { depth: 3, randomness: 10, timeMs: 1000 },
  5: { depth: 4, randomness: 5, timeMs: 2000 },
  6: { depth: 5, randomness: 0, timeMs: 3000 },
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, fen, level } = event.data;

  try {
    const options = LEVEL_OPTIONS[level] || LEVEL_OPTIONS[3];
    const uci = findBestMove(fen, options);

    const response: WorkerResponse = { id, uci };
    self.postMessage(response);
  } catch (err) {
    const response: WorkerResponse = {
      id,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
    self.postMessage(response);
  }
};

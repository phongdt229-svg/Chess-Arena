import { analyse, findBestMove, type Analysis, type EngineOptions } from './engine';

type WorkerRequest =
  | { id: number; kind?: 'move'; fen: string; level: number }
  | { id: number; kind: 'analyse'; fen: string; maxDepth: number; timeMs: number };

interface WorkerResponse {
  id: number;
  uci?: string;
  analysis?: Analysis;
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
  const request = event.data;
  const { id } = request;

  try {
    if (request.kind === 'analyse') {
      const maxDepth = Math.min(8, Math.max(1, request.maxDepth));
      const timeMs = Math.min(5000, Math.max(50, request.timeMs));
      const response: WorkerResponse = { id, analysis: analyse(request.fen, { maxDepth, timeMs }) };
      self.postMessage(response);
      return;
    }

    const options = LEVEL_OPTIONS[request.level] || LEVEL_OPTIONS[3];
    const uci = findBestMove(request.fen, options);

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

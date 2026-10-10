import { useState, useRef, useCallback, useEffect } from 'react';

export type RunStatus = 'idle' | 'running' | 'success' | 'compile_error' | 'runtime_error' | 'timeout';

export interface CodeFile {
  name: string;
  content: string;
}

export interface RunResult {
  status: RunStatus;
  stdout: string[];
  stderr: string[];
  exitCode: number;
  durationMs: number;
}

const DEFAULT_RESULT: RunResult = {
  status: 'idle',
  stdout: [],
  stderr: [],
  exitCode: 0,
  durationMs: 0,
};

export function useCodeRunner() {
  const [result, setResult] = useState<RunResult>(DEFAULT_RESULT);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize or recycle the TypeScript Web Worker
  const getOrCreateWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/ts-runner.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  }, []);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      terminateWorker();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [terminateWorker]);

  const cancelRun = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    terminateWorker();
    setIsRunning(false);
    setResult((prev) => ({
      ...prev,
      status: 'idle',
      stderr: [...prev.stderr, '[Execution Cancelled by user]'],
    }));
  }, [terminateWorker]);

  const clearOutput = useCallback(() => {
    setResult(DEFAULT_RESULT);
  }, []);

  const runCode = useCallback(
    async ({
      language,
      files,
      entryPoint,
      timeoutMs = 5000,
    }: {
      language: 'typescript' | 'java';
      files: CodeFile[];
      entryPoint?: string;
      timeoutMs?: number;
    }) => {
      setIsRunning(true);
      setResult({
        status: 'running',
        stdout: [],
        stderr: [],
        exitCode: 0,
        durationMs: 0,
      });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const startTime = performance.now();

      // ==========================================
      // A. TypeScript Client Web Worker Execution
      // ==========================================
      if (language === 'typescript') {
        const worker = getOrCreateWorker();
        const runId = Math.random().toString(36).substring(2, 9);

        return new Promise<RunResult>((resolve) => {
          let finished = false;

          // Watchdog timer to kill infinite loops
          timerRef.current = window.setTimeout(() => {
            if (finished) return;
            finished = true;
            terminateWorker(); // Force kill running worker
            setIsRunning(false);

            const timeoutResult: RunResult = {
              status: 'timeout',
              stdout: [],
              stderr: [`[Execution Timed Out] Execution exceeded ${timeoutMs}ms limit. Terminated safely.`],
              exitCode: 124,
              durationMs: Math.round(performance.now() - startTime),
            };
            setResult(timeoutResult);
            resolve(timeoutResult);
          }, timeoutMs);

          worker.onmessage = (event: MessageEvent) => {
            if (finished) return;
            const data = event.data;
            if (data.type === 'RESULT' && data.id === runId) {
              finished = true;
              if (timerRef.current) clearTimeout(timerRef.current);
              setIsRunning(false);

              const runRes: RunResult = {
                status: data.status,
                stdout: data.stdout,
                stderr: data.stderr,
                exitCode: data.exitCode,
                durationMs: data.durationMs,
              };
              setResult(runRes);
              resolve(runRes);
            }
          };

          worker.onerror = (err: ErrorEvent) => {
            if (finished) return;
            finished = true;
            if (timerRef.current) clearTimeout(timerRef.current);
            setIsRunning(false);

            const errResult: RunResult = {
              status: 'runtime_error',
              stdout: [],
              stderr: [`Worker runtime error: ${err.message}`],
              exitCode: 1,
              durationMs: Math.round(performance.now() - startTime),
            };
            setResult(errResult);
            resolve(errResult);
          };

          worker.postMessage({
            type: 'RUN',
            id: runId,
            payload: { files, entryPoint },
          });
        });
      }

      // ==========================================
      // B. Java Sandbox Execution (/api/code/run)
      // ==========================================
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch('/api/code/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'java',
            files,
            entryPoint,
            timeoutMs,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const failureResult: RunResult = {
            status: 'runtime_error',
            stdout: [],
            stderr: errData.error ? [JSON.stringify(errData.error)] : [`Server returned HTTP ${response.status}`],
            exitCode: response.status,
            durationMs: Math.round(performance.now() - startTime),
          };
          setResult(failureResult);
          setIsRunning(false);
          return failureResult;
        }

        const data = await response.json();
        const successResult: RunResult = {
          status: data.status,
          stdout: data.stdout || [],
          stderr: data.stderr || [],
          exitCode: data.exitCode ?? 0,
          durationMs: data.durationMs ?? Math.round(performance.now() - startTime),
        };
        setResult(successResult);
        setIsRunning(false);
        return successResult;
      } catch (err: unknown) {
        setIsRunning(false);
        const isAbort = err instanceof DOMException && err.name === 'AbortError';
        const netResult: RunResult = {
          status: isAbort ? 'idle' : 'runtime_error',
          stdout: [],
          stderr: isAbort
            ? ['[Execution cancelled]']
            : ['Cannot connect to backend runner at /api/code/run. Ensure the api-server is running.'],
          exitCode: 1,
          durationMs: Math.round(performance.now() - startTime),
        };
        setResult(netResult);
        return netResult;
      }
    },
    [getOrCreateWorker, terminateWorker]
  );

  return {
    result,
    isRunning,
    runCode,
    cancelRun,
    clearOutput,
  };
}

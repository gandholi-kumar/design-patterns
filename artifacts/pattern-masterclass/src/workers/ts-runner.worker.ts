import * as ts from 'typescript';

export interface CodeFile {
  name: string;
  content: string;
}

export interface RunTypeScriptPayload {
  files: CodeFile[];
  entryPoint?: string;
}

export interface WorkerRunMessage {
  type: 'RUN';
  id: string;
  payload: RunTypeScriptPayload;
}

export interface WorkerResultResponse {
  type: 'RESULT';
  id: string;
  status: 'success' | 'compile_error' | 'runtime_error';
  stdout: string[];
  stderr: string[];
  exitCode: number;
  durationMs: number;
}

self.onmessage = (event: MessageEvent<WorkerRunMessage>) => {
  const { type, id, payload } = event.data;
  if (type !== 'RUN') return;

  const startTime = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];

  try {
    // 1. Transpile all TypeScript files to CommonJS JavaScript in-memory
    const transpiledMap = new Map<string, string>();

    for (const file of payload.files) {
      const cleanName = file.name.replace(/\.tsx?$/, '');
      try {
        const transpileResult = ts.transpileModule(file.content, {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            removeComments: false,
          },
        });
        transpiledMap.set(cleanName, transpileResult.outputText);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        stderr.push(`Compilation error in ${file.name}: ${errMsg}`);
        const response: WorkerResultResponse = {
          type: 'RESULT',
          id,
          status: 'compile_error',
          stdout: [],
          stderr,
          exitCode: 1,
          durationMs: Math.round(performance.now() - startTime),
        };
        self.postMessage(response);
        return;
      }
    }

    // 2. Setup sandboxed console interceptor
    const formatArg = (arg: unknown): string => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (arg instanceof Error) return arg.stack || `${arg.name}: ${arg.message}`;
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    };

    const sandboxedConsole = {
      log: (...args: unknown[]) => stdout.push(args.map(formatArg).join(' ')),
      info: (...args: unknown[]) => stdout.push(args.map(formatArg).join(' ')),
      warn: (...args: unknown[]) => stderr.push(`[WARN] ${args.map(formatArg).join(' ')}`),
      error: (...args: unknown[]) => stderr.push(`[ERROR] ${args.map(formatArg).join(' ')}`),
    };

    // 3. Setup Virtual Module Registry & require() resolver
    const moduleCache = new Map<string, { exports: unknown }>();

    const normalizeSpecifier = (specifier: string): string => {
      return specifier.replace(/^\.\//, '').replace(/\.tsx?$/, '');
    };

    function createRequire(currentFile: string) {
      return function customRequire(specifier: string): unknown {
        const cleanName = normalizeSpecifier(specifier);
        if (moduleCache.has(cleanName)) {
          return moduleCache.get(cleanName)!.exports;
        }

        const code = transpiledMap.get(cleanName);
        if (code === undefined) {
          throw new Error(
            `Module '${specifier}' not found in virtual project (resolved from '${currentFile}'). Available modules: [${Array.from(transpiledMap.keys()).join(', ')}]`
          );
        }

        const mod = { exports: {} };
        moduleCache.set(cleanName, mod);

        // Execute module with isolated scope
        const moduleFn = new Function(
          'require',
          'exports',
          'module',
          'console',
          code
        );
        moduleFn(createRequire(cleanName), mod.exports, mod, sandboxedConsole);

        return mod.exports;
      };
    }

    // 4. Identify Entry Point
    let entryName = 'index';
    if (payload.entryPoint) {
      entryName = normalizeSpecifier(payload.entryPoint);
    } else if (!transpiledMap.has(entryName)) {
      // Pick first file if index.ts does not exist
      const firstKey = transpiledMap.keys().next().value;
      if (firstKey) entryName = firstKey;
    }

    const entryCode = transpiledMap.get(entryName);
    if (!entryCode) {
      throw new Error(`Entry point file '${payload.entryPoint || 'index.ts'}' not found in project.`);
    }

    const entryMod = { exports: {} };
    moduleCache.set(entryName, entryMod);

    const entryFn = new Function(
      'require',
      'exports',
      'module',
      'console',
      entryCode
    );
    entryFn(createRequire(entryName), entryMod.exports, entryMod, sandboxedConsole);

    const response: WorkerResultResponse = {
      type: 'RESULT',
      id,
      status: 'success',
      stdout,
      stderr,
      exitCode: 0,
      durationMs: Math.round(performance.now() - startTime),
    };
    self.postMessage(response);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? (err.stack || err.message) : String(err);
    stderr.push(errorMsg);

    const response: WorkerResultResponse = {
      type: 'RESULT',
      id,
      status: 'runtime_error',
      stdout,
      stderr,
      exitCode: 1,
      durationMs: Math.round(performance.now() - startTime),
    };
    self.postMessage(response);
  }
};

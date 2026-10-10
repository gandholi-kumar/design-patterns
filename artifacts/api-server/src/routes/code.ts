import { Router, type Request, type Response } from "express";
import { ExecuteCodeBody, type ExecutionResult } from "@workspace/api-zod";
import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";

const router = Router();

interface RunExecutionOptions {
  files: Array<{ name: string; content: string }>;
  entryPoint?: string;
  stdin?: string;
  timeoutMs: number;
}

/**
 * Execute multi-file Java project using local JDK (javac + java)
 */
async function executeJavaProject(options: RunExecutionOptions): Promise<ExecutionResult> {
  const startTime = Date.now();
  const runId = randomUUID();
  const sandboxDir = path.join(os.tmpdir(), `gof-sandbox-${runId}`);

  try {
    // 1. Create isolated sandbox directory
    await fs.mkdir(sandboxDir, { recursive: true });

    // 2. Write all files to the sandbox
    const javaFileNames: string[] = [];
    for (const file of options.files) {
      const sanitizedName = path.basename(file.name);
      if (!sanitizedName.endsWith(".java")) continue;

      const filePath = path.join(sandboxDir, sanitizedName);
      await fs.writeFile(filePath, file.content, "utf-8");
      javaFileNames.push(sanitizedName);
    }

    if (javaFileNames.length === 0) {
      return {
        status: "compile_error",
        stdout: [],
        stderr: ["No valid .java source files provided."],
        exitCode: 1,
        durationMs: Date.now() - startTime,
      };
    }

    // 3. Compile all .java files together with javac
    const compileResult = await runProcess({
      cmd: "javac",
      args: ["-encoding", "UTF-8", ...javaFileNames],
      cwd: sandboxDir,
      timeoutMs: Math.min(options.timeoutMs, 10000),
    });

    if (compileResult.exitCode !== 0) {
      return {
        status: "compile_error",
        stdout: compileResult.stdout,
        stderr: compileResult.stderr,
        exitCode: compileResult.exitCode,
        durationMs: Date.now() - startTime,
      };
    }

    // 4. Identify Entry Class
    let entryClass = "Main";
    if (options.entryPoint) {
      entryClass = path.basename(options.entryPoint).replace(/\.java$/, "");
    } else {
      // Find the file containing `public static void main`
      for (const file of options.files) {
        if (/public\s+static\s+void\s+main\s*\(/m.test(file.content)) {
          entryClass = path.basename(file.name).replace(/\.java$/, "");
          break;
        }
      }
    }

    // 5. Execute JVM with resource caps & timeout
    const executionResult = await runProcess({
      cmd: "java",
      args: [
        "-Dfile.encoding=UTF-8",
        "-Xmx256m",
        "-cp",
        ".",
        entryClass,
      ],
      cwd: sandboxDir,
      stdin: options.stdin,
      timeoutMs: options.timeoutMs,
    });

    return {
      status: executionResult.timedOut
        ? "timeout"
        : executionResult.exitCode === 0
        ? "success"
        : "runtime_error",
      stdout: executionResult.stdout,
      stderr: executionResult.stderr,
      exitCode: executionResult.exitCode,
      durationMs: Date.now() - startTime,
    };
  } finally {
    // 6. Guarantee cleanup of ephemeral directory
    try {
      await fs.rm(sandboxDir, { recursive: true, force: true });
    } catch (cleanupError) {
      logger.warn({ sandboxDir, err: cleanupError }, "Failed to delete ephemeral sandbox dir");
    }
  }
}

/**
 * Execute process with streaming chunk listeners, maxBuffer protection, and timeout kill
 */
function runProcess({
  cmd,
  args,
  cwd,
  stdin,
  timeoutMs,
}: {
  cmd: string;
  args: string[];
  cwd: string;
  stdin?: string;
  timeoutMs: number;
}): Promise<{
  stdout: string[];
  stderr: string[];
  exitCode: number;
  timedOut: boolean;
}> {
  return new Promise((resolve) => {
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let timedOut = false;
    let settled = false;
    const maxBytes = 500 * 1024; // 500 KB limit to prevent memory exhaustion

    const child = spawn(cmd, args, {
      cwd,
      shell: false,
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (process.platform === "win32") {
          spawn("taskkill", ["/pid", child.pid!.toString(), "/T", "/F"]);
        } else {
          child.kill("SIGKILL");
        }
      } catch (err) {
        logger.warn({ pid: child.pid, err }, "Failed to terminate timed out child process");
      }
    }, timeoutMs);

    if (stdin && child.stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch {
        // stdin stream closed
      }
    }

    child.stdout?.on("data", (chunk: Buffer) => {
      if (stdoutBuffer.length < maxBytes) {
        stdoutBuffer += chunk.toString("utf-8");
      }
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      if (stderrBuffer.length < maxBytes) {
        stderrBuffer += chunk.toString("utf-8");
      }
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout: stdoutBuffer ? stdoutBuffer.split(/\r?\n/) : [],
        stderr: [error.message],
        exitCode: 1,
        timedOut: false,
      });
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      const stdoutLines = stdoutBuffer
        ? stdoutBuffer.split(/\r?\n/).filter((l, i, arr) => i < arr.length - 1 || l.length > 0)
        : [];
      const stderrLines = stderrBuffer
        ? stderrBuffer.split(/\r?\n/).filter((l, i, arr) => i < arr.length - 1 || l.length > 0)
        : [];

      if (timedOut) {
        stderrLines.push(`[Execution Timed Out] Terminated after ${timeoutMs}ms.`);
      }

      resolve({
        stdout: stdoutLines,
        stderr: stderrLines,
        exitCode: timedOut ? 124 : (code ?? 0),
        timedOut,
      });
    });
  });
}

// POST /api/code/run
router.post("/run", async (req: Request, res: Response) => {
  const parsed = ExecuteCodeBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { language, files, entryPoint, stdin, timeoutMs } = parsed.data;

  try {
    if (language === "java") {
      const result = await executeJavaProject({
        files,
        entryPoint,
        stdin,
        timeoutMs,
      });
      return res.json(result);
    }

    return res.status(400).json({
      status: "runtime_error",
      stdout: [],
      stderr: [`Language '${language}' is not executed by backend server.`],
      exitCode: 1,
      durationMs: 0,
    });
  } catch (err) {
    logger.error({ err }, "Execution endpoint failure");
    return res.status(500).json({
      status: "runtime_error",
      stdout: [],
      stderr: [err instanceof Error ? err.message : "Internal execution error"],
      exitCode: 1,
      durationMs: 0,
    });
  }
});

export default router;

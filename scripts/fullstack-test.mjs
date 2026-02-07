import { spawn } from "node:child_process";

const port = Number(process.env.PORT ?? "3210");
const baseUrl = process.env.BASE_URL ?? `http://127.0.0.1:${port}`;
const healthTimeoutMs = 120000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < healthTimeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // Server is not ready yet.
    }

    await wait(1000);
  }

  throw new Error(`Dev server did not become ready within ${healthTimeoutMs}ms (${baseUrl}).`);
}

function terminateProcess(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, 5000);

    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });

    child.kill("SIGTERM");
  });
}

async function run() {
  const dev = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  dev.stdout.on("data", (chunk) => process.stdout.write(chunk));
  dev.stderr.on("data", (chunk) => process.stderr.write(chunk));

  dev.once("exit", (code) => {
    if (code !== 0) {
      console.error(`[fullstack] Dev server exited early with code ${code ?? "null"}`);
    }
  });

  try {
    console.log(`[fullstack] Waiting for server at ${baseUrl}`);
    await waitForHealth();
    console.log("[fullstack] Running smoke test");

    const smoke = spawn("npm", ["run", "test:smoke"], {
      env: { ...process.env, BASE_URL: baseUrl },
      stdio: "inherit"
    });

    const smokeCode = await new Promise((resolve) => {
      smoke.once("exit", (code) => resolve(code ?? 1));
    });

    if (smokeCode !== 0) {
      process.exitCode = smokeCode;
      return;
    }

    console.log("[fullstack] Frontend + backend smoke test passed");
  } finally {
    await terminateProcess(dev);
  }
}

run().catch((error) => {
  console.error("[fullstack] Test failed");
  console.error(error);
  process.exit(1);
});

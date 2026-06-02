/**
 * Frees the dev/production port before `next start` to avoid EADDRINUSE.
 * Exit code 4294967295 on Windows usually means the prior listener was killed externally
 * (e.g. smoke test or a second `npm start`), not a Next.js boot failure.
 */
import { execSync } from "node:child_process";
import { platform } from "node:os";

const port = String(process.env.PORT ?? process.argv[2] ?? "3000");

function freePortWindows(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });

    const pids = new Set();
    for (const line of output.split(/\r?\n/)) {
      if (!/\sLISTENING\s/i.test(line)) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts.at(-1);
      if (pid && /^\d+$/.test(pid) && pid !== "0") {
        pids.add(pid);
      }
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`[free-port] Stopped PID ${pid} listening on :${targetPort}`);
      } catch {
        // Process may already have exited.
      }
    }
  } catch {
    // Nothing listening — OK.
  }
}

function freePortUnix(targetPort) {
  try {
    execSync(`lsof -ti tcp:${targetPort} | xargs -r kill -9`, {
      shell: true,
      stdio: "ignore",
    });
    console.log(`[free-port] Cleared listeners on :${targetPort}`);
  } catch {
    // Nothing listening — OK.
  }
}

if (platform() === "win32") {
  freePortWindows(port);
} else {
  freePortUnix(port);
}

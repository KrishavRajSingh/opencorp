import { defineConfig } from "@trigger.dev/sdk/v3";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import type { BuildContext, BuildExtension } from "@trigger.dev/build";

const installTwitterCli = (): BuildExtension => ({
  name: "install-twitter-cli",
  onBuildComplete(context: BuildContext) {
    if (context.target === "dev") return;
    context.addLayer({
      id: "twitter-cli",
      image: {
        instructions: [
          "RUN apt-get update && apt-get install -y --no-install-recommends python3-pip && rm -rf /var/lib/apt/lists/*",
          "RUN pip install --break-system-packages --no-cache-dir twitter-cli",
        ],
      },
    });
  },
});

export default defineConfig({
  project: "proj_llwawxasihhybbliugda",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
  build: {
    extensions: [
      installTwitterCli(),
      syncEnvVars(async () => {
        const authToken = process.env.TWITTER_AUTH_TOKEN;
        const ct0 = process.env.TWITTER_CT0;
        if (!authToken || !ct0) return [];
        return [
          { name: "TWITTER_AUTH_TOKEN", value: authToken, isSecret: true },
          { name: "TWITTER_CT0", value: ct0, isSecret: true },
        ];
      }),
    ],
  },
});

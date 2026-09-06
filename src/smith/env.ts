import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const EnvSchema = z.object({
  TENSORMUX_API_KEY: z.string().optional().default(""),
  TENSORMUX_BASE_URL: z.string().default("https://api.tensormux.com/v1"),
  AGENTROUTER_API_KEY: z.string().optional().default(""),
  AGENTROUTER_BASE_URL: z.string().default("https://co.agentrouter.org/v1"),
  AGENTROUTER_PRIMARY_BASE_URL: z
    .string()
    .default("https://co.agentrouter.org/v1"),
  LLM_MODEL: z.string().default("glm-4-7-flash"),
  TAVILY_API_KEY: z.string().optional().default(""),
  TINYFISH_API_KEY: z.string().optional().default(""),
  TINYFISH_BASE_URL: z.string().default("https://agent.tinyfish.ai/v1"),
  SMITH_DB_PATH: z.string().optional().default(""),
});

export type SmithEnv = z.infer<typeof EnvSchema>;

let cached: SmithEnv | null = null;

function defaultDbPath(): string {
  // Vercel serverless filesystem is read-only except /tmp
  if (process.env["VERCEL"] || process.env["AWS_LAMBDA_FUNCTION_NAME"]) {
    return "/tmp/smith.db";
  }
  return "data/smith.db";
}

export function getEnv(): SmithEnv {
  if (cached) return cached;
  const parsed = EnvSchema.parse(process.env);
  cached = {
    ...parsed,
    SMITH_DB_PATH: parsed.SMITH_DB_PATH || defaultDbPath(),
  };
  return cached;
}

export function resetEnvCache(): void {
  cached = null;
}

export function requireEnv(name: keyof SmithEnv): string {
  const value = getEnv()[name];
  if (!value) {
    throw new Error(
      `Missing required env ${name}. Put it in .env (gitignored).`,
    );
  }
  return value;
}

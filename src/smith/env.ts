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
  SMITH_DB_PATH: z.string().default("data/smith.db"),
});

export type SmithEnv = z.infer<typeof EnvSchema>;

let cached: SmithEnv | null = null;

export function getEnv(): SmithEnv {
  if (cached) return cached;
  cached = EnvSchema.parse(process.env);
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

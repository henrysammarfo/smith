import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { PageShell } from "@/components/smith/PageShell";
import { loginFn, meFn } from "@/smith/auth/api";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const user = await meFn();
    if (user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Log in — SMITH.forge" },
      { name: "description", content: "Sign in to your SMITH forge workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { redirect: redirectTo } = Route.useSearch();
  const login = useServerFn(loginFn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => login({ data: { email, password } }),
    onSuccess: async (user) => {
      queryClient.setQueryData(["me"], user);
      if (redirectTo === "/start") {
        void navigate({ to: "/start" });
      } else {
        void navigate({ to: "/dashboard" });
      }
    },
    onError: (e: Error) => setError(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mut.mutate();
  }

  return (
    <PageShell
      eyebrow="Account"
      title="Welcome back."
      accent="Log in."
      lede="Access your forge workspaces, generations, and report cards."
    >
      <form
        onSubmit={onSubmit}
        className="appear mt-2 max-w-md space-y-5"
        style={{ ["--d" as string]: "0.55s" }}
      >
        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        <div>
          <label className="block text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-ember/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-ember/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn-shine btn-solid-metal h-[42px] px-[18px] disabled:opacity-50"
          disabled={mut.isPending}
        >
          {mut.isPending ? "Signing in…" : "Log in"}
        </button>
        <p className="text-[13.5px] text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="text-foreground underline-offset-4 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </PageShell>
  );
}

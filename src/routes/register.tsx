import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/smith/PageShell";
import { meFn, registerFn } from "@/smith/auth/api";

export const Route = createFileRoute("/register")({
  beforeLoad: async () => {
    const user = await meFn();
    if (user) {
      throw redirect({ to: "/start" });
    }
  },
  head: () => ({
    meta: [
      { title: "Register — SMITH.forge" },
      {
        name: "description",
        content: "Create a SMITH account and start forging agents.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const register = useServerFn(registerFn);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => register({ data: { name, email, password } }),
    onSuccess: async (user) => {
      queryClient.setQueryData(["me"], user);
      void navigate({ to: "/start" });
    },
    onError: (e: Error) => setError(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    mut.mutate();
  }

  return (
    <PageShell
      eyebrow="Account"
      title="Start forging."
      accent="Create an account."
      lede="Register to own workspaces, run the forge loop, and keep generations private to you."
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
            Name
          </label>
          <input
            type="text"
            autoComplete="name"
            required
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-ember/50"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
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
          {mut.isPending ? "Creating account…" : "Create account"}
        </button>
        <p className="text-[13.5px] text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </PageShell>
  );
}

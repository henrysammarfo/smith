import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/smith/PageShell";
import { meFn } from "@/smith/auth/api";
import { createWorkspaceFn } from "@/smith/forge/api";

export const Route = createFileRoute("/start")({
  beforeLoad: async () => {
    const user = await meFn();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: "/start" } });
    }
    return { user };
  },
  component: StartPage,
});

function StartPage() {
  const navigate = useNavigate();
  const createWorkspace = useServerFn(createWorkspaceFn);
  const [goal, setGoal] = useState("");
  const [packId, setPackId] = useState<"invoices" | "grounds">("invoices");
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      createWorkspace({
        data: {
          goal: goal.trim(),
          packId,
          tools:
            packId === "invoices"
              ? ["parse_invoice", "normalize_money"]
              : ["tinyfish_fetch", "tavily_search", "claim_score"],
        },
      }),
    onSuccess: () => {
      void navigate({ to: "/dashboard/forge" });
    },
    onError: (e: Error) => setError(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!goal.trim()) {
      setError("Goal is required");
      return;
    }
    mut.mutate();
  }

  return (
    <PageShell
      eyebrow="Start a forge"
      title="Name the goal."
      accent="SMITH builds the agent."
      lede="Pick an eval pack, state the outcome, and SMITH opens a live workspace — propose, eval, classify, mutate."
    >
      <form
        onSubmit={onSubmit}
        className="appear mt-10 max-w-xl space-y-5"
        style={{ ["--d" as string]: "0.55s" }}
      >
        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        <div>
          <label className="block text-xs tracking-[0.14em] text-cream/45 uppercase">Goal</label>
          <textarea
            className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-cream outline-none focus:border-ember/50"
            placeholder="e.g. Extract invoice line items from messy vendor text with high accuracy"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs tracking-[0.14em] text-cream/45 uppercase">
            Eval pack
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-ink px-4 py-3 text-cream [color-scheme:dark]"
            value={packId}
            onChange={(e) => setPackId(e.target.value as "invoices" | "grounds")}
          >
            <option value="invoices" className="bg-ink text-cream">
              Messy invoices
            </option>
            <option value="grounds" className="bg-ink text-cream">
              GROUNDS-lite claim check
            </option>
          </select>
        </div>
        <button type="submit" className="btn-primary" disabled={mut.isPending}>
          {mut.isPending ? "Creating workspace…" : "Open forge workspace"}
        </button>
      </form>
    </PageShell>
  );
}

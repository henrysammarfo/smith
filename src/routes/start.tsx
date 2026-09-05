import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/smith/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Start for Free — SMITH.forge" },
      {
        name: "description",
        content:
          "Describe the job you want automated, hand over your tools, and forge your first agent generation free.",
      },
      { property: "og:title", content: "Start for Free — SMITH.forge" },
      {
        property: "og:description",
        content: "Your first eval pack and three forge generations a day, free.",
      },
    ],
  }),
  component: Start,
});

const STEPS = ["Your details", "The job", "Tools & eval"];

function Start() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    goal: "",
    tools: "",
    evalNotes: "",
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const next = () => {
    if (step === 0 && (!form.name || !form.email)) {
      toast.error("Add your name and email to continue.");
      return;
    }
    if (step === 1 && !form.goal) {
      toast.error("Describe the job you want forged.");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    toast.success("Workspace ready — opening your forge.");
    navigate({ to: "/dashboard" });
  };

  return (
    <PageShell
      eyebrow="Free workspace"
      title="Bring one job. Leave with a"
      accent="working agent."
      lede="Three short steps. No card, no sales call — the first eval pack runs on the house."
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-7">
          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={
                  "inline-flex items-center gap-2 text-[12.5px] " +
                  (i <= step ? "text-foreground" : "text-muted-foreground")
                }
              >
                <span className="grid h-5 w-5 place-items-center rounded-full border border-border text-[11px]">
                  {i < step ? <Check size={12} /> : i + 1}
                </span>
                {s}
                {i < STEPS.length - 1 ? (
                  <span className="mx-1 h-[1px] w-6 bg-border" />
                ) : null}
              </span>
            ))}
          </div>

          <div className="mt-7 space-y-5">
            {step === 0 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={set("name")} placeholder="Henry Marfo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@company.com"
                  />
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <div className="space-y-2">
                <Label htmlFor="goal">What should the agent do?</Label>
                <Textarea
                  id="goal"
                  rows={5}
                  value={form.goal}
                  onChange={set("goal")}
                  placeholder="Pull line items out of supplier invoices and flag totals that don't reconcile."
                />
              </div>
            ) : null}

            {step === 2 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tools">Tools it can call</Label>
                  <Input
                    id="tools"
                    value={form.tools}
                    onChange={set("tools")}
                    placeholder="pdf-parse, ledger-api, currency-lookup"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evalNotes">How do we score it?</Label>
                  <Textarea
                    id="evalNotes"
                    rows={4}
                    value={form.evalNotes}
                    onChange={set("evalNotes")}
                    placeholder="20 real invoices with the correct line items attached. Exact-match on amount and vendor."
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-8 flex gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-shine btn-ghost-frost h-[42px] px-[18px]"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={next}
              className="btn-shine btn-solid-metal h-[42px] px-[18px]"
            >
              {step === STEPS.length - 1 ? "Create my forge" : "Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <aside className="panel h-fit p-7">
          <h2 className="text-[17px] font-medium tracking-[-0.02em]">
            What lands in your workspace
          </h2>
          <ul className="mt-5 space-y-3 text-[13.5px] text-muted-foreground">
            {[
              "A generated agent graph you can read",
              "Your eval pack, versioned",
              "A run with a real score, not a claim",
              "The failure taxonomy behind that score",
              "A one-click mutate to generation 2",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check size={16} className="mt-[2px] shrink-0 text-ember" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-muted-foreground">
            Curious first?{" "}
            <Link to="/demo" className="text-foreground underline underline-offset-4">
              Step through the demo
            </Link>
            .
          </p>
        </aside>
      </div>
    </PageShell>
  );
}

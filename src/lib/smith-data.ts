export type Agent = {
  id: string;
  name: string;
  domain: string;
  generation: number;
  accuracy: number;
  baseline: number;
  costPerRun: number;
  latencyMs: number;
  reliability: number;
  status: "forging" | "shipped" | "archived";
  sessions: number;
};

export const agents: Agent[] = [
  {
    id: "invoice-liner",
    name: "Invoice Line-Item Extractor",
    domain: "Finance ops",
    generation: 7,
    accuracy: 78,
    baseline: 41,
    costPerRun: 0.021,
    latencyMs: 2140,
    reliability: 96,
    status: "shipped",
    sessions: 34,
  },
  {
    id: "grounds-lite",
    name: "Repo Claim Checker",
    domain: "Engineering",
    generation: 5,
    accuracy: 71,
    baseline: 38,
    costPerRun: 0.034,
    latencyMs: 3980,
    reliability: 92,
    status: "forging",
    sessions: 21,
  },
  {
    id: "ticket-triage",
    name: "Support Ticket Triage",
    domain: "Customer ops",
    generation: 3,
    accuracy: 64,
    baseline: 45,
    costPerRun: 0.012,
    latencyMs: 1180,
    reliability: 88,
    status: "forging",
    sessions: 12,
  },
  {
    id: "vendor-recon",
    name: "Vendor Reconciliation",
    domain: "Finance ops",
    generation: 2,
    accuracy: 52,
    baseline: 44,
    costPerRun: 0.028,
    latencyMs: 2620,
    reliability: 74,
    status: "archived",
    sessions: 6,
  },
];

export type Run = {
  id: string;
  agentId: string;
  agent: string;
  generation: number;
  score: number;
  delta: number;
  cost: number;
  latencyMs: number;
  status: "passed" | "failed" | "running";
  failClass: string;
  startedAt: string;
};

export const runs: Run[] = [
  {
    id: "run_8f21",
    agentId: "invoice-liner",
    agent: "Invoice Line-Item Extractor",
    generation: 7,
    score: 78,
    delta: 6,
    cost: 0.42,
    latencyMs: 2140,
    status: "passed",
    failClass: "—",
    startedAt: "2 min ago",
  },
  {
    id: "run_8f18",
    agentId: "grounds-lite",
    agent: "Repo Claim Checker",
    generation: 5,
    score: 71,
    delta: 9,
    cost: 0.68,
    latencyMs: 3980,
    status: "running",
    failClass: "tool-timeout",
    startedAt: "6 min ago",
  },
  {
    id: "run_8f11",
    agentId: "ticket-triage",
    agent: "Support Ticket Triage",
    generation: 3,
    score: 64,
    delta: 11,
    cost: 0.18,
    latencyMs: 1180,
    status: "passed",
    failClass: "—",
    startedAt: "24 min ago",
  },
  {
    id: "run_8f04",
    agentId: "invoice-liner",
    agent: "Invoice Line-Item Extractor",
    generation: 6,
    score: 72,
    delta: 4,
    cost: 0.39,
    latencyMs: 2380,
    status: "passed",
    failClass: "—",
    startedAt: "1 hr ago",
  },
  {
    id: "run_8e92",
    agentId: "grounds-lite",
    agent: "Repo Claim Checker",
    generation: 4,
    score: 62,
    delta: -3,
    cost: 0.71,
    latencyMs: 4410,
    status: "failed",
    failClass: "hallucinated-citation",
    startedAt: "2 hr ago",
  },
];

export type EvalPack = {
  id: string;
  name: string;
  domain: string;
  cases: number;
  threshold: number;
  lastScore: number;
  owner: string;
};

export const evalPacks: EvalPack[] = [
  {
    id: "invoices-messy-120",
    name: "Messy Invoices · 120 cases",
    domain: "Finance ops",
    cases: 120,
    threshold: 75,
    lastScore: 78,
    owner: "henry",
  },
  {
    id: "repo-claims-80",
    name: "Repo Claim Check · 80 cases",
    domain: "Engineering",
    cases: 80,
    threshold: 70,
    lastScore: 71,
    owner: "henry",
  },
  {
    id: "tickets-200",
    name: "Ticket Triage · 200 cases",
    domain: "Customer ops",
    cases: 200,
    threshold: 70,
    lastScore: 64,
    owner: "ops-team",
  },
];

export type FailClass = { label: string; share: number; patch: string };

export const failTaxonomy: FailClass[] = [
  { label: "Wrong tool selected", share: 34, patch: "Router rewrite" },
  { label: "Schema drift on output", share: 26, patch: "Prompt + validator" },
  { label: "Missing memory of prior line", share: 18, patch: "Memory window" },
  { label: "Tool timeout", share: 13, patch: "Retry + fallback tool" },
  { label: "Hallucinated citation", share: 9, patch: "Grounding check" },
];

export const forgeLoop = [
  {
    step: "01",
    title: "Declare the job",
    body: "Name the goal, hand over the tools, point at an eval pack. No prompt writing.",
  },
  {
    step: "02",
    title: "Forge an architecture",
    body: "SMITH proposes the agent graph — router, tools, memory, guardrails — and writes it as code.",
  },
  {
    step: "03",
    title: "Run the eval",
    body: "Every case executes in a real session. Accuracy, cost, latency and reliability are captured per run.",
  },
  {
    step: "04",
    title: "Read the failure",
    body: "Traces are sorted into a failure taxonomy instead of a vague 'it didn't work'.",
  },
  {
    step: "05",
    title: "Mutate and re-score",
    body: "Prompt, tool, memory or orchestrator gets patched, then the pack runs again until the score moves.",
  },
  {
    step: "06",
    title: "Ship the report card",
    body: "A before/after table you can hand to anyone: what improved, by how much, at what cost.",
  },
];

export const benefits = [
  {
    icon: "Hammer",
    title: "Agents that improve themselves",
    body: "The forge loop rewrites architecture from real failures, not guesses. Generation 7 beats generation 1 by design.",
  },
  {
    icon: "Gauge",
    title: "Measured, never vibes",
    body: "Accuracy, reliability, cost and latency are recorded on every run and compared side by side.",
  },
  {
    icon: "Boxes",
    title: "Domain agnostic",
    body: "Same forge, different eval pack. Invoices today, repo claim checks tomorrow, your workflow next.",
  },
  {
    icon: "Route",
    title: "Failure taxonomy built in",
    body: "Every miss lands in a class with a suggested patch, so fixes target the cause instead of the symptom.",
  },
  {
    icon: "ScrollText",
    title: "Replayable traces",
    body: "Full session traces for every generation. Reproduce any result months later.",
  },
  {
    icon: "ShieldCheck",
    title: "Honest report cards",
    body: "No cherry-picked demo. Thresholds are declared upfront and failures stay visible.",
  },
];

export const faqs = [
  {
    q: "What exactly does SMITH build?",
    a: "A working agent: the architecture graph, the tool wiring, the prompts and the guardrails — generated from your goal, your tools and your eval pack.",
  },
  {
    q: "Do I need to write prompts?",
    a: "No. You write the eval. SMITH writes and rewrites the prompts, and shows you which rewrite moved the score.",
  },
  {
    q: "How is this different from a one-shot agent builder?",
    a: "A one-shot builder hands you a guess. SMITH runs the guess, classifies the failures, patches the architecture and runs it again until a metric actually improves.",
  },
  {
    q: "What counts as an eval pack?",
    a: "A set of input cases with expected outcomes and a scoring rule. Start with twenty real examples — that's enough to forge against.",
  },
  {
    q: "Which domains work best?",
    a: "Anything with a checkable answer: document extraction, claim verification, triage, reconciliation, QA of generated work.",
  },
  {
    q: "Can I export the agent?",
    a: "Yes. Every generation is code plus config you can lift out and run wherever your stack lives.",
  },
];

export const pricing = [
  {
    name: "Apprentice",
    price: "$0",
    cadence: "forever",
    blurb: "Forge your first agent against one eval pack.",
    features: [
      "1 eval pack",
      "3 forge generations per day",
      "Run history for 7 days",
      "Community support",
    ],
    cta: "Start for Free",
    featured: false,
  },
  {
    name: "Journeyman",
    price: "$79",
    cadence: "per month",
    blurb: "For a team shipping agents into real operations.",
    features: [
      "10 eval packs",
      "Unlimited forge generations",
      "Full failure taxonomy + patches",
      "Replayable traces, 12 months",
      "Agent export",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Master",
    price: "Talk to us",
    cadence: "annual",
    blurb: "Agent engineering as shared infrastructure.",
    features: [
      "Unlimited packs and seats",
      "Private model routing",
      "Custom failure classes",
      "SSO + audit log",
      "Onboarding with the founder",
    ],
    cta: "Book a call",
    featured: false,
  },
];

export const stats = [
  { value: "2 domains", label: "forged side by side" },
  { value: "41% → 78%", label: "accuracy on messy invoices" },
  { value: "34 sessions", label: "counted on camera" },
];

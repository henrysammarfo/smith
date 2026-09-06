import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/smith/SiteHeader";
import { Sparkle } from "@/components/smith/Sparkle";
import { SmithMark } from "@/components/smith/Logo";
import { Hammer, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SMITH.forge — Agents That Forge Better Agents" },
      {
        name: "description",
        content:
          "Give SMITH a goal, your tools and an eval pack. It builds the agent, reads the failure, and forges a better one until the score moves.",
      },
      { property: "og:title", content: "SMITH.forge — Agents That Forge Better Agents" },
      {
        property: "og:description",
        content:
          "The meta-agent factory: architecture, run, failure taxonomy, mutation, measurable gain.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative">
      <div className="grain" />
      <div className="forge-glow pointer-events-none fixed inset-0" />
      <div className="relative z-1 grid min-h-screen grid-rows-[auto_1fr_auto] lg:h-screen lg:overflow-hidden">
        <SiteHeader />

        <main className="flex min-h-0 items-end justify-center px-6 pt-2 pb-[64px] lg:pb-[85px]">
          <div className="flex w-full max-w-[860px] flex-col items-center text-center">
            <span
              className="badge-metal appear appear-pop mb-[22px]"
              style={{ ["--d" as string]: "0.22s" }}
            >
              <Sparkle />
              Automated Agent Engineering
            </span>

            <h1 className="flex flex-col text-[36px] leading-[1.12] font-medium tracking-[-0.045em] md:text-[48px] xl:text-[64px]">
              <span
                className="headline-line appear appear-mask"
                style={{ ["--d" as string]: "0.42s" }}
              >
                Forge <em className="serif-accent">AI agents</em> that
              </span>
              <span
                className="headline-line appear appear-mask"
                style={{ ["--d" as string]: "0.62s" }}
              >
                fix their own failures.
              </span>
            </h1>

            <p
              className="appear appear-soft mt-[18px] max-w-[470px] text-[15.5px] leading-[1.55] tracking-[-0.015em] text-muted-foreground"
              style={{ ["--d" as string]: "0.82s", animationDuration: "1.25s" }}
            >
              Name a job you have never automated. SMITH writes the agent, runs your eval,
              classifies every failure, and forges a better generation until the numbers move.
            </p>

            <div className="mt-[26px] flex flex-wrap items-center justify-center gap-[10px] max-[560px]:w-full max-[560px]:flex-col">
              <Link
                to="/start"
                style={{ ["--d" as string]: "0.96s" }}
                className="btn-shine btn-solid-metal appear appear-btn h-[42px] px-[18px] max-[560px]:w-full"
              >
                Start for Free
              </Link>
              <Link
                to="/demo"
                style={{ ["--d" as string]: "1.1s" }}
                className="btn-shine btn-ghost-frost appear appear-side h-[42px] px-[18px] max-[560px]:w-full"
              >
                See the forge loop
              </Link>
            </div>
          </div>
        </main>

        <footer className="flex flex-col items-center justify-between gap-4 px-6 pb-7 text-[13.5px] text-stat md:flex-row md:px-[72px] md:pb-9">
          <span
            className="appear appear-stat inline-flex items-center gap-[14px] tracking-[-0.015em]"
            style={{ ["--d" as string]: "1.12s" }}
          >
            <Hammer size={20} className="text-[#e8e8e8]" strokeWidth={1.6} />2 domains forged in one
            loop
          </span>
          <span
            className="appear appear-stat inline-flex items-center gap-[14px] tracking-[-0.015em]"
            style={{ ["--d" as string]: "1.28s" }}
          >
            <TrendingUp size={20} className="text-[#e8e8e8]" strokeWidth={1.6} />
            41% → 78% accuracy on messy invoices
          </span>
          <span
            className="appear appear-stat inline-flex items-center gap-[14px] tracking-[-0.015em]"
            style={{ ["--d" as string]: "1.44s" }}
          >
            <Users size={20} className="text-[#e8e8e8]" strokeWidth={1.6} />
            <span className="inline-flex items-center gap-2">
              Every generation traced
              <SmithMark size={16} className="text-ember ember-dot" />
            </span>
          </span>
        </footer>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/smith/PageShell";
import { SmithMark, SmithLogo } from "@/components/smith/Logo";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "Brand — SMITH.forge" },
      {
        name: "description",
        content: "SMITH mark, wordmark, and merch-ready geometry for the agent forge.",
      },
    ],
  }),
  component: BrandPage,
});

function BrandPage() {
  return (
    <PageShell
      eyebrow="Brand kit"
      title="Anvil. Spark."
      accent="SMITH."
      lede="Single-path monochrome mark that prints clean on hoodies, stickers, and dark UI chrome."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="panel flex min-h-[240px] items-center justify-center p-10">
          <SmithMark className="h-24 w-24 text-foreground" />
        </div>
        <div className="panel flex min-h-[240px] items-center justify-center bg-foreground p-10">
          <SmithMark className="h-24 w-24 text-background" />
        </div>
        <div className="panel flex min-h-[160px] items-center justify-center p-8 md:col-span-2">
          <SmithLogo />
        </div>
      </div>
      <div className="panel mt-6 space-y-3 p-6 text-[14px] text-muted-foreground">
        <p>Palette: pure black forge ground, ember accent, metal buttons, grain overlay.</p>
        <p>Typography: Inter for UI, Instrument Serif italic for accent words only.</p>
        <p>
          Doctrine: agents that improve themselves. Never claim unhackable — ship measurable report
          cards instead.
        </p>
      </div>
    </PageShell>
  );
}

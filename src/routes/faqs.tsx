import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/smith/PageShell";
import { faqs } from "@/lib/smith-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — SMITH.forge" },
      {
        name: "description",
        content:
          "Answers on eval packs, prompt writing, agent export and which domains the SMITH forge handles best.",
      },
      { property: "og:title", content: "FAQs — SMITH.forge" },
      {
        property: "og:description",
        content: "What SMITH builds, what you supply, and how the loop is scored.",
      },
    ],
  }),
  component: Faqs,
});

function Faqs() {
  return (
    <PageShell
      eyebrow="Questions"
      title="Everything people ask before their"
      accent="first forge."
      lede="Short answers. If yours isn't here, the demo page shows the loop end to end."
    >
      <div className="panel px-6 py-2">
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-[15.5px] tracking-[-0.02em]">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[13.5px] leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <p className="mt-8 text-[13.5px] text-muted-foreground">
        Still unsure?{" "}
        <Link to="/demo" className="text-foreground underline underline-offset-4">
          Watch the forge loop run
        </Link>
        .
      </p>
    </PageShell>
  );
}

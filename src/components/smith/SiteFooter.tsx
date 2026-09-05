import { Link } from "@tanstack/react-router";
import { SmithLogo } from "./Logo";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Benefits", to: "/benefits" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Pricing", to: "/pricing" },
      { label: "Live Demo", to: "/demo" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Forge", to: "/dashboard/forge" },
      { label: "Agents", to: "/dashboard/agents" },
      { label: "Runs", to: "/dashboard/runs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Brand & Merch", to: "/brand" },
      { label: "FAQs", to: "/faqs" },
      { label: "Start for Free", to: "/start" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="hairline mt-24 px-5 py-12 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <SmithLogo />
          <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">
            The agent forge. Give it a goal, tools and an eval — it builds the
            agent, reads the failure, and forges a better one.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[12.5px] tracking-[0.12em] text-muted-foreground uppercase">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-[13.5px] text-stat transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl text-[12.5px] text-muted-foreground">
        © {new Date().getFullYear()} SMITH.forge — built in Accra by Henry Sam
        Marfo.
      </div>
    </footer>
  );
}

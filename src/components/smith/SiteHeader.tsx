import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SmithLogo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Benefits", to: "/benefits" as const },
  { label: "How It Works", to: "/how-it-works" as const },
  { label: "FAQs", to: "/faqs" as const },
  { label: "Pricing", to: "/pricing" as const },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(8,8,8,0.42)] transition-all duration-300 md:hidden",
          open
            ? "visible opacity-100 backdrop-blur-[24px]"
            : "invisible opacity-0",
        )}
      />
      <header className="relative z-50 grid grid-cols-[1fr_auto_auto] items-center gap-2 px-5 pt-[18px] pb-[10px] md:grid-cols-[1fr_auto_1fr] md:px-10 md:pt-[22px]">
        <Link
          to="/"
          aria-label="SMITH.forge"
          className="appear appear-scale z-80 justify-self-start"
        >
          <SmithLogo />
        </Link>

        <nav
          id="site-nav"
          aria-label="Primary"
          className={cn(
            "z-45 items-center gap-2 justify-self-center",
            "max-md:fixed max-md:inset-0 max-md:flex-col max-md:justify-center max-md:gap-3 max-md:px-[22px] max-md:pt-24 max-md:pb-8",
            open ? "max-md:flex" : "max-md:hidden",
            "md:flex",
          )}
        >
          {NAV.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              style={{ ["--d" as string]: `${0.16 + i * 0.12}s` }}
              className="liquid-pill appear appear-soft max-md:h-14 max-md:w-full max-md:rounded-[10px] max-md:text-[19px]"
              activeProps={{ className: "!border-[rgba(235,235,235,0.9)]" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            style={{ ["--d" as string]: "0.6s" }}
            className="liquid-pill appear appear-soft max-md:h-14 max-md:w-full max-md:rounded-[10px] max-md:text-[19px] md:hidden"
          >
            Dashboard
          </Link>
        </nav>

        <Link
          to="/start"
          style={{ ["--d" as string]: "0.34s" }}
          className="btn-shine btn-solid-metal appear appear-scale z-80 justify-self-end max-md:hidden"
        >
          Start for Free
        </Link>

        <button
          type="button"
          aria-controls="site-nav"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          style={{ ["--d" as string]: "0.34s" }}
          className="appear appear-scale z-80 grid h-[42px] w-[42px] place-items-center gap-[5px] rounded-md border border-border bg-[rgba(8,8,8,0.55)] transition-colors hover:border-[rgba(255,255,255,0.32)] hover:bg-[rgba(255,255,255,0.05)] md:hidden"
        >
          <span
            className={cn(
              "block h-[1.5px] w-4 rounded-[1px] bg-foreground transition-transform duration-250",
              open && "translate-y-[6.5px] rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-[1.5px] w-4 rounded-[1px] bg-foreground transition-opacity duration-200",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-[1.5px] w-4 rounded-[1px] bg-foreground transition-transform duration-250",
              open && "-translate-y-[6.5px] -rotate-45",
            )}
          />
        </button>
      </header>
    </>
  );
}

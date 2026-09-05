import { cn } from "@/lib/utils";

/**
 * SMITH mark — an anvil silhouette struck by a spark.
 * Single-path monochrome geometry so it prints clean on merch at any size.
 */
export function SmithMark({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* spark */}
      <path d="M12.9 1.6 8.9 8.2h2.7l-1.2 4.6 4.4-6.9h-2.7l.8-4.3Z" />
      {/* anvil body */}
      <path d="M3.4 12.1h13.1c1.9 0 3.4 1.2 3.9 2.9.1.4-.2.8-.6.8h-1.9c-.3 0-.6.2-.7.5l-.5 1.5c-.1.4-.5.6-.9.6H8.3c-.4 0-.8-.2-.9-.6l-.5-1.5a.75.75 0 0 0-.7-.5H3.4a.9.9 0 0 1-.9-.9v-1.5c0-.7.4-1.3.9-1.3Z" />
      {/* base */}
      <rect x="7.4" y="19.4" width="9.6" height="2.4" rx="1.2" />
    </svg>
  );
}

export function SmithLogo({
  size = 15.5,
  markSize = 22,
  className,
}: {
  size?: number;
  markSize?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-[9px] text-foreground", className)}
      style={{ fontSize: size, fontWeight: 600, letterSpacing: "-0.03em" }}
    >
      <SmithMark size={markSize} />
      <span>
        SMITH<span style={{ fontWeight: 400 }}>.forge</span>
      </span>
    </span>
  );
}

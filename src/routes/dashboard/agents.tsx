import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardFn } from "@/smith/forge/api";

export const Route = createFileRoute("/dashboard/agents")({
  head: () => ({
    meta: [
      { title: "Agents — SMITH.forge" },
      {
        name: "description",
        content: "Architecture generations produced by the SMITH forge loop.",
      },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  const getDashboard = useServerFn(getDashboardFn);
  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
  });

  return (
    <DashboardShell
      title="Agent generations"
      lede="Each generation is a typed architecture (prompt, router, memory, tools) persisted in SQLite."
    >
      <div className="panel overflow-x-auto p-5">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="text-muted-foreground">
            <tr>
              <th className="pb-2 font-normal">Gen</th>
              <th className="pb-2 font-normal">Name</th>
              <th className="pb-2 font-normal">Pack</th>
              <th className="pb-2 font-normal">Workspace</th>
              <th className="pb-2 font-normal">Notes</th>
            </tr>
          </thead>
          <tbody>
            {(q.data?.generations ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-muted-foreground">
                  No generations yet — run the forge.
                </td>
              </tr>
            ) : (
              q.data?.generations.map((g) => (
                <tr key={g.id} className="border-t border-border align-top">
                  <td className="py-3">#{g.generation}</td>
                  <td className="py-3">{g.architecture.name}</td>
                  <td className="py-3">{g.packId}</td>
                  <td className="py-3 font-mono text-[12px]">{g.workspaceId}</td>
                  <td className="max-w-[280px] py-3 text-muted-foreground">
                    {g.architecture.notes || g.architecture.routerHint}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

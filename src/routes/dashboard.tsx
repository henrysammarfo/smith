import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { meFn } from "@/smith/auth/api";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const user = await meFn();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: "/dashboard" } });
    }
    return { user };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return <Outlet />;
}

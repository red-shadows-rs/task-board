import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { Dashboard } from "@/components/common/dashboardCommon";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }
  if (user.role === "client") {
    redirect("/dashboard/projects");
  }
  return <Dashboard user={user} showCharts={false} dataMode="tasks" />;
}

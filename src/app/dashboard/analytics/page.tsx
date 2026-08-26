import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import AnalyticsPage from "@/components/pages/analyticsPage";

export const dynamic = "force-dynamic";

export default async function Analytics() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }
  if (user.role === "client") {
    redirect("/dashboard/projects");
  }
  return <AnalyticsPage />;
}

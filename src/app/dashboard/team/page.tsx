import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { TeamMembers } from "@/components/pages/teamPage";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "leader") {
    redirect(
      user.role === "client" ? "/dashboard/projects" : "/dashboard/tasks",
    );
  }

  return <TeamMembers user={user} />;
}

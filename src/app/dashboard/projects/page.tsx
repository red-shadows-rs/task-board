import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ProjectsPage } from "@/components/pages/projectsPage";

export const dynamic = "force-dynamic";

export default async function Projects() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "leader" && user.role !== "client") {
    redirect("/dashboard/tasks");
  }

  return <ProjectsPage user={user} />;
}

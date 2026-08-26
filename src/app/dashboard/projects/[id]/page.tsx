import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ProjectDetailPage } from "@/components/pages/projectDetailPage";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  const { id } = await params;

  if (!user) {
    redirect("/login");
  }

  return <ProjectDetailPage user={user} projectId={id} />;
}

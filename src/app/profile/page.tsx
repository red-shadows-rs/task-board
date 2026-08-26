import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import ProfilePage from "@/components/pages/profilePage";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <ProfilePage user={user} />;
}

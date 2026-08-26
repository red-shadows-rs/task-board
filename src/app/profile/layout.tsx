import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Footer } from "@/components/layouts/footerLayout";
import { Navbar } from "@/components/layouts/navbarLayout";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} />
      {children}
      <Footer />
    </div>
  );
}

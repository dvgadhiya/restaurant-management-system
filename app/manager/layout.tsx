import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ManagerNav } from "@/components/manager/manager-nav"

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "MANAGER") {
    redirect("/dashboard")
  }

  const user = {
    name: session.user.name,
    email: session.user.email
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerNav user={user} />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}

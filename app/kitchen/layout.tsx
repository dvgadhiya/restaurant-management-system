import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { KitchenNav } from "@/components/kitchen/kitchen-nav"

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "CHEF") {
    redirect("/dashboard")
  }

  const user = {
    name: session.user.name,
    email: session.user.email
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <KitchenNav user={user} />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  )
}

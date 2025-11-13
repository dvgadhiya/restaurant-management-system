import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { WaiterNav } from "@/components/waiter/waiter-nav"

export default async function WaiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "WAITER") {
    redirect("/dashboard")
  }

  const user = {
    name: session.user.name,
    email: session.user.email
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <WaiterNav user={user} />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  )
}

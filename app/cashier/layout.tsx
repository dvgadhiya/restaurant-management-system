import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CashierNav } from "@/components/cashier/cashier-nav"

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "CASHIER") {
    redirect("/dashboard")
  }

  const user = {
    name: session.user.name,
    email: session.user.email
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CashierNav user={user} />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}

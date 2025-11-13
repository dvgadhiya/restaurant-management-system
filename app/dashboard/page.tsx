import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Redirect to role-specific dashboard
  const role = session.user.role
  
  switch (role) {
    case "MANAGER":
      redirect("/manager")
    case "WAITER":
      redirect("/waiter")
    case "CHEF":
      redirect("/kitchen")
    case "CASHIER":
      redirect("/cashier")
    default:
      redirect("/login")
  }
}

import { prisma } from "@/lib/prisma"
import { BillingInterface } from "@/components/cashier/billing-interface"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CashierPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["READY", "SERVED"],
      },
    },
    include: {
      table: true,
      waiter: true,
      orderItems: {
        include: {
          menuItem: true,
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return <BillingInterface orders={orders} cashierId={session.user.id} />
}

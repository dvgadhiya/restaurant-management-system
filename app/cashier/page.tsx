// app/cashier/page.tsx
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

  // Serialize dates to strings for client component
  const serializedOrders = orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    table: {
      ...order.table,
      createdAt: order.table.createdAt.toISOString(),
      updatedAt: order.table.updatedAt.toISOString(),
    },
    waiter: {
      ...order.waiter,
      createdAt: order.waiter.createdAt.toISOString(),
      updatedAt: order.waiter.updatedAt.toISOString(),
    },
    orderItems: order.orderItems.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      menuItem: {
        ...item.menuItem,
        createdAt: item.menuItem.createdAt.toISOString(),
        updatedAt: item.menuItem.updatedAt.toISOString(),
      }
    })),
    payment: order.payment ? {
      ...order.payment,
      createdAt: order.payment.createdAt.toISOString(),
      updatedAt: order.payment.updatedAt.toISOString(),
      paidAt: order.payment.paidAt?.toISOString() || null,
    } : null,
  }))

  return <BillingInterface orders={serializedOrders} cashierId={session.user.id} />
}
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OrderInterface } from "@/components/waiter/order-interface"

export default async function TableOrderPage({
  params,
}: {
  params: { tableId: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { tableId } = params

  const [table, menuItems, categories, activeOrder] = await Promise.all([
    prisma.table.findUnique({
      where: { id: tableId },
    }),
    prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        isSoldOut: false,
      },
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.order.findFirst({
      where: {
        tableId,
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    }),
  ])

  if (!table) {
    redirect("/waiter")
  }

  return (
    <OrderInterface
      table={table}
      menuItems={menuItems}
      categories={categories}
      activeOrder={activeOrder}
      waiterId={session.user.id}
    />
  )
}

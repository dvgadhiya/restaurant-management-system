// app/kitchen/page.tsx
import { prisma } from "@/lib/prisma"
import { KitchenDisplay } from "@/components/kitchen/kitchen-display"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function KitchenPage() {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["NEW", "IN_PROGRESS"],
      },
    },
    include: {
      table: true,
      waiter: true,
      orderItems: {
        include: {
          menuItem: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
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
  }))

  return <KitchenDisplay orders={serializedOrders} />
}
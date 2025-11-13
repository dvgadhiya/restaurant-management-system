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

  return <KitchenDisplay orders={orders} />
}

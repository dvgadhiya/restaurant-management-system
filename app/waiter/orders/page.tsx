import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const dynamic = "force-dynamic"

export default async function WaiterOrdersPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Get orders for this waiter
  const myOrders = await prisma.order.findMany({
    where: {
      waiterId: session.user.id,
      status: {
        notIn: ["COMPLETED", "CANCELLED"]
      }
    },
    include: {
      table: true,
      orderItems: {
        include: {
          menuItem: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // Get all active orders in the restaurant
  const allActiveOrders = await prisma.order.findMany({
    where: {
      status: {
        notIn: ["COMPLETED", "CANCELLED"]
      }
    },
    include: {
      table: true,
      waiter: true,
      orderItems: {
        include: {
          menuItem: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-600"
      case "IN_PROGRESS":
        return "bg-yellow-600"
      case "READY":
        return "bg-green-600"
      case "SERVED":
        return "bg-purple-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Active Orders</h1>
        <p className="text-muted-foreground">Track your current orders</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myOrders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                You have no active orders. Visit the Tables page to take new orders.
              </p>
            </CardContent>
          </Card>
        ) : (
          myOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Table {order.table.tableNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.orderNumber.slice(0, 8)}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Items:</p>
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="text-muted-foreground">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${order.finalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ordered: {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-bold mb-4">All Active Orders</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allActiveOrders.map((order) => (
            <Card key={order.id} className={order.waiterId === session.user.id ? "border-2 border-blue-500" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Table {order.table.tableNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Waiter: {order.waiter.name}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {order.orderItems.length} items
                  </p>
                  <p className="font-bold text-lg">
                    ${order.finalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

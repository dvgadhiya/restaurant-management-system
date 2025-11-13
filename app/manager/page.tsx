import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp 
} from "lucide-react"

export default async function ManagerDashboard() {
  // Fetch dashboard statistics
  const [totalOrders, totalRevenue, activeTablesCount, menuItemsCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { finalAmount: true },
      where: { status: "COMPLETED" }
    }),
    prisma.table.count({ where: { status: "OCCUPIED" } }),
    prisma.menuItem.count({ where: { isAvailable: true } })
  ])

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayOrders = await prisma.order.count({
    where: {
      createdAt: { gte: todayStart }
    }
  })

  const todayRevenue = await prisma.order.aggregate({
    _sum: { finalAmount: true },
    where: {
      createdAt: { gte: todayStart },
      status: "COMPLETED"
    }
  })

  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      table: true,
      waiter: true,
      orderItems: {
        include: {
          menuItem: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your restaurant overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(todayRevenue._sum.finalAmount || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayOrders} orders today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue._sum.finalAmount || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalOrders} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTablesCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItemsCount}</div>
            <p className="text-xs text-muted-foreground">
              Available items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      Table {order.table.tableNumber} - Order #{order.orderNumber.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Waiter: {order.waiter.name} • {order.orderItems.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.finalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

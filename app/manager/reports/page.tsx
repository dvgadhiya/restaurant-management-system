import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BarChart3, DollarSign, TrendingUp, UtensilsCrossed } from "lucide-react"

export default async function ReportsPage() {
  // Get date ranges
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const monthAgo = new Date(today)
  monthAgo.setMonth(monthAgo.getMonth() - 1)

  // Daily sales
  const todaySales = await prisma.order.aggregate({
    _sum: { finalAmount: true },
    _count: true,
    where: {
      status: "COMPLETED",
      createdAt: { gte: today }
    }
  })

  // Weekly sales
  const weeklySales = await prisma.order.aggregate({
    _sum: { finalAmount: true },
    _count: true,
    where: {
      status: "COMPLETED",
      createdAt: { gte: weekAgo }
    }
  })

  // Monthly sales
  const monthlySales = await prisma.order.aggregate({
    _sum: { finalAmount: true },
    _count: true,
    where: {
      status: "COMPLETED",
      createdAt: { gte: monthAgo }
    }
  })

  // Popular items
  const popularItems = await prisma.orderItem.groupBy({
    by: ["menuItemId"],
    _sum: {
      quantity: true,
    },
    _count: true,
    orderBy: {
      _sum: {
        quantity: "desc"
      }
    },
    take: 10
  })

  const itemsWithDetails = await Promise.all(
    popularItems.map(async (item) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        include: { category: true }
      })
      return {
        ...item,
        menuItem
      }
    })
  )

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    include: {
      table: true,
      waiter: true,
      payment: true
    },
    orderBy: { createdAt: "desc" },
    take: 20
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Reports & Analytics</h1>
        <p className="text-muted-foreground">View sales performance and popular items</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(todaySales._sum.finalAmount || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {todaySales._count} orders completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(weeklySales._sum.finalAmount || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {weeklySales._count} orders (last 7 days)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(monthlySales._sum.finalAmount || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {monthlySales._count} orders (last 30 days)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Order Value (Today)</span>
                  <span className="text-2xl font-bold">
                    ${todaySales._count > 0 
                      ? ((todaySales._sum.finalAmount || 0) / todaySales._count).toFixed(2)
                      : "0.00"
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Order Value (Week)</span>
                  <span className="text-2xl font-bold">
                    ${weeklySales._count > 0
                      ? ((weeklySales._sum.finalAmount || 0) / weeklySales._count).toFixed(2)
                      : "0.00"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Most Popular Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Times Ordered</TableHead>
                    <TableHead>Total Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsWithDetails.map((item, index) => (
                    <TableRow key={item.menuItemId}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                          {item.menuItem?.name || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>{item.menuItem?.category.name || "N/A"}</TableCell>
                      <TableCell>{item._count}</TableCell>
                      <TableCell className="font-bold">{item._sum.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Waiter</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">
                        #{order.orderNumber.slice(0, 8)}
                      </TableCell>
                      <TableCell>Table {order.table.tableNumber}</TableCell>
                      <TableCell>{order.waiter.name}</TableCell>
                      <TableCell className="font-bold">
                        ${order.finalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>{order.payment?.paymentMethod || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

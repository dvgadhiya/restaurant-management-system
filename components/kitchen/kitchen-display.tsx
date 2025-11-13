"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Clock, Users, Package } from "lucide-react"

type OrderItem = {
  id: string
  quantity: number
  notes: string | null
  status: string
  menuItem: {
    id: string
    name: string
    prepTime: number | null
    isVeg: boolean
  }
}

type Order = {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  table: {
    tableNumber: number
  }
  waiter: {
    name: string
  }
  orderItems: OrderItem[]
}

interface KitchenDisplayProps {
  orders: Order[]
}

export function KitchenDisplay({ orders: initialOrders }: KitchenDisplayProps) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [consumptionLog, setConsumptionLog] = useState<{orderId: string, items: any[]}[]>([])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)

    return () => clearInterval(interval)
  }, [router])

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("/api/inventory")
        if (res.ok) {
          const data = await res.json()
          setInventoryItems(data)
        }
      } catch (error) {
        console.error("Failed to fetch inventory:", error)
      }
    }
    
    fetchInventory()
    const interval = setInterval(fetchInventory, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o.id === orderId)
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update order")

      // If marking as READY, consume inventory stock
      if (newStatus === "READY" && order) {
        const failedItems: string[] = []
        const consumedItems: any[] = []
        
        for (const item of order.orderItems) {
          try {
            const res = await fetch("/api/inventory/consume", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                menuItemId: item.menuItem.id,
                quantity: item.quantity
              })
            })
            
            if (!res.ok) {
              if (res.status === 404) {
                // No inventory tracking for this item - that's okay
                console.log("No inventory tracking for", item.menuItem.name)
              } else {
                failedItems.push(item.menuItem.name)
              }
            } else {
              const data = await res.json()
              consumedItems.push({
                name: item.menuItem.name,
                consumed: data.consumed,
                unit: data.unit,
                remaining: data.currentStock
              })
              
              if (data.isLowStock) {
                toast.warning(`${item.menuItem.name} is now low on stock! Only ${data.currentStock} ${data.unit} remaining`)
              }
            }
          } catch (err) {
            console.error("Failed to consume stock for", item.menuItem.name, err)
            failedItems.push(item.menuItem.name)
          }
        }
        
        // Add to consumption log
        if (consumedItems.length > 0) {
          setConsumptionLog(prev => [{orderId: order.id, items: consumedItems}, ...prev.slice(0, 4)])
        }
        
        if (failedItems.length > 0) {
          toast.error(`Failed to update stock for: ${failedItems.join(", ")}`)
        }
        
        // Refresh inventory after consumption
        const invRes = await fetch("/api/inventory")
        if (invRes.ok) {
          const invData = await invRes.json()
          setInventoryItems(invData)
        }
      }

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      if (newStatus === "READY") {
        toast.success("Order marked as ready and stock updated!")
      } else {
        toast.success("Order status updated")
      }

      router.refresh()
    } catch (error) {
      toast.error("Failed to update order status")
      console.error(error)
    }
  }

  const getTimeSinceOrder = (createdAt: string) => {
    const minutes = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / 60000
    )
    return minutes
  }

  const getTimeColor = (minutes: number) => {
    if (minutes < 10) return "text-green-600"
    if (minutes < 20) return "text-yellow-600"
    return "text-red-600"
  }

  const newOrders = orders.filter((o) => o.status === "NEW")
  const inProgressOrders = orders.filter((o) => o.status === "IN_PROGRESS")
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-red-600">{newOrders.length}</div>
            <div className="text-muted-foreground">New Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-yellow-600">
              {inProgressOrders.length}
            </div>
            <div className="text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-4xl font-bold text-orange-600">{lowStockItems.length}</div>
                <div className="text-muted-foreground">Low Stock Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="bg-orange-50 border-orange-300">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Low Stock Alert - Check with Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-orange-600 text-sm font-bold">
                    {item.currentStock} {item.unit} left
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Min: {item.minStock} {item.unit}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Consumption Log */}
      {consumptionLog.length > 0 && (
        <Card className="bg-blue-50 border-blue-300">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Inventory Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consumptionLog.map((log, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border">
                  <div className="text-muted-foreground text-sm mb-2">Order completed just now</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {log.items.map((item: any, itemIdx: number) => (
                      <div key={itemIdx} className="text-sm">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-blue-600">
                          Used: {item.consumed} {item.unit}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Remaining: {item.remaining} {item.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-muted-foreground">No active orders</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => {
            const minutes = getTimeSinceOrder(order.createdAt)
            const timeColor = getTimeColor(minutes)

            return (
              <Card
                key={order.id}
                className={`${
                  order.status === "NEW"
                    ? "bg-red-50 border-red-300"
                    : "bg-yellow-50 border-yellow-300"
                }`}
              >
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
                    <Badge
                      className={`${
                        order.status === "NEW"
                          ? "bg-red-600"
                          : "bg-yellow-600"
                      } text-white`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className={`font-bold ${timeColor}`}>
                        {minutes} min ago
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{order.waiter.name}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-lg border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              {item.quantity}x
                            </span>
                            <span className="font-medium">
                              {item.menuItem.name}
                            </span>
                            <Badge
                              variant={item.menuItem.isVeg ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {item.menuItem.isVeg ? "V" : "NV"}
                            </Badge>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-orange-600 mt-1 font-semibold">
                              Note: {item.notes}
                            </p>
                          )}
                          {item.menuItem.prepTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Prep: {item.menuItem.prepTime} min
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-4">
                    {order.status === "NEW" && (
                      <Button
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                        onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}
                      >
                        Start Cooking
                      </Button>
                    )}
                    {order.status === "IN_PROGRESS" && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => updateOrderStatus(order.id, "READY")}
                      >
                        Mark Ready
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

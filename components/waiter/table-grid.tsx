"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

type TableWithOrders = {
  id: string
  tableNumber: number
  capacity: number
  status: string
  orders: Array<{
    id: string
    orderItems: Array<{
      menuItem: {
        name: string
      }
    }>
  }>
}

type TableGridProps = {
  tables: TableWithOrders[]
}

export function TableGrid({ tables }: TableGridProps) {
  const getStatusColor = (status: string, hasOrders: boolean) => {
    if (hasOrders || status === "OCCUPIED") return "bg-red-500"
    if (status === "RESERVED") return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusText = (status: string, hasOrders: boolean) => {
    if (hasOrders || status === "OCCUPIED") return "Occupied"
    if (status === "RESERVED") return "Reserved"
    return "Free"
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => {
        const hasActiveOrders = table.orders.length > 0
        const statusColor = getStatusColor(table.status, hasActiveOrders)
        const statusText = getStatusText(table.status, hasActiveOrders)

        return (
          <Link key={table.id} href={`/waiter/table/${table.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-3xl font-bold">
                    {table.tableNumber}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{table.capacity} seats</span>
                  </div>
                  <Badge className={`${statusColor} text-white`}>
                    {statusText}
                  </Badge>
                  {hasActiveOrders && (
                    <Badge variant="outline" className="text-xs">
                      {table.orders[0].orderItems.length} items
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

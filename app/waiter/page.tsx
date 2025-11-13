import { prisma } from "@/lib/prisma"
import { TableGrid } from "@/components/waiter/table-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function WaiterPage() {
  const tables = await prisma.table.findMany({
    orderBy: { tableNumber: "asc" },
    include: {
      orders: {
        where: {
          status: {
            notIn: ["COMPLETED", "CANCELLED"]
          }
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      }
    }
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Select a Table</CardTitle>
        </CardHeader>
        <CardContent>
          <TableGrid tables={tables} />
        </CardContent>
      </Card>
    </div>
  )
}

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTableDialog } from "@/components/manager/add-table-dialog"
import { TableCard } from "@/components/manager/table-card"

export default async function TablesPage() {
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
          waiter: true,
          orderItems: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground">Monitor and manage restaurant tables</p>
        </div>
        <AddTableDialog />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {tables.filter(t => t.status === "FREE").length}
            </div>
            <div className="text-sm text-muted-foreground">Free Tables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-red-600">
              {tables.filter(t => t.status === "OCCUPIED").length}
            </div>
            <div className="text-sm text-muted-foreground">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {tables.filter(t => t.status === "RESERVED").length}
            </div>
            <div className="text-sm text-muted-foreground">Reserved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold">
              {tables.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Tables</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

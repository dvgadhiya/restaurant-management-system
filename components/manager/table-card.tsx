"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

type Table = {
  id: string
  tableNumber: number
  capacity: number
  status: string
  shape: string
  orders: any[]
}

type TableCardProps = {
  table: Table
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "FREE":
      return "bg-green-600"
    case "OCCUPIED":
      return "bg-red-600"
    case "RESERVED":
      return "bg-yellow-600"
    case "CLEANING":
      return "bg-blue-600"
    default:
      return "bg-gray-600"
  }
}

export function TableCard({ table }: TableCardProps) {
  const router = useRouter()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tableNumber: table.tableNumber.toString(),
    capacity: table.capacity.toString(),
    shape: table.shape,
  })

  const activeOrder = table.orders[0]

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tableNumber || !formData.capacity) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: parseInt(formData.tableNumber),
          capacity: parseInt(formData.capacity),
          shape: formData.shape,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update table")
      }

      toast.success("Table updated successfully")
      setEditDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update table")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete table")
      }

      toast.success("Table deleted successfully")
      setDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete table")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow relative group">
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="text-2xl font-bold">
              Table {table.tableNumber}
            </div>
            <div className="text-sm text-muted-foreground">
              Capacity: {table.capacity}
            </div>
            <Badge className={`${getStatusColor(table.status)} text-white`}>
              {table.status}
            </Badge>
            {activeOrder && (
              <div className="text-xs text-center">
                <div className="font-medium">{activeOrder.waiter.name}</div>
                <div className="text-muted-foreground">
                  {activeOrder.orderItems.length} items
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Update table information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tableNumber">
                Table Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-tableNumber"
                type="number"
                min="1"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-capacity">
                Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-shape">Table Shape</Label>
              <Select
                value={formData.shape}
                onValueChange={(value) => setFormData({ ...formData, shape: value })}
              >
                <SelectTrigger id="edit-shape">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SQUARE">Square</SelectItem>
                  <SelectItem value="ROUND">Round</SelectItem>
                  <SelectItem value="RECTANGULAR">Rectangular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Table"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete Table {table.tableNumber}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

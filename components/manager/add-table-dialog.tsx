"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddTableDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tableNumber: "",
    capacity: "",
    shape: "SQUARE",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tableNumber || !formData.capacity) {
      toast.error("Please fill in all required fields")
      return
    }

    const tableNum = parseInt(formData.tableNumber)
    const cap = parseInt(formData.capacity)

    if (isNaN(tableNum) || tableNum <= 0) {
      toast.error("Table number must be a positive number")
      return
    }

    if (isNaN(cap) || cap <= 0) {
      toast.error("Capacity must be a positive number")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: tableNum,
          capacity: cap,
          shape: formData.shape,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create table")
      }

      toast.success("Table created successfully")
      setOpen(false)
      setFormData({
        tableNumber: "",
        capacity: "",
        shape: "SQUARE",
      })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create table")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
          <DialogDescription>
            Create a new table for your restaurant
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tableNumber">
              Table Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tableNumber"
              type="number"
              min="1"
              placeholder="e.g., 1, 2, 3"
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">
              Capacity (Number of Seats) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              placeholder="e.g., 2, 4, 6"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shape">Table Shape</Label>
            <Select
              value={formData.shape}
              onValueChange={(value) => setFormData({ ...formData, shape: value })}
            >
              <SelectTrigger id="shape">
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Table"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

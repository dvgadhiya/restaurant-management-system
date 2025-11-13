"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

type Category = {
  id: string
  name: string
}

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  prepTime: number | null
  isVeg: boolean
  isAvailable: boolean
}

type EditMenuItemDialogProps = {
  menuItem: MenuItem
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditMenuItemDialog({ 
  menuItem, 
  categories, 
  open, 
  onOpenChange,
  onSuccess 
}: EditMenuItemDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    prepTime: "",
    isVeg: true,
    isAvailable: true,
  })

  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name,
        description: menuItem.description || "",
        categoryId: menuItem.categoryId,
        price: menuItem.price.toString(),
        prepTime: menuItem.prepTime?.toString() || "",
        isVeg: menuItem.isVeg,
        isAvailable: menuItem.isAvailable,
      })
    }
  }, [menuItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.categoryId || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`/api/menu/${menuItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          categoryId: formData.categoryId,
          price: parseFloat(formData.price),
          prepTime: formData.prepTime ? parseInt(formData.prepTime) : null,
          isVeg: formData.isVeg,
          isAvailable: formData.isAvailable,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update menu item")
      }

      toast.success("Menu item updated successfully")
      onOpenChange(false)
      onSuccess()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update menu item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>
            Update the details of this menu item
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Margherita Pizza"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="9.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-prepTime">Prep Time (minutes)</Label>
              <Input
                id="edit-prepTime"
                type="number"
                min="1"
                placeholder="15"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe the dish..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-isVeg">Vegetarian</Label>
                <p className="text-xs text-muted-foreground">
                  Mark this item as vegetarian
                </p>
              </div>
              <Switch
                id="edit-isVeg"
                checked={formData.isVeg}
                onCheckedChange={(checked) => setFormData({ ...formData, isVeg: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-isAvailable">Available</Label>
                <p className="text-xs text-muted-foreground">
                  Make this item available for ordering
                </p>
              </div>
              <Switch
                id="edit-isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Menu Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, AlertTriangle, CheckCircle, Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface InventoryItem {
  id: string
  name: string
  description: string | null
  categoryId: string
  currentStock: number
  minStock: number
  unit: string
  costPerUnit: number | null
  lastUpdated: Date
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Add/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [itemName, setItemName] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [currentStock, setCurrentStock] = useState("")
  const [minStock, setMinStock] = useState("")
  const [unit, setUnit] = useState("kg")
  const [costPerUnit, setCostPerUnit] = useState("")

  // Restock dialog state
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [inventoryRes, categoryRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/categories")
      ])
      
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json()
        setInventoryItems(inventoryData)
      }

      if (categoryRes.ok) {
        const categoryData = await categoryRes.json()
        setCategories(categoryData)
        if (categoryData.length > 0) {
          setSelectedCategory(categoryData[0].id)
        }
      }
    } catch {
      toast.error("Failed to load inventory data")
    } finally {
      setLoading(false)
    }
  }

  const openAddDialog = () => {
    setEditingItem(null)
    setItemName("")
    setItemDescription("")
    if (categories.length > 0) {
      setSelectedCategory(categories[0].id)
    }
    setCurrentStock("")
    setMinStock("")
    setUnit("kg")
    setCostPerUnit("")
    setDialogOpen(true)
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)
    setItemName(item.name)
    setItemDescription(item.description || "")
    setSelectedCategory(item.categoryId)
    setCurrentStock(item.currentStock.toString())
    setMinStock(item.minStock.toString())
    setUnit(item.unit)
    setCostPerUnit(item.costPerUnit?.toString() || "")
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!itemName.trim() || !selectedCategory || !currentStock || !minStock) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      if (editingItem) {
        // Update existing item
        const res = await fetch(`/api/inventory/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: itemName.trim(),
            description: itemDescription.trim() || null,
            categoryId: selectedCategory,
            currentStock: parseFloat(currentStock),
            minStock: parseFloat(minStock),
            unit,
            costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null
          })
        })

        if (res.ok) {
          toast.success("Inventory item updated")
          setDialogOpen(false)
          fetchData()
        } else {
          toast.error("Failed to update item")
        }
      } else {
        // Create new inventory item
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: itemName.trim(),
            description: itemDescription.trim() || null,
            categoryId: selectedCategory,
            currentStock: parseFloat(currentStock),
            minStock: parseFloat(minStock),
            unit,
            costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null
          })
        })

        if (res.ok) {
          toast.success("Inventory item added")
          setDialogOpen(false)
          fetchData()
        } else {
          const error = await res.json()
          toast.error(error.error || "Failed to add item")
        }
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Delete inventory tracking for "${itemName}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast.success("Inventory item deleted")
        fetchData()
      } else {
        toast.error("Failed to delete item")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const openRestockDialog = (item: InventoryItem) => {
    setRestockItem(item)
    setRestockAmount("")
    setRestockDialogOpen(true)
  }

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!restockItem || !restockAmount) {
      return
    }

    const newStock = restockItem.currentStock + parseFloat(restockAmount)

    try {
      const res = await fetch(`/api/inventory/${restockItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStock: newStock
        })
      })

      if (res.ok) {
        toast.success(`Restocked ${restockAmount} ${restockItem.unit}`)
        setRestockDialogOpen(false)
        fetchData()
      } else {
        toast.error("Failed to restock")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const lowStockItems = inventoryItems.filter(
    item => item.currentStock <= item.minStock
  )

  const inStockItems = inventoryItems.filter(
    item => item.currentStock > item.minStock
  )

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track raw materials and ingredients for food and beverages</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem 
                    ? "Update stock levels and settings for raw materials" 
                    : "Add raw materials and ingredients to inventory tracking"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Raw Material / Ingredient Name *</Label>
                  <Input
                    id="itemName"
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Tomatoes, Milk, Rice, Sugar, Flour"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Description (Optional)</Label>
                  <Input
                    id="itemDescription"
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Additional details about this ingredient"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    step="0.01"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock *</Label>
                  <Input
                    id="minStock"
                    type="number"
                    step="0.01"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="L">Liters (L)</SelectItem>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="portions">Portions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPerUnit">Cost Per Unit (Optional)</Label>
                  <Input
                    id="costPerUnit"
                    type="number"
                    step="0.01"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    placeholder="2.50"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update" : "Add"} Item
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Raw materials tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Materials need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Materials well stocked
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 mb-4">
              The following raw materials are running low on stock:
            </p>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.category.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-yellow-700">
                        {item.currentStock} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.minStock} {item.unit}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openRestockDialog(item)}
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Raw Materials & Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raw Material / Ingredient</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No raw materials tracked yet. Click &quot;Add Item&quot; to start tracking ingredients and supplies.
                  </TableCell>
                </TableRow>
              ) : (
                inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>
                        {item.name}
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category.name}</TableCell>
                    <TableCell>
                      <span className={item.currentStock <= item.minStock ? "text-yellow-700 font-semibold" : ""}>
                        {item.currentStock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.minStock} {item.unit}
                    </TableCell>
                    <TableCell>
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {item.currentStock <= item.minStock ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openRestockDialog(item)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id, item.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent>
          <form onSubmit={handleRestock}>
            <DialogHeader>
              <DialogTitle>Restock Raw Material</DialogTitle>
              <DialogDescription>
                Add stock to {restockItem?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input 
                  value={`${restockItem?.currentStock || 0} ${restockItem?.unit || ""}`} 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restockAmount">Add Amount *</Label>
                <Input
                  id="restockAmount"
                  type="number"
                  step="0.01"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  placeholder="Enter amount to add"
                  required
                />
              </div>

              {restockAmount && restockItem && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">New stock level:</p>
                  <p className="text-lg font-bold">
                    {(restockItem.currentStock + parseFloat(restockAmount || "0")).toFixed(2)} {restockItem.unit}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRestockDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Restock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

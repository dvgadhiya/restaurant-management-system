"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { EditMenuItemDialog } from "./edit-menu-item-dialog"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

type Category = {
  id: string
  name: string
  _count: { menuItems: number }
}

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  isAvailable: boolean
  isSoldOut: boolean
  isVeg: boolean
  prepTime: number | null
  categoryId: string
  category: { id: string; name: string }
}

type MenuListProps = {
  categories: Category[]
  menuItems: MenuItem[]
}

export function MenuList({ categories, menuItems }: MenuListProps) {
  const router = useRouter()
  const [items, setItems] = useState(menuItems)
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null)

  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter(item => item.category.id === activeTab)

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      })

      if (!response.ok) throw new Error("Failed to update")

      setItems(items.map(item => 
        item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
      ))
      toast.success("Menu item updated successfully")
    } catch (error) {
      toast.error("Failed to update menu item")
    }
  }

  const toggleSoldOut = async (itemId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSoldOut: !currentStatus }),
      })

      if (!response.ok) throw new Error("Failed to update")

      setItems(items.map(item => 
        item.id === itemId ? { ...item, isSoldOut: !currentStatus } : item
      ))
      toast.success(currentStatus ? "Item back in stock" : "Item marked as sold out")
    } catch (error) {
      toast.error("Failed to update menu item")
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      const response = await fetch(`/api/menu/${itemToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      setItems(items.filter(item => item.id !== itemToDelete))
      toast.success("Menu item deleted successfully")
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete menu item")
    }
  }

  const openDeleteDialog = (itemId: string) => {
    setItemToDelete(itemId)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (item: MenuItem) => {
    setItemToEdit(item)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All Items ({items.length})
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name} ({category._count.menuItems})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Prep Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No menu items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{item.category.name}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.isVeg ? "default" : "secondary"}>
                            {item.isVeg ? "Veg" : "Non-Veg"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.prepTime ? `${item.prepTime} min` : "N/A"}</TableCell>
                        <TableCell>
                          {item.isSoldOut ? (
                            <Badge variant="destructive">Sold Out</Badge>
                          ) : item.isAvailable ? (
                            <Badge variant="default" className="bg-green-600">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.isAvailable}
                                onCheckedChange={() => toggleAvailability(item.id, item.isAvailable)}
                              />
                              <span className="text-xs">Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.isSoldOut}
                                onCheckedChange={() => toggleSoldOut(item.id, item.isSoldOut)}
                              />
                              <span className="text-xs">Sold Out</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-600"
                              onClick={() => openDeleteDialog(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the menu item.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        {itemToEdit && (
          <EditMenuItemDialog
            menuItem={itemToEdit}
            categories={categories}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={handleEditSuccess}
          />
        )}
      </CardContent>
    </Card>
  )
}

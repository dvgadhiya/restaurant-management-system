"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Plus, Minus, Send, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  isVeg: boolean
  prepTime: number | null
  category: {
    id: string
    name: string
  }
}

type Category = {
  id: string
  name: string
}

type Table = {
  id: string
  tableNumber: number
  capacity: number
}

type OrderItem = {
  menuItemId: string
  quantity: number
  notes: string
}

type ActiveOrderItem = {
  id: string
  quantity: number
  notes: string | null
  menuItem: {
    id: string
    name: string
    price: number
  }
}

type ActiveOrder = {
  id: string
  orderItems: ActiveOrderItem[]
} | null

interface OrderInterfaceProps {
  table: Table
  menuItems: MenuItem[]
  categories: Category[]
  activeOrder: ActiveOrder
  waiterId: string
}

export function OrderInterface({
  table,
  menuItems,
  categories,
  activeOrder,
  waiterId,
}: OrderInterfaceProps) {
  const router = useRouter()
  const [cart, setCart] = useState<Map<string, OrderItem>>(new Map())
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "all")
  const [submitting, setSubmitting] = useState(false)

  const filteredMenuItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category.id === activeCategory)

  const addToCart = (menuItem: MenuItem) => {
    const newCart = new Map(cart)
    const existing = newCart.get(menuItem.id)

    if (existing) {
      newCart.set(menuItem.id, {
        ...existing,
        quantity: existing.quantity + 1,
      })
    } else {
      newCart.set(menuItem.id, {
        menuItemId: menuItem.id,
        quantity: 1,
        notes: "",
      })
    }

    setCart(newCart)
  }

  const updateQuantity = (menuItemId: string, delta: number) => {
    const newCart = new Map(cart)
    const item = newCart.get(menuItemId)

    if (item) {
      const newQuantity = item.quantity + delta
      if (newQuantity <= 0) {
        newCart.delete(menuItemId)
      } else {
        newCart.set(menuItemId, { ...item, quantity: newQuantity })
      }
      setCart(newCart)
    }
  }

  const updateNotes = (menuItemId: string, notes: string) => {
    const newCart = new Map(cart)
    const item = newCart.get(menuItemId)

    if (item) {
      newCart.set(menuItemId, { ...item, notes })
      setCart(newCart)
    }
  }

  const removeFromCart = (menuItemId: string) => {
    const newCart = new Map(cart)
    newCart.delete(menuItemId)
    setCart(newCart)
  }

  const calculateTotal = () => {
    let total = 0
    cart.forEach((cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId)
      if (menuItem) {
        total += menuItem.price * cartItem.quantity
      }
    })
    return total
  }

  const submitOrder = async () => {
    if (cart.size === 0) {
      toast.error("Please add items to the cart")
      return
    }

    setSubmitting(true)

    try {
      const orderItems = Array.from(cart.values()).map((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId)!
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
          subtotal: menuItem.price * item.quantity,
          notes: item.notes || null,
        }
      })

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          waiterId,
          orderItems,
        }),
      })

      if (!response.ok) throw new Error("Failed to create order")

      toast.success("Order submitted successfully!")
      setCart(new Map())
      router.push("/waiter")
      router.refresh()
    } catch (error) {
      toast.error("Failed to submit order")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const cartItems = Array.from(cart.entries()).map(([menuItemId, cartItem]) => {
    const menuItem = menuItems.find((m) => m.id === menuItemId)!
    return { ...cartItem, menuItem }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Menu Section */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/waiter">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <CardTitle>Table {table.tableNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Capacity: {table.capacity} guests
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addToCart(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={item.isVeg ? "default" : "secondary"}>
                              {item.isVeg ? "Veg" : "Non-Veg"}
                            </Badge>
                            {item.prepTime && (
                              <span className="text-xs text-muted-foreground">
                                {item.prepTime} min
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${item.price.toFixed(2)}</p>
                          <Button size="sm" className="mt-2">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Current Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No items added yet
              </p>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cartItems.map(({ menuItem, quantity, notes, menuItemId }) => (
                    <div key={menuItemId} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{menuItem.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${menuItem.price.toFixed(2)} each
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(menuItemId)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(menuItemId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(menuItemId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="ml-auto font-semibold">
                          ${(menuItem.price * quantity).toFixed(2)}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Special instructions (e.g., no onions, extra spicy)"
                        value={notes}
                        onChange={(e) => updateNotes(menuItemId, e.target.value)}
                        className="text-sm"
                        rows={2}
                      />
                      <Separator />
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={submitOrder}
                    disabled={submitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Order"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Order Display */}
        {activeOrder && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeOrder.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

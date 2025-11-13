"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Receipt, CreditCard } from "lucide-react"

type OrderItem = {
  id: string
  quantity: number
  price: number
  subtotal: number
  menuItem: {
    name: string
  }
}

type Order = {
  id: string
  orderNumber: string
  totalAmount: number
  discount: number
  finalAmount: number
  status: string
  createdAt: string
  table: {
    tableNumber: number
  }
  waiter: {
    name: string
  }
  orderItems: OrderItem[]
  payment: {
    id: string
    paymentMethod: string
    paymentStatus: string
  } | null
}

interface BillingInterfaceProps {
  orders: Order[]
  cashierId: string
}

export function BillingInterface({ orders: initialOrders, cashierId }: BillingInterfaceProps) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [processing, setProcessing] = useState(false)

  const calculateDiscountedTotal = () => {
    if (!selectedOrder) return 0
    const discount = (selectedOrder.totalAmount * discountPercent) / 100
    return selectedOrder.totalAmount - discount
  }

  const processPayment = async () => {
    if (!selectedOrder) return

    setProcessing(true)

    try {
      const finalAmount = calculateDiscountedTotal()
      const discount = (selectedOrder.totalAmount * discountPercent) / 100

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          amount: finalAmount,
          paymentMethod,
          cashierId,
          discount,
        }),
      })

      if (!response.ok) throw new Error("Payment failed")

      toast.success("Payment processed successfully!")
      setSelectedOrder(null)
      setDiscountPercent(0)
      router.refresh()
    } catch (error) {
      toast.error("Failed to process payment")
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Payment</h1>
        <p className="text-muted-foreground">Process payments for completed orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No orders ready for billing</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedOrder(order)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Table {order.table.tableNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.orderNumber.slice(0, 8)}
                    </p>
                  </div>
                  <Badge
                    variant={order.status === "READY" ? "default" : "secondary"}
                  >
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Items:</span>
                    <span>{order.orderItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Waiter:</span>
                    <span>{order.waiter.name}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${order.finalAmount.toFixed(2)}</span>
                  </div>
                  {order.payment && (
                    <Badge className="w-full justify-center bg-green-600">
                      Paid
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Table {selectedOrder?.table.tableNumber} - Order #
              {selectedOrder?.orderNumber.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Items */}
              <div className="space-y-2">
                <h3 className="font-semibold">Order Items</h3>
                <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total Calculation */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discountPercent}%):</span>
                    <span>
                      -$
                      {(
                        (selectedOrder.totalAmount * discountPercent) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span>${calculateDiscountedTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedOrder(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={processPayment}
                  disabled={processing}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {processing ? "Processing..." : "Process Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

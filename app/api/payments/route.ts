import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "CASHIER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, amount, paymentMethod, cashierId, discount } = body

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        paymentMethod,
        paymentStatus: "COMPLETED",
        cashierId,
        paidAt: new Date(),
      },
    })

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        discount: discount || 0,
        finalAmount: amount,
      },
    })

    // Get the order to update table status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (order) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: "FREE" },
      })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    )
  }
}

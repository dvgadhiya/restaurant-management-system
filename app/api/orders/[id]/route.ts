import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = context.params
    const body = await request.json()
    const { status } = body

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: true,
      },
    })

    // If order is completed, update table status
    if (status === "COMPLETED") {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: "FREE" },
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = context.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        waiter: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

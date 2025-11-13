import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tableId, waiterId, orderItems } = body

    // Calculate totals
    const totalAmount = orderItems.reduce(
      (sum: number, item: { subtotal: number }) => sum + item.subtotal,
      0
    )

    // Create order with items
    const order = await prisma.order.create({
      data: {
        tableId,
        waiterId,
        status: "NEW",
        totalAmount,
        discount: 0,
        finalAmount: totalAmount,
        orderItems: {
          create: orderItems.map((item: {
            menuItemId: string
            quantity: number
            price: number
            subtotal: number
            notes: string | null
          }) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            notes: item.notes,
            status: "PENDING",
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    // Update table status
    await prisma.table.update({
      where: { id: tableId },
      data: { status: "OCCUPIED" },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      include: {
        table: true,
        waiter: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// POST consume stock (for kitchen when preparing orders)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { menuItemId, quantity } = body

    if (!menuItemId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Find inventory item for this menu item
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { menuItemId },
      include: {
        menuItem: true
      }
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: "No inventory tracking for this item" },
        { status: 404 }
      )
    }

    // Calculate new stock level
    const newStock = Math.max(0, inventoryItem.currentStock - parseFloat(quantity))

    // Update inventory
    const updated = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        currentStock: newStock
      },
      include: {
        menuItem: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json({
      ...updated,
      consumed: parseFloat(quantity),
      isLowStock: newStock <= inventoryItem.minStock
    })
  } catch (error) {
    console.error("Error consuming stock:", error)
    return NextResponse.json(
      { error: "Failed to consume stock" },
      { status: 500 }
    )
  }
}

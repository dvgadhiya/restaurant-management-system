import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET single inventory item
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: context.params.id },
      include: {
        category: true
      }
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory item" },
      { status: 500 }
    )
  }
}

// PATCH update inventory item
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, categoryId, currentStock, minStock, unit, costPerUnit } = body

    const updateData: {
      name?: string
      description?: string | null
      categoryId?: string
      currentStock?: number
      minStock?: number
      unit?: string
      costPerUnit?: number | null
    } = {}
    
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description || null
    if (categoryId) updateData.categoryId = categoryId
    if (currentStock !== undefined) updateData.currentStock = parseFloat(currentStock)
    if (minStock !== undefined) updateData.minStock = parseFloat(minStock)
    if (unit) updateData.unit = unit
    if (costPerUnit !== undefined) updateData.costPerUnit = costPerUnit ? parseFloat(costPerUnit) : null

    const inventoryItem = await prisma.inventoryItem.update({
      where: { id: context.params.id },
      data: updateData,
      include: {
        category: true
      }
    })

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    )
  }
}

// DELETE inventory item
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.inventoryItem.delete({
      where: { id: context.params.id }
    })

    return NextResponse.json({ message: "Inventory item deleted" })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    )
  }
}

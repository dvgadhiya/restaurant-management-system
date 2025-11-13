import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET all inventory items
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        category: true
      },
      orderBy: {
        name: "asc"
      }
    })

    return NextResponse.json(inventoryItems)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}

// POST new inventory item
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, categoryId, currentStock, minStock, unit, costPerUnit } = body

    if (!name || !categoryId || currentStock === undefined || minStock === undefined || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        name: name.trim(),
        description: description || null,
        categoryId,
        currentStock: parseFloat(currentStock),
        minStock: parseFloat(minStock),
        unit,
        costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(inventoryItem, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    )
  }
}

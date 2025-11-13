import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET all tables
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: "asc" }
    })

    return NextResponse.json(tables)
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    )
  }
}

// POST create new table
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tableNumber, capacity, shape, positionX, positionY } = body

    if (!tableNumber || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields: tableNumber, capacity" },
        { status: 400 }
      )
    }

    // Check if table number already exists
    const existing = await prisma.table.findUnique({
      where: { tableNumber: parseInt(tableNumber) }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 400 }
      )
    }

    const table = await prisma.table.create({
      data: {
        tableNumber: parseInt(tableNumber),
        capacity: parseInt(capacity),
        shape: shape || "SQUARE",
        positionX: positionX ? parseFloat(positionX) : null,
        positionY: positionY ? parseFloat(positionY) : null,
        status: "FREE"
      }
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error("Error creating table:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create table"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

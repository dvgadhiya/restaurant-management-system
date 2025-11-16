// app/api/tables/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET single table
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: {
              notIn: ["COMPLETED", "CANCELLED"]
            }
          }
        }
      }
    })

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    console.error("Error fetching table:", error)
    return NextResponse.json(
      { error: "Failed to fetch table" },
      { status: 500 }
    )
  }
}

// PATCH update table
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const table = await prisma.table.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(table)
  } catch (error) {
    console.error("Error updating table:", error)
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 })
  }
}

// DELETE table
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Check if table has active orders
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: {
              notIn: ["COMPLETED", "CANCELLED"]
            }
          }
        }
      }
    })

    if (table?.orders && table.orders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete table with active orders" },
        { status: 400 }
      )
    }

    await prisma.table.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting table:", error)
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}
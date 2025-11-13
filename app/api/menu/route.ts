import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET all menu items
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true
      },
      orderBy: {
        name: "asc"
      }
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    )
  }
}

// POST create new menu item
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, categoryId, price, isVeg, isAvailable, prepTime, description } = body

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, categoryId, price" },
        { status: 400 }
      )
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        categoryId,
        price: parseFloat(price),
        isVeg: isVeg ?? true,
        isAvailable: isAvailable ?? true,
        prepTime: prepTime ?? 15,
        description: description || null
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error("Error creating menu item:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create menu item"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

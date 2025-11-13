import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET all categories
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc"
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existing = await prisma.category.findFirst({
      where: { 
        name: name.trim()
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      )
    }

    // Get the highest sort order and add 1
    const lastCategory = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' }
    })

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        sortOrder: lastCategory ? lastCategory.sortOrder + 1 : 0
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create category"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

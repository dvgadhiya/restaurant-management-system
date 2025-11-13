import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = context.params
    const body = await request.json()

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = context.params

    await prisma.menuItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}

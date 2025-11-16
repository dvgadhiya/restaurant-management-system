// ============================================
// app/api/user-requests/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH - Approve or reject user request
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { action, rejectionReason } = body // action: "APPROVE" or "REJECT"

    const userRequest = await prisma.userRequest.findUnique({
      where: { id }
    })

    if (!userRequest) {
      return NextResponse.json(
        { error: "User request not found" },
        { status: 404 }
      )
    }

    if (userRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      )
    }

    if (action === "APPROVE") {
      // Create actual user account
      await prisma.user.create({
        data: {
          email: userRequest.email,
          password: userRequest.password,
          name: userRequest.name,
          role: userRequest.role
        }
      })

      // Update request status
      await prisma.userRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedBy: session.user.id,
          reviewedAt: new Date()
        }
      })

      return NextResponse.json({ message: "User approved and account created" })
    } else if (action === "REJECT") {
      await prisma.userRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason,
          reviewedBy: session.user.id,
          reviewedAt: new Date()
        }
      })

      return NextResponse.json({ message: "User request rejected" })
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error processing user request:", error)
    return NextResponse.json(
      { error: "Failed to process user request" },
      { status: 500 }
    )
  }
}

// DELETE - Remove a user request
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.userRequest.delete({
      where: { id }
    })

    return NextResponse.json({ message: "User request deleted" })
  } catch (error) {
    console.error("Error deleting user request:", error)
    return NextResponse.json(
      { error: "Failed to delete user request" },
      { status: 500 }
    )
  }
}
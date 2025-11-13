import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all pending user requests
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requests = await prisma.userRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching user requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch user requests" },
      { status: 500 }
    )
  }
}

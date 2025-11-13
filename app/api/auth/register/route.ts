import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone, role } = body

    // Validate role (cannot register as MANAGER)
    if (role === "MANAGER") {
      return NextResponse.json(
        { error: "Cannot register as Manager" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Check if request already exists
    const existingRequest = await prisma.userRequest.findUnique({
      where: { email }
    })

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { error: "A registration request with this email is already pending" },
          { status: 400 }
        )
      } else if (existingRequest.status === "APPROVED") {
        return NextResponse.json(
          { error: "This email has already been approved. Please contact the manager." },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user request
    const userRequest = await prisma.userRequest.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role
      }
    })

    return NextResponse.json({
      message: "Registration request submitted successfully",
      requestId: userRequest.id
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to submit registration request" },
      { status: 500 }
    )
  }
}

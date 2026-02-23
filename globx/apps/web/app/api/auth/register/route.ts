import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        authProvider: "email",
        authProviderId: hashedPassword,
        isActive: true,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Surface database connection issues
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("DATABASE_URL") ||
      message.includes("connect") ||
      message.includes("ECONNREFUSED") ||
      message.includes("connection")
    ) {
      return NextResponse.json(
        {
          message: "Database connection failed. Check DATABASE_URL and that PostgreSQL is running.",
          hint: "Verify with GET /api/health/db",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

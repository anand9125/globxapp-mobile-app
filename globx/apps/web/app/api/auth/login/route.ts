import { NextResponse } from "next/server";
import * as jose from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";

/**
 * POST /api/auth/login – credentials login for mobile/native clients.
 * Returns a JWT in the same format as GET /api/auth/token for backend API calls.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailLower = String(email).toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.authProvider !== "email" || !user.authProviderId) {
      return NextResponse.json(
        { message: "Please sign in with the method you used to register (e.g. Google)" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(String(password), user.authProviderId);
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    if (!secret.byteLength) {
      console.error("AUTH_SECRET is not set");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = await new jose.SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

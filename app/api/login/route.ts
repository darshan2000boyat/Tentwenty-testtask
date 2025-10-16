import { NextResponse } from "next/server";
import { setAuthCookie } from "@/utils/cookies";

const users = [
  {
    id: 1,
    name: "Darshan Boyat",
    email: "darshan@example.com",
    password: "123456",
  },
  {
    id: 2,
    name: "Avril Rodrigues",
    email: "avril@example.com",
    password: "password",
  },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse(data: object, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    let body: { email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ message: "Invalid or malformed JSON body" }, 400);
    }

    const { email, password } = body || {};

    if (!email || !password) {
      return jsonResponse({ message: "Email and password are required" }, 400);
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ message: "Invalid email format" }, 400);
    }

    if (password.length < 4) {
      return jsonResponse(
        { message: "Password must be at least 4 characters long" },
        400
      );
    }

    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return jsonResponse({ message: "User not found" }, 404);
    }

    if (user.password !== password) {
      return jsonResponse({ message: "Invalid password" }, 401);
    }

    const token = Buffer.from(
      `${user.id}:${Date.now()}:${Math.random().toString(36).substring(2)}`
    ).toString("base64");

    await setAuthCookie(token);

    return jsonResponse({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return jsonResponse(
      { message: "Internal server error", error: (error as Error).message },
      500
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcrypt";
import * as z from "zod";

// Updated schema to include experience_level, interests, and pace
const userSchema = z.object({
  username: z.string().min(1, "Username is required").max(100),
  email: z.string().min(1, "Email is required ").email("Invalid email"),
  password: z.string().min(8, "Password must have at least 8 characters"),
  
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Parse new fields
    const { email, username, password} = userSchema.parse(body);

    // Check if email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUserByUsername = await db.user.findUnique({
      where: { username },
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        { user: null, message: "User with this username already exists" },
        { status: 410 }
      );
    }

    // Hash password
    const hashPassword = await hash(password, 10);

    // Store user in DB with new fields
    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashPassword,
      },
    });

    // Exclude password from response
    const { password: newUserPassword, ...rest } = newUser;

    return NextResponse.json(
      { user: rest, message: "User created successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Something went wrong while creating user!" },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// MUST be an exact named export: "export async function POST"
export async function POST(req) {
  try {
    const { firstName, lastName, email, company, password } = await req.json();
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use." }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (Role defaults to 'customer')
    const newUser = new User({
      firstName,
      lastName,
      email,
      company,
      password: hashedPassword,
    });

    await newUser.save();
    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "An error occurred", error: error.message }, { status: 500 });
  }
}
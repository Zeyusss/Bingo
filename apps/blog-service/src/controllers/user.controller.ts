import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@packages/libs/prisma"; 

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ state: false, message: "All fields are required" });
    }

    const existingUser = await prisma.userBlog.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ state: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.userBlog.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", 
      },
    });

    return res.status(201).json({
      state: true,
      message: "Registration successful. Please login.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ state: false, message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.userBlog.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ state: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ state: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "24h" }
    );

    return res.json({
      state: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ state: false, message: "Server error" });
  }
};

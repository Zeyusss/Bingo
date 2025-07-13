import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@packages/libs/prisma";

// Admin login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.json({ state: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email, role: "ADMIN" },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "24h" }
    );

    res.json({
      state: true,
      token,
      user: {
        email,
        role: "ADMIN",
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.json({ state: false, message: err });
  }
};

// Admin dashboard
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    const id = req.user?.id;

    const isAdmin = role === "ADMIN";

    const totalBlogs = await prisma.blogPosts.count({
      where: isAdmin ? {} : { authorId: id },
    });

    const totalComments = await prisma.comment.count({
      where: isAdmin
        ? { isApproved: true }
        : {
            isApproved: true,
            blog: { authorId: id },
          },
    });

    const drafts = await prisma.blogPosts.count({
      where: isAdmin
        ? { isPublished: false }
        : { isPublished: false, authorId: id },
    });

    const recentBlogs = await prisma.blogPosts.findMany({
      where: isAdmin ? {} : { authorId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true, email: true } },
      },
    });

    const blogsWithComments = await Promise.all(
      recentBlogs.map(async (blog) => {
        const commentCount = await prisma.comment.count({
          where: {
            blogId: blog.id,
            isApproved: true,
          },
        });
        return {
          ...blog,
          commentCount,
        };
      })
    );

    res.json({
      state: true,
      dashboard: {
        totalBlogs,
        totalComments,
        drafts,
        recentBlogs: blogsWithComments,
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.json({ state: false, message: err });
  }
};

// Get all blogs (admin)
export const getAllBlogsAdmin = async (req: Request, res: Response) => {
  try {
    const { role, id } = req.user!;
    const isAdmin = role === "ADMIN";

    const blogs = await prisma.blogPosts.findMany({
      where: isAdmin ? {} : { authorId: id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, email: true } } },
    });

    const blogsWithComments = await Promise.all(
      blogs.map(async (blog) => {
        const commentCount = await prisma.comment.count({
          where: { blogId: blog.id },
        });
        return {
          ...blog,
          commentCount,
        };
      })
    );

    res.json({ state: true, blogs: blogsWithComments });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.json({ state: false, message: err });
  }
};

// Get all comments
export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: { blog: { select: { title: true } } },
    });

    const formattedComments = comments.map((comment) => ({
      ...comment,
      blogTitle: comment.blog?.title ?? "Deleted Blog",
      userName: comment.name || "Anonymous",
    }));

    res.json({ state: true, comments: formattedComments });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.json({ state: false, message: err });
  }
};

// Delete comment
export const deletCommentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.json({ state: false, message: "Comment ID required" });

    const deleted = await prisma.comment.delete({ where: { id } });

    if (!deleted)
      return res.json({ state: false, message: "Comment not found" });

    res.json({ state: true, message: "Comment deleted successfully" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.json({ state: false, message: err });
  }
};

// Approve comment
export const approveCommentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.json({ state: false, message: "Comment ID required" });

    const updated = await prisma.comment.update({
      where: { id },
      data: { isApproved: true },
    });

    if (!updated)
      return res.json({ state: false, message: "Comment not found" });

    res.json({
      state: true,
      message: "Comment approved successfully",
      comment: updated,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.json({ state: false, message: err });
  }
};

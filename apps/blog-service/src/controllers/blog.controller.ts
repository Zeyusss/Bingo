import { Request, Response } from "express";
import prisma from "@packages/libs/prisma";

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Add a new blog
export const addBlog = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subTitle,
      content,
      description,
      category,
      videoUrl,
      imageUrl,
      isPublished,
      postType,
    } = req.body;

    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ state: false, message: "Title is required" });
    }

    const slug = generateSlug(title);

    const blog = await prisma.blogPosts.create({
      data: {
        title,
        subTitle,
        slug,
        content,
        description,
        imageUrl,
        videoUrl,
        postType,
        category,
        isPublished,
        author: { connect: { id: req.user!.id } },
      },
    });

    res.json({ state: true, message: "Blog created successfully", blog });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};

// Get all published blogs
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await prisma.blogPosts.findMany({
      where: { isPublished: true },
      include: {
        author: true,
        _count: { select: { comments: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.blogPosts.count({
      where: { isPublished: true },
    });

    res.json({
      state: true,
      blogs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};

// Get blog by slug
export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blogPosts.findUnique({
      where: { slug },
      include: {
        author: true,
        comments: { where: { isApproved: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!blog)
      return res.status(404).json({ state: false, message: "Blog not found" });

    res.json({ state: true, blog });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};

// Update blog
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const {
      title,
      subTitle,
      content,
      description,
      category,
      imageUrl,
      videoUrl,
      postType,
      isPublished,
    } = req.body;

    const updated = await prisma.blogPosts.update({
      where: { id: blogId },
      data: {
        title,
        subTitle,
        content,
        description,
        category,
        imageUrl,
        videoUrl,
        postType,
        isPublished,
      },
    });

    res.json({ state: true, blog: updated });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};

// Delete blog and its comments
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;

    await prisma.comment.deleteMany({ where: { blogId } });
    await prisma.blogPosts.delete({ where: { id: blogId } });

    res.json({ state: true, message: "Blog deleted" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};

// Toggle publish
export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;

    const blog = await prisma.blogPosts.findUnique({ where: { id: blogId } });
    if (!blog)
      return res.status(404).json({ state: false, message: "Blog not found" });

    const updated = await prisma.blogPosts.update({
      where: { id: blogId },
      data: { isPublished: !blog.isPublished },
    });

    res.json({ state: true, blog: updated });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};

// Add comment
export const addComment = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const { name, content } = req.body;
    const userId = req.user?.id ?? null;

    if (!name || !content) {
      return res
        .status(400)
        .json({ state: false, message: "Name and content are required" });
    }

    const comment = await prisma.comment.create({
      data: {
        blogId,
        name,
        content,
        userId, 
        isApproved: false,
      },
    });

    res.json({
      state: true,
      message: "Comment submitted and awaiting admin approval.",
      comment,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};




// Get comments for a blog
export const getBlogComments = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { blogId, isApproved: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ state: true, comments });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};


// Toggle like
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ state: false, message: "Unauthorized" });
    }

    const blog = await prisma.blogPosts.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return res.status(404).json({ state: false, message: "Blog not found" });
    }

    const liked = blog.likes.includes(userId);
    const updatedLikes = liked
      ? blog.likes.filter((id) => id !== userId)
      : [...blog.likes, userId];

    const updatedBlog = await prisma.blogPosts.update({
      where: { id: blogId },
      data: { likes: updatedLikes },
    });

    res.json({ state: true, likes: updatedBlog.likes });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ state: false, message: err });
  }
};


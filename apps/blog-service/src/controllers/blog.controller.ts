import { Request as ExpressRequest, Response, NextFunction } from "express";
import { BlogStatus, users, sellers, UserRole } from "@prisma/client";
import { BusinessEventLogger } from "@packages/middleware/logging.middleware";
import {
  AuthError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "@packages/error-handler"; 
import prisma from "@packages/libs/prisma";
import { imagekit } from "@packages/libs/imagekit";


type SellerRole = "SELLER";
interface AuthRequest extends ExpressRequest {
  user?: users;
  seller?: sellers;
  role?: UserRole | SellerRole;
  logger?: BusinessEventLogger;
  requestId?: string;
}

// --- SELLER ACTIONS ---
export const createBlog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const { title, content, coverImage } = req.body;

    if (!sellerId) {
      throw new AuthError("Unauthorized: Not a seller");
    }
    if (!title || !content) {
      throw new BadRequestError("Title and content are required");
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        coverImage,
        status: BlogStatus.Pending,
        author: { connect: { id: sellerId } },
      },
    });

    await req.logger?.logUserAction("Created blog", sellerId, {
      blogId: blog.id,
      title,
    });

    return res.status(201).json({
      state: true,
      message: "Blog created and is pending review.",
      data: blog,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateBlog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const { blogId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(blogId)) {
      return res.status(400).json({ status: "error", message: "Invalid blogId format" });
    }

    const { title, content, coverImage } = req.body;

    if (!sellerId) {
      throw new AuthError("Unauthorized: Not a seller");
    }

    const blog = await prisma.blog.findFirst({
      where: { id: blogId, authorId: sellerId, isDeleted: false },
    });
    if (!blog) {
      throw new NotFoundError("Blog not found or permission denied");
    }
    if (blog.status !== BlogStatus.Accepted) {
      throw new ForbiddenError("Only Accepted blogs can be updated");
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: { title, content, coverImage, status: BlogStatus.Pending },
    });

    await req.logger?.logUserAction("Updated blog", sellerId, {
      blogId: updatedBlog.id,
    });

    return res.json({
      state: true,
      message: "Blog updated and resubmitted for review.",
      data: updatedBlog,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteBlog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const { blogId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(blogId)) {
      return res.status(400).json({ status: "error", message: "Invalid blogId format" });
    }

    if (!sellerId) {
      throw new AuthError("Unauthorized: Not a seller");
    }

    const blog = await prisma.blog.findFirst({
      where: { id: blogId, authorId: sellerId, isDeleted: false },
    });
    if (!blog) {
      throw new NotFoundError("Blog not found or permission denied.");
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await req.logger?.logUserAction("Deleted blog", sellerId, { blogId });

    return res.json({ state: true, message: "Blog deleted successfully." });
  } catch (error) {
     return next(error);
  }
};

export const getMyBlogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("reqqqqqqqqqqqqqqqqqqqqqq", req);
    const sellerId = req.seller?.id;
    console.log("sellerrrr", sellerId);
    if (!sellerId) {
      throw new AuthError("Unauthorized: Not a seller");
    }

    const blogs = await prisma.blog.findMany({
      where: { authorId: sellerId, isDeleted: false },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ state: true, data: blogs });
  } catch (error) {
     return next(error);
  }
};

// --- ADMIN ACTIONS ---

export const getAllBlogsForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.role !== UserRole.admin) {
      throw new ForbiddenError("Access denied");
    }

    const { status } = req.query;
    const where: any = { isDeleted: false };
    if (status && Object.values(BlogStatus).includes(status as BlogStatus)) {
      where.status = status;
    }

    const blogs = await prisma.blog.findMany({
      where,
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ state: true, data: blogs });
  } catch (error) {
     return next(error);
  }
};

export const publishBlog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.role !== UserRole.admin) {
      throw new ForbiddenError("Access denied");
    }

    const { blogId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(blogId)) {
      return res.status(400).json({ status: "error", message: "Invalid blogId format" });
    }

    const adminId = req.user?.id;

    if (!adminId) {
      throw new AuthError("Unauthorized: Admin ID not found");
    }

    const blog = await prisma.blog.findFirst({
      where: { id: blogId, status: BlogStatus.Pending, isDeleted: false },
    });
    if (!blog) {
      throw new NotFoundError("Pending blog not found.");
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: {
        status: BlogStatus.Accepted,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    await req.logger?.logUserAction("Published blog", adminId, { blogId });

    return res.json({ state: true, message: "Blog published successfully." });
  } catch (error) {
     return next(error);
  }
};

export const rejectBlog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.role !== UserRole.admin) {
      throw new ForbiddenError("Access denied");
    }

    const { blogId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(blogId)) {
      return res.status(400).json({ status: "error", message: "Invalid blogId format" });
    }

    const adminId = req.user?.id;

    if (!adminId) {
      throw new AuthError("Unauthorized: Admin ID not found");
    }

    const blog = await prisma.blog.findFirst({
      where: { id: blogId, status: BlogStatus.Pending, isDeleted: false },
    });
    if (!blog) {
      throw new NotFoundError("Pending blog not found.");
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: {
        status: BlogStatus.Rejected,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    await req.logger?.logUserAction("Rejected blog", adminId, { blogId });

    return res.json({ state: true, message: "Blog rejected successfully." });
  } catch (error) {
     return next(error);
  }
};

// --- USER ACTIONS ---
export const updateComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(commentId)) {
      return res.status(400).json({ status: "error", message: "Invalid commentId format" });
    }

    const { content } = req.body;

    if (!userId) throw new AuthError("Unauthorized: Not a user");
    if (!content) throw new BadRequestError("Content is required");


    const comment = await prisma.blogComment.findFirst({
      where: {
        id: commentId,
        userId,
        isDeleted: false,
      },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found or permission denied");
    }

  
    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    await req.logger?.logUserAction("Updated comment", userId, {
      commentId: updatedComment.id,
      blogId: updatedComment.blogId,
    });

    return res.json({
      success: true,
      message: "Comment updated.",
      data: updatedComment,
    });
  } catch (error) {
     return next(error);
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(commentId)) {
      return res.status(400).json({ status: "error", message: "Invalid commentId format" });
    }

    if (!userId) throw new AuthError("Unauthorized: Not a user");

  
    const comment = await prisma.blogComment.findFirst({
      where: {
        id: commentId,
        userId,
        isDeleted: false,
      },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found or permission denied");
    }


    await prisma.blogComment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await req.logger?.logUserAction("Deleted comment", userId, {
      commentId,
      blogId: comment.blogId,
    });

    return res.json({
      success: true,
      message: "Comment deleted.",
    });
  } catch (error) {
     return next(error);
  }
};
const formatBlogResponse = (blog: any) => ({
  ...blog,
  likesCount: blog.likes?.length || 0,
  commentsCount: blog.comments?.length || 0,
});

export const getAllPublishedBlogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        status: BlogStatus.Accepted,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            shop: {
              select: {
                avatar: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          where: { isDeleted: false },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 3, 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: blogs.map(formatBlogResponse),
    });
  } catch (error) {
     return next(error);
  }
};

export const getBlogById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blogId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(blogId)) {
      return res.status(400).json({ status: "error", message: "Invalid blogId format" });
    }

    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        status: BlogStatus.Accepted,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            shop: {
              select: {
                avatar: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          where: { isDeleted: false },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!blog) throw new NotFoundError("Blog not found.");

    return res.json({
      success: true,
      data: formatBlogResponse(blog),
    });
  } catch (error) {
     return next(error);
  }
};

export const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { blogId } = req.params;
    const { content } = req.body;

    if (!userId) throw new AuthError("Unauthorized: Not a user");
    if (!content) throw new BadRequestError("Content is required");

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });
    if (!blog) throw new NotFoundError("Blog not found.");

    const comment = await prisma.blogComment.create({
      data: {
        content,
        blog: { connect: { id: blogId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    await req.logger?.logUserAction("Commented on blog", userId, {
      blogId,
      commentId: comment.id,
    });

    return res.status(201).json({
      success: true,
      message: "Comment added.",
      data: comment,
    });
  } catch (error) {
     return next(error);
  }
};

export const toggleLike = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { blogId } = req.params;

    if (!userId) throw new AuthError("Unauthorized: Not a user");

    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundError("Blog not found.");

    const existingLike = await prisma.blogLike.findUnique({
      where: { blogId_userId: { blogId, userId } },
    });

    if (existingLike) {
      await prisma.blogLike.delete({ where: { id: existingLike.id } });
      await req.logger?.logUserAction("Unliked blog", userId, { blogId });
      return res.json({
        success: true,
        message: "Blog unliked.",
        liked: false,
      });
    }

    await prisma.blogLike.create({
      data: {
        blog: { connect: { id: blogId } },
        user: { connect: { id: userId } },
      },
    });

    await req.logger?.logUserAction("Liked blog", userId, { blogId });

    return res.status(201).json({
      success: true,
      message: "Blog liked.",
      liked: true,
    });
  } catch (error) {
     return next(error);
  }
};

export const reportComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;
    const { reason, description } = req.body;

    if (!userId) throw new AuthError("Unauthorized: Not a user");
    if (!reason) throw new BadRequestError("Reason is required");

    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId, isDeleted: false },
    });
    if (!comment) throw new NotFoundError("Comment not found");

   
    const existingReport = await prisma.blogCommentReport.findUnique({
      where: { commentId_reporterId: { commentId, reporterId: userId } },
    });
    if (existingReport) {
      throw new BadRequestError("You have already reported this comment");
    }

    const report = await prisma.blogCommentReport.create({
      data: {
        commentId,
        reporterId: userId,
        reason,
        description,
      },
    });

    await req.logger?.logUserAction("Reported comment", userId, {
      commentId,
      reportId: report.id,
    });

    return res.status(201).json({
      success: true,
      message: "Comment reported successfully",
      data: report,
    });
  } catch (error) {
     return next(error);
  }
};

// Admin functions for managing reports
export const getCommentReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.role !== UserRole.admin) {
      throw new ForbiddenError("Access denied");
    }

    const { status } = req.query;
    const where: any = {};
    if (status && ["PENDING", "REVIEWED", "DISMISSED"].includes(status as string)) {
      where.status = status;
    }

    const reports = await prisma.blogCommentReport.findMany({
      where,
      include: {
        comment: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            blog: {
              select: { id: true, title: true },
            },
          },
        },
        reporter: {
          select: { id: true, name: true, email: true },
        },
        reviewer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
     return next(error);
  }
};

export const reviewCommentReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.role !== UserRole.admin) {
      throw new ForbiddenError("Access denied");
    }

    const { reportId } = req.params;
    const { action, deleteComment } = req.body; 
    const adminId = req.user?.id;

    if (!adminId) throw new AuthError("Unauthorized: Admin ID not found");
    if (!["REVIEWED", "DISMISSED"].includes(action)) {
      throw new BadRequestError("Invalid action");
    }

    const report = await prisma.blogCommentReport.findUnique({
      where: { id: reportId },
      include: { comment: true },
    });
    if (!report) throw new NotFoundError("Report not found");

    
    await prisma.blogCommentReport.update({
      where: { id: reportId },
      data: {
        status: action,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    
    if (deleteComment && action === "REVIEWED") {
      await prisma.blogComment.update({
        where: { id: report.commentId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }

    await req.logger?.logUserAction(
      `${action.toLowerCase()} comment report`,
      adminId,
      { reportId, commentId: report.commentId, deleteComment }
    );

    return res.json({
      success: true,
      message: `Report ${action.toLowerCase()} successfully`,
    });
  } catch (error) {
     return next(error);
  }
};

// Upload image to ImageKit
export const uploadBlogImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file, fileName, folder } = req.body;

    if (!file || !fileName || !folder) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const uploadResponse = await imagekit.upload({
      file,
      fileName,
      folder,
    });

    return res.status(201).json({
      success: true,
      fileId: uploadResponse.fileId,
      url: uploadResponse.url,
    });
  } catch (error) {
    console.error("Image Upload Failed:", error);
    return next(error);
  }
};

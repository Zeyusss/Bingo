import { Router } from "express";
import {
  
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,

  getAllBlogsForAdmin,
  publishBlog,
  rejectBlog,

 
  getAllPublishedBlogs,
  getBlogById,
  addComment,
  toggleLike,
  updateComment,
  deleteComment,
  reportComment,
  getCommentReports,
  reviewCommentReport,
  uploadBlogImage,
} from "../controllers/blog.controller"; 

import { isSeller, isAdmin, isUser } from "@packages/middleware/authorizeRoles";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router = Router();

// ==================== PUBLIC ROUTES ====================
router.get("/", getAllPublishedBlogs);

// ==================== AUTHENTICATED USER ROUTES ====================
router.post("/:blogId/comments", isAuthenticated, isUser, addComment);
router.post("/:blogId/likes", isAuthenticated, isUser, toggleLike);

// New comment management routes
router.put("/comments/:commentId", isAuthenticated, isUser, updateComment);
router.delete("/comments/:commentId", isAuthenticated, isUser, deleteComment);
router.post("/comments/:commentId/report", isAuthenticated, isUser, reportComment);

// ==================== SELLER ROUTES ====================
router.get("/my-blogs", isAuthenticated, isSeller, getMyBlogs);

// Create a new blog post
router.post("/", isAuthenticated, isSeller, createBlog);

// Update a specific blog post by ID
router.put("/:blogId", isAuthenticated, isSeller, updateBlog);

// Delete a specific blog post by ID
router.delete("/:blogId", isAuthenticated, isSeller, deleteBlog);

// ==================== ADMIN ROUTES ====================
// Get all blogs with optional status filter
router.get("/admin/all", isAuthenticated, isAdmin, getAllBlogsForAdmin);

// Publish a pending blog post
router.put("/admin/:blogId/publish", isAuthenticated, isAdmin, publishBlog);

// Reject a pending blog post
router.put("/admin/:blogId/reject", isAuthenticated, isAdmin, rejectBlog);

// Comment report management routes
router.get("/admin/reports", isAuthenticated, isAdmin, getCommentReports);
router.put("/admin/reports/:reportId/review", isAuthenticated, isAdmin, reviewCommentReport);

// Image upload route
router.post("/upload-image", isAuthenticated, uploadBlogImage);

// public should be at the end i dont know why :)
router.get("/:blogId", getBlogById);
export default router;

import { Router } from "express";
import {
  addBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  togglePublish,
  addComment,
  getBlogComments,
  toggleLike,
} from "../controllers/blog.controller";
import blog_Authenticated from "../middleware/blog_Authenticated";

const router = Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.get("/:blogId/comments", getBlogComments);

// Authenticated routes
router.post("/", blog_Authenticated, addBlog);
router.put("/:blogId", blog_Authenticated, updateBlog);
router.delete("/:blogId", blog_Authenticated, deleteBlog);
router.patch("/:blogId/publish", blog_Authenticated, togglePublish);
router.post("/:blogId/comments", blog_Authenticated, addComment);
router.patch("/:blogId/like", blog_Authenticated, toggleLike);

export default router;

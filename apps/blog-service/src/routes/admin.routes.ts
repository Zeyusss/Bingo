import { Router } from "express";
import {
  adminLogin,
  getDashboard,
  getAllBlogsAdmin,
  getAllComments,
  deletCommentById,
  approveCommentById,
} from "../controllers/admin.controller";
import blog_Authenticated from "../middleware/blog_Authenticated";

const router = Router();

// Public
router.post("/login", adminLogin);

// Protected - Admin only
router.get("/dashboard", blog_Authenticated, getDashboard);
router.get("/blogs", blog_Authenticated, getAllBlogsAdmin);
router.get("/comments", blog_Authenticated, getAllComments);
router.delete("/comments", blog_Authenticated, deletCommentById);
router.patch("/comments/approve", blog_Authenticated, approveCommentById);

export default router;

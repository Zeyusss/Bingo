import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import {
  createPaymentIntent,
  createPaymentSession,
  verifyingPaymentSession,
  createOrder,
  getSellerOrders,
  getOrderDetails,
  updateDeliveryStatus,
  verifyCouponCode,
  getUserOrders,
  getRecentOrders,
  getAdminOrders,
  getSellerAbandonmentAnalytics,
  getAdminAbandonmentAnalytics,
} from "../controllers/order.controller";
import { isAdmin, isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verify-payment-session", isAuthenticated, verifyingPaymentSession);
router.post("/webhook", createOrder);

router.get("/get-seller-orders", isAuthenticated, isSeller, getSellerOrders);
router.get("/get-order-details/:id", isAuthenticated, getOrderDetails);
router.put(
  "/update-status/:orderId",
  isAuthenticated,
  isSeller,
  updateDeliveryStatus
);
router.put("/verify-coupon", isAuthenticated, verifyCouponCode);
router.get("/get-user-orders", isAuthenticated, getUserOrders);
router.get("/get-recent-orders", isAuthenticated, isAdmin, getRecentOrders);
router.get ("/get-admin-orders",isAuthenticated,isAdmin,getAdminOrders)
router.get("/analytics/seller-abandonment", isAuthenticated, isSeller, getSellerAbandonmentAnalytics);
router.get("/analytics/admin-abandonment", isAuthenticated, isAdmin, getAdminAbandonmentAnalytics);
export default router;

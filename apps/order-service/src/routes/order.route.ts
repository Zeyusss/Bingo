import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import {
  createPaymentIntent,
  createPaymentSession,
  verifyingPaymentSession,
  createOrder,
  getSellerOrders,
  getOrderDetails,
  updateDeliveryStatus
} from "../controllers/order.controller";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();


router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verify-payment-session", isAuthenticated, verifyingPaymentSession);
router.post("/webhook", createOrder);

router.get("/get-seller-orders",isAuthenticated,isSeller,getSellerOrders)
router.get("/get-order-details/:id",isAuthenticated,getOrderDetails)
router.put("/update-status/:orderId",isAuthenticated,updateDeliveryStatus,isSeller)
export default router;
import express, { Router } from 'express';
import { createShop, createStripeConnectLink, getSeller, getUser, loginSeller, refreshToken, registerSeller, userForgetPassword, userLogin, userRegistration,userResetPassword,verifySeller,verifyUserForgetPasswordOtp,verifyUserRegistrationOtp } from '../controller/auth.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/authorizeRoles';


const router:Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUserRegistrationOtp);
router.post("/login-user", userLogin);
router.post("/refresh-token-user",refreshToken);
router.get("/logged-in-user",isAuthenticated,getUser);
router.post("/forget-password-user", userForgetPassword);
router.post("/reset-password-user", userResetPassword);
router.post("/verify-password-user", verifyUserForgetPasswordOtp);
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link",createStripeConnectLink)
router.post("/login-seller",loginSeller)
router.post("/logged-in-seller",isAuthenticated,isSeller,getSeller)

export default router;
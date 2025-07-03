import express, { Router } from 'express';
import { getUser, refreshToken, userForgetPassword, userLogin, userRegistration,userResetPassword,verifyUserForgetPasswordOtp,verifyUserRegistrationOtp } from '../controller/auth.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';


const router:Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUserRegistrationOtp);
router.post("/login-user", userLogin);
router.post("/refresh-token-user",refreshToken);
router.get("/logged-in-user",isAuthenticated,getUser);
router.post("/forget-password-user", userForgetPassword);
router.post("/reset-password-user", userResetPassword);
router.post("/verify-password-user", verifyUserForgetPasswordOtp);

export default router;
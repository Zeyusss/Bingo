import express, { Router } from 'express';
import { addUserAddress, createShop, createStripeConnectLink, deleteUserAddress, editUserAddress, getSeller, getUser, getUserAddresses, loginSeller, refreshToken, registerSeller, setDefaultUserAddress, userForgetPassword, userLogin, userRegistration,userResetPassword,verifySeller,verifyUserForgetPasswordOtp,verifyUserRegistrationOtp } from '../controller/auth.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/authorizeRoles';


const router:Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUserRegistrationOtp);
router.post("/login-user", userLogin);
router.post("/refresh-token",refreshToken);
router.get("/logged-in-user",isAuthenticated,getUser);
router.post("/forget-password-user", userForgetPassword);
router.post("/reset-password-user", userResetPassword);
router.post("/verify-password-user", verifyUserForgetPasswordOtp);
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link",createStripeConnectLink)
router.post("/login-seller",loginSeller)
router.get("/logged-in-seller",isAuthenticated,isSeller,getSeller)

router.get("/shipping-addresses",isAuthenticated,getUserAddresses)
router.post("/add-address",isAuthenticated,addUserAddress)
router.delete("/delete-address/:addressId",isAuthenticated,deleteUserAddress)
router.put("/set-default-address/:addressId",isAuthenticated,setDefaultUserAddress)
router.put("/edit-address/:addressId",isAuthenticated,editUserAddress)


export default router;
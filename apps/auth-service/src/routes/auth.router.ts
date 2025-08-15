import express, { Router } from 'express';
import {
  addUserAddress,
  createShop,
  createStripeConnectLink,
  deleteUserAddress,
  editUserAddress,
  getSeller,
  getUser,
  getUserAddresses,
  loginSeller,
  refreshToken,
  registerSeller,
  sellerForgetPassword,
  sellerResetPassword,
  setDefaultUserAddress,
  updateUserPassword,
  userForgetPassword,
  userLogin,
  userRegistration,
  userResetPassword,
  verifySeller,
  verifySellerForgetPasswordOtp,
  verifyUserForgetPasswordOtp,
  verifyUserRegistrationOtp,
  loginAdmin,
  getLoggedInAdmin,
  logoutUser,
  logoutSeller,
  uploadUserImage,
  getProfilePictureEligibility,
  updateUserProfilePicture,
  updateUserProfilePhone,
  updateUserProfile,
  followShop,
  unfollowShop,
  getUserFollowedShops,
} from '../controller/auth.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/authorizeRoles';


const router: Router = express.Router();

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
router.post("/forget-password-seller", sellerForgetPassword);
router.post("/verify-password-seller", verifySellerForgetPasswordOtp);
router.post("/reset-password-seller", sellerResetPassword);
router.get("/shipping-addresses",isAuthenticated,getUserAddresses)
router.post("/add-address",isAuthenticated,addUserAddress)
router.delete("/delete-address/:addressId",isAuthenticated,deleteUserAddress)
router.put("/set-default-address/:addressId",isAuthenticated,setDefaultUserAddress)
router.put("/edit-address/:addressId",isAuthenticated,editUserAddress)
router.post("/change-password",isAuthenticated,updateUserPassword)
router.post("/login-admin", loginAdmin);
router.get("/logged-in-admin", isAuthenticated, getLoggedInAdmin);
router.get("/logout-user", logoutUser);
router.get("/logout-seller", logoutSeller);
router.post("/upload-user-image", isAuthenticated, uploadUserImage);
router.get("/profile-picture-eligibility", isAuthenticated, getProfilePictureEligibility);
router.put("/update-profile-picture", isAuthenticated, updateUserProfilePicture);
router.put("/update-profile-phone", isAuthenticated, updateUserProfilePhone);
router.put("/update-user-profile", isAuthenticated, updateUserProfile);
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop);
router.get("/user-followed-shops", isAuthenticated, getUserFollowedShops);
export default router;
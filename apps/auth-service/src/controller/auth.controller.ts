import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler/index";
import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  handleForgetPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgetPasswordOtp,
  verifyUserRegistrationOtp as verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";
import { createLogger } from "@packages/utils/logs/structured-logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});


const logger = createLogger('auth-service');

// Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const requestLogger = logger.forRequest(requestId, undefined, {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  try {
    const { email, name, phone } = req.body;
    
    await requestLogger.info('User registration attempt started', {
      metadata: { email, name, phone, registrationType: 'user' }
    });

    validateRegistrationData(req.body, "user");
    
    const startTime = Date.now();
    const existiongUser = await prisma.users.findUnique({
      where: { email },
    });
    const dbQueryTime = Date.now() - startTime;
    
    await requestLogger.dbQuery('SELECT * FROM users WHERE email = ?', dbQueryTime, {
      metadata: { operation: 'check_existing_user' }
    });

    if (existiongUser) {
      await requestLogger.warning('User registration failed: Email already exists', {
        metadata: { email, reason: 'duplicate_email' }
      });
      return next(new ValidationError("User already exists with this email"));
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    
    const otpStartTime = Date.now();
    await sendOtp(email, name, "user-activation-mail");
    const otpDuration = Date.now() - otpStartTime;
    
    await requestLogger.externalApiCall('email-service', '/send-otp', otpDuration, 200, {
      metadata: { email, otpType: 'user-activation-mail' }
    });
    
    await requestLogger.success('User registration OTP sent successfully', {
      metadata: { email, name }
    });

    return res.status(200).json({
      status: "success",
      message: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error: any) {
    await requestLogger.error(`User registration failed: ${error.message}`, {
      metadata: { 
        error: error.name,
        stack: error.stack,
        email: req.body?.email
      }
    });
    return next(error);
  }
};

// Verify OTP for user registration
export const verifyUserRegistrationOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone } = req.body;
    if (!email || !otp || !password || !name || !phone) {
      return next(
        new ValidationError("Email, OTP, password, name, and phone are required")
      );
    }
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (user) {
      return next(new ValidationError("User already exists with this email"));
    }

    await verifyOtp(email, otp);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "User registration successful",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

// login user
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const requestLogger = logger.forRequest(requestId, undefined, {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  try {
    const { email, password } = req.body;
    
    await requestLogger.info('User login attempt started', {
      metadata: { email, loginType: 'user' }
    });

    if (!email || !password) {
      await requestLogger.warning('Login failed: Missing credentials', {
        metadata: { reason: 'missing_credentials', hasEmail: !!email, hasPassword: !!password }
      });
      return next(new ValidationError("Email and password are required"));
    }

    const dbStartTime = Date.now();
    const user = await prisma.users.findUnique({
      where: { email },
    });
    const dbQueryTime = Date.now() - dbStartTime;
    
    await requestLogger.dbQuery('SELECT * FROM users WHERE email = ?', dbQueryTime, {
      metadata: { operation: 'user_lookup' }
    });

    if (!user) {
      await requestLogger.authFailure('User not found', {
        metadata: { email, reason: 'user_not_found' }
      });
      return next(new AuthError("User not found"));
    }

    if (user.isBlocked || user.isDeleted) {
      await requestLogger.securityEvent(
        `Login attempt on restricted account: ${user.isBlocked ? 'blocked' : 'deleted'}`,
        'medium',
        {
          userId: user.id,
          metadata: { email, isBlocked: user.isBlocked, isDeleted: user.isDeleted }
        }
      );
      return res.status(403).json({
        message:
          "Your account is currently restricted. Please contact support or the site administration for assistance.",
        restricted: true,
      });
    }

    const passwordCheckStart = Date.now();
    const isMatch = await bcrypt.compare(password, user.password!);
    const passwordCheckTime = Date.now() - passwordCheckStart;
    
    await requestLogger.performanceMetric('password_check_duration', passwordCheckTime, 'ms');

    if (!isMatch) {
      await requestLogger.authFailure('Invalid password', {
        userId: user.id,
        metadata: { email, reason: 'invalid_password' }
      });
      return next(new AuthError("Invalid email or password"));
    }

    // Clear existing cookies for security
    await requestLogger.debug('Clearing existing authentication cookies');
    res.clearCookie("access_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-access-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-refresh-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    const tokenStartTime = Date.now();
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
    const tokenGenerationTime = Date.now() - tokenStartTime;
    
    await requestLogger.performanceMetric('token_generation_duration', tokenGenerationTime, 'ms', {
      userId: user.id
    });

    setCookie(res, "access_Token", accessToken);
    setCookie(res, "refresh_Token", refreshToken);

    await requestLogger.authSuccess(user.id, {
      metadata: { 
        email,
        loginMethod: 'email_password',
        tokenExpiry: '15m',
        refreshTokenExpiry: '7d'
      }
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    await requestLogger.error(`User login failed: ${error.message}`, {
      metadata: { 
        error: error.name,
        stack: error.stack,
        email: req.body?.email
      }
    });
    return next(error);
  }
};

// refresh token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] ||
      req.cookies["seller-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];
    if (!refreshToken) {
      return next(
        new ValidationError("Unauthorized! No refresh token provided")
      );
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };
    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError("Invalid refresh token");
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ 
        where: { id: decoded.id },
        include: {
          avatar: {
            select: {
              id: true,
              url: true
            }
          }
        }
      });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { 
          shop: {
            include: {
              avatar: {
                select: {
                  id: true,
                  url: true
                }
              }
            }
          }
        },
      });
    }

    if (!account) {
      return new AuthError("Forbidden ! User/Seller not found");
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    if (decoded.role === "user") {
      setCookie(res, "access_Token", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller-access-token", newAccessToken);
    }

    req.role = decoded.role;
    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//get logged in user info
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: {
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// user forget password
export const userForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgetPassword(req, res, next, "user");
};

// verify user forget password OTP
export const verifyUserForgetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgetPasswordOtp(req, res, next);
};

// reset user password
export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required"));
    }
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      return next(new ValidationError("User not found"));
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the old password"
        )
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { email, name } = req.body;
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError("Seller already exists with this email"));
    }
    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(email, name, "seller-activation-mail");
    return res.status(200).json({
      status: "success",
      message: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    return next(error);
  }
};

// verify seller registration OTP
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(
        new ValidationError(
          "Email, OTP, password, name, phone number and country are required"
        )
      );
    }
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError("Seller already exists with this email"));
    }
    await verifyOtp(email, otp);
    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: { name, email, phone_number, country, password: hashedPassword },
    });
    return res.status(200).json({
      status: "success",
      message: "Seller registered successfully",
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// create a new shop for seller
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;
    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(new ValidationError("All fields are required"));
    }
    const categoryArray = Array.isArray(category) ? category : [category];
    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category: categoryArray,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });
    return res.status(201).json({
      status: "success",
      message: "Shop created successfully",
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

// create stripe connect account link for seller
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }


    const account = await stripe.accounts.create({
      type: "standard",
      email: seller?.email,
      country: "AE",
      capabilities: {
        card_payments: { requested: true },
        transfers: {
          requested: true,
        },
      },
    });

    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: "account_onboarding",
    });

    return res.status(200).json({
      status: "success",
      message: "Stripe connect link created successfully",
      url: accountLink.url,
    });
  } catch (error) {
    return next(error);
  }
};

// login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }
    if (seller.isBlocked || seller.isDeleted) {
      return res.status(403).json({
        message:
          "Your account is currently restricted. Please contact support or the site administration for assistance.",
        restricted: true,
      });
    }
    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch) {
      return next(new ValidationError("Invalid email or password"));
    }
    res.clearCookie("access_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-access-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-refresh-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
    setCookie(res, "seller-access-token", accessToken);
    setCookie(res, "seller-refresh-token", refreshToken);
    res.status(200).json({
      message: "Login Successful!",
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    return next(error);
  }
};

// get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    
    let followersCount = 0;
    if (seller.shop?.id) {
      followersCount = await prisma.followers.count({
        where: {
          shopId: seller.shop.id,
        },
      });
    }
    
    const formattedSeller = {
      ...seller,
      followers: followersCount,
      shop: seller.shop ? {
        ...seller.shop,
        avatar: seller.shop.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756",
        coverBanner: seller.shop.coverBanner || "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149",
      } : null,
    };
    
    return res.status(201).json({
      success: true,
      seller: formattedSeller,
    });
  } catch (error) {
    return next(error);
  }
};

// add new address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { label, name, phone, street, city, state, zip, country, isDefault } =
      req.body;
    if (!label || !name || !street || !city || !state || !zip || !country) {
      return next(new ValidationError("All fields are required"));
    }
    const count = await prisma.address.count({ where: { userId } });
    if (count >= 3) {
      return next(new ValidationError("You can only have up to 3 addresses."));
    }
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }
    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        phone,
        street,
        city,
        zip,
        country,
        isDefault: !!isDefault,
      },
    });
    res.status(200).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

// edit user address
export const editUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    const { label, name, phone, street, city, zip, country, isDefault } = req.body;

    if (!userId) return next(new ValidationError("User not authenticated"));
    if (!addressId) return next(new ValidationError("Address ID is required"));
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address)
      return next(new NotFoundError("Address not found or unauthorized"));

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        label,
        name,
        phone,
        street,
        city,
        zip,
        country,
        isDefault: !!isDefault,
      },
    });

    res.status(200).json({ success: true, address: updated });
  } catch (error) {
    return next(error);
  }
};

// delete user address
export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });
    if (!existingAddress) {
      return next(new NotFoundError("Address not found or unauthorized"));
    }
    await prisma.address.delete({
      where: { id: addressId },
    });
    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// get user addresses
export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ValidationError("User not authenticated"));
    }
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    return next(error);
  }
};

// set default user address
export const setDefaultUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    if (!userId) {
      return next(new ValidationError("User not authenticated"));
    }
    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      return next(new NotFoundError("Address not found or unauthorized"));
    }
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
    res.status(200).json({
      success: true,
      message: "Default address set successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// seller forget password
export const sellerForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgetPassword(req, res, next, "seller");
};

// verify seller forget password OTP
export const verifySellerForgetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgetPasswordOtp(req, res, next);
};

// reset seller password
export const sellerResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required"));
    }
    const seller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }
    const isSamePassword = await bcrypt.compare(newPassword, seller.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the old password"
        )
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.sellers.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// update user password
export const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError("All fields are required"));
    }

    if (newPassword !== confirmPassword) {
      return next(new ValidationError("New passwords do not match"));
    }

    if (currentPassword === newPassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the current password"
        )
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return next(new AuthError("user not found or password not set"));
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return next(new AuthError("Current password is incorrect"));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "password updated successfully" });
  } catch (error) {
    return next(error);
  }
};

// login admin
export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) return next(new AuthError("User doesn't exists!"));
    if (user.isBlocked || user.isDeleted) {
      return res.status(403).json({
        message:
          "Your account is currently restricted. Please contact support or the site administration for assistance.",
        restricted: true,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    res.clearCookie("access_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-access-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-refresh-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    const accessToken = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

export const getLoggedInAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Not authenticated as admin" });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// Logout user (clear cookies)
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("access_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-access-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-refresh-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
};

// seller logout
export const logoutSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("seller-access-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("seller-refresh-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("access_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    return res
      .status(200)
      .json({ success: true, message: "Seller logged out successfully" });
  } catch (error) {
    return next(error);
  }
};

// Upload image to ImageKit
export const uploadUserImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const requestLogger = logger.forRequest(requestId, req.user?.id, {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  try {
    const { image, file, fileName, folder = "chat-images" } = req.body;
    const imageData = image || file;

    if (!imageData || !fileName) {
      throw new ValidationError("Image and fileName are required");
    }

    await requestLogger.info('User image upload attempt started', {
      metadata: { fileName, folder, userId: req.user?.id }
    });

    const ImageKit = require("imagekit");
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_SECRET_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const uploadResponse = await imagekit.upload({
      file: imageData,
      fileName: fileName,
      folder: folder,
    });

    await requestLogger.info('User image upload completed successfully', {
      metadata: { 
        fileName, 
        folder, 
        userId: req.user?.id,
        imageUrl: uploadResponse.url,
        fileId: uploadResponse.fileId
      }
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: uploadResponse.url,
      url: uploadResponse.url,
      file_id: uploadResponse.fileId,
    });
  } catch (error) {
    await requestLogger.error('User image upload failed', {
      metadata: { 
        fileName: req.body?.fileName,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    return next(error);
  }
};

// Check if user can change profile picture (90-day restriction)
export const getProfilePictureEligibility = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || `eligibility_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const requestLogger = logger.forRequest(requestId, req.user?.id, {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  try {
    const userId = req.user?.id;

    await requestLogger.info('Profile picture eligibility check started', {
      metadata: { userId }
    });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        avatar: true
      }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    
    let canChange = true;
    let daysRemaining = 0;
    let lastChanged = user.avatarLastChanged;

    if (user.avatarLastChanged) {
      const now = new Date();
      const lastChangedDate = new Date(user.avatarLastChanged);
      const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
      const timeSinceLastChange = now.getTime() - lastChangedDate.getTime();
      
      if (timeSinceLastChange < ninetyDaysInMs) {
        canChange = false;
        const remainingMs = ninetyDaysInMs - timeSinceLastChange;
        daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      }
    }

    await requestLogger.info('Profile picture eligibility check completed', {
      metadata: { 
        userId, 
        canChange, 
        daysRemaining,
        hasAvatar: !!user.avatar,
        lastChanged: lastChanged?.toISOString()
      }
    });

    return res.status(200).json({
      success: true,
      canChange,
      daysRemaining,
      lastChanged: lastChanged?.toISOString(),
      hasAvatar: !!user.avatar,
      message: canChange ? "You can change your profile picture" : `You can change your profile picture in ${daysRemaining} days`
    });
  } catch (error) {
    await requestLogger.error('Profile picture eligibility check failed', {
      metadata: { 
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    return next(error);
  }
};

// Update user profile picture with 90-day restriction
export const updateUserProfilePicture = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || `update_avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const requestLogger = logger.forRequest(requestId, req.user?.id, {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  try {
    const { imageUrl, fileId } = req.body;
    const userId = req.user?.id;

    if (!imageUrl || !fileId) {
      throw new ValidationError("Image URL and file ID are required");
    }

    await requestLogger.info('User profile picture update started', {
      metadata: { userId, imageUrl, fileId }
    });

    
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { avatar: true }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    
    if (user.avatarLastChanged) {
      const now = new Date();
      const lastChangedDate = new Date(user.avatarLastChanged);
      const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
      const timeSinceLastChange = now.getTime() - lastChangedDate.getTime();
      
      if (timeSinceLastChange < ninetyDaysInMs) {
        const remainingMs = ninetyDaysInMs - timeSinceLastChange;
        const daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
        
        await requestLogger.warning('Profile picture update blocked by 90-day restriction', {
          metadata: { 
            userId, 
            daysRemaining,
            lastChanged: lastChangedDate.toISOString()
          }
        });
        
        throw new ValidationError(`You can change your profile picture in ${daysRemaining} days`);
      }
    }

    let imageRecord;

    if (user.avatarId && user.avatar) {
      
      imageRecord = await prisma.images.update({
        where: { id: user.avatarId },
        data: {
          url: imageUrl,
          file_id: fileId,
        }
      });
    } else {
  
      imageRecord = await prisma.images.create({
        data: {
          url: imageUrl,
          file_id: fileId,
          userId: userId
        }
      });

      await prisma.users.update({
        where: { id: userId },
        data: { avatarId: imageRecord.id }
      });
    }


    await prisma.users.update({
      where: { id: userId },
      data: { avatarLastChanged: new Date() }
    });

    const updatedUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        avatarLastChanged: true,
        avatar: {
          select: {
            id: true,
            url: true
          }
        }
      }
    });

    await requestLogger.info('User profile picture update completed successfully', {
      metadata: { 
        userId, 
        imageUrl, 
        fileId,
        avatarId: imageRecord.id,
        avatarLastChanged: new Date().toISOString()
      }
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: updatedUser
    });
  } catch (error) {
    await requestLogger.error('User profile picture update failed', {
      metadata: { 
        userId: req.user?.id,
        imageUrl: req.body?.imageUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    return next(error);
  }
};

// Update user profile phone number
export const updateUserProfilePhone = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { phone } = req.body;

    if (!userId) {
      return next(new ValidationError("User not authenticated"));
    }

    if (!phone) {
      return next(new ValidationError("Phone number is required"));
    }


    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone)) {
      return next(new ValidationError("Invalid phone number format"));
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { phone },
      include: {
        avatar: {
          select: { id: true, url: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      user: updatedUser
    });
  } catch (error) {
    return next(error);
  }
};

// Update user profile (name and phone)
export const updateUserProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }


    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }


    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }


    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: phone.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return next(error);
  }
};
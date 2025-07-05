import { AuthError, ValidationError } from '@packages/error-handler/index';
import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgetPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgetPasswordOtp, verifyUserRegistrationOtp as verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from '../utils/cookies/setCookie';
import Stripe from 'stripe';

const stripe = new Stripe (process.env.STRIPE_SECRET_KEY!,{
  apiVersion:'2025-06-30.basil',
})


// Register a new user
export const userRegistration = async (req:Request, res:Response,next:NextFunction) =>{
  try {
      validateRegistrationData(req.body, "user");
    const { email , name } = req.body;
    const existiongUser = await prisma.users.findUnique({
        where: { email }
    });
    if (existiongUser) {
        return next (new ValidationError("User already exists with this email"));
    }
    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(email, name, "user-activation-mail");
    return res.status(200).json({
        status: "success",
        message: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    return next(error);
  }
}


// Verify OTP for user registration
export const verifyUserRegistrationOtp = async (req:Request, res:Response,next:NextFunction) =>{
  try {
    const { email, otp ,password , name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError("Email, OTP, password, and name are required"));
    }
    const user = await prisma.users.findUnique({
      where: { email }
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
        password: hashedPassword
      }
    });
    
    return res.status(200).json({
      status: "success",
      message: "User registration successful",
      data: user
    });
  } catch (error) {
    return next(error);
  }
}


// login user
export const userLogin = async (req:Request, res:Response,next:NextFunction) =>{
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }
    
    const user = await prisma.users.findUnique({
      where: { email }
    });
    
    if (!user) {
      return next(new AuthError("User not found"));
    }
const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

res.clearCookie("seller-access-token")
res.clearCookie("seller-refresh-token")

  const accessToken = jwt.sign(
      { id: user.id, role:"user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
  const refreshToken = jwt.sign(
      { id: user.id, role:"user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

setCookie(res, "access_Token", accessToken);
setCookie(res, "refresh_Token", refreshToken);


    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user:{id: user.id, name: user.name, email: user.email},
    });
  } catch (error) {
    return next(error);
  }
}


// refresh token
export const refreshToken = async ( req:any,res:Response ,next:NextFunction) =>{
  try {
    const refreshToken = req.cookies["refresh_token"] || req.cookies["seller-refresh-token"] || req.headers.authorization?.split(" ")[1];
if(!refreshToken){
  return next(new ValidationError("Unauthorized! No refresh token provided"));
}
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string, role: string };
    if(!decoded || !decoded.id || !decoded.role){
      return new JsonWebTokenError("Invalid refresh token");
    }

    let account;

    if(decoded.role === "user"){
      
      account =await prisma.users.findUnique({where: { id: decoded.id }})
    } else if (decoded.role === "seller"){
      account = await prisma.sellers.findUnique({
                where:{ id: decoded.id},
                include:{shop:true}
            })
    };


      if(!account){
        return new AuthError("Forbidden ! User/Seller not found");
      }

      const newAccessToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
      );


if(decoded.role === "user"){
  setCookie(res, "access_Token", newAccessToken);
}else if (decoded.role === "seller"){
    setCookie(res, "seller-access-token", newAccessToken);
}

req.role = decoded.role;
return res.status(201).json({success:true})
  } catch (error) {
    return next(error);
  }
}


//get logged in user info
export const getUser = async (req:any, res:Response,next:NextFunction) =>{
  try {
    const user = req.user;
    return res.status(201).json({
      success:true,
      user
    })

  } catch (error) {
    return next(error);
  }
}

// user forget password 
export const userForgetPassword = async (req:Request, res:Response,next:NextFunction) =>{
  await handleForgetPassword(req, res, next, "user");
}

// verify user forget password OTP
export const verifyUserForgetPasswordOtp = async (req:Request, res:Response,next: NextFunction) =>{
  await verifyForgetPasswordOtp(req, res, next);
}

// reset user password
export const userResetPassword = async (req:Request, res:Response,next:NextFunction) =>{
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required"));
    }
    const user = await prisma.users.findUnique({
      where: { email }
    });
    if (!user) {
      return next(new ValidationError("User not found"));
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(new ValidationError("New password cannot be the same as the old password"));
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword }
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully"
    });
  } catch (error) {
    return next(error);
  }
} 


// register a new seller
export const registerSeller = async (req:Request, res:Response,next:NextFunction)=>{
  try {
    validateRegistrationData(req.body,"seller");
    const { email, name } = req.body;
    const existingSeller = await prisma.sellers.findUnique({
      where: { email }
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
}


// verify seller registration OTP
export const verifySeller = async (req:Request, res:Response,next:NextFunction)=>{
  try {
    const { email,otp,password,name,phone_number,country} = req.body;
    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError("Email, OTP, password, name, phone number and country are required"));
    }
    // Check if seller already exists
    const existingSeller = await prisma.sellers.findUnique({
      where: { email }
    });
    if (existingSeller) {
      return next(new ValidationError("Seller already exists with this email"));
    }
    // Verify OTP
    await verifyOtp(email, otp);
    // Hash password and create seller
    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: { name,email, phone_number, country, password: hashedPassword }
    });
    return res.status(200).json({
      status: "success",
      message: "Seller registered successfully",
      seller
    });
  } catch (error) {
    return next(error);
  }
}


// create a new shop for seller
export const createShop = async (req:Request, res:Response,next:NextFunction)=>{
  try {
    const { name,bio,address,opening_hours,website,category,sellerId} = req.body
    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(new ValidationError("All fields are required"));
    }
    // Ensure category is always an array
    const categoryArray = Array.isArray(category) ? category : [category];
    const shopData:any = { name, bio, address, opening_hours, category: categoryArray, sellerId };

    if(website && website.trim() !== ""){
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData
    });
    return res.status(201).json({
      status: "success",
      message: "Shop created successfully",
      shop
    });
  } catch (error) {
    return next(error);  
  }
}


// create stripe connect account link for seller
export const createStripeConnectLink = async (req:Request, res:Response,next:NextFunction)=>{
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }
    
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId }
    });
    
    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    // Create Stripe account link
const account = await stripe.accounts.create({
  type:'standard',
  email: seller?.email,
  country:"AE",
  capabilities:{
    card_payments:{requested:true},
    transfers:{
      requested:true
    },
  }
})

await prisma.sellers.update({
  where: { id: sellerId },
  data: { stripeId: account.id }
})

const accountLink = await stripe.accountLinks.create({
  account:account.id,
  refresh_url: `http://localhost:3000/success`,
  return_url: `http://localhost:3000/success`,
  type:"account_onboarding",
})

    return res.status(200).json({
      status: "success",
      message: "Stripe connect link created successfully",
      url: accountLink.url
    });
  } catch (error) {
    return next(error);
  } 
}


// login seller
export const loginSeller = async (req:Request, res:Response,next:NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { email }
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch) {
      return next(new ValidationError("Invalid email or password"));
    }
res.clearCookie("access_Token");
res.clearCookie("refresh_token")
    const accessToken = jwt.sign(
      { id: seller.id, role:"seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role:"seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
    setCookie(res, "seller-access-token", accessToken);
    setCookie(res, "seller-refresh-token", refreshToken);
    res.status(200).json({
      message:"Login Successful!",
      seller:{id:seller.id,email:seller.email,name:seller.name}
    })
  } catch (error) {
    return next(error);
  }
}


// get logged in seller
export const getSeller = async (req:any, res:Response,next:NextFunction) => {
  try {
    const seller = req.seller;
    return res.status(201).json({
      success:true,
      seller
    })
  } catch (error) {
    return next(error);
  }
}
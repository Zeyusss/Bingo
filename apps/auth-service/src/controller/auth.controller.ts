import { AuthError, ValidationError } from '@packages/error-handler/index';
import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgetPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgetPasswordOtp, verifyUserRegistrationOtp as verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from '../utils/cookies/setCookie';


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
    res.status(200).json({
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
    
    res.status(200).json({
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


    res.status(200).json({
      status: "success",
      message: "Login successful",
      user:{id: user.id, name: user.name, email: user.email},
    });
  } catch (error) {
    return next(error);
  }
}

// refresh user token
export const refreshToken = async ( req:Request,res:Response ,next:NextFunction) =>{
  try {
    const refreshToken = req.cookies.refresh_Token;
    if(!refreshToken){
      return new ValidationError("Unathorized ! No refresh token provided");
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string, role: string };
    if(!decoded || !decoded.id || !decoded.role){
      return new JsonWebTokenError("Invalid refresh token");
    }
    // let account;
    // if(decoded.role === "user"){
      const user =await prisma.users.findUnique({
        where: { id: decoded.id }
      });
      if(!user){
        return new AuthError("Forbidden ! User/Seller not found");
      }
      const newAccessToken = jwt.sign(
        { id: user.id, role: decoded.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
      );
setCookie(res, "access_Token", newAccessToken);
return res.status(201).json({success:true})
  } catch (error) {
    return next(error);
  }
}

//get logged in user info

export const getUser = async (req:any, res:Response,next:NextFunction) =>{
  try {
    const user = req.user;
    res.status(201).json({
      success:true,
      user
    })

  } catch (error) {
    next(error);
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

    res.status(200).json({
      status: "success",
      message: "Password reset successfully"
    });
  } catch (error) {
    return next(error);
  }
} 

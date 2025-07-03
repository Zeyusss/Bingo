import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import redis from '@packages/libs/redis';
import { sendEmail } from './sendMail';
import prisma from '@packages/libs/prisma';


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any , userType:"user" | "seller") => {
const { email, password, phone_number, name , country } = data;
if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
    throw new ValidationError('All fields are required'); 
} 

if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');  

}

}


export const checkOtpRestrictions = async (email: string) => {
    if(await redis.get(`otp_lock:${email}`)) {
        throw new ValidationError('You have reached the maximum number of OTP requests. Please try again after 30min.');
    }
    if(await redis.get(`otp_spam_lock:${email}`)) {
        throw new ValidationError('You are sending OTP requests too frequently. Please try again after 1 hour.');
    }
    if(await redis.get(`otp_cooldown:${email}`)) {
        throw new ValidationError('You have already requested an OTP. Please wait for 1 minute before requesting again.');
    }
}

export const trackOtpRequests = async (email: string) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');
    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
        throw new ValidationError('You have reached the maximum number of OTP requests. Please try again after 1 hour.');
    }
    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600);
}

export const verifyUserRegistrationOtp = async (email: string, otp: string) => {
    const cachedOtp = await redis.get(`otp:${email}`);
    if (!cachedOtp) {
        throw new ValidationError('Invalid or expired OTP');
    }
    const failedAttemptsKey = `otp_failed_attempts:${email}`;
    let failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');
    if(cachedOtp !== otp) {
        if (failedAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
            await redis.del(`otp:${email}`); 
            throw new ValidationError('You have exceeded the maximum number of OTP attempts. Please try again after 30 minutes.');
        }
        await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
        throw new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts remaining.`);
    }
    await redis.del(`otp:${email}`,failedAttemptsKey);
}

export const sendOtp = async (email: string,name:string, template:string) => {
const otp = crypto.randomInt(1000, 9999).toString();
await sendEmail(email, 'Your OTP Code', template, { otp, name });
await redis.set(`otp:${email}`, otp, 'EX', 300); 
await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); 

}


export const handleForgetPassword = async (req: any, res: any, next: NextFunction, userType: "user" | "seller") => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new ValidationError('Email is required');
        }
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new ValidationError('User not found');
        }
        await checkOtpRestrictions(email);
        await trackOtpRequests(email);
        await sendOtp(email, user.name,"forgot-password-user-mail");
        res.status(200).json({
            status: 'success',
            message: `OTP sent to user email. Please check your inbox.`,
        });
    } catch (error) {
        next(error);
    }
};


export const verifyForgetPasswordOtp = async (req: Request , res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            throw new ValidationError('Email and OTP are required');
        }
        await verifyUserRegistrationOtp(email, otp);
        await redis.del(`otp:${email}`);
        res.status(200).json({
            status: 'success',
            message: 'OTP verified successfully',
        });
    } catch (error) {
        next(error);
    }
}
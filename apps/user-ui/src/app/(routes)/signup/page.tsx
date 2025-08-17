"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import GoogleButton from 'apps/user-ui/src/shared/components/google';
import Footer from 'apps/user-ui/src/shared/components/homepage/Footer';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import axios,{AxiosError} from "axios";
import { useAuthStore } from "../../../store/authStore";
import useRedirectIfAuthenticated from "../../../hooks/useRedirectIfAuthenticated";
import PhoneNumberInput from '../../../shared/components/forms/PhoneNumberInput';
import { PhoneNumberResult } from '../../../utils/phoneUtils';

  type FormData = {
    name:string,
    email: string;
    phone: string;
    password: string;
  };

const Signup = () => {
  useRedirectIfAuthenticated();

 const [passwordVisible, setPasswordVisible] = useState(false);
    const [showOtp,setShowOtp] = useState(false);
const [canResend,setCanResend] = useState(true);
const [timer,setTimer] = useState(60);
const [otp,setOtp] = useState(["","","",""]);
const [userData,setUserData] = useState<FormData | null>(null);
const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
const [phoneValidation, setPhoneValidation] = useState<PhoneNumberResult>({ isValid: false, normalized: '' });

  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLoggedIn } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>();

  const phoneValue = watch('phone');

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };



const signUpMutation = useMutation({
    mutationFn : async ( data:FormData)=>{
        const respone = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`,
            data
        )
        return respone.data;
    },
    onSuccess: (_ ,formData) =>{
        setUserData(formData)
        setShowOtp(true)
        setCanResend(false);
        setTimer(60);
        startResendTimer();
    }
})

const verifyOtpMutation = useMutation({
  mutationFn: async () => {
    if (!userData) throw new Error("User data not found");

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user`,
      {
        ...userData,
        otp: otp.join(""),
      }
    );

    return response.data;
  },
  onSuccess: (data) => {
    setLoggedIn(true);
    queryClient.invalidateQueries({ queryKey: ["user"] });
    router.push("/");
  }
});
  const onSubmit = (data: FormData) => {
signUpMutation.mutate(data);
  }

  const handleOtpChange = (index:number,value:string)=>{
if(!/^[0-9]?$/.test(value)) return;

const newOtp = [...otp];
newOtp[index] = value;
setOtp(newOtp)

if(value && index < inputRefs.current.length -1){
    inputRefs.current[index + 1]?.focus();
}
  }
  const handleOtpKeyDown = (index:number,e:React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === "Backspace" && !otp[index] && index > 0){
        inputRefs.current[index -1]?.focus()
    }
  }

const resendOtp = ()=>{
  if(userData){
    signUpMutation.mutate(userData);
  }
}

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-16">
        <div className="container mx-auto px-4">
          <div className="text-white">
            <h1 className="text-5xl font-bold text-white mb-4">My Account</h1>
            <nav className="text-lg text-white">
              <Link href="/" className="hover:underline">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white font-bold">My Account</span>
            </nav>
          </div>
        </div>
      </div>

    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl overflow-hidden">
        <div className="md:w-[480px] p-8">
          <h3 className="text-2xl font-bold mb-6">REGISTER</h3>

          <GoogleButton />

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign up With Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Username</label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-2 border border-gray-300 outline-0 rounded"
                {...register("name", {
                  required: "Name is required",

                })}
              />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                placeholder="zeyus@example.com"
                className="w-full p-2 border border-gray-300 outline-0 rounded"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
              />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
                )}
              </div>

              <div>
                <PhoneNumberInput
                  label="Phone number"
                  value={phoneValue}
                  onChange={(normalizedValue, result) => {
                    setValue('phone', normalizedValue);
                    setPhoneValidation(result);
                  }}
                  error={errors.phone?.message as string}
                  required
                  placeholder="Enter your phone number"
                />
                <input
                  type="hidden"
                  {...register("phone", {
                    required: "Phone number is required",
                    validate: () => phoneValidation.isValid || phoneValidation.error || "Invalid phone number format",
                  })}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Your Password"
                    className="w-full p-2 border border-gray-300 outline-0 rounded"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  >
                    {passwordVisible ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={signUpMutation.isPending}
                className="w-full bg-[#F59A57] text-white p-2 rounded"
              >
                {signUpMutation.isPending ? "Signing Up..." : "Sign Up"}
              </button>

              {signUpMutation?.isError && signUpMutation.error instanceof AxiosError && (
                <p className="text-red-500 text-sm mt-1">{String(signUpMutation.error.response?.data?.message || signUpMutation.error.message)}</p>
              )}
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 outline-none rounded"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
              <button
                className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </button>

              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className="text-blue-500 cursor-pointer"
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP ${timer}s`
                )}
              </p>
              {
                verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-1">{String(verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message)}</p>
                )
              }
            </div>
          )}
        </div>
        <div className="hidden md:block w-px bg-gray-300" />

        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <p className="text-gray-600 mb-6 leading-8">
            Already have an account? Sign in to access your order status and
            history. We'll help you track your purchases and manage your profile
            with ease.
          </p>
          <button className="bg-[#f7f7f7] text-black px-6 py-2 rounded-full font-semibold shadow">
            <Link href="/login">Login</Link>
          </button>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Signup;
"use client";

import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Store, Shield, TrendingUp, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import axios,{AxiosError} from "axios";
import { countries } from 'apps/seller-ui/src/utils/countries';
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop';
import StripeSIcon from '../../assets/svg/stripe-logo';
import PhoneNumberInput from '../../../shared/components/forms/PhoneNumberInput';
import { PhoneNumberResult } from '../../../shared/components/forms/PhoneNumberInput';
import useRedirectIfAuthenticated from "../../../hooks/useRedirectIfAuthenticated";


type FormData = {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    country: string;
}

const Signup = () => {
const [activeStep,setActiveStep] = useState(1);
const [passwordVisible, setPasswordVisible] = useState(false);
    const [showOtp,setShowOtp] = useState(false);
const [canResend,setCanResend] = useState(true);
const [timer,setTimer] = useState(60);
const [otp,setOtp] = useState(["","","",""]);
const [sellerData,setSellerData] = useState<FormData | null>(null);
const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
useRedirectIfAuthenticated();
const [phoneValidation, setPhoneValidation] = useState<PhoneNumberResult>({ isValid: false, normalized: '' });




  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>();

  const phoneValue = watch('phone_number');

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
        const respone = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`,
            data
        )
        return respone.data;
    },
    onSuccess: (_ ,formData) =>{
        setSellerData(formData)
        setShowOtp(true)
        setCanResend(false);
        setTimer(60);
        startResendTimer();
    }
})

const verifyOtpMutation = useMutation({
  mutationFn: async () => {
    if (!sellerData) throw new Error("User data not found");

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`,
      {
        ...sellerData,
        otp: otp.join(""), 
      },
      { withCredentials: true }
    );

    return response.data;
  },
  onSuccess: (data) => {
    setActiveStep(2);
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
  if(sellerData){
    signUpMutation.mutate(sellerData);
  }
}
const connectStripe = async ()=>{
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`,
      {},
      { withCredentials: true }
    )
    if(response.data.url){
      window.location.href = response.data.url;
    }
  } catch (error) {
    console.error("Stripe connection Error",error)
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Progress Stepper */}
        <div className='relative flex items-center justify-center md:w-[60%] w-[90%] mx-auto mb-12 pt-8'>
          {[1,2,3].map((step, index)=>(
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-bold transition-all duration-300 ${
                  step <= activeStep 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg" 
                    : "bg-gray-300"
                }`}>
                  {step < activeStep ? <CheckCircle size={20} /> : step}
                </div>
                <span className={`mt-3 text-sm font-medium transition-colors ${
                  step <= activeStep ? "text-orange-600" : "text-gray-500"
                }`}>
                  {step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : "Bank Details" }
                </span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${
                  step < activeStep ? "bg-orange-500" : "bg-gray-300"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Branding & Features (only show on step 1) */}
          {activeStep === 1 && (
            <div className="hidden lg:block space-y-8">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Bingo Seller</h1>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Start Selling Today
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join our marketplace and reach millions of customers worldwide
                </p>
              </div>

              {/* Feature Cards */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Growth Analytics</h3>
                    <p className="text-sm text-gray-600">Track your sales and optimize performance</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Customer Reach</h3>
                    <p className="text-sm text-gray-600">Connect with buyers globally</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure Platform</h3>
                    <p className="text-sm text-gray-600">Protected transactions and data</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Form Content */}
          <div className={`w-full ${activeStep === 1 ? 'max-w-md mx-auto lg:mx-0' : 'max-w-2xl mx-auto'}`}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
    {activeStep === 1 && (
        <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                  Create Your Account
                </h3>
                <p className="text-gray-600">
                  Start your selling journey with us
                </p>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>

        {!showOtp ? (          
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
                  {...register("name", {
                    required: "Name is required",
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {String(errors.name.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              <div>
                <PhoneNumberInput
                  label="Phone Number"
                  value={phoneValue}
                  onChange={(normalizedValue, result) => {
                    setValue('phone_number', normalizedValue);
                    setPhoneValidation(result);
                  }}
                  error={errors.phone_number?.message as string}
                  required
                  placeholder="Enter your phone number"
                />
                <input
                  type="hidden"
                  {...register("phone_number", {
                    required: "Phone Number is required",
                    validate: () => phoneValidation.isValid || phoneValidation.error || "Invalid phone number format",
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
                  {...register("country", {
                    required: "Country is required",
                  })}
                >
                  <option value="">Select your country</option>
                  {countries.map((country)=>(
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {String(errors.country.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className='relative'>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button 
                    type='button' 
                    onClick={()=> setPasswordVisible(!passwordVisible)} 
                    className='absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
                  >
                    {passwordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={signUpMutation.isPending}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {signUpMutation.isPending ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {signUpMutation?.isError && signUpMutation.error instanceof AxiosError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 text-red-500">⚠</span>
                    {String(signUpMutation.error.response?.data?.message || signUpMutation.error.message)}
                  </p>
                </div>
              )}
            </form>
          ) : ( 
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>
                Verify Your Phone
              </h3>
              <p className="text-gray-600 mb-8">
                Enter the 4-digit code sent to your phone
              </p>
              
              <div className='flex justify-center gap-4 mb-8'>
                {otp?.map((digit,index)=>(
                  <input 
                    key={index} 
                    type="text" 
                    ref={(el)=>{
                      if(el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className='w-14 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-colors'
                    value={digit}
                    onChange={(e)=> handleOtpChange(index,e.target.value)}
                    onKeyDown={(e)=>handleOtpKeyDown(index,e)}
                  />
                ))}
              </div>

              <button
                className='w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl'
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>

              <p className='text-center text-sm mt-6'>
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className='text-orange-600 hover:text-orange-700 font-medium transition-colors'
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="text-gray-500">Resend code in {timer}s</span>
                )}
              </p>

              {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 text-red-500">⚠</span>
                    {String(verifyOtpMutation.error.response?.data?.message||verifyOtpMutation.error.message)}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
    )}
{activeStep === 2 && (
       <CreateShop setActiveStep={setActiveStep}/>
     )}
    {activeStep === 3 && (
      <div className='text-center space-y-8'>
        <div>
          <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <StripeSIcon className="w-10 h-10" />
          </div>
          <h3 className='text-3xl font-bold text-gray-900 mb-4'>Almost Done!</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Connect your Stripe account to start receiving payments from customers securely
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">✓</span>
            </div>
            <span className="text-gray-700 font-medium">Secure payment processing</span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">✓</span>
            </div>
            <span className="text-gray-700 font-medium">Automatic payouts to your bank</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">✓</span>
            </div>
            <span className="text-gray-700 font-medium">Industry-leading fraud protection</span>
          </div>
        </div>

        <button 
          onClick={connectStripe} 
          className='w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl text-lg'
        >
          <StripeSIcon className="w-6 h-6" />
          Connect with Stripe
        </button>

        <p className="text-sm text-gray-500 mt-4">
          You'll be redirected to Stripe to complete the setup process
        </p>
      </div>
    )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

"use client";

import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import axios,{AxiosError} from "axios";
import { countries } from 'apps/seller-ui/src/utils/countries';
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop';
import StripeSIcon from '../../assets/svg/stripe-logo';


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
const [sellerId,setSellerId] = useState("");
const inputRefs = useRef<(HTMLInputElement | null)[]>([]);




  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

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
      }
    );

    return response.data;
  },
  onSuccess: (data) => {
    setSellerId(data?.seller?.id);
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
      {sellerId}
    )
    if(response.data.url){
      window.location.href = response.data.url;
    }
  } catch (error) {
    console.error("Stripe connection Error",error)
  }
}
  return (
<div className="w-full flex flex-col items-center pt-10 min-h-screen" style={{ background: 'var(--background)' }}>
    {/* {Stepper} */}
    <div className='relative flex items-center justify-between md:w-[50%] w-[90%] mb-8'>
    {[1,2,3].map((step)=>(
        <div key={step} className="flex flex-col items-center text-center w-1/3">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${step<= activeStep ? "bg-[var(--primary)] text-white" : "bg-[var(--disabled)] text-white"}`}>{step}</div>
        <span className='mt-2 text-sm font-semibold' style={{ color: 'var(--heading)' }}>
        {step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : "Bank Details" }
        </span>
        </div>
    ))}
    </div>
    
    {/* {step content} */}
    <div className='md:w-[480px] p-10 bg-[var(--background)] border border-[var(--border)] shadow-lg rounded-2xl'>
    {activeStep === 1 && (
        <>
        {!showOtp ? (          
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <h3 className='text-2xl font-bold text-center mb-4' style={{ color: 'var(--heading)' }}>
                    Create Account
                </h3>
            <div>
              <label className="block" style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 4 }}>Name</label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-[var(--input-padding)] border border-[var(--input-border)] rounded-[var(--input-radius)] outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
                {...register("name", {
                  required: "Name is required",
                  
                })}
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{String(errors.email.message)}</p>
              )}
            </div>
            <div>
              <label className="block" style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 4 }}>Email</label>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-[var(--input-padding)] border border-[var(--input-border)] rounded-[var(--input-radius)] outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{String(errors.email.message)}</p>
              )}
            </div>
            <div>
            <label className="block" style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 4 }}>Phone Number</label>
<input
                type="tel"
                placeholder="Mobile Number"
                className="w-full p-[var(--input-padding)] border border-[var(--input-border)] rounded-[var(--input-radius)] outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
                {...register("phone_number", {
                  required: "Phone Number is required",
                  pattern: {
                    value: /^(?:\+?20|0)?1[0-9]{8,9}$/,
                    message: "Invalid phone number format",
                  },
                  minLength: { value:10, message : " Phone number must be at least 10 digits"},
                  maxLength: { value:15, message : " Phone number must be at most 15 digits"},
                })}
              />
              {errors.phone_number && (
                <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{String(errors.phone_number.message)}</p>
              )}
            </div>
            <div>
            <label className="block" style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 4 }}>Country</label>
            <select
                className="w-full p-[var(--input-padding)] border border-[var(--input-border)] rounded-[var(--input-radius)] outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
                {...register("country", {
                  required: "Country is required",
                })}
              >
                <option value="">Select Country</option>
                {countries.map((country)=>(
                    <option key={country.code} value={country.name}>
                        {country.name}
                    </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{String(errors.country.message)}</p>
              )}
            </div>
            <div>
              <label className="block" style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 4 }}>Password</label>
              <div className='relative'>
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Your Password"
                className="w-full p-[var(--input-padding)] border border-[var(--input-border)] rounded-[var(--input-radius)] outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button type='button' onClick={()=> setPasswordVisible(!passwordVisible)} className='absolute inset-y-0 right-3 flex items-center text-[var(--disabled)]'>
              {passwordVisible?<Eye/> : <EyeOff/>}
              </button>
</div>
              {errors.password && (
                <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{String(errors.password.message)}</p>
              )}
            </div>
            <button
              type="submit"
              disabled =  {signUpMutation.isPending}
              className={`w-full mt-4 rounded-[var(--button-radius)] font-semibold transition p-[var(--button-padding)] ${signUpMutation.isPending ? "bg-[var(--disabled)] text-white cursor-not-allowed" : "bg-[var(--primary)] text-white hover:bg-[#8c0e2d]"}`}
            >
              {signUpMutation.isPending ? "Signing Up..." : "Sign Up"}
            </button>
            {signUpMutation?.isError && signUpMutation.error instanceof AxiosError && (
              <p className='text-sm mt-1' style={{ color: 'var(--error)' }}>{String(signUpMutation.error.response?.data?.message || signUpMutation.error.message)}</p>
            )}
                          <p className='pt-3 text-center' style={{ color: 'var(--text)' }}>
                Already have an account? <Link href="/login" className='text-[var(--primary)] font-semibold hover:underline'>Login</Link>
              </p>
          </form>) : ( <div>
            <h3 className='text-xl font-bold text-center mb-4' style={{ color: 'var(--heading)' }}>
            Enter OTP
            </h3>
            <div className='flex justify-center gap-6'>
            {otp?.map((digit,index)=>(
                <input key={index} type="text" ref={(el)=>{
                    if(el) inputRefs.current[index] = el;
                }}
                maxLength={1}
                className='w-12 h-12 text-center border border-[var(--input-border)] rounded-[var(--input-radius)] outline-none focus:border-[var(--primary)] text-[var(--heading)] text-xl font-bold transition'
                value={digit}
                onChange={(e)=> handleOtpChange(index,e.target.value)}
                onKeyDown={(e)=>handleOtpKeyDown(index,e)}
                />
            ))}
            </div>
<button
  className={`w-full mt-4 text-lg cursor-pointer rounded-[var(--button-radius)] font-semibold transition p-[var(--button-padding)] ${verifyOtpMutation.isPending ? "bg-[var(--disabled)] text-white cursor-not-allowed" : "bg-[var(--primary)] text-white hover:bg-[#8c0e2d]"}`}
  disabled={verifyOtpMutation.isPending}
  onClick={() => verifyOtpMutation.mutate()}
>
 {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
</button>

            <p className='text-center text-sm mt-4' style={{ color: 'var(--text)' }}>
                {canResend ? (
                    <button
                    onClick={resendOtp}
                    className='text-[var(--primary)] font-semibold hover:underline'
                    >Resend OTP</button>
                ):(
`Resend OTP ${timer}s`
                )}

            </p>
            {
              verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError &&  (
                <p className='text-sm mt-1' style={{ color: 'var(--error)' }}>{String(verifyOtpMutation.error.response?.data?.message||verifyOtpMutation.error.message)}</p>
              )}

          </div>)}
        </>
    )}
    {activeStep === 2 && (
      <CreateShop sellerId={sellerId} setActiveStep={setActiveStep}/>
    )}
    {activeStep ===3 && (
      <div className='text-center'>
      <h3 className='text-xl font-bold' style={{ color: 'var(--heading)' }}>Withdraw Method</h3>
      <br />
      <button onClick={connectStripe} className='w-full m-auto flex items-center justify-center gap-3 text-lg bg-[var(--primary)] text-white py-2 rounded-[var(--button-radius)] font-semibold hover:bg-[#8c0e2d] transition'>
      Connect Stripe <StripeSIcon/>
      </button>
  

      </div>
    )}
    </div>
</div>
  );
};

export default Signup;

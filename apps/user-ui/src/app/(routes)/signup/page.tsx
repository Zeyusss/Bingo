"use client";

import { useMutation } from '@tanstack/react-query';
import GoogleButton from 'apps/user-ui/src/shared/components/google';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import axios,{AxiosError} from "axios";

  type FormData = {
    name:string,
    email: string;
    password: string;
  };

const Signup = () => {


 const [passwordVisible, setPasswordVisible] = useState(false);
    const [showOtp,setShowOtp] = useState(false);
const [canResend,setCanResend] = useState(true);
const [timer,setTimer] = useState(60);
const [otp,setOtp] = useState(["","","",""]);
const [userData,setUserData] = useState<FormData | null>(null);
const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

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
    router.push("/login");
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
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        SignUp
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . SignUp
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            SignUp to Bingo
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an Account?{" "}
            <Link href="/login" className="text-blue-500">
              Login
            </Link>
          </p>

          <GoogleButton />

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in With Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
{!showOtp ? (          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Zeyus"
                className="w-full p-2 border border-gray-300 outline-0 rounded"
                {...register("name", {
                  required: "Name is required",
                  
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
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
              <label className="block text-gray-700 mb-1">Password</label>
              <div className='relative'>
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
              <button type='button' onClick={()=> setPasswordVisible(!passwordVisible)} className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
              {passwordVisible?<Eye/> : <EyeOff/>}
              </button>
</div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>
              )}
            </div>
            <button
              type="submit"
              disabled =  {signUpMutation.isPending}
              className="w-full mt-4 bg-black text-white p-2 rounded hover:bg-blue-600"
            >
              {signUpMutation.isPending ? "Signing Up..." : "Sign Up"}
            </button>

          
          </form>) : ( <div>
            <h3 className='text-xl font-semibold text-center mb-4'>
            Enter OTP
            </h3>
            <div className='flex justify-center gap-6'>
            {otp?.map((digit,index)=>(
                <input key={index} type="text" ref={(el)=>{
                    if(el) inputRefs.current[index] = el;
                }}
                maxLength={1}
                className='w-12 h-12 text-center border  border-gray-300 outline-none !rounded'
                value={digit}
                onChange={(e)=> handleOtpChange(index,e.target.value)}
                onKeyDown={(e)=>handleOtpKeyDown(index,e)}
                />
            ))}
            </div>
<button
  className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'
  disabled={verifyOtpMutation.isPending}
  onClick={() => verifyOtpMutation.mutate()}
>
 {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
</button>

            <p className='text-center text-sm mt-4'>
                {canResend ? (
                    <button
                    onClick={resendOtp}
                    className='text-blue-500 cursor-pointer'
                    >Resend OTP</button>
                ):(
`Resend OTP ${timer}s`
                )}

            </p>
            {
              verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError &&  (
                <p className='text-red-500 text-sm mt-1'>{String(verifyOtpMutation.error.response?.data?.message||verifyOtpMutation.error.message)}</p>
              )}
          </div>)}

        </div>
      </div>
    </div>
  );
};

export default Signup;

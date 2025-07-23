'use client'
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Input from 'packages/components/inputs';
import React, { useState } from 'react'
import {useForm} from "react-hook-form";
import axios,{AxiosError} from "axios";

type FormData = {
  email:string;
  password:string;
};

const Page = () => {
  const {register,handleSubmit, formState: { errors }} = useForm<FormData>();
  const [serverError,setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (data:FormData)=>{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-admin`,
        data,
        {withCredentials:true}
      );
      return response.data;
    },
    onSuccess : (data)=>{
      setServerError(null);
      router.push("/dashboard");
    },
    onError : (error:AxiosError)=>{
      const errorMessage = 
      (error.response?.data as {message?:string})?.message || "Invalid Credentials";
      setServerError(errorMessage);
    }
  }) 

  const onSubmit = (data:FormData) =>{
    loginMutation.mutate(data);
  }
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute w-96 h-96 bg-blue-300 opacity-30 rounded-full filter blur-3xl animate-blob1" style={{top: '-6rem', left: '-6rem'}}></div>
        <div className="absolute w-96 h-96 bg-pink-300 opacity-30 rounded-full filter blur-2xl animate-blob2" style={{bottom: '-6rem', right: '-6rem'}}></div>
      </div>
      {/* Glassy Card */}
      <div className="relative z-10 md:w-[420px] p-8 glassy-card shadow-2xl flex flex-col items-center animate-fadein">
        {/* Logo (optional) */}
        <div className="mb-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#2563eb"/>
            <path d="M24 14L32 34H16L24 14Z" fill="white"/>
          </svg>
        </div>
        <h1 className="text-3xl pb-2 font-semibold text-center text-gray-900 font-Poppins">
          Welcome Admin
        </h1>
        <p className="text-center text-lg font-medium py-2 text-gray-500">
          Login to your admin dashboard
        </p>
        <form className="w-full space-y-5 mt-2" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <Input
              label=""
              placeholder="Support@bingo.com"
              {...register("email",{
                required:"Email is required",
                pattern : {
                  value : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message : "Invalid email address",
                },
              })}
              type="email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Input
                label=""
                type={passwordVisible ? "text" : "password"}
                placeholder="***********"
                {...register("password",{
                  required:"Password is required",
                })}
              />
              <button type="button" onClick={()=> setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                {passwordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592m3.31-2.687A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>
            )}
          </div>
          <button
            disabled={loginMutation.isPending}
            className="w-full mt-2 text-xl flex justify-center font-semibold font-Poppins cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            type="submit"
          >
            {loginMutation.isPending ? (
              <div className="h-6 w-6 border-2 border-gray-100 border-t-transparent rounded-full animate-spin"/>
            ):(
              <>Login</>
            )}
          </button>
          {serverError&& (
            <p className="text-red-500 text-sm mt-2 text-center">{serverError}</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Page

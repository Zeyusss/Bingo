"use client";

import { useMutation } from '@tanstack/react-query';
import GoogleButton from 'apps/user-ui/src/shared/components/google';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from "react-hook-form";

  type FormData = {
    email: string;
    password: string;
  };

const Login = () => {


  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation ({
mutationFn: async (data: FormData)=>{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-user`, data, {withCredentials:true});
       return response.data;
},
onSuccess: (data)=>{
  setServerError(null);
  router.push("/");
},
onError: (error: AxiosError) =>{
  const errorMessage = (error.response?.data as {message?:string, restricted?:boolean})?.message ||"Invalid Email or Password.";
  setServerError(errorMessage);
  if ((error.response?.data as {restricted?:boolean})?.restricted) {
    setShowRestrictedModal(true);
  }
}
  })

  const onSubmit = (data: FormData) => {
loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-[85vh]">
      <h1 className="text-4xl font-Poppins font-semibold text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3">
        Home . Login
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Login to Bingo
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Don't have an Account?{" "}
            <Link href="/signup" className="text-blue-500">
              Sign Up
            </Link>
          </p>

          <GoogleButton />

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in With Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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


<div className="flex justify-between items-center">
  <div className="flex items-center gap-2">
    <input
      id="rememberMe"
      type="checkbox"
      checked={rememberMe}
      onChange={() => setRememberMe(!rememberMe)}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
      Remember me
    </label>
  </div>
  <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
    Forgot Password?
  </Link>
</div>



            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-black text-white p-2 rounded hover:bg-blue-600"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>

            {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          </form>
        </div>
      </div>
      {showRestrictedModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-2">Account Restricted</h2>
      <p className="mb-4">Your account is currently restricted. Please contact support or the site administration for assistance.</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setShowRestrictedModal(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default Login;

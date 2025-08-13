"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import GoogleButton from "apps/user-ui/src/shared/components/google";
import Footer from "apps/user-ui/src/shared/components/homepage/Footer";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../store/authStore";
import useRedirectIfAuthenticated from "../../../hooks/useRedirectIfAuthenticated";
import { useStore } from "../../../store";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  
  useRedirectIfAuthenticated();
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLoggedIn } = useAuthStore();
  const { loadCartFromBackend, loadWishlistFromBackend } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-user`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      setServerError(null);
      setLoggedIn(true);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      try {
        await Promise.all([
          loadCartFromBackend(data.user),
          loadWishlistFromBackend(data.user)
        ]);
      } catch (error) {
        console.error('Error loading cart/wishlist after login:', error);
      }
      
      router.push("/");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid Email or Password.";
      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

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

    <div className="flex items-center justify-center  px-4 ">
      
      <div className="w-full max-w-4xl flex flex-col md:flex-row  rounded-2xl overflow-hidden ">
        <div className="md:w-[480px] p-8 ">
          <h3 className="text-2xl font-bold  mb-6">LOGIN</h3>

          <GoogleButton />

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in With Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.email.message)}
                </p>
              )}
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
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.password.message)}
                </p>
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
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-black cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-[#F59A57] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#F59A57] text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {serverError && (
              <p className="text-red-500 text-sm">{serverError}</p>
            )}
          </form>
        </div>
        <div className="hidden md:block w-px bg-gray-300" />

        <div className="w-full md:w-1/2  flex flex-col items-center justify-center p-10 text-center">
          <h2 className="text-2xl  font-bold  mb-4">Register</h2>
          <p className="text-gray-600 mb-6 leading-8">
            Registering for this site allows you to access your order status and
            history. Just fill in the fields below, and we'll get a new account
            set up for you in no time. We will only ask you for information
            necessary to make the purchase process faster and easier.
          </p>
          <button className="bg-[#f7f7f7] text-black px-6 py-2 rounded-full font-semibold shadow">
            <Link href="/signup">Register</Link>
          </button>
        </div>
      </div>
    </div>
    <Footer />
  </div>
    
  );
};

export default Login;
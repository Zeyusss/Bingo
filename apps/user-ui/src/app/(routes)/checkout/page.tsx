'use client'
import {loadStripe,Appearance} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js"
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CheckoutForm from "apps/user-ui/src/shared/components/checkout/checkoutForm";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
const Page = () => {
    const [clientSecret,setClientSecret] = useState("");
    const [cartItems,setCartItems] = useState<any[]>([]);
    const [coupon,setCoupon] = useState();
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    const sessionId = searchParams.get("sessionId");

    useEffect(()=>{
        const fetchSessionAndClientSecret = async()=>{
            if(!sessionId){
                setError("Invalid session. Please try again.");
                setLoading(false);
                return;
            }

            try {
                const verifyRes = await axiosInstance.get(`/order/api/verify-payment-session?sessionId=${sessionId}`);

                const {totalAmount, sellers,cart,coupon} = verifyRes.data.session;

                if(!sellers || sellers.length === 0 || totalAmount === undefined || totalAmount === null){
                    throw new Error("Invalid payment session data.")
                }
                setCartItems(cart);
                setCoupon(coupon);
                const sellerStripeAccountId = sellers[0].stripeAccountId;

                const intentRes = await axiosInstance.post("/order/api/create-payment-intent",
                    {
                        amount : totalAmount,
                        sellerStripeAccountId,
                        sessionId
                    }
                )
                setClientSecret(intentRes.data.clientSecret);
            } catch (error) {
                console.error(error)
                setError("Something went wrong while preparing your payment.")
            } finally{
                setLoading(false);
            }
        };
        fetchSessionAndClientSecret()
    },[sessionId])

    const appearance : Appearance = {
        theme:"stripe",
    }
    if(loading){
        return(
            <div className="flex justify-center items-center min-h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent">
                </div>
            </div>
        )
    }

    if(error){
        return (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className="w-full text-center">
                <div className="flex justify-center mb-4">
                <XCircle className="text-red-500 w-10 h-10"/>
                </div>
<h2 className="text-xl font-semibold text-red-600 mb-2">
Payment Failed
</h2>
<p className="text-sm text-gray-600 mb-6">
{error} <br  className="hidden sm:block"/> Please go back and try checking out again
</p>
<button
onClick={()=>router.push("/cart")}
className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-md hover:bg-blue-500 hover:shadow-lg transition duration-300 ease-in-out"
>
Back to Cart
</button>
                </div>
            </div>
        )
    }
  return (
clientSecret &&(
    <Elements
    stripe={stripePromise}
    options={{clientSecret,appearance}}
    >
    <CheckoutForm
    clientSecret = {clientSecret}
    cartItems = {cartItems}
    coupon = {coupon}
    sessionId= {sessionId}
    />
    </Elements>
)
  )
}

export default Page

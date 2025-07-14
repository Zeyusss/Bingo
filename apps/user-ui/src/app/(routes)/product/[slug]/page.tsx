import ProductDetails from 'apps/user-ui/src/shared/modules/product/product-details.page';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { Metadata } from 'next';
import React from 'react'

async function fetchProductDetails(slug:string){
    const response = await axiosInstance.get(`/product/api/get-product/${slug}`);
    return response.data.product;
}
export async function generateMetadata(props: { params: { slug: string } }): Promise<Metadata> {
    const params = await props.params;
    const product = await fetchProductDetails(params.slug);
    return {
        title : `${product?.title} | Bingo Marketplace`,
        description : product?.short_description || "Discover high-quality products on Bingo Marketplace.",
        openGraph: {
            title : product?.title,
            description:product?.short_description || "",
            images : [product?.images?.[0]?.url || "default-image.jpg"],
            type : "website",
            url: `https://yourdomain.com/product/${product?.slug}`,
        },
        twitter : {
            card : "summary_large_image",
            title : product?.title,
            description : product?.short_description || "",
            images : [product?.images?.[0]?.url || "/default-image.jpg"]
        },
    }
}

const Page = async (props: { params: { slug: string } }) => {
    const params = await props.params;
    const productDetails = await fetchProductDetails(params.slug);
    return (
        <div>
            <ProductDetails productDetails={productDetails}/>
        </div>
    );
}

export default Page

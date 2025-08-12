import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react'

const ImagePlaceHolder = ({size,small,onImageChange,onRemove,defaultImage = null , index= null,setOpenImageModal,setSelectedImage,images,pictureUploadingLoader}:{
    size: string;
    small?:boolean
    onImageChange: (file:File | null,index:number)=> void;
    onRemove?: (index:number)=>void;
    defaultImage?: string | null;
    setOpenImageModal:(openImageModa:boolean)=> void;
    index?:any;
    setSelectedImage : (e:string)=>void;
    images:any;
    pictureUploadingLoader : boolean;

}) => {
    const [imagePreview,setImagePreview] = useState<string | null>(defaultImage);
    const handleFileChange = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const file = event.target.files?.[0];
        if(file){
            setImagePreview(URL.createObjectURL(file));
            onImageChange(file,index!)
        }
    }

    const triggerFileInput = () => {
        const fileInput = document.getElementById(`image-upload-${index}`) as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    return (
    <div className={`relative ${small? "h-[180px] bg-[#1e1e1e] cursor-pointer border border-gray-600 rounded-lg flex justify-center items-center flex-col" : "h-[450px] w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center"}`}>
    <input type="file" accept='image/*' className='hidden' id={`image-upload-${index}`} onChange={handleFileChange} />
    {imagePreview?(
        <>
        <button disabled={pictureUploadingLoader} className='absolute top-3 right-3 p-2 rounded bg-red-600 shadow-lg z-10' type='button' onClick={()=>onRemove?.(index!)}> <X size={16}/> </button>
        <button disabled={pictureUploadingLoader} className="absolute top-3 right-[70px] p-2 !rounded bg-blue-500 shadow-lg cursor-pointer z-10" onClick={()=>{setOpenImageModal(true); setSelectedImage(images[index].file_url);}}> <WandSparkles size={16}/> </button>
        <Image width={400} height={300} src={imagePreview} alt="uploaded" className='w-full h-full object-cover rounded-lg'/>
        </>
    ):(
        <>
        <label className='absolute top-3 right-3 p-2 !rounded bg-[#AF1239] shadow-lg cursor-pointer z-10' htmlFor={`image-upload-${index}`}> <Pencil size={16} color='#ffffff'/></label>
        <div onClick={triggerFileInput} className='w-full h-full flex flex-col justify-center items-center cursor-pointer'>
          <p className={`text-white ${small ? "text-xl" : "text-4xl"} font-semibold`}>{size}</p>
          <p className={`text-white ${small ? "text-sm" : "text-lg"} pt-2 text-center`}>Click here to choose an image <br/> according to the expected ratio</p>
        </div>
        </>
    )}
    </div>
    )
}

export default ImagePlaceHolder

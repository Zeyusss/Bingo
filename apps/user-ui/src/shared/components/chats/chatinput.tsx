import {PickerProps} from "emoji-picker-react";
import dynamic from 'next/dynamic';
import React, { useState } from 'react'
import {Send,ImageIcon,Smile,Loader2} from "lucide-react";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { isProtected } from "apps/user-ui/src/utils/protected";
import { convertToWebP } from "apps/user-ui/src/utils/convertToWebP";

const EmojiPicker = dynamic(
    ()=>import("emoji-picker-react").then((mod)=>mod.default as React.FC<PickerProps>),
    {ssr:false}
)


const ChatInput = ({onSendMessage,message,setMessage,onSendImage}:{
    onSendMessage: (e:any)=> void;
    message:string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    onSendImage?: (imageUrl: string) => void;
}) => {
    const [showEmoji,setShowEmoji] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleEmojiClick = (emojiData:any)=>{
        setMessage((prev)=> prev + emojiData.emoji);
        setShowEmoji(false);
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const base64 = await convertToWebP(file);

            const response = await axiosInstance.post(
                '/api/upload-user-image',
                {
                    image: base64,
                    fileName: file.name,
                },
                isProtected
            );

            if (response.data.success && response.data.imageUrl) {
                // Call the onSendImage callback with the uploaded image URL
                if (onSendImage) {
                    onSendImage(response.data.imageUrl);
                }
            } else {
                setUploadError('Failed to upload image. Please try again.');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            // Reset file input
            e.target.value = '';
        }
    };
  return (
    <form
    onSubmit={onSendMessage}
    className="border-t border-t-gray-200 bg-white px-4 py-3 flex items-center gap-2 relative"
    >
    <label
        className={`cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
    >
        {isUploading ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        ) : (
            <ImageIcon className="w-5 h-5 text-gray-600" />
        )}
        <input 
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            hidden
        />
    </label>
    
    <div className="relative">
    <button
    type="button"
    onClick={()=> setShowEmoji((prev)=> !prev)}
    className="p-2 hover:bg-gray-100 rounded-md"
    >
    <Smile className="w-5 h-5 text-gray-600"/>
    </button>
    {showEmoji && (
        <div className="absolute bottom-12 left-0 z-50">
        <EmojiPicker onEmojiClick={handleEmojiClick}/>
        </div>
    )}
    </div>

    <div className="flex-1">
        <input 
            type="text" 
            value={message}
            onChange={(e)=> setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isUploading}
            className={`w-full px-4 py-2 text-sm border outline-none border-gray-200 rounded-md ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        />
        {uploadError && (
            <p className="text-xs text-red-500 mt-1 px-1">{uploadError}</p>
        )}
    </div>
    <button
        type="submit"
        disabled={isUploading}
        className={`bg-blue-600 hover:bg-blue-700 transition text-white p-2 rounded-md ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
    >
        <Send className="w-4 h-4"/>
    </button>
    </form>
  )
}

export default ChatInput

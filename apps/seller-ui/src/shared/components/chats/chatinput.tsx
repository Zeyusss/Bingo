import {PickerProps} from "emoji-picker-react";
import dynamic from 'next/dynamic';
import React, { useState } from 'react'
import {Send,ImageIcon,Smile, Loader2} from "lucide-react";
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { convertToWebP } from "apps/seller-ui/src/utils/convertToWebP";

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

    const handleEmojiClick = (emojiData:any)=>{
        setMessage((prev)=> prev + emojiData.emoji);
        setShowEmoji(false);
    }

    const handleImageUpload = async (e:React.ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0];
        if(!file) return;


        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        
        try {
            const base64 = await convertToWebP(file);
            const response = await axiosInstance.post('/seller/api/upload-image', {
                file: base64,
                fileName: `chat_${Date.now()}_${file.name}`,
                folder: '/chat-images'
            });
            if (response.data.success && onSendImage) {
                onSendImage(response.data.url);
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    }
  return (
    <form
      onSubmit={onSendMessage}
      className="border-t border-slate-200 bg-white px-6 py-4 flex items-center gap-3 relative"
    >
      <label className={`cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 ${
        isUploading ? 'opacity-50 cursor-not-allowed' : ''
      }`}>
        {isUploading ? (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        ) : (
          <ImageIcon className="w-5 h-5 text-slate-500 hover:text-slate-700" />
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
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
        >
          <Smile className="w-5 h-5 text-slate-500 hover:text-slate-700" />
        </button>
        {showEmoji && (
          <div className="absolute bottom-14 left-0 z-50 shadow-xl">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>

      <input 
        type="text" 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-3 text-sm border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200 bg-slate-50 focus:bg-white"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 text-white p-3 rounded-lg shadow-sm"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}

export default ChatInput

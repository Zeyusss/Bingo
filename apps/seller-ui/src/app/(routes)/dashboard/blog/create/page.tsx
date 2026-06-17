"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useCreateBlog, useUploadBlogImage } from "../../../../../hooks/useBlogs";
import RichTextEditor from "../../../../../shared/components/RichTextEditor";
import { convertToWebP } from "../../../../../utils/convertToWebP";

const CreateBlogPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    coverImage: "",
    content: "",
  });
  const [touched, setTouched] = useState({
    title: false,
    content: false,
  });
  const router = useRouter();
  const createBlog = useCreateBlog();
  const uploadImage = useUploadBlogImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      setErrors((prev) => ({ ...prev, coverImage: "" }));
    } else {
      setFile(null);
      setCoverImage(undefined);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setCoverImage(undefined);
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const validate = () => {
    const newErrors = {
      title: !title.trim() ? "Blog title is required" : "",
      coverImage: !coverImage ? "Cover image is required" : "",
      content:
        content.length < 100
          ? `Content must be at least 100 characters (currently ${content.length})`
          : "",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const canSubmit = useMemo(
    () =>
      title.trim().length > 0 &&
      content.trim().length >= 100 &&
      coverImage &&
      !createBlog.isPending &&
      !isUploadingImage &&
      Object.values(errors).every((error) => !error),
    [title, content, coverImage, createBlog.isPending, errors]
  );

  const handleBlur = (field: "title" | "content") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!canSubmit) return;

    let finalCoverImage = coverImage;

    
    if (file) {
      setIsUploadingImage(true);
      try {
        const webpDataUrl = await convertToWebP(file);
        const base64Data = webpDataUrl.split(',')[1];
        const uploadResult = await uploadImage.mutateAsync({
          file: base64Data,
          fileName: file.name,
          folder: '/blogs/covers'
        });

        finalCoverImage = uploadResult.url;
      } catch (error) {
        console.error('Image upload failed:', error);
        setErrors(prev => ({ ...prev, coverImage: 'Failed to upload image. Please try again.' }));
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    createBlog.mutate({
      title: title.trim(),
      content: content.trim(),
      coverImage: finalCoverImage,
    });
  };

  useEffect(() => {
    if (touched.title || touched.content) {
      validate();
    }
  }, [title, content, touched.title, touched.content]);

  useEffect(() => {
    if (createBlog.isSuccess) router.push("/dashboard/blog");
  }, [createBlog.isSuccess, router]);

  const errorMsg =
    (createBlog.error as any)?.response?.data?.message ||
    (createBlog.error as Error)?.message ||
    null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard/blog"
            className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog List
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-sky-600" />
              Create a New Blog Post
            </h1>
            <p className="mt-2 text-gray-500">
              Share your story, updates, or insights with your followers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={createBlog.isPending}>
              {/* Title Field */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Blog Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur("title")}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.title ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-gray-100`}
                  placeholder="e.g., Our New Summer Collection"
                />
                {errors.title && touched.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Cover Image Field */}
              <div>
                <label
                  htmlFor="coverImage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cover Image
                </label>
                <div className="mt-1 flex items-center">
                  <label
                    htmlFor="file-upload"
                    className={`relative cursor-pointer bg-white py-2 px-3 border ${
                      errors.coverImage ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500`}
                  >
                    <ImageIcon className="h-5 w-5 mr-2 inline-block" />
                    <span>Upload an image</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  {file && (
                    <span className="ml-4 text-sm text-gray-500">
                      {file.name}
                    </span>
                  )}
                </div>
                {errors.coverImage && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.coverImage}
                  </p>
                )}
                {coverImage && (
                  <div className="mt-4 relative bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                    <div className="group relative w-full max-h-96 flex justify-center">
                      <img
                        src={coverImage}
                        alt="Cover Preview"
                        className="max-w-full max-h-96 object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-white/90 text-gray-800 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Field */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content
                </label>
                <div className="mt-1">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your blog post here... You can add images, format text, and create lists."
                    className={errors.content ? "border-red-300" : ""}
                  />
                </div>
                {errors.content && touched.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {content.replace(/<[^>]*>/g, '').length}/100 characters minimum
                </div>
              </div>
            </fieldset>

            {createBlog.isError && (
              <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="font-semibold text-red-700">
                    Failed to create post
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {errorMsg || "An unexpected error occurred."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!canSubmit || isUploadingImage}
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed"
              >
                {(createBlog.isPending || isUploadingImage) && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                {isUploadingImage ? "Uploading Image..." : createBlog.isPending ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;

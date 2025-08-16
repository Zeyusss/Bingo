"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useBlogById, useUpdateBlog, useUploadBlogImage } from "../../../../../../hooks/useBlogs";
import RichTextEditor from "../../../../../../shared/components/RichTextEditor";

const EditBlogPage = () => {
  const params = useParams();
  const router = useRouter();
  const blogId = params.blogId as string;

  const {
    data: blog,
    isLoading: isLoadingBlog,
    isError: isErrorBlog,
    error: blogError,
  } = useBlogById(blogId);

  const updateBlogMutation = useUpdateBlog();
  const uploadImage = useUploadBlogImage();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blog) {
     
      if (blog.status !== "Accepted") {
        setError("Only published blogs can be edited");
       
        const timer = setTimeout(() => router.push("/dashboard/blog"), 3000);
        return () => clearTimeout(timer);
      }
      setTitle(blog.title);
      setContent(blog.content);
      setCoverImage(blog.coverImage || undefined);
    }
  }, [blog, router]);

  useEffect(() => {
    if (updateBlogMutation.isSuccess) {
      router.push("/dashboard/blog");
    }
  }, [updateBlogMutation.isSuccess, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blog) return;

 
    if (blog.status !== "Accepted") {
      setError("Only published blogs can be updated");
      return;
    }

    let finalCoverImage = coverImage;

    
    if (file) {
      setIsUploadingImage(true);
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(file);
        });

        const base64Data = await base64Promise;
        const uploadResult = await uploadImage.mutateAsync({
          file: base64Data,
          fileName: file.name,
          folder: '/blogs/covers'
        });

        finalCoverImage = uploadResult.url;
      } catch (error) {
        console.error('Image upload failed:', error);
        setError('Failed to upload image. Please try again.');
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    updateBlogMutation.mutate({
      blogId,
      title,
      content,
      coverImage: finalCoverImage,
      currentStatus: blog.status,
    });
  };

  if (isLoadingBlog) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        <p className="ml-4 text-lg text-gray-600">Loading blog post...</p>
      </div>
    );
  }

  if (isErrorBlog) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="flex flex-col items-center justify-center p-20 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="mt-4 text-lg font-semibold text-red-700">
            Failed to load blog
          </p>
          <p className="mt-1 text-sm text-red-600">
            {(blogError as Error)?.message || "An unknown error occurred"}
          </p>
          <a
            href="/dashboard/blog"
            className="mt-4 inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog List
          </a>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="flex flex-col items-center justify-center p-20 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="mt-4 text-lg font-semibold text-red-700">
            Cannot Edit Blog
          </p>
          <p className="mt-1 text-sm text-red-600">
            {error || "Blog not found"}
          </p>
          <a
            href="/dashboard/blog"
            className="mt-4 inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard/blog")}
            className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog List
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-sky-600" />
              Edit Published Blog
            </h1>
            <p className="mt-2 text-gray-500">
              Update your published blog post.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={updateBlogMutation.isPending || isUploadingImage}>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Blog Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-gray-50"
                  required
                />
              </div>

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
                    className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500"
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
                    placeholder="Write your blog post content here... You can add images, format text, and create lists."
                    className=""
                  />
                </div>
              </div>
            </fieldset>

            {updateBlogMutation.isError && (
              <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="font-semibold text-red-700">
                    Failed to update post
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {updateBlogMutation.error.message.includes(
                      "Only accepted blogs"
                    )
                      ? "Only published blogs can be edited"
                      : updateBlogMutation.error.message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateBlogMutation.isPending || isUploadingImage}
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed"
              >
                {(updateBlogMutation.isPending || isUploadingImage) && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                {isUploadingImage ? "Uploading Image..." : updateBlogMutation.isPending ? "Updating..." : "Update Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBlogPage;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

declare module "axios" {
  export interface AxiosRequestConfig {
    requireAuth?: boolean;
  }
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export const QUERY_KEYS = {
  MY_BLOGS: ["my-blogs"] as const,
  BLOG_BY_ID: (blogId: string) => ["blog", blogId] as const,
};


export function useMyBlogs() {
  return useQuery<Blog[]>({
    queryKey: QUERY_KEYS.MY_BLOGS,
    queryFn: async () => {
      const response = await axiosInstance.get("/blogs/my-blogs", {
        requireAuth: true,
      });
      return response.data.data;
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (blogId) => {
      await axiosInstance.delete(`/blogs/${blogId}`, { requireAuth: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_BLOGS });
    },
  });
}


export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation<
    Blog,
    Error,
    {
      blogId: string;
      title: string;
      content: string;
      coverImage?: string;
      currentStatus: "Pending" | "Accepted" | "Rejected"; 
    }
  >({
    mutationFn: async ({ blogId, currentStatus, ...updateData }) => {
   
      if (currentStatus !== "Accepted") {
        throw new Error("Only accepted blogs can be updated");
      }

      const response = await axiosInstance.put(`/blogs/${blogId}`, updateData, {
        requireAuth: true,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_BLOGS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BLOG_BY_ID(data.id),
      });
    },

    onError: (error) => {
      console.error("Update blog error:", error);
    },
  });
}


export function useBlogById(blogId: string) {
  return useQuery<Blog>({
    queryKey: QUERY_KEYS.BLOG_BY_ID(blogId),
    queryFn: async () => {
      const response = await axiosInstance.get(`/blogs/${blogId}`);
      return response.data.data;
    },
    enabled: !!blogId,
  });
}


export function useUploadBlogImage() {
  return useMutation<
    { fileId: string; url: string },
    Error,
    { file: string; fileName: string; folder: string }
  >({
    mutationFn: async (uploadData) => {
      const response = await axiosInstance.post("/blogs/upload-image", uploadData, {
        requireAuth: true,
      });
      return response.data;
    },
  });
}


export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation<
    Blog,
    Error,
    { title: string; content: string; coverImage?: string }
  >({
    mutationFn: async (newBlog) => {
      const response = await axiosInstance.post("/blogs", newBlog, {
        requireAuth: true,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_BLOGS });
    },
  });
}

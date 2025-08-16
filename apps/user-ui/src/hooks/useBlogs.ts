import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import useUser from "../hooks/useUser";
import { toast } from "react-hot-toast";


interface User {
  id: string;
  name: string;
  email: string;
  avatar?: {
    url: string;
  };
}

interface BlogComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  isDeleted: boolean;
  blogId: string;
}

interface BlogLike {
  id: string;
  userId: string;
  createdAt: string;
  user: Pick<User, "id" | "name">;
}

interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  shop?: {
    avatar?: {
      url: string;
    };
  };
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage?: string | null;
  author: BlogAuthor;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  updatedAt: string;
  comments: BlogComment[];
  likes: BlogLike[];
  _count: {
    likes: number;
    comments: number;
  };
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  isDeleted: boolean;
}

const API_BASE = "/blogs";


const handleApiError = (error: unknown, defaultMessage: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    throw new Error(axiosError.response?.data?.message || defaultMessage);
  }
  throw new Error(defaultMessage);
};


const fetchPublishedBlogs = async (): Promise<Blog[]> => {
  try {
    const { data } = await axiosInstance.get<{ data: Blog[] }>(API_BASE);
    return data.data || [];
  } catch (error) {
    throw handleApiError(error, "Failed to fetch blogs");
  }
};

const fetchBlogById = async (blogId: string): Promise<Blog> => {
  try {
    const { data } = await axiosInstance.get<{ data: Blog }>(
      `${API_BASE}/${blogId}`
    );
    return data.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch blog");
  }
};

const addBlogComment = async (
  blogId: string,
  content: string
): Promise<BlogComment> => {
  try {
    const { data } = await axiosInstance.post<{ data: BlogComment }>(
      `${API_BASE}/${blogId}/comments`,
      { content }
    );
    return data.data;
  } catch (error) {
    throw handleApiError(error, "Failed to add comment");
  }
};

const toggleBlogLike = async (
  blogId: string
): Promise<{ action: "liked" | "unliked" }> => {
  try {
    const { data } = await axiosInstance.post<{
      data: { action: "liked" | "unliked" };
    }>(`${API_BASE}/${blogId}/likes`);
    return data.data;
  } catch (error) {
    throw handleApiError(error, "Failed to toggle like");
  }
};


export const usePublishedBlogs = (options = {}) => {
  return useQuery<Blog[], Error>({
    queryKey: ["publishedBlogs"],
    queryFn: fetchPublishedBlogs,
    staleTime: 1000 * 60 * 5, 
    ...options,
  });
};

export const useBlogById = (blogId: string, options = {}) => {
  return useQuery<Blog, Error>({
    queryKey: ["blog", blogId],
    queryFn: () => fetchBlogById(blogId),
    enabled: !!blogId,
    ...options,
  });
};

export const useAddComment = (blogId: string) => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation<BlogComment, Error, string>({
    mutationFn: (content: string) => {
      if (!user) throw new Error("Please login to comment");
      if (!content.trim()) throw new Error("Comment cannot be empty");
      return addBlogComment(blogId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
      toast.success("Comment added successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useToggleLike = (blogId: string) => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation<{ action: "liked" | "unliked" }, Error>({
    mutationFn: () => {
      if (!user) throw new Error("Please login to like posts");
      return toggleBlogLike(blogId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};


export const useBlogComments = (blogId: string) => {
  return useQuery<BlogComment[], Error>({
    queryKey: ["blog", blogId, "comments"],
    queryFn: async () => {
      const blog = await fetchBlogById(blogId);
      return blog.comments;
    },
    enabled: !!blogId,
    select: (comments) => comments.filter((comment) => !comment.isDeleted),
  });
};


const updateBlogComment = async (
  commentId: string,
  content: string
): Promise<BlogComment> => {
  try {
    const { data } = await axiosInstance.put<{ data: BlogComment }>(
      `/blogs/comments/${commentId}`,
      { content }
    );
    return data.data;
  } catch (error) {
    throw handleApiError(error, "Failed to update comment");
  }
};

const deleteBlogComment = async (commentId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/blogs/comments/${commentId}`);
  } catch (error) {
    throw handleApiError(error, "Failed to delete comment");
  }
};

const reportBlogComment = async (
  commentId: string,
  reason: string,
  description?: string
): Promise<any> => {
  try {
    const { data } = await axiosInstance.post(
      `/blogs/comments/${commentId}/report`,
      { reason, description }
    );
    return data.data;
  } catch (error) {
    throw handleApiError(error, "Failed to report comment");
  }
};


export const useUpdateComment = (blogId: string) => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation<
    BlogComment,
    Error,
    { commentId: string; content: string }
  >({
    mutationFn: ({ commentId, content }) => {
      if (!user) throw new Error("Please login to edit comments");
      if (!content.trim()) throw new Error("Comment cannot be empty");
      return updateBlogComment(commentId, content);
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
      queryClient.invalidateQueries({ queryKey: ["blog", blogId, "comments"] });
      toast.success("Comment updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteComment = (blogId: string) => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation<void, Error, string>({
    mutationFn: (commentId) => {
      if (!user) throw new Error("Please login to delete comments");
      return deleteBlogComment(commentId);
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
      queryClient.invalidateQueries({ queryKey: ["blog", blogId, "comments"] });
      toast.success("Comment deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useBlogLikes = (blogId: string) => {
  return useQuery<BlogLike[], Error>({
    queryKey: ["blog", blogId, "likes"],
    queryFn: async () => {
      const blog = await fetchBlogById(blogId);
      return blog.likes;
    },
    enabled: !!blogId,
  });
};

export const useRecentPosts = (options = {}) => {
  return useQuery<Blog[], Error>({
    queryKey: ["recentPosts"],
    queryFn: async () => {
      const blogs = await fetchPublishedBlogs();
      
      return blogs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    staleTime: 1000 * 60 * 5, 
    ...options,
  });
};


export const useRecentComments = (options = {}) => {
  return useQuery<BlogComment[], Error>({
    queryKey: ["recentComments"],
    queryFn: async () => {
      const blogs = await fetchPublishedBlogs();
      
      let allComments = blogs.flatMap((blog) => blog.comments);
      
      allComments = allComments.filter((comment) => !comment.isDeleted);
      
      allComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
     
      return allComments.slice(0, 10);
    },
    staleTime: 1000 * 60 * 5, 
    ...options,
  });
};

export const useReportComment = (blogId: string) => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation<
    any,
    Error,
    { commentId: string; reason: string; description?: string }
  >({
    mutationFn: ({ commentId, reason, description }) => {
      if (!user) throw new Error("Please login to report comments");
      return reportBlogComment(commentId, reason, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
      toast.success("Comment reported successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

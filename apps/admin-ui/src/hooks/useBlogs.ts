import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = `${process.env.NEXT_PUBLIC_SERVER_URI}/blogs`;


interface Blog {
  id: string;
  title: string;
  content: string;
  status: "Pending" | "Accepted" | "Rejected";
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CommentReport {
  id: string;
  reason: string;
  description?: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: string;
  reviewedAt?: string;
  comment: {
    id: string;
    content: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    blog: {
      id: string;
      title: string;
    };
  };
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}


const fetchAllBlogs = async (status?: string): Promise<Blog[]> => {

  const { data } = await axios.get(`${API_URL}/admin/all`, {
    params: { status },
    withCredentials: true,
  });
  return data.data;
};

export const useAllBlogs = (status?: string) => {
  return useQuery<Blog[], Error>({
    queryKey: ["allBlogs", status],
    queryFn: () => fetchAllBlogs(status),
  });
};


const publishBlog = async (blogId: string) => {

  const { data } = await axios.put(
    `${API_URL}/admin/${blogId}/publish`,
    {},
    { withCredentials: true }
  );
  return data;
};

export const usePublishBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishBlog,
    onSuccess: () => {
      toast.success("Blog published successfully!");
      queryClient.invalidateQueries({ queryKey: ["allBlogs"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to publish blog.");
    },
  });
};

const rejectBlog = async (blogId: string) => {

  const { data } = await axios.put(
    `${API_URL}/admin/${blogId}/reject`,
    {},
    { withCredentials: true }
  );
  return data;
};

export const useRejectBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectBlog,
    onSuccess: () => {
      toast.success("Blog rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["allBlogs"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject blog.");
    },
  });
};


const fetchCommentReports = async (status?: string): Promise<CommentReport[]> => {
  const { data } = await axios.get(`${API_URL}/admin/reports`, {
    params: { status },
    withCredentials: true,
  });
  return data.data;
};

export const useCommentReports = (status?: string) => {
  return useQuery<CommentReport[], Error>({
    queryKey: ["commentReports", status],
    queryFn: () => fetchCommentReports(status),
  });
};


const reviewCommentReport = async (reportId: string, action: "REVIEWED" | "DISMISSED", deleteComment?: boolean) => {
  const { data } = await axios.put(
    `${API_URL}/admin/reports/${reportId}/review`,
    { action, deleteComment },
    { withCredentials: true }
  );
  return data;
};

export const useReviewCommentReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, action, deleteComment }: { reportId: string; action: "REVIEWED" | "DISMISSED"; deleteComment?: boolean }) =>
      reviewCommentReport(reportId, action, deleteComment),
    onSuccess: () => {
      toast.success("Report reviewed successfully!");
      queryClient.invalidateQueries({ queryKey: ["commentReports"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to review report.");
    },
  });
};

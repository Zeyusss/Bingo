"use client";

import React, { useState, useEffect } from "react";
import { Clock,  AlertCircle, CheckCircle, Eye, Search, ChevronLeft, ChevronRight, Activity, Database, Mail, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import HelpModal, { HelpSection } from "../../shared/components/HelpModal";
import HelpButton from "../../shared/components/HelpButton";

interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  frequency: string;
  service: string;
  category: string;
  isActive: boolean;
  status: 'Success' | 'Failed' | 'Pending' | 'Running';
  lastRun: string | null;
  nextRun: string;
  lastDuration: number | null;
  errorMessage?: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CronJobStats {
  total: number;
  active: number;
  successful: number;
  failed: number;
  running: number;
  pending: number;
  categories: Record<string, number>;
}

export default function CronJobsPage() {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false
  });

  const [stats, setStats] = useState<CronJobStats>({
    total: 0,
    active: 0,
    successful: 0,
    failed: 0,
    running: 0,
    pending: 0,
    categories: {}
  });

  useEffect(() => {
    fetchCronJobs();
    fetchCategories();
  }, [pagination.currentPage, searchTerm, statusFilter, categoryFilter]);

  const fetchCronJobs = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy: 'name',
        sortOrder: 'asc'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const [jobsResponse, statsResponse] = await Promise.all([
        fetch(`/admin/api/cron-jobs/all?${params.toString()}`),
        fetch('/admin/api/cron-jobs/stats')
      ]);

      if (jobsResponse.ok && statsResponse.ok) {
        const jobsData = await jobsResponse.json();
        const statsData = await statsResponse.json();
        
        setCronJobs(jobsData.data.jobs);
        setPagination(jobsData.data.pagination);
        setStats(statsData.data);
      } else {
        toast.error('Failed to fetch cron jobs data');
      }
    } catch (error) {
      console.error('Error fetching cron jobs:', error);
      toast.error('Error loading cron jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/admin/api/cron-jobs/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const viewJobDetails = async (job: CronJob) => {
    try {
      const response = await fetch(`/admin/api/cron-jobs/details/${job.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedJob({ ...job, ...data.data.job });
        setShowJobDetails(true);
      } else {
        toast.error('Failed to fetch job details');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Error loading job details');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Success: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      Failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      Running: { color: 'bg-blue-100 text-blue-800', icon: Activity },
      Pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Email Marketing': Mail,
      'Database Maintenance': Database,
      'Account Management': Users
    };
    return icons[category as keyof typeof icons] || Activity;
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
   
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "The Cron Jobs Management page provides comprehensive monitoring and management of all scheduled tasks across the platform. Monitor job execution, view logs, and track performance metrics.",
      subsections: [
        {
          title: "Job Categories",
          content: "Email Marketing: Automated email campaigns and notifications. Database Maintenance: Cleanup and optimization tasks. Account Management: User and seller account processing."
        },
        {
          title: "Job Status",
          content: "Success: Job completed successfully. Failed: Job encountered errors. Running: Job currently executing. Pending: Job scheduled but not yet started."
        }
      ]
    },
    {
      title: "Features",
      content: "Search and filter jobs by name, status, or category. View detailed execution logs and performance metrics. Monitor job schedules and next run times.",
      subsections: [
        {
          title: "Job Details",
          content: "Click 'View Details' to see execution history, recent logs, performance metrics, and configuration details for any job."
        },
        {
          title: "Filtering",
          content: "Use the search bar to find specific jobs. Filter by status (Success, Failed, Running, Pending) or category to focus on specific job types."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <div >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 mb-6 shadow-sm rounded-md">
        <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cron Jobs Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage scheduled tasks across all services</p>
          </div>
          <HelpButton onClick={() => setShowHelpModal(true)} />
        </div>
        </div>
        </div>


        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successful}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-gray-900">{stats.running}</p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search cron jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

       
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Job Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Last Run
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Next Run
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Frequency
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Duration
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : cronJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No cron jobs found
                    </td>
                  </tr>
                ) : (
                  cronJobs.map((job) => {
                    const CategoryIcon = getCategoryIcon(job.category);
                    return (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3 flex-shrink-0">
                              <CategoryIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">{job.name}</div>
                              <div className="text-xs text-gray-500 truncate">{job.service}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="px-3 py-4 text-xs text-gray-900">
                          <div className="break-words">{formatDate(job.lastRun)}</div>
                        </td>
                        <td className="px-3 py-4 text-xs text-gray-900">
                          <div className="break-words">{formatDate(job.nextRun)}</div>
                        </td>
                        <td className="px-3 py-4 text-xs text-gray-900">
                          <div className="break-words">{job.frequency}</div>
                        </td>
                        <td className="px-3 py-4 text-xs text-gray-900">
                          {formatDuration(job.lastDuration)}
                        </td>
                        <td className="px-3 py-4">
                          <button
                            onClick={() => viewJobDetails(job)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          
          {/* Only show pagination if there are more items than itemsPerPage */}
          {pagination.totalItems > pagination.itemsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => {
                    if (pagination.hasPrev) {
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                    }
                  }}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (pagination.hasNext) {
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                    }
                  }}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => {
                        if (pagination.hasPrev) {
                          setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                        }
                      }}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => {
                        if (pagination.hasNext) {
                          setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                        }
                      }}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

     
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Cron Jobs Management Help"
        description="Learn how to monitor and manage scheduled tasks across the platform"
        sections={helpSections}
      />

      
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Job Details: {selectedJob.name}</h3>
              <button
                onClick={() => setShowJobDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Configuration</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Service:</span> {selectedJob.service}</p>
                  <p><span className="font-medium">Category:</span> {selectedJob.category}</p>
                  <p><span className="font-medium">Schedule:</span> {selectedJob.schedule}</p>
                  <p><span className="font-medium">Frequency:</span> {selectedJob.frequency}</p>
                  <p><span className="font-medium">Status:</span> {getStatusBadge(selectedJob.status)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Execution Info</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Last Run:</span> {formatDate(selectedJob.lastRun)}</p>
                  <p><span className="font-medium">Next Run:</span> {formatDate(selectedJob.nextRun)}</p>
                  <p><span className="font-medium">Duration:</span> {formatDuration(selectedJob.lastDuration)}</p>
                  {selectedJob.errorMessage && (
                    <p><span className="font-medium text-red-600">Error:</span> {selectedJob.errorMessage}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{selectedJob.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

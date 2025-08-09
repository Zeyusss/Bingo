'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import  useRequireAuth from 'apps/user-ui/src/hooks/useRequiredAuth';
import  QuickActionCard  from 'apps/user-ui/src/shared/components/cards/quick-action.card';
import  ChangePassword  from 'apps/user-ui/src/shared/components/change-password';
import  ShippingAddressSection  from 'apps/user-ui/src/shared/components/shippingAddress';
import  OrdersTable  from  'apps/user-ui/src/shared/components/tables/orders-table';

import  ProfilePictureUpload  from 'apps/user-ui/src/shared/components/profile/ProfilePictureUpload';
import { 
  Award, 
  BadgeCheck, 
  Bell, 
  Camera, 
  CheckCircle, 
  Clock, 
  Edit3, 
  Gift, 
  Heart, 
  Inbox, 
  Lock, 
  LogOut, 
  MapPin, 
  PhoneCall, 
  Settings, 
  ShoppingBag, 
  User, 
  Star,
  X
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';

const Page = () => {
  const { user, isLoading } = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
    },
  });


  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const response = await axiosInstance.put('/api/update-user-profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditProfileModalOpen(false);
      reset();
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });


  const handleOpenEditModal = () => {
    if (user) {
      setValue('name', user.name || '');
      setValue('phone', user.phone || '');
    }
    setIsEditProfileModalOpen(true);
  };


  const onSubmitProfileEdit = (data: { name: string; phone: string }) => {
    updateProfile(data);
  };


  const { data: ordersData } = useQuery({
    queryKey: ['userOrders'],
    queryFn: async () => {
      const response = await axios.get('/order/api/get-user-orders');
      return response.data;
    },
    enabled: !!user,
  });

  const orders = ordersData?.orders || [];
  const totalOrders = orders.length || 0;
  const processingOrders = orders.filter((order: any) => order.deliveryStatus === 'Processing').length || 0;
  const completedOrders = orders.filter((order: any) => order.deliveryStatus === 'Delivered').length || 0;
  const recentOrders = orders.slice(0, 3) || [];

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/api/logout');
      queryClient.clear();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  const NavItem = ({ icon: Icon, label, isActive, onClick, danger = false }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
          : danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : danger ? 'text-red-600' : 'text-gray-500'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const StatCard = ({ icon: Icon, title, value, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg ${
          color === 'blue' ? 'bg-blue-100' : 
          color === 'green' ? 'bg-green-100' : 
          color === 'orange' ? 'bg-orange-100' : 'bg-gray-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'blue' ? 'text-blue-600' : 
            color === 'green' ? 'text-green-600' : 
            color === 'orange' ? 'text-orange-600' : 'text-gray-600'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-gray-600 text-sm">{title}</p>
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );

  const Section = ({ title, children, action }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const Info = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">{label}</span>
      </div>
      <span className="font-medium text-gray-900">{value || 'Not provided'}</span>
    </div>
  );

  const OrderCard = ({ order }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Order #{order.id?.slice(-8)}</p>
          <p className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 mb-1">${order.total?.toFixed(2) || '0.00'}</p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.deliveryStatus || 'Processing')}`}>
          {order.deliveryStatus || 'Processing'}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="relative inline-block group">
                  <img
                    src={user?.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow"
                  />
                  <button 
                    onClick={() => setIsProfilePictureModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <BadgeCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Verified Account</span>
                </div>
              </div>
              <nav className="space-y-2">
                <NavItem
                  icon={User}
                  label="Profile"
                  isActive={activeTab === "Profile"}
                  onClick={() => setActiveTab("Profile")}
                />
                <NavItem
                  icon={ShoppingBag}
                  label="My Orders"
                  isActive={activeTab === "My Orders"}
                  onClick={() => setActiveTab("My Orders")}
                />
                <NavItem
                  icon={Heart}
                  label="Wishlist"
                  isActive={activeTab === "Wishlist"}
                  onClick={() => router.push('/wishlist')}
                />
                <NavItem
                  icon={Inbox}
                  label="Inbox"
                  isActive={activeTab === "Inbox"}
                  onClick={() => router.push('/inbox')}
                />
                <NavItem
                  icon={Bell}
                  label="Notifications"
                  isActive={activeTab === "Notifications"}
                  onClick={() => setActiveTab("Notifications")}
                />
                <NavItem
                  icon={MapPin}
                  label="Shipping Address"
                  isActive={activeTab === "Shipping Address"}
                  onClick={() => setActiveTab("Shipping Address")}
                />
                <NavItem
                  icon={Lock}
                  label="Change Password"
                  isActive={activeTab === "Change Password"}
                  onClick={() => setActiveTab("Change Password")}
                />
                <div className="border-t pt-4 mt-4">
                  <NavItem
                    icon={LogOut}
                    label="Logout"
                    isActive={false}
                    onClick={handleLogout}
                    danger={true}
                  />
                </div>
              </nav>
            </div>
          </div>
          <div className="lg:w-1/2">
            {activeTab === "Profile" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    icon={ShoppingBag}
                    title="Total Orders"
                    value={totalOrders}
                    color="blue"
                  />
                  <StatCard
                    icon={Clock}
                    title="Processing"
                    value={processingOrders}
                    color="orange"
                  />
                  <StatCard
                    icon={CheckCircle}
                    title="Completed"
                    value={completedOrders}
                    color="green"
                  
                  />
                </div>
                <Section 
                  title="Account Information"
                  action={
                    <button 
                      onClick={handleOpenEditModal}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                  }
                >
                  <div className="space-y-1">
                    <Info label="Full Name" value={user?.name} icon={User} />
                    <Info label="Email Address" value={user?.email} icon={Inbox} />
                    <Info label="Phone Number" value={user?.phone} icon={PhoneCall} />
                    <Info label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} icon={BadgeCheck} />
                  </div>
                </Section>
                <Section title="Recent Orders">
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order: any) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                      <div className="text-center pt-4">
                        <button 
                          onClick={() => setActiveTab("My Orders")}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                          View All Orders →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No orders yet</p>
                      <button 
                        onClick={() => router.push('/')}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {activeTab === "My Orders" && (
              <Section title="My Orders">
                <OrdersTable />
              </Section>
            )}

            {activeTab === "Notifications" && (
              <Section title="Notifications">
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              </Section>
            )}

            {activeTab === "Shipping Address" && (
              <Section title="Shipping Address">
                <ShippingAddressSection />
              </Section>
            )}

            {activeTab === "Change Password" && (
              <Section title="Change Password">
                <ChangePassword />
              </Section>
            )}
          </div>
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-4">
                <QuickActionCard
                  Icon={Heart}
                  title="Wishlist"
                  description="View your saved items and favorites"
                  color="red"
                />
                <QuickActionCard
                  Icon={Gift}
                  title="Rewards"
                  description="Check your loyalty points and rewards"
                  color="purple"
                />
                <QuickActionCard
                  Icon={Settings}
                  title="Account Settings"
                  description="Manage your preferences and privacy"
                  color="gray"
                />
                <QuickActionCard
                  Icon={Award}
                  title="Achievements"
                  description="View your shopping milestones"
                  color="yellow"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProfilePictureUpload
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        currentAvatar={user?.avatar?.url}
        onUploadSuccess={(imageUrl: string) => {
          queryClient.invalidateQueries({ queryKey: ['user'] });
          setIsProfilePictureModalOpen(false);
        }}
      />
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl relative">
            <button
              onClick={() => setIsEditProfileModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Edit Profile
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Update your name and phone number
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmitProfileEdit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name", { 
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters"
                    }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: "Invalid phone number format",
                    },
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;

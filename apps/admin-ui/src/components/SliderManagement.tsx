"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Image as ImageIcon, GripVertical, Calendar, Clock } from "lucide-react";
import { Button } from "../shared/components/ui/button";
import { Input } from "../shared/components/ui/input";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "../shared/components/ui/modal";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

interface Slider {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  textColor?: string;
  textPosition?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  buttonText?: string;
  buttonColor?: string;
  buttonUrl?: string;
  autoplaySpeed?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SliderFormData {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  textColor: string;
  textPosition: 'left' | 'center' | 'right';
  overlayOpacity: number;
  buttonText: string;
  buttonColor: string;
  buttonUrl: string;
  autoplaySpeed: number;
}

interface ImageUploadState {
  uploading: boolean;
  dragOver: boolean;
  previewUrl: string | null;
  file: File | null;
}

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  dragOverIndex: number | null;
}

const SliderCard = ({ slider, onEdit, onDelete, onToggleStatus, index, onDragStart, onDragOver, onDrop, onDragEnd, dragState }: {
  slider: Slider;
  onEdit: (slider: Slider) => void;
  onDelete: (slider: Slider) => void;
  onToggleStatus: (slider: Slider) => void;
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  dragState: DragState;
}) => {
  const isDragging = dragState.draggedIndex === index;
  const isDragOver = dragState.dragOverIndex === index;
  
  return (
    <div className="mb-4">
      <div 
        className={`border rounded-lg hover:shadow-md transition-all duration-200 p-4 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 opacity-50 transform rotate-2' 
            : isDragOver 
            ? 'border-green-500 bg-green-50 border-dashed' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDrop={(e) => onDrop(e, index)}
        onDragEnd={onDragEnd}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <div className="flex-shrink-0 cursor-move hover:text-blue-600 transition-colors">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Image Preview */}
            <div className="flex-shrink-0">
              <img
                src={slider.imageUrl || "/placeholder-image.jpg"}
                alt={slider.title}
                className="w-24 h-16 object-cover rounded-md border"
                onError={(e: any) => {
                  e.currentTarget.src = "/placeholder-image.jpg";
                }}
              />
            </div>

            {/* Slider Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{slider.title}</h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      #{slider.position + 1}
                    </span>
                  </div>
                  {slider.description && (
                    <p className="text-sm text-gray-600 mb-2">{slider.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Position: {slider.position}</span>
                    <span>Created: {new Date(slider.createdAt).toLocaleDateString()}</span>
                    {slider.startDate && (
                      <span className="text-green-600 font-medium">
                        📅 Starts: {new Date(slider.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {slider.endDate && (
                      <span className="text-red-600 font-medium">
                        ⏰ Ends: {new Date(slider.endDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-blue-600 font-medium">🔄 Drag to reorder</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(slider)}
                    className="p-2"
                  >
                    {slider.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(slider)}
                    className="p-2"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(slider)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SliderManagement = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [sliderToDelete, setSliderToDelete] = useState<Slider | null>(null);
  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    uploading: false,
    dragOver: false,
    previewUrl: null,
    file: null
  });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    dragOverIndex: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SliderFormData>({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    startDate: "",
    endDate: "",
    textColor: "#ffffff",
    textPosition: "left",
    overlayOpacity: 0.3,
    buttonText: "Learn More",
    buttonColor: "#000000",
    buttonUrl: "",
    autoplaySpeed: 6000,
  });

  const fetchSliders = async () => {
    try {
      const response = await axiosInstance.get("/admin/api/sliders");
      
      if (response.data && response.data.success) {
        setSliders(response.data.data);
      } else {
        toast.error("Failed to load sliders");
      }
    } catch (error: any) {
      toast.error("Failed to fetch sliders");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setImageUpload(prev => ({ ...prev, uploading: true, file }));
      
      const previewUrl = URL.createObjectURL(file);
      setImageUpload(prev => ({ ...prev, previewUrl }));
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const response = await axiosInstance.post('/admin/api/sliders/upload-image', {
        file: base64,
        fileName: `slider_${Date.now()}_${file.name}`,
        folder: "/sliders",
      });
      
      if (response.data.success) {
        const imageUrl = response.data.imageUrl;
        setFormData(prev => ({ ...prev, imageUrl }));
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload image. Using preview for now.');
    } finally {
      setImageUpload(prev => ({ ...prev, uploading: false }));
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  useEffect(() => {
    return () => {
      if (imageUpload.previewUrl) {
        URL.revokeObjectURL(imageUpload.previewUrl);
      }
    };
  }, [imageUpload.previewUrl]);


  const handleSubmit = async () => {
    const hasImage = formData.imageUrl.trim() || imageUpload.previewUrl;
    if (!formData.title.trim() || !hasImage) {
      toast.error("Title and image are required");
      return;
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        toast.error("End date must be after start date");
        return;
      }
    }

    try {
      setLoading(true);
      
      if (editingSlider) {
        await axiosInstance.put(`/admin/api/sliders/${editingSlider.id}`, formData);
        toast.success("Slider updated successfully");
      } else {
        await axiosInstance.post("/admin/api/sliders", formData);
        toast.success("Slider created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchSliders();
    } catch (error) {
      toast.error("Failed to save slider");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sliderToDelete) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/admin/api/sliders/${sliderToDelete.id}`);
      toast.success("Slider deleted successfully");
      setIsDeleteModalOpen(false);
      setSliderToDelete(null);
      fetchSliders();
    } catch (error) {
      toast.error("Failed to delete slider");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (slider: Slider) => {
    try {
      await axiosInstance.put(`/admin/api/sliders/${slider.id}`, { 
        ...slider, 
        isActive: !slider.isActive 
      });
      toast.success(`Slider ${!slider.isActive ? "activated" : "deactivated"}`);
      fetchSliders();
    } catch (error) {
      toast.error("Failed to update slider status");
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    setDragState({
      isDragging: true,
      draggedIndex: index,
      dragOverIndex: null
    });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState(prev => ({
      ...prev,
      dragOverIndex: index
    }));
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null
    });
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const { draggedIndex } = dragState;
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    try {
      const newSliders = [...sliders];
      const draggedSlider = newSliders[draggedIndex];
      
      newSliders.splice(draggedIndex, 1);
      newSliders.splice(dropIndex, 0, draggedSlider);
      
      const updatedSliders = newSliders.map((slider, index) => ({
        ...slider,
        position: index
      }));
      
      setSliders(updatedSliders);
      
      const sliderIds = updatedSliders.map(slider => slider.id);
      await axiosInstance.put('/admin/api/sliders/reorder', { sliderIds });
      
      toast.success('Slider order updated successfully');
    } catch (error) {
      toast.error('Failed to update slider order');
      fetchSliders();
    } finally {
      handleDragEnd();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      startDate: "",
      endDate: "",
      textColor: "#ffffff",
      textPosition: "left",
      overlayOpacity: 0.3,
      buttonText: "Learn More",
      buttonColor: "#000000",
      buttonUrl: "",
      autoplaySpeed: 6000,
    });
    setImageUpload({
      uploading: false,
      dragOver: false,
      previewUrl: null,
      file: null
    });
    setEditingSlider(null);
  };

  const openEditModal = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      description: slider.description || "",
      imageUrl: slider.imageUrl,
      linkUrl: slider.linkUrl || "",
      isActive: slider.isActive,
      startDate: slider.startDate ? new Date(slider.startDate).toISOString().slice(0, 16) : "",
      endDate: slider.endDate ? new Date(slider.endDate).toISOString().slice(0, 16) : "",
      textColor: slider.textColor || "#ffffff",
      textPosition: slider.textPosition || "left",
      overlayOpacity: slider.overlayOpacity || 0.3,
      buttonText: slider.buttonText || "Learn More",
      buttonColor: slider.buttonColor || "#000000",
      buttonUrl: slider.buttonUrl || "",
      autoplaySpeed: slider.autoplaySpeed || 6000,
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (slider: Slider) => {
    setSliderToDelete(slider);
    setIsDeleteModalOpen(true);
  };

  if (loading && sliders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading sliders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Slider Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage homepage slides
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Slide
          </Button>
        </div>
      </div>

      <div className="p-6">
        {sliders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No slides yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first slide to get started.
            </p>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Add Your First Slide
            </Button>
          </div>
        ) : (
          <div>
            {sliders.map((slider, index) => (
              <SliderCard
                key={slider.id}
                slider={slider}
                index={index}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onToggleStatus={handleToggleStatus}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                dragState={dragState}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>
              {editingSlider ? "Edit Slide" : "Add New Slide"}
            </ModalTitle>
            <ModalDescription>
              {editingSlider
                ? "Update the slide information below."
                : "Create a new slide for your homepage."}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                placeholder="Enter slide title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter slide description (optional)"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slider Image *
              </label>
              
              {/* Image Upload Area */}
              <div className="space-y-4">
                {/* Drag & Drop Upload Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    imageUpload.dragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setImageUpload(prev => ({ ...prev, dragOver: true }));
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setImageUpload(prev => ({ ...prev, dragOver: false }));
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageUpload(prev => ({ ...prev, dragOver: false }));
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      handleFileSelect(files[0]);
                    }
                  }}
                >
                  {imageUpload.uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm text-gray-600">Uploading image...</p>
                    </div>
                  ) : imageUpload.previewUrl || formData.imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={imageUpload.previewUrl || formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            e.currentTarget.src = "/placeholder-image.jpg";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageUpload(prev => ({ ...prev, previewUrl: null, file: null }));
                            setFormData(prev => ({ ...prev, imageUrl: '' }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">Click to change image or drag a new one here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Drag and drop an image here, or click to select</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                {/* Upload Button */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUpload.uploading}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose Image</span>
                  </Button>
                </div>
                
                {/* Manual URL Input */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or enter URL manually</span>
                  </div>
                </div>
                
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImageUpload(prev => ({ ...prev, previewUrl: null, file: null }));
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <Input
                placeholder="https://example.com (optional)"
                value={formData.linkUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, linkUrl: e.target.value })}
              />
            </div>

            {/* Scheduling Section */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduling (Optional)
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">When should this slider start showing?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">When should this slider stop showing?</p>
                </div>
              </div>
              
              {/* Scheduling Status */}
              {(formData.startDate || formData.endDate) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Scheduling Active:</span>
                  </div>
                  <div className="mt-1 text-xs text-blue-700">
                    {formData.startDate && !formData.endDate && (
                      <span>Slider will show starting {new Date(formData.startDate).toLocaleString()}</span>
                    )}
                    {!formData.startDate && formData.endDate && (
                      <span>Slider will show until {new Date(formData.endDate).toLocaleString()}</span>
                    )}
                    {formData.startDate && formData.endDate && (
                      <span>
                        Slider will show from {new Date(formData.startDate).toLocaleString()} to {new Date(formData.endDate).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Styling Options */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Advanced Styling</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <Input
                      placeholder="#ffffff"
                      value={formData.textColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, textColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Position
                  </label>
                  <select
                    value={formData.textPosition}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, textPosition: e.target.value as 'left' | 'center' | 'right' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overlay Opacity ({Math.round(formData.overlayOpacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.overlayOpacity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autoplay Speed (ms)
                  </label>
                  <Input
                    type="number"
                    min="1000"
                    max="10000"
                    step="500"
                    value={formData.autoplaySpeed}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, autoplaySpeed: parseInt(e.target.value) || 6000 })}
                  />
                </div>
              </div>
            </div>

            {/* Button Customization */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">🔘 Button Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <Input
                    placeholder="Learn More"
                    value={formData.buttonText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, buttonText: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.buttonColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <Input
                      placeholder="#000000"
                      value={formData.buttonColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Link URL
                  </label>
                  <Input
                    placeholder="https://example.com/page (where button should navigate)"
                    value={formData.buttonUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, buttonUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">URL where users will be redirected when they click the button</p>
                </div>
              </div>
            </div>

            {/* Slider Preview */}
            <div className="border-t pt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  {(formData.imageUrl || imageUpload.previewUrl) ? (
                    <>
                      <img
                        src={formData.imageUrl || imageUpload.previewUrl || ''}
                        alt="Slider preview"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop";
                        }}
                      />
                      {formData.title && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ 
                            backgroundColor: `rgba(0, 0, 0, ${(formData.overlayOpacity || 40) / 100})` 
                          }}
                        >
                          <div 
                            className={`text-center p-4 ${
                              formData.textPosition === 'left' ? 'text-left mr-auto ml-8' :
                              formData.textPosition === 'right' ? 'text-right ml-auto mr-8' :
                              'text-center'
                            }`}
                            style={{ color: formData.textColor || '#ffffff' }}
                          >
                            <h3 className="text-xl font-bold mb-2">{formData.title}</h3>
                            {formData.description && (
                              <p className="text-sm opacity-90 mb-3">{formData.description}</p>
                            )}
                            {formData.buttonText && (
                              <button 
                                className="px-4 py-2 rounded font-medium text-sm transition-colors hover:opacity-90"
                                style={{ 
                                  backgroundColor: formData.buttonColor || '#3b82f6',
                                  color: '#ffffff'
                                }}
                                title={formData.buttonUrl ? `Links to: ${formData.buttonUrl}` : 'No link URL set'}
                              >
                                {formData.buttonText}
                                {formData.buttonUrl && (
                                  <span className="ml-1 text-xs opacity-75">→</span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm">Upload an image to see preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (visible on homepage)
              </label>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : editingSlider ? "Update Slide" : "Create Slide"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Slide</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete "{sliderToDelete?.title}"? This action cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SliderManagement;

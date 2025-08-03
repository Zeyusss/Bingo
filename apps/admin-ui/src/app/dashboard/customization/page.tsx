"use client";

import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, Edit, GripVertical } from "lucide-react";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Modal } from "../../shared/components/ui/modal";
import HelpModal, { HelpSection } from "../../shared/components/HelpModal";
import HelpButton from "../../shared/components/HelpButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/components/ui/table";
import { toast } from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


type Category = {
  id: string;
  name: string;
  subcategories: Subcategory[];
};

type Subcategory = {
  id: string;
  name: string;
  categoryId: string;
};


const SortableCategoryRow = ({
  category,
  onDeleteCategory,
  onDeleteSubcategory,
}: {
  category: Category;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryId: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50" : ""}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical size={16} className="text-gray-400" />
          </div>
          <div className="font-medium text-gray-900">{category.name}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {category.subcategories.length === 0 ? (
            <span className="text-gray-400 text-sm">No subcategories</span>
          ) : (
            category.subcategories.map((sub) => (
              <SortableSubcategoryItem
                key={sub.id}
                subcategory={sub}
                onDelete={onDeleteSubcategory}
              />
            ))
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteCategory(category.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={16} />
        </Button>
      </TableCell>
    </TableRow>
  );
};


const SortableSubcategoryItem = ({
  subcategory,
  onDelete,
}: {
  subcategory: Subcategory;
  onDelete: (categoryId: string, subcategoryId: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subcategory.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 border rounded ${
        isDragging ? "opacity-50 bg-blue-50" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
        >
          <GripVertical size={14} className="text-gray-400" />
        </div>
        <span className="text-sm text-gray-600">{subcategory.name}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(subcategory.categoryId, subcategory.id)}
        className="text-red-600 hover:text-red-800 p-1 h-auto"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
};

const CustomizationPage: React.FC = () => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "The Customization page provides comprehensive control over your platform's visual and organizational elements. Manage categories, configure sliders, and organize gallery content to create an engaging user experience.",
      subsections: [
        {
          title: "Category Management",
          content: "Create, organize, and manage product categories and subcategories with drag-and-drop functionality"
        },
        {
          title: "Visual Customization",
          content: "Configure sliders, banners, and gallery displays for enhanced visual appeal"
        },
        {
          title: "Content Organization",
          content: "Structure your platform content for optimal user navigation and discovery"
        }
      ]
    },
    {
      title: "Category Management",
      content: "Comprehensive category organization tools:",
      subsections: [
        {
          title: "Add Categories",
          content: "Create new main categories to organize your products and services"
        },
        {
          title: "Add Subcategories",
          content: "Create subcategories within existing categories for detailed organization"
        },
        {
          title: "Drag & Drop Reordering",
          content: "Easily reorder categories and subcategories by dragging them to new positions"
        },
        {
          title: "Search & Filter",
          content: "Quickly find specific categories or subcategories using the search function"
        }
      ]
    },
    {
      title: "Visual Elements",
      content: "Customize your platform's visual appearance:",
      subsections: [
        {
          title: "Slider Configuration",
          content: "Manage homepage sliders, promotional banners, and featured content displays"
        },
        {
          title: "Gallery Management",
          content: "Organize and display image galleries, product showcases, and visual content"
        },
        {
          title: "Layout Control",
          content: "Configure how content is displayed and organized across your platform"
        }
      ]
    },
    {
      title: "Advanced Features",
      content: "Powerful customization capabilities:",
      subsections: [
        {
          title: "Bulk Operations",
          content: "Perform bulk actions on multiple categories or subcategories simultaneously"
        },
        {
          title: "Import/Export",
          content: "Import category structures or export existing configurations for backup"
        },
        {
          title: "Template Management",
          content: "Create and manage templates for consistent category and content organization"
        }
      ]
    },
    {
      title: "Best Practices",
      content: "Effective customization strategies:",
      subsections: [
        {
          title: "User Experience",
          content: "Organize categories logically and maintain consistent naming conventions"
        },
        {
          title: "Performance",
          content: "Optimize images and content for fast loading times and smooth navigation"
        },
        {
          title: "Maintenance",
          content: "Regularly review and update categories, remove unused items, and keep content fresh"
        }
      ]
    }
  ];

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("category");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);


  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [deleteItem, setDeleteItem] = useState<{
    type: "category" | "subcategory";
    category: string;
    subcategory?: string;
  } | null>(null);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/admin/api/config`);
      const data = res.data;

      const transformedCategories = (data.categories || []).map(
        (cat: string, index: number) => ({
          id: `category-${index}`,
          name: cat,
          subcategories: Array.isArray(data.subCategories?.[cat])
            ? data.subCategories[cat].map((sub: string, subIndex: number) => ({
                id: `subcategory-${index}-${subIndex}`,
                name: sub,
                categoryId: `category-${index}`,
              }))
            : [],
        })
      );

      setCategories(transformedCategories);
    } catch (e) {
      setCategories([]);
      setError("Failed to fetch from API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.subcategories.some((sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );


  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    setIsReordering(true);

    try {
      if (activeId.startsWith("category-")) {
        const oldIndex = categories.findIndex((cat) => cat.id === activeId);
        const newIndex = categories.findIndex((cat) => cat.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newCategories = arrayMove(categories, oldIndex, newIndex);
          setCategories(newCategories);


          const categoryNames = newCategories.map((cat) => cat.name);
          const res = await axiosInstance.put(
            `/admin/api/config/categories/reorder`,
            { categories: categoryNames }
          );

          toast.success("Category order updated!");
        }
      }
      else if (activeId.startsWith("subcategory-")) {
        const activeSubcategory = categories
          .flatMap((cat) => cat.subcategories)
          .find((sub) => sub.id === activeId);

        if (!activeSubcategory) return;

        if (overId.startsWith("category-")) {
          const targetCategory = categories.find((cat) => cat.id === overId);
          if (!targetCategory) return;

          const newCategories = categories.map((cat) => {
            if (cat.id === activeSubcategory.categoryId) {
              return {
                ...cat,
                subcategories: cat.subcategories.filter(
                  (sub) => sub.id !== activeId
                ),
              };
            } else if (cat.id === overId) {
              return {
                ...cat,
                subcategories: [
                  ...cat.subcategories,
                  {
                    ...activeSubcategory,
                    categoryId: cat.id,
                  },
                ],
              };
            }
            return cat;
          });

          setCategories(newCategories);

          const sourceCategory = categories.find(
            (cat) => cat.id === activeSubcategory.categoryId
          );
          if (!sourceCategory) throw new Error("Source category not found");

          const res = await axiosInstance.put(
            `/admin/api/config/subcategories/move`,
            {
              subcategoryName: activeSubcategory.name,
              fromCategory: sourceCategory.name,
              toCategory: targetCategory.name,
            }
          );

          toast.success("Subcategory moved to new category!");
        }
        else if (overId.startsWith("subcategory-")) {
          const overSubcategory = categories
            .flatMap((cat) => cat.subcategories)
            .find((sub) => sub.id === overId);

          if (
            !overSubcategory ||
            activeSubcategory.categoryId !== overSubcategory.categoryId
          )
            return;

          const category = categories.find(
            (cat) => cat.id === activeSubcategory.categoryId
          );
          if (!category) return;

          const oldIndex = category.subcategories.findIndex(
            (sub) => sub.id === activeId
          );
          const newIndex = category.subcategories.findIndex(
            (sub) => sub.id === overId
          );

          if (oldIndex !== -1 && newIndex !== -1) {
            const newSubcategories = arrayMove(
              category.subcategories,
              oldIndex,
              newIndex
            );
            const newCategories = categories.map((cat) =>
              cat.id === category.id
                ? { ...cat, subcategories: newSubcategories }
                : cat
            );

            setCategories(newCategories);

            const subcategoryNames = newSubcategories.map((sub) => sub.name);
            const res = await axiosInstance.put(
              `/admin/api/config/subcategories/reorder`,
              {
                categoryName: category.name,
                subcategories: subcategoryNames,
              }
            );

            toast.success("Subcategory order updated!");
          }
        }
      }
    } catch (error) {
      await fetchCategories();
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsReordering(false);
    }
  };
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post(`/admin/api/config/category`, {
        categoryName: newCategory
      });
      await fetchCategories();
      setNewCategory("");
      setIsAddCategoryModalOpen(false);
      toast.success("Category added successfully!");
    } catch {
      toast.error("Failed to add category.");
    } finally {
      setLoading(false);
    }
  };
  const handleAddSubcategory = async () => {
    if (!selectedCategory || !newSubcategory.trim()) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post(`/admin/api/config/subcategory`, {
        categoryName: selectedCategory,
        subcategoryName: newSubcategory,
      });
      await fetchCategories();
      setNewSubcategory("");
      setSelectedCategory("");
      setIsAddSubcategoryModalOpen(false);
      toast.success("Subcategory added successfully!");
    } catch {
      toast.error("Failed to add subcategory.");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);
      if (deleteItem.type === "category") {
        const res = await axiosInstance.delete(
          `/admin/api/config/category/${encodeURIComponent(
            deleteItem.category
          )}`
        );
        toast.success("Category deleted successfully!");
      } else {
        const res = await axiosInstance.delete(
          `/admin/api/config/subcategory/${encodeURIComponent(
            deleteItem.category
          )}/${encodeURIComponent(deleteItem.subcategory!)}`
        );
        toast.success("Subcategory deleted successfully!");
      }
      await fetchCategories();
    } catch {
      toast.error("Failed to delete item.");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteItem(null);
    }
  };

  const openDeleteModal = (
    type: "category" | "subcategory",
    category: string,
    subcategory?: string
  ) => {
    setDeleteItem({ type, category, subcategory });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      openDeleteModal("category", category.name);
    }
  };

  const handleDeleteSubcategory = (
    categoryId: string,
    subcategoryId: string
  ) => {
    const category = categories.find((cat) => cat.id === categoryId);
    const subcategory = category?.subcategories.find(
      (sub) => sub.id === subcategoryId
    );
    if (category && subcategory) {
      openDeleteModal("subcategory", category.name, subcategory.name);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">
            Error loading customization data
          </h3>
          <p className="text-red-600 text-sm mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customization</h1>
          <p className="text-gray-600 mt-1">
            Manage your store's categories, slider, and gallery
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {filteredCategories.length} categories
          </div>
          <HelpButton
            onClick={() => setShowHelpModal(true)}
            text="Customization Help"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search categories and subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Category
          </Button>
          <Button
            onClick={() => setIsAddSubcategoryModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Subcategory
          </Button>
        </div>
      </div>
      <div className="flex border-b">
        {[
          { label: "Categories", key: "category" },
          { label: "Slider", key: "slider" },
          { label: "Gallery", key: "gallery" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-6 py-2 -mb-px font-medium border-b-2 transition-colors duration-150 focus:outline-none ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "category" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isReordering && (
              <div className="bg-blue-50 border-b border-blue-200 p-3">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium">Saving changes...</span>
                </div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>Loading categories...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-gray-500"
                    >
                      {searchTerm
                        ? "No categories found matching your search"
                        : "No categories found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={[
                      ...filteredCategories.map((cat) => cat.id),
                      ...filteredCategories.flatMap((cat) =>
                        cat.subcategories.map((sub) => sub.id)
                      ),
                    ]}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredCategories.map((cat) => (
                      <SortableCategoryRow
                        key={cat.id}
                        category={cat}
                        onDeleteCategory={handleDeleteCategory}
                        onDeleteSubcategory={handleDeleteSubcategory}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </div>
        </DndContext>
      )}

      {activeTab === "slider" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-medium mb-2">Slider Customization</h3>
            <p>Slider customization features coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === "gallery" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-medium mb-2">Gallery Customization</h3>
            <p>Gallery customization features coming soon...</p>
          </div>
        </div>
      )}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add New Category"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <Input
              type="text"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={loading || !newCategory.trim()}
            >
              {loading ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isAddSubcategoryModalOpen}
        onClose={() => setIsAddSubcategoryModalOpen(false)}
        title="Add New Subcategory"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading || categories.length === 0}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory Name
            </label>
            <Input
              type="text"
              placeholder="Enter subcategory name"
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              disabled={loading || !selectedCategory}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddSubcategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSubcategory}
              disabled={loading || !selectedCategory || !newSubcategory.trim()}
            >
              {loading ? "Adding..." : "Add Subcategory"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={
          deleteItem?.type === "category"
            ? "Delete Category"
            : "Delete Subcategory"
        }
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {deleteItem?.type === "category" ? (
              <>
                Are you sure you want to delete category{" "}
                <span className="font-semibold">{deleteItem.category}</span>?
                This will also delete all its subcategories.
              </>
            ) : (
              <>
                Are you sure you want to delete subcategory{" "}
                <span className="font-semibold">{deleteItem?.subcategory}</span>{" "}
                from{" "}
                <span className="font-semibold">{deleteItem?.category}</span>?
              </>
            )}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Customization Management Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Customization Management Guide"
        description="Learn how to effectively customize your platform's visual elements, manage categories, and organize content for optimal user experience."
        sections={helpSections}
      />
    </div>
  );
};

export default CustomizationPage;

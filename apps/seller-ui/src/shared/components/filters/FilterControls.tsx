import React from 'react'
import { Search, Filter, Calendar } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface FilterControlsProps {
  searchValue: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (value: 'asc' | 'desc') => void
  filters?: {
    status?: {
      value: string
      onChange: (value: string) => void
      options: { value: string; label: string }[]
    }
    category?: {
      value: string
      onChange: (value: string) => void
      options: { value: string; label: string }[]
    }
    deliveryStatus?: {
      value: string
      onChange: (value: string) => void
      options: { value: string; label: string }[]
    }
    stockStatus?: {
      value: string
      onChange: (value: string) => void
      options: { value: string; label: string }[]
    }
    eventStatus?: {
      value: string
      onChange: (value: string) => void
      options: { value: string; label: string }[]
    }
    dateFrom?: {
      value: string
      onChange: (value: string) => void
    }
    dateTo?: {
      value: string
      onChange: (value: string) => void
    }
  }
  onClearFilters: () => void
  placeholder?: string
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchValue,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filters,
  onClearFilters,
  placeholder = "Search...",
}) => {
  const hasActiveFilters = () => {
    if (!filters) return false
    return (
      (filters.status?.value && filters.status.value !== 'all') ||
      (filters.category?.value && filters.category.value !== 'all') ||
      (filters.deliveryStatus?.value && filters.deliveryStatus.value !== 'all') ||
      (filters.stockStatus?.value && filters.stockStatus.value !== 'all') ||
      (filters.eventStatus?.value && filters.eventStatus.value !== 'all') ||
      filters.dateFrom?.value ||
      filters.dateTo?.value ||
      searchValue
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
          >
            <option value="createdAt">Date Created</option>
            <option value="updatedAt">Last Updated</option>
            <option value="name">Name</option>
            <option value="total">Total</option>
            <option value="stock">Stock</option>
            <option value="sale_price">Price</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      {/* Filters Row */}
      {filters && (
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          {filters?.status && (
            <select
              value={filters.status.value}
              onChange={(e) => filters.status!.onChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            >
              {filters.status.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {filters?.category && (
            <select
              value={filters.category.value}
              onChange={(e) => filters.category!.onChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            >
              {filters.category.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {filters?.deliveryStatus && (
            <select
              value={filters.deliveryStatus.value}
              onChange={(e) => filters.deliveryStatus!.onChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            >
              {filters.deliveryStatus.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {filters?.stockStatus && (
            <select
              value={filters.stockStatus.value}
              onChange={(e) => filters.stockStatus!.onChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            >
              {filters.stockStatus.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {filters?.eventStatus && (
            <select
              value={filters.eventStatus.value}
              onChange={(e) => filters.eventStatus!.onChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            >
              {filters.eventStatus.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {filters?.dateFrom && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={filters.dateFrom.value}
                onChange={(e) => filters.dateFrom!.onChange(e.target.value)}
                className="w-40"
                placeholder="From date"
              />
            </div>
          )}

          {filters?.dateTo && (
            <Input
              type="date"
              value={filters.dateTo.value}
              onChange={(e) => filters.dateTo!.onChange(e.target.value)}
              className="w-40"
              placeholder="To date"
            />
          )}

          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterControls

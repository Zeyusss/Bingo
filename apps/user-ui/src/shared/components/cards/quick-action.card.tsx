import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ColorClasses {
  [key: string]: {
    icon: string;
    bg: string;
    border: string;
    hover: string;
  }
}

interface QuickActionCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

const QuickActionCard = ({Icon, title, description, color = 'blue'}: QuickActionCardProps) => {
  const colorClasses: ColorClasses = {
    orange: {
      icon: 'text-orange-500',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      hover: 'hover:bg-orange-100'
    },
    blue: {
      icon: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-100'
    },
    green: {
      icon: 'text-green-500',
      bg: 'bg-green-50',
      border: 'border-green-200',
      hover: 'hover:bg-green-100'
    },
    purple: {
      icon: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      hover: 'hover:bg-purple-100'
    },
    red: {
      icon: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      hover: 'hover:bg-red-100'
    }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  // Safety check for undefined Icon
  if (!Icon) {
    console.error('QuickActionCard: Icon prop is undefined');
    return null;
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-start gap-4 cursor-pointer transition-all duration-200 ${currentColor.hover} hover:shadow-md group`}>
      <div className={`p-2 rounded-lg ${currentColor.bg} ${currentColor.border} border group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-5 h-5 ${currentColor.icon}`} />
      </div>
      <div className='flex-1'>
        <h4 className='text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors'>
        {title}
        </h4>
        <p className='text-xs text-gray-600 leading-relaxed'>{description}</p>
      </div>
    </div>
  )
}

export default QuickActionCard

import React from 'react'

interface ColorClasses {
  [key: string]: {
    icon: string;
    bg: string;
    border: string;
    accent: string;
  }
}

const StatCard = ({title,count,Icon,color = 'blue'} : any) => {
  const colorClasses: ColorClasses = {
    orange: {
      icon: 'text-orange-500',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      accent: 'from-orange-500 to-orange-400'
    },
    blue: {
      icon: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      accent: 'from-blue-500 to-blue-400'
    },
    green: {
      icon: 'text-green-500',
      bg: 'bg-green-50',
      border: 'border-green-200',
      accent: 'from-green-500 to-green-400'
    },
    purple: {
      icon: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      accent: 'from-purple-500 to-purple-400'
    }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group`}>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-gray-500 uppercase tracking-wide mb-2'>
             {title}
          </h3>
          <p className='text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200'>{count}</p>
        </div>
        <div className={`p-4 rounded-xl ${currentColor.bg} ${currentColor.border} border`}>
          <Icon className={`w-8 h-8 ${currentColor.icon}`}/>
        </div>
      </div>
      <div className={`h-1 w-full bg-gradient-to-r ${currentColor.accent} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  )
}

export default StatCard

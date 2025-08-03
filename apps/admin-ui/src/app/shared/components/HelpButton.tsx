'use client';
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from './ui/button';

interface HelpButtonProps {
  onClick: () => void;
  text?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'lg' | 'default';
}

const HelpButton: React.FC<HelpButtonProps> = ({ 
  onClick, 
  text = "Help", 
  variant = "outline",
  size = "sm" 
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-300"
    >
      <HelpCircle size={16} />
      {text}
    </Button>
  );
};

export default HelpButton;

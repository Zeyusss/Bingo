'use client';
import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';

export interface HelpSection {
  title: string;
  content: string | React.ReactNode;
  subsections?: {
    title: string;
    content: string | React.ReactNode;
  }[];
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  sections: HelpSection[];
}

const HelpModal: React.FC<HelpModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  sections 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="text-blue-600" size={18} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <section key={index}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {section.title}
                </h3>
                
                <div className="space-y-4">
                  {typeof section.content === 'string' ? (
                    <p className="text-gray-700 leading-relaxed">{section.content}</p>
                  ) : (
                    section.content
                  )}
                  
                  {section.subsections && (
                    <div className="space-y-4 ml-4">
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="border-l-2 border-gray-200 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{subsection.title}</h4>
                          {typeof subsection.content === 'string' ? (
                            <p className="text-gray-600 text-sm leading-relaxed">{subsection.content}</p>
                          ) : (
                            subsection.content
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;

"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { 
  COUNTRY_CODES, 
  normalizePhoneNumber, 
  getDefaultCountry,
  PhoneNumberResult 
} from '../../../utils/phoneUtils';

interface PhoneNumberInputProps {
  value?: string;
  onChange: (value: string, result: PhoneNumberResult) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = '',
  onChange,
  onBlur,
  placeholder = "Enter phone number",
  error,
  required = false,
  disabled = false,
  className = '',
  label = "Phone Number"
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry());
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputMode, setInputMode] = useState<'direct' | 'country-code'>('country-code');
  const [validationResult, setValidationResult] = useState<PhoneNumberResult>({
    isValid: false,
    normalized: '',
  });

  // Initialize input value when prop value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
      handleValidation(value, selectedCountry?.dialCode);
    }
  }, [value]);

  const handleValidation = (phoneInput: string, countryCode?: string) => {
    const result = normalizePhoneNumber(phoneInput, countryCode);
    setValidationResult(result);
    
    // Call parent onChange with normalized value
    onChange(result.normalized || phoneInput, result);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Detect input mode based on whether user starts with +
    if (newValue.startsWith('+')) {
      setInputMode('direct');
    } else if (inputMode === 'direct' && !newValue.startsWith('+')) {
      setInputMode('country-code');
    }

    // Validate with appropriate country code
    const countryCode = inputMode === 'country-code' ? selectedCountry?.dialCode : undefined;
    handleValidation(newValue, countryCode);
  };

  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setInputMode('country-code');
    
    // Re-validate with new country code
    handleValidation(inputValue, country.dialCode);
  };

  const toggleInputMode = () => {
    if (inputMode === 'country-code') {
      setInputMode('direct');
      setInputValue('');
    } else {
      setInputMode('country-code');
      setInputValue('');
    }
  };

  const getInputPlaceholder = () => {
    if (inputMode === 'direct') {
      return "e.g., +201068914750";
    }
    return selectedCountry?.format.replace(/X/g, '0') || placeholder;
  };

  const getDisplayValue = () => {
    if (inputMode === 'direct') {
      return inputValue;
    }
    
    // For country-code mode, show just the national number
    if (inputValue.startsWith(selectedCountry?.dialCode || '')) {
      return inputValue.substring(selectedCountry?.dialCode?.length || 0);
    }
    
    return inputValue;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Input Mode Toggle */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={toggleInputMode}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {inputMode === 'country-code' 
            ? "Enter full number with country code" 
            : "Use country code dropdown"
          }
        </button>
      </div>

      <div className="relative">
        <div className="flex">
          {/* Country Code Dropdown - only show in country-code mode */}
          {inputMode === 'country-code' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 border-r-0 rounded-l bg-gray-50 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed min-w-[120px]"
              >
                <span className="text-lg">{selectedCountry?.flag}</span>
                <span className="text-sm font-medium">{selectedCountry?.dialCode}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-full left-0 z-50 w-80 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg">
                  {COUNTRY_CODES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 text-left"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1 text-sm">{country.name}</span>
                      <span className="text-sm text-gray-500">{country.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Phone Input */}
          <div className="flex-1 relative">
            <input
              type="tel"
              value={getDisplayValue()}
              onChange={handleInputChange}
              onBlur={onBlur}
              placeholder={getInputPlaceholder()}
              disabled={disabled}
              className={`w-full p-2 border border-gray-300 outline-0 ${
                inputMode === 'country-code' ? 'rounded-r' : 'rounded'
              } ${error ? 'border-red-500' : ''} ${
                validationResult.isValid ? 'border-green-500' : ''
              }`}
            />
            
            {/* Phone Icon */}
            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        {inputMode === 'direct' ? (
          "Enter complete number with country code (e.g., +201068914750)"
        ) : (
          `Selected: ${selectedCountry?.name} (${selectedCountry?.dialCode}). You can enter with or without leading zero.`
        )}
      </div>

      {/* Validation Feedback */}
      {validationResult.isValid && validationResult.normalized && (
        <div className="text-xs text-green-600">
          ✓ Will be saved as: {validationResult.normalized}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {/* Validation Error */}
      {!validationResult.isValid && validationResult.error && inputValue && (
        <p className="text-red-500 text-sm">{validationResult.error}</p>
      )}
    </div>
  );
};

export default PhoneNumberInput;

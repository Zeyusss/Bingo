"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Phone } from 'lucide-react';

// Country codes with their dial codes and common formats
export const COUNTRY_CODES = [
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', format: '(0XX) XXX-XXXX' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(XXX) XXX-XXXX' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: 'XXXX XXX XXX' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '(XXX) XXX-XXXX' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: 'XXXX XXX XXX' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: 'XXX XXXXXXX' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: 'XX XX XX XX XX' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', format: 'XXX XXX XXXX' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', format: 'XXX XX XX XX' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', format: 'XXXXX XXXXX' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', format: 'XX XXX XXXX' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', format: 'XX XXX XXXX' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', format: 'XXXX XXXX' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', format: 'XXXX XXXX' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', format: 'XXXX XXXX' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', format: 'XXXX XXXX' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴', format: 'X XXXX XXXX' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧', format: 'XX XXX XXX' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', format: 'XXXX-XXXXXX' },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳', format: 'XX XXX XXX' },
];

export interface PhoneNumberResult {
  isValid: boolean;
  normalized: string;
  countryCode?: string;
  nationalNumber?: string;
  error?: string;
}

/**
 * Normalizes phone number input to international format
 */
export function normalizePhoneNumber(
  input: string,
  selectedCountryCode?: string
): PhoneNumberResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      normalized: '',
      error: 'Phone number is required'
    };
  }

  const cleaned = input.replace(/[^\d+]/g, '');
  
  if (!cleaned) {
    return {
      isValid: false,
      normalized: '',
      error: 'Invalid phone number format'
    };
  }

  // Case 1: Input already has international format (+XX...)
  if (cleaned.startsWith('+')) {
    return validateInternationalNumber(cleaned);
  }

  // Case 2: User selected a country code from dropdown
  if (selectedCountryCode) {
    const country = COUNTRY_CODES.find(c => c.dialCode === selectedCountryCode);
    if (country) {
      return normalizeWithCountryCode(cleaned, country);
    }
  }

  // Case 3: Try to detect country from number patterns
  const detectedCountry = detectCountryFromNumber(cleaned);
  if (detectedCountry) {
    return normalizeWithCountryCode(cleaned, detectedCountry);
  }

  // Case 4: Default to direct input validation
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    return validateInternationalNumber(withPlus);
  }

  return {
    isValid: false,
    normalized: cleaned,
    error: 'Invalid phone number format. Please include country code or select from dropdown.'
  };
}

function validateInternationalNumber(number: string): PhoneNumberResult {
  const digits = number.substring(1);
  
  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      normalized: number,
      error: 'Phone number must be between 7 and 15 digits'
    };
  }

  const country = COUNTRY_CODES.find(c => 
    digits.startsWith(c.dialCode.substring(1))
  );

  return {
    isValid: true,
    normalized: number,
    countryCode: country?.dialCode,
    nationalNumber: country ? digits.substring(country.dialCode.length - 1) : digits,
  };
}

function normalizeWithCountryCode(
  input: string,
  country: typeof COUNTRY_CODES[0]
): PhoneNumberResult {
  let digits = input;
  const countryDigits = country.dialCode.substring(1);

  // Handle Egyptian numbers specifically
  if (country.code === 'EG') {
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    if (digits.length === 10 && digits.startsWith('1')) {
      return {
        isValid: true,
        normalized: `${country.dialCode}${digits}`,
        countryCode: country.dialCode,
        nationalNumber: digits,
      };
    }
  }

  // Remove country code if already included
  if (digits.startsWith(countryDigits)) {
    digits = digits.substring(countryDigits.length);
  }

  // Remove leading zero for most countries
  if (digits.startsWith('0') && country.code !== 'IT') {
    digits = digits.substring(1);
  }

  if (digits.length < 6 || digits.length > 12) {
    return {
      isValid: false,
      normalized: input,
      error: `Invalid number length for ${country.name}`
    };
  }

  return {
    isValid: true,
    normalized: `${country.dialCode}${digits}`,
    countryCode: country.dialCode,
    nationalNumber: digits,
  };
}

function detectCountryFromNumber(digits: string): typeof COUNTRY_CODES[0] | null {
  for (const country of COUNTRY_CODES) {
    const countryDigits = country.dialCode.substring(1);
    
    if (digits.startsWith(countryDigits)) {
      const remaining = digits.substring(countryDigits.length);
      if (remaining.length >= 6 && remaining.length <= 12) {
        return country;
      }
    }
  }

  if ((digits.startsWith('01') || digits.startsWith('1')) && digits.length >= 10) {
    return COUNTRY_CODES.find(c => c.code === 'EG') || null;
  }

  return null;
}

export function getDefaultCountry() {
  return COUNTRY_CODES.find(c => c.code === 'EG') || COUNTRY_CODES[0];
}

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

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
      handleValidation(value, selectedCountry?.dialCode);
    }
  }, [value]);

  const handleValidation = (phoneInput: string, countryCode?: string) => {
    const result = normalizePhoneNumber(phoneInput, countryCode);
    setValidationResult(result);
    onChange(result.normalized || phoneInput, result);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.startsWith('+')) {
      setInputMode('direct');
    } else if (inputMode === 'direct' && !newValue.startsWith('+')) {
      setInputMode('country-code');
    }

    const countryCode = inputMode === 'country-code' ? selectedCountry?.dialCode : undefined;
    handleValidation(newValue, countryCode);
  };

  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setInputMode('country-code');
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
            
            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      <div className="text-xs text-gray-500">
        {inputMode === 'direct' ? (
          "Enter complete number with country code (e.g., +201068914750)"
        ) : (
          `Selected: ${selectedCountry?.name} (${selectedCountry?.dialCode}). You can enter with or without leading zero.`
        )}
      </div>

      {validationResult.isValid && validationResult.normalized && (
        <div className="text-xs text-green-600">
          ✓ Will be saved as: {validationResult.normalized}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {!validationResult.isValid && validationResult.error && inputValue && (
        <p className="text-red-500 text-sm">{validationResult.error}</p>
      )}
    </div>
  );
};

export default PhoneNumberInput;

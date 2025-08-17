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
 * Handles various input formats and country code scenarios
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

  // Clean the input - remove all non-digit characters except +
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

  // Case 4: Default to direct input validation (assume it's complete)
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    // If it doesn't start with +, assume it's a complete international number
    const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    return validateInternationalNumber(withPlus);
  }

  return {
    isValid: false,
    normalized: cleaned,
    error: 'Invalid phone number format. Please include country code or select from dropdown.'
  };
}

/**
 * Validates and formats an international phone number
 */
function validateInternationalNumber(number: string): PhoneNumberResult {
  // Remove + for processing
  const digits = number.substring(1);
  
  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      normalized: number,
      error: 'Phone number must be between 7 and 15 digits'
    };
  }

  // Find matching country
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

/**
 * Normalizes phone number with a specific country code
 */
function normalizeWithCountryCode(
  input: string,
  country: typeof COUNTRY_CODES[0]
): PhoneNumberResult {
  let digits = input;
  const countryDigits = country.dialCode.substring(1); // Remove +

  // Handle Egyptian numbers specifically (common case)
  if (country.code === 'EG') {
    // Remove leading zero if present (Egyptian mobile numbers often start with 01)
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    // Egyptian mobile numbers should be 10 digits after removing leading zero
    if (digits.length === 10 && digits.startsWith('1')) {
      return {
        isValid: true,
        normalized: `${country.dialCode}${digits}`,
        countryCode: country.dialCode,
        nationalNumber: digits,
      };
    }
  }

  // General normalization for other countries
  // Remove country code if it's already included
  if (digits.startsWith(countryDigits)) {
    digits = digits.substring(countryDigits.length);
  }

  // Remove leading zero for most countries
  if (digits.startsWith('0') && country.code !== 'IT') { // Italy keeps leading zero
    digits = digits.substring(1);
  }

  // Validate length (most mobile numbers are 7-12 digits after country code)
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

/**
 * Attempts to detect country from number patterns
 */
function detectCountryFromNumber(digits: string): typeof COUNTRY_CODES[0] | null {
  // Try to match against known country code patterns
  for (const country of COUNTRY_CODES) {
    const countryDigits = country.dialCode.substring(1);
    
    // Check if number starts with country code
    if (digits.startsWith(countryDigits)) {
      const remaining = digits.substring(countryDigits.length);
      // Validate remaining digits length
      if (remaining.length >= 6 && remaining.length <= 12) {
        return country;
      }
    }
  }

  // Special case for Egyptian numbers (common pattern)
  if ((digits.startsWith('01') || digits.startsWith('1')) && digits.length >= 10) {
    return COUNTRY_CODES.find(c => c.code === 'EG') || null;
  }

  return null;
}

/**
 * Formats phone number for display purposes
 */
export function formatPhoneNumberForDisplay(
  normalized: string,
  countryCode?: string
): string {
  if (!normalized) return '';

  const country = COUNTRY_CODES.find(c => c.dialCode === countryCode);
  if (!country) return normalized;

  // For now, return the normalized format
  // Could be enhanced with country-specific formatting
  return normalized;
}

/**
 * Validates phone number format without normalization
 */
export function isValidPhoneNumber(input: string): boolean {
  const result = normalizePhoneNumber(input);
  return result.isValid;
}

/**
 * Gets country info by dial code
 */
export function getCountryByDialCode(dialCode: string) {
  return COUNTRY_CODES.find(c => c.dialCode === dialCode);
}

/**
 * Gets default country (Egypt for this project)
 */
export function getDefaultCountry() {
  return COUNTRY_CODES.find(c => c.code === 'EG') || COUNTRY_CODES[0];
}

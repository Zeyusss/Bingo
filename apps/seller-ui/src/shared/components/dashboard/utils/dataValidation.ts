export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DashboardData {
  totalProducts?: number;
  activeListings?: number;
  ordersToday?: number;
  totalRevenue?: number;
  conversionRate?: number;
  averageRating?: number;
}

export const validateDashboardData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data) {
    errors.push("No data provided");
    return { isValid: false, errors, warnings };
  }

  // Validate numeric fields
  const numericFields = [
    "totalProducts",
    "activeListings",
    "ordersToday",
    "totalRevenue",
    "conversionRate",
    "averageRating",
  ];

  numericFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] !== "number") {
        errors.push(`${field} must be a number`);
      } else if (data[field] < 0) {
        warnings.push(`${field} should not be negative`);
      }
    }
  });

  // Validate conversion rate
  if (data.conversionRate !== undefined) {
    if (data.conversionRate > 100) {
      errors.push("Conversion rate cannot exceed 100%");
    }
  }

  // Validate average rating
  if (data.averageRating !== undefined) {
    if (data.averageRating > 5) {
      errors.push("Average rating cannot exceed 5 stars");
    }
  }

  // Check for reasonable values
  if (data.totalRevenue !== undefined && data.totalRevenue > 1000000) {
    warnings.push("Total revenue seems unusually high");
  }

  if (data.ordersToday !== undefined && data.ordersToday > 1000) {
    warnings.push("Orders today seems unusually high");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateChartData = (data: any[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push("Chart data must be an array");
    return { isValid: false, errors, warnings };
  }

  if (data.length === 0) {
    warnings.push("Chart data is empty");
  }

  data.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push(`Chart item at index ${index} is invalid`);
      return;
    }

    if (!item.data || !Array.isArray(item.data)) {
      errors.push(`Chart item at index ${index} missing data array`);
    }

    if (item.data) {
      item.data.forEach((point: any, pointIndex: number) => {
        if (!point || typeof point !== "object") {
          errors.push(
            `Chart point at index ${pointIndex} in item ${index} is invalid`
          );
          return;
        }

        if (point.y !== undefined && typeof point.y !== "number") {
          errors.push(
            `Chart point y value at index ${pointIndex} in item ${index} must be a number`
          );
        }

        if (point.x === undefined) {
          errors.push(
            `Chart point at index ${pointIndex} in item ${index} missing x value`
          );
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateOrdersData = (data: any[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push("Orders data must be an array");
    return { isValid: false, errors, warnings };
  }

  data.forEach((order, index) => {
    if (!order || typeof order !== "object") {
      errors.push(`Order at index ${index} is invalid`);
      return;
    }

    if (!order.id) {
      warnings.push(`Order at index ${index} missing ID`);
    }

    if (order.total !== undefined && typeof order.total !== "number") {
      errors.push(`Order total at index ${index} must be a number`);
    }

    if (order.total !== undefined && order.total < 0) {
      errors.push(`Order total at index ${index} cannot be negative`);
    }

    if (
      order.status &&
      !["pending", "paid", "completed", "cancelled", "failed"].includes(
        order.status.toLowerCase()
      )
    ) {
      warnings.push(
        `Order status at index ${index} has unexpected value: ${order.status}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const sanitizeData = (data: any): any => {
  if (!data) return data;

  // Deep clone to avoid mutating original data
  const sanitized = JSON.parse(JSON.stringify(data));

  // Sanitize numeric fields
  const numericFields = [
    "totalProducts",
    "activeListings",
    "ordersToday",
    "totalRevenue",
    "conversionRate",
    "averageRating",
    "total",
    "value",
    "y",
  ];

  const sanitizeObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (numericFields.includes(key) && typeof value === "number") {
          // Ensure non-negative values for counts
          if (
            ["totalProducts", "activeListings", "ordersToday"].includes(key)
          ) {
            sanitized[key] = Math.max(0, value);
          }
          // Ensure reasonable bounds for percentages
          else if (key === "conversionRate") {
            sanitized[key] = Math.min(100, Math.max(0, value));
          }
          // Ensure reasonable bounds for ratings
          else if (key === "averageRating") {
            sanitized[key] = Math.min(5, Math.max(0, value));
          }
          // For other numeric fields, just ensure they're finite
          else if (isFinite(value)) {
            sanitized[key] = value;
          } else {
            sanitized[key] = 0;
          }
        } else {
          sanitized[key] = sanitizeObject(value);
        }
      }
      return sanitized;
    }

    return obj;
  };

  return sanitizeObject(sanitized);
};

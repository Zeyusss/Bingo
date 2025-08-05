export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SystemStatsData {
  totalUsers?: number;
  activeSellers?: number;
  ordersToday?: number;
  uptime?: number;
  apiLatency?: number;
}

export interface RevenueData {
  id: string;
  color: string;
  data: { x: string; y: number }[];
}

export interface DeviceUsageData {
  id: string;
  label: string;
  value: number;
}

export interface ResourceMonitorData {
  cpu?: number;
  memory?: number;
  disk?: number;
  kafkaHealth?: string;
  kafkaLag?: number;
}

export const validateSystemStats = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data) {
    errors.push("No data provided");
    return { isValid: false, errors, warnings };
  }

  const numericFields = [
    "totalUsers",
    "activeSellers",
    "ordersToday",
    "uptime",
    "apiLatency",
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

  if (data.uptime !== undefined) {
    if (data.uptime > 100) {
      errors.push("Uptime cannot exceed 100%");
    }
  }

  if (data.apiLatency !== undefined && data.apiLatency > 10000) {
    warnings.push("API latency seems unusually high");
  }

  if (data.totalUsers !== undefined && data.totalUsers > 1000000) {
    warnings.push("Total users seems unusually high");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateRevenueData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data) {
    errors.push("No data provided");
    return { isValid: false, errors, warnings };
  }

  if (!Array.isArray(data)) {
    errors.push("Revenue data must be an array");
    return { isValid: false, errors, warnings };
  }

  data.forEach((item, index) => {
    if (!item.id || typeof item.id !== "string") {
      errors.push(`Item ${index}: missing or invalid id`);
    }
    if (!Array.isArray(item.data)) {
      errors.push(`Item ${index}: data must be an array`);
    } else {
      item.data.forEach((point: any, pointIndex: number) => {
        if (typeof point.x !== "string" || typeof point.y !== "number") {
          errors.push(
            `Item ${index}, point ${pointIndex}: invalid data structure`
          );
        }
        if (point.y < 0) {
          warnings.push(
            `Item ${index}, point ${pointIndex}: negative revenue value`
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

export const validateDeviceUsageData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data) {
    errors.push("No data provided");
    return { isValid: false, errors, warnings };
  }

  if (!Array.isArray(data)) {
    errors.push("Device usage data must be an array");
    return { isValid: false, errors, warnings };
  }

  let totalPercentage = 0;
  data.forEach((item, index) => {
    if (!item.id || typeof item.id !== "string") {
      errors.push(`Item ${index}: missing or invalid id`);
    }
    if (!item.label || typeof item.label !== "string") {
      errors.push(`Item ${index}: missing or invalid label`);
    }
    if (typeof item.value !== "number") {
      errors.push(`Item ${index}: value must be a number`);
    } else {
      if (item.value < 0) {
        warnings.push(`Item ${index}: negative percentage value`);
      }
      totalPercentage += item.value;
    }
  });

  if (Math.abs(totalPercentage - 100) > 1) {
    warnings.push("Total percentage should equal 100%");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateResourceMonitorData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data) {
    errors.push("No data provided");
    return { isValid: false, errors, warnings };
  }

  const numericFields = ["cpu", "memory", "disk", "kafkaLag"];
  const validHealthStatuses = ["healthy", "warning", "critical"];

  numericFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] !== "number") {
        errors.push(`${field} must be a number`);
      } else if (data[field] < 0) {
        warnings.push(`${field} should not be negative`);
      }
      if (field !== "kafkaLag" && data[field] > 100) {
        errors.push(`${field} cannot exceed 100%`);
      }
    }
  });

  if (data.kafkaHealth !== undefined) {
    if (typeof data.kafkaHealth !== "string") {
      errors.push("kafkaHealth must be a string");
    } else if (!validHealthStatuses.includes(data.kafkaHealth.toLowerCase())) {
      warnings.push("kafkaHealth should be one of: healthy, warning, critical");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const sanitizeData = (data: any): any => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (typeof data === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        sanitized[key] = sanitizeData(value);
      }
    }
    return sanitized;
  }

  return data;
};

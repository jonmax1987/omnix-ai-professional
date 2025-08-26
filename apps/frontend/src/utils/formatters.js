/**
 * OMNIX AI - Data Formatting Utilities
 * Common formatting functions for numbers, currency, dates, and times
 */

/**
 * Format number as currency
 * @param {number} value - The numeric value to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `$${value.toFixed(2)}`;
  }
};

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} value - The numeric value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatCompactNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return sign + (absValue / 1e9).toFixed(decimals) + 'B';
  } else if (absValue >= 1e6) {
    return sign + (absValue / 1e6).toFixed(decimals) + 'M';
  } else if (absValue >= 1e3) {
    return sign + (absValue / 1e3).toFixed(decimals) + 'K';
  }
  
  return sign + absValue.toFixed(0);
};

/**
 * Format number with thousands separator
 * @param {number} value - The numeric value to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, locale = 'en-US') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value.toString();
  }
};

/**
 * Format percentage
 * @param {number} value - The numeric value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short', locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    full: { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  try {
    return new Intl.DateTimeFormat(locale, options[format] || options.short).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format time to readable string
 * @param {Date|string|number} time - Time to format
 * @param {boolean} includeSeconds - Whether to include seconds
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted time string
 */
export const formatTime = (time, includeSeconds = false, locale = 'en-US') => {
  if (!time) return '';
  
  const timeObj = time instanceof Date ? time : new Date(time);
  
  if (isNaN(timeObj.getTime())) {
    return '';
  }
  
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' })
  };
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(timeObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return timeObj.toLocaleTimeString();
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "in 5 minutes")
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj - now) / 1000);
  const absDiff = Math.abs(diffInSeconds);
  
  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];
  
  for (const { unit, seconds } of units) {
    const value = Math.floor(absDiff / seconds);
    if (value >= 1) {
      try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(diffInSeconds < 0 ? -value : value, unit);
      } catch (error) {
        console.error('Relative time formatting error:', error);
        const plural = value !== 1 ? 's' : '';
        return diffInSeconds < 0 
          ? `${value} ${unit}${plural} ago`
          : `in ${value} ${unit}${plural}`;
      }
    }
  }
  
  return 'just now';
};

/**
 * Format duration in milliseconds to readable string
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format phone number
 * @param {string} phone - Phone number string
 * @param {string} format - Format type ('US', 'INTL')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, format = 'US') => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (format === 'US' && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (format === 'US' && cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Default international format
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }
  
  return phone;
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export const truncate = (str, length, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
};

/**
 * Format plural string
 * @param {number} count - Count for pluralization
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional)
 * @returns {string} Formatted plural string
 */
export const formatPlural = (count, singular, plural) => {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
};

export default {
  formatCurrency,
  formatCompactNumber,
  formatNumber,
  formatPercentage,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatDuration,
  formatFileSize,
  formatPhoneNumber,
  capitalize,
  truncate,
  formatPlural
};
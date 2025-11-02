import { REGEX, VIDEO_CONSTRAINTS, IMAGE_CONSTRAINTS, TWEET_CONSTRAINTS } from './constants';

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format number to human-readable format (1K, 1M, etc.)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  return REGEX.EMAIL.test(email);
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid
 */
export const isValidUsername = (username) => {
  return REGEX.USERNAME.test(username);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid (min 8 chars, uppercase, lowercase, number)
 */
export const isValidPassword = (password) => {
  return REGEX.PASSWORD.test(password);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const isValidURL = (url) => {
  return REGEX.URL.test(url);
};

/**
 * Validate video file
 * @param {File} file - File to validate
 * @returns {object} { valid: boolean, error: string }
 */
export const validateVideoFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size > VIDEO_CONSTRAINTS.MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(VIDEO_CONSTRAINTS.MAX_SIZE)}`,
    };
  }

  if (!VIDEO_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid video format. Allowed: MP4, WebM, OGG',
    };
  }

  return { valid: true };
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {object} { valid: boolean, error: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size > IMAGE_CONSTRAINTS.MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(IMAGE_CONSTRAINTS.MAX_SIZE)}`,
    };
  }

  if (!IMAGE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Allowed: JPG, PNG, WebP',
    };
  }

  return { valid: true };
};

/**
 * Validate tweet content
 * @param {string} content - Tweet content to validate
 * @returns {object} { valid: boolean, error: string }
 */
export const validateTweet = (content) => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Tweet cannot be empty' };
  }

  if (content.length > TWEET_CONSTRAINTS.MAX_LENGTH) {
    return {
      valid: false,
      error: `Tweet exceeds ${TWEET_CONSTRAINTS.MAX_LENGTH} characters`,
    };
  }

  return { valid: true };
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 * @param {function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} Promise that resolves when copied
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

/**
 * Format duration (seconds to HH:MM:SS)
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Get video thumbnail from URL
 * @param {string} videoUrl - Video URL
 * @param {number} timestamp - Timestamp in seconds
 * @returns {string} Thumbnail data URL
 */
export const getVideoThumbnail = (videoUrl, timestamp = 1) => {
  // This is a placeholder - actual implementation would use FFmpeg or server-side generation
  return videoUrl;
};

/**
 * Check if user is online
 * @returns {boolean} True if online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Get local storage item
 * @param {string} key - Key to retrieve
 * @returns {any} Value from local storage
 */
export const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return null;
  }
};

/**
 * Set local storage item
 * @param {string} key - Key to set
 * @param {any} value - Value to store
 * @returns {boolean} True if successful
 */
export const setToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
    return false;
  }
};

/**
 * Remove local storage item
 * @param {string} key - Key to remove
 * @returns {boolean} True if successful
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
    return false;
  }
};

/**
 * Clear all local storage
 * @returns {boolean} True if successful
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing localStorage:`, error);
    return false;
  }
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Merge two objects
 * @param {object} target - Target object
 * @param {object} source - Source object
 * @returns {object} Merged object
 */
export const mergeObjects = (target, source) => {
  return { ...target, ...source };
};

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get query parameters from URL
 * @returns {object} Query parameters
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (let [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Build query string from object
 * @param {object} params - Parameters object
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  for (let [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      query.append(key, value);
    }
  }
  return query.toString();
};

/**
 * Sleep function (for delays)
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 * @param {function} func - Function to retry
 * @param {number} maxRetries - Maximum retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} Promise of function result
 */
export const retryWithBackoff = async (func, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await func();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * Math.pow(2, i)); // Exponential backoff
    }
  }
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Get user's browser info
 * @returns {object} Browser information
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  return {
    browser: ua.match(/Chrome|Safari|Firefox|Edge/)[0],
    os: ua.match(/Windows|Mac|Linux|Android|iOS/)[0],
    isMobile: /Mobile|Android/.test(ua),
  };
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalize all words
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const getRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Check if URL is external
 * @param {string} url - URL to check
 * @returns {boolean} True if external
 */
export const isExternalURL = (url) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

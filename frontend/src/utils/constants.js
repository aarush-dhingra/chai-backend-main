// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Video upload constraints
export const VIDEO_CONSTRAINTS = {
  MAX_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  MAX_DURATION: 12 * 60 * 60, // 12 hours in seconds
};

// Image upload constraints
export const IMAGE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// Tweet constraints
export const TWEET_CONSTRAINTS = {
  MAX_LENGTH: 280,
  MIN_LENGTH: 1,
};

// Video constraints
export const CONTENT_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 3,
  DESCRIPTION_MAX_LENGTH: 5000,
  DESCRIPTION_MIN_LENGTH: 1,
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
};

// Sort options
export const SORT_OPTIONS = {
  VIDEOS: [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'duration', label: 'Duration' },
  ],
  COMMENTS: [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First', asc: true },
  ],
};

// Filter options
export const FILTER_OPTIONS = {
  VIDEO_STATUS: [
    { value: 'all', label: 'All Videos' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Drafts' },
  ],
  PLAYLIST_TYPE: [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
  ],
};

// Notification messages
export const MESSAGES = {
  // Success messages
  SUCCESS_LOGIN: 'Login successful! Welcome back.',
  SUCCESS_REGISTER: 'Account created successfully! Welcome.',
  SUCCESS_LOGOUT: 'Logged out successfully.',
  SUCCESS_VIDEO_UPLOAD: 'Video uploaded successfully!',
  SUCCESS_VIDEO_UPDATE: 'Video updated successfully!',
  SUCCESS_VIDEO_DELETE: 'Video deleted successfully!',
  SUCCESS_COMMENT_ADD: 'Comment posted successfully!',
  SUCCESS_COMMENT_UPDATE: 'Comment updated successfully!',
  SUCCESS_COMMENT_DELETE: 'Comment deleted successfully!',
  SUCCESS_PLAYLIST_CREATE: 'Playlist created successfully!',
  SUCCESS_PLAYLIST_UPDATE: 'Playlist updated successfully!',
  SUCCESS_PLAYLIST_DELETE: 'Playlist deleted successfully!',
  SUCCESS_TWEET_CREATE: 'Tweet posted successfully!',
  SUCCESS_TWEET_UPDATE: 'Tweet updated successfully!',
  SUCCESS_TWEET_DELETE: 'Tweet deleted successfully!',
  SUCCESS_LIKE: 'Added to your likes!',
  SUCCESS_UNLIKE: 'Removed from your likes!',
  SUCCESS_SUBSCRIBE: 'Subscribed successfully!',
  SUCCESS_UNSUBSCRIBE: 'Unsubscribed successfully!',
  SUCCESS_PROFILE_UPDATE: 'Profile updated successfully!',
  SUCCESS_PASSWORD_CHANGE: 'Password changed successfully!',

  // Error messages
  ERROR_LOGIN: 'Invalid email or password.',
  ERROR_REGISTER: 'Registration failed. Please try again.',
  ERROR_LOGOUT: 'Logout failed. Please try again.',
  ERROR_UPLOAD: 'Upload failed. Please check file size and format.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_NOT_FOUND: 'Resource not found.',
  ERROR_UNAUTHORIZED: 'You are not authorized to perform this action.',
  ERROR_SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  ERROR_INVALID_FILE: 'Invalid file format or size too large.',

  // Confirmation messages
  CONFIRM_DELETE_VIDEO: 'Are you sure you want to delete this video? This action cannot be undone.',
  CONFIRM_DELETE_COMMENT: 'Delete this comment?',
  CONFIRM_DELETE_PLAYLIST: 'Delete this playlist?',
  CONFIRM_DELETE_TWEET: 'Delete this tweet?',
  CONFIRM_LOGOUT: 'Are you sure you want to logout?',
};

// Color palette
export const COLORS = {
  PRIMARY: '#9147ff',      // Neon Purple
  SECONDARY: '#5865f2',    // Neon Blue
  ACCENT: '#00d9ff',       // Neon Cyan
  SUCCESS: '#00ff88',      // Neon Green
  DANGER: '#ff006e',       // Neon Pink
  WARNING: '#ffb700',      // Orange
  DARK_PRIMARY: '#0e0e10',
  DARK_SECONDARY: '#18181b',
};

// Regex patterns for validation
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

// Debounce delay (in milliseconds)
export const DEBOUNCE_DELAY = {
  SEARCH: 500,
  RESIZE: 300,
  INPUT: 300,
};

// Cache duration (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,    // 5 minutes
  MEDIUM: 15 * 60 * 1000,  // 15 minutes
  LONG: 60 * 60 * 1000,    // 1 hour
};

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  USER: 'user_data',
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme_preference',
  SEARCH_HISTORY: 'search_history',
  RECENT_UPLOADS: 'recent_uploads',
  USER_PREFERENCES: 'user_preferences',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Environment variables
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
};

// Default pagination
export const DEFAULT_PAGE_LIMIT = 12;

// Video quality options
export const VIDEO_QUALITY = {
  LOW: '360p',
  MEDIUM: '720p',
  HIGH: '1080p',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VIDEO_DETAIL: '/video/:videoId',
  CHANNEL: '/channel/:username',
  MY_CHANNEL: '/my-channel',
  HISTORY: '/history',
  LIKED_VIDEOS: '/liked-videos',
  SUBSCRIPTIONS: '/subscriptions',
  PLAYLISTS: '/playlists',
  PLAYLIST_DETAIL: '/playlist/:playlistId',
  TWEETS: '/tweets',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
};

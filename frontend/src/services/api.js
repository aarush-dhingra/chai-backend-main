import axios from 'axios';

// ✅ Use full backend URL instead of proxy
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

// ========== AUTH APIs ==========

export const registerUser = async (formData) => {
  const response = await api.post('/user/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',  // ✅ Important!
    }
  });
  return response.data;
};


export const loginUser = async (credentials) => {
  const response = await api.post('/user/login', credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/user/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/user/current-user');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.patch('/user/update-account', userData);  // ✅ Changed
  return response.data;
};

export const changeUserPassword = async (passwords) => {
  const response = await api.post('/user/change-password', passwords);  // ✅ Changed to POST
  return response.data;
};

export const updateUserAvatar = async (formData) => {
  const response = await api.patch('/user/avatar', formData, {  // ✅ Changed
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateUserCoverImage = async (formData) => {
  const response = await api.patch('/user/cover-image', formData, {  // ✅ Changed
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getUserChannelProfile = async (username) => {
  const response = await api.get(`/user/c/${username}`);  // ✅ Changed
  return response.data;
};

export const getWatchHistory = async () => {
  const response = await api.get('/user/history');
  return response.data;
};
export const addToWatchHistory = async (videoId) => {
  const response = await api.patch(`/user/watch/${videoId}`);
  return response.data;
};


// ========== VIDEO APIs ==========
export const getAllVideos = async (params = {}) => {
  const response = await api.get('/video', { params });
  return response.data;
};

export const getVideoById = async (videoId) => {
  const response = await api.get(`/video/${videoId}`);
  return response.data;
};

export const publishVideo = async (videoData) => {
  const response = await api.post('/video/publish', videoData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateVideo = async (videoId, videoData) => {
  const response = await api.patch(`/video/${videoId}`, videoData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteVideo = async (videoId) => {
  const response = await api.delete(`/video/${videoId}`);
  return response.data;
};

export const togglePublishStatus = async (videoId) => {
  const response = await api.patch(`/video/toggle/publish/${videoId}`);
  return response.data;
};

// ========== COMMENT APIs ==========
export const getVideoComments = async (videoId, params = {}) => {
  const response = await api.get(`/comment/${videoId}`, { params });
  return response.data;
};

export const addComment = async (videoId, content) => {
  const response = await api.post(`/comment/${videoId}`, { content });
  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await api.patch(`/comment/c/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comment/c/${commentId}`);
  return response.data;
};

// ========== LIKE APIs ==========
export const toggleVideoLike = async (videoId) => {
  const response = await api.post(`/like/toggle/v/${videoId}`);  // ← Add /toggle
  return response.data;
};

export const toggleCommentLike = async (commentId) => {
  const response = await api.post(`/like/toggle/c/${commentId}`);  // ← Add /toggle
  return response.data;
};

export const toggleTweetLike = async (tweetId) => {
  const response = await api.post(`/like/toggle/t/${tweetId}`);  // ← Add /toggle
  return response.data;
};

export const getLikedVideos = async (params = {}) => {
  const response = await api.get('/like/videos', { params });
  return response.data;
};
export const getAllTweets = async () => {
  const response = await api.get('/tweet/');
  return response.data;
};


// ========== SUBSCRIPTION APIs ==========
export const toggleSubscription = async (channelId) => {
  const response = await api.post(`/subscription/c/${channelId}`);
  return response.data;
};

export const getUserChannelSubscribers = async (channelId, params = {}) => {
  const response = await api.get(`/subscription/u/${channelId}`, { params });
  return response.data;
};

export const getSubscribedChannels = async (subscriberId, params = {}) => {
  const response = await api.get(`/subscription/subscribed-channels/${subscriberId}`, { params });
  return response.data;
};

// ========== TWEET APIs ==========
export const createTweet = async (content) => {
  const response = await api.post('/tweet', { content });
  return response.data;
};

export const getUserTweets = async (userId, params = {}) => {
  const response = await api.get(`/tweet/user/${userId}`, { params });
  return response.data;
};

export const updateTweet = async (tweetId, content) => {
  const response = await api.patch(`/tweet/${tweetId}`, { content });
  return response.data;
};

export const deleteTweet = async (tweetId) => {
  const response = await api.delete(`/tweet/${tweetId}`);
  return response.data;
};

// ========== PLAYLIST APIs ==========
export const createPlaylist = async (playlistData) => {
  const response = await api.post('/playlist', playlistData);
  return response.data;
};

export const getUserPlaylists = async (userId) => {
  const response = await api.get(`/playlist/user/${userId}`);
  return response.data;
};

export const getPlaylistById = async (playlistId) => {
  const response = await api.get(`/playlist/${playlistId}`);
  return response.data;
};

export const addVideoToPlaylist = async (playlistId, videoId) => {
  const response = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
  return response.data;
};

export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  const response = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
  return response.data;
};

export const deletePlaylist = async (playlistId) => {
  const response = await api.delete(`/playlist/${playlistId}`);
  return response.data;
};

export const updatePlaylist = async (playlistId, data) => {
  const response = await api.patch(`/playlist/${playlistId}`, data);
  return response.data;
};

// ========== DASHBOARD APIs ==========
export const getChannelStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getChannelVideos = async (channelId) => {
  const response = await api.get(`/dashboard/videos/${channelId}`, {});  // ✅ Add channelId
  return response.data;
};


import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAllTweets, createTweet, updateTweet, deleteTweet, toggleTweetLike } from '../services/api';
import { FiMessageSquare, FiHeart, FiEdit2, FiTrash2, FiMoreVertical, FiSend } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';


function Tweets() {
  const { user } = useContext(AuthContext);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showMenuId, setShowMenuId] = useState(null);


  useEffect(() => {
    fetchTweets();
  }, []);


  const fetchTweets = async () => {
    setLoading(true);
    try {
      const response = await getAllTweets();
      console.log('All tweets fetched:', response);
      setTweets(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tweets:', error);
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };


  const handlePostTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim() || !user) return;

    setPosting(true);
    try {
      const response = await createTweet(newTweet);
      setTweets([response.data, ...tweets]);
      setNewTweet('');
    } catch (error) {
      console.error('Failed to post tweet:', error);
      alert('Failed to post tweet');
    } finally {
      setPosting(false);
    }
  };


  const handleUpdateTweet = async (tweetId) => {
    if (!editContent.trim()) return;

    try {
      await updateTweet(tweetId, editContent);
      setTweets(tweets.map(t => t._id === tweetId ? { ...t, content: editContent } : t));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update tweet:', error);
      alert('Failed to update tweet');
    }
  };


  const handleDeleteTweet = async (tweetId) => {
    if (!confirm('Delete this tweet?')) return;
    
    try {
      await deleteTweet(tweetId);
      setTweets(tweets.filter(t => t._id !== tweetId));
    } catch (error) {
      console.error('Failed to delete tweet:', error);
      alert('Failed to delete tweet');
    }
  };


  const handleLikeTweet = async (tweetId, isLiked) => {
    if (!user) {
      alert('Please login to like tweets');
      return;
    }

    try {
      await toggleTweetLike(tweetId);
      setTweets(tweets.map(t => 
        t._id === tweetId 
          ? { ...t, isLiked: !isLiked, likesCount: isLiked ? t.likesCount - 1 : t.likesCount + 1 }
          : t
      ));
    } catch (error) {
      console.error('Failed to like tweet:', error);
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
          <FiMessageSquare className="text-[var(--color-neon-purple)]" />
          <span>Tweets</span>
        </h1>
        <p className="text-gray-400">Share your thoughts with your followers</p>
      </div>


      {/* Create Tweet - Only if logged in */}
      {user && (
        <div className="card p-6">
          <form onSubmit={handlePostTweet}>
            <div className="flex space-x-4">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt={user?.username}
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  placeholder="What's on your mind?"
                  className="input min-h-[100px] resize-none mb-3"
                  maxLength={280}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {newTweet.length}/280
                  </span>
                  <button
                    type="submit"
                    disabled={!newTweet.trim() || posting}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <FiSend className="w-4 h-4" />
                    <span>{posting ? 'Posting...' : 'Tweet'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}


      {/* Tweets List */}
      <div className="space-y-4">
        {tweets.length === 0 ? (
          <div className="text-center py-20 card">
            <FiMessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tweets yet</h3>
            <p className="text-gray-400">Be the first to share your thoughts!</p>
          </div>
        ) : (
          tweets.map((tweet) => (
            <div key={tweet._id} className="card p-6 hover:bg-dark-tertiary/50 transition-colors">
              <div className="flex space-x-4">
                {/* Avatar - Clickable Link to Channel */}
                <Link
                  to={`/c/${tweet.owner?.username}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={tweet.owner?.avatar || '/default-avatar.png'}
                    alt={tweet.owner?.username}
                    className="w-12 h-12 rounded-full border-2 border-dark-border hover:border-neon-purple transition-colors"
                  />
                </Link>


                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      {/* Name and Username - Both clickable to channel */}
                      <Link
                        to={`/c/${tweet.owner?.username}`}
                        className="hover:underline"
                      >
                        <h3 className="font-semibold text-white truncate">
                          {tweet.owner?.fullName}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Link
                          to={`/c/${tweet.owner?.username}`}
                          className="hover:underline hover:text-neon-purple"
                        >
                          @{tweet.owner?.username}
                        </Link>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
                        </span>
                        {tweet.updatedAt !== tweet.createdAt && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500 text-xs">edited</span>
                          </>
                        )}
                      </div>
                    </div>


                    {/* Tweet Menu - Only for tweet owner */}
                    {user?._id === tweet.owner?._id && (
                      <div className="relative ml-2">
                        <button
                          onClick={() => setShowMenuId(showMenuId === tweet._id ? null : tweet._id)}
                          className="p-2 hover:bg-[var(--color-dark-tertiary)] rounded-lg transition-colors"
                        >
                          <FiMoreVertical className="w-4 h-4" />
                        </button>


                        {showMenuId === tweet._id && (
                          <>
                            {/* Backdrop */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMenuId(null)}
                            />
                            
                            <div className="absolute right-0 mt-2 w-36 card shadow-xl z-20">
                              <button
                                onClick={() => {
                                  setEditingId(tweet._id);
                                  setEditContent(tweet.content);
                                  setShowMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[var(--color-dark-tertiary)] text-left"
                              >
                                <FiEdit2 className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteTweet(tweet._id)}
                                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[var(--color-dark-tertiary)] text-red-400 text-left"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>


                  {/* Tweet Content */}
                  {editingId === tweet._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input min-h-[80px] resize-none"
                        maxLength={280}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateTweet(tweet._id)}
                          className="btn-primary text-sm py-1.5"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary text-sm py-1.5"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 mb-4 whitespace-pre-wrap break-words">
                      {tweet.content}
                    </p>
                  )}


                  {/* Actions */}
                  <button
                    onClick={() => handleLikeTweet(tweet._id, tweet.isLiked)}
                    className={`flex items-center space-x-2 transition-colors ${
                      tweet.isLiked
                        ? 'text-[var(--color-neon-pink)]'
                        : 'text-gray-400 hover:text-[var(--color-neon-pink)]'
                    }`}
                  >
                    <FiHeart
                      className={`w-4 h-4 transition-all ${
                        tweet.isLiked ? 'fill-current scale-110' : ''
                      }`}
                    />
                    <span className="text-sm">
                      {tweet.likesCount > 0 && tweet.likesCount}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


export default Tweets;

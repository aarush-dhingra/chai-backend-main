import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiBell, FiBellOff } from 'react-icons/fi';
import { toggleSubscription } from '../services/api';

function SubscribeButton({ channelId, initialIsSubscribed = false, subscriberCount = 0 }) {
  const { user } = useContext(AuthContext);
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [subCount, setSubCount] = useState(subscriberCount);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please login to subscribe');
      return;
    }

    setLoading(true);
    try {
      await toggleSubscription(channelId);
      setIsSubscribed(!isSubscribed);
      setSubCount(isSubscribed ? subCount - 1 : subCount + 1);
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
        isSubscribed
          ? 'bg-[var(--color-dark-tertiary)] text-gray-300 hover:bg-[var(--color-dark-border)]'
          : 'bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] text-white hover:opacity-90 shadow-lg shadow-[var(--color-neon-purple)]/30'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isSubscribed ? (
        <>
          <FiBellOff className="w-5 h-5" />
          <span>Subscribed</span>
        </>
      ) : (
        <>
          <FiBell className="w-5 h-5" />
          <span>Subscribe {subCount > 0 && `(${subCount})`}</span>
        </>
      )}
    </button>
  );
}

export default SubscribeButton;

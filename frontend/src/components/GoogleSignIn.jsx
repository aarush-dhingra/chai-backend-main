// frontend/src/components/GoogleSignIn.jsx
import { useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * GoogleSignIn component:
 * - initializes Google Identity Services
 * - opens popup when button clicked (uses google.accounts.id.prompt)
 * - sends id_token to backend /user/google-login
 *
 * Props:
 * - onSuccess(payload) optional callback (payload = { user, accessToken, refreshToken })
 *
 * If you prefer to handle login in parent, pass onSuccess. Otherwise it will call AuthContext.login directly.
 */
function GoogleSignIn({ onSuccess = null, buttonText = 'Sign in with Google', className = 'btn-primary w-full mt-3' }) {
  const { login } = useContext(AuthContext);

  useEffect(() => {
    // guard: wait until SDK is loaded and clientId available
    if (typeof window === 'undefined') return;
    if (!window.google) return;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set');
      return;
    }

    /* global google */
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        ux_mode: 'popup'
      });
    } catch (err) {
      console.error('Google SDK initialize error', err);
    }
    // eslint-disable-next-line
  }, []);

  // Backend endpoint - adjust host if different
  const backendUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/user/google-login';

  async function handleCredentialResponse(response) {
    const idToken = response?.credential;
    if (!idToken) {
      console.error('No id_token from Google response', response);
      return;
    }

    try {
      const res = await axios.post(backendUrl, { idToken }, { withCredentials: true });
      const payload = res?.data?.data ?? res?.data ?? res;
      const user = payload?.user ?? payload;
      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;

      // If parent wants to handle it
      if (typeof onSuccess === 'function') {
        onSuccess({ user, accessToken, refreshToken });
        return;
      }

      // otherwise use AuthContext.login
      if (login) {
        login(user, accessToken, refreshToken);
      }
    } catch (err) {
      console.error('Google sign-in failed', err);
      // user-friendly fallback:
      alert('Google sign-in failed. Try again or use email/password.');
    }
  }

  const openPopup = () => {
    if (!window.google) {
      alert('Google SDK not loaded yet. Try again in a moment.');
      return;
    }
    // This will show Google's One Tap / prompt UX or a popup depending on config
    google.accounts.id.prompt();
  };

  return (
    <button type="button" onClick={openPopup} className={className}>
      {buttonText}
    </button>
  );
}

export default GoogleSignIn;

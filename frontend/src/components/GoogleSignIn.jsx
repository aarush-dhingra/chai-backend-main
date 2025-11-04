// frontend/src/components/GoogleSignIn.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleSignIn({ onSuccess }) {
  const navigate = useNavigate();

  useEffect(() => {
    // wait for google accounts sdk to be loaded
    if (!window.google || !clientId) return;

    /* global google */
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      ux_mode: 'popup'
    });

    // optionally render a button into container
    // google.accounts.id.renderButton(document.getElementById('gsi-button'), { theme: 'outline', size: 'large' });

    // Or show One Tap automatically: google.accounts.id.prompt();
  }, []);

  const handleCredentialResponse = async (response) => {
    // response.credential is the id_token
    try {
      const idToken = response?.credential;
      if (!idToken) throw new Error('No idToken from Google');

      // send idToken to backend for verification & login
      const res = await axios.post('http://localhost:8000/user/google-login', { idToken }, { withCredentials: true });

      // Backend returns ApiResponse wrapper likely: res.data.data contains { user, accessToken, refreshToken }
      const payload = res?.data?.data ?? res?.data ?? res;
      if (onSuccess) onSuccess(payload);
      // Or you can call your AuthContext.login here if you have access
      // e.g. login(payload.user, payload.accessToken, payload.refreshToken)

    } catch (err) {
      console.error('Google sign-in error', err);
      // show user-friendly message
      alert('Google sign-in failed. Try again.');
    }
  };

  // optional: a custom button that triggers google one-tap popup
  const openPopup = () => {
    if (window.google) {
      google.accounts.id.prompt(); // shows One Tap UI or popup depending on config
    } else {
      alert('Google SDK not loaded yet');
    }
  };

  return (
    <div>
      {/* You can render Google default button (uncomment if you added a container) */}
      {/* <div id="gsi-button"></div> */}

      {/* Or show custom button that calls google.accounts.id.prompt() */}
      <button onClick={openPopup} className="btn-google w-full">
        Sign in with Google
      </button>
    </div>
  );
}

export default GoogleSignIn;

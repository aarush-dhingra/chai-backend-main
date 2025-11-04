// src/controllers/google.controller.js
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /user/google-login
 * Body: { idToken: string }
 *
 * Verifies the Google idToken, finds or creates a user, issues access & refresh tokens
 * using the User model token helpers and returns an ApiResponse with { user, accessToken, refreshToken }.
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, 'idToken is required');

  // verify token with Google
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  } catch (err) {
    throw new ApiError(400, 'Invalid Google idToken');
  }

  const payload = ticket.getPayload();
  if (!payload) throw new ApiError(400, 'Unable to verify Google token payload');

  // optional: enforce verified emails only
  if (!payload.email_verified) {
    // If you want to allow unverified emails, remove this check
    throw new ApiError(400, 'Google email not verified');
  }

  const email = String(payload.email).toLowerCase();
  const googleId = payload.sub; // unique Google user id

  // try to find existing user by googleId or email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    // create a username fallback from email
    const generateUsernameFromEmail = (e) => {
      const base = String(e).split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
      return base.length ? base : `user${Date.now().toString().slice(-5)}`;
    };

    const newUser = new User({
      fullName: payload.name || '',
      username: generateUsernameFromEmail(email),
      email,
      avatar: payload.picture || '',
      googleId,
      // do NOT set a password for OAuth users (depends on your model; leave undefined)
    });

    try {
      user = await newUser.save();
    } catch (err) {
      // handle potential duplicate username/email collisions by mutating username and retrying
      if (err && err.code === 11000) {
        newUser.username = `${newUser.username}${Date.now().toString().slice(-4)}`;
        user = await newUser.save();
      } else {
        throw new ApiError(500, 'Failed to create user from Google profile');
      }
    }
  } else {
    // existing user: ensure googleId is set (in case they registered by email earlier)
    let changed = false;
    if (!user.googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (!user.avatar && payload.picture) {
      user.avatar = payload.picture;
      changed = true;
    }
    if (changed) {
      await user.save({ validateBeforeSave: false });
    }
  }

  // generate access & refresh tokens using User model helpers (mirrors your existing code)
  try {
    // assuming User model has instance methods generateAccessToken()/generateRefreshToken()
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // store refresh token on user (same pattern as your existing function)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // sanitize user object before sending
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    delete userObj.refreshToken;

    return res.status(200).json(
      new ApiResponse(200, { user: userObj, accessToken, refreshToken }, 'Google login successful')
    );
  } catch (err) {
    console.error('Token generation failed for Google login:', err);
    throw new ApiError(500, 'Error in generating access and refresh token');
  }
});

export { googleLogin };

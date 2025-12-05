// src/controllers/otp.controller.js
import crypto from 'crypto';
import { OTP } from '../models/otp.model.js';
import { User } from '../models/user.model.js';
import { sendEmail } from '../utils/sendgridMailer.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const OTP_EXP_MIN = Number(process.env.OTP_EXPIRE_MINUTES || 10);
const OTP_ATTEMPT_LIMIT = Number(process.env.OTP_ATTEMPT_LIMIT || 5);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

function hashOtp(otp) {
  // server-side hashing
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

/**
 * POST /auth/send-otp
 * body: { email, purpose? }
 */
const sendOtp = asyncHandler(async (req, res) => {
  const { email, purpose = 'email-verification' } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  // simple throttle: don't send if last OTP for this email is < 60s old
  const recent = await OTP.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (recent && (Date.now() - new Date(recent.createdAt).getTime()) < 60 * 1000) {
    throw new ApiError(429, 'Please wait before requesting a new code');
  }

  const otp = generateOTP();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXP_MIN * 60 * 1000);

  await OTP.create({ email: email.toLowerCase(), otpHash, purpose, expiresAt });

  const html = `
    <p>Hi,</p>
    <p>Your verification code for VideoStream is <strong>${otp}</strong>.</p>
    <p>This code will expire in ${OTP_EXP_MIN} minutes. If you didn't request this code, ignore this email.</p>
  `;

  // send via SendGrid
  await sendEmail({
    to: email,
    subject: 'Your VideoStream verification code',
    html,
    text: `Your verification code is ${otp}. Expires in ${OTP_EXP_MIN} minutes.`
  });

  return res.status(200).json(new ApiResponse(200, { message: 'OTP sent' }, 'OTP sent'));
});

/**
 * POST /auth/verify-otp
 * body: { email, otp, purpose? }
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, purpose = 'email-verification' } = req.body;
  if (!email || !otp) throw new ApiError(400, 'Email and OTP are required');

  const record = await OTP.findOne({ email: email.toLowerCase(), purpose }).sort({ createdAt: -1 });
  if (!record) throw new ApiError(400, 'No OTP found for this email');

  if (record.attempts >= OTP_ATTEMPT_LIMIT) {
    await record.deleteOne();
    throw new ApiError(429, 'Too many attempts. Request a new code.');
  }

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    throw new ApiError(400, 'OTP expired. Request a new code.');
  }

  const providedHash = hashOtp(String(otp));
  if (providedHash !== record.otpHash) {
    record.attempts = (record.attempts || 0) + 1;
    await record.save();
    throw new ApiError(400, 'Invalid OTP');
  }

  // success
  await record.deleteOne();

  // Optionally mark user.emailVerified if user exists (we're registering next)
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user.emailVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  return res.status(200).json(new ApiResponse(200, { verified: true }, 'OTP verified'));
});

export { sendOtp, verifyOtp };

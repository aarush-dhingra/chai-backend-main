// src/models/otp.model.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  purpose: { type: String, default: 'email-verification' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 }
}, { timestamps: true });

otpSchema.index({ email: 1, purpose: 1 });

export const OTP = mongoose.model('OTP', otpSchema);

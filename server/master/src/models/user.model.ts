import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    starred: [
      {
        type: String,
      },
    ],
    password_reset_token: {
      type: String,
      required: false,
    },
    password_reset_expires: {
      type: Date,
      required: false,
    },
    refresh_token: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verification_otp: {
      type: String,
      required: false,
    },
    verification_otp_expiry: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ password_reset_expires: 1 });

const User = mongoose.model("User", UserSchema);
export default User;

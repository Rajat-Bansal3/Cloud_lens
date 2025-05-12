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

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err: any) {
      return next(err);
    }
  }
  return next();
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ password_reset_expires: 1 });

const User = mongoose.model("User", UserSchema);
export default User;

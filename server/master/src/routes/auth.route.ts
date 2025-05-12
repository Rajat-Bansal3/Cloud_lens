import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import {
  catchAsync,
  gen_tokens,
  generate_random_number,
  hashString,
  verifyHash,
} from "src/lib/utils";
import { RefreshToken } from "src/models/token.model";
import User from "src/models/user.model";
import crypto from "crypto";
import env from "src/env";
import { checkDatabaseConnection } from "src/lib/db";
import { stateMap } from "src/lib/constants";

const router = Router();

router.post(
  "/sign-in",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await User.findOne({ email: email.toLowerCase() });

    const comp =
      user?.password ||
      (await hashString(crypto.randomBytes(16).toString("hex")));

    const valid = await verifyHash(password, comp);
    if (!user?._id || !valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await RefreshToken.updateMany(
      {
        userId: user._id,
      },
      {
        $set: { isRevoked: true },
      }
    );

    const { access_token, refresh_token } = gen_tokens(user._id);

    const hashedToken = await hashString(refresh_token);
    await RefreshToken.create({
      token: hashedToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    const { password: _, ...safeUser } = user.toObject();

    return res.status(200).json({
      message: "Logged In",
      user: safeUser,
    });
  })
);

router.post(
  "/sign-up",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body as {
      username: string;
      email: string;
      password: string;
    };
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(409).json({ message: "Registration Failed" });
    }
    const _user = new User({
      username,
      email: email.toLowerCase(),
      password: await hashString(password),
    });
    await _user.save();
    return res.status(201).json({ message: "Registration Successfull" });
  })
);
router.post(
  "/forget-password",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as { email: string };
    const user = await User.findOne({
      email: email.toLowerCase(),
    });
    if (!user) {
      return res
        .status(200)
        .json({ message: "Reset email sent if account exists" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await hashString(resetToken);

    user.password_reset_token = hashedToken;
    user.password_reset_expires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetURL = `${env.CLIENT_URL}/reset-password/${resetToken}?id=${user._id}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: "Password Reset Request",
    //   text: `Use this link to reset your password: ${resetURL}\nLink expires in 15 minutes.`,
    // });
    //WIP : send email function
    return res
      .status(200)
      .json({ message: "Reset email sent if account exists" });
  })
);
router.post(
  "/reset-password/:token",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query as { id: string };
    const { token } = req.params as { token: string };
    const { new_password } = req.body as { new_password: string };
    const user = await User.findOne({
      _id: id,
      password_reset_expires: { $gt: Date.now() },
    });
    const comp =
      user?.password_reset_token || crypto.randomBytes(16).toString("hex");

    const valid = await verifyHash(token, comp);
    if (!valid || !user) {
      return res.json(409).json({ message: "Invalid URL or expired token" });
    }
    user.password = await hashString(new_password);
    user.password_reset_token = null;
    user.password_reset_expires = null;

    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });

    return res.status(200).json({ message: "Password reset successful" });
  })
);
router.post(
  "/verify-email",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.userId;
    const user = await User.findById(id);
    if (!user)
      return res.status(409).json({ message: "Invalid or Expired OTP" });

    if (user.verified)
      return res.status(400).json({ message: "User already Verified" });
    const OTP = generate_random_number();
    user.verification_otp = await hashString(OTP);
    user.verification_otp_expiry = new Date(Date.now() + 6 * 60 * 1000);
    await user.save();
    const verification_otp = `${env.CLIENT_URL}/reset-password/${OTP}?id=${id}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: "email verification for CLOUDLENS.",
    //   text: `Enter the OTP in the page redirected to for verificatoin in next 6 mins`,
    // });
    //WIP : write sendEmail function
    return res.status(200).json({ message: "OTP send" });
  })
);
router.post(
  "/verify",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { OTP } = req.body as { OTP: string };
    const id = req.userId;
    const user = await User.findOne({
      _id: id,
      verification_otp_expiry: { $gt: new Date() },
    });
    const isValid = user
      ? await verifyHash(OTP, user.verification_otp!)
      : await verifyHash(OTP, "dummy");
    if (!user || !isValid) {
      return res.status(409).json({ message: "Invalid or Expired OTP" });
    }
    user.verified = true;
    user.verification_otp = null;
    user.verification_otp_expiry = null;
    await user.save();
    return res.status(200).json({ message: "user verified" });
  })
);
router.post(
  "/sign-out",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await RefreshToken.updateMany(
      {
        userId: req.userId,
      },
      {
        isRevoked: true,
      }
    );
    const cookie_options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };
    res.clearCookie("access_token", { ...cookie_options, path: "/" });
    res.clearCookie("refresh_token", {
      ...cookie_options,
      path: "/auth/refresh",
    });
    return res.status(204);
  })
);
router.post(
  "/refresh",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {})
);
router.post(
  "/me",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.userId;
    const user = await User.findById(id)
      .select(
        "-password -__v -verification_otp -refresh_token -password_reset_token"
      )
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  })
);
router.get(
  "/health",
  catchAsync(async (req: Request, res: Response) => {
    const dbStatus = stateMap[(await checkDatabaseConnection()) || 0];
    const memoryUsage = process.memoryUsage();

    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
    });
  })
);

export default router;

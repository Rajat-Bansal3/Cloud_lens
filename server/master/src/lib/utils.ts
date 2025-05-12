import type { Request, Response, NextFunction } from "express";
import type mongoose from "mongoose";
import jwt from "jsonwebtoken";
import env from "src/env";
import crypto from "crypto";
import bcrypt from "bcryptjs";

type AsyncHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<any>;

/**
 * try Catch wrapper with auto catch implemented and connected to global error handler and logger
 */
export function catchAsync(fn: AsyncHandler) {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * Generates access_token and Refresh-tokens from mongo id of users
 */
export const gen_tokens = (userId: mongoose.Types.ObjectId) => {
	const access_jti = crypto.randomUUID();
	const refresh_jti = crypto.randomUUID();
	const access_token = jwt.sign(
		{ sub: userId.toString(), jti: access_jti },
		env.JWT_SECRET,
		{
			expiresIn: "15m",
		},
	);
	const refresh_token = jwt.sign(
		{ sub: userId.toString(), jti: refresh_jti },
		env.JWT_SECRET,
		{
			expiresIn: "7d",
		},
	);
	return { access_token, refresh_token, refresh_jti, access_jti };
};
/**
 * Hashes a string using bcrypt with a configurable salt rounds (default: 12).
 */
export const hashString = async (
	input: string,
	saltRounds = 12,
): Promise<string> => {
	return bcrypt.hash(input, saltRounds);
};

/**
 * Compares a plain string with a hashed string securely.
 */
export const verifyHash = async (
	input: string,
	hashed: string,
): Promise<boolean> => {
	return await bcrypt.compare(input, hashed);
};
/**
 * Generates a random number of the required length (defaults to 6 digits)
 */
export const generate_random_number = (len = 6): string => {
	let otp = "";
	for (let i = 0; i < len; i++) {
		otp += Math.floor(Math.random() * 10).toString();
	}
	return otp;
};

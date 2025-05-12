import type { Request, Response, NextFunction } from "express";

export type AsyncHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<any>;

declare global {
	namespace Express {
		interface Request {
			userId: string;
		}
	}
}

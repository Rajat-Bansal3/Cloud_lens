import { v4 as uuidv4 } from "uuid";
import pinoHttp from "pino-http";
import type { Request, Response } from "express";
import logger from "../lib/logger";

const isDev = process.env.NODE_ENV !== "production";

const loggingMiddleware = pinoHttp({
	logger,
	quietReqLogger: false,
	genReqId: (req: Request) =>
		req.headers["x-request-id"]?.toString() || uuidv4(),

	serializers: {
		req: (req: Request) => ({
			id: req.id,
			method: req.method,
			url: req.url,
			headers: isDev ? req.headers : undefined,
			remoteAddress:
				req.headers["x-forwarded-for"] ||
				(req.socket && req.socket.remoteAddress) ||
				"unknown",
		}),
		res: (res: Response) => ({
			statusCode: res.statusCode,
		}),
		err: (err: Error) => ({
			type: err.name,
			message: err.message,
			stack: isDev ? err.stack : undefined,
		}),
	},

	customLogLevel: (req, res, err) => {
		if (err || res.statusCode >= 500) return "error";
		if (res.statusCode >= 400) return "warn";
		return "info";
	},
});

export default loggingMiddleware;

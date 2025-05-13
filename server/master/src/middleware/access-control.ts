import type { Response, Request, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import env from "src/env";

// Ensure you have a cookie parser middleware enabled: `app.use(cookieParser());`

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.access_token;

  if (!token) {
    res.status(401).json({ message: "Missing access token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.userId = decoded.sub!;

    next();
    return;
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};

import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  persona?: string;
  image?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentication required to access this resource" },
      });
    }

    (req as AuthenticatedRequest).user = session.user as AuthenticatedUser;
    (req as AuthenticatedRequest).session = session.session;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Invalid or expired session" },
    });
  }
}

/**
 * Optional authentication middleware.
 * Attaches user session to req if present, but permits guest requests to continue.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session && session.user) {
      (req as AuthenticatedRequest).user = session.user as AuthenticatedUser;
      (req as AuthenticatedRequest).session = session.session;
    }
  } catch {
    // Proceed as unauthenticated guest
  }
  return next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Insufficient privileges for this operation" },
      });
    }
    return next();
  };
}

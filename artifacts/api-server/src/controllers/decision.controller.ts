import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { decisionService } from "../services/decision.service";

export class DecisionController {
  async getLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const entries = await decisionService.getDecisionLedger(user.id);
      return res.status(200).json({ entries });
    } catch (err) {
      return next(err);
    }
  }
}

export const decisionController = new DecisionController();

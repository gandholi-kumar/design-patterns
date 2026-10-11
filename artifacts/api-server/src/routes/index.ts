import { Router, type IRouter } from "express";
import healthRouter from "./health";
import codeRouter from "./code";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/code", codeRouter);

export default router;

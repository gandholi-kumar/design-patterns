import { Router, type IRouter } from "express";
import healthRouter from "./health";
import codeRouter from "./code";
import mediaRouter from "./media";
import progressRouter from "./progress";
import notesRouter from "./notes";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/code", codeRouter);
router.use("/media", mediaRouter);
router.use(progressRouter);
router.use(notesRouter);
router.use(aiRouter);

export default router;

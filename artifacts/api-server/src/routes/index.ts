import { Router, type IRouter } from "express";
import healthRouter from "./health";
import commentsRouter from "./comments";
import issueSubmissionsRouter from "./issue-submissions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(commentsRouter);
router.use(issueSubmissionsRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import commentsRouter from "./comments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(commentsRouter);

export default router;

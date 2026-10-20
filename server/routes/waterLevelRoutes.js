import express from "express";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  createWaterLevel,
  getWaterLevels,
  getLatestWaterLevel,
  getWaterLevelHistoryByCamera,
  getDailyWaterLevelHistory,
  deleteDailyWaterLevelHistory,
  getWaterLevelAnalytics,
} from "../controllers/waterLevelController.js";

const router = express.Router();
const { requireDrrmo } = adminMiddleware;

router.post("/", requireDrrmo, createWaterLevel);

router.get("/", getWaterLevels);
router.get("/latest/:camera_id", getLatestWaterLevel);
router.get("/history/:camera_id", getWaterLevelHistoryByCamera);

router.get(
  "/history/daily",
  getDailyWaterLevelHistory
);

router.delete(
  "/history/daily/:id",
  requireDrrmo,
  deleteDailyWaterLevelHistory
);

router.get(
  "/latest/:camera_id",
  getLatestWaterLevel
);

router.get(
  "/analytics",
  getWaterLevelAnalytics
);

export default router;

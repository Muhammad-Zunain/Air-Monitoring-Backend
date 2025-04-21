import {
  getAllAirData,
  addAirData,
  getAirDataStats,
  getMonthlyAveragesController,
} from "../controllers/airMonitoringData.controller.js";
import { Router } from "express";

const airMonitoringRouter = Router();

airMonitoringRouter.post("/add-air-data", addAirData);
airMonitoringRouter.get("/get-monthly-averages", getMonthlyAveragesController);
airMonitoringRouter.get("/get-air-data", getAllAirData);
airMonitoringRouter.get("/get-stat-data", getAirDataStats);

export default airMonitoringRouter;

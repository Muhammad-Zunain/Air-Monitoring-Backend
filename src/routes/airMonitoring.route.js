import {
  getAllAirData,
  addAirData,
  getAirDataStats,
  getMonthlyAverages,
  getLastHourAirData
} from "../controllers/airMonitoringData.controller.js";
import { Router } from "express";

const airMonitoringRouter = Router();

airMonitoringRouter.post("/add-air-data", addAirData);
airMonitoringRouter.get("/get-monthly-averages", getMonthlyAverages);
airMonitoringRouter.get("/get-air-data", getAllAirData);
airMonitoringRouter.get("/get-stat-data", getAirDataStats);
airMonitoringRouter.get("/get-data-last-hour", getLastHourAirData);


export default airMonitoringRouter;

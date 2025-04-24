import multer from "multer";
import {
  getAllAirData,
  addAirData,
  getAirDataStats,
  getMonthlyAverages,
  getLastHourAirData,
  saveSensorLocation,
  uploadBinFile
} from "../controllers/airMonitoringData.controller.js";
import { upload } from "../middlewares/fileUpload.middleware.js"
import { Router } from "express";

const airMonitoringRouter = Router();

airMonitoringRouter.post("/add-air-data", addAirData);
airMonitoringRouter.post("/save-sensor-location", saveSensorLocation);
airMonitoringRouter.get("/get-monthly-averages", getMonthlyAverages);
airMonitoringRouter.get("/get-air-data", getAllAirData);
airMonitoringRouter.get("/get-stat-data", getAirDataStats);
airMonitoringRouter.get("/get-data-last-hour", getLastHourAirData);
airMonitoringRouter.post("/upload-bin-file", upload.single("file"), uploadBinFile);


export default airMonitoringRouter;


import { getAllAirData, addAirData } from '../controllers/airMonitoringData.controller.js';
import { Router } from 'express';


const airMonitoringRouter = Router();

airMonitoringRouter.get('/get-air-data', getAllAirData);
// airMonitoringRouter.get('/filter', filterAirData);
airMonitoringRouter.post('/add-air-data', addAirData);

export default airMonitoringRouter;
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AirData } from '../models/airMonitoring.model.js';

// @desc    Get all air monitoring data
// @route   GET /api/air-monitoring/get-air-data
// @access  Public
const getAllAirData  = asyncHandler(async (req, res) => {
    const airData = await AirData.find({}).sort({ timestamp: -1 });
    if (!airData) {
        return res.status(404).json(new ApiResponse(404, null, "Error occurred while fetching data "));
    }
    res.status(201).json(service); 
    return res.status(201).json(new ApiResponse(200,airData ,"Air Monitoring data fetched successfully")); 
});


// @desc    Add air monitoring data
// @route   POST /api/air-monitoring/add-air-data
// @access  Public
const addAirData = asyncHandler(async (req, res) => {
    const { temperature, humidity, dust } = req.body;
    if (!temperature || !humidity || !dust) {
        return res.status(400).json(new ApiResponse(400, null, "Please provide all required fields"));
    }
    const airData = await AirData(req.body);
    await airData.save();
    if (!airData) {
        return res.status(500).json(new ApiResponse(500, null, "Error occurred while saving data"));
    }
    res.status(201).json(new ApiResponse(201, airData, "Air Monitoring data added successfully"));
}
);


export { getAllAirData, addAirData };
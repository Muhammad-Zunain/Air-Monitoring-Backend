import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AirData } from "../models/airMonitoring.model.js";
import { SensorLocation } from "../models/sensorLocation.model.js";
import { console } from "inspector";
import path from "path";
import fs from "fs";


// @desc    Get all air monitoring data
// @route   GET /api/air-monitoring/get-air-data
// @access  Public
const getAllAirData = asyncHandler(async (req, res) => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const airData = await AirData.find({
      timestamp: { $gte: new Date('2024-12-31T00:00:00.000Z') }
    })
      .sort({ timestamp: -1 })
      .limit(1000)
      .setOptions({ allowDiskUse: true }); 

    if (!airData || airData.length === 0) {
      
    console.log("No data found");
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No data found for the last 24 hours"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, airData, "Air Monitoring data from last 24 hours fetched successfully")
      );
  
});

// @desc    Add air monitoring data
// @route   POST /api/air-monitoring/add-air-data
// @access  Public
const addAirData = asyncHandler(async (req, res) => {
  const { temperature, humidity, dust } = req.body;
  if (!temperature || !humidity || !dust) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Please provide all required fields"));
  }
  const airData = await AirData(req.body);
  await airData.save();
  if (!airData) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Error occurred while saving data"));
  }
  res
    .status(201)
    .json(
      new ApiResponse(201, airData, "Air Monitoring data added successfully")
    );
});

// @desc    Get monthly averages of air monitoring data
// @route   GET /api/air-monitoring/get-monthly-averages
// @access  Public
const getMonthlyAverages = asyncHandler(async (req, res) => {
  const { year, type } = req.query;
  if (!year || !type) {
    return res.status(400).json({ error: "Year and type are required." });
  }

  const start = new Date(`${year}-01-01T00:00:00Z`);
  const end = new Date(`${parseInt(year) + 1}-01-01T00:00:00Z`);
  console.log("Start:", start);
  const entries = await AirData.find({
    timestamp: { $gte: start, $lt: end },
  }).limit(530000)
  .setOptions({ allowDiskUse: true }); 
  console.log("Entries:", entries.length);
  const monthlySums = Array(12).fill(0);
  const monthlyCounts = Array(12).fill(0);

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const monthIndex = date.getMonth();
    const value = parseFloat(entry[type]);
    if (!isNaN(value)) {
      monthlySums[monthIndex] += value;
      monthlyCounts[monthIndex]++;
    }
  });

  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthlyAverages = monthlySums.map((sum, index) => {
    const avg = monthlyCounts[index] > 0
      ? parseFloat((sum / monthlyCounts[index]).toFixed(2))
      : 0;
    return {
      month: allMonths[index],
      [type]: avg
    };
  });
  console.log(monthlyAverages);
  res.status(201).json(
    new ApiResponse(
      201,
      { monthlyAverages },
      "Monthly averages fetched successfully"
    )
  );
});


// @desc    Get air data stats
// @route   GET /api/air-monitoring/get-stat-data
// @access  Public
const getAirDataStats = asyncHandler(async (req, res) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const airData = await AirData.find({
    timestamp: { $gte: new Date('2024-12-31T00:00:00.000Z') }
  })
    .sort({ timestamp: -1 })
    .limit(1000)
    .setOptions({ allowDiskUse: true });

  if (airData.length === 0) {
    console.log("No datastat found");
    return res.status(404).json(new ApiResponse(404, {}, "No data"));
  }

  const buildStats = (type) => {
    const values = airData.map((entry) => parseFloat(entry[type]));
    const current = values[values.length - 1];
    const highest = Math.max(...values);
    const lowest = Math.min(...values);

    const getIncrease = (current, previous) => {
      if (previous === 0) return "0%";
      const diff = ((current - previous) / previous) * 100;
      return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
    };

    const prev = values[values.length - 2] || current;

    return [
      {
        title: `Current ${type}`,
        value: current,
        increase: getIncrease(current, prev),
        description: `from last 24 hours"`,
        icon: type,
      },
      {
        title: `Highest ${type} Today`,
        value: highest,
        increase: getIncrease(highest, current),
        description: `from last 24 hours"`,
        icon: "up",
      },
      {
        title: `Lowest ${type} Today`,
        value: lowest,
        increase: getIncrease(lowest, current),
        description: `from last 24 hours"`,
        icon: "down",
      },
    ];
  };

  res.status(201).json(
    new ApiResponse(
      201,
      {
        temperature: buildStats("temperature"),
        humidity: buildStats("humidity"),
        dust: buildStats("dust"),
      },
      "Stats from last 24 hours"
    )
  );
});

const getLastHourAirData = asyncHandler(async (req, res) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const airData = await AirData.find({
      timestamp: { $gte: oneHourAgo }
    })
      .sort({ timestamp: -1 })
      .limit(1000);

    if (airData.length === 0) {
      return res.status(404).json(new ApiResponse(404, {}, "No data found in the last hour"));
    }

    res.status(200).json(
      new ApiResponse(200, airData, "Air data from the last hour")
    );
  } catch (error) {
    console.error("Error fetching last hour data:", error);
    res.status(500).json(new ApiResponse(500, {}, "Server Error"));
  }
});

const saveSensorLocation = asyncHandler(async (req, res) => {
  const { country, city, regionName, lon, lat } = req.body;
  console.log(req.body);
  if (!country || !city || !regionName || !lon || !lat) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Please provide all required fields"));
  }

  const sensorLocationData = {
    country,
    city,
    regionName,
    lon,
    lat
  };

  const sensorLocation = await SensorLocation(sensorLocationData);
  await sensorLocation.save();
  if (!sensorLocation) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Error occurred while saving data"));
  }

  // delete the previous location stored
  await SensorLocation.deleteMany({ _id: { $ne: sensorLocation._id } });

  res
    .status(201)
    .json(
      new ApiResponse(201, sensorLocation, "Sensor location added successfully")
    );
});



const uploadBinFile = (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json(new ApiResponse(400, null, 'No file uploaded'));
  }

  return res.status(201).json(new ApiResponse(201, {}, 'File uploaded successfully'));
};

const getBinFileURL = (req, res) => {
  const uploadDir = path.join(process.cwd(), 'public', 'temp');

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to read upload directory' });
    }
    
    const firmwareFile = files.filter((f) => f.endsWith('.bin'))[0];

    if (firmwareFile) {
      const encodedFilename = encodeURIComponent(firmwareFile);
      const firmwareUrl = `${req.protocol}://${req.get('host')}/temp/${encodedFilename}`;
    
      return res.status(200).json(new ApiResponse(200, { available: true, url: firmwareUrl }, 'Firmware file available'));
    } else {
      return res.status(404).json(new ApiResponse(404, null, 'No firmware file found'));
    }    
  });
};

const deleteBinFile = asyncHandler(async (req, res) => {
  const uploadDir = path.join(process.cwd(), 'public', 'temp');

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Failed to read upload directory:", err);
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to read upload directory"));
    }

    // Filter and delete previous .bin files
    files
      .filter((f) => f.endsWith('.bin')) // Delete all .bin files
      .forEach((f) => {
        fs.unlink(path.join(uploadDir, f), (err) => {
          if (err) {
            console.error(`Failed to delete file ${f}:`, err);
          }
        });
      });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Bin files deleted successfully"));
  });
});


export {
  getAllAirData,
  addAirData,
  getMonthlyAverages,
  getAirDataStats,
  getLastHourAirData,
  saveSensorLocation,
  uploadBinFile,
  getBinFileURL,
  deleteBinFile
};

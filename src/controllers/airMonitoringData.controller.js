import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AirData } from "../models/airMonitoring.model.js";

// @desc    Get all air monitoring data
// @route   GET /api/air-monitoring/get-air-data
// @access  Public
const getAllAirData = asyncHandler(async (req, res) => {
  const airData = await AirData.find({}).sort({ timestamp: -1 }).limit(1000);
  if (!airData) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Error occurred while fetching data "));
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, airData, "Air Monitoring data fetched successfully")
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
const getMonthlyAveragesController = asyncHandler(async (req, res) => {
  const { year, type } = req.query;

  if (!year || !type) {
    return res.status(400).json({ error: "Year and type are required." });
  }

  const start = new Date(`${year}-01-01T00:00:00Z`);
  const end = new Date(`${parseInt(year) + 1}-01-01T00:00:00Z`);

  const entries = await AirData.find({
    timestamp: { $gte: start, $lt: end },
  });

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

  const monthlyAverages = monthlySums.map((sum, index) =>
    monthlyCounts[index] > 0
      ? parseFloat((sum / monthlyCounts[index]).toFixed(2))
      : 0
  );

  res
    .status(201)
    .json(
      ApiResponse(
        201,
        { year, type, monthlyAverages },
        "Monthly averages fetched successfully"
      )
    );
});

// @desc    Get air data stats
// @route   GET /api/air-monitoring/get-stat-data
// @access  Public
const getAirDataStats = asyncHandler(async (req, res) => {
  const airData = await AirData.find().limit(1000).sort({ timestamp: -1 });
  console.log("okkk", airData);

  if (airData.length === 0) return res.status(404).json(new ApiResponse(404, {}, "No data" ));

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
        description: `Since last record`,
        icon: type
      },
       {
        title: `Highest ${type} Today`,
        value: highest,
        increase: getIncrease(highest, current),
        description: `Since last record`,
        icon: "up",
      },
       {
        title: `Lowest ${type} Today`,
        value: lowest,
        increase: getIncrease(lowest, current),
        description: `Since last record`,
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
      ""
    )
  );
});

export {
  getAllAirData,
  addAirData,
  getMonthlyAveragesController,
  getAirDataStats,
};

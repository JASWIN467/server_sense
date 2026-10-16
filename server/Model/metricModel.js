// Metric document schema
import mongoose from "mongoose";

const metricSchema = new mongoose.Schema({
  cpuLoad: {
    type: Number,
    required: true,
  },
  memUsedPercent: {
    type: Number,
    required: true,
  },
  memUsedMB: {
    type: Number,
    required: true,
  },
  memTotalMB: {
    type: Number,
    required: true,
  },
  diskUsedPercent: {
    type: Number,
    required: true,
  },
  uptimeSeconds: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create collection named 'metrics'
const MetricCollection = mongoose.model("metrics", metricSchema);

export default MetricCollection;

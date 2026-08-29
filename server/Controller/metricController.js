import si from "systeminformation";
import MetricCollection from "../Model/metricModel.js";

// ====================== COLLECT LIVE METRICS (helper) ======================
const collectMetrics = async () => {
  const [cpuData, memData, diskData, osData] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.osInfo(),
  ]);

  const cpuLoad = parseFloat(cpuData.currentLoad.toFixed(2));

  const memTotalMB = parseFloat((memData.total / 1024 / 1024).toFixed(2));
  const memUsedMB = parseFloat((memData.used / 1024 / 1024).toFixed(2));
  const memUsedPercent = parseFloat(
    ((memData.used / memData.total) * 100).toFixed(2)
  );

  // Use the first mounted disk that has a size
  const mainDisk = diskData.find((d) => d.size > 0) || diskData[0];
  const diskUsedPercent = mainDisk
    ? parseFloat(mainDisk.use.toFixed(2))
    : 0;

  const uptimeSeconds = Math.floor(osData.uptime || 0);

  return { cpuLoad, memUsedPercent, memUsedMB, memTotalMB, diskUsedPercent, uptimeSeconds };
};


// ====================== GET CURRENT METRICS (live, no DB) ======================
export const getCurrentMetrics = async (req, res) => {
  try {
    const metrics = await collectMetrics();
    res.json({ ...metrics, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ====================== SAVE METRIC SNAPSHOT (runs on timer) ======================
export const saveMetricSnapshot = async () => {
  try {
    const metrics = await collectMetrics();
    const snapshot = new MetricCollection(metrics);
    await snapshot.save();
    console.log("[MetricSnapshot] Saved at", new Date().toISOString());
  } catch (err) {
    console.error("[MetricSnapshot] Error saving snapshot:", err.message);
  }
};


// ====================== GET METRIC HISTORY (from DB) ======================
export const getMetricHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await MetricCollection.find()
      .sort({ timestamp: 1 }) // oldest-to-newest for charting
      .limit(limit);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ====================== HEALTH CHECK ======================
export const healthCheck = async (req, res) => {
  try {
    const uptimeSeconds = Math.floor(process.uptime());
    res.json({ status: "ok", uptime: uptimeSeconds });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

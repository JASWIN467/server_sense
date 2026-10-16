import Threshold from "../Model/thresholdModel.js";
import { isDbConnected } from "../DB/db.js";

// In-memory fallback when MongoDB is not available
let _memThresholds = {
  cpuWarning: 70,
  cpuCritical: 90,
  memWarning: 75,
  memCritical: 85,
  diskWarning: 80,
  diskCritical: 95,
  allowedPaths: ["./logs", "./tmp", "scratch", "C:/tmp"],
};

// ====================== GET THRESHOLDS ======================
export const getThresholds = async (req, res) => {
  // If DB not connected, return in-memory defaults immediately
  if (!isDbConnected()) {
    return res.json({ ..._memThresholds, _source: "memory" });
  }

  try {
    let threshold = await Threshold.findOne();
    if (!threshold) {
      threshold = await Threshold.create({});
    }
    res.json(threshold);
  } catch (err) {
    // Fallback to memory on any DB error
    console.warn("[Thresholds] DB error, using in-memory fallback:", err.message);
    res.json({ ..._memThresholds, _source: "memory" });
  }
};

// ====================== UPDATE THRESHOLDS ======================
export const updateThresholds = async (req, res) => {
  const {
    cpuWarning,
    cpuCritical,
    memWarning,
    memCritical,
    diskWarning,
    diskCritical,
    allowedPaths,
  } = req.body;

  // ---- Backend Validation ----
  const incoming = { cpuWarning, cpuCritical, memWarning, memCritical, diskWarning, diskCritical };
  for (const [key, val] of Object.entries(incoming)) {
    if (val !== undefined) {
      if (typeof val !== "number" || isNaN(val)) {
        return res.status(400).json({ message: `'${key}' must be a number.` });
      }
      if (val < 0 || val > 100) {
        return res.status(400).json({ message: `'${key}' must be between 0 and 100. Got: ${val}` });
      }
    }
  }

  if (allowedPaths !== undefined) {
    if (!Array.isArray(allowedPaths)) {
      return res.status(400).json({ message: "'allowedPaths' must be an array of directory paths." });
    }
  }

  // Merge with current values to validate warning < critical
  const merged = {
    ..._memThresholds,
    ...Object.fromEntries(Object.entries(incoming).filter(([, v]) => v !== undefined)),
  };
  if (merged.cpuWarning >= merged.cpuCritical) {
    return res.status(400).json({ message: `CPU warning (${merged.cpuWarning}%) must be less than CPU critical (${merged.cpuCritical}%).` });
  }
  if (merged.memWarning >= merged.memCritical) {
    return res.status(400).json({ message: `Memory warning (${merged.memWarning}%) must be less than Memory critical (${merged.memCritical}%).` });
  }
  if (merged.diskWarning >= merged.diskCritical) {
    return res.status(400).json({ message: `Disk warning (${merged.diskWarning}%) must be less than Disk critical (${merged.diskCritical}%).` });
  }
  // ---- End Validation ----

  // Always update in-memory copy so live metric checker is in sync
  if (cpuWarning !== undefined) _memThresholds.cpuWarning = cpuWarning;
  if (cpuCritical !== undefined) _memThresholds.cpuCritical = cpuCritical;
  if (memWarning !== undefined) _memThresholds.memWarning = memWarning;
  if (memCritical !== undefined) _memThresholds.memCritical = memCritical;
  if (diskWarning !== undefined) _memThresholds.diskWarning = diskWarning;
  if (diskCritical !== undefined) _memThresholds.diskCritical = diskCritical;
  if (allowedPaths !== undefined) _memThresholds.allowedPaths = allowedPaths;

  // If DB not connected, persist to memory only
  if (!isDbConnected()) {
    console.log("[Thresholds] DB offline — saved to memory:", _memThresholds);
    return res.json({
      message: "Thresholds updated (memory only — DB offline)",
      threshold: { ..._memThresholds, _source: "memory" },
    });
  }

  try {
    let threshold = await Threshold.findOne();
    if (!threshold) {
      threshold = new Threshold();
    }

    if (cpuWarning !== undefined) threshold.cpuWarning = cpuWarning;
    if (cpuCritical !== undefined) threshold.cpuCritical = cpuCritical;
    if (memWarning !== undefined) threshold.memWarning = memWarning;
    if (memCritical !== undefined) threshold.memCritical = memCritical;
    if (diskWarning !== undefined) threshold.diskWarning = diskWarning;
    if (diskCritical !== undefined) threshold.diskCritical = diskCritical;
    if (allowedPaths !== undefined) threshold.allowedPaths = allowedPaths;

    await threshold.save();
    console.log("[Thresholds] Updated in DB:", threshold);

    res.json({ message: "Thresholds updated successfully", threshold });
  } catch (err) {
    console.warn("[Thresholds] DB save failed, kept in memory:", err.message);
    res.json({
      message: "Thresholds updated (memory only — DB error)",
      threshold: { ..._memThresholds, _source: "memory" },
    });
  }
};

/** Export in-memory thresholds so metricController can access them without DB */
export const getMemThresholds = () => _memThresholds;

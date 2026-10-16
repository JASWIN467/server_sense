import Alert from "../Model/alertModel.js";
import { isDbConnected } from "../DB/db.js";

// In-memory alert store for when DB is not available
let _memAlerts = [];
let _memAlertId = 1;

/** Called by metricController to store alerts even without DB */
export const addMemAlert = (alertData) => {
  // For in-memory: simple upsert by (metric, alertType)
  const existingIdx = _memAlerts.findIndex(
    (a) => a.metric === alertData.metric && a.alertType === alertData.alertType && a.status === "active"
  );
  if (existingIdx !== -1) {
    // Update in place
    _memAlerts[existingIdx] = { ..._memAlerts[existingIdx], ...alertData };
    return _memAlerts[existingIdx];
  }
  const alert = {
    _id: String(_memAlertId++),
    ...alertData,
    status: "active",
    resolved: false,
    createdAt: new Date(),
  };
  _memAlerts.unshift(alert);
  // Keep last 200 alerts in memory
  if (_memAlerts.length > 200) _memAlerts.pop();
  return alert;
};

/** Resolve an in-memory alert by metric and alertType (used by metricController auto-resolution) */
export const resolveMemAlert = (metric, alertType = "threshold") => {
  const alert = _memAlerts.find((a) => a.metric === metric && a.alertType === alertType && a.status === "active");
  if (alert) {
    alert.status = "resolved";
    alert.resolved = true;
    alert.resolvedAt = new Date();
  }
};

// ====================== GET ALERTS ======================
export const getAlerts = async (req, res) => {
  const { all, status, severity, limit = 100 } = req.query;

  if (!isDbConnected()) {
    let filtered = [..._memAlerts];
    if (all !== "true" && !status) filtered = filtered.filter((a) => a.status === "active");
    if (status) filtered = filtered.filter((a) => a.status === status);
    if (severity) filtered = filtered.filter((a) => a.severity === severity);
    return res.json(filtered.slice(0, parseInt(limit)));
  }

  try {
    const filter = {};
    // If 'all=true', no status filter; otherwise filter by status param or default to active
    if (all !== "true") {
      filter.status = status || "active";
    } else if (status) {
      filter.status = status;
    }
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(alerts);
  } catch (err) {
    // Fallback to memory
    let filtered = [..._memAlerts];
    if (all !== "true") filtered = filtered.filter((a) => a.status === "active");
    res.json(filtered.slice(0, parseInt(limit)));
  }
};

// ====================== RESOLVE SINGLE ALERT ======================
export const resolveAlert = async (req, res) => {
  const { id } = req.params;
  const { resolutionNote } = req.body || {};

  if (!isDbConnected()) {
    const alert = _memAlerts.find((a) => a._id === id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    alert.status = "resolved";
    alert.resolved = true;
    alert.resolvedAt = new Date();
    if (resolutionNote) alert.resolutionNote = resolutionNote;
    return res.json({ message: "Alert resolved (memory)", alert });
  }

  try {
    const updateData = { status: "resolved", resolved: true, resolvedAt: new Date() };
    if (resolutionNote) updateData.resolutionNote = resolutionNote;
    
    const alert = await Alert.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Alert resolved successfully", alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== RESOLVE ALL ALERTS ======================
export const resolveAllAlerts = async (req, res) => {
  const { resolutionNote } = req.body || {};
  
  if (!isDbConnected()) {
    const now = new Date();
    let count = 0;
    _memAlerts.forEach((a) => {
      if (a.status === "active") {
        a.status = "resolved";
        a.resolved = true;
        a.resolvedAt = now;
        if (resolutionNote) a.resolutionNote = resolutionNote;
        count++;
      }
    });
    return res.json({ message: "All alerts resolved (memory)", count });
  }

  try {
    const updateData = { status: "resolved", resolved: true, resolvedAt: new Date() };
    if (resolutionNote) updateData.resolutionNote = resolutionNote;
    
    const result = await Alert.updateMany(
      { status: "active" },
      updateData
    );
    res.json({ message: "All alerts marked as resolved", count: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const acknowledgeAlert = async (req, res) => {
  const { id } = req.params;
  const username = req.user?.username;

  if (!isDbConnected()) {
    const alert = _memAlerts.find((a) => a._id === id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    if (alert.status !== 'active') return res.status(400).json({ message: 'Alert is already resolved' });
    if (alert.acknowledgedBy) return res.status(400).json({ message: 'Alert is already acknowledged' });
    
    alert.acknowledgedBy = username;
    alert.acknowledgedAt = new Date();
    return res.json({ message: 'Alert acknowledged (memory)', alert });
  }

  try {
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    if (alert.status !== 'active') return res.status(400).json({ message: 'Alert is already resolved' });
    if (alert.acknowledgedBy) return res.status(400).json({ message: 'Alert is already acknowledged' });

    alert.acknowledgedBy = username;
    alert.acknowledgedAt = new Date();
    await alert.save();
    
    res.json({ message: 'Alert acknowledged successfully', alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const unacknowledgeAlert = async (req, res) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    const alert = _memAlerts.find((a) => a._id === id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    if (alert.status !== 'active') return res.status(400).json({ message: 'Alert is already resolved' });
    
    alert.acknowledgedBy = null;
    alert.acknowledgedAt = null;
    return res.json({ message: 'Alert unacknowledged (memory)', alert });
  }

  try {
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    if (alert.status !== 'active') return res.status(400).json({ message: 'Alert is already resolved' });

    alert.acknowledgedBy = null;
    alert.acknowledgedAt = null;
    await alert.save();
    
    res.json({ message: 'Alert unacknowledged successfully', alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

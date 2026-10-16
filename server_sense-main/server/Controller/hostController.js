import si from 'systeminformation';
import MetricCollection from '../Model/metricModel.js';
import { isDbConnected } from '../DB/db.js';

// ====================== GET HOST METADATA ======================
// Returns: osInfo, networkInterfaces, system hardware info
// Called on page load / Refresh Node — NOT on every 30s snapshot.
export const getHostInfo = async (req, res) => {
  try {
    const [osData, netData, sysData] = await Promise.all([
      si.osInfo(),
      si.networkInterfaces(),
      si.system(),
    ]);

    // --- OS / Host Details ---
    const hostDetails = {
      hostname:     osData.hostname     || null,
      platform:     osData.platform     || null,
      distro:       osData.distro       || null,
      release:      osData.release      || null,
      kernel:       osData.kernel       || null,
      arch:         osData.arch         || null,
      codename:     osData.codename     || null,
      logofile:     undefined, // not needed
    };

    // --- Network Interfaces ---
    // systeminformation returns an array or a single object depending on version.
    const rawNets = Array.isArray(netData) ? netData : [netData];
    const networks = rawNets.map((iface) => ({
      iface:      iface.iface      || null,
      ip4:        iface.ip4        || null,
      ip6:        iface.ip6        || null,
      mac:        iface.mac        || null,
      speed:      iface.speed      != null ? iface.speed : null,  // Mbps, can be 0
      operstate:  iface.operstate  || null,
      type:       iface.type       || null,
      internal:   typeof iface.internal === 'boolean' ? iface.internal : null,
    }));

    // --- System Hardware ---
    const system = {
      manufacturer: sysData.manufacturer || null,
      model:        sysData.model        || null,
      version:      sysData.version      || null,
      virtual:      typeof sysData.virtual === 'boolean' ? sysData.virtual : null,
      // Deliberately NOT returning serial/uuid for security.
    };

    res.json({ hostDetails, networks, system });
  } catch (err) {
    console.error('[HostInfo] Error:', err.message);
    res.status(500).json({ message: 'Failed to retrieve host information', error: err.message });
  }
};

// ====================== GET TELEMETRY STATUS ======================
// Returns real telemetry status derived from the existing snapshot system.
export const getTelemetryStatus = async (req, res) => {
  try {
    let snapshotCount    = null;
    let latestSnapshot   = null;
    let oldestSnapshot   = null;
    let dbConnected      = isDbConnected();

    if (dbConnected) {
      try {
        snapshotCount  = await MetricCollection.countDocuments();
        latestSnapshot = await MetricCollection.findOne().sort({ timestamp: -1 }).select('timestamp cpuLoad memUsedPercent diskUsedPercent').lean();
        oldestSnapshot = await MetricCollection.findOne().sort({ timestamp: 1  }).select('timestamp').lean();
      } catch (dbErr) {
        console.warn('[TelemetryStatus] DB query failed:', dbErr.message);
        dbConnected = false;
      }
    }

    res.json({
      collectionIntervalSeconds: 30,
      pollingIntervalSeconds:     4,
      dbConnected,
      snapshotCount:   snapshotCount,
      latestSnapshot:  latestSnapshot  ? {
        timestamp:      latestSnapshot.timestamp,
        cpuLoad:        latestSnapshot.cpuLoad,
        memUsedPercent: latestSnapshot.memUsedPercent,
        diskUsedPercent:latestSnapshot.diskUsedPercent,
      } : null,
      oldestSnapshot:  oldestSnapshot  ? { timestamp: oldestSnapshot.timestamp } : null,
    });
  } catch (err) {
    console.error('[TelemetryStatus] Error:', err.message);
    res.status(500).json({ message: 'Failed to retrieve telemetry status', error: err.message });
  }
};

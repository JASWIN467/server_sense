import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Spin, Alert, Badge } from 'antd';
import {
    ThunderboltOutlined,
    DatabaseOutlined,
    HddOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { API_ENDPOINTS } from '../../config/constants';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const getStatusColor = (value, warn = 70, crit = 90) => {
    if (value >= crit) return '#ef4444';
    if (value >= warn) return '#f59e0b';
    return '#10b981';
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const GlassPanel = ({ children, className = '' }) => (
    <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl ${className}`}
    >
        {children}
    </div>
);

const MetricStatCard = ({ title, value, suffix, icon, color, subValue }) => {
    const numVal = typeof value === 'number' ? value : 0;
    return (
        <GlassPanel className="p-6 flex flex-col gap-3 hover:border-white/20 transition-all duration-300 group">
            {/* Top accent bar */}
            <div
                className="absolute top-0 left-0 w-full h-0.5 transition-opacity duration-300 opacity-60 group-hover:opacity-100"
                style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
            />
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</span>
                <div
                    className="rounded-xl p-2.5 transition-colors duration-300"
                    style={{ backgroundColor: `${color}18`, color }}
                >
                    {icon}
                </div>
            </div>
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white tracking-tight font-mono">
                        {value !== null && value !== undefined ? (typeof value === 'number' ? value.toFixed(1) : value) : '—'}
                    </span>
                    {suffix && <span className="text-lg font-medium text-gray-500">{suffix}</span>}
                </div>
                {subValue && <p className="text-xs text-gray-600 mt-1">{subValue}</p>}
            </div>
            {/* Bottom usage bar (only for percentage values) */}
            {suffix === '%' && (
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(numVal, 100)}%`, backgroundColor: getStatusColor(numVal) }}
                    />
                </div>
            )}
        </GlassPanel>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-xl border border-white/10 bg-[#050505]/95 backdrop-blur-xl px-4 py-3 shadow-2xl text-xs">
            <p className="text-gray-400 mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-300 capitalize">{entry.name}:</span>
                    <span className="text-white font-bold font-mono">{Number(entry.value).toFixed(1)}%</span>
                </div>
            ))}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MetricsDashboard = () => {
    const [liveMetrics, setLiveMetrics] = useState(null);
    const [history, setHistory] = useState([]);
    const [liveError, setLiveError] = useState(null);
    const [historyError, setHistoryError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [pollingActive, setPollingActive] = useState(true);

    // ── Fetch history (once on mount) ────────────────────────────────────────
    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(`${API_ENDPOINTS.METRICS.HISTORY}?limit=50`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setHistory(
                data.map((d) => ({
                    time: formatTime(d.timestamp),
                    cpu: parseFloat(d.cpuLoad?.toFixed(1) ?? 0),
                    memory: parseFloat(d.memUsedPercent?.toFixed(1) ?? 0),
                    disk: parseFloat(d.diskUsedPercent?.toFixed(1) ?? 0),
                }))
            );
            setHistoryError(null);
        } catch (err) {
            setHistoryError(`History unavailable: ${err.message}`);
        }
    }, []);

    // ── Poll current metrics ─────────────────────────────────────────────────
    const fetchCurrent = useCallback(async () => {
        try {
            const res = await fetch(API_ENDPOINTS.METRICS.CURRENT);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setLiveMetrics(data);
            setLiveError(null);
            setLastUpdated(new Date());

            // Append to chart history as live data comes in
            setHistory((prev) => {
                const newPoint = {
                    time: formatTime(data.timestamp),
                    cpu: parseFloat(data.cpuLoad?.toFixed(1) ?? 0),
                    memory: parseFloat(data.memUsedPercent?.toFixed(1) ?? 0),
                    disk: parseFloat(data.diskUsedPercent?.toFixed(1) ?? 0),
                };
                // Keep max 60 data points
                const updated = [...prev, newPoint];
                return updated.length > 60 ? updated.slice(-60) : updated;
            });
        } catch (err) {
            setLiveError(`Live feed error: ${err.message}. Retrying...`);
            // Don't crash the polling loop — just log and continue
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchHistory();
        fetchCurrent(); // immediate first load
    }, [fetchHistory, fetchCurrent]);

    useEffect(() => {
        if (!pollingActive) return;
        const interval = setInterval(fetchCurrent, 4000); // poll every 4s
        return () => clearInterval(interval); // cleanup on unmount
    }, [fetchCurrent, pollingActive]);

    const cpu = liveMetrics?.cpuLoad ?? null;
    const mem = liveMetrics?.memUsedPercent ?? null;
    const disk = liveMetrics?.diskUsedPercent ?? null;
    const uptime = liveMetrics?.uptimeSeconds ?? null;
    const memUsedMB = liveMetrics?.memUsedMB;
    const memTotalMB = liveMetrics?.memTotalMB;

    return (
        <div className="min-h-screen space-y-6 text-gray-200">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-1 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Metrics Dashboard
                        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-normal">
                            LIVE
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time server health — polled every 4s via systeminformation</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {pollingActive ? (
                        <Badge status="processing" text={<span className="text-emerald-400">Live</span>} />
                    ) : (
                        <Badge status="error" text={<span className="text-red-400">Paused</span>} />
                    )}
                    {lastUpdated && (
                        <span className="font-mono text-gray-600">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={() => setPollingActive((p) => !p)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    >
                        <ReloadOutlined className={pollingActive ? 'animate-spin' : ''} />
                        {pollingActive ? 'Pause' : 'Resume'}
                    </button>
                </div>
            </div>

            {/* ── Error banners ── */}
            {liveError && (
                <Alert
                    message={liveError}
                    type="warning"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    className="rounded-xl border-yellow-500/20 bg-yellow-500/5"
                    closable
                />
            )}
            {historyError && (
                <Alert
                    message={historyError}
                    type="info"
                    showIcon
                    closable
                    className="rounded-xl border-blue-500/20 bg-blue-500/5"
                />
            )}

            {/* ── Loading state ── */}
            {loading && (
                <GlassPanel className="p-12 flex flex-col items-center justify-center gap-4">
                    <Spin size="large" />
                    <p className="text-gray-500 text-sm">Connecting to server metrics…</p>
                </GlassPanel>
            )}

            {/* ── Stat Cards ── */}
            {!loading && (
                <Row gutter={[20, 20]}>
                    <Col xs={24} sm={12} xl={6}>
                        <MetricStatCard
                            title="CPU Load"
                            value={cpu}
                            suffix="%"
                            icon={<ThunderboltOutlined />}
                            color="#d946ef"
                        />
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        <MetricStatCard
                            title="Memory Used"
                            value={mem}
                            suffix="%"
                            icon={<DatabaseOutlined />}
                            color="#0ea5e9"
                            subValue={memUsedMB && memTotalMB ? `${memUsedMB.toFixed(0)} MB / ${memTotalMB.toFixed(0)} MB` : null}
                        />
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        <MetricStatCard
                            title="Disk Used"
                            value={disk}
                            suffix="%"
                            icon={<HddOutlined />}
                            color="#f59e0b"
                        />
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        <MetricStatCard
                            title="System Uptime"
                            value={formatUptime(uptime)}
                            suffix=""
                            icon={<ClockCircleOutlined />}
                            color="#10b981"
                            subValue={uptime ? `${uptime.toLocaleString()}s total` : null}
                        />
                    </Col>
                </Row>
            )}

            {/* ── Line Chart: CPU + Memory History ── */}
            {!loading && (
                <GlassPanel className="p-6 h-[400px] flex flex-col">
                    <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Performance History</h3>
                            <p className="text-xs text-gray-600 mt-0.5">CPU & memory % over time</p>
                        </div>
                        <div className="flex items-center gap-5 text-xs">
                            <span className="flex items-center gap-2 text-gray-400">
                                <span className="w-3 h-0.5 bg-[#d946ef] rounded-full" />CPU %
                            </span>
                            <span className="flex items-center gap-2 text-gray-400">
                                <span className="w-3 h-0.5 bg-[#0ea5e9] rounded-full" />Memory %
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        {history.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-600">
                                <p className="text-sm">No history data yet — snapshots are saved every 30s.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#ffffff08" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="cpu"
                                        name="CPU"
                                        stroke="#d946ef"
                                        strokeWidth={2}
                                        fill="url(#gradCpu)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: '#d946ef' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="memory"
                                        name="Memory"
                                        stroke="#0ea5e9"
                                        strokeWidth={2}
                                        fill="url(#gradMem)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: '#0ea5e9' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </GlassPanel>
            )}

            {/* ── Health status footer ── */}
            {!loading && liveMetrics && (
                <GlassPanel className="px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-emerald-400" />
                            <span>
                                Server metrics API connected — snapshots persist to MongoDB every 30s
                            </span>
                        </div>
                        <div className="flex items-center gap-4 font-mono">
                            <span>CPU: <span className="text-white">{cpu?.toFixed(1)}%</span></span>
                            <span>Mem: <span className="text-white">{mem?.toFixed(1)}%</span></span>
                            <span>Disk: <span className="text-white">{disk?.toFixed(1)}%</span></span>
                        </div>
                    </div>
                </GlassPanel>
            )}
        </div>
    );
};

export default MetricsDashboard;

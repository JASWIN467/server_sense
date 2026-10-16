import React, { useState, useEffect, useCallback } from 'react';
import { Button, Tag, Tabs, Spin, Alert, Table, Descriptions, Badge } from 'antd';
import {
    DesktopOutlined,
    ReloadOutlined,
    AreaChartOutlined,
    InfoCircleOutlined,
    WifiOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GlassPanel = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-xl ${className}`}>
        {children}
    </div>
);

const val = (v) => (v !== null && v !== undefined && v !== '') ? v : <span className="text-gray-600 italic">Unavailable</span>;

const TabLoader = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
        <Spin size="large" />
        <p className="text-gray-500 text-sm">{text}</p>
    </div>
);

const TabError = ({ message, onRetry }) => (
    <div className="py-8 px-4">
        <Alert
            type="error"
            message="Unable to load information"
            description={message}
            showIcon
            className="rounded-xl border-red-500/20 bg-red-500/5 mb-4"
            action={
                onRetry && (
                    <Button size="small" onClick={onRetry} className="mt-2">
                        Retry
                    </Button>
                )
            }
        />
    </div>
);

// ─── Tab 1: Host Details ───────────────────────────────────────────────────────

const HostDetailsTab = ({ hostDetails, loading, error, onRetry }) => {
    if (loading) return <TabLoader text="Loading host information…" />;
    if (error)   return <TabError message={error} onRetry={onRetry} />;
    if (!hostDetails) return null;

    const rows = [
        { label: 'Hostname',          value: hostDetails.hostname  },
        { label: 'Operating System',  value: hostDetails.distro ? `${hostDetails.distro} ${hostDetails.release || ''}`.trim() : hostDetails.platform },
        { label: 'Platform',          value: hostDetails.platform  },
        { label: 'OS Release',        value: hostDetails.release   },
        { label: 'Kernel Version',    value: hostDetails.kernel    },
        { label: 'Architecture',      value: hostDetails.arch      },
        { label: 'Code Name',         value: hostDetails.codename  },
    ];

    return (
        <div className="p-4 space-y-2">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">
                Real host identity from <code className="text-sky-400">si.osInfo()</code>
            </p>
            <div className="rounded-xl overflow-hidden border border-white/5">
                {rows.map(({ label, value }) => (
                    <div key={label} className="flex border-b border-white/5 last:border-b-0">
                        <div className="w-44 flex-shrink-0 bg-[#111] px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center">
                            {label}
                        </div>
                        <div className="flex-1 bg-[#050505] px-4 py-3 text-white text-sm font-mono">
                            {val(value)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Tab 2: Network ────────────────────────────────────────────────────────────

const NetworkTab = ({ networks, loading, error, onRetry }) => {
    if (loading) return <TabLoader text="Loading network interfaces…" />;
    if (error)   return <TabError message={error} onRetry={onRetry} />;
    if (!networks) return null;

    const columns = [
        {
            title: 'Interface',
            dataIndex: 'iface',
            key: 'iface',
            render: (v) => <span className="font-mono font-semibold text-sky-400">{val(v)}</span>,
        },
        {
            title: 'IPv4',
            dataIndex: 'ip4',
            key: 'ip4',
            render: (v) => <span className="font-mono text-white">{val(v)}</span>,
        },
        {
            title: 'IPv6',
            dataIndex: 'ip6',
            key: 'ip6',
            render: (v) => v ? <span className="font-mono text-white text-xs">{v}</span> : <span className="text-gray-600 italic text-xs">Unavailable</span>,
        },
        {
            title: 'MAC',
            dataIndex: 'mac',
            key: 'mac',
            render: (v) => <span className="font-mono text-gray-300 text-xs">{val(v)}</span>,
        },
        {
            title: 'Speed',
            dataIndex: 'speed',
            key: 'speed',
            render: (v) => v != null ? <span className="text-gray-300">{v} Mbps</span> : <span className="text-gray-600 italic">Unavailable</span>,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (v) => val(v),
        },
        {
            title: 'Status',
            dataIndex: 'operstate',
            key: 'operstate',
            render: (v, record) => {
                if (!v) return <span className="text-gray-600 italic">Unavailable</span>;
                const up = v.toLowerCase() === 'up';
                if (up) return <Tag color="green" icon={<CheckCircleOutlined />}>Up</Tag>;
                // If no IP, it's physically disconnected — more user-friendly label
                const hasIp = record.ip4 && record.ip4.trim() !== '';
                return hasIp
                    ? <Tag color="orange" icon={<CloseCircleOutlined />}>Down</Tag>
                    : <Tag color="default" icon={<CloseCircleOutlined />} className="text-gray-400">Not Connected</Tag>;
            },
        },
        {
            title: 'Internal',
            dataIndex: 'internal',
            key: 'internal',
            render: (v) => v === null ? <span className="text-gray-600 italic">Unavailable</span>
                         : v ? <Tag>Internal</Tag> : <Tag color="blue">External</Tag>,
        },
    ];

    // Filter out loopback (127.x.x.x) — it's a virtual software interface, not a real NIC
    const displayNetworks = networks.filter(
        (n) => !(n.ip4 && n.ip4.startsWith('127.')) && !(n.iface && n.iface.toLowerCase().includes('loopback'))
    );

    return (
        <div className="p-4 space-y-3">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">
                Real network interfaces from <code className="text-sky-400">si.networkInterfaces()</code>
            </p>
            {displayNetworks.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No network interfaces detected.</div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-white/5">
                        <Table
                            dataSource={displayNetworks.map((n, i) => ({ ...n, key: i }))}
                            columns={columns}
                            pagination={false}
                            size="small"
                            className="custom-dark-table"
                            style={{ background: 'transparent' }}
                        />
                    </div>
                    <div className="flex items-center gap-6 pt-2 text-xs text-gray-600">
                        <span><Tag color="green" className="mr-1">Up</Tag> Active connection with assigned IP</span>
                        <span><Tag color="default" className="mr-1">Not Connected</Tag> Adapter present but no cable / session active</span>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Tab 3: System ─────────────────────────────────────────────────────────────

const SystemTab = ({ system, loading, error, onRetry }) => {
    if (loading) return <TabLoader text="Loading system information…" />;
    if (error)   return <TabError message={error} onRetry={onRetry} />;
    if (!system) return null;

    const rows = [
        { label: 'Manufacturer',  value: system.manufacturer },
        { label: 'Model',         value: system.model        },
        { label: 'Version',       value: system.version      },
        { label: 'Virtual Machine', value: system.virtual !== null ? (system.virtual ? 'Yes' : 'No') : null },
    ];

    return (
        <div className="p-4 space-y-2">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">
                Real system hardware from <code className="text-sky-400">si.system()</code>
            </p>
            <div className="rounded-xl overflow-hidden border border-white/5">
                {rows.map(({ label, value }) => (
                    <div key={label} className="flex border-b border-white/5 last:border-b-0">
                        <div className="w-44 flex-shrink-0 bg-[#111] px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center">
                            {label}
                        </div>
                        <div className="flex-1 bg-[#050505] px-4 py-3 text-white text-sm font-mono">
                            {val(value)}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-gray-600 text-xs pt-1">
                Note: Serial number and UUID are intentionally not exposed.
            </p>
        </div>
    );
};

// ─── Tab 4: Telemetry ──────────────────────────────────────────────────────────

const TelemetryTab = ({ telemetry, loading, error, onRetry }) => {
    if (loading) return <TabLoader text="Loading telemetry information…" />;
    if (error)   return <TabError message={error} onRetry={onRetry} />;
    if (!telemetry) return null;

    const fmt = (iso) => iso ? new Date(iso).toLocaleString() : null;
    const fmtDuration = (a, b) => {
        if (!a || !b) return null;
        const diffMs = new Date(b) - new Date(a);
        const diffH  = Math.floor(diffMs / 3600000);
        const diffM  = Math.floor((diffMs % 3600000) / 60000);
        return `${diffH}h ${diffM}m`;
    };

    const latest = telemetry.latestSnapshot;
    const oldest = telemetry.oldestSnapshot;

    const rows = [
        { label: 'Telemetry Status',           value: latest ? 'Active' : 'No snapshots yet' },
        { label: 'DB Connected',               value: telemetry.dbConnected ? 'Yes' : 'No' },
        { label: 'Snapshot Interval',          value: `${telemetry.collectionIntervalSeconds}s (backend daemon)` },
        { label: 'Live Polling Interval',      value: `${telemetry.pollingIntervalSeconds}s (frontend)` },
        { label: 'Total Snapshots in DB',      value: telemetry.snapshotCount != null ? telemetry.snapshotCount.toLocaleString() : null },
        { label: 'Latest Snapshot Time',       value: fmt(latest?.timestamp) },
        { label: 'Latest CPU Load',            value: latest?.cpuLoad       != null ? `${latest.cpuLoad.toFixed(1)}%`       : null },
        { label: 'Latest Memory Used',         value: latest?.memUsedPercent != null ? `${latest.memUsedPercent.toFixed(1)}%` : null },
        { label: 'Latest Disk Used',           value: latest?.diskUsedPercent != null ? `${latest.diskUsedPercent.toFixed(1)}%` : null },
        { label: 'Oldest Snapshot Time',       value: fmt(oldest?.timestamp) },
        { label: 'History Span',               value: fmtDuration(oldest?.timestamp, latest?.timestamp) },
    ];

    return (
        <div className="p-4 space-y-2">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">
                Real telemetry state from MongoDB snapshot collection
            </p>
            <div className="rounded-xl overflow-hidden border border-white/5">
                {rows.map(({ label, value }) => (
                    <div key={label} className="flex border-b border-white/5 last:border-b-0">
                        <div className="w-52 flex-shrink-0 bg-[#111] px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center">
                            {label}
                        </div>
                        <div className="flex-1 bg-[#050505] px-4 py-3 text-sm font-mono">
                            {label === 'Telemetry Status' ? (
                                value === 'Active'
                                    ? <Badge status="processing" text={<span className="text-emerald-400">{value}</span>} />
                                    : <span className="text-yellow-500">{value}</span>
                            ) : label === 'DB Connected' ? (
                                telemetry.dbConnected
                                    ? <Tag color="green">Connected</Tag>
                                    : <Tag color="orange">Offline (memory fallback)</Tag>
                            ) : (
                                <span className="text-white">{val(value)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ServerList = () => {
    const navigate = useNavigate();

    // Live connection check (used for ONLINE badge)
    const [liveMetrics,    setLiveMetrics]    = useState(null);
    const [liveLoading,    setLiveLoading]    = useState(true);

    // Host info (shared by Tab 1, 2, 3)
    const [hostInfo,       setHostInfo]       = useState(null);
    const [hostLoading,    setHostLoading]    = useState(true);
    const [hostError,      setHostError]      = useState(null);

    // Telemetry (Tab 4)
    const [telemetry,      setTelemetry]      = useState(null);
    const [telemetryLoading, setTelemetryLoading] = useState(true);
    const [telemetryError,   setTelemetryError]   = useState(null);

    const fetchLive = useCallback(async () => {
        try {
            setLiveLoading(true);
            const res = await fetch(API_ENDPOINTS.METRICS.CURRENT);
            if (res.ok) setLiveMetrics(await res.json());
        } catch (_) { /* silent */ }
        finally { setLiveLoading(false); }
    }, []);

    const fetchHostInfo = useCallback(async () => {
        setHostLoading(true);
        setHostError(null);
        try {
            const res = await fetch(API_ENDPOINTS.HOST.INFO);
            if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
            setHostInfo(await res.json());
        } catch (err) {
            setHostError(err.message);
        } finally {
            setHostLoading(false);
        }
    }, []);

    const fetchTelemetry = useCallback(async () => {
        setTelemetryLoading(true);
        setTelemetryError(null);
        try {
            const res = await fetch(API_ENDPOINTS.HOST.TELEMETRY);
            if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
            setTelemetry(await res.json());
        } catch (err) {
            setTelemetryError(err.message);
        } finally {
            setTelemetryLoading(false);
        }
    }, []);

    // On mount: load everything
    useEffect(() => {
        fetchLive();
        fetchHostInfo();
        fetchTelemetry();

        // Keep live status pinging for ONLINE badge only
        const liveInterval = setInterval(fetchLive, 5000);
        return () => clearInterval(liveInterval);
    }, [fetchLive, fetchHostInfo, fetchTelemetry]);

    const handleRefresh = () => {
        fetchLive();
        fetchHostInfo();
        fetchTelemetry();
    };

    const isOnline = liveMetrics !== null;

    const tabItems = [
        {
            key: '1',
            label: 'Host Details',
            children: (
                <HostDetailsTab
                    hostDetails={hostInfo?.hostDetails}
                    loading={hostLoading}
                    error={hostError}
                    onRetry={fetchHostInfo}
                />
            ),
        },
        {
            key: '2',
            label: 'Network',
            children: (
                <NetworkTab
                    networks={hostInfo?.networks}
                    loading={hostLoading}
                    error={hostError}
                    onRetry={fetchHostInfo}
                />
            ),
        },
        {
            key: '3',
            label: 'System',
            children: (
                <SystemTab
                    system={hostInfo?.system}
                    loading={hostLoading}
                    error={hostError}
                    onRetry={fetchHostInfo}
                />
            ),
        },
        {
            key: '4',
            label: 'Telemetry',
            children: (
                <TelemetryTab
                    telemetry={telemetry}
                    loading={telemetryLoading}
                    error={telemetryError}
                    onRetry={fetchTelemetry}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DesktopOutlined className="text-sky-500" />
                        Host Server Node Inspection
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Detailed inspection and metadata of the monitored host.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        icon={<ReloadOutlined spin={hostLoading || telemetryLoading} />}
                        onClick={handleRefresh}
                        className="bg-[#111] border-white/10 text-gray-300 hover:text-white"
                    >
                        Refresh Node
                    </Button>
                    <Button
                        type="primary"
                        icon={<AreaChartOutlined />}
                        onClick={() => navigate('/admin')}
                        className="bg-sky-600 border-none shadow-lg shadow-sky-900/20"
                    >
                        Live Stream View
                    </Button>
                </div>
            </div>

            {/* Host Identity */}
            <div className="flex items-center gap-4 py-1">
                <h3 className="text-xl font-bold text-white font-mono">Primary Host Node (Local)</h3>
                {liveLoading
                    ? <Tag className="border-none">Connecting…</Tag>
                    : isOnline
                        ? <Tag color="green" className="border-none font-semibold px-2 py-0.5">ONLINE</Tag>
                        : <Tag color="red"   className="border-none font-semibold px-2 py-0.5">OFFLINE</Tag>
                }
            </div>

            {/* Honest Architecture Note */}
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex items-start gap-3 text-xs text-sky-300">
                <InfoCircleOutlined className="text-base text-sky-400 mt-0.5" />
                <div className="leading-relaxed">
                    <span className="font-semibold text-white">Single-Host Telemetry Model: </span>
                    ServerSense is currently scoped to the active host server instance. All values below are retrieved in real-time from the host kernel via <code className="text-sky-400">systeminformation</code>.
                </div>
            </div>

            {/* Tabbed Interface */}
            <GlassPanel className="border-t-2 border-t-sky-500">
                <Tabs
                    defaultActiveKey="1"
                    items={tabItems}
                    className="custom-tabs px-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-tab]:text-gray-400 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-sky-400 [&_.ant-tabs-ink-bar]:bg-sky-500 [&_.ant-tabs-nav]:pt-2"
                />
            </GlassPanel>
        </div>
    );
};

export default ServerList;

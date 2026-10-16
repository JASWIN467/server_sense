import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Input, Select, Button, Tag, Space, message as antMessage, Spin, Badge, Modal } from 'antd';
import {
    BellOutlined,
    SearchOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    CloseCircleOutlined,
    MedicineBoxOutlined,
    ReloadOutlined,
    EyeOutlined,
    RobotOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/constants';

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('unresolved'); // 'unresolved' | 'all'
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [resolveModalVisible, setResolveModalVisible] = useState(false);
    const [messageApi, contextHolder] = antMessage.useMessage();
    const [diagnosingId, setDiagnosingId] = useState(null);
    const [resolvingId, setResolvingId] = useState(null);
    const [resolutionNote, setResolutionNote] = useState('');
    const navigate = useNavigate();

    const handleGenerateDiagnosis = async (alertId) => {
        setDiagnosingId(alertId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.DIAGNOSES.GENERATE(alertId), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                messageApi.success('AI Diagnosis generated! Redirecting to AI Diagnostics...');
                setTimeout(() => navigate('/admin/ai-diagnostics'), 1000);
            } else {
                messageApi.error(data.message || 'Failed to generate AI diagnosis');
            }
        } catch (err) {
            messageApi.error('Error connecting to AI diagnosis service');
        } finally {
            setDiagnosingId(null);
        }
    };

    // Fetch alerts from backend
    const fetchAlerts = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const url = viewMode === 'all' 
                ? `${API_ENDPOINTS.ALERTS.LIST}?all=true` 
                : API_ENDPOINTS.ALERTS.LIST;
            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAlerts(data);
            if (isManual) {
                messageApi.success('Alerts updated from server');
            }
        } catch (err) {
            console.error('Error fetching alerts:', err);
            messageApi.error(`Failed to load alerts: ${err.message}`);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    }, [viewMode, messageApi]);

    // Initial load and polling every 30 seconds
    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(() => {
            fetchAlerts();
        }, 30000); // matches 30s snapshot interval
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'critical': return <CloseCircleOutlined className="text-red-500" />;
            case 'error': return <CloseCircleOutlined className="text-red-500" />;
            case 'warning': return <WarningOutlined className="text-amber-500" />;
            case 'info': return <InfoCircleOutlined className="text-sky-500" />;
            case 'success': return <CheckCircleOutlined className="text-emerald-500" />;
            default: return <InfoCircleOutlined className="text-gray-500" />;
        }
    };

    const getColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'critical': return 'red';
            case 'error': return 'red';
            case 'warning': return 'gold';
            case 'info': return 'blue';
            case 'success': return 'green';
            default: return 'default';
        }
    };

    const getSuggestedAction = (metric, severity) => {
        if (metric === 'cpu') {
            return severity === 'critical' 
                ? 'Inspect high-CPU processes & scale compute'
                : 'Monitor CPU usage trend & throttle spikes';
        }
        if (metric === 'memory') {
            return severity === 'critical'
                ? 'Investigate memory leak & increase instance RAM'
                : 'Purge transient caches or optimize buffer allocation';
        }
        if (metric === 'disk') {
            return severity === 'critical'
                ? 'Immediately expand root partition volume & delete old logs'
                : 'Clean temporary files and rotate storage logs';
        }
        return 'Check system logs for root cause';
    };

    // Open resolve modal
    const handleResolve = (id) => {
        setResolvingId(id);
        setResolutionNote('');
        setResolveModalVisible(true);
    };

    const handleMarkAllRead = () => {
        setResolvingId('all');
        setResolutionNote('');
        setResolveModalVisible(true);
    };

    const confirmResolve = async () => {
        try {
            const token = localStorage.getItem('token');
            const isAll = resolvingId === 'all';
            const url = isAll ? API_ENDPOINTS.ALERTS.RESOLVE_ALL : API_ENDPOINTS.ALERTS.RESOLVE(resolvingId);
            
            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ resolutionNote: resolutionNote.trim() || null })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            messageApi.success(isAll ? 'All active alerts marked as resolved' : 'Alert marked as resolved');
            setResolveModalVisible(false);
            fetchAlerts();
        } catch (err) {
            console.error('Error resolving alert(s):', err);
            messageApi.error(`Failed to resolve: ${err.message}`);
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id), {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            messageApi.success('Alert acknowledged');
            fetchAlerts();
        } catch (err) {
            console.error('Error acknowledging alert:', err);
            messageApi.error(`Failed to acknowledge: ${err.message}`);
        }
    };

    const handleUnacknowledge = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.ALERTS.UNACKNOWLEDGE(id), {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            messageApi.success('Alert unacknowledged');
            fetchAlerts();
        } catch (err) {
            console.error('Error unacknowledging alert:', err);
            messageApi.error(`Failed to unacknowledge: ${err.message}`);
        }
    };

    // Filter alerts by severity and search term
    const filteredAlerts = alerts.filter(a => {
        const matchesSeverity = filter === 'all' || a.severity?.toLowerCase() === filter.toLowerCase();
        const matchesSearch = !searchText || 
            a.message?.toLowerCase().includes(searchText.toLowerCase()) ||
            a.metric?.toLowerCase().includes(searchText.toLowerCase());
        return matchesSeverity && matchesSearch;
    });

    const activeCount = alerts.filter(a => a.status === 'active' || (a.status === undefined && !a.resolved)).length;

    return (
        <div className="space-y-6 text-gray-200">
            {contextHolder}
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                        System Alerts
                        {activeCount > 0 ? (
                            <div className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                            </div>
                        ) : (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">
                                All Clean
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Real-time alerts triggered by threshold breaches — synchronized with 30s telemetry snapshots.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        icon={<ReloadOutlined spin={refreshing} />}
                        onClick={() => fetchAlerts(true)}
                        className="bg-white/5 border-white/10 text-gray-300 hover:text-white"
                    >
                        Refresh
                    </Button>
                    {activeCount > 0 && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            className="bg-emerald-600 hover:bg-emerald-500 border-none shadow-lg shadow-emerald-900/20"
                            onClick={handleMarkAllRead}
                        >
                            Resolve All ({activeCount})
                        </Button>
                    )}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-4 shadow-lg">
                <div className="w-full md:w-auto flex flex-wrap gap-3 items-center">
                    <Input
                        placeholder="Search alerts by metric or text..."
                        prefix={<SearchOutlined className="text-gray-500" />}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:bg-white/10 focus:bg-white/10 w-full sm:w-64"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select
                        value={filter}
                        className="w-36"
                        onChange={setFilter}
                        options={[
                            { value: 'all', label: 'All Severities' },
                            { value: 'critical', label: 'Critical' },
                            { value: 'warning', label: 'Warning' },
                        ]}
                    />
                    <Select
                        value={viewMode}
                        className="w-36"
                        onChange={setViewMode}
                        options={[
                            { value: 'unresolved', label: 'Unresolved' },
                            { value: 'all', label: 'All (Incl. Resolved)' },
                        ]}
                    />
                </div>
                <div className="text-xs text-gray-500 font-mono">
                    Showing {filteredAlerts.length} alert{filteredAlerts.length === 1 ? '' : 's'}
                </div>
            </div>

            {/* Alerts List */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-white/5 bg-white/5 text-sm font-semibold text-gray-400">
                    <div className="w-8 text-center">#</div>
                    <div>Message & Recommendation</div>
                    <div className="hidden md:block text-right">Metric Target</div>
                    <div className="text-right">Action / Status</div>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <p className="text-gray-500 text-sm">Loading real-time alerts...</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredAlerts.map((alert) => {
                            const isResolved = alert.status === 'resolved' || alert.resolved === true;
                            const severity = alert.severity || 'warning';
                            const metric = alert.metric || 'system';

                            return (
                                <div
                                    key={alert._id}
                                    className={`group grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center transition-all ${
                                        isResolved ? 'opacity-50 bg-black/20 grayscale-[20%]' : (alert.acknowledgedBy ? 'bg-sky-900/10' : 'hover:bg-white/5')
                                    }`}
                                >
                                    {/* Icon */}
                                    <div className="w-8 flex justify-center text-lg">
                                        {isResolved ? (
                                            <CheckCircleOutlined className="text-emerald-500" />
                                        ) : (
                                            getIcon(severity)
                                        )}
                                    </div>

                                    {/* Message & Suggested Remediation */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-medium text-gray-200">{alert.message}</span>
                                            <Tag color={getColor(severity)} className="border-none bg-opacity-20 uppercase font-mono text-[10px]">
                                                {severity}
                                            </Tag>
                                            {alert.alertType === 'anomaly' ? (
                                                <Tag className="bg-white/5 border-white/10 text-purple-400 text-[10px] font-mono uppercase">
                                                    Current: {alert.value}% | Jump Trigger: +{alert.threshold}%
                                                </Tag>
                                            ) : (
                                                <Tag className="bg-white/5 border-white/10 text-gray-400 text-[10px] font-mono uppercase">
                                                    Val: {alert.value}% | Limit: {alert.threshold}%
                                                </Tag>
                                            )}
                                        </div>

                                        {!isResolved && (
                                            <div className="flex items-center gap-2 text-xs text-amber-400/80 mt-1">
                                                <MedicineBoxOutlined />
                                                <span>Suggested: {getSuggestedAction(metric, severity)}</span>
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500 mt-1">
                                            Recorded {formatTimeAgo(alert.createdAt)}
                                        </div>
                                    </div>

                                    {/* Metric Target Source */}
                                    <div className="hidden md:flex items-center justify-end">
                                        <Tag className="m-0 bg-white/5 border-white/10 text-gray-300 font-mono text-xs uppercase px-2.5 py-1">
                                            HOST-{metric.toUpperCase()}
                                        </Tag>
                                    </div>

                                    {/* Status & Resolve Action */}
                                    <div className="text-sm text-gray-500 text-right flex flex-col items-end justify-center gap-1">
                                        {isResolved ? (
                                            <div className="flex flex-col items-end">
                                                <Tag className="m-0 bg-white/5 border-white/10 text-gray-400">Resolved</Tag>
                                                <div className="text-[10px] text-gray-500 mt-1">Resolved {formatTimeAgo(alert.resolvedAt)}</div>
                                                {alert.resolutionNote && (
                                                    <div className="text-[10px] text-gray-400 italic max-w-[150px] truncate" title={alert.resolutionNote}>
                                                        Note: {alert.resolutionNote}
                                                    </div>
                                                )}
                                            </div>
                                        ) : alert.acknowledgedBy ? (
                                            <div className="flex flex-col items-end">
                                                <Tag color="cyan" className="m-0 font-medium">Acknowledged</Tag>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    by {alert.acknowledgedBy} · {formatTimeAgo(alert.acknowledgedAt)}
                                                </div>
                                            </div>
                                        ) : (
                                            <Tag color={severity === 'critical' ? 'red' : 'gold'} className="m-0 font-medium flex items-center gap-1.5 px-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${severity === 'critical' ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                                                    <span className={`relative inline-flex h-2 w-2 rounded-full ${severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                                                </span>
                                                Active
                                            </Tag>
                                        )}

                                        {!isResolved && (
                                            <div className="flex gap-2 mt-2 flex-wrap justify-end">
                                                <Button
                                                    type="default"
                                                    size="small"
                                                    icon={<RobotOutlined />}
                                                    loading={diagnosingId === alert._id}
                                                    className="bg-cyan-950/80 text-cyan-300 border-cyan-500/30 hover:bg-cyan-900 hover:text-cyan-100 shadow-sm"
                                                    onClick={() => handleGenerateDiagnosis(alert._id)}
                                                >
                                                    AI Diagnose
                                                </Button>
                                                {!alert.acknowledgedBy && (
                                                    <Button
                                                        type="default"
                                                        size="small"
                                                        icon={<EyeOutlined />}
                                                        className="bg-white/5 text-gray-300 border-white/10 hover:text-white hover:border-sky-500 hover:bg-sky-500/20 shadow-sm"
                                                        onClick={() => handleAcknowledge(alert._id)}
                                                    >
                                                        Acknowledge
                                                    </Button>
                                                )}
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<CheckCircleOutlined />}
                                                    className="bg-emerald-600/80 hover:bg-emerald-500 text-white border-none shadow-sm"
                                                    onClick={() => handleResolve(alert._id)}
                                                >
                                                    Resolve
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredAlerts.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <CheckCircleOutlined className="text-4xl mb-4 text-emerald-500/30" />
                                <p className="text-base text-gray-300 font-medium">No active threshold alerts</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    All host metrics (CPU, RAM, Disk) are operating within defined safe thresholds.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Resolve Note Modal */}
            <Modal
                title={resolvingId === 'all' ? "Resolve All Alerts" : "Resolve Alert"}
                open={resolveModalVisible}
                onOk={confirmResolve}
                onCancel={() => setResolveModalVisible(false)}
                okText="Confirm Resolution"
                cancelText="Cancel"
                okButtonProps={{ className: 'bg-emerald-600 hover:bg-emerald-500' }}
            >
                <div className="py-4">
                    <p className="mb-2 text-gray-300">
                        {resolvingId === 'all' 
                            ? "Are you sure you want to resolve all active alerts?" 
                            : "Are you sure you want to mark this alert as resolved?"}
                    </p>
                    <div className="mt-4">
                        <label className="block text-sm text-gray-400 mb-1">Resolution Note (Optional)</label>
                        <Input.TextArea
                            rows={3}
                            placeholder="e.g. Cleared old log files manually"
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder-gray-600"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Alerts;

import React, { useState, useEffect } from 'react';
import { Tag, Spin } from 'antd';
import {
    WarningOutlined,
    InfoCircleOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons';
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

const UserAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.ALERTS.LIST, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAlerts(data);
            }
        } catch (err) {
            console.error('Error loading alerts for user:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'critical': return <CloseCircleOutlined className="text-red-500" />;
            case 'warning': return <WarningOutlined className="text-amber-500" />;
            case 'info': return <InfoCircleOutlined className="text-sky-500" />;
            default: return <InfoCircleOutlined className="text-gray-500" />;
        }
    };

    const getColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'critical': return 'red';
            case 'warning': return 'gold';
            case 'info': return 'blue';
            default: return 'default';
        }
    };

    const getSuggestedAction = (metric, severity) => {
        if (metric === 'cpu') return 'Investigate CPU consumption & optimize active processes';
        if (metric === 'memory') return 'Check RAM buffers & scale allocated instance memory';
        if (metric === 'disk') return 'Purge old storage logs & expand volume';
        return 'System administrator attention recommended';
    };

    return (
        <div className="space-y-6 text-gray-200">
            {/* Header */}
            <div className="flex flex-col gap-1 px-1">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    Host Incidents & Alerts
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-mono font-normal">
                        READ ONLY
                    </span>
                </h1>
                <p className="text-sm text-gray-500">Live active threshold breaches monitored from the host system.</p>
            </div>

            {/* Alerts List */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-white/5 bg-white/5 text-sm font-semibold text-gray-400">
                    <div className="w-8 text-center">Type</div>
                    <div>Message & Suggested Remediation</div>
                    <div className="hidden md:block text-right">Metric Target</div>
                    <div className="text-right">Status & Time</div>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <p className="text-gray-500 text-sm">Loading active alerts...</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {alerts.map((alert) => {
                            const isResolved = alert.status === 'resolved' || alert.resolved === true;
                            const severity = alert.severity || 'warning';
                            const metric = alert.metric || 'system';

                            return (
                                <div key={alert._id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                                    <div className="w-8 flex justify-center text-lg">
                                        {getIcon(severity)}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-medium text-gray-200">{alert.message}</span>
                                            <Tag color={getColor(severity)} className="border-none bg-opacity-20 uppercase text-[10px] font-mono">
                                                {severity}
                                            </Tag>
                                            <Tag className="bg-white/5 border-white/10 text-gray-400 text-[10px] font-mono uppercase">
                                                Limit: {alert.threshold}%
                                            </Tag>
                                        </div>

                                        {!isResolved && (
                                            <div className="flex items-center gap-2 text-xs text-amber-400/80">
                                                <MedicineBoxOutlined />
                                                <span>Suggested: {getSuggestedAction(metric, severity)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="hidden md:block text-right">
                                        <Tag className="bg-white/5 border-white/10 text-gray-400 text-[10px] uppercase m-0 font-mono">
                                            HOST-{metric.toUpperCase()}
                                        </Tag>
                                    </div>

                                    <div className="text-sm text-gray-500 text-right whitespace-nowrap flex flex-col items-end gap-1">
                                        <Tag color={isResolved ? 'green' : (severity === 'critical' ? 'red' : 'gold')} className="m-0 text-[10px]">
                                            {isResolved ? 'Resolved' : 'Active'}
                                        </Tag>
                                        <span className="text-xs text-gray-600">{formatTimeAgo(alert.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {alerts.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <CheckCircleOutlined className="text-3xl mb-2 text-emerald-500/50" />
                                <p className="text-sm text-gray-300 font-medium">No active threshold alerts</p>
                                <p className="text-xs text-gray-600 mt-1">Host server operating within defined policy thresholds.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAlerts;

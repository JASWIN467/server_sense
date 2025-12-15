import React, { useState, useEffect } from 'react';
import { Row, Col, Badge, Tooltip as AntTooltip } from 'antd';
import {
    CloudServerOutlined,
    HddOutlined,
    ThunderboltOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    DesktopOutlined,
    SafetyCertificateOutlined,
    InfoCircleOutlined,
    BellOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock data generator
const generateData = (count = 20) => {
    return Array.from({ length: count }, (_, i) => ({
        time: new Date(Date.now() - (count - i) * 2000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 20) + 40,
        disk: Math.floor(Math.random() * 10) + 60,
        net: Math.floor(Math.random() * 200) + 100,
    }));
};

// Reusable Glass Card Component
const GlassCard = ({ children, className = '', title, titleIcon, extra }) => (
    <div className={`relative flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl ${className}`}>
        {(title || titleIcon) && (
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-3">
                    {titleIcon && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-lg">{titleIcon}</div>}
                    <h3 className="text-base font-semibold tracking-wide text-gray-100">{title}</h3>
                </div>
                {extra}
            </div>
        )}
        <div className="flex-1 p-6 min-h-0 relative flex flex-col">{children}</div>
    </div>
);

// Metric Card with Glow Effect
const MetricCard = ({ title, value, suffix, icon, color, hex, trend }) => (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-lg transition-all duration-300 hover:border-white/20 hover:shadow-cyan-500/10">
        <div className="absolute -right-6 -top-6 text-9xl leading-none opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.07]" style={{ color: hex }}>
            {icon}
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-800/50">
            <div className="h-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: hex, boxShadow: `0 0 10px ${hex}` }} />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</span>
                <div className="rounded-lg p-2" style={{ backgroundColor: `${hex}15`, color: hex }}>
                    {icon}
                </div>
            </div>

            <div className="mt-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                    <span className="text-sm font-medium text-gray-500">{suffix}</span>
                </div>
                {trend && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${trend > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </span>
                        <span className="text-gray-600">vs last hour</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-[#050505]/95 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 text-xs text-gray-400">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm font-medium">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-200">{entry.name}:</span>
                        <span className="font-bold" style={{ color: entry.color }}>{entry.value}%</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardHome = () => {
    const [data, setData] = useState(generateData(20));
    const [alerts, setAlerts] = useState([
        { id: 1, type: 'warning', message: 'High CPU Load on Node-4', time: '2m ago' },
        { id: 2, type: 'error', message: 'DB Connection Timeout', time: '15m ago' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(1), {
                    time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: Math.max(10, Math.min(95, last.cpu + (Math.random() - 0.5) * 15)),
                    memory: Math.max(30, Math.min(90, last.memory + (Math.random() - 0.5) * 8)),
                    disk: Math.max(50, Math.min(95, last.disk + (Math.random() - 0.5) * 2)),
                    net: Math.max(50, Math.min(500, last.net + (Math.random() - 0.5) * 30)),
                }];
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const curr = data[data.length - 1];

    return (
        <div className="min-h-screen space-y-6 text-gray-200">
            {/* Header */}
            <div className="flex flex-col gap-1 px-1">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    System Overview
                    <div className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                    </div>
                </h1>
                <p className="text-sm text-gray-500">Live monitoring of server cluster performance.</p>
            </div>

            {/* Metrics Grid */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard title="CPU Load" value={Math.round(curr.cpu)} suffix="%" icon={<ThunderboltOutlined />} hex="#0ea5e9" trend={2.4} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard title="Memory" value={Math.round(curr.memory)} suffix="%" icon={<DesktopOutlined />} hex="#d946ef" trend={-0.8} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard title="Disk Usage" value={76} suffix="%" icon={<HddOutlined />} hex="#8b5cf6" trend={0.1} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard title="Uptime" value="99.9" suffix="%" icon={<CloudServerOutlined />} hex="#10b981" trend={0} />
                </Col>
            </Row>

            <Row gutter={[20, 20]} className="items-stretch">
                {/* Main Graph */}
                <Col xs={24} lg={16}>
                    <GlassCard title="Performance Analytics" titleIcon={<ThunderboltOutlined className="text-sky-500" />} className="h-[500px] flex flex-col">
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="glowCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="glowMem" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="glowDisk" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#ffffff08" strokeDasharray="3 3" />
                                    <XAxis dataKey="time" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                                    <Area type="monotone" dataKey="cpu" stroke="#0ea5e9" strokeWidth={3} fill="url(#glowCpu)" />
                                    <Area type="monotone" dataKey="memory" stroke="#d946ef" strokeWidth={3} fill="url(#glowMem)" />
                                    <Area type="monotone" dataKey="disk" stroke="#8b5cf6" strokeWidth={3} fill="url(#glowDisk)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </Col>

                {/* Side Panels */}
                <Col xs={24} lg={8} className="flex flex-col gap-5">
                    {/* Alerts */}
                    <GlassCard
                        title="System Alerts"
                        titleIcon={<BellOutlined className="text-amber-500" />}
                        extra={alerts.length > 0 && <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">{alerts.length} Active</span>}
                    >
                        <div className="space-y-3">
                            {alerts.map(alert => (
                                <div key={alert.id} className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alert.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        <WarningOutlined />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">{alert.message}</p>
                                        <p className="text-xs text-gray-500">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                            {alerts.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                    <CheckCircleOutlined className="mb-2 text-2xl text-emerald-500/50" />
                                    <p className="text-sm">All systems normal</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Node Status */}
                    <GlassCard title="Cluster Health" titleIcon={<SafetyCertificateOutlined className="text-emerald-500" />} className="flex-1">
                        <div className="space-y-3">
                            {[
                                { name: 'DB-Primary', ping: 12, status: 'ok', type: 'Database' },
                                { name: 'Redis-Cache', ping: 4, status: 'ok', type: 'Cache' },
                                { name: 'API-Gateway', ping: 156, status: 'warn', type: 'Gateway' },
                                { name: 'Worker-01', ping: 45, status: 'ok', type: 'Worker' }
                            ].map((node, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${node.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                                        <div>
                                            <p className="text-xs font-medium text-gray-300">{node.name}</p>
                                            <p className="text-[10px] text-gray-600 uppercase tracking-wider">{node.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-xs text-gray-500">{node.ping}ms</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex-1 min-h-[120px] flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Network Traffic</span>
                                <span className="text-xs font-mono text-emerald-400">{curr.net} Mbps</span>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="glowNet" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} fill="url(#glowNet)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </GlassCard>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardHome;

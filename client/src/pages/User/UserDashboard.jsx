import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import {
    CloudServerOutlined,
    HddOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    DesktopOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateData = (count = 20) => {
    return Array.from({ length: count }, (_, i) => ({
        time: new Date(Date.now() - (count - i) * 2000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 20) + 40,
        disk: Math.floor(Math.random() * 10) + 60,
    }));
};

const MetricCard = ({ title, value, suffix, icon, hex, trend }) => (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-lg transition-all duration-300 hover:border-secondary/50 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)]">
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

const UserDashboard = () => {
    const [data, setData] = useState(generateData(20));

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(1), {
                    time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: Math.max(10, Math.min(95, last.cpu + (Math.random() - 0.5) * 15)),
                    memory: Math.max(30, Math.min(90, last.memory + (Math.random() - 0.5) * 8)),
                    disk: Math.max(50, Math.min(95, last.disk + (Math.random() - 0.5) * 2)),
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
                    Overview
                    <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-mono font-normal">
                        READ ONLY
                    </span>
                </h1>
                <p className="text-sm text-gray-500">System health summary and real-time metrics.</p>
            </div>

            {/* Metrics Grid */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard title="Avg CPU Load" value={Math.round(curr.cpu)} suffix="%" icon={<ThunderboltOutlined />} hex="#d946ef" trend={1.2} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard title="Total Servers" value={5} suffix="" icon={<CloudServerOutlined />} hex="#8b5cf6" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard title="System Memory" value={Math.round(curr.memory)} suffix="%" icon={<DesktopOutlined />} hex="#0ea5e9" trend={-0.5} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard title="Health Status" value={100} suffix="%" icon={<CheckCircleOutlined />} hex="#10b981" />
                </Col>
            </Row>

            {/* Read-Only Chart */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-xl h-[400px] flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Cluster Performance Trends</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-2 text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-[#d946ef]" /> CPU
                        </span>
                        <span className="flex items-center gap-2 text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" /> Memory
                        </span>
                    </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="glowCpuUser" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="glowMemUser" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#ffffff08" strokeDasharray="3 3" />
                            <XAxis dataKey="time" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#050505', borderColor: '#333' }}
                                itemStyle={{ fontSize: 12 }}
                            />
                            <Area type="monotone" dataKey="cpu" stroke="#d946ef" strokeWidth={2} fill="url(#glowCpuUser)" />
                            <Area type="monotone" dataKey="memory" stroke="#0ea5e9" strokeWidth={2} fill="url(#glowMemUser)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

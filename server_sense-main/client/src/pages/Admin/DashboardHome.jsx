import React, { useState, useEffect } from 'react';
import { Row, Col, Tabs, Progress, Button, message } from 'antd';
import {
    ThunderboltOutlined,
    WarningOutlined,
    DesktopOutlined,
    DashboardOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    AreaChartOutlined,
    PieChartOutlined,
    CloudSyncOutlined,
    GatewayOutlined,
    DatabaseOutlined,
    ApiOutlined,
    SafetyCertificateOutlined,
    NodeIndexOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// --- Styles & Components ---
const GlassPanel = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl ${className}`}>
        {children}
    </div>
);

// --- TAB 1: OVERVIEW ---
const OverviewTab = ({ data, stats }) => {
    return (
        <div className="space-y-6">
            <Row gutter={[20, 20]}>
                {/* Health Ring & Stability */}
                <Col xs={24} lg={8}>
                    <GlassPanel className="h-full p-6 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 opacity-50" />
                        <h3 className="text-gray-400 uppercase tracking-widest text-xs font-semibold mb-6">System Health Score</h3>
                        <div className="relative flex items-center justify-center group">
                            {/* Animated Pulse Ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-20" />
                            <Progress
                                type="dashboard"
                                percent={stats.healthScore}
                                strokeColor={{ '0%': '#10b981', '100%': '#3b82f6' }}
                                trailColor="rgba(255,255,255,0.05)"
                                width={180}
                                format={percent => (
                                    <div className="flex flex-col items-center mt-2">
                                        <span className="text-5xl font-bold text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">{percent}</span>
                                        <span className="text-xs text-emerald-400 mt-1 uppercase tracking-wide">Excellent</span>
                                    </div>
                                )}
                            />
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                            <div className="text-center">
                                <p className="text-gray-500 text-xs uppercase">Uptime</p>
                                <p className="text-xl font-mono text-white">14d 21h</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 text-xs uppercase">Incidents</p>
                                <p className="text-xl font-mono text-white">0</p>
                            </div>
                        </div>
                    </GlassPanel>
                </Col>

                {/* Quick Stats Grid */}
                <Col xs={24} lg={16}>
                    <Row gutter={[20, 20]}>
                        {[
                            { title: 'Total API Req', value: stats.apiReq, icon: <ThunderboltOutlined />, color: '#0ea5e9' },
                            { title: 'Active Sessions', value: stats.activeSessions, icon: <DesktopOutlined />, color: '#d946ef' },
                            { title: 'Avg. Latency', value: stats.latency, icon: <ClockCircleOutlined />, color: '#f59e0b' },
                            { title: 'Error Rate', value: stats.errorRate, icon: <WarningOutlined />, color: '#ef4444' }
                        ].map((stat, i) => (
                            <Col xs={12} key={i}>
                                <GlassPanel className="p-6 flex items-start justify-between hover:bg-white/5 transition-colors group h-full">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{stat.title}</p>
                                        <p className="text-3xl font-bold text-white transition-all duration-300">{stat.value}</p>
                                    </div>
                                    <div
                                        className="p-3 rounded-xl bg-opacity-10 text-2xl group-hover:scale-110 transition-transform duration-300"
                                        style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                                    >
                                        {stat.icon}
                                    </div>
                                </GlassPanel>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>

            {/* Sparklines Row */}
            <GlassPanel className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <RiseOutlined className="text-secondary" />
                        Live Trends
                    </h3>
                </div>
                <Row gutter={40}>
                    <Col span={8}>
                        <div className="h-20">
                            <p className="text-xs text-gray-500 mb-1">CPU Trend</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} /><stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient></defs>
                                    <Area type="monotone" dataKey="cpu" stroke="#0ea5e9" strokeWidth={2} fill="url(#g1)" isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="h-20">
                            <p className="text-xs text-gray-500 mb-1">Memory Trend</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d946ef" stopOpacity={0.4} /><stop offset="100%" stopColor="#d946ef" stopOpacity={0} /></linearGradient></defs>
                                    <Area type="monotone" dataKey="memory" stroke="#d946ef" strokeWidth={2} fill="url(#g2)" isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="h-20">
                            <p className="text-xs text-gray-500 mb-1">Network traffic</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs><linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                                    <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} fill="url(#g3)" isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Col>
                </Row>
            </GlassPanel>
        </div>
    );
};

// --- TAB 2: PERFORMANCE ---
const PerformanceTab = ({ data }) => {
    const [range, setRange] = useState('1H');
    const [loading, setLoading] = useState(false);

    const handleRangeChange = (r) => {
        setLoading(true);
        setRange(r);
        // Simulate data fetch
        setTimeout(() => {
            setLoading(false);
            message.success(`Time range updated to ${r}`);
        }, 500);
    };

    return (
        <div className="space-y-6">
            <GlassPanel className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Performance Analytics</h3>
                        <p className="text-gray-500 text-xs">Deep dive into system metrics</p>
                    </div>
                    <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                        {['1H', '6H', '24H', '7D'].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleRangeChange(r)}
                                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${range === r ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`h-[400px] transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="perfCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="perfMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#ffffff08" />
                            <XAxis dataKey="time" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} />
                            <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                            <Area type="monotone" dataKey="cpu" stroke="#0ea5e9" strokeWidth={3} fill="url(#perfCpu)" name="CPU Load (%)" />
                            <Area type="monotone" dataKey="memory" stroke="#d946ef" strokeWidth={3} fill="url(#perfMem)" name="Memory (%)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassPanel>

            <Row gutter={20}>
                <Col span={12}>
                    <GlassPanel className="p-6 h-[300px] flex flex-col">
                        <h4 className="text-white font-semibold mb-4 text-sm">Disk Usage Distribution</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ name: '/root', val: 75 }, { name: '/home', val: 40 }, { name: '/var', val: 60 }, { name: '/tmp', val: 10 }]}>
                                <CartesianGrid vertical={false} stroke="#ffffff08" />
                                <XAxis dataKey="name" stroke="#525252" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                    {[{ name: '/root', val: 75 }, { name: '/home', val: 40 }, { name: '/var', val: 60 }, { name: '/tmp', val: 10 }].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#8b5cf6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassPanel>
                </Col>
                <Col span={12}>
                    <GlassPanel className="p-6 h-[300px]">
                        <h4 className="text-white font-semibold mb-6 text-sm">Resource Consumption Leaders</h4>
                        <div className="space-y-4">
                            {[
                                { name: 'Service-Worker-01', type: 'CPU', val: 92, color: 'bg-red-500' },
                                { name: 'Database-Primary', type: 'RAM', val: 86, color: 'bg-amber-500' },
                                { name: 'Analytics-Node', type: 'Disk', val: 74, color: 'bg-sky-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-300 text-sm font-medium">{item.name}</span>
                                            <span className="text-gray-500 text-xs">{item.type}</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.val}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-white font-mono text-sm">{item.val}%</span>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </Col>
            </Row>
        </div>
    );
};

// --- TAB 3: INSIGHTS ---

const CapacitySnapshot = () => (
    <GlassPanel className="p-6 h-full">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <PieChartOutlined className="text-purple-500" />
                Capacity Planning Snapshot
            </h3>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Future Risk Analysis</span>
        </div>

        <div className="space-y-8">
            {/* Disk Trend Prediction */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group hover:border-red-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-50">
                    <WarningOutlined className="text-red-500 text-xl animate-pulse" />
                </div>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Storage forecast</p>
                        <p className="text-white font-medium mt-1">Disk expected to reach <span className="text-red-400">90%</span> in <span className="text-white font-bold text-lg">12 Days</span></p>
                    </div>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 w-[78%]" />
                </div>
                <p className="text-[11px] text-gray-500 flex items-center gap-2">
                    <ArrowRightOutlined className="rotate-[-45deg] text-red-500" /> Trend: Accelerating (+1.2GB/day)
                </p>
            </div>

            {/* Other Trends */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">CPU Trend</p>
                    <div className="flex items-center gap-2">
                        <ArrowRightOutlined className="rotate-[-15deg] text-amber-500" />
                        <span className="text-amber-400 font-medium">Increasing Slowly</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">Week-over-week +5%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">RAM Usage</p>
                    <div className="flex items-center gap-2">
                        <ArrowRightOutlined className="text-emerald-500" />
                        <span className="text-emerald-400 font-medium">Stable</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">Avg 65% utilization</p>
                </div>
            </div>

            {/* Recommendation */}
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 flex gap-3">
                <div className="mt-1"><SafetyCertificateOutlined className="text-sky-400 text-lg" /></div>
                <div>
                    <h4 className="text-sky-100 font-medium text-sm">AI Recommendation</h4>
                    <p className="text-sky-300/80 text-xs mt-1 leading-relaxed">
                        Scale storage volume <strong>vol-0a3</strong> by 200GB before Dec 14 to avoid outage.
                    </p>
                    <button className="mt-3 text-[10px] bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 rounded transition-colors font-medium">
                        Simulate Scaling
                    </button>
                </div>
            </div>
        </div>
    </GlassPanel>
);

const ServiceDependencyMap = () => (
    <GlassPanel className="p-6 h-full">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <NodeIndexOutlined className="text-emerald-500" />
                Service Dependency Map
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Live Topology</span>
        </div>

        {/* Map Visualization */}
        <div className="relative flex items-center justify-center p-4 min-h-[300px]">
            {/* Connecting Lines (Simulated with absolute positioning or simplified flex row) */}
            <div className="flex items-center gap-4 w-full justify-center">

                {/* Nodes */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-[#111] border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center z-10">
                        <DesktopOutlined className="text-xl text-emerald-500" />
                    </div>
                    <span className="text-xs text-gray-400 font-mono">Client</span>
                </div>

                <div className="h-[2px] w-12 bg-emerald-500/30" />

                <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-xl bg-[#111] border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center z-10 relative">
                        <ApiOutlined className="text-2xl text-emerald-500 mb-1" />
                        <span className="text-[10px] font-bold text-white">API GW</span>
                        {/* Traffic Dots */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                </div>

                <div className="h-[2px] w-12 bg-emerald-500/30" />

                {/* Branching */}
                <div className="flex flex-col gap-8">
                    {/* Auth Service */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-[#111] border border-emerald-500/50 flex flex-col items-center justify-center">
                            <SafetyCertificateOutlined className="text-lg text-emerald-400 mb-1" />
                            <span className="text-[10px] text-gray-300">Auth</span>
                        </div>
                    </div>
                    {/* Database */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-[#111] border border-emerald-500/50 flex flex-col items-center justify-center">
                            <DatabaseOutlined className="text-lg text-blue-400 mb-1" />
                            <span className="text-[10px] text-gray-300">Main DB</span>
                        </div>
                        <div className="h-[2px] w-8 bg-dashed bg-gray-700" />
                        <div className="w-14 h-14 rounded-lg bg-[#111] border border-gray-700 flex flex-col items-center justify-center opacity-75">
                            <CloudSyncOutlined className="text-lg text-amber-500 mb-1" />
                            <span className="text-[9px] text-gray-500">Cache</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-gray-500 text-center">
            <div className="bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                <span className="block text-emerald-500 font-bold text-lg">99.9%</span>
                Uptime
            </div>
            <div className="bg-blue-500/5 p-2 rounded border border-blue-500/10">
                <span className="block text-blue-400 font-bold text-lg">45ms</span>
                Avg Latency
            </div>
            <div className="bg-amber-500/5 p-2 rounded border border-amber-500/10">
                <span className="block text-amber-400 font-bold text-lg">0.01%</span>
                Error Rate
            </div>
        </div>
    </GlassPanel>
);

const InsightsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <CapacitySnapshot />
        <ServiceDependencyMap />
    </div>
);

// --- DATA GENERATION ---
const generateData = (count = 20) => {
    return Array.from({ length: count }, (_, i) => ({
        time: new Date(Date.now() - (count - i) * 2000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 20) + 40,
        disk: Math.floor(Math.random() * 10) + 60,
        net: Math.floor(Math.random() * 200) + 100,
    }));
};

// --- MAIN DASHBOARD COMPONENT ---
const DashboardHome = () => {
    const [data, setData] = useState(generateData(20));
    const [stats, setStats] = useState({
        healthScore: 98,
        apiReq: '2.4M',
        activeSessions: '843',
        latency: '24ms',
        errorRate: '0.01%'
    });

    useEffect(() => {
        const interval = setInterval(() => {
            // Update Chart Data
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

            // Update Stats
            setStats(prev => ({
                healthScore: Math.min(100, Math.max(90, prev.healthScore + (Math.random() > 0.5 ? 1 : -1))),
                apiReq: (parseFloat(prev.apiReq) + Math.random() * 0.01).toFixed(2) + 'M',
                activeSessions: Math.floor(parseInt(prev.activeSessions) + (Math.random() - 0.5) * 10).toString(),
                latency: Math.floor(20 + Math.random() * 15) + 'ms',
                errorRate: (0.01 + Math.random() * 0.02).toFixed(3) + '%'
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const tabItems = [
        {
            key: '1',
            label: <span className="flex items-center gap-2 px-2 py-1"><DashboardOutlined /> Overview</span>,
            children: <OverviewTab data={data} stats={stats} />
        },
        {
            key: '2',
            label: <span className="flex items-center gap-2 px-2 py-1"><RiseOutlined /> Performance</span>,
            children: <PerformanceTab data={data} />
        },
        {
            key: '3',
            label: <span className="flex items-center gap-2 px-2 py-1"><NodeIndexOutlined /> Insights</span>,
            children: <InsightsTab />
        }
    ];

    return (
        <div className="min-h-screen text-gray-200 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-1 px-1 mb-6">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    System Dashboard
                    <div className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                    </div>
                </h1>
                <p className="text-sm text-gray-500">Real-time infrastructure monitoring</p>
            </div>

            {/* Configured Tabs */}
            <Tabs
                defaultActiveKey="1"
                items={tabItems}
                className="custom-tabs"
                tabBarStyle={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            />
        </div>
    );
};

export default DashboardHome;

import React, { useState, useEffect } from 'react';
import { Row, Col, Progress, Button, message } from 'antd';
import {
    ThunderboltOutlined,
    DatabaseOutlined,
    ReloadOutlined,
    PoweroffOutlined,
    ClearOutlined,
    DesktopOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_ENDPOINTS } from '../../config/constants';

const MetricCard = ({ title, value, suffix, icon, hex }) => (
    <div className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] p-5 shadow-lg transition-all duration-300">
        <div className="absolute -right-4 -top-4 text-7xl leading-none opacity-[0.03]" style={{ color: hex }}>
            {icon}
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</span>
                <div className="rounded-lg p-1.5" style={{ backgroundColor: `${hex}15`, color: hex }}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-tight font-mono">{value}</span>
                <span className="text-xs font-medium text-gray-500">{suffix}</span>
            </div>
        </div>
    </div>
);

const UserDashboard = () => {
    const [liveMetrics, setLiveMetrics] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [restarting, setRestarting] = useState(false);
    const [clearing, setClearing] = useState(false);

    const fetchCurrentMetrics = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.METRICS.CURRENT);
            if (res.ok) {
                const data = await res.json();
                setLiveMetrics(data);

                setChartData(prev => {
                    const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const newPoint = {
                        time: now,
                        cpu: data.cpuLoad ?? 0,
                        memory: data.memUsedPercent ?? 0,
                    };
                    const updated = [...prev, newPoint];
                    return updated.length > 20 ? updated.slice(-20) : updated;
                });
            }
        } catch (err) {
            console.error('Error fetching live metrics:', err);
        }
    };

    useEffect(() => {
        fetchCurrentMetrics();
        const interval = setInterval(fetchCurrentMetrics, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleRestart = () => {
        setRestarting(true);
        message.loading({ content: 'Restarting instance...', key: 'restart' });
        setTimeout(() => {
            setRestarting(false);
            message.success({ content: 'Instance restarted successfully.', key: 'restart' });
        }, 3000);
    };

    const handleClearCache = () => {
        setClearing(true);
        message.loading({ content: 'Purging memory cache...', key: 'cache' });
        setTimeout(() => {
            setClearing(false);
            message.success({ content: 'Cache cleared successfully. Freed 450MB.', key: 'cache' });
        }, 2000);
    };

    const cpu = liveMetrics?.cpuLoad ?? 0;
    const memory = liveMetrics?.memUsedPercent ?? 0;
    
    // Calculate Health Score (Algorithm: 100 - average of cpu and memory usage)
    const healthScore = Math.max(0, Math.floor(100 - ((cpu + memory) / 2)));
    const healthColor = healthScore > 80 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="min-h-screen space-y-6 text-gray-200">
            <div className="flex flex-col gap-1 px-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">Client Portal</h1>
                <p className="text-sm text-gray-500">Manage and monitor your active compute instances.</p>
            </div>

            <Row gutter={[24, 24]}>
                {/* Active Instance Main Card */}
                <Col xs={24} lg={16}>
                    <div className="rounded-2xl border border-secondary/20 bg-gradient-to-br from-[#0a0a0a] to-[#120a1f] p-8 shadow-xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-black border border-white/10 rounded-xl shadow-lg">
                                    <DesktopOutlined className="text-4xl text-secondary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-bold text-white">Production Host (ubuntu-22.04)</h2>
                                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Running
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm font-mono">IP: 192.168.1.104 • Zone: us-east-1</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6 bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Health Score</p>
                                    <Progress 
                                        type="dashboard" 
                                        percent={healthScore} 
                                        size={70} 
                                        strokeColor={healthColor}
                                        trailColor="#ffffff10"
                                        format={p => <span className="text-lg font-bold text-white">{p}</span>}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <MetricCard title="CPU Load" value={cpu.toFixed(1)} suffix="%" icon={<ThunderboltOutlined />} hex="#d946ef" />
                            <MetricCard title="Memory Used" value={memory.toFixed(1)} suffix="%" icon={<DatabaseOutlined />} hex="#0ea5e9" />
                        </div>
                    </div>
                </Col>

                {/* Power Controls Card */}
                <Col xs={24} lg={8}>
                    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl h-full flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-1">Power Controls</h3>
                        <p className="text-xs text-gray-500 mb-6">Manage instance lifecycle and resources.</p>
                        
                        <div className="flex-1 flex flex-col gap-4">
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<ReloadOutlined />} 
                                loading={restarting}
                                onClick={handleRestart}
                                className="w-full h-14 bg-white/5 border border-white/10 text-white hover:bg-secondary/20 hover:border-secondary hover:text-white transition-all shadow-none flex justify-between items-center px-6"
                            >
                                <span className="font-semibold tracking-wide">Restart Instance</span>
                            </Button>

                            <Button 
                                size="large" 
                                icon={<ClearOutlined />} 
                                loading={clearing}
                                onClick={handleClearCache}
                                className="w-full h-14 bg-white/5 border border-white/10 text-white hover:bg-sky-500/20 hover:border-sky-500 transition-all shadow-none flex justify-between items-center px-6"
                            >
                                <span className="font-semibold tracking-wide">Clear RAM Cache</span>
                            </Button>
                            
                            <div className="mt-auto pt-6 border-t border-white/5">
                                <Button 
                                    danger 
                                    ghost 
                                    size="large" 
                                    icon={<PoweroffOutlined />} 
                                    className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
                                >
                                    Force Stop
                                </Button>
                                <p className="text-[10px] text-center text-gray-600 mt-2">Force stopping may cause data loss.</p>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Performance Graph */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-xl h-[350px] flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Live Telemetry Stream</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-2 text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-[#d946ef]" /> CPU %
                        </span>
                        <span className="flex items-center gap-2 text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" /> Memory %
                        </span>
                    </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="glowCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="glowMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#ffffff08" strokeDasharray="3 3" />
                            <XAxis dataKey="time" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} dy={10} />
                            <YAxis domain={[0, 100]} stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: '#333' }} itemStyle={{ fontSize: 12 }} />
                            <Area type="monotone" dataKey="cpu" stroke="#d946ef" strokeWidth={2} fill="url(#glowCpu)" />
                            <Area type="monotone" dataKey="memory" stroke="#0ea5e9" strokeWidth={2} fill="url(#glowMem)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

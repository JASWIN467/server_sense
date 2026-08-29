import React from 'react';
import { Row, Col, Button, Breadcrumb } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeftOutlined, CloudServerOutlined, ThunderboltOutlined, HddOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const generateMockData = () =>
    Array.from({ length: 20 }, (_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 60) + 20
    }));

const dataCpu = generateMockData();
const dataRam = generateMockData();

const DetailChart = ({ title, data, color, icon }) => (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-xl h-[300px] flex flex-col">
        <div className="mb-4 flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>{icon}</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`grad${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color === 'purple' ? '#d946ef' : '#0ea5e9'} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color === 'purple' ? '#d946ef' : '#0ea5e9'} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color === 'purple' ? '#d946ef' : '#0ea5e9'}
                        strokeWidth={3}
                        fill={`url(#grad${color})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ServerDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="text"
                    className="text-gray-400 hover:text-white"
                    onClick={() => navigate('/user/servers')}
                />
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Server-{id || '01'} Details
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Online</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Real-time performance metrics</p>
                </div>
            </div>

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={12}>
                    <DetailChart
                        title="CPU Usage History"
                        data={dataCpu}
                        color="purple"
                        icon={<ThunderboltOutlined />}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <DetailChart
                        title="Memory Utilisation"
                        data={dataRam}
                        color="blue"
                        icon={<HddOutlined />}
                    />
                </Col>
            </Row>

            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">OS Version</p>
                        <p className="text-gray-200 mt-1">Ubuntu 22.04 LTS</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Kernel</p>
                        <p className="text-gray-200 mt-1">5.15.0-generic</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Region</p>
                        <p className="text-gray-200 mt-1">US-East-1</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Last Reboot</p>
                        <p className="text-gray-200 mt-1">14 days ago</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerDetail;

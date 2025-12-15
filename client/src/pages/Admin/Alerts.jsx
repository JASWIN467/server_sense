import React, { useState } from 'react';
import { Row, Col, Input, Select, Button, Tag, Space } from 'antd';
import {
    BellOutlined,
    SearchOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    CloseCircleOutlined,
    MoreOutlined
} from '@ant-design/icons';

const Alerts = () => {
    const [filter, setFilter] = useState('all');

    // Mock Alerts Data
    const alerts = [
        { id: 1, type: 'critical', message: 'High CPU Load on Node-4 > 90%', source: 'Node-4', time: '2m ago', status: 'Active' },
        { id: 2, type: 'warning', message: 'Memory usage approaching limit', source: 'Redis-Cache', time: '15m ago', status: 'Active' },
        { id: 3, type: 'info', message: 'Backup completed successfully', source: 'System', time: '1h ago', status: 'Resolved' },
        { id: 4, type: 'error', message: 'API Gateway timeout (504)', source: 'API-Gateway', time: '2h ago', status: 'Resolved' },
        { id: 5, type: 'critical', message: 'Database connection lost', source: 'DB-Primary', time: '3h ago', status: 'Resolved' },
        { id: 6, type: 'warning', message: 'High Disk I/O detected', source: 'Worker-01', time: '4h ago', status: 'Active' },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'critical': return <CloseCircleOutlined className="text-red-500" />;
            case 'error': return <CloseCircleOutlined className="text-red-500" />;
            case 'warning': return <WarningOutlined className="text-amber-500" />;
            case 'info': return <InfoCircleOutlined className="text-sky-500" />;
            case 'success': return <CheckCircleOutlined className="text-emerald-500" />;
            default: return <InfoCircleOutlined className="text-gray-500" />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'critical': return 'red';
            case 'error': return 'red';
            case 'warning': return 'gold';
            case 'info': return 'blue';
            case 'success': return 'green';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6 text-gray-200">
            {/* Header */}
            <div className="flex flex-col gap-1 px-1">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    System Alerts
                    <div className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                    </div>
                </h1>
                <p className="text-sm text-gray-500">Real-time system notifications and incident history.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-4 shadow-lg">
                <div className="w-full md:w-auto flex gap-4">
                    <Input
                        placeholder="Search alerts..."
                        prefix={<SearchOutlined className="text-gray-500" />}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:bg-white/10 focus:bg-white/10 w-full md:w-64"
                        variant="filled"
                    />
                    <Select
                        defaultValue="all"
                        className="w-32"
                        options={[
                            { value: 'all', label: 'All Types' },
                            { value: 'critical', label: 'Critical' },
                            { value: 'warning', label: 'Warning' },
                            { value: 'info', label: 'Info' },
                        ]}
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="primary" icon={<CheckCircleOutlined />} className="bg-emerald-600 hover:bg-emerald-500">
                        Mark All Read
                    </Button>
                    <Button icon={<FilterOutlined />} className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10">
                        Filter
                    </Button>
                </div>
            </div>

            {/* Alerts List */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-white/5 bg-white/5 text-sm font-semibold text-gray-400">
                    <div className="w-8 text-center">#</div>
                    <div>Message</div>
                    <div className="hidden md:block">Source</div>
                    <div className="text-right">Time</div>
                </div>

                <div className="divide-y divide-white/5">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="group grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                            <div className="w-8 flex justify-center text-lg">
                                {getIcon(alert.type)}
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-200 truncate">{alert.message}</span>
                                    <Tag color={getColor(alert.type)} className="border-none bg-opacity-20 capitalize">
                                        {alert.type}
                                    </Tag>
                                </div>
                                <div className="text-xs text-gray-500 md:hidden">
                                    {alert.source} • {alert.time}
                                </div>
                            </div>

                            <div className="hidden md:flex items-center">
                                <Tag className="m-0 bg-white/5 border-white/10 text-gray-400">
                                    {alert.source}
                                </Tag>
                            </div>

                            <div className="text-sm text-gray-500 text-right whitespace-nowrap flex flex-col items-end gap-2">
                                <span>{alert.time}</span>
                                <Button type="text" size="small" icon={<MoreOutlined />} className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Alerts;

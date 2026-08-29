import React, { useState } from 'react';
import { Table, Tag, Button, Input, Space } from 'antd';
import { SearchOutlined, EyeOutlined, DatabaseOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const GlassPanel = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-xl ${className}`}>
        {children}
    </div>
);

const initialData = [
    { key: '1', name: 'AWS-Prod-01', ip: '192.168.1.10', status: 'Online', region: 'us-east-1', uptime: '14d 2h' },
    { key: '2', name: 'AWS-Prod-02', ip: '192.168.1.11', status: 'Warning', region: 'us-east-1', uptime: '4d 12h' },
    { key: '3', name: 'DB-Cluster-Main', ip: '10.0.0.55', status: 'Online', region: 'eu-west-2', uptime: '45d 1h' },
    { key: '4', name: 'Cache-Redis-01', ip: '10.0.0.60', status: 'Offline', region: 'ap-south-1', uptime: '0h 0m' },
    { key: '5', name: 'Worker-Edge-05', ip: '172.16.5.21', status: 'Online', region: 'us-west-1', uptime: '2d 6h' },
];

const UserServerList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');

    const columns = [
        {
            title: 'Server Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div className="flex items-center gap-2">
                    <DatabaseOutlined className="text-secondary" />
                    <span className="font-semibold text-gray-200">{text}</span>
                </div>
            ),
        },
        {
            title: 'IP Address',
            dataIndex: 'ip',
            key: 'ip',
            render: (text) => <span className="font-mono text-xs text-gray-400">{text}</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                if (status === 'Warning') color = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                if (status === 'Offline') color = 'bg-red-500/10 text-red-500 border-red-500/20';
                return (
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            title: 'Uptime',
            dataIndex: 'uptime',
            key: 'uptime',
            render: (text) => <span className="text-gray-400 font-mono text-xs">{text}</span>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="default"
                    size="small"
                    icon={<EyeOutlined />}
                    className="bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20 hover:border-secondary hover:text-white"
                    onClick={() => navigate(`/user/server/${record.key}`)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const filteredServers = initialData.filter(s =>
        s.name.toLowerCase().includes(searchText.toLowerCase()) ||
        s.ip.includes(searchText)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                        <span className="text-secondary">|</span> All Servers
                    </h2>
                    <p className="text-sm text-gray-500">Monitor availability and status (Read-Only).</p>
                </div>
                <div className="flex gap-3">
                    <Input
                        placeholder="Search..."
                        prefix={<SearchOutlined className="text-gray-600" />}
                        className="w-64 border-white/10 bg-[#0a0a0a] text-gray-200 placeholder:text-gray-600 hover:border-secondary/30 focus:border-secondary"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        className="border-white/10 bg-[#0a0a0a] text-gray-300 hover:text-secondary hover:border-secondary/50"
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <GlassPanel>
                <Table
                    columns={columns}
                    dataSource={filteredServers}
                    pagination={{ pageSize: 8 }}
                    className="custom-table"
                />
            </GlassPanel>
        </div>
    );
};

export default UserServerList;

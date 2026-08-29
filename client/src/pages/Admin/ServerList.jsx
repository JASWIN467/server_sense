import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Form, Select, message, Tooltip, Badge, Progress, Tabs } from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    DesktopOutlined,
    HeartOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined,
    DatabaseOutlined,
    GlobalOutlined
} from '@ant-design/icons';

const GlassPanel = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-xl ${className}`}>
        {children}
    </div>
);

const MetricBar = ({ label, value, color, unit = '%' }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-300 font-mono">{value}{unit}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ${color}`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

const initialData = [
    { key: '1', name: 'AWS-Prod-01', ip: '192.168.1.10', status: 'Online', region: 'us-east-1', cpu: 45, ram: 60, disk: 32, heartbeat: '2ms' },
    { key: '2', name: 'AWS-Prod-02', ip: '192.168.1.11', status: 'Warning', region: 'us-east-1', cpu: 88, ram: 92, disk: 45, heartbeat: '120ms' },
    { key: '3', name: 'DB-Cluster-Main', ip: '10.0.0.55', status: 'Online', region: 'eu-west-2', cpu: 23, ram: 45, disk: 89, heartbeat: '5ms' },
    { key: '4', name: 'Cache-Redis-01', ip: '10.0.0.60', status: 'Offline', region: 'ap-south-1', cpu: 0, ram: 0, disk: 0, heartbeat: '-' },
    { key: '5', name: 'Worker-Edge-05', ip: '172.16.5.21', status: 'Online', region: 'us-west-1', cpu: 12, ram: 28, disk: 15, heartbeat: '45ms' },
    { key: '6', name: 'Analytics-Node', ip: '172.16.5.99', status: 'Warning', region: 'us-west-1', cpu: 76, ram: 81, disk: 67, heartbeat: '210ms' },
];

const ServerList = () => {
    const [servers, setServers] = useState(initialData);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // Add activeTab state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const stats = {
        total: servers.length,
        healthy: servers.filter(s => s.status === 'Online').length,
        warning: servers.filter(s => s.status === 'Warning').length,
        critical: servers.filter(s => s.status === 'Offline').length,
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            const updatedServers = servers.map(s => {
                if (s.status === 'Offline') return s;
                return {
                    ...s,
                    cpu: Math.floor(Math.random() * 60) + 10,
                    ram: Math.floor(Math.random() * 60) + 20,
                    heartbeat: `${Math.floor(Math.random() * 50) + 1}ms`
                };
            });
            setServers(updatedServers);
            setLoading(false);
            message.success('Cluster metrics refreshed');
        }, 800);
    };

    const handleFixNode = (key) => {
        message.loading({ content: 'Initiating auto-recovery protocol...', key: 'fix' });
        setTimeout(() => {
            setServers(current => current.map(s => {
                if (s.key === key) {
                    return { ...s, status: 'Online', cpu: 30, ram: 40, heartbeat: '5ms' };
                }
                return s;
            }));
            message.success({ content: 'Node recovered successfully', key: 'fix' });
        }, 1500);
    };

    const handleAdd = (values) => {
        const newServer = {
            key: Date.now().toString(),
            name: values.name,
            ip: values.ip,
            region: values.region,
            status: 'Online',
            cpu: Math.floor(Math.random() * 30),
            ram: Math.floor(Math.random() * 40),
            disk: 10,
            heartbeat: '10ms'
        };
        setServers([...servers, newServer]);
        setIsModalOpen(false);
        form.resetFields();
        message.success('Node provisioned successfully');
    };

    const StatusCard = ({ title, count, color, icon }) => (
        <GlassPanel className="p-5 flex items-center justify-between border-l-4" style={{ borderLeftColor: color }}>
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{count}</p>
            </div>
            <div className={`p-3 rounded-xl bg-opacity-10 ${color.replace('border-', 'bg-')} ${color.replace('border-', 'text-')}`}>
                {icon}
            </div>
        </GlassPanel>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DesktopOutlined className="text-sky-500" />
                        Cluster Health
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Real-time infrastructure monitoring</p>
                </div>
                <div className="flex gap-3">
                    <Button icon={<ReloadOutlined spin={loading} />} onClick={handleRefresh} className="bg-[#111] border-white/10 text-gray-300 hover:text-white">
                        Refresh Metrics
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} className="bg-sky-600 border-none shadow-lg shadow-sky-900/20">
                        Provision Node
                    </Button>
                </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusCard title="Total Nodes" count={stats.total} color="border-sky-500" icon={<DatabaseOutlined className="text-2xl" />} />
                <StatusCard title="Online" count={stats.healthy} color="border-emerald-500" icon={<CheckCircleOutlined className="text-2xl" />} />
                <StatusCard title="Warnings" count={stats.warning} color="border-amber-500" icon={<WarningOutlined className="text-2xl" />} />
                <StatusCard title="Critical" count={stats.critical} color="border-red-500" icon={<CloseCircleOutlined className="text-2xl" />} />
            </div>

            {/* Middle Section: Chart & Attention List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health Distribution */}
                <GlassPanel className="p-6 col-span-1">
                    <h3 className="text-lg font-semibold text-white mb-6">Health Distribution</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-gray-400 text-sm mb-1">
                                <span>Healthy ({Math.round(stats.healthy / stats.total * 100)}%)</span>
                                <span className="text-emerald-500">{stats.healthy}</span>
                            </div>
                            <Progress percent={Math.round(stats.healthy / stats.total * 100)} showInfo={false} strokeColor="#10b981" trailColor="#333" />
                        </div>
                        <div>
                            <div className="flex justify-between text-gray-400 text-sm mb-1">
                                <span>Warning ({Math.round(stats.warning / stats.total * 100)}%)</span>
                                <span className="text-amber-500">{stats.warning}</span>
                            </div>
                            <Progress percent={Math.round(stats.warning / stats.total * 100)} showInfo={false} strokeColor="#f59e0b" trailColor="#333" />
                        </div>
                        <div>
                            <div className="flex justify-between text-gray-400 text-sm mb-1">
                                <span>Critical ({Math.round(stats.critical / stats.total * 100)}%)</span>
                                <span className="text-red-500">{stats.critical}</span>
                            </div>
                            <Progress percent={Math.round(stats.critical / stats.total * 100)} showInfo={false} strokeColor="#ef4444" trailColor="#333" />
                        </div>
                    </div>
                </GlassPanel>

                {/* Nodes Requiring Attention */}
                <GlassPanel className="p-6 col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <ThunderboltOutlined className="text-amber-500" />
                        Nodes Requiring Attention
                    </h3>
                    <div className="space-y-3">
                        {stats.warning === 0 && stats.critical === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <CheckCircleOutlined className="text-4xl text-emerald-500/50 mb-3" />
                                <p>All operations normal.</p>
                            </div>
                        ) : (
                            servers.filter(s => s.status !== 'Online').map(node => (
                                <div key={node.key} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${node.status === 'Offline' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-amber-500 shadow-[0_0_8px_orange]'}`} />
                                        <div>
                                            <p className="font-semibold text-gray-200">{node.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{node.ip} • <span className={node.status === 'Offline' ? 'text-red-400' : 'text-amber-400'}>{node.status}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-mono hidden sm:flex">
                                        <span>CPU: {node.cpu}%</span>
                                        <span>RAM: {node.ram}%</span>
                                    </div>
                                    <Button size="small" type="primary" danger={node.status === 'Offline'} onClick={() => handleFixNode(node.key)}>
                                        {node.status === 'Offline' ? 'Reboot' : 'Optimize'}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </GlassPanel>
            </div>

            {/* Tabs & Search */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="custom-tabs"
                items={[
                    {
                        key: 'all',
                        label: 'All Nodes',
                        children: (
                            <>
                                <Input
                                    placeholder="Search nodes by name or IP..."
                                    prefix={<SearchOutlined className="text-gray-600" />}
                                    className="max-w-md bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600 mb-6"
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {servers.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()) || s.ip.includes(searchText)).map(server => (
                                        <GlassPanel key={server.key} className="p-5 hover:border-white/20 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${server.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : server.status === 'Warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        <GlobalOutlined />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-200">{server.name}</h4>
                                                        <p className="text-xs text-gray-500 font-mono">{server.ip}</p>
                                                    </div>
                                                </div>
                                                <Tooltip title={`Status: ${server.status}`}>
                                                    <div className={`w-2 h-2 rounded-full ${server.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : server.status === 'Warning' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                                                </Tooltip>
                                            </div>

                                            <div className="space-y-4 mb-4">
                                                <MetricBar label="CPU Usage" value={server.cpu} color={server.cpu > 80 ? 'bg-red-500' : server.cpu > 60 ? 'bg-amber-500' : 'bg-sky-500'} />
                                                <MetricBar label="Memory" value={server.ram} color={server.ram > 80 ? 'bg-red-500' : server.ram > 60 ? 'bg-purple-500' : 'bg-blue-500'} />
                                                <MetricBar label="Disk Space" value={server.disk} color="bg-gray-500" />
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-white/5">
                                                <span className="flex items-center gap-1"><HeartOutlined /> {server.heartbeat}</span>
                                                <span>{server.region}</span>
                                            </div>
                                        </GlassPanel>
                                    ))}
                                </div>
                            </>
                        )
                    },
                    {
                        key: 'online',
                        label: <span className="text-emerald-500">Healthy</span>,
                        children: (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {servers.filter(s => s.status === 'Online' && (s.name.toLowerCase().includes(searchText.toLowerCase()) || s.ip.includes(searchText))).map(server => (
                                    <GlassPanel key={server.key} className="p-5 hover:border-white/20 transition-all duration-300">
                                        {/* Duplicate Card logic for simplicity, normally would extract to component */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                                    <GlobalOutlined />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-200">{server.name}</h4>
                                                    <p className="text-xs text-gray-500 font-mono">{server.ip}</p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                        </div>
                                        <div className="space-y-4 mb-4">
                                            <MetricBar label="CPU Usage" value={server.cpu} color={server.cpu > 80 ? 'bg-red-500' : server.cpu > 60 ? 'bg-amber-500' : 'bg-sky-500'} />
                                            <MetricBar label="Memory" value={server.ram} color={server.ram > 80 ? 'bg-red-500' : server.ram > 60 ? 'bg-purple-500' : 'bg-blue-500'} />
                                            <MetricBar label="Disk Space" value={server.disk} color="bg-gray-500" />
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-white/5">
                                            <span className="flex items-center gap-1"><HeartOutlined /> {server.heartbeat}</span>
                                            <span>{server.region}</span>
                                        </div>
                                    </GlassPanel>
                                ))}
                            </div>
                        )
                    },
                    {
                        key: 'warning',
                        label: <span className="text-amber-500">Warning</span>,
                        children: (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {servers.filter(s => s.status === 'Warning' && (s.name.toLowerCase().includes(searchText.toLowerCase()) || s.ip.includes(searchText))).map(server => (
                                    <GlassPanel key={server.key} className="p-5 hover:border-white/20 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                                    <GlobalOutlined />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-200">{server.name}</h4>
                                                    <p className="text-xs text-gray-500 font-mono">{server.ip}</p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                                        </div>
                                        <div className="space-y-4 mb-4">
                                            <MetricBar label="CPU Usage" value={server.cpu} color={server.cpu > 80 ? 'bg-red-500' : server.cpu > 60 ? 'bg-amber-500' : 'bg-sky-500'} />
                                            <MetricBar label="Memory" value={server.ram} color={server.ram > 80 ? 'bg-red-500' : server.ram > 60 ? 'bg-purple-500' : 'bg-blue-500'} />
                                            <MetricBar label="Disk Space" value={server.disk} color="bg-gray-500" />
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-white/5">
                                            <span className="flex items-center gap-1"><HeartOutlined /> {server.heartbeat}</span>
                                            <span>{server.region}</span>
                                        </div>
                                    </GlassPanel>
                                ))}
                            </div>
                        )
                    },
                    {
                        key: 'critical',
                        label: <span className="text-red-500">Critical</span>,
                        children: (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {servers.filter(s => s.status === 'Offline' && (s.name.toLowerCase().includes(searchText.toLowerCase()) || s.ip.includes(searchText))).map(server => (
                                    <GlassPanel key={server.key} className="p-5 hover:border-white/20 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                                    <GlobalOutlined />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-200">{server.name}</h4>
                                                    <p className="text-xs text-gray-500 font-mono">{server.ip}</p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                                        </div>
                                        <div className="space-y-4 mb-4">
                                            <MetricBar label="CPU Usage" value={server.cpu} color={server.cpu > 80 ? 'bg-red-500' : server.cpu > 60 ? 'bg-amber-500' : 'bg-sky-500'} />
                                            <MetricBar label="Memory" value={server.ram} color={server.ram > 80 ? 'bg-red-500' : server.ram > 60 ? 'bg-purple-500' : 'bg-blue-500'} />
                                            <MetricBar label="Disk Space" value={server.disk} color="bg-gray-500" />
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-white/5">
                                            <span className="flex items-center gap-1"><HeartOutlined /> {server.heartbeat}</span>
                                            <span>{server.region}</span>
                                        </div>
                                    </GlassPanel>
                                ))}
                            </div>
                        )
                    }
                ]}
            />

            {/* Modal */}
            <Modal
                title={<span className="text-white">Provision New Node</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                className="custom-modal"
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleAdd}>
                    <Form.Item name="name" label={<span className="text-gray-400">Node Name</span>} rules={[{ required: true }]}>
                        <Input className="bg-[#111] border-gray-700 text-white" placeholder="e.g. Worker-01" />
                    </Form.Item>
                    <Form.Item name="ip" label={<span className="text-gray-400">IP Address</span>} rules={[{ required: true }]}>
                        <Input className="bg-[#111] border-gray-700 text-white" />
                    </Form.Item>
                    <Form.Item name="region" label={<span className="text-gray-400">Region</span>} rules={[{ required: true }]}>
                        <Select
                            className="bg-[#111]"
                            dropdownStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            options={[
                                { value: 'us-east-1', label: 'US East' },
                                { value: 'eu-west-1', label: 'EU West' },
                                { value: 'ap-south-1', label: 'Asia Pacific' },
                            ]}
                        />
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className="bg-sky-600">Provision</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ServerList;

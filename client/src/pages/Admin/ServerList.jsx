import React, { useState } from 'react';
import { Table, Tag, Button, Space, Input, Modal, Form, Select, message } from 'antd';
import { SearchOutlined, ReloadOutlined, PoweroffOutlined, EditOutlined, PlusOutlined, DatabaseOutlined } from '@ant-design/icons';

const GlassPanel = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-xl ${className}`}>
        {children}
    </div>
);

const initialData = [
    { key: '1', name: 'AWS-Prod-01', ip: '192.168.1.10', status: 'Online', region: 'us-east-1', load: 45 },
    { key: '2', name: 'AWS-Prod-02', ip: '192.168.1.11', status: 'Warning', region: 'us-east-1', load: 88 },
    { key: '3', name: 'DB-Cluster-Main', ip: '10.0.0.55', status: 'Online', region: 'eu-west-2', load: 23 },
    { key: '4', name: 'Cache-Redis-01', ip: '10.0.0.60', status: 'Offline', region: 'ap-south-1', load: 0 },
    { key: '5', name: 'Worker-Edge-05', ip: '172.16.5.21', status: 'Online', region: 'us-west-1', load: 12 },
];

const ServerList = () => {
    const [servers, setServers] = useState(initialData);
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            message.success('Server list refreshed');
        }, 1000);
    };

    const handleAdd = (values) => {
        const newServer = {
            key: Date.now().toString(),
            name: values.name,
            ip: values.ip,
            region: values.region,
            status: 'Online',
            load: Math.floor(Math.random() * 30) + 10,
        };
        setServers([...servers, newServer]);
        setIsModalOpen(false);
        form.resetFields();
        message.success('Server added successfully');
    };

    const columns = [
        {
            title: 'Server Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div className="flex items-center gap-2">
                    <DatabaseOutlined className="text-gray-500" />
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
            title: 'Region',
            dataIndex: 'region',
            key: 'region',
            render: (text) => <span className="text-gray-400">{text}</span>,
        },
        {
            title: 'Load',
            dataIndex: 'load',
            key: 'load',
            render: (load) => (
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-800">
                    <div
                        className={`h-full transition-all duration-500 ${load > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}
                        style={{ width: `${load}%` }}
                    />
                </div>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        className="text-gray-500 hover:text-sky-400 transition-colors"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<PoweroffOutlined />}
                        className="opacity-60 hover:opacity-100"
                        onClick={() => {
                            message.info(`Restarting ${record.name}...`);
                        }}
                    />
                </Space>
            ),
        },
    ];

    const filteredServers = servers.filter(
        (s) =>
            s.name.toLowerCase().includes(searchText.toLowerCase()) ||
            s.ip.includes(searchText)
    );

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                        <span className="text-sky-500">|</span> Server Management
                    </h2>
                    <p className="text-sm text-gray-500">Monitor and configure your infrastructure</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Input
                        placeholder="Search servers..."
                        prefix={<SearchOutlined className="text-gray-600" />}
                        className="w-64 border-white/10 bg-[#0a0a0a] text-gray-200 placeholder:text-gray-600 hover:border-white/20 focus:border-sky-500/50"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button
                        icon={<ReloadOutlined spin={loading} />}
                        onClick={handleRefresh}
                        className="border-white/10 bg-[#0a0a0a] text-gray-300 hover:border-sky-500/50 hover:text-sky-400"
                    >
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        className="border-none bg-gradient-to-r from-sky-600 to-blue-600 font-semibold shadow-[0_0_15px_rgba(2,132,199,0.4)] hover:shadow-[0_0_20px_rgba(2,132,199,0.6)]"
                    >
                        Add Server
                    </Button>
                </div>
            </div>

            {/* Table */}
            <GlassPanel>
                <Table
                    columns={columns}
                    dataSource={filteredServers}
                    pagination={{ pageSize: 8, position: ['bottomCenter'] }}
                    className="custom-table"
                    loading={loading}
                />
            </GlassPanel>

            {/* Add Server Modal */}
            <Modal
                title={<span className="text-white">Add New Server</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                className="custom-modal"
                styles={{ content: { backgroundColor: '#111', border: '1px solid #333' }, header: { backgroundColor: '#111', borderBottom: '1px solid #333' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleAdd} className="mt-4">
                    <Form.Item name="name" label={<span className="text-gray-400">Server Name</span>} rules={[{ required: true }]}>
                        <Input className="bg-[#222] border-gray-700 text-white placeholder:text-gray-600" placeholder="e.g. Web-Worker-01" />
                    </Form.Item>
                    <Form.Item name="ip" label={<span className="text-gray-400">IP Address</span>} rules={[{ required: true }]}>
                        <Input className="bg-[#222] border-gray-700 text-white placeholder:text-gray-600" placeholder="e.g. 192.168.1.50" />
                    </Form.Item>
                    <Form.Item name="region" label={<span className="text-gray-400">Region</span>} rules={[{ required: true }]}>
                        <Select
                            className="bg-[#222] text-white"
                            dropdownStyle={{ backgroundColor: '#222', border: '1px solid #333' }}
                            placeholder="Select Region"
                            options={[
                                { value: 'us-east-1', label: 'US East (N. Virginia)' },
                                { value: 'eu-west-1', label: 'EU West (Ireland)' },
                                { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
                            ]}
                        />
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setIsModalOpen(false)} className="bg-transparent border-gray-700 text-gray-400 hover:text-white">Cancel</Button>
                        <Button type="primary" htmlType="submit" className="bg-sky-600">Add Server</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ServerList;

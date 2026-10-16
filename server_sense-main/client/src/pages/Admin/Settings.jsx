import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Button, Avatar, Select, Tabs, Slider, message as antMessage, Spin, Table, Switch, Modal, Form, InputNumber, Popconfirm, Space, Tag } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    SaveOutlined,
    CloudUploadOutlined,
    SettingOutlined,
    InfoCircleOutlined,
    UndoOutlined,
    CheckCircleOutlined,
    CodeOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS } from '../../config/constants';
import AutomationRules from './AutomationRules';

const SettingSection = ({ title, description, children }) => (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-lg mb-6">
        <div className="border-b border-white/5 pb-3 mb-5">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        {children}
    </div>
);

const Settings = () => {
    const [messageApi, contextHolder] = antMessage.useMessage();
    const [loading, setLoading] = useState(false);
    const [fetchingThresholds, setFetchingThresholds] = useState(true);

    // Real Threshold State matching MongoDB thresholdModel.js
    const [thresholds, setThresholds] = useState({
        cpuWarning: 70,
        cpuCritical: 90,
        memWarning: 75,
        memCritical: 85,
        diskWarning: 80,
        diskCritical: 95,
        allowedPaths: ["./logs", "./tmp", "scratch", "C:/tmp"],
    });

    // Fetch active thresholds from backend
    useEffect(() => {
        const fetchThresholds = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(API_ENDPOINTS.THRESHOLDS, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setThresholds({
                    cpuWarning: data.cpuWarning ?? 70,
                    cpuCritical: data.cpuCritical ?? 90,
                    memWarning: data.memWarning ?? 75,
                    memCritical: data.memCritical ?? 85,
                    diskWarning: data.diskWarning ?? 80,
                    diskCritical: data.diskCritical ?? 95,
                    allowedPaths: data.allowedPaths ?? ["./logs", "./tmp", "scratch", "C:/tmp"],
                });
            } catch (err) {
                console.error('Error fetching thresholds:', err);
                messageApi.warning('Could not load remote thresholds; using defaults.');
            } finally {
                setFetchingThresholds(false);
            }
        };

        fetchThresholds();
    }, [messageApi]);

    // Save thresholds to backend via PUT /api/thresholds
    const handleSaveThresholds = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.THRESHOLDS, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(thresholds),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${res.status}`);
            }
            const data = await res.json();
            messageApi.success('Alert thresholds persisted successfully. Next telemetry snapshot will enforce these rules.');
        } catch (err) {
            console.error('Error updating thresholds:', err);
            messageApi.error(`Failed to save thresholds: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleResetDefaults = () => {
        setThresholds({
            cpuWarning: 70,
            cpuCritical: 90,
            memWarning: 75,
            memCritical: 85,
            diskWarning: 80,
            diskCritical: 95,
        });
        messageApi.info('Reset to standard recommended thresholds (click Update Policy to save)');
    };

    const ProfileSettings = () => (
        <SettingSection
            title="Profile Information"
            description="Manage administrative identity and display preferences."
        >
            <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer">
                        <Avatar size={100} icon={<UserOutlined />} className="bg-gradient-to-tr from-emerald-500 to-sky-500 border-4 border-[#0a0a0a]" />
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                            <CloudUploadOutlined className="text-white text-2xl" />
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Admin Active
                    </div>
                </div>

                <div className="flex-1 w-full space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Full Name</label>
                            <Input defaultValue="Admin User" className="bg-white/5 border-white/10 text-white hover:border-emerald-500/50 focus:border-emerald-500 transition-colors h-10" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Email Address</label>
                            <Input defaultValue="admin@serversense.com" className="bg-white/5 border-white/10 text-white hover:border-emerald-500/50 focus:border-emerald-500 transition-colors h-10" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Assigned Role</label>
                            <Input
                                defaultValue="Super Admin"
                                disabled
                                prefix={<LockOutlined className="text-gray-600" />}
                                className="bg-white/[0.02] border-white/5 text-gray-500 cursor-not-allowed h-10"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Timezone</label>
                            <Select defaultValue="UTC" className="w-full h-10" options={[{ value: 'UTC', label: 'UTC (Coordinated Universal Time)' }, { value: 'IST', label: 'IST (Indian Standard Time)' }, { value: 'PST', label: 'PST (Pacific Standard Time)' }]} />
                        </div>
                    </div>
                </div>
            </div>
        </SettingSection>
    );

    const ThresholdSettings = () => (
        <SettingSection
            title="Global Alert Thresholds"
            description="Adjust live thresholds stored in MongoDB. The telemetry snapshot scheduler checks every 30s and raises alerts when metrics exceed these values."
        >
            {fetchingThresholds ? (
                <div className="p-8 flex items-center justify-center gap-3">
                    <Spin />
                    <span className="text-sm text-gray-500">Loading thresholds from database...</span>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Status Legend Banner */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl gap-3">
                        <p className="text-sky-400 text-xs flex items-center gap-2">
                            <InfoCircleOutlined className="text-base" />
                            <span>Modifications persist to MongoDB and govern real-time alerting across the entire host instance.</span>
                        </p>
                        <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider font-mono">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Nominal
                            </span>
                            <span className="flex items-center gap-1.5 text-amber-400">
                                <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning
                            </span>
                            <span className="flex items-center gap-1.5 text-red-400">
                                <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* CPU Utilization Sliders */}
                        <div className="space-y-5 rounded-xl border border-white/5 bg-white/[0.02] p-5">
                            <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                                <h4 className="text-gray-200 font-semibold text-sm">Host CPU Utilization</h4>
                                <span className="text-xs font-mono text-gray-400">Current warn: {thresholds.cpuWarning}% | crit: {thresholds.cpuCritical}%</span>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-amber-400 font-medium">CPU Warning Threshold</span>
                                    <span className="text-white font-mono font-bold">{thresholds.cpuWarning}%</span>
                                </div>
                                <Slider
                                    min={10}
                                    max={100}
                                    value={thresholds.cpuWarning}
                                    onChange={(v) => setThresholds(prev => ({ ...prev, cpuWarning: v }))}
                                    trackStyle={{ backgroundColor: '#f59e0b' }}
                                    handleStyle={{ borderColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-red-400 font-medium">CPU Critical Threshold</span>
                                    <span className="text-white font-mono font-bold">{thresholds.cpuCritical}%</span>
                                </div>
                                <Slider
                                    min={10}
                                    max={100}
                                    value={thresholds.cpuCritical}
                                    onChange={(v) => setThresholds(prev => ({ ...prev, cpuCritical: v }))}
                                    trackStyle={{ backgroundColor: '#ef4444' }}
                                    handleStyle={{ borderColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }}
                                />
                            </div>
                        </div>

                        {/* RAM Utilization Sliders */}
                        <div className="space-y-5 rounded-xl border border-white/5 bg-white/[0.02] p-5">
                            <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                                <h4 className="text-gray-200 font-semibold text-sm">System Memory (RAM)</h4>
                                <span className="text-xs font-mono text-gray-400">Current warn: {thresholds.memWarning}% | crit: {thresholds.memCritical}%</span>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-amber-400 font-medium">Memory Warning Threshold</span>
                                    <span className="text-white font-mono font-bold">{thresholds.memWarning}%</span>
                                </div>
                                <Slider
                                    min={10}
                                    max={100}
                                    value={thresholds.memWarning}
                                    onChange={(v) => setThresholds(prev => ({ ...prev, memWarning: v }))}
                                    trackStyle={{ backgroundColor: '#f59e0b' }}
                                    handleStyle={{ borderColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-red-400 font-medium">Memory Critical Threshold</span>
                                    <span className="text-white font-mono font-bold">{thresholds.memCritical}%</span>
                                </div>
                                <Slider
                                    min={10}
                                    max={100}
                                    value={thresholds.memCritical}
                                    onChange={(v) => setThresholds(prev => ({ ...prev, memCritical: v }))}
                                    trackStyle={{ backgroundColor: '#ef4444' }}
                                    handleStyle={{ borderColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }}
                                />
                            </div>
                        </div>

                        {/* Storage / Disk Sliders */}
                        <div className="space-y-5 rounded-xl border border-white/5 bg-white/[0.02] p-5 lg:col-span-2">
                            <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                                <h4 className="text-gray-200 font-semibold text-sm">Primary Storage Partition (Disk)</h4>
                                <span className="text-xs font-mono text-gray-400">Current warn: {thresholds.diskWarning}% | crit: {thresholds.diskCritical}%</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-amber-400 font-medium">Disk Warning Threshold</span>
                                        <span className="text-white font-mono font-bold">{thresholds.diskWarning}%</span>
                                    </div>
                                    <Slider
                                        min={10}
                                        max={100}
                                        value={thresholds.diskWarning}
                                        onChange={(v) => setThresholds(prev => ({ ...prev, diskWarning: v }))}
                                        trackStyle={{ backgroundColor: '#f59e0b' }}
                                        handleStyle={{ borderColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-red-400 font-medium">Disk Critical Threshold</span>
                                        <span className="text-white font-mono font-bold">{thresholds.diskCritical}%</span>
                                    </div>
                                    <Slider
                                        min={10}
                                        max={100}
                                        value={thresholds.diskCritical}
                                        onChange={(v) => setThresholds(prev => ({ ...prev, diskCritical: v }))}
                                        trackStyle={{ backgroundColor: '#ef4444' }}
                                        handleStyle={{ borderColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* AI Safe-Path Allowlist Configuration */}
                        <div className="space-y-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5 lg:col-span-2">
                            <div className="border-b border-cyan-500/10 pb-2 flex justify-between items-center">
                                <div>
                                    <h4 className="text-cyan-300 font-semibold text-sm flex items-center gap-2">
                                        <CodeOutlined /> AI Safe-Path Allowlist (File Actions Safety)
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        AI recommendations for <code className="text-cyan-400">clear_temp_files</code> and <code className="text-purple-400">rotate_logs</code> can ONLY execute against paths inside this allowlist.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-300 block mb-2">
                                    Allowed Directory Paths (Comma separated)
                                </label>
                                <Input
                                    value={Array.isArray(thresholds.allowedPaths) ? thresholds.allowedPaths.join(', ') : thresholds.allowedPaths}
                                    onChange={(e) => {
                                        const paths = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                        setThresholds(prev => ({ ...prev, allowedPaths: paths }));
                                    }}
                                    placeholder="./logs, ./tmp, scratch"
                                    className="bg-gray-950 border-gray-800 text-white font-mono text-sm h-10"
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {Array.isArray(thresholds.allowedPaths) && thresholds.allowedPaths.map((p, idx) => (
                                        <Tag key={idx} color="cyan" className="font-mono text-xs">
                                            {p}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                        <Button
                            icon={<UndoOutlined />}
                            ghost
                            className="text-gray-400 hover:text-white border-white/10"
                            onClick={handleResetDefaults}
                        >
                            Reset Defaults
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSaveThresholds}
                            className="bg-sky-600 hover:bg-sky-500 border-none shadow-[0_0_15px_rgba(2,132,199,0.3)] px-6 h-10 font-semibold tracking-wide"
                        >
                            Update Policy
                        </Button>
                    </div>
                </div>
            )}
        </SettingSection>
    );

    const items = [
        {
            key: '1',
            label: <span className="flex items-center gap-2"><SettingOutlined /> Alert Thresholds</span>,
            children: <ThresholdSettings />
        },
        {
            key: '2',
            label: <span className="flex items-center gap-2"><CodeOutlined /> Automation Rules</span>,
            children: <AutomationRules />
        },
        {
            key: '3',
            label: <span className="flex items-center gap-2"><UserOutlined /> Admin Profile</span>,
            children: <ProfileSettings />
        },
    ];

    return (
        <div className="space-y-6 text-gray-200 max-w-5xl mx-auto pb-10">
            {contextHolder}
            {/* Header */}
            <div className="flex flex-col gap-1 px-1 mb-4">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    System Settings & Thresholds
                </h1>
                <p className="text-sm text-gray-500">
                    Configure alerting policies and management credentials.
                </p>
            </div>

            <Tabs defaultActiveKey="1" items={items} className="custom-tabs" />
        </div>
    );
};

export default Settings;

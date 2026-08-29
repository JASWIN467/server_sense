import React, { useState } from 'react';
import { Row, Col, Switch, Input, Button, Avatar, Divider, Select, Tabs, Slider, Tooltip, Progress, Tag } from 'antd';
import {
    UserOutlined,
    BellOutlined,
    LockOutlined,
    GlobalOutlined,
    SaveOutlined,
    CloudUploadOutlined,
    SettingOutlined,
    LogoutOutlined,
    InfoCircleOutlined,
    SafetyCertificateOutlined,
    UndoOutlined,
    CheckCircleOutlined,
    WarningOutlined
} from '@ant-design/icons';

const Settings = () => {
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    const SettingSection = ({ title, children }) => (
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-2">{title}</h3>
            {children}
        </div>
    );

    const ProfileSettings = () => (
        <SettingSection title="Profile Settings">
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
                        Active Status
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
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Role</label>
                            <Input
                                defaultValue="Super Admin"
                                disabled
                                prefix={<LockOutlined className="text-gray-600" />}
                                className="bg-white/[0.02] border-white/5 text-gray-500 cursor-not-allowed h-10"
                            />
                            <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1.5 opacity-70">
                                <LockOutlined className="text-[10px]" /> Role is system-assigned and cannot be modified
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Last Login</label>
                            <Input
                                defaultValue="Today, 09:42 AM"
                                readOnly
                                className="bg-white/5 border-white/10 text-gray-400 cursor-default h-10"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Timezone</label>
                            <Select defaultValue="UTC" className="w-full h-10" options={[{ value: 'UTC', label: 'UTC (Coordinated Universal Time)' }, { value: 'PST', label: 'PST (Pacific Standard Time)' }]} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSave}
                            className="bg-emerald-600 hover:bg-emerald-500 h-11 px-8 border-none hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 font-medium tracking-wide"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </SettingSection>
    );



    const SecuritySettings = () => (
        <SettingSection title="Security & Authentication">
            <div className="space-y-8">
                {/* Password Section */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium flex items-center gap-2">
                            <LockOutlined className="text-red-500" /> Password Management
                        </h4>
                        <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">Last Changed: 14 days ago</span>
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Current Password</label>
                        <Input.Password className="bg-white/5 border-white/10 text-white focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-shadow h-10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">New Password</label>
                            <Input.Password className="bg-white/5 border-white/10 text-white focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-shadow h-10" />

                            {/* Strength Indicator */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-amber-500"></div>
                                </div>
                                <span className="text-xs text-amber-500 font-medium">Medium</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                            <Input.Password className="bg-white/5 border-white/10 text-white focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-shadow h-10" />
                        </div>
                    </div>

                    {/* Validation Hints */}
                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                        <p className="text-xs text-red-300 font-medium mb-2">Password Requirements:</p>
                        <ul className="text-[11px] text-gray-400 space-y-1 list-disc list-inside">
                            <li className="flex items-center gap-2"><CheckCircleOutlined className="text-emerald-500" /> Minimum 8 characters</li>
                            <li className="flex items-center gap-2"><CheckCircleOutlined className="text-gray-600" /> At least 1 number</li>
                            <li className="flex items-center gap-2"><CheckCircleOutlined className="text-gray-600" /> At least 1 special character</li>
                        </ul>
                    </div>

                    <div className="flex justify-end">
                        <Button type="primary" danger ghost icon={<SafetyCertificateOutlined />} className="h-10 px-6">
                            Update Password
                        </Button>
                    </div>
                </div>

                <Divider className="border-white/10" />

                {/* 2FA Section */}
                <div className="flex justify-between items-start p-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-red-400 font-medium text-lg">Two-Factor Authentication</p>
                            <Tooltip title="Simulated feature for frontend demonstration">
                                <InfoCircleOutlined className="text-gray-500 cursor-help" />
                            </Tooltip>
                        </div>
                        <p className="text-gray-500 text-xs max-w-md leading-relaxed">
                            Add an extra layer of security to your account by requiring a code from your mobile device.
                        </p>
                    </div>
                    <Button type="primary" danger className="shadow-[0_0_15px_rgba(239,68,68,0.3)] border-none">
                        Enable 2FA
                    </Button>
                </div>
            </div>
        </SettingSection>
    );

    const ThresholdSettings = () => (
        <SettingSection title="Global Alert Thresholds">
            <div className="space-y-8">
                <div className="flex items-center justify-between bg-sky-500/10 border border-sky-500/20 p-3 rounded-lg">
                    <p className="text-sky-400 text-xs flex items-center gap-2">
                        <InfoCircleOutlined /> Threshold changes affect alert generation across all servers immediately.
                    </p>
                    <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Safe</span>
                        <span className="flex items-center gap-1 text-amber-400"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Warning</span>
                        <span className="flex items-center gap-1 text-red-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                    {/* CPU Thresholds */}
                    <div className="space-y-6">
                        <h4 className="text-gray-200 font-medium border-b border-white/5 pb-2">CPU Utilization</h4>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-amber-400">Warning Threshold</span>
                                <span className="text-white font-mono">75%</span>
                            </div>
                            <Slider defaultValue={75} trackStyle={{ backgroundColor: '#f59e0b' }} handleStyle={{ borderColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-red-400">Critical Threshold</span>
                                <span className="text-white font-mono">90%</span>
                            </div>
                            <Slider defaultValue={90} trackStyle={{ backgroundColor: '#ef4444' }} handleStyle={{ borderColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                        </div>
                    </div>

                    {/* RAM Thresholds */}
                    <div className="space-y-6">
                        <h4 className="text-gray-200 font-medium border-b border-white/5 pb-2">Memory Usage</h4>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-amber-400">Warning Threshold</span>
                                <span className="text-white font-mono">80%</span>
                            </div>
                            <Slider defaultValue={80} trackStyle={{ backgroundColor: '#f59e0b' }} handleStyle={{ borderColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-red-400">Critical Threshold</span>
                                <span className="text-white font-mono">95%</span>
                            </div>
                            <Slider defaultValue={95} trackStyle={{ backgroundColor: '#ef4444' }} handleStyle={{ borderColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                        </div>
                    </div>
                </div>

                {/* Disk Threshold (Single) */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">Disk Usage Critical Level</span>
                        <span className="text-white font-mono">85%</span>
                    </div>
                    <Slider defaultValue={85} trackStyle={{ backgroundColor: '#ec4899' }} handleStyle={{ borderColor: '#ec4899', boxShadow: '0 0 10px #ec4899' }} />
                </div>

                <Divider className="border-white/10" />

                <div className="flex justify-end gap-3">
                    <Button icon={<UndoOutlined />} ghost className="text-gray-400 hover:text-white border-white/10">Reset Defaults</Button>
                    <Button type="primary" className="bg-sky-600 hover:bg-sky-500 border-none shadow-[0_0_15px_rgba(2,132,199,0.3)] w-40 h-10 font-semibold tracking-wide">
                        Update Policy
                    </Button>
                </div>
            </div>
        </SettingSection>
    );

    // Ant Design items for Tabs
    const items = [
        { key: '1', label: <span className="flex items-center gap-2"><UserOutlined /> Profile</span>, children: <ProfileSettings /> },
        { key: '2', label: <span className="flex items-center gap-2"><SettingOutlined /> Thresholds</span>, children: <ThresholdSettings /> }
    ];

    return (
        <div className="space-y-6 text-gray-200 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-1 px-1 mb-4">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    Settings
                    <SettingOutlined className="text-gray-600 animate-spin-slow" style={{ animationDuration: '10s' }} />
                </h1>
                <p className="text-sm text-gray-500">Manage your account and preferences.</p>
            </div>

            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};

export default Settings;

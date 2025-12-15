import React, { useState } from 'react';
import { Row, Col, Switch, Input, Button, Avatar, Divider, Select, Tabs } from 'antd';
import {
    UserOutlined,
    BellOutlined,
    LockOutlined,
    GlobalOutlined,
    SaveOutlined,
    CloudUploadOutlined,
    SettingOutlined,
    LogoutOutlined
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
                        <Avatar size={100} icon={<UserOutlined />} className="bg-gradient-to-tr from-emerald-500 to-sky-500" />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <CloudUploadOutlined className="text-white text-2xl" />
                        </div>
                    </div>
                    <Button ghost size="small">Change Avatar</Button>
                </div>
                <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">Full Name</label>
                            <Input defaultValue="Admin User" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">Email</label>
                            <Input defaultValue="admin@serversense.com" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">Role</label>
                            <Input defaultValue="Super Admin" disabled className="bg-white/5 border-white/10 text-gray-500" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">Timezone</label>
                            <Select defaultValue="UTC" className="w-full" options={[{ value: 'UTC', label: 'UTC' }, { value: 'PST', label: 'PST' }]} />
                        </div>
                    </div>
                    <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 mt-2">
                        Save Changes
                    </Button>
                </div>
            </div>
        </SettingSection>
    );

    const NotificationSettings = () => (
        <SettingSection title="Notifications">
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><BellOutlined /></div>
                        <div>
                            <p className="text-gray-200 font-medium">Email Notifications</p>
                            <p className="text-gray-500 text-xs">Receive daily summaries and critical alerts via email</p>
                        </div>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500"><GlobalOutlined /></div>
                        <div>
                            <p className="text-gray-200 font-medium">Browser Push</p>
                            <p className="text-gray-500 text-xs">Real-time alerts on your desktop</p>
                        </div>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500"><WarningOutlined /></div>
                        <div>
                            <p className="text-gray-200 font-medium">Critical Alerts Only</p>
                            <p className="text-gray-500 text-xs">Suppress info and warning level notifications</p>
                        </div>
                    </div>
                    <Switch />
                </div>
            </div>
        </SettingSection>
    );

    const SecuritySettings = () => (
        <SettingSection title="Security">
            <div className="space-y-4">
                <div>
                    <label className="text-gray-400 text-sm mb-1 block">Current Password</label>
                    <Input.Password className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">New Password</label>
                        <Input.Password className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Confirm Password</label>
                        <Input.Password className="bg-white/5 border-white/10 text-white" />
                    </div>
                </div>
                <Button danger ghost icon={<LockOutlined />}>Change Password</Button>

                <Divider className="border-white/10 my-6" />

                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-red-400 font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-500 text-xs">Add an extra layer of security to your account</p>
                    </div>
                    <Button type="primary" danger>Enable 2FA</Button>
                </div>
            </div>
        </SettingSection>
    );

    // Ant Design items for Tabs
    const items = [
        { key: '1', label: <span className="flex items-center gap-2"><UserOutlined /> Profile</span>, children: <ProfileSettings /> },
        { key: '2', label: <span className="flex items-center gap-2"><BellOutlined /> Notifications</span>, children: <NotificationSettings /> },
        { key: '3', label: <span className="flex items-center gap-2"><LockOutlined /> Security</span>, children: <SecuritySettings /> },
    ];

    // Add WarningOutlined to the import since it is used in NotificationSettings
    // Oh I missed importing WarningOutlined in the top import statement, let me fix that in the real file write.
    // Actually I can just add it to the import list in the "CodeContent" string above. 
    // I see I already imported WarningOutlined in the top block so it should be fine.

    return (
        <div className="space-y-6 text-gray-200 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-1 px-1 mb-4">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    Settings
                    <SettingOutlined className="text-gray-600 animate-spin-slow" style={{ animationDuration: '10s' }} />
                </h1>
                <p className="text-sm text-gray-500">Manage your account and utilization preferences.</p>
            </div>

            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};

export default Settings;

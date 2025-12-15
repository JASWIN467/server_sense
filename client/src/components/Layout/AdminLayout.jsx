import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
    DashboardOutlined,
    CloudServerOutlined,
    AlertOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Dashboard</Link>,
        },
        {
            key: '/admin/servers',
            icon: <CloudServerOutlined />,
            label: <Link to="/admin/servers">Servers</Link>,
        },
        {
            key: '/admin/alerts',
            icon: <AlertOutlined />,
            label: <Link to="/admin/alerts">Alerts</Link>,
        },
        {
            key: '/admin/settings',
            icon: <SettingOutlined />,
            label: <Link to="/admin/settings">Settings</Link>,
        },
    ];

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Profile',
                icon: <UserOutlined />,
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                danger: true,
            },
        ]
    };

    return (
        <Layout className="min-h-screen font-sans">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                className="border-r border-gray-800"
                style={{ background: '#050505' }} // Match body bg
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-800">
                    <span className={`text-xl font-bold tracking-tighter text-white transition-opacity duration-300 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        SERVER<span className="text-primary/90 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]">SENSE</span>
                    </span>
                    {collapsed && <span className="text-xl font-bold text-primary">S</span>}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    className="bg-transparent border-r-0 mt-4 px-2"
                    style={{ background: 'transparent' }}
                />
            </Sider>
            <Layout className="bg-background">
                <Header className="bg-background/80 backdrop-blur-md border-b border-gray-800 px-6 flex justify-between items-center h-16 sticky top-0 z-20">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-white hover:text-primary text-lg w-10 h-10"
                    />

                    <div className="flex items-center gap-6">
                        <motion.div whileHover={{ scale: 1.1 }} className="cursor-pointer relative">
                            <BellOutlined className="text-xl text-gray-400 hover:text-white transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full border border-black animate-pulse"></span>
                        </motion.div>

                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors">
                                <Avatar icon={<UserOutlined />} className="bg-primary/20 text-primary border border-primary/40" />
                                <span className="text-sm font-medium text-gray-300 hidden md:inline">Admin User</span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content className="p-6 overflow-y-auto bg-background">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
